import google.generativeai as genai
from typing import Dict, Optional
import logging
from django.conf import settings
from base.utils.token_counter import TokenUsageCalculator

logger = logging.getLogger(__name__)

class GeminiHandler:
    def __init__(self):
        """Initialize the Gemini handler with API key and model configuration."""
        self.api_key = settings.GEMINI_API_KEY
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def generate_response(
        self, 
        prompt: str, 
        max_tokens: int = 1000,
        temperature: float = 0.7,
        top_p: float = 0.8,
        top_k: int = 40,
        request=None
    ) -> Dict:
        """
        Generate a response from Gemini.
        
        Args:
            prompt (str): The input prompt
            max_tokens (int): Maximum tokens for the response
            temperature (float): Controls randomness (0.0 to 1.0)
            top_p (float): Nucleus sampling parameter
            top_k (int): Top-k sampling parameter
            request: Django request object for token tracking
            
        Returns:
            Dict: Response from the model with success status
        """
        try:
            # Add instructions for structured output
            structured_prompt = f"""
            {prompt}
            
            IMPORTANT: Your response MUST strictly follow the format outlined above.
            Make sure each section is clearly labeled with the exact section titles specified.
            """

            # Add retry logic for more reliability
            max_attempts = 2
            for attempt in range(max_attempts):
                try:
                    response = self.model.generate_content(
                        structured_prompt,
                        generation_config=genai.types.GenerationConfig(
                            max_output_tokens=max_tokens,
                            temperature=temperature,
                            top_p=top_p,
                            top_k=top_k
                        )
                    )
                    
                    # Track token usage if request is provided
                    if request and response.text:
                        try:
                            TokenUsageCalculator.track_api_call(
                                request=request,
                                prompt=structured_prompt,
                                response=response.text,
                                api_type="gemini",
                                model="gemini-1.5-flash"
                            )
                        except Exception as e:
                            logger.warning(f"Failed to track token usage: {str(e)}")
                    
                    return {
                        'success': True,
                        'response': response.text
                    }
                except Exception as e:
                    if attempt < max_attempts - 1:
                        logger.warning(f"Retrying after error: {str(e)}")
                        continue
                    else:
                        raise
            
        except Exception as e:
            logger.error(f"Error in Gemini response generation: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            } 