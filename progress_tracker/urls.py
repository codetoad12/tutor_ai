from django.urls import path
from . import views

urlpatterns = [
    # Goal endpoints
    path('goals/', views.GoalListCreateView.as_view(), name='goal-list-create'),
    path('goals/<int:pk>/', views.GoalDetailView.as_view(), name='goal-detail'),
    path('goals/<int:pk>/toggle-completion/', views.GoalToggleCompletionView.as_view(), name='goal-toggle-completion'),
    
    # Attachment endpoints
    path('attachments/', views.GoalAttachmentListCreateView.as_view(), name='attachment-list-create'),
    path('attachments/<int:pk>/', views.GoalAttachmentDetailView.as_view(), name='attachment-detail'),
] 