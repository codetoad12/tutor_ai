from django.db import models
from base.models import BaseModel
from base.fields import ChoicesField
from .choices import (
    MessageType, SessionStatus, QueryCategory, ExamType, SubjectType,
    ResponseType, UserFeedback
)
from django.conf import settings
from upsc.models import Subject, Topic

class ChatSession(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_sessions'
    )
    title = models.CharField(max_length=255, blank=True)
    status = ChoicesField(SessionStatus, default=SessionStatus.ACTIVE)
    
    # Exam and subject categorization
    exam_type = ChoicesField(ExamType, default=ExamType.UPSC_CSE)
    subject_type = ChoicesField(SubjectType, default=SubjectType.GENERAL)
    
    # Optional specific subject and topic references
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True)
    
    last_interaction = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-last_interaction']
        indexes = [
            models.Index(fields=['user', '-last_interaction']),
            models.Index(fields=['status', '-last_interaction']),
            models.Index(fields=['exam_type', '-last_interaction']),
            models.Index(fields=['subject_type', '-last_interaction']),
        ]

    def __str__(self):
        return f"Session {self.id} - {self.user.username} - {self.exam_type.value}"

class Message(BaseModel):
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    message_type = ChoicesField(MessageType, default=MessageType.USER_QUERY)
    content = models.TextField()
    query_category = ChoicesField(QueryCategory, default=QueryCategory.GENERAL)
    
    # For tracking token usage and AI model details
    tokens_used = models.IntegerField(default=0)
    model_version = models.CharField(max_length=50, blank=True)
    
    # For context and reference
    reference_subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    reference_topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True)
    
    # For message threading
    parent_message = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='follow_ups'
    )
    
    # Metadata for AI responses
    confidence_score = models.FloatField(null=True, blank=True)
    sources_used = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'created_at']),
            models.Index(fields=['message_type', 'created_at']),
        ]

    def __str__(self):
        return f"{self.message_type.value} - {self.content[:50]}..."

class MessageResponse(BaseModel):
    """
    Detailed tracking of AI responses to user queries
    """
    message = models.OneToOneField(
        Message,
        on_delete=models.CASCADE,
        related_name='ai_response'
    )
    
    # Response content
    response_text = models.TextField()
    response_type = ChoicesField(ResponseType, default=ResponseType.TEXT)
    
    # AI model details
    model_name = models.CharField(max_length=100, default='gpt-4')
    model_version = models.CharField(max_length=50, blank=True)
    tokens_used = models.IntegerField(default=0)
    processing_time = models.FloatField(null=True, blank=True)  # in seconds
    
    # Response quality metrics
    confidence_score = models.FloatField(null=True, blank=True)
    relevance_score = models.FloatField(null=True, blank=True)
    accuracy_score = models.FloatField(null=True, blank=True)
    
    # Response structure
    has_code = models.BooleanField(default=False)
    has_tables = models.BooleanField(default=False)
    has_images = models.BooleanField(default=False)
    has_links = models.BooleanField(default=False)
    
    # References and sources
    sources_used = models.JSONField(null=True, blank=True)
    reference_subjects = models.ManyToManyField(Subject, blank=True)
    reference_topics = models.ManyToManyField(Topic, blank=True)
    
    # Feedback
    user_feedback = ChoicesField(UserFeedback, default=UserFeedback.NO_FEEDBACK)
    feedback_notes = models.TextField(blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['model_name', 'created_at']),
            models.Index(fields=['confidence_score']),
        ]
        
    def __str__(self):
        return f"Response to: {self.message.content[:50]}..."
