from django.db import models
from django.utils import timezone
from base.models import BaseModel
from base.fields import ChoicesField
from base.choices import CurrentAffairCategory

# Create your models here.

class CurrentAffair(BaseModel):
    date = models.DateField()
    category = ChoicesField(CurrentAffairCategory)
    title = models.CharField(max_length=255)
    summary = models.TextField()
    source = models.CharField(max_length=100, blank=True, null=True)
    ai_insight = models.TextField(blank=True, null=True, help_text="UPSC-style fact or mains-style question")
    tags = models.JSONField(default=list, blank=True)
    key_concepts = models.TextField(null=True, blank=True)
    usage_hint = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.date} - {self.title}"

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Current Affair'
        verbose_name_plural = 'Current Affairs'
