from django.db import models
from base.models import BaseModel
from base.fields import ChoicesField
from .choices import SubjectCategory, QuestionType, DifficultyLevel
from users.models import CustomUser

# Create your models here.

class Subject(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = ChoicesField(SubjectCategory, default=SubjectCategory.GENERAL_STUDIES)

    def __str__(self):
        return self.name

class Topic(BaseModel):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return f"{self.subject.name} - {self.name}"

class StudyMaterial(BaseModel):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='study_materials')
    title = models.CharField(max_length=200)
    content = models.TextField()
    file_attachment = models.FileField(upload_to='study_materials/', null=True, blank=True)
    # created_by is inherited from BaseModel

    def __str__(self):
        return self.title

class Question(BaseModel):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    answer = models.TextField()
    difficulty_level = ChoicesField(DifficultyLevel, default=DifficultyLevel.MEDIUM)
    question_type = ChoicesField(QuestionType, default=QuestionType.MULTIPLE_CHOICE)
    # created_by is inherited from BaseModel

    def __str__(self):
        return self.question_text[:100]
