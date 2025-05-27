from django.contrib import admin
from django.db.models import Sum, Avg, Count
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from base.models import TokenUsage


@admin.register(TokenUsage)
class TokenUsageAdmin(admin.ModelAdmin):
    list_display = [
        'created_at', 'user_link', 'endpoint', 'method', 'api_type',
        'total_tokens', 'formatted_cost', 'duration_formatted', 'api_calls'
    ]
    list_filter = [
        'api_type', 'method', 'created_at', 'endpoint'
    ]
    search_fields = [
        'user__username', 'user__email', 'endpoint', 'session_key'
    ]
    readonly_fields = [
        'created_at', 'total_tokens', 'cost_per_token_display'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('user', 'session_key', 'endpoint', 'method', 'created_at')
        }),
        ('API Usage', {
            'fields': ('api_type', 'input_tokens', 'output_tokens', 'total_tokens', 'api_calls')
        }),
        ('Cost Analysis', {
            'fields': ('input_cost', 'output_cost', 'total_cost', 'cost_per_token_display')
        }),
        ('Performance', {
            'fields': ('duration',)
        }),
    )
    
    def user_link(self, obj):
        """Create a link to the user admin page"""
        if obj.user:
            url = reverse('admin:auth_user_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.username)
        return format_html('<em>Anonymous ({})</em>', obj.session_key[:8] if obj.session_key else 'Unknown')
    user_link.short_description = 'User'
    user_link.admin_order_field = 'user__username'
    
    def formatted_cost(self, obj):
        """Format cost with currency symbol"""
        return f"${obj.total_cost:.6f}"
    formatted_cost.short_description = 'Total Cost'
    formatted_cost.admin_order_field = 'total_cost'
    
    def duration_formatted(self, obj):
        """Format duration in a readable way"""
        if obj.duration < 1:
            return f"{obj.duration * 1000:.0f}ms"
        return f"{obj.duration:.2f}s"
    duration_formatted.short_description = 'Duration'
    duration_formatted.admin_order_field = 'duration'
    
    def cost_per_token_display(self, obj):
        """Display cost per token"""
        return f"${obj.cost_per_token:.8f}" if obj.cost_per_token > 0 else "$0.00000000"
    cost_per_token_display.short_description = 'Cost per Token'
    
    def changelist_view(self, request, extra_context=None):
        """Add summary statistics to the changelist view"""
        response = super().changelist_view(request, extra_context=extra_context)
        
        try:
            # Get filtered queryset
            qs = response.context_data['cl'].queryset
            
            # Calculate summary statistics
            summary = qs.aggregate(
                total_tokens=Sum('total_tokens'),
                total_cost=Sum('total_cost'),
                avg_duration=Avg('duration'),
                total_requests=Count('id')
            )
            
            # Add to context
            response.context_data['summary'] = {
                'total_tokens': summary['total_tokens'] or 0,
                'total_cost': float(summary['total_cost'] or 0),
                'avg_duration': float(summary['avg_duration'] or 0),
                'total_requests': summary['total_requests'] or 0,
            }
            
        except (AttributeError, KeyError):
            # Handle cases where context might not be available
            pass
            
        return response
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related('user')
    
    actions = ['export_usage_csv']
    
    def export_usage_csv(self, request, queryset):
        """Export selected usage records to CSV"""
        import csv
        from django.http import HttpResponse
        from django.utils import timezone
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="token_usage_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Date', 'User', 'Endpoint', 'Method', 'API Type',
            'Input Tokens', 'Output Tokens', 'Total Tokens',
            'Input Cost', 'Output Cost', 'Total Cost',
            'Duration (s)', 'API Calls'
        ])
        
        for usage in queryset:
            writer.writerow([
                usage.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                usage.user.username if usage.user else f'Session {usage.session_key[:8]}',
                usage.endpoint,
                usage.method,
                usage.get_api_type_display(),
                usage.input_tokens,
                usage.output_tokens,
                usage.total_tokens,
                float(usage.input_cost),
                float(usage.output_cost),
                float(usage.total_cost),
                usage.duration,
                usage.api_calls
            ])
        
        return response
    
    export_usage_csv.short_description = "Export selected usage to CSV" 