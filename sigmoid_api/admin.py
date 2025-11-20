from django.contrib import admin
from .models import SigmoidData

@admin.register(SigmoidData)
class SigmoidDataAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_at']
    readonly_fields = ['created_at']