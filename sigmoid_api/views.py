import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .serializers import SigmoidParametersSerializer

class SigmoidAPIView(APIView):
    def post(self, request):
        serializer = SigmoidParametersSerializer(data=request.data)
        if serializer.is_valid():
            params = serializer.validated_data
            
            # Generar datos para la función sigmoidea
            x = np.linspace(params['x_min'], params['x_max'], params['num_points'])
            
            # Función sigmoidea con desplazamiento
            def sigmoid(x, shift=0, steepness=1):
                return 1 / (1 + np.exp(-steepness * (x - shift)))
            
            y = sigmoid(x, params['shift'], params['steepness'])
            
            # Datos para visualizar separabilidad
            # Generar puntos aleatorios y clasificarlos usando la sigmoidea
            np.random.seed(42)  # Para reproducibilidad
            random_x = np.random.uniform(params['x_min'], params['x_max'], 200)
            random_y = sigmoid(random_x, params['shift'], params['steepness'])
            
            # Clasificar puntos (arriba o abajo de la curva de decisión)
            threshold = 0.5
            classes = (random_y > threshold).astype(int)
            
            response_data = {
                'x_values': x.tolist(),
                'y_values': y.tolist(),
                'random_points': {
                    'x': random_x.tolist(),
                    'y': random_y.tolist(),
                    'classes': classes.tolist()
                },
                'decision_boundary': params['shift'],
                'parameters': params
            }
            
            return Response(response_data)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_default_sigmoid(request):
    """Endpoint para obtener datos iniciales"""
    x = np.linspace(-10, 10, 100)
    y = 1 / (1 + np.exp(-x))
    
    # Generar puntos aleatorios
    np.random.seed(42)
    random_x = np.random.uniform(-10, 10, 200)
    random_y = 1 / (1 + np.exp(-random_x))
    classes = (random_y > 0.5).astype(int)
    
    return JsonResponse({
        'x_values': x.tolist(),
        'y_values': y.tolist(),
        'random_points': {
            'x': random_x.tolist(),
            'y': random_y.tolist(),
            'classes': classes.tolist()
        },
        'decision_boundary': 0.0,
        'parameters': {
            'x_min': -10,
            'x_max': 10,
            'shift': 0,
            'steepness': 1,
            'num_points': 100
        }
    })