from django.core.management.base import BaseCommand
from current_affairs.models import CurrentAffair
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Populates the database with sample current affairs data'

    def handle(self, *args, **options):
        # Clear existing data
        CurrentAffair.objects.all().delete()
        
        # Sample data
        sample_affairs = [
            {
                'date': datetime.now().date(),
                'category': 'Politics',
                'title': 'Global Climate Summit Concludes',
                'summary': 'World leaders gathered to discuss climate change policies and set new emission targets.',
                'key_concepts': 'Climate change, Emissions, International cooperation',
                'usage_hint': 'Use this in discussions about environmental policies and global cooperation.'
            },
            {
                'date': datetime.now().date() - timedelta(days=1),
                'category': 'Technology',
                'title': 'AI Breakthrough in Healthcare',
                'summary': 'Researchers developed a new AI system that can predict disease progression with 95% accuracy.',
                'key_concepts': 'Artificial Intelligence, Healthcare, Machine Learning',
                'usage_hint': 'Use this to discuss the impact of AI on healthcare and future medical advancements.'
            },
            {
                'date': datetime.now().date() - timedelta(days=2),
                'category': 'Economy',
                'title': 'Global Markets Show Recovery Signs',
                'summary': 'Major stock markets show positive trends as economic indicators improve.',
                'key_concepts': 'Stock markets, Economic recovery, Financial indicators',
                'usage_hint': 'Use this to discuss economic trends and market analysis.'
            }
        ]

        # Create sample current affairs
        for affair_data in sample_affairs:
            CurrentAffair.objects.create(**affair_data)
            self.stdout.write(self.style.SUCCESS(f'Created current affair: {affair_data["title"]}'))

        self.stdout.write(self.style.SUCCESS('Successfully populated current affairs data')) 