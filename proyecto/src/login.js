// src/login.js
import { supabase } from './supabase.js';
import { mostrarRegistro } from './register.js';
// si tienes una pantalla "principal" (feed / home), luego la importas aquí:
// import { mostrarFeed } from './feed.js';

export function mostrarLogin() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <section>
      <h2>Iniciar Sesión</h2>
      <form id="login-form">
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
        <button type="submit">Ingresar</button>
      </form>
      <p id="error" style="color:red;"></p>
      <button id="ir-registro">Crear cuenta</button>
    </section>
  `;

  const form = document.getElementById('login-form');
  const errorMsg = document.getElementById('error');
  const irRegistro = document.getElementById('ir-registro');

  // 👉 Ir al registro
  irRegistro.addEventListener('click', () => {
    mostrarRegistro();
  });

  // 👉 Enviar login
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const correo = form.correo.value.trim();
    const password = form.password.value.trim();

    if (!correo || !password) {
      errorMsg.textContent = 'Por favor completa todos los campos.';
      return;
    }

    // 🔐 Iniciar sesión en Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: password,
    });

    if (error) {
      errorMsg.textContent = 'Error al iniciar sesión: ' + error.message;
      return;
    }

    // ✅ Usuario autenticado
    const usuario = data.user;
    console.log('Usuario logueado (Auth):', usuario);

    // 🔎 Opcional: leer el perfil en la tabla "users"
    const { data: perfil, error: errorPerfil } = await supabase
      .from('users')
      .select('*')
      .eq('id', usuario.id)
      .single();

    if (errorPerfil) {
      console.warn('Usuario en Auth, pero no se encontró en tabla users:', errorPerfil);
    } else {
      console.log('Perfil en tabla users:', perfil);
    }

    // Aquí ya podrías cambiar de pantalla, por ejemplo:
    // window.location.hash = '#/feed';
    // mostrarFeed();
  });
}