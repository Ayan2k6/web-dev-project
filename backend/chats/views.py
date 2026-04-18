from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import  api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Message, Chat
from .serializer import ChatSerializer, MessageSerializer
from users.models import User

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chat(request):
    user_id = request.data.get('user_id')
    target = get_object_or_404(User, id=user_id)

    if target == request.user:
        return Response({"error": "You can't create a chat with yourself"}, status=400)

    existing = Chat.objects.filter(participants=request.user).filter(participants=target).distinct()
    for chat in existing:
        if chat.participants.count() == 2:
            return Response(ChatSerializer(chat, context={'request': request}).data)
    if existing.exists():
        return Response(ChatSerializer(existing.first(), context={'request': request}).data)

    chat = Chat.objects.create()
    chat.participants.add(request.user, target)
    return Response(ChatSerializer(chat, context={'request': request}).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_chats(request):
    chats = request.user.chats.all()

    serializer = ChatSerializer(chats, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_detail_view(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id, participants=request.user)

    if request.method == 'GET':
        messages = chat.messages.select_related('sender').all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':

        serializer = MessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():

            serializer.save(sender=request.user, chat=chat)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)