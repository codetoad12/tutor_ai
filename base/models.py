from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone
from .fields import ChoicesField
from .choices import APIType

import uuid

class BaseModel(models.Model):
    """
    Base model with common fields for all models
    """ 
    uuid = models.UUIDField(
        default=uuid.uuid4, 
        editable=False, 
        unique=True,
        help_text='Unique identifier for this record'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_created"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_updated"
    )

    class Meta:
        abstract = True


class TokenUsage(models.Model):
    """Model to track API token usage and costs"""
    
    # Request information
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    endpoint = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    
    # API information
    api_type = ChoicesField(APIType, default=APIType.GEMINI)
    
    # Token usage
    input_tokens = models.PositiveIntegerField(default=0)
    output_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0)
    
    # Cost tracking
    input_cost = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    output_cost = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    
    # Performance metrics
    duration = models.FloatField(help_text="Request duration in seconds")
    api_calls = models.PositiveIntegerField(default=1)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'base_token_usage'
        ordering = ['-created_at']

    def __str__(self):
        user_info = f"User {self.user.id}" if self.user else f"Session {self.session_key[:8]}..."
        return f"{user_info} - {self.endpoint} - {self.total_tokens} tokens - ${self.total_cost}"
    
    @property
    def cost_per_token(self):
        """Calculate cost per token"""
        if self.total_tokens > 0:
            return float(self.total_cost) / self.total_tokens
        return 0
    
    @classmethod
    def get_user_usage_summary(cls, user, days=30):
        """Get usage summary for a user over specified days"""
        from django.utils import timezone
        from datetime import timedelta
        
        start_date = timezone.now() - timedelta(days=days)
        usage = cls.objects.filter(
            user=user,
            created_at__gte=start_date
        ).aggregate(
            total_tokens=models.Sum('total_tokens'),
            total_cost=models.Sum('total_cost'),
            total_requests=models.Count('id'),
            avg_duration=models.Avg('duration')
        )
        
        return {
            'total_tokens': usage['total_tokens'] or 0,
            'total_cost': float(usage['total_cost'] or 0),
            'total_requests': usage['total_requests'] or 0,
            'avg_duration': float(usage['avg_duration'] or 0),
            'period_days': days
        }
    
    @classmethod
    def get_daily_usage_stats(cls, days=7):
        """Get daily usage statistics for the last N days"""
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Sum, Count, Avg
        from django.db.models.functions import TruncDate
        
        start_date = timezone.now() - timedelta(days=days)
        
        daily_stats = cls.objects.filter(
            created_at__gte=start_date
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            total_tokens=Sum('total_tokens'),
            total_cost=Sum('total_cost'),
            request_count=Count('id'),
            avg_duration=Avg('duration')
        ).order_by('date')
        
        return list(daily_stats)
    
    @classmethod
    def get_api_usage_breakdown(cls, days=30):
        """Get usage breakdown by API type"""
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Sum, Count, Avg
        
        start_date = timezone.now() - timedelta(days=days)
        
        api_stats = cls.objects.filter(
            created_at__gte=start_date
        ).values('api_type').annotate(
            total_tokens=Sum('total_tokens'),
            total_cost=Sum('total_cost'),
            request_count=Count('id'),
            avg_tokens_per_request=Avg('total_tokens')
        ).order_by('-total_cost')
        
        return list(api_stats)
