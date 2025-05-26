from rest_framework import serializers
from .models import Goal, GoalAttachment

class GoalAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalAttachment
        fields = ['uuid', 'goal', 'file', 'file_type', 'ai_summary', 'created_at']
        read_only_fields = ['id', 'created_at']

class GoalSerializer(serializers.ModelSerializer):
    attachments = GoalAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Goal
        fields = ['id', 'user', 'title', 'description', 'deadline', 'is_completed', 'created_at', 'attachments']
        read_only_fields = ['id', 'user', 'created_at'] 