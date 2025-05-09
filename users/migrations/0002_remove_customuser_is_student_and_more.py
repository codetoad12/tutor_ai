# Generated by Django 5.2 on 2025-04-19 06:47

import base.fields
import django.db.models.deletion
import users.choices
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='is_student',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='is_tutor',
        ),
        migrations.AddField(
            model_name='customuser',
            name='created_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='customuser',
            name='role',
            field=base.fields.ChoicesField(choices=[('student', 'STUDENT'), ('tutor', 'TUTOR'), ('admin', 'ADMIN'), ('moderator', 'MODERATOR')], default=users.choices.UserRole['STUDENT'], enum_class=users.choices.UserRole, max_length=9),
        ),
        migrations.AddField(
            model_name='customuser',
            name='status',
            field=base.fields.ChoicesField(choices=[('active', 'ACTIVE'), ('inactive', 'INACTIVE'), ('suspended', 'SUSPENDED'), ('pending', 'PENDING')], default=users.choices.UserStatus['PENDING'], enum_class=users.choices.UserStatus, max_length=9),
        ),
        migrations.AddField(
            model_name='customuser',
            name='updated_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL),
        ),
    ]
