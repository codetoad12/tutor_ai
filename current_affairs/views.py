from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import CurrentAffair, CurrentAffairsDigest
from .serializers import CurrentAffairSerializer, CurrentAffairsDigestSerializer
from .services import CurrentAffairsService
from .handlers.news_handler import NewsHandler
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .tasks import fetch_and_summarize_news, process_custom_articles, generate_weekly_digest, cleanup_old_digests, test_news_handler
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
            
            logger.info(f"News summarization result: success={result['success']}")
            if result['success']:
                logger.info(f"Analysis keys: {result['analysis'].keys()}")
                logger.info(f"First article analysis (if any): {result['analysis'].get('article_analyses', [])[0] if result['analysis'].get('article_analyses') else 'No articles'}")
                return Response(result['analysis'], status=status.HTTP_200_OK)
            else:
                logger.error(f"News summarization error: {result.get('error', 'Unknown error')}")
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_daily_summarization(request):
    """
    API endpoint to manually trigger daily news summarization.
    Requires authentication.
    """
    try:
        # Start the task asynchronously
        task = fetch_and_summarize_news.delay()
        
        return Response({
            'status': 'success',
            'message': 'Daily summarization task started',
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        logger.error(f"Error triggering daily summarization: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to start task: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_custom_processing(request):
    """
    API endpoint to trigger summarization of custom articles.
    Expects a JSON payload with 'articles' array.
    """
    try:
        articles = request.data.get('articles', [])
        
        if not articles:
            return Response({
                'status': 'error',
                'message': 'No articles provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate article format
        required_fields = ['title', 'summary']
        for i, article in enumerate(articles):
            if not all(field in article for field in required_fields):
                return Response({
                    'status': 'error',
                    'message': f'Article {i+1} missing required fields: {required_fields}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Start the task asynchronously
        task = process_custom_articles.delay(articles)
        
        return Response({
            'status': 'success',
            'message': f'Custom summarization task started for {len(articles)} articles',
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        logger.error(f"Error triggering custom summarization: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to start task: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def trigger_weekly_digest(request):
    """
    API endpoint to manually trigger weekly digest generation.
    Requires admin permissions.
    """
    try:
        task = generate_weekly_digest.delay()
        
        return Response({
            'status': 'success',
            'message': 'Weekly digest generation task started',
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        logger.error(f"Error triggering weekly digest: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to start task: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def trigger_cleanup(request):
    """
    API endpoint to manually trigger cleanup of old digests.
    Requires admin permissions.
    """
    try:
        days_to_keep = request.data.get('days_to_keep', 30)
        
        if not isinstance(days_to_keep, int) or days_to_keep < 1:
            return Response({
                'status': 'error',
                'message': 'days_to_keep must be a positive integer'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        task = cleanup_old_digests.delay(days_to_keep=days_to_keep)
        
        return Response({
            'status': 'success',
            'message': f'Cleanup task started (keeping {days_to_keep} days)',
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        logger.error(f"Error triggering cleanup: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to start task: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_status(request, task_id):
    """
    API endpoint to check the status of a Celery task.
    """
    try:
        from celery.result import AsyncResult
        
        task_result = AsyncResult(task_id)
        
        response_data = {
            'task_id': task_id,
            'status': task_result.status,
            'ready': task_result.ready(),
        }
        
        if task_result.ready():
            if task_result.successful():
                response_data['result'] = task_result.result
            else:
                response_data['error'] = str(task_result.result)
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error checking task status: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to check task status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def celery_health_check(request):
    """
    API endpoint to check if Celery workers are running.
    """
    try:
        from celery import current_app
        
        # Check if any workers are active
        inspect = current_app.control.inspect()
        active_workers = inspect.active()
        stats = inspect.stats()
        
        if not active_workers:
            return Response({
                'status': 'unhealthy',
                'message': 'No active Celery workers found',
                'workers': {}
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        return Response({
            'status': 'healthy',
            'message': f'{len(active_workers)} worker(s) active',
            'workers': active_workers,
            'stats': stats
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error checking Celery health: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to check Celery health: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
