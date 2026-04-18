from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('friends/toggle/<int:user_id>/', views.toggle_friend),
    path('subs/toggle/<int:org_id>/', views.toggle_subscription),
    path('recommendations/', views.recommend_friends),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
]