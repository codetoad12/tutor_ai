from django.db import models
from django.conf import settings
import uuid

from base.models import BaseModel
from base.fields import ChoicesField
from progress_tracker.choices import FileType

class Goal(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weekly_goals')
    title = models.CharField(max_length=200)
    description = models.TextField()
    deadline = models.DateField()
    is_completed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-deadline']
        verbose_name = 'Goal'
        verbose_name_plural = 'Goals'

    def __str__(self):
        return f"{self.user.username}'s goal: {self.title}"

class GoalAttachment(BaseModel):
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='goal_attachments/')
    ai_summary = models.TextField(null=True, blank=True)
    file_type = ChoicesField(FileType, default=FileType.DEFAULT)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Goal Attachment'
        verbose_name_plural = 'Goal Attachments'

    def __str__(self):
        return f"Attachment for {self.goal.title}"
