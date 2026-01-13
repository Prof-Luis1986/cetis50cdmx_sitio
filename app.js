/*
  app.js (versión: anuncios SOLO en la portada)
  - Solo carga y muestra anuncios cuando currentPageId === 'inicio'
  - En otras páginas no intenta cargar ni renderizar la lista de avisos
  - Homepage muestra todos los avisos publicados (published: true) y no filtra por targetPages
  - Si no hay anuncios publicados, aparece: "🚧 Trabajando próximamente 🚧"
  - Muestra en cada tarjeta las targetPages como etiquetas para referencia
*/

(function(){
  'use strict';

  // Detectar la página actual desde data-page-id del body
  // Para index.html asegúrate de tener: <body data-page-id="inicio">
  const currentPageId = document.body.dataset.pageId || 'inicio';

  // Solo buscar elementos de DOM si existen
  const filterSpecialty = document.getElementById('filter-specialty'); // opcional (puedes ocultarlo)
  const searchInput = document.getElementById('search-input');
  const announcementsList = document.getElementById('announcements-list');
  const noAnnouncements = document.getElementById('no-announcements');
  const loadError = document.getElementById('load-error');

  // Modal solo en portada
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalLink = document.getElementById('modal-link');
  const modalCloseBtn = document.getElementById('modal-close');

  // Firestore (desde firebase-config.js)
  const db = window.db;
  if (!db) {
    console.error('Firestore (window.db) no disponible. Revisa firebase-config.js');
    if (loadError) {
      loadError.style.display = 'block';
      loadError.textContent = 'Error de configuración de Firebase.';
    }
    return;
  }

  // Si no estamos en la portada, no cargamos anuncios (las demás páginas son estáticas)
  if (currentPageId !== 'inicio') {
    // Ocultar sección de anuncios si existe en páginas secundarias
    if (announcementsList) announcementsList.style.display = 'none';
    if (noAnnouncements) noAnnouncements.style.display = 'none';
    if (loadError) loadError.style.display = 'none';
    // Puedes mostrar aquí contenido estático o simplemente no hacer nada.
    console.log('No es la portada — los anuncios solo se muestran en index (inicio).');
    return;
  }

  // Si llegamos aquí, estamos en la portada y debemos cargar anuncios
  let allAnnouncements = [];

  async function loadAnnouncements() {
    if (!announcementsList) return;
    announcementsList.innerHTML = '';
    if (noAnnouncements) noAnnouncements.style.display = 'none';
    if (loadError) loadError.style.display = 'none';

    try {
      const now = new Date();
      const snapshot = await db.collection('announcements')
        .where('published', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

      allAnnouncements = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt ? data.createdAt.toDate() : null;
        const expiresAt = data.expiresAt ? data.expiresAt.toDate() : null;

        // Omitir expirados
        if (expiresAt && expiresAt < now) return;

        allAnnouncements.push({
          id: doc.id,
          title: data.title || '',
          body: data.body || '',
          authorName: data.authorName || '',
          createdAt,
          expiresAt,
          specialties: Array.isArray(data.specialties) ? data.specialties : [],
          imageUrl: data.imageUrl || '',
          externalLink: data.externalLink || '',
          targetPages: Array.isArray(data.targetPages) ? data.targetPages : [],
          showAsModal: !!data.showAsModal
        });
      });

      // Mostrar modal si corresponde (solo para portada)
      showModalIfNeeded();

      // Renderizar todo (en portada mostramos todos los avisos publicados)
      renderAnnouncements();
    } catch (err) {
      console.error('Error cargando anuncios:', err);
      if (loadError) {
        loadError.style.display = 'block';
        loadError.textContent = 'Error al cargar avisos.';
      }
    }
  }

  function showModalIfNeeded(){
    if (!modal) return;
    const modalAnnouncement = allAnnouncements.find(a => a.showAsModal);
    if (!modalAnnouncement) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden','true');
      return;
    }

    modalTitle.textContent = modalAnnouncement.title || 'Aviso';
    let bodyHtml = '';
    if (modalAnnouncement.imageUrl) {
      bodyHtml += `<img src="${escapeHtml(modalAnnouncement.imageUrl)}" alt="" style="max-width:100%; border-radius:8px; margin-bottom:12px;">`;
    }
    bodyHtml += `<p>${escapeHtml(modalAnnouncement.body || '')}</p>`;
    modalBody.innerHTML = bodyHtml;

    if (modalAnnouncement.externalLink) {
      modalLink.href = modalAnnouncement.externalLink;
      modalLink.style.display = 'inline-block';
      modalLink.textContent = 'Más información';
    } else {
      modalLink.style.display = 'none';
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
  }

  function closeModal(){
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function renderAnnouncements(){
    if (!announcementsList) return;

    const search = (searchInput ? searchInput.value : '').toLowerCase().trim();

    // Aquí no filtramos por targetPages ni por especialidad — mostramos TODOS los anuncios publicados
    let filtered = allAnnouncements.slice();

    // Aplicar búsqueda si hay
    if (search) {
      filtered = filtered.filter(a => {
        const haystack = (a.title + ' ' + a.body + ' ' + (a.authorName || '')).toLowerCase();
        return haystack.includes(search);
      });
    }

    announcementsList.innerHTML = '';

    if (filtered.length === 0) {
      if (noAnnouncements) {
        noAnnouncements.style.display = 'block';
        noAnnouncements.textContent = '🚧 Trabajando próximamente 🚧';
      }
      return;
    } else {
      if (noAnnouncements) noAnnouncements.style.display = 'none';
    }

    filtered.forEach(a => {
      const card = document.createElement('div');
      card.className = 'announcement';

      let imgHtml = '';
      if (a.imageUrl) {
        imgHtml = `<img class="announcement-image" src="${escapeHtml(a.imageUrl)}" alt="">`;
      }

      let linkHtml = '';
      if (a.externalLink) {
        linkHtml = `<a class="external-link" href="${escapeHtml(a.externalLink)}" target="_blank" rel="noopener noreferrer">Más información</a>`;
      }

      // Mostrar targetPages como etiquetas para referencia del usuario
      const targets = (a.targetPages && a.targetPages.length) ? a.targetPages.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(' ') : '';

      const specialtiesStr = (a.specialties && a.specialties.length) ? a.specialties.join(' · ') : 'General';
      const createdStr = a.createdAt ? a.createdAt.toLocaleString() : '';

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; flex-wrap:wrap;">
          <h4 style="margin:0;">${escapeHtml(a.title)}</h4>
          <div style="margin-left:auto">${targets}</div>
        </div>
        ${imgHtml}
        <p>${escapeHtml(a.body)}</p>
        ${linkHtml}
        <small>Especialidad: ${escapeHtml(specialtiesStr)} · Autor: ${escapeHtml(a.authorName)} · Publicado: ${escapeHtml(createdStr)}</small>
      `;
      announcementsList.appendChild(card);
    });
  }

  function escapeHtml(text){
    if (!text && text !== 0) return '';
    return String(text).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // Eventos (búsqueda)
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(window._searchTimer);
      window._searchTimer = setTimeout(renderAnnouncements, 180);
    });
  }

  // Inicial
  loadAnnouncements();

})();