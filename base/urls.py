from django.urls import path
from . import views

app_name = 'base'

urlpatterns = [
    # Token usage statistics
    path('token-usage/stats/', views.TokenUsageStatsAPIView.as_view(), name='token-usage-stats'),
    path('token-usage/admin-stats/', views.AdminTokenUsageStatsAPIView.as_view(), name='admin-token-usage-stats'),
    path('token-usage/estimate-cost/', views.estimate_token_cost, name='estimate-token-cost'),
    path('token-usage/summary/', views.user_usage_summary, name='user-usage-summary'),
] 