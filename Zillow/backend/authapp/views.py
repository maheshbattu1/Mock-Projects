# authapp/views.py
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Listing
from .serializers import ListingSerializer
from .serializers import SignUpSerializer, SignInSerializer
from rest_framework.decorators import permission_classes
from rest_framework_simplejwt.tokens import RefreshToken

class SignUpView(APIView):
    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SignInView(APIView):
    def post(self, request):
        serializer = SignInSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(username=serializer.validated_data['email'], password=serializer.validated_data['password'])
            if user:
                token, _ = Token.objects.get_or_create(user=user)
                
                return Response({'token': token.key}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.action in ['list', 'retrieve']:
            return Listing.objects.all()  # Allow fetching all listings
        return Listing.objects.filter(user=self.request.user)  # Restrict other actions to the user's listings

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({'error': 'You do not have permission to edit this listing.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({'error': 'You do not have permission to delete this listing.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
    
class UserListingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        listings = Listing.objects.filter(user=request.user)
        serializer = ListingSerializer(listings, many=True)
        return Response(serializer.data)
    

def set_cookie(response, key, value, is_refresh=False):
    secure = settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", False)
    httponly = settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY", True)
    samesite = settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Lax")
    path = settings.SIMPLE_JWT.get("AUTH_COOKIE_PATH", "/")

    response.set_cookie(
        key,
        value,
        httponly=httponly,
        secure=secure,
        samesite=samesite,
        path=path,
        max_age=3600 if not is_refresh else 7 * 24 * 3600
    )


from rest_framework.decorators import api_view
@api_view(['POST'])
def login_view(request):
    user = authenticate(username=request.data.get('username'), password=request.data.get('password'))
    if user:
        refresh = RefreshToken.for_user(user)
        response = Response({"success": True})
        set_cookie(response, "access_token", str(refresh.access_token))
        set_cookie(response, "refresh_token", str(refresh), is_refresh=True)
        return response
    return Response({"error": "Invalid credentials"}, status=401)
# backend/authapp/views.py
@api_view(['POST'])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_listing(request):
    data = request.data
    listing = Listing.objects.create(
        user=request.user,
        title=data['title'],
        price=data['price'],
        address=data['address'],
        image_url=data['imageUrl']
    )
    return Response({"message": "Listing created"}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_listings(request):
    listings = Listing.objects.filter(user=request.user)
    serialized = ListingSerializer(listings, many=True)
    return Response(serialized.data)
