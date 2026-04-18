from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, toggle_like, post_comments, delete_comment

router = DefaultRouter()
router.register(r'', PostViewSet, basename='post')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:post_id>/like/', toggle_like, name='toggle-like'),
    path('<int:post_id>/comments/', post_comments, name='post-comments'),
    path('<int:post_id>/comments/<int:comment_id>/', delete_comment, name='delete-comment'),
]