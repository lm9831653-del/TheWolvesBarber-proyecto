from django.contrib import admin

from .models import Perfil


@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = (
        'usuario',
        'telefono',
        'rol',
        'intentos_fallidos',
        'cuenta_bloqueada',
        'fecha_creacion',
    )
    list_filter = ('rol', 'cuenta_bloqueada')
    search_fields = ('usuario__username', 'usuario__email', 'telefono')
    actions = ('desbloquear_cuentas',)

    @admin.action(description='Desbloquear cuentas seleccionadas')
    def desbloquear_cuentas(self, request, queryset):
        for perfil in queryset.select_related('usuario'):
            perfil.desbloquear_cuenta()
