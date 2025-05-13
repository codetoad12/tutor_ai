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
            f"Headline: {article['title']}\nSummary: {article['summary']}\nSource: {article.get('source', 'Unknown')}"
            for i, article in enumerate(articles)
        ])
        
        return f"""
        You are an expert UPSC tutor specializing in current affairs analysis. 
        Your task is to analyze the following news articles, rate their importance for UPSC exams, and provide a structured summary.
        
        For EACH news article, provide:
        1. An importance rating (High/Medium/Low) for UPSC preparation
        2. A concise summary (more detailed for high importance articles, brief for lower importance)
        
        Determine importance based on:
        - Constitutional, policy or governance significance
        - National security implications
        - International relations impact
        - Economic significance
        - Historical or cultural importance
        
        IMPORTANT GUIDELINES:
        - Do NOT include sensitive details about sexual abuse cases
        - Filter out inappropriate content while preserving educational value
        - Maintain a professional, educational tone suitable for UPSC students
        - STRICTLY FOLLOW the format provided below
        
        FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:
        
        ARTICLE ANALYSES:
        
        HEADLINE: [Copy the exact article headline]
        IMPORTANCE: [High/Medium/Low]
        SUMMARY: [Your concise summary]
        KEY CONCEPTS: [List 2-3 key concepts]
        
        HEADLINE: [Next article headline]
        IMPORTANCE: [High/Medium/Low]
        SUMMARY: [Your concise summary]
        KEY CONCEPTS: [List 2-3 key concepts]
        
        [Continue for each article...]
        
        SYLLABUS CONNECTION:
        [Brief explanation of how these news items connect to UPSC syllabus]
        
        POTENTIAL QUESTIONS:
        1. [Question 1]
        2. [Question 2]
        [Continue with numbered questions...]
        
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
            elif 'SYLLABUS CONNECTION' in stripped:
                if current_part:
                    parts[current_part] = buffer
                current_part = 'syllabus'
                buffer = []
            elif 'POTENTIAL QUESTIONS' in stripped:
                if current_part:
                    parts[current_part] = buffer
                current_part = 'questions'
                buffer = []
            elif current_part:
                buffer.append(line)
        
        # Add the last section
        if current_part and buffer:
            parts[current_part] = buffer
        
        # Process articles
        if 'articles' in parts:
            articles_text = '\n'.join(parts['articles'])
            
            # Split into individual articles - look for numbered or HEADLINE markers
            article_chunks = []
            current_chunk = []
            
            for line in parts['articles']:
                line_stripped = line.strip()
                
                # Check if this is a new article start
                is_new_article = False
                
                # Check for patterns like "1. Title" at the beginning of a line
                if line_stripped and line_stripped[0].isdigit() and '. ' in line_stripped[:5]:
                    is_new_article = True
                
                # Check for HEADLINE: marker
                if line_stripped.startswith('HEADLINE:'):
                    is_new_article = True
                
                if is_new_article and current_chunk:
                    article_chunks.append(current_chunk)
                    current_chunk = []
                
                current_chunk.append(line)
            
            # Add the last chunk
            if current_chunk:
                article_chunks.append(current_chunk)
            
            # Process each article chunk
            for chunk in article_chunks:
                article = {}
                current_field = None
                
                for line in chunk:
                    line_stripped = line.strip()
                    if not line_stripped:
                        continue
                    
                    # Extract headline
                    if line_stripped.startswith('HEADLINE:'):
                        article['headline'] = line_stripped[9:].strip()
                        current_field = 'headline'
                    # Extract from numbered format (e.g., "1. Title")
                    elif not article.get('headline') and line_stripped[0].isdigit() and '. ' in line_stripped[:5]:
                        article['headline'] = line_stripped[line_stripped.index('.')+1:].strip()
                        current_field = 'headline'
                    # Extract importance
                    elif line_stripped.startswith('IMPORTANCE:'):
                        article['importance'] = line_stripped[11:].strip()
                        current_field = 'importance'
                    # Direct importance values
                    elif not article.get('importance') and line_stripped.lower() in ['high', 'medium', 'low']:
                        article['importance'] = line_stripped
                        current_field = 'importance'
                    # Extract summary
                    elif line_stripped.startswith('SUMMARY:'):
                        article['summary'] = line_stripped[8:].strip()
                        current_field = 'summary'
                    # Extract key concepts
                    elif line_stripped.startswith('KEY CONCEPTS:'):
                        article['key_concepts'] = line_stripped[13:].strip()
                        current_field = 'key_concepts'
                    # Continuation of previous field
                    elif current_field in ['summary', 'key_concepts', 'headline'] and current_field in article:
                        article[current_field] += ' ' + line_stripped
                
                # Only add if we have the minimum required fields
                if article.get('headline'):
                    # Set defaults for missing fields
                    if not article.get('importance'):
                        article['importance'] = 'Medium'
                    if not article.get('summary'):
                        article['summary'] = 'No summary provided'
                    if not article.get('key_concepts'):
                        article['key_concepts'] = 'No key concepts provided'
                    
                    sections['article_analyses'].append(article)
        
        # Process syllabus connection
        if 'syllabus' in parts:
            sections['syllabus_connection'] = ' '.join([l.strip() for l in parts['syllabus'] if l.strip()])
        
        # Process questions - look for numbered format
        if 'questions' in parts:
            questions = []
            current_question = None
            
            for line in parts['questions']:
                line_stripped = line.strip()
                if not line_stripped:
                    continue
                
                # Check for new question (numbered format)
                if line_stripped[0].isdigit() and '. ' in line_stripped[:5]:
                    if current_question:
                        questions.append(current_question)
                    current_question = line_stripped[line_stripped.index('.')+1:].strip()
                # Continuation of current question
                elif current_question:
                    current_question += ' ' + line_stripped
            
            # Add the last question
            if current_question:
                questions.append(current_question)
            
            sections['potential_questions'] = questions
        
        return sections
    
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