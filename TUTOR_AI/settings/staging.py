"""
Staging settings for TUTOR_AI project.
This file contains settings specific to staging environment.
Inherits from production settings but with some relaxed configurations for testing.
"""

from .production import *

# Staging-specific overrides
DEBUG = os.getenv('DEBUG', 'False') == 'True'  # Allow debug to be enabled in staging if needed

# Staging hosts
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'staging.tutoriai.com').split(',')

# Staging Database - can use PostgreSQL or SQLite
DATABASE_ENGINE = os.getenv('DATABASE_ENGINE', 'postgresql')

if DATABASE_ENGINE == 'sqlite':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db_staging.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'tutor_ai_staging'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

# Relaxed security settings for staging
SECURE_SSL_REDIRECT = False  # Allow HTTP in staging
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# CORS settings for staging
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://staging.tutoriai.com",
    "http://staging.tutoriai.com",
]

# More lenient throttling for staging testing
REST_FRAMEWORK.update({
    'DEFAULT_THROTTLE_RATES': {
        'anon': '500/day',  # More lenient for testing
        'user': '5000/day'
    }
})

# JWT settings for staging (longer tokens for easier testing)
SIMPLE_JWT.update({
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=2),  # Longer for testing convenience
    'REFRESH_TOKEN_LIFETIME': timedelta(days=3),
})

# Email backend for staging (can use console or SMTP)
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')

# Staging logging (more verbose)
LOGGING['handlers']['console']['level'] = 'INFO'  # More verbose console logging
LOGGING['loggers']['django']['level'] = 'DEBUG' if DEBUG else 'INFO'

# Cache configuration - allow fallback to database cache
REDIS_URL = os.getenv('REDIS_URL', None)
if not REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
            'LOCATION': 'cache_table_staging',
        }
    }
    
    # Use database sessions if no Redis
    SESSION_ENGINE = 'django.contrib.sessions.backends.db'
    
    # Celery fallback for staging
    CELERY_BROKER_URL = 'memory://'
    CELERY_RESULT_BACKEND = 'django-db'
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True 