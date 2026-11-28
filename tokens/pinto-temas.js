/* pinto-temas.js v3 «editorial sobrio» · PROPUESTA (28/11/2026), pendiente de aprobación de Pau para todo el ecosistema.
 * Cambios vs v1: sin sticker ni confeti (confeti queda como función vacía por compatibilidad), escenas de línea fina, frases más sobrias, render sin frase inicial vacía.
 * Uso: PintoTemas.render(contenedor, {tema, titulo, kicker, respuesta, asistentes, conteo, onResponder})
 * respuesta: 'voy' | 'aun_no_se' | 'no_voy' | null. El servidor sigue siendo la autoridad: esto solo pinta.
 */
(function (global) {
  'use strict';
  var TEMAS = {
 "cumple": {
  "nombre": "Cumple",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 84\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M126 62h48M132 62V46h36v16M132 54h36\"/><path d=\"M150 46V34M150 26c-3 4-3 6 0 8 3-2 3-4 0-8z\"/><path d=\"M60 42h30M210 42h30\" opacity=\".5\"/></svg>",
  "frase": {
   "inicio": "Una tarde para festejar.",
   "voy": "Anotado. Nos vemos para brindar.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Lástima. Te mandamos un abrazo."
  }
 },
 "asado": {
  "nombre": "Asado",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 84\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M150 22c10 12 14 22 8 34-3 4-6 6-8 6s-5-2-8-6c-6-12-2-22 8-34z\"/><path d=\"M150 44c4 6 5 10 0 14-5-4-4-8 0-14z\"/><path d=\"M104 66h92M104 72h92\" opacity=\".5\"/></svg>",
  "frase": {
   "inicio": "El fuego se prende temprano.",
   "voy": "Anotado. Te guardamos un lugar en la mesa.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te lo perdés. Brindamos por vos."
  }
 },
 "previa": {
  "nombre": "Previa",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 84\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M140 30a18 18 0 1 0 14 28 15 15 0 0 1-14-28z\"/><path d=\"M184 30v10M179 35h10M92 52v8M88 56h8\" opacity=\".7\"/></svg>",
  "frase": {
   "inicio": "Un rato antes de salir.",
   "voy": "Anotado. Arrancamos con vos.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te esperamos en la próxima."
  }
 },
 "playa": {
  "nombre": "Playa",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 84\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"150\" cy=\"30\" r=\"10\"/><path d=\"M40 52q27-10 55 0t55 0 55 0 55 0M60 64q22-8 45 0t45 0 45 0 45 0\" opacity=\".8\"/></svg>",
  "frase": {
   "inicio": "Protector, reposera y buena compañía.",
   "voy": "Anotado. Nos vemos en la arena.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te mandamos una foto del mar."
  }
 },
 "ruta": {
  "nombre": "Ruta",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 84\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M132 16l-52 62M168 16l52 62\"/><path d=\"M150 22v8M150 40v10M150 62v12\"/></svg>",
  "frase": {
   "inicio": "Cargamos nafta y arrancamos.",
   "voy": "Anotado. Tenés un asiento.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te traemos algo del camino."
  }
 },
 "montana": {
  "nombre": "Montaña",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 84\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M70 70l50-40 26 22 22-28 62 46z\"/><path d=\"M168 24l-9 10 9-3 9 3z\" opacity=\".7\"/></svg>",
  "frase": {
   "inicio": "Calzado cómodo y abrigo.",
   "voy": "Anotado. Nos vemos en la cumbre.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te mandamos la vista desde arriba."
  }
 }
};
  var PALABRAS = { cumple: ['cumple', 'cumpleaños', 'birthday'], asado: ['asado', 'parrilla', 'choripán', 'chori'],
    previa: ['previa', 'joda', 'boliche', 'fiesta'], playa: ['playa', 'mar', 'costa', 'pileta'],
    ruta: ['ruta', 'roadtrip', 'viaje en auto'], montana: ['montaña', 'montana', 'sierra', 'cerro', 'trekking'] };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function temaAutomatico(texto) {
    var t = String(texto || '').toLowerCase();
    for (var k in PALABRAS) { for (var i = 0; i < PALABRAS[k].length; i++) { if (t.indexOf(PALABRAS[k][i]) >= 0) return k; } }
    return null; // sin tema: se usa la base sobria
  }
  function frase(tema, respuesta) {
    var f = TEMAS[tema] && TEMAS[tema].frase; if (!f) return '';
    return f[respuesta || 'inicio'] || f.inicio;
  }
  function reduceMotion() { return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function confeti() { /* v3: sin confeti (se mantiene por compatibilidad con quienes lo llaman) */ }
  function iniciales(n) { return String(n || '?').trim().split(/\s+/).slice(0, 2).map(function (x) { return x[0]; }).join('').toUpperCase(); }
  function render(el, o) {
    var t = TEMAS[o.tema]; if (!t) { el.removeAttribute('data-tema'); return false; }
    var r = o.respuesta || null, lista = o.asistentes || [];
    function btn(v, txt) {
      var cls = 'pt-btn' + (!r && v === 'voy' ? ' is-cta' : '');
      return '<button type="button" class="' + cls + '" data-r="' + v + '" aria-pressed="' + (r === v) + '">' + txt + '</button>';
    }
    el.className = (el.className.replace(/\bpt-tema\b/g, '') + ' pt-tema').trim();
    el.setAttribute('data-tema', o.tema);
    el.innerHTML = t.escena +
      '<div class="pt-tema__cuerpo"><div class="pt-tema__kicker">' + esc(o.kicker) + '</div>' +
      '<h2 class="pt-tema__titulo">' + esc(o.titulo) + '</h2><hr class="pt-regla">' +
      '<p class="pt-tema__frase" aria-live="polite">' + esc(r ? frase(o.tema, r) : '') + '</p>' +
      (lista.length ? '<div class="pt-avatares">' + lista.slice(0, 6).map(function (a) {
        return '<span class="pt-av" title="' + esc(a.nombre) + '">' + esc(iniciales(a.nombre)) + (a.emoji ? '<span class="pt-av__emoji">' + esc(a.emoji) + '</span>' : '') + '</span>'; }).join('') +
        '<span style="margin-left:8px;font-size:13px">' + esc(o.conteo || '') + '</span></div>' : (o.conteo ? '<div style="font-size:13px">' + esc(o.conteo) + '</div>' : '')) +
      '<div class="pt-tema__botones" role="group" aria-label="Tu respuesta">' + btn('voy', 'Voy') + btn('aun_no_se', 'Aún no sé') + btn('no_voy', 'No voy') + '</div></div>';
    Array.prototype.forEach.call(el.querySelectorAll('.pt-btn'), function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-r');
        if (typeof o.onResponder === 'function') o.onResponder(v);
      });
    });
    return true;
  }
  global.PintoTemas = { TEMAS: TEMAS, render: render, frase: frase, temaAutomatico: temaAutomatico, confeti: confeti,
    // Equivalencias de respuesta por app (UI común Voy / Aún no sé / No voy)
    desdeJuntada: { voy: 'voy', tal_vez: 'aun_no_se', no_puedo: 'no_voy' },
    aJuntada: { voy: 'voy', aun_no_se: 'tal_vez', no_voy: 'no_puedo' },
    desdeEscapada: { going: 'voy', maybe: 'aun_no_se', declined: 'no_voy', pending: null },
    aEscapada: { voy: 'going', aun_no_se: 'maybe', no_voy: 'declined' } };
})(window);
