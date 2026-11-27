/* pinto-temas.js v1 · capa expresiva (temas v2 aprobados 27/11/2026).
 * Uso: PintoTemas.render(contenedor, {tema, titulo, kicker, respuesta, asistentes, conteo, onResponder})
 * respuesta: 'voy' | 'aun_no_se' | 'no_voy' | null. El servidor sigue siendo la autoridad: esto solo pinta.
 */
(function (global) {
  'use strict';
  var TEMAS = {
 "cumple": {
  "nombre": "Cumple",
  "sticker": "¡Pintó torta!",
  "escena": "<svg aria-hidden=\"true\" viewBox=\"0 0 300 160\" style=\"display:block;width:100%;height:auto;background:#FFC9DA\"><circle cx=\"40\" cy=\"36\" r=\"9\" fill=\"#C2185B\"/><circle cx=\"250\" cy=\"120\" r=\"12\" fill=\"#F2C14E\"/><circle cx=\"150\" cy=\"110\" r=\"44\" fill=\"#FFE3EC\"/><rect x=\"128\" y=\"92\" rx=\"6\" fill=\"#C2185B\"/><rect x=\"146\" y=\"72\" rx=\"3\" fill=\"#F2C14E\"/><rect x=\"80\" y=\"60\" rx=\"3\" fill=\"#1F5F6B\" transform=\"rotate(30 87 63)\"/><circle cx=\"60\" cy=\"120\" r=\"6\" fill=\"#1F5F6B\"/><rect x=\"210\" y=\"100\" rx=\"3\" fill=\"#C2185B\" transform=\"rotate(-25 217 103)\"/></svg>",
  "frase": {
   "inicio": "Vení con ganas de festejar.",
   "voy": "¡Sos de los que van! Prepará la voz para el feliz cumple.",
   "aun_no_se": "Tranqui, avisá cuando sepas.",
   "no_voy": "Una lástima. Le mandamos tu saludo."
  }
 },
 "asado": {
  "nombre": "Asado",
  "sticker": "¡Pintó asado!",
  "escena": "<svg aria-hidden=\"true\" viewBox=\"0 0 300 160\" style=\"display:block;width:100%;height:auto;background:#2A190F\"><path d=\"M150 30 C175 60 182 80 168 104 C160 90 156 84 150 80 C146 90 140 96 132 104 C118 82 126 58 150 30Z\" fill=\"#F2A65A\"/><path d=\"M150 66 C160 82 162 92 156 104 C152 98 150 96 150 96 C148 98 146 100 144 104 C138 94 140 82 150 66Z\" fill=\"#F2C14E\"/><rect x=\"70\" y=\"112\" rx=\"3\" fill=\"#8A5A3B\"/><rect x=\"70\" y=\"124\" rx=\"3\" fill=\"#8A5A3B\"/><circle cx=\"96\" cy=\"60\" r=\"3\" fill=\"#F2A65A\"/><circle cx=\"80\" cy=\"88\" r=\"2.5\" fill=\"#F2C14E\"/><circle cx=\"226\" cy=\"96\" r=\"2.5\" fill=\"#F2C14E\"/></svg>",
  "frase": {
   "inicio": "El fuego se prende temprano. Llegá con hambre.",
   "voy": "¡Adentro! Ya te guardamos un choripán.",
   "aun_no_se": "Tranqui, avisá cuando sepas.",
   "no_voy": "Te lo perdés. Brindamos por vos."
  }
 },
 "previa": {
  "nombre": "Previa",
  "sticker": "¡Pintó previa!",
  "escena": "<svg aria-hidden=\"true\" viewBox=\"0 0 300 160\" style=\"display:block;width:100%;height:auto;background:#15122B\"><circle cx=\"60\" cy=\"52\" r=\"24\" fill=\"#F2C14E\"/><circle cx=\"72\" cy=\"44\" r=\"22\" fill=\"#15122B\"/><path d=\"M150 40 L154 52 L166 56 L154 60 L150 72 L146 60 L134 56 L146 52Z\" fill=\"#F4F0FF\"/><path d=\"M220 84 L223 93 L232 96 L223 99 L220 108 L217 99 L208 96 L217 93Z\" fill=\"#F2C14E\"/><circle cx=\"110\" cy=\"100\" r=\"2\" fill=\"#F4F0FF\"/><circle cx=\"270\" cy=\"40\" r=\"2\" fill=\"#F4F0FF\"/><rect x=\"0\" y=\"136\" fill=\"#2B2650\"/><rect x=\"40\" y=\"120\" fill=\"#2B2650\"/><rect x=\"200\" y=\"112\" fill=\"#2B2650\"/></svg>",
  "frase": {
   "inicio": "Calentamos motores antes de salir.",
   "voy": "¡Esa! Arranca la previa con vos.",
   "aun_no_se": "Tranqui, avisá cuando sepas.",
   "no_voy": "Te esperamos en la próxima."
  }
 },
 "playa": {
  "nombre": "Playa",
  "sticker": "¡Pintó playa!",
  "escena": "<svg aria-hidden=\"true\" viewBox=\"0 0 300 160\" style=\"display:block;width:100%;height:auto;background:#CFEAEA\"><circle cx=\"150\" cy=\"54\" r=\"26\" fill=\"#F2C14E\"/><path d=\"M0 92 Q37 80 75 92 T150 92 T225 92 T300 92 V160 H0Z\" fill=\"#6FB8C4\"/><path d=\"M0 108 Q37 96 75 108 T150 108 T225 108 T300 108 V160 H0Z\" fill=\"#1F5F6B\"/><path d=\"M0 132 Q75 118 150 128 T300 126 V160 H0Z\" fill=\"#F3E3C3\"/><path d=\"M60 132 L60 70\" stroke=\"#5B4636\" stroke-width=\"3\"/><path d=\"M28 76 Q60 46 92 76Z\" fill=\"#BE4B2C\"/></svg>",
  "frase": {
   "inicio": "Protector, reposera y buena onda.",
   "voy": "¡Nos vemos en la arena!",
   "aun_no_se": "Tranqui, avisá cuando sepas.",
   "no_voy": "Te mandamos una foto del mar."
  }
 },
 "ruta": {
  "nombre": "Ruta",
  "sticker": "¡Pintó ruta!",
  "escena": "<svg aria-hidden=\"true\" viewBox=\"0 0 300 160\" style=\"display:block;width:100%;height:auto;background:#F6D9A8\"><circle cx=\"90\" cy=\"54\" r=\"26\" fill=\"#F2C14E\"/><rect x=\"0\" y=\"80\" fill=\"#C9B48C\"/><path d=\"M130 80 L170 80 L250 160 L50 160Z\" fill=\"#4A4540\"/><path d=\"M150 86 L150 96 M150 106 L150 120 M150 132 L150 152\" stroke=\"#F3E9D7\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M0 80 L60 60 L110 80Z M190 80 L250 56 L300 76 L300 80Z\" fill=\"#BE4B2C\"/></svg>",
  "frase": {
   "inicio": "Cargamos nafta y arrancamos.",
   "voy": "¡Subiste! Vos elegís la primera canción.",
   "aun_no_se": "Tranqui, avisá cuando sepas.",
   "no_voy": "Te traemos un recuerdito del camino."
  }
 },
 "montana": {
  "nombre": "Montaña",
  "sticker": "¡Pintó montaña!",
  "escena": "<svg aria-hidden=\"true\" viewBox=\"0 0 300 160\" style=\"display:block;width:100%;height:auto;background:#CFE0E6\"><circle cx=\"70\" cy=\"44\" r=\"18\" fill=\"#F2C14E\"/><path d=\"M0 160 L90 60 L160 160Z\" fill=\"#4E7A63\"/><path d=\"M90 160 L190 40 L300 160Z\" fill=\"#2F5D46\"/><path d=\"M190 40 L170 64 L182 60 L190 70 L200 60 L212 66Z\" fill=\"#F4F7F5\"/><path d=\"M90 60 L78 74 L90 70 L102 76Z\" fill=\"#F4F7F5\"/></svg>",
  "frase": {
   "inicio": "Calzado cómodo y abrigo, que arriba refresca.",
   "voy": "¡Arriba! Nos vemos en la cumbre.",
   "aun_no_se": "Tranqui, avisá cuando sepas.",
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
  function confeti(el) {
    if (reduceMotion()) return;
    var cs = getComputedStyle(el), cols = [cs.getPropertyValue('--pt-ac'), '#F2C14E', cs.getPropertyValue('--pt-tx')];
    for (var i = 0; i < 18; i++) {
      var p = document.createElement('span'); p.className = 'pt-cf';
      var a = (i / 18) * Math.PI * 2, d = 70 + Math.random() * 60;
      p.style.setProperty('--x', Math.round(Math.cos(a) * d) + 'px'); p.style.setProperty('--y', Math.round(Math.sin(a) * d - 30) + 'px');
      p.style.background = cols[i % 3]; el.appendChild(p);
      setTimeout(function (n) { return function () { n.remove(); }; }(p), 1200);
    }
  }
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
    el.innerHTML = t.escena + '<div class="pt-sticker" aria-hidden="true">' + esc(t.sticker) + '</div>' +
      '<div class="pt-tema__cuerpo"><div class="pt-tema__kicker">' + esc(o.kicker) + '</div>' +
      '<h2 class="pt-tema__titulo">' + esc(o.titulo) + '</h2>' +
      '<p class="pt-tema__frase" aria-live="polite">' + esc(frase(o.tema, r)) + '</p>' +
      (lista.length ? '<div class="pt-avatares">' + lista.slice(0, 6).map(function (a) {
        return '<span class="pt-av" title="' + esc(a.nombre) + '">' + esc(iniciales(a.nombre)) + (a.emoji ? '<span class="pt-av__emoji">' + esc(a.emoji) + '</span>' : '') + '</span>'; }).join('') +
        '<span style="margin-left:8px;font-size:13px">' + esc(o.conteo || '') + '</span></div>' : (o.conteo ? '<div style="font-size:13px">' + esc(o.conteo) + '</div>' : '')) +
      '<div class="pt-tema__botones" role="group" aria-label="Tu respuesta">' + btn('voy', 'Voy') + btn('aun_no_se', 'Aún no sé') + btn('no_voy', 'No voy') + '</div></div>';
    Array.prototype.forEach.call(el.querySelectorAll('.pt-btn'), function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-r');
        if (typeof o.onResponder === 'function') o.onResponder(v);
        if (v === 'voy' && r !== 'voy') confeti(el);
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
