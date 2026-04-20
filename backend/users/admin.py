from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class MyUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'role', 'faculty', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('INFO', {'fields': ('role', 'faculty', 'bio', 'avatar')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('INFO', {'fields': ('role', 'faculty', 'bio', 'email')}),
    )

admin.site.register(User, MyUserAdmin)