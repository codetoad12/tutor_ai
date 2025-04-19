import google.generativeai as genai
from django.conf import settings
from base.handlers import ContextHandler
import json
import logging

logger = logging.getLogger(__name__)

class GeminiHandler:
    def __init__(self):
        """Initialize the Gemini handler with API key and model configuration."""
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
            self.chat = self.model.start_chat(history=[])
            logger.info("Gemini handler initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini handler: {str(e)}")
            raise

    def generate_response(self, message, context=None):
        """
        Generate a response using Gemini 1.5 Pro.
        
        Args:
            message (str): The user's message
            context (dict, optional): Additional context for the conversation
            
        Returns:
            dict: Response containing the generated text and metadata
        """
        try:
            # Prepare the prompt with context if available
            prompt = self._prepare_prompt(message, context)
            
            # Generate response
            response = self.chat.send_message(prompt)
            
            # Process and format the response
            formatted_response = self._format_response(response)
            
            return formatted_response
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {
                "text": "I apologize, but I encountered an error processing your request. Please try again.",
                "error": str(e),
                "status": "error"
            }

    def _prepare_prompt(self, message, context=None):
        """
        Prepare the prompt with context and message.
        
        Args:
            message (str): The user's message
            context (dict, optional): Additional context
            
        Returns:
            str: Formatted prompt
        """
        prompt = f"You are an AI tutor helping a student with their studies. "
        
        if context:
            if 'subject' in context:
                prompt += f"The subject being discussed is {context['subject']}. "
            if 'previous_messages' in context:
                prompt += "Previous context:\n"
                for msg in context['previous_messages'][-3:]:  # Include last 3 messages for context
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    prompt += f"{role}: {content}\n"
        
        prompt += f"\nStudent: {message}\nTutor:"
        
        return prompt

    def _format_response(self, response):
        """
        Format the Gemini response into a structured format.
        
        Args:
            response: Raw response from Gemini
            
        Returns:
            dict: Formatted response
        """
        try:
            return {
                "text": response.text,
                "status": "success",
                "metadata": {
                    "model": "gemini-1.5-pro",
                    "timestamp": response.timestamp if hasattr(response, 'timestamp') else None
                }
            }
        except Exception as e:
            logger.error(f"Error formatting response: {str(e)}")
            return {
                "text": str(response),
                "status": "success",
                "metadata": {"model": "gemini-1.5-pro"}
            }

    def reset_chat(self):
        """Reset the chat history."""
        try:
            self.chat = self.model.start_chat(history=[])
            logger.info("Chat history reset successfully")
            return True
        except Exception as e:
            logger.error(f"Error resetting chat: {str(e)}")
            return False 