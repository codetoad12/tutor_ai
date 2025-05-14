from django.core.management.base import BaseCommand
from current_affairs.handlers.news_handler import NewsHandler

class Command(BaseCommand):
    help = 'Fetch news headlines, summarize them using AI, and store in the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--max-articles',
            type=int,
            default=5,
            help='Maximum number of articles to fetch from each feed'
        )
        parser.add_argument(
            '--skip-existing',
            action='store_true',
            help='Skip articles that already exist in the database'
        )

    def handle(self, *args, **options):
        max_articles = options['max_articles']
        skip_existing = options['skip_existing']
        
        self.stdout.write(f"Fetching up to {max_articles} articles per feed...")
        
        # Use the handler to process articles
        handler = NewsHandler()
        result = handler.fetch_and_store_articles(
            max_articles=max_articles,
            skip_existing=skip_existing
        )
        
        if not result['success']:
            self.stdout.write(
                self.style.ERROR(f"Error: {result['error']}")
            )
            return
        
        # Print summary of saved articles
        if result['saved_articles']:
            self.stdout.write(self.style.SUCCESS('\nARTICLES SAVED:'))
            for article in result['saved_articles']:
                self.stdout.write(f"{article['action']}: {article['title']} ({article['category']})")
        
        # Print syllabus connection if available
        if 'syllabus_connection' in result and result['syllabus_connection']:
            self.stdout.write("\n" + "=" * 70 + "\n")  # Clear separation
            self.stdout.write(self.style.SUCCESS('\nSYLLABUS CONNECTION:'))
            self.stdout.write(result['syllabus_connection'])
        
        # Print summary
        self.stdout.write(self.style.SUCCESS(
            f"\nSummary: {result['articles_saved']} articles saved, {result['articles_skipped']} skipped"
        )) 