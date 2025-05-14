from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import CurrentAffair
from .serializers import CurrentAffairSerializer
from .services import CurrentAffairsService
from .handlers.news_handler import NewsHandler
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class CurrentAffairListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.info(f"GET request received. Headers: {request.headers}")
        logger.info(f"User: {request.user}")
        
        queryset = CurrentAffair.objects.all()
        
        # Filter by date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        
        # Filter by category
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
            
        queryset = queryset.order_by('-date')
        serializer = CurrentAffairSerializer(queryset, many=True)
        print(serializer.data)
        logger.info(f"Returning {len(serializer.data)} current affairs")
        return Response(serializer.data)

    def post(self, request):
        serializer = CurrentAffairSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentAffairDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return CurrentAffair.objects.get(pk=pk)
        except CurrentAffair.DoesNotExist:
            return None

    def get(self, request, pk):
        current_affair = self.get_object(pk)
        if current_affair is None:
            return Response(
                {"error": "Current affair not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = CurrentAffairSerializer(current_affair)
        return Response(serializer.data)

    def put(self, request, pk):
        current_affair = self.get_object(pk)
        if current_affair is None:
            return Response(
                {"error": "Current affair not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = CurrentAffairSerializer(current_affair, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        current_affair = self.get_object(pk)
        if current_affair is None:
            return Response(
                {"error": "Current affair not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        current_affair.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class NewsSummarizationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            news_articles = request.data.get('articles', [])
            if not news_articles:
                return Response(
                    {"error": "No articles provided"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            service = CurrentAffairsService()
            result = service.summarize_news(news_articles)
            
            if result['success']:
                return Response(result['summary'], status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": result['error']}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FetchAndStoreNewsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Get parameters from request
            max_articles = request.data.get('max_articles', 5)
            skip_existing = request.data.get('skip_existing', False)
            
            # Initialize the handler
            handler = NewsHandler()
            
            # Process the articles
            result = handler.fetch_and_store_articles(
                max_articles=max_articles,
                skip_existing=skip_existing
            )
            
            if not result['success']:
                return Response(
                    {"error": result['error']}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
            # Return the result
            return Response({
                "message": f"Successfully processed news articles. {result['articles_saved']} saved, {result['articles_skipped']} skipped.",
                "articles_saved": result['articles_saved'],
                "articles_skipped": result['articles_skipped'],
                "saved_articles": result['saved_articles'],
                "syllabus_connection": result.get('syllabus_connection', '')
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in FetchAndStoreNewsAPIView: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
