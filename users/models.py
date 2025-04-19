from django.contrib.auth.models import AbstractUser
from django.db import models
from base.models import BaseModel
from base.fields import ChoicesField
from .choices import UserStatus, UserRole

class CustomUser(AbstractUser, BaseModel):
    # Additional fields for the user
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    status = ChoicesField(UserStatus, default=UserStatus.PENDING)
    role = ChoicesField(UserRole, default=UserRole.STUDENT)
    
    # created_at and updated_at are inherited from BaseModel
    # created_by and updated_by are inherited from BaseModel

    def __str__(self):
        return self.username
