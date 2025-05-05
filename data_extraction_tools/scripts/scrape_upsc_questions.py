import os
import sys
import csv
import requests
import logging
import pandas as pd
import django
from bs4 import BeautifulSoup
from pathlib import Path

# Add the project root directory to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# Set up Django environment (needed if this script will interact with Django models)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TUTOR_AI.settings')
django.setup()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class UPSCQuestionScraper:
    """
    Scraper for UPSC questions from various sources
    """
    def __init__(self):
        self.questions = []
        self.sources = {
            # Add your source URLs here
            "upsc_prelims_2014": "https://www.examrace.com/UPSC/IAS-Prelims/UPSC-Prelims-Previous-Years-Papers/",
            # Add more sources as needed
        }
    
    def scrape_all_sources(self):
        """Scrape questions from all sources"""
        for source_name, url in self.sources.items():
            logging.info(f"Scraping source: {source_name}")
            try:
                if "upsc_prelims" in source_name:
                    self._scrape_upsc_prelims(source_name, url)
                # Add more scraping methods for different sources
            except Exception as e:
                logging.error(f"Error scraping {source_name}: {str(e)}")
    
    def _scrape_upsc_prelims(self, source_name, url):
        """Scrape UPSC Prelims questions"""
        try:
            response = requests.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # This is a placeholder - you'll need to customize this based on the actual HTML structure
            questions_container = soup.find('div', class_='questions-container')
            
            if not questions_container:
                logging.warning(f"No questions container found for {source_name}")
                return
            
            question_elements = questions_container.find_all('div', class_='question')
            
            for element in question_elements:
                # Extract data based on the HTML structure
                year = element.find('span', class_='year').text.strip()
                exam_type = "Prelims"  # or extract from element
                paper = "GS1"  # or extract from element
                question_text = element.find('div', class_='question-text').text.strip()
                
                self.questions.append({
                    'year': year,
                    'exam_type': exam_type,
                    'paper': paper,
                    'question_text': question_text
                })
                
            logging.info(f"Scraped {len(question_elements)} questions from {source_name}")
            
        except Exception as e:
            logging.error(f"Error in _scrape_upsc_prelims for {source_name}: {str(e)}")
    
    def save_to_csv(self, filename: str = 'historic_questions.csv') -> None:
        """Save scraped questions to a CSV file."""
        df = pd.DataFrame(self.questions)
        df.to_csv(filename, index=False)
        logging.info(f"Saved {len(self.questions)} questions to {filename}")

def main():
    """Main function to run the scraper"""
    output_file = 'historic_questions.csv'
    
    # Allow custom output file from command line
    if len(sys.argv) > 1:
        output_file = sys.argv[1]
    
    scraper = UPSCQuestionScraper()
    scraper.scrape_all_sources()
    scraper.save_to_csv(output_file)
    
    logging.info("Scraping completed successfully")

if __name__ == "__main__":
    main() 