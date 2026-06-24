import json

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .forms import RegistroUsuarioForm
from .models import Perfil


MAX_INTENTOS_LOGIN = 3


def buscar_usuario_por_login(valor):
    return User.objects.filter(username=valor).first() or User.objects.filter(email=valor).first()


def registro(request):
    if request.user.is_authenticated:
        return redirect('perfil')
    if request.method == 'POST':
        form = RegistroUsuarioForm(request.POST)
        if form.is_valid():
            usuario = form.save()
            login(request, usuario)
            messages.success(request, 'Registro exitoso. Bienvenido.')
            return redirect('perfil')
    else:
        form = RegistroUsuarioForm()
    return render(request, 'usuarios/registro.html', {'form': form})


def iniciar_sesion(request):
    if request.user.is_authenticated:
        return redirect('perfil')
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password')
        usuario_registrado = buscar_usuario_por_login(username)
        if usuario_registrado is not None:
            perfil, _ = Perfil.objects.get_or_create(usuario=usuario_registrado)
            if perfil.cuenta_bloqueada or not usuario_registrado.is_active:
                messages.error(request, 'Esta cuenta esta bloqueada por 3 intentos fallidos. Contacta al administrador.')
                return render(request, 'usuarios/login.html')
        usuario = authenticate(request, username=usuario_registrado.username, password=password) if usuario_registrado else None
        if usuario is not None:
            perfil, _ = Perfil.objects.get_or_create(usuario=usuario)
            perfil.reiniciar_intentos()
            login(request, usuario)
            messages.success(request, 'Inicio de sesion exitoso.')
            return redirect('perfil')
        if usuario_registrado is not None:
            perfil.registrar_intento_fallido()
            if perfil.cuenta_bloqueada:
                messages.error(request, 'Cuenta bloqueada por 3 intentos fallidos. Contacta al administrador.')
            else:
                intentos_restantes = MAX_INTENTOS_LOGIN - perfil.intentos_fallidos
                messages.error(request, f'Usuario o contrasena incorrectos. Intentos restantes: {intentos_restantes}.')
        else:
            messages.error(request, 'Usuario o contrasena incorrectos.')
    return render(request, 'usuarios/login.html')


def cerrar_sesion(request):
    logout(request)
    messages.success(request, 'Sesion cerrada correctamente.')
    return redirect('login')


@login_required
def perfil(request):
    perfil_usuario, _ = Perfil.objects.get_or_create(usuario=request.user)
    return render(request, 'usuarios/perfil.html', {'perfil': perfil_usuario})


# ── API JSON para la página web estática ─────────────────────────────────────

@csrf_exempt
@require_http_methods(['POST', 'OPTIONS'])
def api_login(request):
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'ok': False, 'error': 'Solicitud inválida.'}, status=400)

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return JsonResponse({'ok': False, 'error': 'Completa todos los campos.'})

    usuario_registrado = buscar_usuario_por_login(email)

    if usuario_registrado is None:
        return JsonResponse({'ok': False, 'error': 'Correo o contraseña incorrectos.'})

    perfil, _ = Perfil.objects.get_or_create(usuario=usuario_registrado)

    if perfil.cuenta_bloqueada or not usuario_registrado.is_active:
        return JsonResponse({'ok': False, 'blocked': True,
                             'error': 'Cuenta bloqueada por demasiados intentos. Contacta al administrador.'})

    usuario = authenticate(request, username=usuario_registrado.username, password=password)

    if usuario is not None:
        perfil.reiniciar_intentos()
        nombre = usuario.get_full_name() or usuario.username
        return JsonResponse({'ok': True, 'name': nombre, 'email': usuario.email})

    perfil.registrar_intento_fallido()

    if perfil.cuenta_bloqueada:
        return JsonResponse({'ok': False, 'blocked': True,
                             'error': '🔒 Cuenta bloqueada por 3 intentos fallidos. Contacta al administrador.'})

    restantes = MAX_INTENTOS_LOGIN - perfil.intentos_fallidos
    return JsonResponse({'ok': False,
                         'error': f'Correo o contraseña incorrectos. Te quedan {restantes} intento(s).'})


@csrf_exempt
@require_http_methods(['POST', 'OPTIONS'])
def api_registro(request):
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'ok': False, 'error': 'Solicitud inválida.'}, status=400)

    nombre   = data.get('nombre', '').strip()
    apellido = data.get('apellido', '').strip()
    email    = data.get('email', '').strip().lower()
    telefono = data.get('telefono', '').strip()
    genero   = data.get('genero', '').strip()
    password = data.get('password', '')

    if not all([nombre, apellido, email, password]):
        return JsonResponse({'ok': False, 'error': 'Faltan campos obligatorios.'})

    if User.objects.filter(email=email).exists():
        return JsonResponse({'ok': False, 'error': 'Este correo ya está registrado.'})

    if len(password) < 6:
        return JsonResponse({'ok': False, 'error': 'La contraseña debe tener mínimo 6 caracteres.'})

    usuario = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=nombre,
        last_name=apellido,
    )
    Perfil.objects.create(usuario=usuario, telefono=telefono, rol=Perfil.ROL_CLIENTE)

    nombre_completo = f'{nombre} {apellido}'.strip()
    return JsonResponse({'ok': True, 'name': nombre_completo, 'email': email})
