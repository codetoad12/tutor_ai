from django.core.management.base import BaseCommand
from current_affairs.tasks import fetch_and_summarize_news, process_custom_articles, test_news_handler
import json

class Command(BaseCommand):
    help = 'Manually run current affairs summarization'

    def add_arguments(self, parser):
        parser.add_argument(
            '--async',
            action='store_true',
            help='Run the task asynchronously using Celery',
        )
        parser.add_argument(
            '--articles-file',
            type=str,
            help='Path to JSON file containing articles to summarize',
        )
        parser.add_argument(
            '--test',
            action='store_true',
            help='Run a test with a small number of articles',
        )
        parser.add_argument(
            '--max-articles',
            type=int,
            default=10,
            help='Maximum number of articles to process (default: 10)',
        )

    def handle(self, *args, **options):
        is_async = options['async']
        articles_file = options.get('articles_file')
        is_test = options.get('test')
        max_articles = options.get('max_articles', 10)

        if is_test:
            self.stdout.write('Running test with NewsHandler...')
            if is_async:
                task = test_news_handler.delay(max_articles=3)
                self.stdout.write(f'Test task ID: {task.id}')
                self.stdout.write('Check task status with: celery -A TUTOR_AI inspect active')
            else:
                result = test_news_handler(max_articles=3)
                self.stdout.write(self.style.SUCCESS('Test completed!'))
                self.stdout.write(f'Result: {json.dumps(result, indent=2)}')
        elif articles_file:
            self.stdout.write(f'Loading articles from: {articles_file}')
            try:
                with open(articles_file, 'r') as f:
                    articles = json.load(f)
                
                if is_async:
                    self.stdout.write('Starting custom article processing (async)...')
                    task = process_custom_articles.delay(articles)
                    self.stdout.write(f'Task ID: {task.id}')
                    self.stdout.write('Check task status with: celery -A TUTOR_AI inspect active')
                else:
                    self.stdout.write('Starting custom article processing (sync)...')
                    result = process_custom_articles(articles)
                    self.stdout.write(self.style.SUCCESS('Processing completed!'))
                    self.stdout.write(f'Result: {json.dumps(result, indent=2)}')
                    
            except FileNotFoundError:
                self.stdout.write(self.style.ERROR(f'File not found: {articles_file}'))
                return
            except json.JSONDecodeError:
                self.stdout.write(self.style.ERROR(f'Invalid JSON in file: {articles_file}'))
                return
        else:
            if is_async:
                self.stdout.write(f'Starting daily news processing (async) with max {max_articles} articles...')
                task = fetch_and_summarize_news.delay(max_articles=max_articles)
                self.stdout.write(f'Task ID: {task.id}')
                self.stdout.write('Check task status with: celery -A TUTOR_AI inspect active')
            else:
                self.stdout.write(f'Starting daily news processing (sync) with max {max_articles} articles...')
                result = fetch_and_summarize_news(max_articles=max_articles)
                self.stdout.write(self.style.SUCCESS('Processing completed!'))
                self.stdout.write(f'Result: {json.dumps(result, indent=2)}') 