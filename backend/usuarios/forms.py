from django import forms
from django.contrib.auth.models import User

from .models import Perfil


class RegistroUsuarioForm(forms.Form):
    username = forms.CharField(
        label='Usuario',
        max_length=150,
        widget=forms.TextInput(attrs={'placeholder': 'Nombre de usuario'}),
    )
    first_name = forms.CharField(
        label='Nombre',
        max_length=150,
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'Nombre'}),
    )
    last_name = forms.CharField(
        label='Apellido',
        max_length=150,
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'Apellido'}),
    )
    email = forms.EmailField(
        label='Correo',
        widget=forms.EmailInput(attrs={'placeholder': 'Correo electronico'}),
    )
    telefono = forms.CharField(
        label='Telefono',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'Telefono'}),
    )
    password = forms.CharField(
        label='Contrasena',
        widget=forms.PasswordInput(attrs={'placeholder': 'Contrasena'}),
    )
    password_confirmacion = forms.CharField(
        label='Confirmar contrasena',
        widget=forms.PasswordInput(attrs={'placeholder': 'Confirmar contrasena'}),
    )

    def clean_username(self):
        username = self.cleaned_data['username']

        if User.objects.filter(username=username).exists():
            raise forms.ValidationError('Este nombre de usuario ya esta registrado.')

        return username

    def clean_email(self):
        email = self.cleaned_data['email']

        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('Este correo ya esta registrado.')

        return email

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password_confirmacion = cleaned_data.get('password_confirmacion')

        if password and password_confirmacion and password != password_confirmacion:
            raise forms.ValidationError('Las contrasenas no coinciden.')

        return cleaned_data

    def save(self):
        usuario = User.objects.create_user(
            username=self.cleaned_data['username'],
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password'],
            first_name=self.cleaned_data['first_name'],
            last_name=self.cleaned_data['last_name'],
        )

        Perfil.objects.create(
            usuario=usuario,
            telefono=self.cleaned_data.get('telefono', ''),
            rol=Perfil.ROL_CLIENTE,
        )

        return usuario
