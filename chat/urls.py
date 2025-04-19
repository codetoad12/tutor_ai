from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Chat Session URLs
    path('sessions/', views.ChatSessionListCreateView.as_view(), name='session-list-create'),
    path('sessions/<int:pk>/', views.ChatSessionDetailView.as_view(), name='session-detail'),
    path('sessions/<int:pk>/search/', views.ChatSessionSearchView.as_view(), name='session-search'),
    
    # Message URLs
    path('sessions/<int:session_id>/messages/', views.MessageListCreateView.as_view(), name='message-list-create'),
    path('messages/<int:pk>/', views.MessageDetailView.as_view(), name='message-detail'),
    path('messages/<int:pk>/feedback/', views.MessageFeedbackView.as_view(), name='message-feedback'),
    
    # Message Response URLs
    path('messages/<int:message_id>/response/', views.MessageResponseListView.as_view(), name='message-response'),
    path('health/', views.health_check, name='health_check'),
] 