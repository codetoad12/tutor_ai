from typing import List, Dict
from base.handlers.gemini_handler import GeminiHandler
import logging

logger = logging.getLogger(__name__)

class CurrentAffairsService:
    def __init__(self):
        self.gemini = GeminiHandler()
        
    def _get_summary_prompt(self, articles: List[Dict]) -> str:
        """Generate the prompt for news summarization."""
        # Prepare the input text
        input_text = "\n\n".join([
            f"Article {i+1}:\nTitle: {article['title']}\nSummary: {article['summary']}"
            for i, article in enumerate(articles)
        ])
        
        return f"""
        You are an expert UPSC tutor specializing in current affairs analysis. 
        Your task is to analyze the following news articles and provide:
        1. A concise summary (max 150 words)
        2. Key concepts and terms relevant for UPSC preparation
        3. How this news connects to UPSC syllabus topics
        4. Potential questions that could be asked in UPSC exams
        
        Format your response as follows:
        SUMMARY:
        [Your summary here]
        
        KEY CONCEPTS:
        - [Concept 1]
        - [Concept 2]
        ...
        
        SYLLABUS CONNECTION:
        [Explain how this connects to UPSC syllabus]
        
        POTENTIAL QUESTIONS:
        1. [Question 1]
        2. [Question 2]
        ...
        
        Here are the news articles to analyze:
        
        {input_text}
        """
    
    def _parse_summary_response(self, response_text: str) -> Dict:
        """Parse the raw response into structured format."""
        sections = {
            'summary': '',
            'key_concepts': [],
            'syllabus_connection': '',
            'potential_questions': []
        }
        
        current_section = None
        for line in response_text.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            if line.startswith('SUMMARY:'):
                current_section = 'summary'
            elif line.startswith('KEY CONCEPTS:'):
                current_section = 'key_concepts'
            elif line.startswith('SYLLABUS CONNECTION:'):
                current_section = 'syllabus_connection'
            elif line.startswith('POTENTIAL QUESTIONS:'):
                current_section = 'potential_questions'
            else:
                if current_section == 'summary':
                    sections['summary'] += line + ' '
                elif current_section == 'key_concepts' and line.startswith('-'):
                    sections['key_concepts'].append(line[1:].strip())
                elif current_section == 'syllabus_connection':
                    sections['syllabus_connection'] += line + ' '
                elif current_section == 'potential_questions' and line[0].isdigit():
                    sections['potential_questions'].append(line[2:].strip())
        
        # Clean up the summary
        sections['summary'] = sections['summary'].strip()
        sections['syllabus_connection'] = sections['syllabus_connection'].strip()
        
        return sections
    
    def summarize_news(self, articles: List[Dict]) -> Dict:
        """
        Summarize news articles using Gemini.
        
        Args:
            articles (List[Dict]): List of article dictionaries with title and summary
            
        Returns:
            Dict: Structured summary with key points or error message
        """
        try:
            # Generate the prompt
            prompt = self._get_summary_prompt(articles)
            
            # Get response from Gemini
            response = self.gemini.generate_response(
                prompt=prompt,
                max_tokens=1000,
                temperature=0.7
            )
            
            if not response['success']:
                return {
                    'success': False,
                    'error': response['error']
                }
            
            # Parse the response
            summary = self._parse_summary_response(response['response'])
            
            return {
                'success': True,
                'summary': summary
            }
            
        except Exception as e:
            logger.error(f"Error in news summarization: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            } 