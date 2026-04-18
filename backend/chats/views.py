from pyexpat.errors import messages
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import  api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Chat, Message
from .serializer import ChatSerializer, MessageSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_chats(request):
    chats = request.user.chats.all()

    serializer = ChatSerializer(chats, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_detail_view(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id, participants = request.user)
    except:
        return Response({"detail": "Chat not found or you don't have access"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        messages = chat.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = MessageSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user, chat=chat)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)