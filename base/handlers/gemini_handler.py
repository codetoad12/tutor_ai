import google.generativeai as genai
from typing import Dict, Optional
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class GeminiHandler:
    def __init__(self):
        """Initialize the Gemini handler with API key and model configuration."""
        self.api_key = settings.GEMINI_API_KEY
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-pro')
    
    def generate_response(
        self, 
        prompt: str, 
        max_tokens: int = 1000,
        temperature: float = 0.7,
        top_p: float = 0.8,
        top_k: int = 40
    ) -> Dict:
        """
        Generate a response from Gemini.
        
        Args:
            prompt (str): The input prompt
            max_tokens (int): Maximum tokens for the response
            temperature (float): Controls randomness (0.0 to 1.0)
            top_p (float): Nucleus sampling parameter
            top_k (int): Top-k sampling parameter
            
        Returns:
            Dict: Response from the model with success status
        """
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k
                )
            )
            
            return {
                'success': True,
                'response': response.text
            }
            
        except Exception as e:
            logger.error(f"Error in Gemini response generation: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            } 