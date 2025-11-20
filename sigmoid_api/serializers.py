from rest_framework import serializers

class SigmoidParametersSerializer(serializers.Serializer):
    x_min = serializers.FloatField(default=-10.0)
    x_max = serializers.FloatField(default=10.0)
    shift = serializers.FloatField(default=0.0)
    steepness = serializers.FloatField(default=1.0)
    num_points = serializers.IntegerField(default=100, min_value=10, max_value=1000)