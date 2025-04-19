from django.contrib import admin
from .models import ChatSession, Message, MessageResponse

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'exam_type', 'subject_type', 'status', 'subject', 'topic', 'last_interaction', 'created_at')
    list_filter = ('exam_type', 'subject_type', 'status', 'subject', 'topic', 'created_at')
    search_fields = ('title', 'user__username', 'user__email')
    raw_id_fields = ('user', 'subject', 'topic')
    date_hierarchy = 'created_at'

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'message_type', 'query_category', 'tokens_used', 'created_at')
    list_filter = ('message_type', 'query_category', 'created_at')
    search_fields = ('content', 'session__user__username')
    raw_id_fields = ('session', 'reference_subject', 'reference_topic', 'parent_message')
    readonly_fields = ('tokens_used', 'confidence_score')
    date_hierarchy = 'created_at'

@admin.register(MessageResponse)
class MessageResponseAdmin(admin.ModelAdmin):
    list_display = ('id', 'message', 'response_type', 'model_name', 'confidence_score', 'tokens_used', 'user_feedback', 'created_at')
    list_filter = ('response_type', 'model_name', 'has_code', 'has_tables', 'has_images', 'user_feedback', 'created_at')
    search_fields = ('response_text', 'message__content')
    raw_id_fields = ('message', 'reference_subjects', 'reference_topics')
    readonly_fields = ('tokens_used', 'processing_time', 'confidence_score', 'relevance_score', 'accuracy_score')
    date_hierarchy = 'created_at'
