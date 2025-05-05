import os
import csv
import django
import sys
from pathlib import Path

# Add the project root directory to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TUTOR_AI.settings')
django.setup()

from prediction_engine.models import HistoricQuestion
from prediction_engine.choices import ExamType, Category

def import_questions_from_csv(csv_file):
    """
    Import historic questions from CSV file into the database.
    Expected CSV format: year,exam_type,paper,question_text
    """
    print(f"Starting import from {csv_file}...")
    
    # Initialize counters
    total_questions = 0
    imported_questions = 0
    skipped_questions = 0
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            total_questions += 1
            
            # Skip rows with incomplete data
            if not all(field in row and row[field] for field in ['year', 'exam_type', 'question_text']):
                skipped_questions += 1
                continue
            
            # Map exam_type from CSV to ExamType enum
            exam_type_value = None
            csv_exam_type = row['exam_type'].upper()
            
            if 'PRELIMS' in csv_exam_type:
                exam_type_value = ExamType.UPSC_PRELIMS
            elif 'MAINS' in csv_exam_type:
                exam_type_value = ExamType.UPSC_MAINS
            else:
                exam_type_value = ExamType.OTHER
            
            # Determine category (default to OTHER)
            # This is a simplified approach - you might want to implement more sophisticated
            # logic to categorize questions based on keywords in the question text
            category_value = Category.OTHER
            
            # Basic category detection based on keywords in question text
            question_text = row['question_text']
            
            if any(keyword in question_text.lower() for keyword in ['constitution', 'parliament', 'governance', 'president', 'democracy']):
                category_value = Category.POLITY
            elif any(keyword in question_text.lower() for keyword in ['economy', 'economic', 'gdp', 'fiscal', 'monetary', 'finance']):
                category_value = Category.ECONOMY
            elif any(keyword in question_text.lower() for keyword in ['history', 'historical', 'ancient', 'medieval', 'modern', 'freedom']):
                category_value = Category.HISTORY
            elif any(keyword in question_text.lower() for keyword in ['geography', 'river', 'mountain', 'climate', 'soil', 'plateau', 'ocean']):
                category_value = Category.GEOGRAPHY
            elif any(keyword in question_text.lower() for keyword in ['science', 'technology', 'biology', 'physics', 'chemistry']):
                category_value = Category.SCIENCE
            elif any(keyword in question_text.lower() for keyword in ['environment', 'ecology', 'ecosystem', 'pollution', 'biodiversity']):
                category_value = Category.ENVIRONMENT
            elif any(keyword in question_text.lower() for keyword in ['international', 'foreign', 'bilateral', 'multilateral', 'treaty']):
                category_value = Category.INTERNATIONAL
            
            try:
                # Create and save the question
                question = HistoricQuestion(
                    year=int(row['year']),
                    exam_type=exam_type_value,
                    question_text=row['question_text'],
                    category=category_value,
                    # Default values for other fields
                    is_current_affairs=False,
                    source_event=None
                )
                question.save()
                imported_questions += 1
                
                # Print progress every 100 questions
                if imported_questions % 100 == 0:
                    print(f"Imported {imported_questions} questions so far...")
                    
            except Exception as e:
                print(f"Error importing question: {row['question_text'][:50]}... - {str(e)}")
                skipped_questions += 1
    
    print(f"Import completed!")
    print(f"Total questions in CSV: {total_questions}")
    print(f"Questions imported: {imported_questions}")
    print(f"Questions skipped: {skipped_questions}")

if __name__ == '__main__':
    # Default CSV file in the project root
    csv_file = os.path.join(BASE_DIR, 'historic_questions.csv')
    
    # Allow custom file path from command line
    if len(sys.argv) > 1:
        csv_file = sys.argv[1]
    
    import_questions_from_csv(csv_file) 