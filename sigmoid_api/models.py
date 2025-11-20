from django.db import models

# No necesitamos modelos para este ejemplo, pero mantenemos el archivo
class SigmoidData(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    parameters = models.JSONField(default=dict)
    
    class Meta:
        app_label = 'sigmoid_api'