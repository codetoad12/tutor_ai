from datetime import datetime
from django.utils import timezone
from current_affairs.models import CurrentAffair
from current_affairs.services import CurrentAffairsService
from current_affairs.utils import fetch_headlines
from base.choices import CurrentAffairCategory
import logging
from typing import Dict, List, Tuple, Optional

logger = logging.getLogger(__name__)

class NewsHandler:
    """
    Handler for processing news articles and storing them in the database.
    This can be used both by management commands and views.
    """
    
    def __init__(self):
        self.service = CurrentAffairsService()
    
    def fetch_and_store_articles(self, max_articles=5, skip_existing=False):
        """
        Fetch news articles, get AI analysis, and store them in the database
        
        Args:
            max_articles (int): Maximum number of articles to fetch from each feed
            skip_existing (bool): Whether to skip articles that already exist
            
        Returns:
            dict: Summary of the operation with counts and status
        """
        logger.info(f"Fetching up to {max_articles} articles per feed")
        
        # Fetch headlines and get AI analysis
        fetch_result = self._fetch_and_analyze_articles(max_articles)
        if not fetch_result['success']:
            return fetch_result
            
        # Process articles and store in database
        articles = fetch_result['articles']
        analysis = fetch_result['analysis']
        
        return self._process_and_store_articles(
            articles=articles,
            article_analyses=analysis['article_analyses'],
            skip_existing=skip_existing
        )
    
    def _fetch_and_analyze_articles(self, max_articles: int) -> Dict:
        """
        Fetch articles from feeds and get AI analysis
        
        Args:
            max_articles: Maximum number of articles to fetch from each feed
            
        Returns:
            Dict with success status, articles data and analysis
        """
        # Fetch headlines
        articles = fetch_headlines(max_articles=max_articles)
        
        if not articles:
            logger.error("No articles found")
            return {
                'success': False,
                'error': 'No articles found',
                'articles_saved': 0,
                'articles_skipped': 0
            }
            
        logger.info(f"Found {len(articles)} articles")
        
        # Get AI analysis of the articles
        result = self.service.summarize_news(articles)
        
        if not result['success']:
            logger.error(f"Error summarizing news: {result['error']}")
            return {
                'success': False,
                'error': result['error'],
                'articles_saved': 0,
                'articles_skipped': 0
            }
        
        return {
            'success': True,
            'articles': articles,
            'analysis': result['analysis']
        }
    
    def _process_and_store_articles(
        self, 
        articles: List[Dict],
        article_analyses: List[Dict],
        skip_existing: bool
    ) -> Dict:
        """
        Process articles and store them in the database
        
        Args:
            articles: List of raw article data
            article_analyses: List of analyzed articles with importance and key concepts
            skip_existing: Whether to skip existing articles
            
        Returns:
            Dict with operation summary and results
        """
        articles_saved = 0
        articles_skipped = 0
        saved_articles = []
        
        for article_analysis in article_analyses:
            # Find and match the original article
            original_article = self._find_matching_article(articles, article_analysis)
            
            if not original_article:
                logger.warning(f"Could not find original article for: {article_analysis['headline']}")
                continue
            
            # Skip if article already exists and skip_existing is True
            if skip_existing and CurrentAffair.objects.filter(title=original_article['title']).exists():
                logger.info(f"Skipping existing article: {original_article['title']}")
                articles_skipped += 1
                continue
            
            # Save the article to database
            current_affair, action = self._save_article_to_db(
                original_article=original_article,
                article_analysis=article_analysis
            )
            
            articles_saved += 1
            saved_articles.append({
                'id': current_affair.id,
                'title': current_affair.title,
                'category': current_affair.category,
                'action': action
            })
            
            logger.info(f"{action} article: {current_affair.title} ({current_affair.category})")
        
        # Return summary
        return {
            'success': True,
            'articles_saved': articles_saved,
            'articles_skipped': articles_skipped,
            'saved_articles': saved_articles,
        }
    
    def _find_matching_article(self, articles: List[Dict], article_analysis: Dict) -> Optional[Dict]:
        """
        Find the matching original article for an analyzed article
        
        Args:
            articles: List of raw article data
            article_analysis: Analyzed article data
            
        Returns:
            The matching original article or None if not found
        """
        # Try exact match first
        for article in articles:
            if article['title'] == article_analysis['headline']:
                return article
        
        # Try fuzzy matching if exact match not found
        for article in articles:
            if article_analysis['headline'] in article['title'] or article['title'] in article_analysis['headline']:
                return article
        
        return None
    
    def _save_article_to_db(
        self,
        original_article: Dict, 
        article_analysis: Dict
    ) -> Tuple[CurrentAffair, str]:
        """
        Save an article to the database
        
        Args:
            original_article: Original article data
            article_analysis: Analyzed article data
            
        Returns:
            Tuple of (CurrentAffair object, action taken)
        """
        # Determine category based on key concepts
        category = self._determine_category(article_analysis)
        
        # Parse date from the article if available
        article_date = timezone.now().date()
        if original_article.get('published_parsed'):
            try:
                article_date = datetime(*original_article['published_parsed'][:6]).date()
            except (ValueError, TypeError):
                pass
        
        # Create or update the current affair
        current_affair, created = CurrentAffair.objects.update_or_create(
            title=original_article['title'],
            defaults={
                'date': article_date,
                'category': category,
                'summary': article_analysis['summary'],
                'source': original_article.get('source', 'Unknown'),
                'potential_questions': article_analysis.get('potential_questions', []),
                'ai_insights': article_analysis['key_concepts'],
                'tags': article_analysis.get('key_concepts', '').split(', '),
                'importance': article_analysis['importance'],
                'article_link': original_article.get('article_link') or original_article.get('link', '')
            }
        )
        
        action = "Created" if created else "Updated"
        return current_affair, action
    
    def _determine_category(self, article_analysis):
        """Determine the best category for an article based on key concepts"""
        # Default category
        default_category = CurrentAffairCategory.MISCELLANEOUS.value
        
        # Dictionary mapping keywords to categories
        category_keywords = {
            CurrentAffairCategory.POLITY.value: ['constitution', 'democracy', 'governance', 'parliament', 'polity', 'law', 'supreme court', 'election'],
            CurrentAffairCategory.ECONOMY.value: ['economy', 'economic', 'finance', 'fiscal', 'budget', 'inflation', 'taxation', 'gdp', 'growth'],
            CurrentAffairCategory.INTERNATIONAL_RELATIONS.value: ['international', 'diplomacy', 'bilateral', 'foreign', 'global', 'relation', 'treaty', 'un', 'united nations'],
            CurrentAffairCategory.ENVIRONMENT.value: ['environment', 'climate', 'pollution', 'ecosystem', 'biodiversity', 'conservation', 'sustainable'],
            CurrentAffairCategory.SCIENCE_TECHNOLOGY.value: ['science', 'technology', 'innovation', 'research', 'digital', 'space', 'missile', 'satellite', 'tech'],
            CurrentAffairCategory.SOCIAL_ISSUES.value: ['social', 'welfare', 'education', 'health', 'gender', 'poverty', 'equality', 'community'],
            CurrentAffairCategory.SECURITY.value: ['security', 'defense', 'military', 'terrorism', 'cyber', 'army', 'border', 'forces', 'war', 'conflict'],
        }
        
        # Use syllabus connection if available, otherwise use headline and key concepts
        if article_analysis.get('syllabus_connection'):
            key_text = f"{article_analysis['headline']} {article_analysis['key_concepts']} {article_analysis['syllabus_connection']}".lower()
        else:
            key_text = f"{article_analysis['headline']} {article_analysis['key_concepts']}".lower()
        
        best_match = None
        best_match_count = 0
        
        for category, keywords in category_keywords.items():
            match_count = sum(1 for keyword in keywords if keyword.lower() in key_text)
            if match_count > best_match_count:
                best_match = category
                best_match_count = match_count
        
        return best_match or default_category 