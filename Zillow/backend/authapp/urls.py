# authapp/urls.py
from django.urls import path, include
from .views import SignUpView, SignInView
from rest_framework.routers import DefaultRouter
from .views import UserListingsView, ListingViewSet,my_listings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'listings', ListingViewSet, basename='listing')

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('signin/', SignInView.as_view(), name='signin'),
    path('my-listings/', UserListingsView.as_view(), name='user-listings'),
    path('', include(router.urls)),  # Add this line
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("listings/", ListingViewSet.as_view({'post': 'create'}), name='create-listing'),
    path("listings/my/", my_listings, name='my-listings'),  # Add this line

]
