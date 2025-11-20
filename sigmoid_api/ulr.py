# sigmoid_api/urls.py
from django.urls import path
from .views import SigmoidAPIView, get_default_sigmoid

urlpatterns = [
    path('sigmoid/', SigmoidAPIView.as_view(), name='sigmoid-api'),
    path('sigmoid/default/', get_default_sigmoid, name='default-sigmoid'),
]