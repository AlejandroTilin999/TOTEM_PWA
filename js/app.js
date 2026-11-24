/* =========================================================
   TÓTEM · Interacciones y animaciones de la página
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Aviso flotante ---------- */
  const aviso = $('#aviso');
  let avisoTimer;
  function mostrarAviso(texto, ms = 3500) {
    aviso.textContent = texto;
    aviso.classList.add('mostrar');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove('mostrar'), ms);
  }

  /* =========================================================
     INTRO: letras TÓTEM iluminadas sobre fondo oscuro
     ========================================================= */
  const intro = $('#intro');
  document.body.classList.add('cargando');
  let introTerminada = false;

  function terminarIntro() {
    if (introTerminada) return;
    introTerminada = true;
    intro.classList.add('salir');
    document.body.classList.remove('cargando');
    setTimeout(() => document.body.classList.add('listo'), 350);
    setTimeout(() => intro.classList.add('oculto'), 1200);
  }

  requestAnimationFrame(() => intro.classList.add('listo'));
  setTimeout(terminarIntro, menosMovimiento ? 300 : 3600);
  $('.intro-saltar').addEventListener('click', terminarIntro);
  intro.addEventListener('click', terminarIntro);
  window.addEventListener('keydown', e => { if (!introTerminada && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) terminarIntro(); });

  /* =========================================================
     MENÚ: fondo al bajar, hamburguesa, enlace activo, progreso
     ========================================================= */
  const nav = $('#nav');
  const hamburguesa = $('#hamburguesa');
  const barra = $('.progreso-scroll');

  function alHacerScroll() {
    const y = window.scrollY;
    nav.classList.toggle('solida', y > 40);
    const total = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${total > 0 ? y / total : 0})`;
  }
  window.addEventListener('scroll', alHacerScroll, { passive: true });
  alHacerScroll();

  hamburguesa.addEventListener('click', () => {
    const abierto = nav.classList.toggle('abierta');
    hamburguesa.setAttribute('aria-expanded', abierto);
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('abierta');
    hamburguesa.setAttribute('aria-expanded', 'false');
  }));

  const enlaces = $$('.nav-links a');
  const obsSeccion = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
      if (!en.isIntersecting) return;
      enlaces.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => obsSeccion.observe(s));

  /* =========================================================
     APARECER AL HACER SCROLL
     ========================================================= */
  const obsRevelar = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        obsRevelar.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  $$('.revelar, .personaje').forEach(el => obsRevelar.observe(el));

  /* ---------- El Olvido ruge cada cierto tiempo ---------- */
  const olvido = $('#olvido');
  if (olvido && !menosMovimiento) {
    const sprite = $('.v-enorme', olvido);
    const tarjeta = olvido.closest('.villano');
    let olvidoVisible = false;
    new IntersectionObserver(([en]) => { olvidoVisible = en.isIntersecting; }).observe(olvido);
    const rugir = () => {
      sprite.classList.add('rugiendo');
      olvido.classList.add('ruge');
      tarjeta.classList.add('sacude');
      setTimeout(() => {
        sprite.classList.remove('rugiendo');
        olvido.classList.remove('ruge');
        tarjeta.classList.remove('sacude');
      }, 1600);
    };
    setInterval(() => { if (olvidoVisible) rugir(); }, 5000);
    olvido.addEventListener('mouseenter', rugir);
  }

  /* ---------- Épocas: voltear al tocar (pantallas táctiles) ---------- */
  $$('.epoca').forEach(ep => ep.addEventListener('click', () => ep.classList.toggle('volteada')));

  /* =========================================================
     SALAS: galería con miniaturas y visor
     ========================================================= */
  const SALAS = [
    ['Sala principal', 'Donde duerme el Tótem.'],
    ['Sala de los Ventanales', 'Aparece el primer Borrón.'],
    ['Comedor', 'Llega el Devorador de páginas.'],
    ['Sala de lectura', 'Minijefe: Gran Devorador.'],
    ['Ático de los libros viejos', 'Los libros de la Revolución.'],
    ['Gran salón', 'Dos pisos, rampa y escaleras.'],
    ['Archivo de la Niebla', 'Batalla final contra El Olvido.'],
  ];
  let salaImgActual = $('#salaImg');
  $$('.mini').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.i;
    $$('.mini').forEach(x => x.classList.toggle('activa', x === b));
    const nueva = salaImgActual.cloneNode();
    nueva.src = 'img/salas/sala_' + (i + 1) + '.png';
    nueva.alt = SALAS[i][0];
    salaImgActual.replaceWith(nueva);
    salaImgActual = nueva;
    $('#salaNum').textContent = 'Sala 0' + (i + 1);
    $('#salaNombre').textContent = SALAS[i][0];
    $('#salaDesc').textContent = SALAS[i][1];
  }));
  const visor = $('#visor');
  const visorImg = $('img', visor);
  $('#salaGrande').addEventListener('click', () => {
    visorImg.src = salaImgActual.src;
    visorImg.alt = salaImgActual.alt;
    visor.hidden = false;
  });
  const cerrarVisor = () => { visor.hidden = true; };
  visor.addEventListener('click', e => { if (e.target !== visorImg) cerrarVisor(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarVisor(); });

  /* =========================================================
     CONTROLES: pestañas
     ========================================================= */
  $$('.pestanas button').forEach(b => b.addEventListener('click', () => {
    $$('.pestanas button').forEach(x => {
      const activa = x === b;
      x.classList.toggle('activa', activa);
      x.setAttribute('aria-selected', activa);
      const panel = $('#tab-' + x.dataset.tab);
      panel.hidden = !activa;
      panel.classList.toggle('activo', activa);
    });
  }));

  /* =========================================================
     PWA: botón de instalar y estado de conexión
     ========================================================= */
  let eventoInstalar = null;
  const botonesInstalar = $$('.btn-instalar');
  const ayuda = $('#instalarAyuda');
  const yaInstalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  if (yaInstalada) {
    ayuda.textContent = 'Ya tienes TÓTEM instalada como app. ¡Ábrela cuando quieras, aunque no tengas internet!';
  }

  // El navegador avisa que la página se puede instalar
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    eventoInstalar = e;
    botonesInstalar.forEach(b => { b.hidden = false; });
    ayuda.hidden = true;
  });
  botonesInstalar.forEach(b => b.addEventListener('click', async () => {
    if (!eventoInstalar) {
      mostrarAviso(yaInstalada ? 'TÓTEM ya está instalada en este dispositivo.' : 'Abre el menú del navegador (⋮) y elige "Instalar TÓTEM" o "Agregar a la pantalla de inicio".', 6000);
      return;
    }
    eventoInstalar.prompt();
    const { outcome } = await eventoInstalar.userChoice;
    if (outcome === 'accepted') botonesInstalar.forEach(x => { x.hidden = true; });
    eventoInstalar = null;
  }));
  window.addEventListener('appinstalled', () => {
    botonesInstalar.forEach(b => { b.hidden = true; });
    mostrarAviso('¡TÓTEM se instaló como app!');
  });

  const estado = $('#estadoRed');
  function actualizarRed(avisar) {
    const enLinea = navigator.onLine;
    estado.textContent = enLinea ? '● En línea' : '● Sin conexión (versión guardada)';
    estado.classList.toggle('fuera', !enLinea);
    if (avisar) mostrarAviso(enLinea ? 'Volviste a tener conexión.' : 'Sin conexión: estás viendo la versión guardada.');
  }
  window.addEventListener('online', () => actualizarRed(true));
  window.addEventListener('offline', () => actualizarRed(true));
  actualizarRed(false);

  // Aviso cuando el Service Worker instala una versión nueva de la página
  if ('serviceWorker' in navigator) {
    let habiaControl = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (habiaControl) mostrarAviso('Hay una versión nueva de la página. Recarga para verla.', 6000);
      habiaControl = true;
    });
  }
})();
