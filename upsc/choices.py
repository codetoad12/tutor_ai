from enum import Enum

class SubjectCategory(Enum):
    GENERAL_STUDIES = "general_studies"
    OPTIONAL = "optional"
    ETHICS = "ethics"
    ESSAY = "essay"
    CURRENT_AFFAIRS = "current_affairs"

class QuestionType(Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    TRUE_FALSE = "true_false"
    MATCHING = "matching"

class DifficultyLevel(Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert" 