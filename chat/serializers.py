from rest_framework import serializers
from .models import ChatSession, Message, MessageResponse
from .choices import ExamType, SubjectType, MessageType, ResponseType, UserFeedback

class MessageResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageResponse
        fields = [
            'id', 'response_text', 'response_type', 'model_name', 'model_version',
            'tokens_used', 'processing_time', 'confidence_score', 'relevance_score',
            'accuracy_score', 'has_code', 'has_tables', 'has_images', 'has_links',
            'sources_used', 'reference_subjects', 'reference_topics', 'user_feedback',
            'feedback_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'model_name', 'model_version', 'tokens_used', 'processing_time',
            'confidence_score', 'relevance_score', 'accuracy_score', 'created_at',
            'updated_at'
        ]

class MessageSerializer(serializers.ModelSerializer):
    response = MessageResponseSerializer(source='ai_response', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'session', 'content', 'message_type',
            'response', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'session', 'created_at', 'updated_at']

class ChatSessionSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'user', 'title', 'exam_type', 'subject_type', 'status',
            'messages', 'last_message', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return MessageSerializer(last_message).data
        return None

class ChatSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ['title', 'exam_type', 'subject_type']
    
    def create(self, validated_data):
        return super().create(validated_data)

class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content', 'message_type']
    
    def create(self, validated_data):
        session_id = self.context['session_id']
        validated_data['session_id'] = session_id
        validated_data['message_type'] = validated_data.get('message_type', 'user_query')
        return super().create(validated_data)

class MessageResponseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageResponse
        fields = [
            'response_text', 'response_type', 'model_name', 'model_version',
            'tokens_used', 'processing_time', 'confidence_score', 'relevance_score',
            'accuracy_score', 'has_code', 'has_tables', 'has_images', 'has_links',
            'sources_used', 'reference_subjects', 'reference_topics'
        ]
    
    def create(self, validated_data):
        message_id = self.context['message_id']
        validated_data['message_id'] = message_id
        return super().create(validated_data) 