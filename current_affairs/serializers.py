from rest_framework import serializers
from .models import CurrentAffair, CurrentAffairsDigest

class CurrentAffairSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentAffair
        fields = [
            'id',
            'date',
            'category',
            'title',
            'summary',
            'source',
            'ai_insights',
            'tags',
            'usage_hint',
            'importance',
            'article_link',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CurrentAffairsDigestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentAffairsDigest
        fields = [
            'id',
            'title',
            'content',
            'date_generated',
            'digest_type',
            'is_published',
            'articles_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'articles_count'] 