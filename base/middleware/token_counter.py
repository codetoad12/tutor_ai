import time
import logging
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.db import transaction
from typing import Optional, Dict, Any
import json

logger = logging.getLogger(__name__)

class TokenCounterMiddleware(MiddlewareMixin):
    """
    Middleware to track API token usage, costs, and performance metrics.
    
    This middleware:
    - Receives token counts from services that use proper tokenizers
    - Calculates costs based on API pricing
    - Monitors response times
    - Logs usage patterns
    - Provides usage analytics
    
    Note: Token counting should be done in the services using:
    - google.generativeai.count_tokens() for Gemini
    - tiktoken for OpenAI models
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.get_response = get_response
        
        # API pricing (tokens per dollar) - update these based on current pricing
        self.api_pricing = {
            'gemini': {
                'input_tokens_per_dollar': 1000000,  # Gemini Pro pricing
                'output_tokens_per_dollar': 1000000,
                'name': 'Google Gemini'
            },
            'openai': {
                'input_tokens_per_dollar': 500000,   # GPT-4 pricing example
                'output_tokens_per_dollar': 250000,
                'name': 'OpenAI GPT'
            }
        }
    
    def process_request(self, request):
        """Initialize token tracking for the request"""
        request.token_usage = {
            'start_time': time.time(),
            'input_tokens': 0,
            'output_tokens': 0,
            'api_calls': 0,
            'api_type': None,
            'endpoint': request.path,
            'method': request.method,
            'user_id': getattr(request.user, 'id', None) if hasattr(request, 'user') and not isinstance(request.user, AnonymousUser) else None,
            'session_key': getattr(request.session, 'session_key', None) if hasattr(request, 'session') else None,
        }
        
        # Add token tracking methods to request
        request.add_token_usage = lambda input_tokens=0, output_tokens=0, api_type='gemini': self._add_token_usage(
            request, input_tokens, output_tokens, api_type
        )
        
        return None
    
    def process_response(self, request, response):
        """Process and log token usage after response"""
        if not hasattr(request, 'token_usage'):
            return response
        
        # Calculate total time
        request.token_usage['duration'] = time.time() - request.token_usage['start_time']
        
        # Calculate costs
        costs = self._calculate_costs(request.token_usage)
        request.token_usage.update(costs)
        
        # Log usage if there was any API activity
        if request.token_usage['api_calls'] > 0:
            self._log_usage(request.token_usage)
            
            # Store in database if enabled
            if getattr(settings, 'STORE_TOKEN_USAGE', True):
                self._store_usage(request.token_usage)
        
        # Add usage info to response headers (for debugging)
        if getattr(settings, 'DEBUG', False):
            response['X-Token-Usage'] = json.dumps({
                'input_tokens': request.token_usage['input_tokens'],
                'output_tokens': request.token_usage['output_tokens'],
                'total_cost': request.token_usage.get('total_cost', 0),
                'api_calls': request.token_usage['api_calls']
            })
            print(response['X-Token-Usage'])
        return response
    
    def _add_token_usage(self, request, input_tokens: int, output_tokens: int, api_type: str):
        """Add token usage to the current request"""
        if not hasattr(request, 'token_usage'):
            return
        
        request.token_usage['input_tokens'] += input_tokens
        request.token_usage['output_tokens'] += output_tokens
        request.token_usage['api_calls'] += 1
        request.token_usage['api_type'] = api_type
        
        logger.debug(f"Added token usage: {input_tokens} input, {output_tokens} output tokens ({api_type})")
    
    def _calculate_costs(self, usage: Dict[str, Any]) -> Dict[str, float]:
        """Calculate costs based on token usage"""
        api_type = usage.get('api_type', 'gemini')
        pricing = self.api_pricing.get(api_type, self.api_pricing['gemini'])
        
        input_cost = usage['input_tokens'] / pricing['input_tokens_per_dollar']
        output_cost = usage['output_tokens'] / pricing['output_tokens_per_dollar']
        total_cost = input_cost + output_cost
        
        return {
            'input_cost': round(input_cost, 6),
            'output_cost': round(output_cost, 6),
            'total_cost': round(total_cost, 6),
            'api_name': pricing['name']
        }
    
    def _log_usage(self, usage: Dict[str, Any]):
        """Log token usage for monitoring"""
        logger.info(
            f"API Usage - {usage['method']} {usage['endpoint']} | "
            f"User: {usage['user_id']} | "
            f"API: {usage.get('api_name', 'Unknown')} | "
            f"Tokens: {usage['input_tokens']} in, {usage['output_tokens']} out | "
            f"Cost: ${usage.get('total_cost', 0):.6f} | "
            f"Duration: {usage['duration']:.2f}s | "
            f"Calls: {usage['api_calls']}"
        )
    
    def _store_usage(self, usage: Dict[str, Any]):
        """Store usage in database for analytics"""
        try:
            # Import here to avoid circular imports
            from base.models import TokenUsage
            
            with transaction.atomic():
                TokenUsage.objects.create(
                    user_id=usage['user_id'],
                    session_key=usage['session_key'],
                    endpoint=usage['endpoint'],
                    method=usage['method'],
                    api_type=usage.get('api_type', 'gemini'),
                    input_tokens=usage['input_tokens'],
                    output_tokens=usage['output_tokens'],
                    total_tokens=usage['input_tokens'] + usage['output_tokens'],
                    input_cost=usage.get('input_cost', 0),
                    output_cost=usage.get('output_cost', 0),
                    total_cost=usage.get('total_cost', 0),
                    duration=usage['duration'],
                    api_calls=usage['api_calls']
                )
        except Exception as e:
            logger.error(f"Failed to store token usage: {str(e)}")


class TokenUsageTracker:
    """
    Utility class for manually tracking token usage in views and services.
    Use this when you want to track usage outside of the middleware.
    """
    
    @staticmethod
    def track_usage(request, input_tokens: int, output_tokens: int, api_type: str = 'gemini'):
        """Track token usage for a request"""
        if hasattr(request, 'add_token_usage'):
            request.add_token_usage(input_tokens, output_tokens, api_type)
        else:
            logger.warning("TokenCounterMiddleware not active - cannot track usage")
    
    @staticmethod
    def get_current_usage(request) -> Optional[Dict[str, Any]]:
        """Get current token usage for a request"""
        return getattr(request, 'token_usage', None)
    
    @staticmethod
    def estimate_cost(input_tokens: int, output_tokens: int, api_type: str = 'gemini') -> float:
        """Estimate cost for given token usage"""
        middleware = TokenCounterMiddleware()
        usage = {
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'api_type': api_type
        }
        costs = middleware._calculate_costs(usage)
        return costs['total_cost'] 