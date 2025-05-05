import os
from django.core.management.base import BaseCommand, CommandError
from data_extraction_tools.scripts.import_historic_questions import import_questions_from_csv

class Command(BaseCommand):
    help = 'Import historic UPSC questions from CSV file into the database'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', nargs='?', type=str, default='historic_questions.csv',
                            help='Path to the CSV file containing historic questions')
        parser.add_argument('--verbose', action='store_true', 
                            help='Show detailed output during import')

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        verbose = options['verbose']
        
        if not os.path.exists(csv_file):
            raise CommandError(f"CSV file '{csv_file}' does not exist")
        
        self.stdout.write(self.style.SUCCESS(f"Starting import from '{csv_file}'..."))
        
        try:
            import_questions_from_csv(csv_file)
            self.stdout.write(self.style.SUCCESS('Import completed successfully!'))
        except Exception as e:
            raise CommandError(f"Import failed: {str(e)}") 