// src/register.js  (o src/componentes/register.js)
// Ajusta la ruta si tu archivo supabase.js está en otra carpeta

import { supabase } from './supabase.js';

export function mostrarRegistro() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <section>
      <h2>Crear cuenta</h2>
      <form id="registro-form">
        <input
          type="text"
          name="username"
          placeholder="Usuario (sin espacios)"
          required
        />
        <input
          type="text"
          name="display_name"
          placeholder="Nombre visible"
          required
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          required
        />
        <textarea
          name="bio"
          placeholder="Bio (opcional)"
          rows="3"
        ></textarea>
        <input
          type="text"
          name="avatar_url"
          placeholder="URL de avatar (opcional)"
        />
        <button type="submit">Registrarse</button>
      </form>
      <p id="error" style="color:red;"></p>
    </section>
  `;

  const form = document.getElementById('registro-form');
  const errorMsg = document.getElementById('error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const username = form.username.value.trim();
    const displayName = form.display_name.value.trim();
    const correo = form.correo.value.trim();
    const password = form.password.value.trim();
    const bio = form.bio.value.trim();
    const avatarUrl = form.avatar_url.value.trim();

    // validaciones básicas
    if (!username || !displayName || !correo || !password) {
      errorMsg.textContent = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    if (/\s/.test(username)) {
      errorMsg.textContent = 'El usuario no puede tener espacios.';
      return;
    }

    // 1️⃣ Crear usuario en Supabase Auth
    const { data: dataAuth, error: errorAuth } = await supabase.auth.signUp({
      email: correo,
      password: password,
      options: {
        data: {
          username,
          display_name: displayName
        }
      }
    });

    if (errorAuth) {
  errorMsg.textContent = `Error en autenticación: ${errorAuth.message}`;
  return;
}

    const uid = dataAuth.user?.id;
    if (!uid) {
      errorMsg.textContent = 'No se pudo obtener el ID del usuario.';
      return;
    }

    // 2️⃣ Insertar en tabla "users"
    // ⚠️ password_hash: aquí guardamos la contraseña en claro SOLO para el proyecto.
    //    En un sistema real deberías guardar un hash, no el password.
    const { error: errorInsert } = await supabase.from('users').insert([
      {
        id: uid,
        username,
        email: correo,
        password_hash: password,
        display_name: displayName,
        bio: bio || null,
        avatar_url: avatarUrl || null
      }
    ]);

    if (errorInsert) {
      errorMsg.textContent =
        'Error guardando datos del usuario: ' + errorInsert.message;
      return;
    }

    alert('✅ Registro exitoso. Ahora puedes iniciar sesión.');
    // si usas rutas por hash:
    // window.location.hash = '#/login';
  });
}