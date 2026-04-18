from django.urls import path
from . import views

urlpatterns = [
    path('my-chats/', views.get_my_chats, name='my-chats'),
    path('<int:chat_id>/messages/', views.chat_detail_view, name='chat-messages'),
    path('create/', views.create_chat, name='create-chat'),
]