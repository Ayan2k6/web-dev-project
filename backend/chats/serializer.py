from rest_framework import serializers
from .models import Chat, Message
from users.serializer import UserSerializer

class ChatSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'name', 'display_name', 'created_at', 'participants']

    def get_display_name(self, obj):
        if obj.name:
            return obj.name
        request = self.context.get('request')
        if request and request.user:
            interlocutor = obj.participants.exclude(id=request.user.id).first()
            if interlocutor:
                return interlocutor.username
        return "Unknown Chat"

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    class Meta:
        model = Message
        fields = ['id', 'text', 'created_at', 'sender']
        read_only_fields = ['chat']
