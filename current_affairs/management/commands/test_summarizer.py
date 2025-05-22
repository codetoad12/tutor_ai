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
                # Find the original article to get the link
                original_article = None
                for art in articles:
                    if art['title'] == article['headline'] or art['title'] in article['headline'] or article['headline'] in art['title']:
                        original_article = art
                        break
                
                link = original_article.get('link', 'No link available') if original_article else 'No link available'
                
                self.stdout.write(self.style.SUCCESS(f"\n{i}. {article['headline']}"))
                self.stdout.write(f"URL: {link}")
                self.stdout.write(f"Importance: {article['importance']}")
                self.stdout.write(f"Summary: {article['summary']}")
                self.stdout.write(f"Key Concepts: {article['key_concepts']}")
                
                # Print syllabus connection if available
                if article.get('syllabus_connection'):
                    self.stdout.write(f"Syllabus Connection: {article['syllabus_connection']}")
                else:
                    self.stdout.write(f"Syllabus Connection: Not provided")
                
                # Print potential questions if available
                self.stdout.write(f"Potential Questions:")
                if article.get('potential_questions') and len(article['potential_questions']) > 0:
                    for j, question in enumerate(article['potential_questions'], 1):
                        self.stdout.write(f"  {j}. {question}")
                else:
                    self.stdout.write(f"  No questions provided")
                        
                self.stdout.write('-' * 50)

            self.stdout.write("\n" + "=" * 70 + "\n")  # Clear separation
            self.stdout.write(self.style.SUCCESS("Analysis complete!"))
        else:
            self.stdout.write(
                self.style.ERROR(f"Error: {result['error']}")
            )
