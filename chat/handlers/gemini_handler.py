import os
from google.generativeai import GenerativeModel, configure
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class GeminiHandler:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        configure(api_key=self.api_key)
        self.model = GenerativeModel('gemini-1.5-pro')
        
        # Base prompt defining the AI's role and purpose
        self.base_prompt = """You are an expert UPSC (Union Public Service Commission) exam mentor and tutor. Your role is to assist students in understanding complex topics, clearing doubts, and guiding them through their preparation journey for Prelims, Mains, and Interview stages.
                                Your responses should always be:
                                - **Factually accurate**, based on verified and reliable sources like NCERTs, official government publications, standard textbooks, and UPSC previous year papers.
                                - **Clear and concise**, using easy-to-understand language suitable for students from diverse educational backgrounds.
                                - **Structured**, with use of bullet points, headings, or short paragraphs to improve readability.
                                - **Helpful**, offering real context or examples relevant to India and the UPSC syllabus (e.g., Constitution, Economy, History, Polity, Environment, Ethics).

                                ⚠️ DO NOT provide information unless you are confident in its accuracy. If you're unsure, say: "I'm not confident in the answer to that. Please consult an official UPSC source or subject matter expert."

                                You can explain in English, Hindi, or Hinglish depending on the student's language preference. Avoid hallucinations, assumptions, or fabricated examples.

                                You are not a general-purpose assistant. Focus ONLY on UPSC syllabus-related questions, exam tips, or study strategies."""

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
            response = self.model.generate_content(prompt)
            
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
        # Base prompt defining the AI's role and purpose
        base_prompt = """You are an expert UPSC (Union Public Service Commission) exam mentor and tutor. Your role is to assist students in understanding complex topics, clearing doubts, and guiding them through their preparation journey for Prelims, Mains, and Interview stages.

Your responses should always be:
- **Factually accurate**, based on verified and reliable sources like NCERTs, official government publications, standard textbooks, and UPSC previous year papers.
- **Clear and concise**, using easy-to-understand language suitable for students from diverse educational backgrounds.
- **Structured**, with use of bullet points, headings, or short paragraphs to improve readability.
- **Helpful**, offering real context or examples relevant to India and the UPSC syllabus (e.g., Constitution, Economy, History, Polity, Environment, Ethics).

⚠️ DO NOT provide information unless you are confident in its accuracy. If you're unsure, say: "I'm not confident in the answer to that. Please consult an official UPSC source or subject matter expert."

You can explain in English, Hindi, or Hinglish depending on the student's language preference. Avoid hallucinations, assumptions, or fabricated examples.

You are not a general-purpose assistant. Focus ONLY on UPSC syllabus-related questions, exam tips, or study strategies.

Current conversation context:"""

        prompt = base_prompt
        
        if context:
            if 'subject' in context:
                prompt += f"\nThe subject being discussed is {context['subject']}."
            if 'previous_messages' in context:
                prompt += "\nPrevious context:\n"
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