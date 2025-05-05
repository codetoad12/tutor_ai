from django.db import models

class ExamType(models.TextChoices):
    UPSC_PRELIMS = 'UPSC_PRELIMS', 'UPSC Prelims'
    UPSC_MAINS = 'UPSC_MAINS', 'UPSC Mains'
    STATE_PSC = 'STATE_PSC', 'State PSC'
    OTHER = 'OTHER', 'Other'

class Category(models.TextChoices):
    POLITY = 'POLITY', 'Polity'
    ECONOMY = 'ECONOMY', 'Economy'
    HISTORY = 'HISTORY', 'History'
    GEOGRAPHY = 'GEOGRAPHY', 'Geography'
    SCIENCE = 'SCIENCE', 'Science'
    ENVIRONMENT = 'ENVIRONMENT', 'Environment'
    INTERNATIONAL = 'INTERNATIONAL', 'International Relations'
    SOCIAL_ISSUES = 'SOCIAL_ISSUES', 'Social Issues'
    GOVERNANCE = 'GOVERNANCE', 'Governance'
    SECURITY = 'SECURITY', 'Security'
    DISASTER = 'DISASTER', 'Disaster Management'
    ETHICS = 'ETHICS', 'Ethics'
    OTHER = 'OTHER', 'Other'

class SourceEvent(models.TextChoices):
    GOVERNMENT_POLICY = 'GOVERNMENT_POLICY', 'Government Policy'
    INTERNATIONAL_EVENT = 'INTERNATIONAL_EVENT', 'International Event'
    ECONOMIC_DEVELOPMENT = 'ECONOMIC_DEVELOPMENT', 'Economic Development'
    SCIENTIFIC_DISCOVERY = 'SCIENTIFIC_DISCOVERY', 'Scientific Discovery'
    ENVIRONMENTAL_ISSUE = 'ENVIRONMENTAL_ISSUE', 'Environmental Issue'
    SOCIAL_MOVEMENT = 'SOCIAL_MOVEMENT', 'Social Movement'
    JUDICIAL_DECISION = 'JUDICIAL_DECISION', 'Judicial Decision'
    LEGISLATIVE_CHANGE = 'LEGISLATIVE_CHANGE', 'Legislative Change'
    OTHER = 'OTHER', 'Other' 