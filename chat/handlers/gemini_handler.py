import os
from google.generativeai import GenerativeModel, configure
from typing import Dict, List, Optional
import logging
import time
from google.api_core.exceptions import ResourceExhausted, TooManyRequests

logger = logging.getLogger(__name__)

class GeminiHandler:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        configure(api_key=self.api_key)
        
        # Initialize models in order of preference
        self.models = {
            "flash": {
                "name": "gemini-1.5-flash", 
                "model": None,
                "priority": 1
            },
            "pro": {
                "name": "gemini-1.5-pro",
                "model": None,
                "priority": 2
            }
        }
        
        # Try to initialize all models but continue if some fail
        for model_key in self.models:
            try:
                model_info = self.models[model_key]
                model_info["model"] = GenerativeModel(model_info["name"])
                logger.info(f"Successfully initialized model: {model_info['name']}")
            except Exception as e:
                logger.warning(f"Could not initialize model {model_info['name']}: {str(e)}")
                
        # Make sure at least one model is available
        available_models = [m for m in self.models.values() if m["model"] is not None]
        if not available_models:
            raise ValueError("No Gemini models could be initialized")
            
        # Set current model to the one with highest priority (lowest number)
        available_models.sort(key=lambda x: x["priority"])
        self.current_model_key = next((k for k, v in self.models.items() if v["name"] == available_models[0]["name"]), "flash")
        logger.info(f"Using {self.models[self.current_model_key]['name']} as the initial model")
        
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

    def generate_response(self, message, context=None, retry_count=0):
        """
        Generate a response using Gemini models with fallback mechanisms.
        
        Args:
            message (str): The user's message
            context (dict, optional): Additional context for the conversation
            retry_count (int): Number of retries attempted
            
        Returns:
            dict: Response containing the generated text and metadata
        """
        # Maximum retry attempts
        max_retries = 3
        
        if retry_count >= max_retries:
            return {
                "text": "I apologize, but I'm currently experiencing high demand. Please try again in a few minutes.",
                "error": "Maximum retries exceeded",
                "status": "error"
            }
        
        # Get current model
        current_model_info = self.models[self.current_model_key]
        current_model = current_model_info["model"]
        model_name = current_model_info["name"]
        
        if current_model is None:
            logger.error(f"Current model {model_name} is not initialized")
            # Try to find any available model
            for model_key, model_info in self.models.items():
                if model_info["model"] is not None:
                    self.current_model_key = model_key
                    return self.generate_response(message, context, retry_count)
            
            # No models available
            return {
                "text": "I apologize, but our AI service is currently unavailable. Please try again later.",
                "error": "No models available",
                "status": "error"
            }
        
        try:
            # Prepare the prompt with context if available
            prompt = self._prepare_prompt(message, context)
            
            # Generate response
            response = current_model.generate_content(prompt)
            
            # Process and format the response
            formatted_response = self._format_response(response, model_name)
            
            return formatted_response
            
        except (ResourceExhausted, TooManyRequests) as e:
            logger.warning(f"Rate limit exceeded for model {model_name}: {str(e)}")
            
            # Try a different model if available
            alternative_model_key = self._get_alternative_model()
            if alternative_model_key and alternative_model_key != self.current_model_key:
                logger.info(f"Switching to alternative model: {self.models[alternative_model_key]['name']}")
                self.current_model_key = alternative_model_key
                # Small delay before retrying
                time.sleep(1)
                return self.generate_response(message, context, retry_count + 1)
            
            # If no alternative model or already tried all, wait and retry
            wait_time = min(2 ** retry_count, 10)  # Exponential backoff up to 10 seconds
            logger.info(f"No alternative model available, waiting {wait_time}s before retry")
            time.sleep(wait_time)
            return self.generate_response(message, context, retry_count + 1)
            
        except Exception as e:
            logger.error(f"Error generating response with {model_name}: {str(e)}")
            
            # Try fallback messaging if this is the first error
            if retry_count == 0:
                fallback_message = f"""I apologize, but I encountered a technical issue while processing your request.
                
                Error details: {str(e)}
                
                If this is a quota or rate limit issue, you may need to:
                1. Wait a few minutes before trying again
                2. Check your API key quota limits
                3. Consider upgrading to a paid tier if you're using the free version
                
                Please contact the system administrator with the error details if the problem persists."""

                return {
                    "text": fallback_message,
                    "error": str(e),
                    "status": "error"
                }
            else:
                return {
                    "text": "I apologize, but I encountered an error processing your request. Please try again later.",
                    "error": str(e),
                    "status": "error"
                }

    def _get_alternative_model(self):
        """
        Get an alternative model if the current one hits rate limits.
        
        Returns:
            str: Key of alternative model, or None if no alternative is available
        """
        # Sort by priority and get model keys
        sorted_models = sorted(
            [(k, v) for k, v in self.models.items() if v["model"] is not None], 
            key=lambda x: x[1]["priority"]
        )
        model_keys = [k for k, _ in sorted_models]
        
        # Find current model index
        if self.current_model_key in model_keys:
            current_index = model_keys.index(self.current_model_key)
            # Try the next model
            if current_index + 1 < len(model_keys):
                return model_keys[current_index + 1]
        
        # If current model not found or no alternative, return first model
        return model_keys[0] if model_keys else None

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

    def _format_response(self, response, model_name):
        """
        Format the Gemini response into a structured format.
        
        Args:
            response: Raw response from Gemini
            model_name: Name of the model used
            
        Returns:
            dict: Formatted response
        """
        try:
            return {
                "text": response.text,
                "status": "success",
                "metadata": {
                    "model": model_name,
                    "timestamp": response.timestamp if hasattr(response, 'timestamp') else None
                }
            }
        except Exception as e:
            logger.error(f"Error formatting response: {str(e)}")
            return {
                "text": str(response),
                "status": "success",
                "metadata": {"model": model_name}
            }

    def reset_chat(self):
        """Reset the chat history."""
        current_model = self.models[self.current_model_key]["model"]
        try:
            if current_model:
                chat = current_model.start_chat(history=[])
                logger.info("Chat history reset successfully")
                return True
            else:
                logger.error("Cannot reset chat: current model is not initialized")
                return False
        except Exception as e:
            logger.error(f"Error resetting chat: {str(e)}")
            return False 