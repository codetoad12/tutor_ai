import os

# Determine which settings to use based on environment
ENVIRONMENT = os.getenv('DJANGO_ENVIRONMENT', 'local')

if ENVIRONMENT == 'production':
    from .production import *
elif ENVIRONMENT == 'staging':
    from .staging import *
else:
    from .local import * 