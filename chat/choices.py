from enum import Enum

class MessageType(Enum):
    USER_QUERY = "user_query"
    AI_RESPONSE = "ai_response"
    SYSTEM_MESSAGE = "system_message"
    ERROR_MESSAGE = "error_message"

class SessionStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    ENDED = "ended"
    EXPIRED = "expired"

class QueryCategory(Enum):
    GENERAL = "general"
    SUBJECT_SPECIFIC = "subject_specific"
    CURRENT_AFFAIRS = "current_affairs"
    EXAM_STRATEGY = "exam_strategy"
    PREVIOUS_YEAR = "previous_year"

class ExamType(Enum):
    UPSC_CSE = "upsc_cse"
    UPSC_CDS = "upsc_cds"
    UPSC_CAPF = "upsc_capf"
    UPSC_IES = "upsc_ies"
    UPSC_IFS = "upsc_ifs"
    UPSC_NDA = "upsc_nda"
    STATE_PSC = "state_psc"
    OTHER = "other"

class SubjectType(Enum):
    # UPSC CSE Subjects
    HISTORY = "history"
    GEOGRAPHY = "geography"
    POLITY = "polity"
    ECONOMICS = "economics"
    SCIENCE = "science"
    ENVIRONMENT = "environment"
    ETHICS = "ethics"
    ESSAY = "essay"
    CSAT = "csat"
    
    # General Subjects
    MATHEMATICS = "mathematics"
    ENGLISH = "english"
    HINDI = "hindi"
    REASONING = "reasoning"
    CURRENT_AFFAIRS = "current_affairs"
    
    # Other
    GENERAL = "general"
    OTHER = "other"

class ResponseType(Enum):
    TEXT = "text"
    CODE = "code"
    TABLE = "table"
    LIST = "list"
    DIAGRAM = "diagram"
    MULTIMEDIA = "multimedia"
    MIXED = "mixed"

class UserFeedback(Enum):
    HELPFUL = "helpful"
    NOT_HELPFUL = "not_helpful"
    PARTIALLY_HELPFUL = "partially_helpful"
    NEEDS_IMPROVEMENT = "needs_improvement"
    NO_FEEDBACK = "no_feedback" 