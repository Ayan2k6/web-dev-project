from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models
from django.shortcuts import get_object_or_404
from .models import User
from .serializer import UserSerializer, RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Logged out successfully"})
    except Exception:
        return Response({"error": "Invalid token"}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_friend(request, user_id):
    target_user = get_object_or_404(User, id=user_id)
    me = request.user

    if target_user == me:
        return Response({"error": "You can't be friends with yourself"}, status=400)

    if target_user in me.friends.all():
        me.friends.remove(target_user)
        return Response({"message": "Removed from friends"})
    else:
        me.friends.add(target_user)
        return Response({"message": "Added as a friend"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_subscription(request, org_id):
    org = get_object_or_404(User, id=org_id)
    if org.role != 'organization':
        return Response({"error": "You can only subscribe to an organization"}, status=400)

    me = request.user
    if org in me.subscriptions.all():
        me.subscriptions.remove(org)
        return Response({"message": "The cancellation has been processed"})
    else:
        me.subscriptions.add(org)
        return Response({"message": "You have subscribed to the organization"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_friends(request):
    me = request.user
    my_subs = me.subscriptions.values_list('id', flat=True)

    recommendations = User.objects.filter(
        models.Q(faculty=me.faculty) | models.Q(subscriptions__in=my_subs)
    ).exclude(id=me.id).exclude(id__in=me.friends.values_list('id', flat=True)).distinct()

    serializer = UserSerializer(recommendations[:5], many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)