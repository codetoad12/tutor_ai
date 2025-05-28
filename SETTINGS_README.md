# Django Settings Configuration

This project uses a modular settings structure to handle different environments (local, staging, production). This approach provides better security, maintainability, and flexibility.

## Settings Structure

```
TUTOR_AI/settings/
├── __init__.py          # Environment detection and imports
├── base.py             # Common settings shared across all environments
├── local.py            # Local development settings
├── staging.py          # Staging environment settings
└── production.py       # Production environment settings
```

## Environment Configuration

### 1. Local Development

**Environment Variable:** `DJANGO_ENVIRONMENT=local` (default)

**Features:**
- Debug mode enabled
- SQLite database
- Console email backend
- Relaxed CORS settings
- Optional Redis (falls back to memory/database)
- Longer JWT token lifetime for convenience

**Setup:**
1. Copy `env.local.example` to `.env.local`
2. Update the values in `.env.local`
3. Run: `python manage.py runserver`

### 2. Staging Environment

**Environment Variable:** `DJANGO_ENVIRONMENT=staging`

**Features:**
- Production-like settings with relaxed security
- PostgreSQL or SQLite database
- Optional Redis (falls back to database cache)
- More lenient rate limiting
- Console or SMTP email backend

**Setup:**
1. Copy `env.staging.example` to `.env.staging`
2. Update the values in `.env.staging`
3. Set environment variable: `DJANGO_ENVIRONMENT=staging`
4. Run migrations and collect static files

### 3. Production Environment

**Environment Variable:** `DJANGO_ENVIRONMENT=production`

**Features:**
- Debug mode disabled
- PostgreSQL database (required)
- Redis cache and session storage (required)
- Enhanced security settings (HTTPS, secure cookies, etc.)
- File and console logging
- SMTP email backend
- Strict rate limiting
- Optional Sentry integration

**Setup:**
1. Copy `env.production.example` to `.env.production`
2. Update all values in `.env.production`
3. Set environment variable: `DJANGO_ENVIRONMENT=production`
4. Install production dependencies
5. Run migrations and collect static files

## Environment Variables

### Required for All Environments
- `DJANGO_SECRET_KEY`: Django secret key
- `GOOGLE_API_KEY`: Google API key
- `GEMINI_API_KEY`: Gemini API key

### Production-Specific Required Variables
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: Database configuration
- `REDIS_URL`: Redis connection URL
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

### Optional Variables
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`: Email configuration
- `SENTRY_DSN`: Sentry error tracking DSN

## Usage Examples

### Local Development
```bash
# Default environment (local)
python manage.py runserver

# Or explicitly set
export DJANGO_ENVIRONMENT=local
python manage.py runserver
```

### Staging Deployment
```bash
export DJANGO_ENVIRONMENT=staging
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn TUTOR_AI.wsgi:application
```

### Production Deployment
```bash
export DJANGO_ENVIRONMENT=production
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn TUTOR_AI.wsgi:application --bind 0.0.0.0:8000
```

## Database Setup

### Local Development
SQLite is used by default. No additional setup required.

### Staging/Production
PostgreSQL is recommended. Install and configure:

```bash
# Install PostgreSQL adapter
pip install psycopg2-binary

# Create database
createdb tutor_ai_prod  # or tutor_ai_staging
```

## Redis Setup

### Local Development (Optional)
```bash
# Install Redis
# On Ubuntu: sudo apt-get install redis-server
# On macOS: brew install redis

# Start Redis
redis-server
```

### Production (Required)
Redis is required for production. Set up Redis server and configure `REDIS_URL`.

## Static Files

### Development
Static files are served by Django development server.

### Production
WhiteNoise is configured to serve static files efficiently:

```bash
python manage.py collectstatic --noinput
```

## Logging

### Local Development
Console logging with INFO level.

### Production
- File logging: `logs/django.log`
- Console logging for errors
- Structured logging with timestamps

Create logs directory:
```bash
mkdir logs
```

## Security Considerations

### Production Security Features
- HTTPS enforcement
- Secure cookies
- HSTS headers
- XSS protection
- Content type sniffing protection
- Frame options protection

### Environment-Specific Security
- **Local**: Relaxed for development convenience
- **Staging**: Moderate security for testing
- **Production**: Full security hardening

## Celery Configuration

### Local Development
- Memory broker (no Redis required)
- Synchronous task execution
- Database result backend

### Production
- Redis broker and result backend
- Asynchronous task execution
- Persistent task results

## Troubleshooting

### Common Issues

1. **Settings not loading correctly**
   - Check `DJANGO_ENVIRONMENT` variable
   - Verify environment file exists and is properly formatted

2. **Database connection errors**
   - Verify database credentials in environment file
   - Ensure database server is running
   - Check network connectivity

3. **Redis connection errors**
   - Verify Redis server is running
   - Check `REDIS_URL` format
   - For local development, Redis is optional

4. **Static files not loading**
   - Run `python manage.py collectstatic`
   - Check `STATIC_ROOT` and `STATIC_URL` settings
   - Verify WhiteNoise configuration in production

### Migration from Old Settings

If migrating from the old single `settings.py` file:

1. Backup your current `settings.py`
2. Move environment-specific configurations to appropriate files
3. Update environment variables
4. Test each environment thoroughly

## Additional Resources

- [Django Settings Documentation](https://docs.djangoproject.com/en/stable/topics/settings/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [WhiteNoise Documentation](http://whitenoise.evans.io/)
- [Celery Documentation](https://docs.celeryproject.org/) 