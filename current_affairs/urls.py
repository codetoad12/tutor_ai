from django.urls import path
from .views import (
    CurrentAffairListAPIView,
    CurrentAffairDetailAPIView,
    NewsSummarizationAPIView,
    FetchAndStoreNewsAPIView,
    trigger_daily_summarization,
    trigger_custom_processing,
    trigger_weekly_digest,
    trigger_cleanup,
    task_status,
    celery_health_check
)

urlpatterns = [
    path('current-affairs/', CurrentAffairListAPIView.as_view(), name='current-affairs-list'),
    path('current-affairs/<int:pk>/', CurrentAffairDetailAPIView.as_view(), name='current-affairs-detail'),
    path('summarize-news/', NewsSummarizationAPIView.as_view(), name='summarize-news'),
    path('fetch-store-news/', FetchAndStoreNewsAPIView.as_view(), name='fetch-store-news'),
    
    # Celery task endpoints
    path('tasks/daily-summarization/', trigger_daily_summarization, name='trigger-daily-summarization'),
    path('tasks/custom-processing/', trigger_custom_processing, name='trigger-custom-processing'),
    path('tasks/weekly-digest/', trigger_weekly_digest, name='trigger-weekly-digest'),
    path('tasks/cleanup/', trigger_cleanup, name='trigger-cleanup'),
    path('tasks/status/<str:task_id>/', task_status, name='task-status'),
    path('tasks/health/', celery_health_check, name='celery-health-check'),
] 