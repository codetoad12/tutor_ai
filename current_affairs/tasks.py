from celery import shared_task
from celery.utils.log import get_task_logger
from django.utils import timezone
from typing import List, Dict
import logging

from .handlers.news_handler import NewsHandler
from .models import CurrentAffairsDigest
from .choices import DigestType

logger = get_task_logger(__name__)

@shared_task(bind=True, autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 60})
def fetch_and_summarize_news(self, max_articles=10, skip_existing=True):
    """
    Periodic task to fetch latest news and create UPSC-relevant summaries.
    This task can be scheduled to run daily or at any desired interval.
    """
    try:
        logger.info("Starting daily news summarization task")
        
        # Use the existing NewsHandler
        handler = NewsHandler()
        
        # Fetch and process articles
        result = handler.fetch_and_store_articles(
            max_articles=max_articles,
            skip_existing=skip_existing
        )
        
        if not result['success']:
            logger.error(f"Error in news processing: {result.get('error', 'Unknown error')}")
            return {
                "status": "error",
                "message": result.get('error', 'Unknown error'),
                "articles_processed": 0
            }
        
        logger.info(f"Successfully processed {result['articles_saved']} articles, skipped {result['articles_skipped']}")
        
        # Create a digest entry for tracking
        digest = CurrentAffairsDigest.objects.create(
            title=f"Daily UPSC Current Affairs - {timezone.now().strftime('%Y-%m-%d')}",
            content={
                "articles_saved": result['articles_saved'],
                "articles_skipped": result['articles_skipped'],
                "saved_articles": result['saved_articles'],
                "processing_date": timezone.now().isoformat()
            },
            date_generated=timezone.now(),
            digest_type=DigestType.DAILY,
            is_published=True
        )
        
        logger.info(f"Created digest with ID: {digest.id}")
        
        return {
            "status": "success",
            "digest_id": digest.id,
            "articles_processed": result['articles_saved'],
            "articles_skipped": result['articles_skipped'],
            "message": f"Successfully processed {result['articles_saved']} articles, skipped {result['articles_skipped']}"
        }
        
    except Exception as exc:
        logger.error(f"Error in news summarization task: {str(exc)}")
        # Retry the task
        raise self.retry(exc=exc)

@shared_task(bind=True)
def process_custom_articles(self, articles: List[Dict], skip_existing=False):
    """
    Task to process custom articles provided by the user or API.
    This uses the same NewsHandler logic but with custom article data.
    """
    try:
        logger.info(f"Starting custom article processing for {len(articles)} articles")
        
        # For custom articles, we'll need to adapt them to work with NewsHandler
        # or create a simplified version that directly stores them
        from .services import CurrentAffairsService
        from .models import CurrentAffair
        from base.choices import CurrentAffairCategory
        
        service = CurrentAffairsService()
        
        # Get AI analysis of the articles
        result = service.summarize_news(articles)
        
        if not result['success']:
            logger.error(f"Error analyzing custom articles: {result['error']}")
            return {
                "status": "error",
                "message": result['error'],
                "articles_processed": 0
            }
        
        # Process and save articles
        articles_saved = 0
        saved_articles = []
        
        for article_analysis in result['analysis']['article_analyses']:
            # Find matching original article
            original_article = None
            for article in articles:
                if article['title'] == article_analysis['headline']:
                    original_article = article
                    break
            
            if not original_article:
                logger.warning(f"Could not find original article for: {article_analysis['headline']}")
                continue
            
            # Skip if exists and skip_existing is True
            if skip_existing and CurrentAffair.objects.filter(title=original_article['title']).exists():
                logger.info(f"Skipping existing article: {original_article['title']}")
                continue
            
            # Save to database
            current_affair, created = CurrentAffair.objects.update_or_create(
                title=original_article['title'],
                defaults={
                    'date': timezone.now().date(),
                    'category': CurrentAffairCategory.MISCELLANEOUS.value,  # Default category
                    'summary': article_analysis['summary'],
                    'source': original_article.get('source', 'Custom'),
                    'potential_questions': article_analysis.get('potential_questions', []),
                    'tags': article_analysis.get('key_concepts', '').split(', '),
                    'importance': article_analysis['importance'],
                    'article_link': original_article.get('link', '')
                }
            )
            
            articles_saved += 1
            saved_articles.append({
                'id': current_affair.id,
                'title': current_affair.title,
                'category': current_affair.category,
                'action': "Created" if created else "Updated"
            })
            
            logger.info(f"{'Created' if created else 'Updated'} article: {current_affair.title}")
        
        return {
            "status": "success",
            "articles_processed": articles_saved,
            "saved_articles": saved_articles,
            "message": f"Successfully processed {articles_saved} custom articles"
        }
        
    except Exception as exc:
        logger.error(f"Error in custom article processing: {str(exc)}")
        return {
            "status": "error",
            "message": str(exc),
            "articles_processed": 0
        }

