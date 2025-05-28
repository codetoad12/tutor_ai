"""
Local development settings for TUTOR_AI project.
This file contains settings specific to local development environment.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Database - SQLite for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Static files for development
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# CORS settings for local development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Vite dev server
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # Django dev server
    "http://127.0.0.1:8000",
]

CORS_ALLOW_CREDENTIALS = True

# Additional CORS settings for development
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_EXPOSE_HEADERS = [
    'content-type',
    'x-content-type-options',
]

# Celery Configuration for local development
# Use Redis if available, otherwise fall back to memory broker
REDIS_URL = os.getenv('REDIS_URL', None)

if REDIS_URL:
    # Redis configuration (if Redis is available locally)
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL
    
    # Redis Configuration for Caching
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': REDIS_URL,
        }
    }
    
    # Session Configuration using Redis
    SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
    SESSION_CACHE_ALIAS = 'default'
else:
    # Memory broker for development (simplest option, no persistence)
    CELERY_BROKER_URL = 'memory://'
    CELERY_RESULT_BACKEND = 'django-db'
    # For development, we'll run tasks synchronously when no Redis is available
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True
    
    # Use database cache when Redis is not available
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
            'LOCATION': 'cache_table',
        }
    }

# Development-specific logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'celery': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Email backend for development (console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Development-specific REST Framework settings
REST_FRAMEWORK.update({
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/day',  # More lenient for development
        'user': '10000/day'
    }
})

# JWT settings for development (longer token lifetime)
SIMPLE_JWT.update({
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),  # Longer for development convenience
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}) 