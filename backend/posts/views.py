from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Case, When, Value, IntegerField
from django.shortcuts import get_object_or_404
from .models import Post, Like, Comment
from .serializer import PostSerializer, CommentSerializer


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous:
            return Post.objects.filter(is_official=True).order_by('-created_at')

        friend_ids = user.friends.values_list('id', flat=True)
        org_ids = user.subscriptions.values_list('id', flat=True)

        return Post.objects.annotate(
            score=Case(
                When(author_id__in=org_ids, is_official=True, then=Value(100)),
                When(author_id__in=friend_ids, then=Value(80)),
                When(author_id__in=org_ids, is_official=False, then=Value(50)),
                default=Value(0),
                output_field=IntegerField(),
            )
        ).order_by('-score', '-created_at')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    like, created = Like.objects.get_or_create(post=post, user=request.user)

    if not created:
        like.delete()
        return Response({"message": "Like removed", "liked": False})

    return Response({"message": "Like added", "liked": True})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def post_comments(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if request.method == 'GET':
        comments = post.comments.select_related('author').all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, post_id, comment_id):
    comment = get_object_or_404(Comment, id=comment_id, post_id=post_id)

    if comment.author != request.user:
        return Response({"error": "You can only delete your own comments"}, status=403)

    comment.delete()
    return Response({"message": "Comment deleted"})