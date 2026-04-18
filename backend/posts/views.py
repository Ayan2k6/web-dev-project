from rest_framework import viewsets, permissions
from .models import Post
from .serializer import PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def PerformeAndCreate(self, serializer):
        serializer.save(author = self.request.user)
