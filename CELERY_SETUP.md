# Celery and Redis Setup Guide

This guide explains how to set up and use Celery with Redis for background task processing and scheduling in the TUTOR_AI project.

## Overview

We've configured Celery to handle:
- **Daily news summarization**: Automatically fetch and summarize current affairs every day
- **Weekly digest generation**: Create weekly compilations of current affairs
- **Background processing**: Handle time-consuming tasks asynchronously
- **Task scheduling**: Run tasks at specific times using Celery Beat

## Prerequisites

1. Python packages (already added to requirements.txt):
   - `celery>=5.3.0`
   - `redis>=4.0.0`
   - `django-celery-beat>=2.5.0`
   - `django-celery-results>=2.5.0`

2. Redis server running

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start Redis Server

**Option A: Using Docker (Recommended)**
```bash
docker-compose up redis -d
```

**Option B: Local Redis Installation**
```bash
# On Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# On macOS
brew install redis
brew services start redis

# On Windows
# Download and install Redis from official website
```

### 3. Apply Database Migrations

```bash
python manage.py migrate
```

### 4. Set Up Periodic Tasks

```bash
python manage.py setup_periodic_tasks
```

### 5. Start Celery Processes

**Option A: Using the provided script**
```bash
python start_celery.py
```

**Option B: Manual startup**
```bash
# Terminal 1: Start Celery Worker
celery -A TUTOR_AI worker --loglevel=info

# Terminal 2: Start Celery Beat Scheduler
celery -A TUTOR_AI beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

## Available Tasks

### 1. Daily News Summarization
- **Task**: `current_affairs.tasks.fetch_and_summarize_news`
- **Schedule**: Every day at 6:00 AM
- **Description**: Fetches latest news and creates UPSC-relevant summaries

### 2. Weekly Digest Generation
- **Task**: `current_affairs.tasks.generate_weekly_digest`
- **Schedule**: Every Sunday at 8:00 AM
- **Description**: Compiles weekly current affairs digest

### 3. Cleanup Old Digests
- **Task**: `current_affairs.tasks.cleanup_old_digests`
- **Schedule**: 1st of every month at 2:00 AM
- **Description**: Removes digests older than 30 days

### 4. Custom Article Summarization
- **Task**: `current_affairs.tasks.summarize_custom_articles`
- **Trigger**: Manual or API call
- **Description**: Summarizes provided articles

## Management Commands

### Setup Periodic Tasks
```bash
python manage.py setup_periodic_tasks
```

### Manual Task Execution
```bash
# Run synchronously
python manage.py run_summarization

# Run asynchronously
python manage.py run_summarization --async

# Summarize custom articles from file
python manage.py run_summarization --articles-file path/to/articles.json
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# For production, you might use a different Redis instance:
# REDIS_URL=redis://username:password@hostname:port/database
```

### Settings Configuration

The following settings are automatically configured in `settings.py`:

```python
# Celery Configuration
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Task Configuration
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
```

## Monitoring

### Celery Flower (Optional)

Install and start Flower for web-based monitoring:

```bash
pip install flower
python start_celery.py --with-flower
```

Access at: http://localhost:5555

### Redis Commander (Optional)

If using Docker Compose, Redis Commander is available at: http://localhost:8081

### Django Admin

Monitor periodic tasks and results in Django Admin:
- `/admin/django_celery_beat/periodictask/`
- `/admin/django_celery_results/taskresult/`

## Production Deployment

### 1. Process Management

Use a process manager like Supervisor or systemd:

**Supervisor Configuration Example:**
```ini
[program:celery_worker]
command=/path/to/venv/bin/celery -A TUTOR_AI worker --loglevel=info
directory=/path/to/project
user=www-data
autostart=true
autorestart=true

[program:celery_beat]
command=/path/to/venv/bin/celery -A TUTOR_AI beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
directory=/path/to/project
user=www-data
autostart=true
autorestart=true
```

### 2. Redis Configuration

For production, consider:
- Redis persistence configuration
- Memory optimization
- Security (password protection, bind to specific interfaces)
- Monitoring and alerting

### 3. Scaling

- Run multiple worker processes
- Use different queues for different task types
- Monitor task execution times and optimize

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Check if Redis is running
   redis-cli ping
   # Should return "PONG"
   ```

2. **Tasks Not Executing**
   ```bash
   # Check if Celery beat is running
   celery -A TUTOR_AI inspect active
   
   # Check periodic tasks in Django admin
   python manage.py shell
   >>> from django_celery_beat.models import PeriodicTask
   >>> PeriodicTask.objects.all()
   ```

3. **Import Errors**
   - Ensure all apps are in `INSTALLED_APPS`
   - Check Python path and virtual environment

### Logs

Check logs for debugging:
```bash
# Celery worker logs
celery -A TUTOR_AI worker --loglevel=debug

# Django logs
python manage.py runserver --verbosity=2
```

## Development Tips

1. **Testing Tasks**
   ```python
   from current_affairs.tasks import fetch_and_summarize_news
   
   # Run synchronously for testing
   result = fetch_and_summarize_news()
   
   # Run asynchronously
   task = fetch_and_summarize_news.delay()
   print(task.id)
   ```

2. **Custom Task Development**
   - Use `@shared_task` decorator
   - Include proper error handling and retries
   - Log important events
   - Return meaningful results

3. **Task Scheduling**
   - Use Django admin to modify schedules
   - Test cron expressions before deploying
   - Consider timezone settings

## Integration with News Sources

To implement actual news fetching, modify the `fetch_latest_news_articles()` function in `current_affairs/tasks.py`:

```python
def fetch_latest_news_articles() -> List[Dict]:
    # Example integrations:
    
    # 1. RSS Feeds
    import feedparser
    feed = feedparser.parse('https://pib.gov.in/PressReleseDetail.aspx?PRID=1804025')
    
    # 2. News API
    import requests
    response = requests.get('https://newsapi.org/v2/top-headlines', 
                          params={'country': 'in', 'apiKey': 'your-key'})
    
    # 3. Web Scraping
    from bs4 import BeautifulSoup
    # Implement scraping logic
    
    return articles
```

## Security Considerations

1. **Redis Security**
   - Use password authentication in production
   - Bind Redis to localhost only if not using distributed setup
   - Use SSL/TLS for Redis connections in production

2. **Task Security**
   - Validate input data in tasks
   - Use rate limiting for API calls
   - Sanitize content before processing

3. **Environment Variables**
   - Keep sensitive data in environment variables
   - Use different Redis instances for different environments

## Support

For issues and questions:
1. Check this documentation
2. Review Django and Celery documentation
3. Check application logs
4. Test individual components separately 