from django.core.management.base import BaseCommand
from current_affairs.services import CurrentAffairsService
from current_affairs.utils import fetch_headlines

class Command(BaseCommand):
    help = 'Test the news summarization service'

    def handle(self, *args, **options):
        # Fetch some headlines
        articles = fetch_headlines(max_articles=3)

        # Initialize the service
        service = CurrentAffairsService()

        # Get the analysis
        result = service.summarize_news(articles)

        if result['success']:
            analysis = result['analysis']

            # Print the article analyses
            self.stdout.write(self.style.SUCCESS('\nARTICLE ANALYSES:'))
            for i, article in enumerate(analysis['article_analyses'], 1):
                self.stdout.write(self.style.SUCCESS(f"\n{i}. {article['headline']}"))
                self.stdout.write(f"Importance: {article['importance']}")
                self.stdout.write(f"Summary: {article['summary']}")
                self.stdout.write(f"Key Concepts: {article['key_concepts']}")
                self.stdout.write('-' * 50)

            self.stdout.write("\n" + "=" * 70 + "\n")  # Clear separation

            self.stdout.write(self.style.SUCCESS('\nSYLLABUS CONNECTION:'))
            self.stdout.write(analysis['syllabus_connection'])

            self.stdout.write("\n" + "=" * 70 + "\n")  # Clear separation
            
            self.stdout.write(self.style.SUCCESS('\nPOTENTIAL QUESTIONS:'))
            for i, question in enumerate(analysis['potential_questions'], 1):
                self.stdout.write(f"{i}. {question}")
        else:
            self.stdout.write(
                self.style.ERROR(f"Error: {result['error']}")
            )
