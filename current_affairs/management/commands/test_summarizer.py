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

        # Get the summary
        result = service.summarize_news(articles)

        if result['success']:
            summary = result['summary']

            # Print the results
            self.stdout.write(self.style.SUCCESS('\nSummary:'))
            self.stdout.write(summary['summary'])

            self.stdout.write(self.style.SUCCESS('\nKey Concepts:'))
            for concept in summary['key_concepts']:
                self.stdout.write(f"- {concept}")

            self.stdout.write(self.style.SUCCESS('\nSyllabus Connection:'))
            self.stdout.write(summary['syllabus_connection'])

            self.stdout.write(self.style.SUCCESS('\nPotential Questions:'))
            for i, question in enumerate(summary['potential_questions'], 1):
                self.stdout.write(f"{i}. {question}")
        else:
            self.stdout.write(
                self.style.ERROR(f"Error: {result['error']}")
            ) 
