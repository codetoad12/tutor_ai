"""
Token counting utilities for different AI models.
Uses official tokenizers for accurate token counting.
"""

import logging
from typing import Dict, Any, Optional, Union, List
from django.conf import settings

logger = logging.getLogger(__name__)


class TokenCounter:
    """
    Utility class for counting tokens using official tokenizers.
    """
    
    @staticmethod
    def count_gemini_tokens(text: str, model: str = "gemini-pro") -> int:
        """
        Count tokens for Gemini models using google.generativeai.count_tokens()
        
        Args:
            text: The text to count tokens for
            model: The Gemini model name (default: gemini-pro)
            
        Returns:
            Number of tokens
        """
        try:
            import google.generativeai as genai
            
            # Configure if not already done
            if not hasattr(genai, '_client') or genai._client is None:
                api_key = getattr(settings, 'GOOGLE_API_KEY', None)
                if api_key:
                    genai.configure(api_key=api_key)
                else:
                    logger.warning("GOOGLE_API_KEY not found in settings")
                    return len(text.split())  # Fallback to word count
            
            # Count tokens using official method
            response = genai.count_tokens(
                model=model,
                contents=text
            )
            
            return response.total_tokens
            
        except ImportError:
            logger.warning("google.generativeai not installed. Install with: pip install google-generativeai")
            return len(text.split())  # Fallback to word count
        except Exception as e:
            logger.error(f"Error counting Gemini tokens: {str(e)}")
            return len(text.split())  # Fallback to word count
    
    @staticmethod
    def count_openai_tokens(text: str, model: str = "gpt-4") -> int:
        """
        Count tokens for OpenAI models using tiktoken
        
        Args:
            text: The text to count tokens for
            model: The OpenAI model name (default: gpt-4)
            
        Returns:
            Number of tokens
        """
        try:
            import tiktoken
            
            # Get encoding for the model
            try:
                encoding = tiktoken.encoding_for_model(model)
            except KeyError:
                # Fallback to cl100k_base for unknown models
                encoding = tiktoken.get_encoding("cl100k_base")
                logger.warning(f"Unknown model {model}, using cl100k_base encoding")
            
            # Count tokens
            tokens = encoding.encode(text)
            return len(tokens)
            
        except ImportError:
            logger.warning("tiktoken not installed. Install with: pip install tiktoken")
            return len(text.split())  # Fallback to word count
        except Exception as e:
            logger.error(f"Error counting OpenAI tokens: {str(e)}")
            return len(text.split())  # Fallback to word count
    
    @staticmethod
    def count_tokens(text: str, api_type: str = "gemini", model: str = None) -> int:
        """
        Count tokens for any supported API type
        
        Args:
            text: The text to count tokens for
            api_type: The API type ('gemini', 'openai', etc.)
            model: The specific model name (optional)
            
        Returns:
            Number of tokens
        """
        if api_type.lower() == "gemini":
            model = model or "gemini-pro"
            return TokenCounter.count_gemini_tokens(text, model)
        elif api_type.lower() == "openai":
            model = model or "gpt-4"
            return TokenCounter.count_openai_tokens(text, model)
        else:
            logger.warning(f"Unsupported API type: {api_type}. Using word count fallback.")
            return len(text.split())


def count_tokens_gemini(text: str, model: str = "gemini-pro") -> int:
    """
    Convenience function for counting Gemini tokens
    """
    return TokenCounter.count_gemini_tokens(text, model)


def count_tokens_openai(text: str, model: str = "gpt-4") -> int:
    """
    Convenience function for counting OpenAI tokens
    """
    return TokenCounter.count_openai_tokens(text, model)


class TokenUsageCalculator:
    """
    Helper class for calculating token usage in API calls
    """
    
    @staticmethod
    def calculate_usage(
        prompt: str,
        response: str,
        api_type: str = "gemini",
        model: str = None
    ) -> Dict[str, int]:
        """
        Calculate input and output token usage for an API call
        
        Args:
            prompt: The input prompt/text
            response: The API response text
            api_type: The API type ('gemini', 'openai', etc.)
            model: The specific model name (optional)
            
        Returns:
            Dictionary with 'input_tokens', 'output_tokens', 'total_tokens'
        """
        input_tokens = TokenCounter.count_tokens(prompt, api_type, model)
        output_tokens = TokenCounter.count_tokens(response, api_type, model)
        
        return {
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'total_tokens': input_tokens + output_tokens
        }
    
    @staticmethod
    def track_api_call(
        request,
        prompt: str,
        response: str,
        api_type: str = "gemini",
        model: str = None
    ):
        """
        Calculate token usage and track it in the middleware
        
        Args:
            request: Django request object
            prompt: The input prompt/text
            response: The API response text
            api_type: The API type ('gemini', 'openai', etc.)
            model: The specific model name (optional)
        """
        usage = TokenUsageCalculator.calculate_usage(prompt, response, api_type, model)
        
        # Track usage in middleware if available
        if hasattr(request, 'add_token_usage'):
            request.add_token_usage(
                input_tokens=usage['input_tokens'],
                output_tokens=usage['output_tokens'],
                api_type=api_type
            )
        else:
            logger.warning("TokenCounterMiddleware not active - cannot track usage")
        
        return usage


# Example usage functions for different scenarios
def track_gemini_usage(request, prompt: str, response: str, model: str = "gemini-pro"):
    """Track usage for a Gemini API call"""
    return TokenUsageCalculator.track_api_call(request, prompt, response, "gemini", model)


def track_openai_usage(request, prompt: str, response: str, model: str = "gpt-4"):
    """Track usage for an OpenAI API call"""
    return TokenUsageCalculator.track_api_call(request, prompt, response, "openai", model) 