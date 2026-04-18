from django.contrib import admin
from .models import Chat, Message

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at', 'get_participants',)
    search_fields = ('name', 'participants__username')
    list_filter = ('created_at',)
    filter_horizontal = ('participants',)

    def get_participants(self, obj):
        return ", ".join([user.username for user in obj.participants.all()])
    get_participants.short_description = 'Participants'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'sender', 'text_preview', 'created_at')
    list_filter = ('chat', 'sender', 'created_at')
    search_fields = ('text', 'sender__username')

    def text_preview(self, obj):
        return obj.text[:50] + "..." if len(obj.text) > 50 else obj.text

    text_preview.short_description = 'Text'