from django.db import models
from base.fields import ChoicesField
from .choices import ExamType, Category, SourceEvent

# Create your models here.

class HistoricQuestion(models.Model):
    year = models.IntegerField()
    exam_type = ChoicesField(enum_class=ExamType)
    question_text = models.TextField()
    category = ChoicesField(enum_class=Category)
    is_current_affairs = models.BooleanField(default=False)
    source_event = ChoicesField(enum_class=SourceEvent, blank=True, null=True)

    def __str__(self):
        return f"{self.year} - {self.question_text[:50]}..."

    class Meta:
        ordering = ['-year']
        indexes = [
            models.Index(fields=['year']),
            models.Index(fields=['exam_type']),
            models.Index(fields=['category']),
        ]

class NewsItem(models.Model):
    title = models.CharField(max_length=200)
    summary = models.TextField()
    category = ChoicesField(enum_class=Category)
    published_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-published_date']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['published_date']),
        ]

class PredictionScore(models.Model):
    news_item = models.ForeignKey(NewsItem, on_delete=models.CASCADE, related_name='prediction_scores')
    score = models.FloatField()
    reasoning = models.TextField()

    def __str__(self):
        return f"{self.news_item.title} - Score: {self.score}"

    def save(self, *args, **kwargs):
        # Ensure score is between 0 and 100
        self.score = max(0, min(100, self.score))
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-score']
        indexes = [
            models.Index(fields=['score']),
        ]
