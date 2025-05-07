import feedparser
from datetime import datetime
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

# RSS Feed URLs
RSS_FEEDS = {
    'The Hindu': 'https://www.thehindu.com/news/national/feeder/default.rss',
    'Indian Express': 'https://indianexpress.com/section/india/feed/',
    'PIB': 'https://pib.gov.in/RssMain.aspx?ModId=1&Lang=1&Regid=0'
}

def clean_text(text: str) -> str:
    """Clean and normalize text content."""
    if not text:
        return ""
    # Remove HTML tags, extra whitespace, and normalize
    text = ' '.join(text.split())
    return text.strip()

def fetch_headlines(max_articles: int = 5) -> List[Dict]:
    """
    Fetch headlines from multiple RSS feeds.
    
    Args:
        max_articles (int): Maximum number of articles to fetch from each feed
        
    Returns:
        List[Dict]: List of article dictionaries with title, link, and summary
    """
    all_articles = []
    
    for source, url in RSS_FEEDS.items():
        try:
            # Parse the RSS feed
            feed = feedparser.parse(url)
            
            # Check if feed was parsed successfully
            if feed.bozo:
                logger.warning(f"Error parsing feed {source}: {feed.bozo_exception}")
                continue
                
            # Process each entry
            for entry in feed.entries[:max_articles]:
                article = {
                    'title': clean_text(entry.get('title', '')),
                    'link': entry.get('link', ''),
                    'summary': clean_text(entry.get('summary', '')),
                    'source': source,
                    'published': entry.get('published', ''),
                    'published_parsed': entry.get('published_parsed', None)
                }
                all_articles.append(article)
                
        except Exception as e:
            logger.error(f"Error fetching feed {source}: {str(e)}")
            continue
            
    # Sort articles by published date if available
    all_articles.sort(
        key=lambda x: datetime.fromtimestamp(x['published_parsed'][0]) if x['published_parsed'] else datetime.min,
        reverse=True
    )
    
    return all_articles

def get_article_categories(article: Dict) -> List[str]:
    """
    Extract categories/tags from an article.
    
    Args:
        article (Dict): Article dictionary
        
    Returns:
        List[str]: List of categories/tags
    """
    categories = []
    
    # Add source as a category
    categories.append(article['source'])
    
    # Add any additional categories from the feed
    if 'tags' in article:
        categories.extend([tag.term for tag in article['tags']])
        
    return list(set(categories))  # Remove duplicates 