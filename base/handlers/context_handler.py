from django.db import models
import logging

logger = logging.getLogger(__name__)

class ContextHandler:
    """
    Base handler for managing conversation context across different models.
    This can be extended for specific use cases.
    """
    
    @staticmethod
    def get_conversation_context(session, message_model, response_model=None, limit=5):
        """
        Get context for a conversation including previous messages and session info.
        
        Args:
            session: The session object containing conversation metadata
            message_model: The model class for messages
            response_model: Optional model class for responses
            limit: Number of recent messages to include in context
            
        Returns:
            dict: Context containing session info and recent messages
        """
        try:
            # Get recent messages for context
            recent_messages = message_model.objects.filter(
                session=session
            ).order_by('-created_at')[:limit]
            
            context = {
                'subject': getattr(session, 'subject', None),
                'previous_messages': []
            }
            
            # Add session metadata if available
            if hasattr(session, 'get_metadata'):
                context['session_metadata'] = session.get_metadata()
            
            # Add recent messages to context
            for msg in reversed(recent_messages):  # Reverse to get chronological order
                message_data = {
                    'role': 'user',
                    'content': msg.content
                }
                
                # Add message metadata if available
                if hasattr(msg, 'get_metadata'):
                    message_data['metadata'] = msg.get_metadata()
                
                context['previous_messages'].append(message_data)
                
                # Add response if available
                if response_model:
                    try:
                        response = response_model.objects.get(message=msg)
                        response_data = {
                            'role': 'assistant',
                            'content': response.response_text
                        }
                        
                        # Add response metadata if available
                        if hasattr(response, 'get_metadata'):
                            response_data['metadata'] = response.get_metadata()
                            
                        context['previous_messages'].append(response_data)
                    except response_model.DoesNotExist:
                        pass
            
            return context
            
        except Exception as e:
            logger.error(f"Error getting conversation context: {str(e)}")
            return {
                'subject': getattr(session, 'subject', None),
                'previous_messages': [],
                'error': str(e)
            }
    
    @staticmethod
    def format_message_for_ai(message, role='user'):
        """
        Format a message for AI consumption.
        
        Args:
            message: The message object or string
            role: The role of the message sender ('user' or 'assistant')
            
        Returns:
            dict: Formatted message
        """
        if isinstance(message, str):
            return {
                'role': role,
                'content': message
            }
        
        message_data = {
            'role': role,
            'content': message.content
        }
        
        if hasattr(message, 'get_metadata'):
            message_data['metadata'] = message.get_metadata()
            
        return message_data 