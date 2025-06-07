import boto3
import json
import logging
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

def get_secret(secret_name, region_name="us-east-1"):
    """
    Retrieve a secret from AWS Secrets Manager.
    
    Args:
        secret_name (str): The name or ARN of the secret
        region_name (str): AWS region where the secret is stored
        
    Returns:
        dict: The secret value as a dictionary, or None if retrieval fails
    """
    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
        
        # Parse the secret string
        secret = get_secret_value_response['SecretString']
        return json.loads(secret)
        
    except ClientError as e:
        logger.error(f"Error retrieving secret {secret_name}: {str(e)}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing secret {secret_name}: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error retrieving secret {secret_name}: {str(e)}")
        return None

def get_database_config(secret_name=None, region_name="us-east-1"):
    """
    Get database configuration from AWS Secrets Manager.
    
    Args:
        secret_name (str): Name of the secret containing database config
        region_name (str): AWS region
        
    Returns:
        dict: Database configuration dictionary
    """
    if not secret_name:
        secret_name = "tutor-ai/database"
    
    secret = get_secret(secret_name, region_name)
    
    if secret:
        return {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': secret.get('dbname', 'tutor_ai_prod'),
            'USER': secret.get('username', 'postgres'),
            'PASSWORD': secret.get('password', ''),
            'HOST': secret.get('host', 'localhost'),
            'PORT': secret.get('port', '5432'),
            'OPTIONS': {
                'sslmode': 'require',
            },
        }
    else:
        # Fallback to environment variables if Secrets Manager fails
        import os
        logger.warning("Failed to retrieve database config from Secrets Manager, falling back to environment variables")
        return {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'tutor_ai_prod'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'OPTIONS': {
                'sslmode': 'require',
            },
        }

def get_api_keys(secret_name=None, region_name="us-east-1"):
    """
    Get API keys from AWS Secrets Manager.
    
    Args:
        secret_name (str): Name of the secret containing API keys
        region_name (str): AWS region
        
    Returns:
        dict: API keys dictionary
    """
    if not secret_name:
        secret_name = "tutor-ai/api-keys"
    
    secret = get_secret(secret_name, region_name)
    
    if secret:
        return secret
    else:
        # Fallback to environment variables
        import os
        logger.warning("Failed to retrieve API keys from Secrets Manager, falling back to environment variables")
        return {
            'GEMINI_API_KEY': os.getenv('GEMINI_API_KEY', ''),
            'GOOGLE_API_KEY': os.getenv('GOOGLE_API_KEY', ''),
        } 