from django.db import models
from base.models import BaseModel

# Create your models here.

class CurrentAffair(BaseModel):
    date = models.DateField()
    category = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    summary = models.TextField()
    key_concepts = models.TextField(null=True, blank=True)
    usage_hint = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.date} - {self.title}"

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Current Affair'
        verbose_name_plural = 'Current Affairs'
