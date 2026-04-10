# TUTOR_AI

A Django-based AI tutoring platform for UPSC aspirants and general purpose tutoring.
AI tutoring platform built with Django and Gemini API. Students can chat with an AI tutor, 
get content summarized, track goal-based progress, and practice UPSC questions. 
Background jobs handled via Celery for async processing.

## Features

- Custom user model with roles (student, tutor, admin)
- UPSC-specific content organization
- Study materials and practice questions
- AI-powered tutoring capabilities

## Project Structure

- **base**: Common models and fields
- **users**: User management
- **upsc**: UPSC-specific content and functionality

## Setup

1. Clone the repository
   ```
   git clone https://github.com/codetoad12/tutor_ai.git
   cd tutor_ai
   ```

2. Create and activate a virtual environment
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Run migrations
   ```
   python manage.py migrate
   ```

5. Create a superuser
   ```
   python manage.py createsuperuser
   ```

6. Run the development server
   ```
   python manage.py runserver
   ```

## License

MIT 
