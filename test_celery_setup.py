#!/usr/bin/env python
"""
Simple test script to verify Celery setup is working correctly.
Run this after setting up Celery to test the integration.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TUTOR_AI.settings')
django.setup()

from current_affairs.tasks import test_news_handler, fetch_and_summarize_news
from current_affairs.handlers.news_handler import NewsHandler

def test_news_handler_direct():
    """Test NewsHandler directly (synchronous)"""
    print("🧪 Testing NewsHandler directly...")
    
    try:
        handler = NewsHandler()
        result = handler.fetch_and_store_articles(max_articles=2, skip_existing=False)
        
        print(f"✅ NewsHandler test completed!")
        print(f"   Success: {result['success']}")
        print(f"   Articles saved: {result.get('articles_saved', 0)}")
        print(f"   Articles skipped: {result.get('articles_skipped', 0)}")
        
        if result.get('saved_articles'):
            print(f"   Sample article: {result['saved_articles'][0]['title'][:50]}...")
        
        return result['success']
        
    except Exception as e:
        print(f"❌ NewsHandler test failed: {str(e)}")
        return False

def test_celery_task():
    """Test Celery task (synchronous execution)"""
    print("\n🧪 Testing Celery task...")
    
    try:
        # Run the task synchronously (not through Celery worker)
        result = test_news_handler(max_articles=2)
        
        print(f"✅ Celery task test completed!")
        print(f"   Status: {result['status']}")
        print(f"   Message: {result['message']}")
        
        return result['status'] == 'success'
        
    except Exception as e:
        print(f"❌ Celery task test failed: {str(e)}")
        return False

def test_celery_async():
    """Test Celery task asynchronously (requires worker)"""
    print("\n🧪 Testing Celery async execution...")
    
    try:
        # This will only work if Celery worker is running
        task = test_news_handler.delay(max_articles=2)
        print(f"✅ Async task submitted!")
        print(f"   Task ID: {task.id}")
        print(f"   Status: {task.status}")
        print("   Note: Check task completion with Celery worker logs")
        
        return True
        
    except Exception as e:
        print(f"❌ Async task test failed: {str(e)}")
        print("   This is normal if Celery worker is not running")
        return False

def main():
    print("🚀 Testing Celery + NewsHandler Integration")
    print("=" * 50)
    
    # Test 1: Direct NewsHandler
    test1_passed = test_news_handler_direct()
    
    # Test 2: Celery task (sync)
    test2_passed = test_celery_task()
    
    # Test 3: Celery task (async) - optional
    test3_passed = test_celery_async()
    
    print("\n📊 Test Results:")
    print(f"   Direct NewsHandler: {'✅ PASS' if test1_passed else '❌ FAIL'}")
    print(f"   Celery Task (sync): {'✅ PASS' if test2_passed else '❌ FAIL'}")
    print(f"   Celery Task (async): {'✅ PASS' if test3_passed else '⚠️  SKIP (no worker)'}")
    
    if test1_passed and test2_passed:
        print("\n🎉 All core tests passed! Your setup is working correctly.")
        print("\n📋 Next steps:")
        print("   1. Start Celery worker: python start_celery.py")
        print("   2. Test scheduled tasks: python manage.py setup_periodic_tasks")
        print("   3. Monitor tasks: Check Django admin or API endpoints")
    else:
        print("\n⚠️  Some tests failed. Check the error messages above.")
        print("   Make sure you've run: python manage.py migrate")

if __name__ == "__main__":
    main() 