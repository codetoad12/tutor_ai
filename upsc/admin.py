from django.contrib import admin
from .models import Subject, Topic, StudyMaterial, Question

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at', 'updated_at')
    list_filter = ('category',)
    search_fields = ('name', 'description')

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'created_at', 'updated_at')
    list_filter = ('subject', 'subject__category')
    search_fields = ('name', 'description', 'subject__name')

@admin.register(StudyMaterial)
class StudyMaterialAdmin(admin.ModelAdmin):
    list_display = ('title', 'topic', 'created_by', 'created_at')
    list_filter = ('topic__subject', 'topic', 'created_by')
    search_fields = ('title', 'content', 'topic__name')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'topic', 'difficulty_level', 'question_type', 'created_by')
    list_filter = ('difficulty_level', 'question_type', 'topic__subject', 'topic', 'created_by')
    search_fields = ('question_text', 'answer', 'topic__name')
