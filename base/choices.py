from enum import Enum

class UserType(Enum):
    STUDENT = "student"
    TUTOR = "tutor"
    ADMIN = "admin"

class DifficultyLevel(Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class ContentType(Enum):
    TEXT = "text"
    VIDEO = "video"
    AUDIO = "audio"
    PDF = "pdf"
    QUIZ = "quiz"

class CurrentAffairCategory(Enum):
    POLITY = "Polity"
    ECONOMY = "Economy"
    INTERNATIONAL_RELATIONS = "International Relations"
    ENVIRONMENT = "Environment"
    SCIENCE_TECHNOLOGY = "Science & Technology"
    SOCIAL_ISSUES = "Social Issues"
    SECURITY = "Security"
    MISCELLANEOUS = "Miscellaneous" 