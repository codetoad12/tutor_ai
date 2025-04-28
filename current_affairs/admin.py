from django.contrib import admin
from .models import CurrentAffair

@admin.register(CurrentAffair)
class CurrentAffairAdmin(admin.ModelAdmin):
    # Display fields in list view
    list_display = ('date', 'category', 'title', 'created_at', 'created_by')
    
    # Enable filtering by these fields
    list_filter = ('date', 'category', 'created_at')
    
    # Enable searching in these fields
    search_fields = ('title', 'summary', 'key_concepts', 'category')
    
    # Enable date-based navigation
    date_hierarchy = 'date'
    
    # Group fields in the edit form
    fieldsets = (
        ('Basic Information', {
            'fields': ('date', 'category', 'title')
        }),
        ('Content', {
            'fields': ('summary', 'key_concepts', 'usage_hint')
        }),
        ('Audit Information', {
            'fields': ('created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    # Make date and category fields editable in the list view
    list_editable = ('category',)
    
    # Set default ordering
    ordering = ('-date', '-created_at')
    
    # Add a custom action
    actions = ['mark_as_important']
    
    def mark_as_important(self, request, queryset):
        queryset.update(category='Important')
    mark_as_important.short_description = "Mark selected items as Important"
