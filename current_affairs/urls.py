from django.urls import path
from .views import (
    CurrentAffairListAPIView,
    CurrentAffairDetailAPIView,
    NewsSummarizationAPIView,
    FetchAndStoreNewsAPIView
)

urlpatterns = [
    path('current-affairs/', CurrentAffairListAPIView.as_view(), name='current-affairs-list'),
    path('current-affairs/<int:pk>/', CurrentAffairDetailAPIView.as_view(), name='current-affairs-detail'),
    path('summarize-news/', NewsSummarizationAPIView.as_view(), name='summarize-news'),
    path('fetch-store-news/', FetchAndStoreNewsAPIView.as_view(), name='fetch-store-news'),
] 