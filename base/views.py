from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
from .models import TokenUsage
from .utils.token_counter import TokenUsageCalculator
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class TokenUsageStatsAPIView(APIView):
    """
    API view to get token usage statistics for the authenticated user.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get token usage statistics for the current user"""
        try:
            days = int(request.query_params.get('days', 30))
            
            # Get user usage summary
            summary = TokenUsage.get_user_usage_summary(request.user, days=days)
            
            # Get daily breakdown
            daily_stats = TokenUsage.get_daily_usage_stats(days=min(days, 30))
            
            # Get API breakdown
            api_breakdown = TokenUsage.get_api_usage_breakdown(days=days)
            
            return Response({
                'summary': summary,
                'daily_stats': daily_stats,
                'api_breakdown': api_breakdown
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting token usage stats: {str(e)}")
            return Response({
                'error': 'Failed to retrieve usage statistics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminTokenUsageStatsAPIView(APIView):
    """
    API view for admin users to get system-wide token usage statistics.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get system-wide token usage statistics"""
        try:
            days = int(request.query_params.get('days', 30))
            start_date = timezone.now() - timedelta(days=days)
            
            # Overall system stats
            overall_stats = TokenUsage.objects.filter(
                created_at__gte=start_date
            ).aggregate(
                total_tokens=Sum('total_tokens'),
                total_cost=Sum('total_cost'),
                total_requests=Count('id'),
                avg_duration=Avg('duration'),
                unique_users=Count('user', distinct=True)
            )
            
            # Top users by usage
            top_users = TokenUsage.objects.filter(
                created_at__gte=start_date,
                user__isnull=False
            ).values(
                'user__username', 'user__id'
            ).annotate(
                total_tokens=Sum('total_tokens'),
                total_cost=Sum('total_cost'),
                request_count=Count('id')
            ).order_by('-total_tokens')[:10]
            
            # Top endpoints by usage
            top_endpoints = TokenUsage.objects.filter(
                created_at__gte=start_date
            ).values('endpoint').annotate(
                total_tokens=Sum('total_tokens'),
                total_cost=Sum('total_cost'),
                request_count=Count('id'),
                avg_duration=Avg('duration')
            ).order_by('-total_tokens')[:10]
            
            # Daily system stats
            daily_stats = TokenUsage.get_daily_usage_stats(days=min(days, 30))
            
            # API breakdown
            api_breakdown = TokenUsage.get_api_usage_breakdown(days=days)
            
            return Response({
                'overall_stats': {
                    'total_tokens': overall_stats['total_tokens'] or 0,
                    'total_cost': float(overall_stats['total_cost'] or 0),
                    'total_requests': overall_stats['total_requests'] or 0,
                    'avg_duration': float(overall_stats['avg_duration'] or 0),
                    'unique_users': overall_stats['unique_users'] or 0,
                    'period_days': days
                },
                'top_users': list(top_users),
                'top_endpoints': list(top_endpoints),
                'daily_stats': daily_stats,
                'api_breakdown': api_breakdown
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting admin token usage stats: {str(e)}")
            return Response({
                'error': 'Failed to retrieve admin statistics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def estimate_token_cost(request):
    """
    API endpoint to estimate token cost for given text.
    """
    try:
        text = request.data.get('text', '')
        api_type = request.data.get('api_type', 'gemini')
        model = request.data.get('model', None)
        
        if not text:
            return Response({
                'error': 'Text is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Estimate cost using middleware pricing
        from .middleware.token_counter import TokenCounterMiddleware
        middleware = TokenCounterMiddleware()
        usage = {
            'input_tokens': len(text.split()),
            'output_tokens': len(text.split()) // 2,
            'api_type': api_type
        }
        costs = middleware._calculate_costs(usage)
        estimated_cost = costs['total_cost']
        
        return Response({
            'estimated_input_tokens': len(text.split()),
            'estimated_output_tokens': len(text.split()) // 2,
            'estimated_total_tokens': len(text.split()) + len(text.split()) // 2,
            'estimated_cost': estimated_cost,
            'api_type': api_type,
            'note': 'This is a rough estimate. Actual usage may vary.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error estimating token cost: {str(e)}")
        return Response({
            'error': 'Failed to estimate cost'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_usage_summary(request):
    """
    API endpoint to get a quick summary of user's token usage.
    """
    try:
        # Get usage for different time periods
        daily_usage = TokenUsage.get_user_usage_summary(request.user, days=1)
        weekly_usage = TokenUsage.get_user_usage_summary(request.user, days=7)
        monthly_usage = TokenUsage.get_user_usage_summary(request.user, days=30)
        
        # Get recent activity
        recent_usage = TokenUsage.objects.filter(
            user=request.user
        ).order_by('-created_at')[:5].values(
            'created_at', 'endpoint', 'total_tokens', 'total_cost', 'api_type'
        )
        
        return Response({
            'daily_usage': daily_usage,
            'weekly_usage': weekly_usage,
            'monthly_usage': monthly_usage,
            'recent_activity': list(recent_usage)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting user usage summary: {str(e)}")
        return Response({
            'error': 'Failed to retrieve usage summary'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
