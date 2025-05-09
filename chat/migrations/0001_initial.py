# Generated by Django 5.2 on 2025-04-19 07:00

import base.fields
import chat.choices
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('upsc', '0002_question_question_type_question_updated_by_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ChatSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(blank=True, max_length=255)),
                ('status', base.fields.ChoicesField(choices=[('active', 'ACTIVE'), ('paused', 'PAUSED'), ('ended', 'ENDED'), ('expired', 'EXPIRED')], default=chat.choices.SessionStatus['ACTIVE'], enum_class=chat.choices.SessionStatus, max_length=7)),
                ('exam_type', base.fields.ChoicesField(choices=[('upsc_cse', 'UPSC_CSE'), ('upsc_cds', 'UPSC_CDS'), ('upsc_capf', 'UPSC_CAPF'), ('upsc_ies', 'UPSC_IES'), ('upsc_ifs', 'UPSC_IFS'), ('upsc_nda', 'UPSC_NDA'), ('state_psc', 'STATE_PSC'), ('other', 'OTHER')], default=chat.choices.ExamType['UPSC_CSE'], enum_class=chat.choices.ExamType, max_length=9)),
                ('subject_type', base.fields.ChoicesField(choices=[('history', 'HISTORY'), ('geography', 'GEOGRAPHY'), ('polity', 'POLITY'), ('economics', 'ECONOMICS'), ('science', 'SCIENCE'), ('environment', 'ENVIRONMENT'), ('ethics', 'ETHICS'), ('essay', 'ESSAY'), ('csat', 'CSAT'), ('mathematics', 'MATHEMATICS'), ('english', 'ENGLISH'), ('hindi', 'HINDI'), ('reasoning', 'REASONING'), ('current_affairs', 'CURRENT_AFFAIRS'), ('general', 'GENERAL'), ('other', 'OTHER')], default=chat.choices.SubjectType['GENERAL'], enum_class=chat.choices.SubjectType, max_length=15)),
                ('last_interaction', models.DateTimeField(auto_now=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('subject', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='upsc.subject')),
                ('topic', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='upsc.topic')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_sessions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-last_interaction'],
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('message_type', base.fields.ChoicesField(choices=[('user_query', 'USER_QUERY'), ('ai_response', 'AI_RESPONSE'), ('system_message', 'SYSTEM_MESSAGE'), ('error_message', 'ERROR_MESSAGE')], default=chat.choices.MessageType['USER_QUERY'], enum_class=chat.choices.MessageType, max_length=14)),
                ('content', models.TextField()),
                ('query_category', base.fields.ChoicesField(choices=[('general', 'GENERAL'), ('subject_specific', 'SUBJECT_SPECIFIC'), ('current_affairs', 'CURRENT_AFFAIRS'), ('exam_strategy', 'EXAM_STRATEGY'), ('previous_year', 'PREVIOUS_YEAR')], default=chat.choices.QueryCategory['GENERAL'], enum_class=chat.choices.QueryCategory, max_length=16)),
                ('tokens_used', models.IntegerField(default=0)),
                ('model_version', models.CharField(blank=True, max_length=50)),
                ('confidence_score', models.FloatField(blank=True, null=True)),
                ('sources_used', models.JSONField(blank=True, null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('parent_message', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='follow_ups', to='chat.message')),
                ('reference_subject', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='upsc.subject')),
                ('reference_topic', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='upsc.topic')),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='chat.chatsession')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
        migrations.CreateModel(
            name='MessageResponse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('response_text', models.TextField()),
                ('response_type', base.fields.ChoicesField(choices=[('text', 'TEXT'), ('code', 'CODE'), ('table', 'TABLE'), ('list', 'LIST'), ('diagram', 'DIAGRAM'), ('multimedia', 'MULTIMEDIA'), ('mixed', 'MIXED')], default=chat.choices.ResponseType['TEXT'], enum_class=chat.choices.ResponseType, max_length=10)),
                ('model_name', models.CharField(default='gpt-4', max_length=100)),
                ('model_version', models.CharField(blank=True, max_length=50)),
                ('tokens_used', models.IntegerField(default=0)),
                ('processing_time', models.FloatField(blank=True, null=True)),
                ('confidence_score', models.FloatField(blank=True, null=True)),
                ('relevance_score', models.FloatField(blank=True, null=True)),
                ('accuracy_score', models.FloatField(blank=True, null=True)),
                ('has_code', models.BooleanField(default=False)),
                ('has_tables', models.BooleanField(default=False)),
                ('has_images', models.BooleanField(default=False)),
                ('has_links', models.BooleanField(default=False)),
                ('sources_used', models.JSONField(blank=True, null=True)),
                ('user_feedback', base.fields.ChoicesField(choices=[('helpful', 'HELPFUL'), ('not_helpful', 'NOT_HELPFUL'), ('partially_helpful', 'PARTIALLY_HELPFUL'), ('needs_improvement', 'NEEDS_IMPROVEMENT'), ('no_feedback', 'NO_FEEDBACK')], default=chat.choices.UserFeedback['NO_FEEDBACK'], enum_class=chat.choices.UserFeedback, max_length=17)),
                ('feedback_notes', models.TextField(blank=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('message', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='ai_response', to='chat.message')),
                ('reference_subjects', models.ManyToManyField(blank=True, to='upsc.subject')),
                ('reference_topics', models.ManyToManyField(blank=True, to='upsc.topic')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddIndex(
            model_name='chatsession',
            index=models.Index(fields=['user', '-last_interaction'], name='chat_chatse_user_id_70fad0_idx'),
        ),
        migrations.AddIndex(
            model_name='chatsession',
            index=models.Index(fields=['status', '-last_interaction'], name='chat_chatse_status_8fd069_idx'),
        ),
        migrations.AddIndex(
            model_name='chatsession',
            index=models.Index(fields=['exam_type', '-last_interaction'], name='chat_chatse_exam_ty_755e9b_idx'),
        ),
        migrations.AddIndex(
            model_name='chatsession',
            index=models.Index(fields=['subject_type', '-last_interaction'], name='chat_chatse_subject_9a5467_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['session', 'created_at'], name='chat_messag_session_4940cf_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['message_type', 'created_at'], name='chat_messag_message_bcd8ae_idx'),
        ),
        migrations.AddIndex(
            model_name='messageresponse',
            index=models.Index(fields=['model_name', 'created_at'], name='chat_messag_model_n_080dab_idx'),
        ),
        migrations.AddIndex(
            model_name='messageresponse',
            index=models.Index(fields=['confidence_score'], name='chat_messag_confide_9234c9_idx'),
        ),
    ]
