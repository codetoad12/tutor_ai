from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ChatSession, Message, MessageResponse
from .serializers import (
    ChatSessionSerializer, ChatSessionCreateSerializer,
    MessageSerializer, MessageCreateSerializer,
    MessageResponseSerializer, MessageResponseCreateSerializer
)
from .handlers import GeminiHandler
from base.handlers import ContextHandler
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

# Initialize handlers
gemini_handler = GeminiHandler()
context_handler = ContextHandler()

# Chat Session Views
class ChatSessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user).order_by('-updated_at')
        serializer = ChatSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ChatSessionCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChatSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(ChatSession, pk=pk, user=self.request.user)

    def get(self, request, pk):
        session = self.get_object(pk)
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data)

    def put(self, request, pk):
        session = self.get_object(pk)
        serializer = ChatSessionSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        session = self.get_object(pk)
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ChatSessionSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(ChatSession, pk=pk, user=self.request.user)

    def get(self, request, pk):
        session = self.get_object(pk)
        query = request.query_params.get('q', '')
        
        messages = Message.objects.filter(
            Q(session=session) &
            (Q(content__icontains=query) |
             Q(response__response_text__icontains=query))
        ).order_by('-created_at')
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

# Message Views
class MessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        messages = Message.objects.filter(
            session_id=session_id,
            session__user=request.user
        ).order_by('-created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, session_id):
        # Verify session belongs to user
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        
        serializer = MessageCreateSerializer(
            data=request.data,
            context={'session_id': session_id}
        )
        if serializer.is_valid():
            message = serializer.save()
            
            try:
                # Get context for the conversation using the base handler
                context = context_handler.get_conversation_context(
                    session=session,
                    message_model=Message,
                    response_model=MessageResponse
                )
                
                # Generate response using Gemini
                ai_response = gemini_handler.generate_response(
                    message=message.content,
                    context=context
                )
                
                # Create response object
                response_serializer = MessageResponseCreateSerializer(
                    data={
                        'response_text': ai_response['text'],
                        'metadata': ai_response.get('metadata', {}),
                        'status': ai_response.get('status', 'success')
                    },
                    context={'message_id': message.id}
                )
                
                if response_serializer.is_valid():
                    response_serializer.save()
                    return Response({
                        'message': MessageSerializer(message).data,
                        'response': response_serializer.data
                    }, status=status.HTTP_201_CREATED)
                else:
                    logger.error(f"Response serializer errors: {response_serializer.errors}")
                    return Response(
                        response_serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
            except Exception as e:
                logger.error(f"Error generating AI response: {str(e)}")
                return Response(
                    {'error': 'Failed to generate AI response'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Message, pk=pk, session__user=self.request.user)

    def get(self, request, pk):
        message = self.get_object(pk)
        serializer = MessageSerializer(message)
        return Response(serializer.data)

    def delete(self, request, pk):
        message = self.get_object(pk)
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MessageFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Message, pk=pk, session__user=self.request.user)

    def post(self, request, pk):
        message = self.get_object(pk)
        response = message.response
        
        if not response:
            return Response(
                {'error': 'No response found for this message'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        feedback = request.data.get('feedback')
        feedback_text = request.data.get('feedback_text')
        
        if feedback:
            response.user_feedback = feedback
            response.feedback_text = feedback_text
            response.save()
            
            return Response(MessageResponseSerializer(response).data)
        
        return Response(
            {'error': 'Feedback is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

# Message Response Views
class MessageResponseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, message_id):
        response = get_object_or_404(
            MessageResponse,
            message_id=message_id,
            message__session__user=request.user
        )
        serializer = MessageResponseSerializer(response)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    A simple health check endpoint to verify the API is running.
    """
    return Response({
        'status': 'ok',
        'message': 'API is running',
        'version': '1.0.0'
    })