@shared_task(bind=True)
def cleanup_old_digests(self, days_to_keep: int = 30):
    """
    Task to clean up old current affairs digests.
    Keeps only the specified number of days worth of data.
    """
    try:
        logger.info(f"Starting cleanup of digests older than {days_to_keep} days")
        
        cutoff_date = timezone.now() - timezone.timedelta(days=days_to_keep)
        
        deleted_count, _ = CurrentAffairsDigest.objects.filter(
            date_generated__lt=cutoff_date
        ).delete()
        
        logger.info(f"Deleted {deleted_count} old digests")
        
        return {
            "status": "success",
            "deleted_count": deleted_count,
            "cutoff_date": cutoff_date.isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Error in cleanup task: {str(exc)}")
        return {
            "status": "error",
            "message": str(exc)
        }

@shared_task(bind=True)
def generate_weekly_digest(self):
    """
    Task to generate a weekly compilation of current affairs.
    """
    try:
        logger.info("Starting weekly digest generation")
        
        # Get all digests from the past week
        week_ago = timezone.now() - timezone.timedelta(days=7)
        weekly_digests = CurrentAffairsDigest.objects.filter(
            date_generated__gte=week_ago,
            is_published=True
        ).order_by('-date_generated')
        
        if not weekly_digests:
            logger.warning("No digests found for weekly compilation")
            return {"status": "no_data", "message": "No digests found for the past week"}
        
        # Compile weekly content
        weekly_content = {
            "title": f"Weekly UPSC Current Affairs Digest - {timezone.now().strftime('%Y-%m-%d')}",
            "period": f"{week_ago.strftime('%Y-%m-%d')} to {timezone.now().strftime('%Y-%m-%d')}",
            "daily_digests": [],
            "total_articles": 0
        }
        
        for digest in weekly_digests:
            weekly_content["daily_digests"].append({
                "date": digest.date_generated.strftime('%Y-%m-%d'),
                "title": digest.title,
                "content": digest.content
            })
            
            # Count articles if the content structure has this info
            if isinstance(digest.content, dict) and 'articles_processed' in digest.content:
                weekly_content["total_articles"] += digest.content.get('articles_processed', 0)
        
        # Create weekly digest entry
        weekly_digest = CurrentAffairsDigest.objects.create(
            title=weekly_content["title"],
            content=weekly_content,
            date_generated=timezone.now(),
            digest_type=DigestType.WEEKLY,
            is_published=True
        )
        
        logger.info(f"Successfully created weekly digest with ID: {weekly_digest.id}")
        
        return {
            "status": "success",
            "weekly_digest_id": weekly_digest.id,
            "daily_digests_included": len(weekly_digests),
            "total_articles": weekly_content["total_articles"]
        }
        
    except Exception as exc:
        logger.error(f"Error in weekly digest generation: {str(exc)}")
        raise self.retry(exc=exc)

@shared_task(bind=True)
def test_news_handler(self, max_articles=3):
    """
    Test task to verify NewsHandler is working correctly.
    Useful for debugging and testing the setup.
    """
    try:
        logger.info(f"Testing NewsHandler with {max_articles} articles")
        
        handler = NewsHandler()
        result = handler.fetch_and_store_articles(
            max_articles=max_articles,
            skip_existing=False
        )
        
        return {
            "status": "success" if result['success'] else "error",
            "message": f"Test completed. Saved: {result.get('articles_saved', 0)}, Skipped: {result.get('articles_skipped', 0)}",
            "result": result
        }
        
    except Exception as exc:
        logger.error(f"Error in test task: {str(exc)}")
        return {
            "status": "error",
            "message": str(exc)
        } 