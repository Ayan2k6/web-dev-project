from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/posts/', include('posts.urls')),
    path('api/chats/', include('chats.urls')),
    path('api/users/', include('users.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)