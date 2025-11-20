from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
import numpy as np

class SigmoidAPITests(APITestCase):
    def test_default_sigmoid(self):
        response = self.client.get('/api/sigmoid/default/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('x_values', response.data)
        self.assertIn('y_values', response.data)
    
    def test_custom_sigmoid(self):
        data = {
            'x_min': -5,
            'x_max': 5,
            'shift': 1.0,
            'steepness': 2.0,
            'num_points': 50
        }
        response = self.client.post('/api/sigmoid/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['x_values']), 50)