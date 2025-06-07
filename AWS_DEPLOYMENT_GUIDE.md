# AWS Deployment Guide for TUTOR AI

This guide covers deploying the TUTOR AI application on AWS with proper security using AWS Secrets Manager for sensitive data.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Domain name (optional but recommended)

## 1. AWS Secrets Manager Setup

### Create Database Secret

```bash
# Create database credentials secret
aws secretsmanager create-secret \
    --name "tutor-ai/database" \
    --description "Database credentials for TUTOR AI" \
    --secret-string '{
        "username": "tutor_ai_user",
        "password": "your-secure-database-password",
        "host": "your-rds-endpoint.amazonaws.com",
        "port": "5432",
        "dbname": "tutor_ai_prod"
    }' \
    --region us-east-1
```

### Create API Keys Secret

```bash
# Create API keys secret
aws secretsmanager create-secret \
    --name "tutor-ai/api-keys" \
    --description "API keys for TUTOR AI" \
    --secret-string '{
        "GEMINI_API_KEY": "your-actual-gemini-api-key",
        "GOOGLE_API_KEY": "your-actual-google-api-key"
    }' \
    --region us-east-1
```

## 2. AWS Infrastructure Setup

### Option A: RDS + ElastiCache + EC2

#### Create RDS PostgreSQL Database

```bash
# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier tutor-ai-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username tutor_ai_user \
    --master-user-password your-secure-database-password \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --db-name tutor_ai_prod \
    --backup-retention-period 7 \
    --storage-encrypted
```

#### Create ElastiCache Redis Cluster

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
    --cache-cluster-id tutor-ai-redis \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1 \
    --security-group-ids sg-xxxxxxxxx
```

#### Launch EC2 Instance

```bash
# Launch EC2 instance (Ubuntu 22.04 LTS)
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --instance-type t3.medium \
    --key-name your-key-pair \
    --security-group-ids sg-xxxxxxxxx \
    --iam-instance-profile Name=TutorAI-EC2-Role \
    --user-data file://user-data.sh
```

### Option B: AWS Elastic Beanstalk (Recommended)

#### Install EB CLI

```bash
pip install awsebcli
```

#### Initialize and Deploy

```bash
# Initialize Elastic Beanstalk
eb init tutor-ai --region us-east-1 --platform python-3.11

# Create environment
eb create production --database.engine postgres --database.username tutor_ai_user

# Set environment variables
eb setenv DJANGO_ENVIRONMENT=production \
         USE_AWS_SECRETS=true \
         AWS_REGION=us-east-1 \
         DB_SECRET_NAME=tutor-ai/database \
         API_KEYS_SECRET_NAME=tutor-ai/api-keys \
         REDIS_URL=redis://your-elasticache-endpoint:6379/0

# Deploy
eb deploy
```

## 3. IAM Permissions

### Create IAM Role for EC2/Beanstalk

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": [
                "arn:aws:secretsmanager:us-east-1:*:secret:tutor-ai/*"
            ]
        }
    ]
}
```

### Attach Role to EC2 Instance

```bash
# Create instance profile
aws iam create-instance-profile --instance-profile-name TutorAI-EC2-Role

# Add role to instance profile
aws iam add-role-to-instance-profile \
    --instance-profile-name TutorAI-EC2-Role \
    --role-name TutorAI-SecretsManager-Role
```

## 4. Manual EC2 Deployment

### Server Setup Script

```bash
#!/bin/bash
# user-data.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip python3-venv nginx postgresql-client redis-tools git

# Create application user
sudo useradd -m -s /bin/bash tutor-ai
sudo mkdir -p /opt/tutor-ai
sudo chown tutor-ai:tutor-ai /opt/tutor-ai

# Switch to application user
sudo -u tutor-ai bash << 'EOF'
cd /opt/tutor-ai

# Clone repository
git clone https://github.com/your-username/tutor-ai.git .

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.production.aws.example .env.production

# Set up Django
export DJANGO_ENVIRONMENT=production
python manage.py collectstatic --noinput
python manage.py migrate
EOF
```

### Systemd Service Files

#### Django Service (`/etc/systemd/system/tutor-ai.service`)

```ini
[Unit]
Description=TUTOR AI Django Application
After=network.target

[Service]
User=tutor-ai
Group=tutor-ai
WorkingDirectory=/opt/tutor-ai
Environment=DJANGO_ENVIRONMENT=production
EnvironmentFile=/opt/tutor-ai/.env.production
ExecStart=/opt/tutor-ai/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:8000 TUTOR_AI.wsgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

#### Celery Service (`/etc/systemd/system/tutor-ai-celery.service`)

```ini
[Unit]
Description=TUTOR AI Celery Worker
After=network.target

[Service]
User=tutor-ai
Group=tutor-ai
WorkingDirectory=/opt/tutor-ai
Environment=DJANGO_ENVIRONMENT=production
EnvironmentFile=/opt/tutor-ai/.env.production
ExecStart=/opt/tutor-ai/venv/bin/celery -A TUTOR_AI worker --loglevel=info
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### Nginx Configuration (`/etc/nginx/sites-available/tutor-ai`)

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /opt/tutor-ai/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 5. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 6. Environment Variables Summary

### Required Environment Variables

```bash
# Core Django
DJANGO_ENVIRONMENT=production
DJANGO_SECRET_KEY=your-secure-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# AWS Configuration
USE_AWS_SECRETS=true
AWS_REGION=us-east-1
DB_SECRET_NAME=tutor-ai/database
API_KEYS_SECRET_NAME=tutor-ai/api-keys

# Redis
REDIS_URL=redis://your-elasticache-endpoint:6379/0

# CORS
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

## 7. Deployment Checklist

- [ ] AWS Secrets Manager secrets created
- [ ] RDS PostgreSQL database running
- [ ] ElastiCache Redis cluster running
- [ ] EC2 instance with proper IAM role
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Django migrations run
- [ ] Static files collected
- [ ] Services started and enabled

## 8. Monitoring and Maintenance

### CloudWatch Logs

```bash
# Install CloudWatch agent
sudo apt install amazon-cloudwatch-agent

# Configure log groups
aws logs create-log-group --log-group-name /aws/ec2/tutor-ai/django
aws logs create-log-group --log-group-name /aws/ec2/tutor-ai/celery
```

### Health Checks

```bash
# Django health check
curl -f http://localhost:8000/health/ || exit 1

# Celery health check
celery -A TUTOR_AI inspect ping
```

## 9. Scaling Considerations

- Use Application Load Balancer for multiple EC2 instances
- Consider AWS ECS/Fargate for containerized deployment
- Use RDS Multi-AZ for high availability
- Implement ElastiCache cluster mode for Redis scaling
- Set up CloudFront CDN for static files

## 10. Security Best Practices

- Use VPC with private subnets for database and Redis
- Implement security groups with minimal required access
- Enable AWS CloudTrail for audit logging
- Use AWS WAF for web application firewall
- Regularly rotate secrets in Secrets Manager
- Enable RDS encryption at rest
- Use HTTPS everywhere with proper SSL certificates 