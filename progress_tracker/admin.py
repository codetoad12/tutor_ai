from django.contrib import admin
from .models import Goal, GoalAttachment

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'deadline', 'is_completed', 'created_at')
    list_filter = ('is_completed', 'deadline', 'user')
    search_fields = ('title', 'description', 'user__username')
    date_hierarchy = 'deadline'

@admin.register(GoalAttachment)
class GoalAttachmentAdmin(admin.ModelAdmin):
    list_display = ('goal', 'file_type', 'created_at')
    list_filter = ('file_type', 'created_at', 'goal__user')
    search_fields = ('goal__title', 'goal__user__username', 'ai_summary')
    date_hierarchy = 'created_at'
