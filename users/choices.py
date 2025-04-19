from enum import Enum

class UserStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

class UserRole(Enum):
    STUDENT = "student"
    TUTOR = "tutor"
    ADMIN = "admin"
    MODERATOR = "moderator" 