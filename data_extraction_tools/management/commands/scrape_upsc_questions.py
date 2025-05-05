from django.core.management.base import BaseCommand, CommandError
from data_extraction_tools.scripts.scrape_upsc_questions import UPSCQuestionScraper

class Command(BaseCommand):
    help = 'Scrape UPSC questions from various sources and save to a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('output_file', nargs='?', type=str, default='historic_questions.csv',
                            help='Path to save the CSV file of scraped questions')

    def handle(self, *args, **options):
        output_file = options['output_file']
        
        self.stdout.write(self.style.SUCCESS(f"Starting scraping process, output will be saved to '{output_file}'..."))
        
        try:
            scraper = UPSCQuestionScraper()
            scraper.scrape_all_sources()
            scraper.save_to_csv(output_file)
            
            self.stdout.write(self.style.SUCCESS(f"Scraping completed successfully! {len(scraper.questions)} questions saved to {output_file}"))
        except Exception as e:
            raise CommandError(f"Scraping failed: {str(e)}") 