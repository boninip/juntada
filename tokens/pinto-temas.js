/* pinto-temas.js v3.1 «editorial sobrio» + temáticas (ochentas, noventas, rock, futbol, perrito; ver propuesta de migración) · PROPUESTA (28/11/2026), pendiente de aprobación de Pau para todo el ecosistema.
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
 },
 "ochentas": {
 "nombre": "Ochentas",
 "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 84\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M110 54a40 40 0 0 1 80 0z\"/><path d=\"M118 46h64M114 50h72\" opacity=\".7\"/><path d=\"M10 56h280M10 64h280M10 76h280\" opacity=\".8\"/><path d=\"M150 56v28M110 56L70 84M190 56l40 28M70 56L10 84M230 56l60 28\" opacity=\".8\"/></svg>",
 "frase": {
  "inicio": "Prendé el neón: arranca la noche.",
  "voy": "Anotado. Nos vemos en la pista.",
  "aun_no_se": "Sin apuro; avisá cuando sepas.",
  "no_voy": "Qué lástima. Ponemos tu canción igual."
 }
},
 "noventas": {
 "nombre": "Noventas",
 "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 84\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M40 52q10-14 20 0t20 0t20 0\"/><path d=\"M200 28l17 30h-34z\"/><circle cx=\"244\" cy=\"40\" r=\"9\"/><path d=\"M104 28l8 11 8-11 8 11 8-11\"/><path d=\"M60 70h60M180 70h60\" opacity=\".6\"/></svg>",
 "frase": {
  "inicio": "Rebobiná el casete: noche de los 90.",
  "voy": "Anotado. Llevá tu mejor remera de banda.",
  "aun_no_se": "Sin apuro; avisá cuando sepas.",
  "no_voy": "Te guardamos el pasillo del casete."
 }
},
 "rock": {
 "nombre": "Rock",
 "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 84\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M158 12l-24 36h17l-9 24 30-40h-18z\"/><path d=\"M50 42h60M190 42h60M70 54h40M190 54h40\" opacity=\".6\"/></svg>",
 "frase": {
  "inicio": "Se enchufan los amplis.",
  "voy": "Anotado. Guardate la voz para el estribillo.",
  "aun_no_se": "Sin apuro; avisá cuando sepas.",
  "no_voy": "Te tocamos una por vos."
 }
},
 "futbol": {
 "nombre": "Fútbol",
 "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 84\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"150\" cy=\"42\" r=\"24\"/><path d=\"M150 31l9 7-3 11h-12l-3-11z\"/><path d=\"M150 31v-7M159 38l8-3M156 49l5 7M144 49l-5 7M141 38l-8-3\"/><path d=\"M30 76h240\" opacity=\".6\"/></svg>",
 "frase": {
  "inicio": "Pelota al piso y a jugar.",
  "voy": "Anotado. Sos titular.",
  "aun_no_se": "Sin apuro; avisá cuando sepas.",
  "no_voy": "Te quedás en el banco. Te guardamos un lugar."
 }
},
 "perrito": {
 "nombre": "Perrito",
 "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 84\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M122 58c-4-14 0-30 12-34 6 0 10 4 12 8h8c2-4 6-8 12-8 12 4 16 20 12 34-6 8-14 12-24 12s-18-4-24-12z\"/><circle cx=\"138\" cy=\"44\" r=\"1.8\" fill=\"currentColor\"/><circle cx=\"162\" cy=\"44\" r=\"1.8\" fill=\"currentColor\"/><path d=\"M146 52h8l-4 5z\" fill=\"currentColor\"/><path d=\"M142 62q8 5 16 0\" /><path d=\"M60 70h50M190 70h50\" opacity=\".5\"/></svg>",
 "frase": {
  "inicio": "Una tarde tranqui, de las que mueven la cola.",
  "voy": "Anotado. Venís con buena onda.",
  "aun_no_se": "Sin apuro; avisá cuando sepas.",
  "no_voy": "Te mandamos un ladrido de cariño."
 }
}
};
  var PALABRAS = { cumple: ['cumple', 'cumpleaños', 'birthday'], asado: ['asado', 'parrilla', 'choripán', 'chori'],
    previa: ['previa', 'joda', 'boliche', 'fiesta'], playa: ['playa', 'mar', 'costa', 'pileta'],
    ruta: ['ruta', 'roadtrip', 'viaje en auto'], montana: ['montaña', 'montana', 'sierra', 'cerro', 'trekking'],
    ochentas: ['80s', '80\'s', 'ochentas', 'años 80', 'retro'], noventas: ['90s', '90\'s', 'noventas', 'años 90'],
    rock: ['rock', 'recital', 'banda', 'metal'], futbol: ['fútbol', 'futbol', 'partido', 'mundial', 'cancha', 'picado'], perrito: ['perro', 'perrito', 'mascota', 'peludo'] };
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
