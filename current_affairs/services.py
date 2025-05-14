from typing import List, Dict
from base.handlers.gemini_handler import GeminiHandler
import logging
import re

logger = logging.getLogger(__name__)

class CurrentAffairsService:
    def __init__(self):
        self.gemini = GeminiHandler()
        
    def _get_summary_prompt(self, articles: List[Dict]) -> str:
        """Generate the prompt for news summarization."""
        # Prepare the input text
        input_text = "\n\n".join([
            f"Headline: {article['title']}\nSummary: {article['summary']}\nSource: {article.get('source', 'Unknown')}\nURL: {article.get('link', '')}"
            for i, article in enumerate(articles)
        ])
        
        return f"""
        You are an expert UPSC tutor specializing in current affairs analysis. 
        Your task is to analyze the following news articles, rate their importance for UPSC exams, and provide a structured summary.
        
        For EACH news article, provide:
        1. An importance rating ONLY as a number from 1 to 5 (where 1 is lowest and 5 is highest) for UPSC preparation
        2. A concise summary (more detailed for high importance articles, brief for lower importance)
        3. Key concepts (2-3 main topics or themes)
        4. Syllabus connection (how this article connects to UPSC syllabus topics)
        5. 1-3 potential questions based on the article for UPSC preparation
        
        IMPORTANCE RATING GUIDELINES - BE CONSISTENT:
        Use these specific criteria to determine importance ratings (ONLY use numbers 1-5):
        - 5: Direct relevance to UPSC, covering major policy changes, constitutional amendments, landmark judgments, major international treaties/agreements, or groundbreaking scientific achievements with national impact
        - 4: Strong relevance to UPSC with significant impact on governance, economy, international relations, or security with medium-term implications
        - 3: Moderate relevance to UPSC, covering ongoing developments in policies, regular economic indicators, important environmental issues
        - 2: Limited relevance to UPSC, covering routine governmental activities or events with minimal long-term significance
        - 1: Minimal relevance to UPSC, covering local events, entertainment, or sports with negligible policy implications
        
        Additional factors to consider for importance:
        - Constitutional, policy or governance significance
        - National security implications
        - International relations impact
        - Economic significance
        - Historical or cultural importance
        - Direct mention in UPSC syllabus topics
        
        IMPORTANT GUIDELINES:
        - Do NOT include sensitive details about sexual abuse cases
        - Filter out inappropriate content while preserving educational value
        - Maintain a professional, educational tone suitable for UPSC students
        - Importance rating MUST ONLY be a number from 1 to 5 - DO NOT use any text descriptors like High/Medium/Low
        - For EVERY article analysis, make sure you include ALL fields (importance, summary, key concepts, syllabus connection, potential questions)
        - NEVER skip any fields in your analysis
        - All potential questions MUST be included ONLY under the "POTENTIAL QUESTIONS" section of each article, NOT as separate articles
        - NEVER format a potential question as a new article with its own HEADLINE section
        - BE CONSISTENT in your importance ratings based on the guidelines above
        
        FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:
        
        ARTICLE ANALYSES:
        
        HEADLINE: [Copy the exact article headline]
        IMPORTANCE: [Number from 1-5]
        SUMMARY: [Your concise summary]
        KEY CONCEPTS: [List 2-3 key concepts]
        SYLLABUS CONNECTION: [Brief explanation of how this news item connects to UPSC syllabus]
        POTENTIAL QUESTIONS: 
        1. [Question 1]
        2. [Question 2]
        3. [Question 3 for high importance articles]
        
        HEADLINE: [Next article headline]
        IMPORTANCE: [Number from 1-5]
        SUMMARY: [Your concise summary]
        KEY CONCEPTS: [List 2-3 key concepts]
        SYLLABUS CONNECTION: [Brief explanation of how this news item connects to UPSC syllabus]
        POTENTIAL QUESTIONS: 
        1. [Question 1]
        2. [Question 2]
        
        [Continue for each article...]
        
        Here are the news articles to analyze:
        
        {input_text}
        """
    
    def _parse_summary_response(self, response_text: str) -> Dict:
        """Parse the raw response into structured format."""
        logger.info(f"Raw response: {response_text[:100]}...")  # Log first part of response
        
        sections = {
            'article_analyses': [],
            'syllabus_connection': '',
            'potential_questions': []
        }
        
        # Split response into main sections using markers
        parts = {}
        current_part = None
        buffer = []
        
        # First split into main sections
        for line in response_text.split('\n'):
            stripped = line.strip()
            if 'ARTICLE ANALYSES' in stripped or 'ARTICLE ANALYSIS' in stripped:
                current_part = 'articles'
                buffer = []
            elif current_part:
                buffer.append(line)
        
        # Add the last section
        if current_part and buffer:
            parts[current_part] = buffer
        
        # Process articles
        if 'articles' in parts:
            # Split into individual articles - look for HEADLINE markers specifically
            article_chunks = []
            current_chunk = []
            is_in_article = False
            
            for line in parts['articles']:
                line_stripped = line.strip()
                
                # Only treat "HEADLINE:" as a definite new article marker
                if line_stripped.startswith('HEADLINE:'):
                    # If we were already processing an article, save it before starting new one
                    if is_in_article and current_chunk:
                        article_chunks.append(current_chunk)
                        current_chunk = []
                    is_in_article = True
                
                # Always add the current line to the current chunk
                current_chunk.append(line)
            
            # Add the last chunk
            if current_chunk:
                article_chunks.append(current_chunk)
            
            # Process each article chunk
            for chunk in article_chunks:
                article = {
                    'syllabus_connection': '',
                    'potential_questions': []
                }
                current_field = None
                in_questions_section = False
                
                for line in chunk:
                    line_stripped = line.strip()
                    if not line_stripped:
                        continue
                    
                    # Extract headline
                    if line_stripped.startswith('HEADLINE:'):
                        article['headline'] = line_stripped[9:].strip()
                        current_field = 'headline'
                        in_questions_section = False
                    # Extract importance
                    elif line_stripped.startswith('IMPORTANCE:'):
                        importance_value = line_stripped[11:].strip()
                        # Try to determine default importance based on context
                        estimated_default = self._estimate_importance_from_context(article)
                        # Consistently handle importance ratings
                        article['importance'] = self._normalize_importance_rating(importance_value, default_value=estimated_default)
                        current_field = 'importance'
                        in_questions_section = False
                    # Direct importance values (legacy)
                    elif not article.get('importance') and line_stripped.lower() in ['very low', 'low', 'medium', 'high', 'very high']:
                        importance_map = {
                            'very low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very high': 5
                        }
                        article['importance'] = importance_map.get(line_stripped.lower(), 3)
                        current_field = 'importance'
                        in_questions_section = False
                    # Extract summary
                    elif line_stripped.startswith('SUMMARY:'):
                        article['summary'] = line_stripped[8:].strip()
                        current_field = 'summary'
                        in_questions_section = False
                    # Extract key concepts
                    elif line_stripped.startswith('KEY CONCEPTS:'):
                        article['key_concepts'] = line_stripped[13:].strip()
                        current_field = 'key_concepts'
                        in_questions_section = False
                    # Extract syllabus connection
                    elif line_stripped.startswith('SYLLABUS CONNECTION:'):
                        article['syllabus_connection'] = line_stripped[20:].strip()
                        current_field = 'syllabus_connection'
                        in_questions_section = False
                    # Extract potential questions section
                    elif line_stripped.startswith('POTENTIAL QUESTIONS:'):
                        current_field = 'potential_questions'
                        in_questions_section = True
                    # Handle potential questions
                    elif in_questions_section and line_stripped[0].isdigit() and '. ' in line_stripped[:5]:
                        question = line_stripped[line_stripped.index('.')+1:].strip()
                        article['potential_questions'].append(question)
                    # Continuation of previous field
                    elif current_field in ['summary', 'key_concepts', 'headline', 'syllabus_connection'] and current_field in article:
                        article[current_field] += ' ' + line_stripped
                
                # Only add if we have the minimum required fields
                if article.get('headline'):
                    # Set importance if not already set
                    if not article.get('importance'):
                        estimated_default = self._estimate_importance_from_context(article)
                        article['importance'] = estimated_default if estimated_default is not None else 3
                    if not article.get('summary'):
                        article['summary'] = 'No summary provided'
                    if not article.get('key_concepts'):
                        article['key_concepts'] = 'No key concepts provided'
                    
                    sections['article_analyses'].append(article)
            
            # Collect all questions for backward compatibility
            all_questions = []
            for article in sections['article_analyses']:
                all_questions.extend(article.get('potential_questions', []))
            sections['potential_questions'] = all_questions
        
        return sections
        
    def _normalize_importance_rating(self, importance_value: str, default_value: int = None) -> int:
        """
        Normalize importance rating to ensure it's always an integer between 1-5.
        
        Args:
            importance_value: The raw importance value from the response
            default_value: Optional default value to use if parsing fails
            
        Returns:
            int: Normalized importance rating (1-5)
        """
        # First, try to parse as a digit
        if importance_value.isdigit():
            rating = int(importance_value)
            # Ensure rating is within valid range
            if 1 <= rating <= 5:
                return rating
            elif rating > 5:
                return 5  # Cap at 5
            elif rating < 1:
                return 1  # Minimum is 1
        
        # If the importance value contains a digit, extract and use that
        for char in importance_value:
            if char.isdigit():
                digit = int(char)
                if 1 <= digit <= 5:
                    return digit
        
        # If we have a default value provided, use that
        if default_value is not None and 1 <= default_value <= 5:
            logger.warning(f"Could not parse importance rating: '{importance_value}'. Using provided default: {default_value}")
            return default_value
        
        # No valid rating could be determined
        logger.error(f"Failed to parse importance rating: '{importance_value}'. No valid default provided.")
        
        # Use a conservative middle value as last resort
        # This is better than returning None or raising an exception in this context
        return 3
    
    def _estimate_importance_from_context(self, article: Dict) -> int:
        """
        Estimate the importance of an article based on its content and context.
        
        Args:
            article: Article dictionary with headline and other extracted fields
            
        Returns:
            int: Estimated importance (1-5) or None if cannot be determined
        """
        # Skip if we don't have enough information
        if not article.get('headline'):
            return None
            
        # Keywords that often indicate high importance
        high_importance_keywords = [
            'constitution', 'amendment', 'supreme court', 'landmark', 'major', 'breakthrough',
            'historic', 'significant', 'critical', 'crucial', 'unprecedented', 'revolutionary'
        ]
        
        # Keywords that often indicate medium importance
        medium_importance_keywords = [
            'policy', 'initiative', 'development', 'program', 'scheme', 'launch',
            'national', 'government', 'ministry', 'committee', 'commission'
        ]
        
        # Keywords that often indicate low importance
        low_importance_keywords = [
            'local', 'minor', 'routine', 'small', 'regular', 'entertainment',
            'sports', 'celebrity', 'festival', 'event'
        ]
        
        # Combine available text for analysis
        content = " ".join([
            article.get('headline', ''),
            article.get('summary', ''),
            article.get('key_concepts', ''),
            article.get('syllabus_connection', '')
        ]).lower()
        
        # Count keyword matches
        high_matches = sum(1 for keyword in high_importance_keywords if keyword.lower() in content)
        medium_matches = sum(1 for keyword in medium_importance_keywords if keyword.lower() in content)
        low_matches = sum(1 for keyword in low_importance_keywords if keyword.lower() in content)
        
        # Determine estimated importance
        if high_matches > medium_matches and high_matches > low_matches:
            return 4 if high_matches >= 3 else 3
        elif medium_matches > high_matches and medium_matches > low_matches:
            return 3
        elif low_matches > high_matches and low_matches > medium_matches:
            return 2 if low_matches >= 3 else 3
        
        # Default to None if no clear pattern
        return None
    
    def summarize_news(self, articles: List[Dict]) -> Dict:
        """
        Summarize news articles using Gemini, with importance ratings for each article.
        
        Args:
            articles (List[Dict]): List of article dictionaries with title and summary
            
        Returns:
            Dict: Structured analysis with importance ratings and key points for each article,
                  or error message
        """
        try:
            # Generate the prompt
            prompt = self._get_summary_prompt(articles)
            
            # Get response from Gemini
            response = self.gemini.generate_response(
                prompt=prompt,
                max_tokens=1500,  # Increased token limit for detailed article analysis
                temperature=0.7
            )
            
            if not response['success']:
                return {
                    'success': False,
                    'error': response['error']
                }
            
            # Parse the response
            analysis = self._parse_summary_response(response['response'])
            
            return {
                'success': True,
                'analysis': analysis
            }
            
        except Exception as e:
            logger.error(f"Error in news summarization: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            } 