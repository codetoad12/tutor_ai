import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import logging
from typing import List, Dict
import re
import io
from PyPDF2 import PdfReader
import google.generativeai as genai
import os
from dotenv import load_dotenv
import tempfile

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraping.log'),
        logging.StreamHandler()
    ]
)

# Configure Gemini
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-2.0-flash')

class UPSCQuestionScraper:
    def __init__(self):
        self.base_url = "https://www.clearias.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.questions = []
        
        # Create directory for saving PDFs if it doesn't exist
        os.makedirs('downloaded_pdfs', exist_ok=True)

    def construct_urls(self, year: int) -> Dict[str, str]:
        """Construct URLs for different papers for a given year."""
        return {
            'prelims_gs1': f"{self.base_url}/up/upsc-cse-{year}-gs-paper-1.pdf",
            'prelims_gs2': f"{self.base_url}/up/upsc-cse-{year}-gs-paper-2.pdf",
            'mains_gs1': f"{self.base_url}/up/upsc-cse-mains-{year}-gs-1.pdf",
            'mains_gs2': f"{self.base_url}/up/upsc-cse-mains-{year}-gs-2.pdf"
        }

    def download_pdf(self, url: str, paper_type: str, year: int) -> str:
        """Download PDF and save to local file, return the path to saved file."""
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            # Create filename and path
            filename = f"upsc_{year}_{paper_type}.pdf"
            filepath = os.path.join('downloaded_pdfs', filename)
            
            # Save PDF to file
            with open(filepath, 'wb') as f:
                f.write(response.content)
                
            logging.info(f"Downloaded PDF: {filepath}")
            return filepath
        except Exception as e:
            logging.error(f"Error downloading PDF from {url}: {str(e)}")
            return None

    def process_pdf_with_gemini(self, pdf_path: str) -> List[str]:
        """Process PDF file using Gemini Vision."""
        questions = []
        
        try:
            # Read the PDF file
            with open(pdf_path, 'rb') as f:
                pdf_content = f.read()
            
            # Prepare the prompt for Gemini
            prompt = """Please analyze this UPSC exam PDF and extract all questions. 
            For each question:
            1. Extract the complete question text
            2. Remove any Hindi text or random symbols
            3. Format each question on a new line
            4. Include the question number if present
            5. Preserve any multiple choice options if present
            
            Return only the questions, one per line."""

            # Process the PDF with Gemini
            response = model.generate_content([prompt, {"mime_type": "application/pdf", "data": pdf_content}])
            
            if response.text:
                # Split the response into individual questions
                raw_questions = response.text.split('\n')
                questions = [q.strip() for q in raw_questions if q.strip()]
                logging.info(f"Extracted {len(questions)} questions from {pdf_path}")
            
        except Exception as e:
            logging.error(f"Error processing PDF with Gemini: {str(e)}")
            # Fallback to basic text extraction if Gemini fails
            questions = self.extract_questions_from_pdf_fallback(pdf_path)
        
        return questions

    def extract_questions_from_html(self, soup: BeautifulSoup) -> List[str]:
        """Extract questions from HTML content."""
        questions = []
        
        # Look for questions in <p> tags
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = self.clean_text(p.get_text())
            if text and len(text) > 20:  # Basic filter to avoid non-question content
                questions.append(text)
        
        # Look for questions in <ol> and <li> tags
        lists = soup.find_all(['ol', 'li'])
        for item in lists:
            text = self.clean_text(item.get_text())
            if text and len(text) > 20:
                questions.append(text)
        
        return questions

    def extract_questions_from_pdf_fallback(self, pdf_path: str) -> List[str]:
        """Extract questions from PDF content as fallback method."""
        questions = []
        text = ""
        
        try:
            # Read the PDF
            pdf = PdfReader(pdf_path)
            
            # Extract text from all pages
            for page in pdf.pages:
                text += page.extract_text()
            
            # Split text into lines and process
            lines = text.split('\n')
            current_question = ""
            
            for line in lines:
                line = self.clean_text(line)
                if not line:
                    continue
                    
                # Look for question numbers (e.g., "1.", "2.", etc.)
                if re.match(r'^\d+\.', line):
                    if current_question:
                        questions.append(current_question.strip())
                    current_question = line
                else:
                    current_question += " " + line
            
            # Add the last question if exists
            if current_question:
                questions.append(current_question.strip())
                
            logging.info(f"Fallback extraction: found {len(questions)} questions in {pdf_path}")
            
        except Exception as e:
            logging.error(f"Error in fallback extraction: {str(e)}")
            
        return questions

    def clean_text(self, text: str) -> str:
        """Clean question text by removing extra whitespace, Hindi text, and unwanted characters."""
        # Remove Hindi characters and symbols (Unicode range for Devanagari)
        text = re.sub(r'[\u0900-\u097F]', '', text)
        
        # Remove other unwanted symbols and special characters
        text = re.sub(r'[^\w\s.,?()\[\]{}:;\'"-]', '', text)
        
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        # Remove any remaining HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        return text

    def scrape_year(self, year: int) -> None:
        """Scrape questions for a specific year."""
        urls = self.construct_urls(year)
        
        for paper_type, url in urls.items():
            logging.info(f"Processing {paper_type} for year {year}")
            
            # Download PDF
            pdf_path = self.download_pdf(url, paper_type, year)
            if not pdf_path:
                logging.warning(f"Failed to download PDF for {year} {paper_type}")
                continue
                
            # Process PDF with Gemini
            questions = self.process_pdf_with_gemini(pdf_path)
            
            # Add questions to the list
            for question in questions:
                self.questions.append({
                    'year': year,
                    'exam_type': 'Prelims' if 'prelims' in paper_type else 'Mains',
                    'paper': 'GS1' if paper_type.endswith('gs1') else 'GS2',
                    'question_text': question
                })

    def save_to_csv(self, filename: str = 'historic_questions.csv') -> None:
        """Save scraped questions to a CSV file."""
        df = pd.DataFrame(self.questions)
        df.to_csv(filename, index=False)
        logging.info(f"Saved {len(self.questions)} questions to {filename}")

def main():
    scraper = UPSCQuestionScraper()
    
    # Test with 2023 first
    logging.info("Starting test scrape for 2023")
    scraper.scrape_year(2023)
    scraper.save_to_csv('test_questions_2023.csv')
    
    # If test successful, scrape all years
    if scraper.questions:
        logging.info("Test successful. Starting full scrape...")
        scraper.questions = []  # Reset questions list
        
        for year in range(2014, 2025):
            scraper.scrape_year(year)
            time.sleep(2)  # Be nice to the server
        
        scraper.save_to_csv('historic_questions.csv')
    else:
        logging.error("Test scrape failed. Check logs for details.")

if __name__ == "__main__":
    main() 