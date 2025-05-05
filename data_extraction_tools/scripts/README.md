# Data Extraction Tools Scripts

This directory contains scripts for data extraction and importing into the database.

## Available Scripts

### 1. UPSC Question Scraper (`scrape_upsc_questions.py`)

This script scrapes UPSC questions from various online sources and saves them to a CSV file.

**Usage:**
```bash
python scrape_upsc_questions.py [output_file.csv]
```

**Output:**
- If no output file is specified, it will save to `historic_questions.csv` in the current directory.

**Requirements:**
- BeautifulSoup4
- Requests
- Pandas

### 2. Historic Questions Importer (`import_historic_questions.py`)

This script imports historic UPSC questions from a CSV file into the database.

**Usage:**
```bash
python import_historic_questions.py [input_file.csv]
```

**Input CSV Format:**
- The CSV file should have the following columns:
  - `year`: The year of the exam
  - `exam_type`: The type of exam (e.g., "Prelims", "Mains")
  - `paper`: The paper designation (e.g., "GS1", "GS2")
  - `question_text`: The text of the question

**Features:**
- Automatically maps exam types to the appropriate enum values
- Attempts to categorize questions based on keywords in the question text
- Provides progress updates during import
- Reports statistics on successful imports and skipped questions

## Running from Django Management Commands

For convenience, these scripts are also available as Django management commands:

```bash
# To scrape questions
python manage.py scrape_upsc_questions [output_file.csv]

# To import questions
python manage.py import_historic_questions [input_file.csv]
```

## Notes

- The scraper is configured with a set of source URLs. You may need to update these URLs or add new ones as needed.
- The categorization logic in the importer uses a simple keyword-based approach. You may want to enhance this with more sophisticated NLP techniques for better accuracy. 