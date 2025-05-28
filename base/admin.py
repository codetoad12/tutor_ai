from django.contrib import admin
from .models import TokenUsage

# Register your models here.

# Import TokenUsage admin
from .middleware.admin import TokenUsageAdmin
