# Redis Setup Without Docker

This guide shows you how to set up Redis for the TUTOR_AI project without using Docker.

## Quick Start Options

### Option 1: Local Redis Installation

#### Windows
1. **Download Redis for Windows:**
   ```
   https://github.com/microsoftarchive/redis/releases
   ```
   - Download the latest `.msi` file
   - Install and start the Redis service
   - Redis will run on `localhost:6379` by default

2. **Or use WSL2:**
   ```bash
   # In WSL2 Ubuntu terminal
   sudo apt update
   sudo apt install redis-server
   sudo service redis-server start
   ```

#### macOS
```bash
# Install using Homebrew
brew install redis

# Start Redis
brew services start redis

# Or start manually (in terminal)
redis-server
```

#### Ubuntu/Linux
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server  # Auto-start on boot
```

#### Test Installation
```bash
# Test if Redis is working
redis-cli ping
# Should return: PONG
```

### Option 2: Cloud Redis (No Installation Required)

#### Free Cloud Options:

1. **Redis Cloud (30MB Free):**
   - Visit: https://redis.com/try-free/
   - Sign up for free account
   - Create database
   - Copy connection URL

2. **Railway (Free Tier):**
   - Visit: https://railway.app/
   - Sign up and create project
   - Add Redis service
   - Get connection details

3. **Render (Free Tier):**
   - Visit: https://render.com/
   - Create Redis instance
   - Get connection URL

## Configuration

### For Local Redis
In your `.env` file:
```env
REDIS_URL=redis://localhost:6379/0
```

### For Cloud Redis
In your `.env` file, replace with your cloud provider's URL:
```env
# Example Redis Cloud URL
REDIS_URL=redis://default:password@redis-12345.c1.us-west-2.ec2.cloud.redislabs.com:12345

# Example Railway URL  
REDIS_URL=redis://:password@containers-us-west-1.railway.app:1234

# Example Render URL
REDIS_URL=redis://:password@red-xyz123.render.com:6379
```

## Start Your Application

Once Redis is running (locally or in cloud):

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

3. **Set up periodic tasks:**
   ```bash
   python manage.py setup_periodic_tasks
   ```

4. **Start Django:**
   ```bash
   python manage.py runserver
   ```

5. **Start Celery (in separate terminals):**
   ```bash
   # Terminal 1: Celery Worker
   celery -A TUTOR_AI worker --loglevel=info
   
   # Terminal 2: Celery Beat
   celery -A TUTOR_AI beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
   ```

   Or use the provided script:
   ```bash
   python start_celery.py
   ```

## Troubleshooting

### Common Issues:

1. **"Connection refused" error:**
   - Check if Redis is running: `redis-cli ping`
   - Check Redis port (default 6379)
   - Verify REDIS_URL in .env file

2. **Redis not found on Windows:**
   - Make sure Redis service is started
   - Check Windows Services for "Redis" service
   - Try restarting the service

3. **Permission denied on Linux:**
   ```bash
   sudo chown -R $USER:$USER /var/lib/redis
   sudo systemctl restart redis-server
   ```

### Test Redis Connection:
```bash
# Test basic connection
redis-cli ping

# Test from Python
python manage.py shell
>>> import redis
>>> r = redis.from_url('redis://localhost:6379/0')
>>> r.ping()
# Should return: True
```

## Performance Tips

### For Local Development:
- Default Redis configuration is fine
- No special optimization needed

### For Production:
- Configure Redis persistence
- Set appropriate memory limits
- Consider Redis clustering for high availability
- Use Redis password protection

## Memory Usage

Redis is lightweight:
- Empty Redis: ~1-2MB RAM
- With typical TUTOR_AI data: ~5-10MB RAM
- Very minimal resource usage

You're all set! No Docker required. 🚀 