from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, CrontabSchedule
import json

class Command(BaseCommand):
    help = 'Setup periodic tasks for current affairs summarization'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up periodic tasks for current affairs...'))

        # Create schedule for daily news summarization (every day at 6:00 AM)
        daily_schedule, created = CrontabSchedule.objects.get_or_create(
            minute=0,
            hour=6,
            day_of_week='*',
            day_of_month='*',
            month_of_year='*',
        )

        # Create or update daily summarization task
        daily_task, created = PeriodicTask.objects.get_or_create(
            name='Daily Current Affairs Summarization',
            defaults={
                'crontab': daily_schedule,
                'task': 'current_affairs.tasks.fetch_and_summarize_news',
                'args': json.dumps([]),
                'kwargs': json.dumps({}),
                'enabled': True,
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created daily task: {daily_task.name}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Daily task already exists: {daily_task.name}')
            )

        # Create schedule for weekly digest (every Sunday at 8:00 AM)
        weekly_schedule, created = CrontabSchedule.objects.get_or_create(
            minute=0,
            hour=8,
            day_of_week=0,  # Sunday
            day_of_month='*',
            month_of_year='*',
        )

        # Create or update weekly digest task
        weekly_task, created = PeriodicTask.objects.get_or_create(
            name='Weekly Current Affairs Digest',
            defaults={
                'crontab': weekly_schedule,
                'task': 'current_affairs.tasks.generate_weekly_digest',
                'args': json.dumps([]),
                'kwargs': json.dumps({}),
                'enabled': True,
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created weekly task: {weekly_task.name}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Weekly task already exists: {weekly_task.name}')
            )

        # Create schedule for cleanup (every month on the 1st at 2:00 AM)
        cleanup_schedule, created = CrontabSchedule.objects.get_or_create(
            minute=0,
            hour=2,
            day_of_week='*',
            day_of_month=1,
            month_of_year='*',
        )

        # Create or update cleanup task
        cleanup_task, created = PeriodicTask.objects.get_or_create(
            name='Cleanup Old Current Affairs Digests',
            defaults={
                'crontab': cleanup_schedule,
                'task': 'current_affairs.tasks.cleanup_old_digests',
                'args': json.dumps([]),
                'kwargs': json.dumps({'days_to_keep': 30}),
                'enabled': True,
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created cleanup task: {cleanup_task.name}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Cleanup task already exists: {cleanup_task.name}')
            )

        self.stdout.write(self.style.SUCCESS('Periodic tasks setup completed!'))
        self.stdout.write(self.style.SUCCESS('Tasks created:'))
        self.stdout.write(f'  - Daily summarization: Every day at 6:00 AM')
        self.stdout.write(f'  - Weekly digest: Every Sunday at 8:00 AM')
        self.stdout.write(f'  - Monthly cleanup: 1st of every month at 2:00 AM')
        
        self.stdout.write('\nTo start the Celery worker and beat scheduler, run:')
        self.stdout.write('  celery -A TUTOR_AI worker --loglevel=info')
        self.stdout.write('  celery -A TUTOR_AI beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler') 