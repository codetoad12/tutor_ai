from rest_framework import serializers
from .models import CurrentAffair

class CurrentAffairSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentAffair
        fields = ['id', 'date', 'category', 'title', 'summary', 'key_concepts', 'usage_hint', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at'] 