// src/mvl.js
import { supabase } from './supabase.js';

export function mostrarMVP() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <section>
      <h2>Crear publicación (MVP)</h2>
      <form id="post-form">
        <textarea
          name="content"
          placeholder="¿Qué estás pensando?"
          rows="3"
          required
        ></textarea>

        <input
          type="text"
          name="image_url"
          placeholder="URL de imagen (opcional)"
        />

        <button type="submit">Publicar</button>
      </form>

      <p id="mensaje" style="text-align:center;"></p>

      <h3>Últimas publicaciones</h3>
      <div id="lista-posts"></div>
    </section>
  `;

  const form = document.getElementById('post-form');
  const mensaje = document.getElementById('mensaje');
  const lista = document.getElementById('lista-posts');

  // 🔹 Cargar publicaciones (feed simple)
  async function cargarPosts() {
    lista.innerHTML = 'Cargando publicaciones...';

    // Usuario actual (por si quieres mostrar mensajes si no hay login)
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user || null;

    if (!user) {
      mensaje.textContent = '⚠️ Debes iniciar sesión para publicar.';
      // Aun así, podemos mostrar el feed público si quieres
    } else {
      mensaje.textContent = '';
    }

    // Traemos posts + info básica del usuario
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        image_url,
        created_at,
        users (
          username,
          display_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      lista.innerHTML = 'Error al cargar publicaciones.';
      return;
    }

    if (!data || !data.length) {
      lista.innerHTML = '<p>Aún no hay publicaciones.</p>';
      return;
    }

    lista.innerHTML = '';

    data.forEach((post) => {
      const div = document.createElement('div');

      const author =
        post.users?.display_name ||
        post.users?.username ||
        'Usuario desconocido';

      const fecha = new Date(post.created_at).toLocaleString();

      div.innerHTML = `
        <hr>
        <p><b>${author}</b> · <small>${fecha}</small></p>
        <p>${post.content}</p>
        ${
          post.image_url
            ? <img src="${post.image_url}" alt="imagen del post" width="250">
            : ''
        }
      `;

      lista.appendChild(div);
    });
  }

  // 🔹 Crear nueva publicación
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensaje.textContent = '';

    const { data: userData, error: errorUser } = await supabase.auth.getUser();
    const user = userData?.user || null;

    if (errorUser) {
      console.error(errorUser);
    }

    if (!user) {
      mensaje.textContent = '⚠️ Debes iniciar sesión para publicar.';
      return;
    }

    const content = form.content.value.trim();
    const imageUrl = form.image_url.value.trim();

    if (!content) {
      mensaje.textContent = 'El contenido de la publicación no puede estar vacío.';
      return;
    }

    const { error } = await supabase.from('posts').insert([
      {
        user_id: user.id,
        content,
        image_url: imageUrl || null
        // created_at lo pone la BD por defecto
      }
    ]);

    if (error) {
      console.error(error);
      mensaje.textContent = '❌ Error al publicar: ' + error.message;
      return;
    }

    mensaje.textContent = '✅ Publicación creada correctamente.';
    form.reset();
    cargarPosts();
  });

  // Inicialización
  cargarPosts();
}