from rest_framework import serializers
from .models import Post, Like, Comment
from users.serializer import UserSerializer

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'author', 'title', 'content', 'is_official', 'likes_count', 'comments_count', 'created_at', 'image']

    def validate(self, data):
        user = self.context['request'].user
        if data.get('is_official', False) and user.role != 'organization':
            raise serializers.ValidationError("У вас нет прав для создания официального поста.")
        return data

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'text', 'created_at']
        read_only_fields = ['post', 'author']

