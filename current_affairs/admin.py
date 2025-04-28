from django.contrib import admin
from .models import CurrentAffair

@admin.register(CurrentAffair)
class CurrentAffairAdmin(admin.ModelAdmin):
    list_display = ('date', 'category', 'title', 'created_at')
    list_filter = ('date', 'category')
    search_fields = ('title', 'summary', 'key_concepts')
    date_hierarchy = 'date'
