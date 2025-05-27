from django.contrib import admin
from .models import CurrentAffair, CurrentAffairsDigest

@admin.register(CurrentAffair)
class CurrentAffairAdmin(admin.ModelAdmin):
    # Display fields in list view
    list_display = ('title', 'date', 'category', 'source', 'created_at')
    
    # Enable filtering by these fields
    list_filter = ('category', 'date', 'source')
    
    # Enable searching in these fields
    search_fields = ('title', 'summary', 'key_concepts', 'ai_insight')
    
    # Enable date-based navigation
    date_hierarchy = 'date'
    
    # Group fields in the edit form
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'date', 'category', 'source')
        }),
        ('Content', {
            'fields': ('summary', 'ai_insight', 'key_concepts', 'usage_hint')
        }),
        ('Metadata', {
            'fields': ('tags', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Make date and category fields editable in the list view
    list_editable = ('category',)
    
    # Set default ordering
    ordering = ('-date', '-created_at')
    
    # Add a custom action
    actions = ['mark_as_important']
    
    readonly_fields = ('created_at', 'updated_at')
    
    def mark_as_important(self, request, queryset):
        queryset.update(category='Important')
    mark_as_important.short_description = "Mark selected items as Important"


@admin.register(CurrentAffairsDigest)
class CurrentAffairsDigestAdmin(admin.ModelAdmin):
    # Display fields in list view
    list_display = ('title', 'digest_type', 'articles_count', 'date_generated', 'is_published', 'created_at')
    
    # Enable filtering by these fields
    list_filter = ('digest_type', 'is_published', 'date_generated')
    
    # Enable searching in these fields
    search_fields = ('title',)
    
    # Enable date-based navigation
    date_hierarchy = 'date_generated'
    
    # Group fields in the edit form
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'digest_type', 'is_published')
        }),
        ('Content', {
            'fields': ('content', 'articles_count')
        }),
        ('Timestamps', {
            'fields': ('date_generated', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Make these fields editable in the list view
    list_editable = ('is_published',)
    
    # Set default ordering
    ordering = ('-date_generated', '-created_at')
    
    # Add custom actions
    actions = ['publish_digests', 'unpublish_digests']
    
    readonly_fields = ('created_at', 'updated_at', 'articles_count')
    
    def publish_digests(self, request, queryset):
        queryset.update(is_published=True)
    publish_digests.short_description = "Publish selected digests"
    
    def unpublish_digests(self, request, queryset):
        queryset.update(is_published=False)
    unpublish_digests.short_description = "Unpublish selected digests"