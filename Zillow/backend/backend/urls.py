from django.contrib import admin
from django.urls import path, include
from authapp.views import login_view

urlpatterns = [
    path('admin/', admin.site.urls),
     path('api/', include('authapp.urls')),
     path("api/token/", login_view),
]
