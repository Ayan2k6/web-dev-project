from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('organization', 'Organization'),
    )
    email = models.EmailField(unique=False, blank=True, null=True)

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    faculty = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    friends = models.ManyToManyField('self', blank=True, symmetrical=True)
    subscriptions = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        related_name='followers',
        limit_choices_to={'role': 'organization'}
    )

    def __str__(self):
        return f"{self.username} ({self.role})"