from django.contrib.auth.models import User
from django.db import models


class Perfil(models.Model):
    ROL_ADMIN = 'admin'
    ROL_BARBERO = 'barbero'
    ROL_CLIENTE = 'cliente'

    ROLES = [
        (ROL_ADMIN, 'Administrador'),
        (ROL_BARBERO, 'Barbero'),
        (ROL_CLIENTE, 'Cliente'),
    ]

    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    telefono = models.CharField(max_length=20, blank=True)
    rol = models.CharField(max_length=20, choices=ROLES, default=ROL_CLIENTE)
    intentos_fallidos = models.PositiveSmallIntegerField(default=0)
    cuenta_bloqueada = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Perfil'
        verbose_name_plural = 'Perfiles'

    def desbloquear_cuenta(self):
        self.intentos_fallidos = 0
        self.cuenta_bloqueada = False
        self.usuario.is_active = True
        self.usuario.save(update_fields=['is_active'])
        self.save(update_fields=['intentos_fallidos', 'cuenta_bloqueada'])

    def registrar_intento_fallido(self):
        self.intentos_fallidos += 1

        if self.intentos_fallidos >= 3:
            self.cuenta_bloqueada = True
            self.usuario.is_active = False
            self.usuario.save(update_fields=['is_active'])

        self.save(update_fields=['intentos_fallidos', 'cuenta_bloqueada'])

    def reiniciar_intentos(self):
        if self.intentos_fallidos:
            self.intentos_fallidos = 0
            self.save(update_fields=['intentos_fallidos'])

    def __str__(self):
        return f'{self.usuario.username} - {self.get_rol_display()}'
