from django.core.management.base import BaseCommand
from current_affairs.models import CurrentAffair
from base.choices import CurrentAffairCategory
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Populates the database with sample current affairs data'

    def handle(self, *args, **kwargs):
        # Clear existing data
        CurrentAffair.objects.all().delete()

        # Sample data
        current_affairs = [
            {
                'date': datetime.now() - timedelta(days=1),
                'category': CurrentAffairCategory.INTERNATIONAL_RELATIONS,
                'title': 'India and US Sign Defense Cooperation Agreement',
                'summary': 'India and the United States have signed a new defense cooperation agreement that will enhance military-to-military cooperation and technology sharing. The agreement focuses on joint development of defense equipment and technology transfer.',
                'source': 'The Hindu',
                'ai_insight': 'This agreement marks a significant step in India-US strategic partnership. Consider its implications for India\'s defense indigenization and Make in India initiative.',
                'tags': ['Defense', 'India-US Relations', 'Technology Transfer'],
                'key_concepts': 'Defense cooperation, Technology transfer, Strategic partnership',
                'usage_hint': 'Use this in discussions about India-US relations and defense indigenization.'
            },
            {
                'date': datetime.now() - timedelta(days=2),
                'category': CurrentAffairCategory.ECONOMY,
                'title': 'New Economic Reforms Announced',
                'summary': 'The government has announced a new set of economic reforms aimed at boosting manufacturing and exports. The reforms include tax incentives for new investments and simplified regulatory procedures.',
                'source': 'PIB',
                'ai_insight': 'Analyze how these reforms align with India\'s goal of becoming a $5 trillion economy by 2025.',
                'tags': ['Economic Reforms', 'Manufacturing', 'Exports'],
                'key_concepts': 'Economic reforms, Manufacturing, Exports, Tax incentives',
                'usage_hint': 'Use this to discuss economic reforms and their impact on manufacturing and exports.'
            },
            {
                'date': datetime.now() - timedelta(days=3),
                'category': CurrentAffairCategory.POLITY,
                'title': 'Supreme Court Ruling on Right to Privacy',
                'summary': 'The Supreme Court has delivered a landmark judgment affirming the right to privacy as a fundamental right under Article 21 of the Constitution. The ruling has significant implications for data protection laws and Aadhaar.',
                'source': 'Indian Express',
                'ai_insight': 'Discuss the balance between individual privacy rights and state\'s interest in governance and security.',
                'tags': ['Fundamental Rights', 'Privacy', 'Constitution'],
                'key_concepts': 'Right to Privacy, Article 21, Fundamental Rights, Data Protection',
                'usage_hint': 'Use this to discuss the evolution of fundamental rights and the balance between privacy and governance.'
            }
        ]

        # Create current affairs
        for affair in current_affairs:
            CurrentAffair.objects.create(**affair)
            self.stdout.write(self.style.SUCCESS(f'Created current affair: {affair["title"]}'))

        self.stdout.write(self.style.SUCCESS('Successfully populated current affairs data')) 