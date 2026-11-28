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
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M-5 14Q150 56 305 14\" opacity=\"0.8\"/><path d=\"M17 22L33 22L25 38Z\" fill=\"currentColor\" fill-opacity=\"0.3\" stroke=\"none\"/><path d=\"M62 36L78 36L70 52Z\" fill=\"currentColor\" fill-opacity=\"0.55\" stroke=\"none\"/><path d=\"M107 34L123 34L115 50Z\" fill=\"currentColor\" fill-opacity=\"0.3\" stroke=\"none\"/><path d=\"M137 35L153 35L145 51Z\" fill=\"currentColor\" fill-opacity=\"0.55\" stroke=\"none\"/><path d=\"M167 34L183 34L175 50Z\" fill=\"currentColor\" fill-opacity=\"0.3\" stroke=\"none\"/><path d=\"M212 36L228 36L220 52Z\" fill=\"currentColor\" fill-opacity=\"0.55\" stroke=\"none\"/><path d=\"M257 22L273 22L265 38Z\" fill=\"currentColor\" fill-opacity=\"0.3\" stroke=\"none\"/><path d=\"M52 88v8M48 92h8\" opacity=\"0.7\" stroke-width=\"1.1\"/><path d=\"M250 79v10M245 84h10\" opacity=\"0.7\" stroke-width=\"1.1\"/><circle cx=\"86\" cy=\"60\" r=\"2\" opacity=\"0.6\"/><circle cx=\"226\" cy=\"64\" r=\"2\" opacity=\"0.6\"/><path d=\"M96 126V98H204V126Z\" fill=\"currentColor\" fill-opacity=\"0.32\" stroke=\"none\"/><path d=\"M116 98V76H184V98Z\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><path d=\"M96 98q10 9 20 0t17 0t17 0t17 0t17 0t17 0\" opacity=\"0.9\"/><path d=\"M116 76q10 8 17 0t17 0t17 0t17 0\" opacity=\"0.9\"/><path d=\"M136 76V62\"/><path d=\"M136 52c-4 5-4 8 0 10 4-2 4-5 0-10z\" fill=\"currentColor\" fill-opacity=\"0.85\" stroke=\"none\"/><path d=\"M150 76V62\"/><path d=\"M150 52c-4 5-4 8 0 10 4-2 4-5 0-10z\" fill=\"currentColor\" fill-opacity=\"0.85\" stroke=\"none\"/><path d=\"M164 76V62\"/><path d=\"M164 52c-4 5-4 8 0 10 4-2 4-5 0-10z\" fill=\"currentColor\" fill-opacity=\"0.85\" stroke=\"none\"/><path d=\"M76 126H224\" opacity=\"0.8\"/></svg>",
  "frase": {
   "inicio": "Una tarde para festejar.",
   "voy": "Anotado. Nos vemos para brindar.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Lástima. Te mandamos un abrazo."
  }
 },
 "asado": {
  "nombre": "Asado",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M150 24C178 54 190 80 172 110 162 100 156 94 150 90 144 100 138 106 128 110 110 80 122 54 150 24Z\" fill=\"currentColor\" fill-opacity=\"0.28\" stroke=\"none\"/><path d=\"M150 52C166 74 169 92 158 110 153 104 150 102 150 102 147 104 145 106 142 110 132 94 136 74 150 52Z\" fill=\"currentColor\" fill-opacity=\"0.55\" stroke=\"none\"/><path d=\"M150 80C157 90 158 98 153 108 150 105 150 105 147 108 142 98 144 90 150 80Z\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><path d=\"M60 112H240V118H60Z\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><path d=\"M60 124H240V130H60Z\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><path d=\"M72 112V132H78V112ZM222 112V132H228V112Z\" fill=\"currentColor\" fill-opacity=\"0.6\" stroke=\"none\"/><path d=\"M96 44q-9-9 0-18t0-16\" opacity=\"0.6\"/><path d=\"M206 50q9-9 0-18t0-16\" opacity=\"0.6\"/><circle cx=\"104\" cy=\"70\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.8\" stroke=\"none\"/><circle cx=\"92\" cy=\"92\" r=\"1.6\" fill=\"currentColor\" fill-opacity=\"0.8\" stroke=\"none\"/><circle cx=\"196\" cy=\"80\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.8\" stroke=\"none\"/><circle cx=\"210\" cy=\"100\" r=\"1.6\" fill=\"currentColor\" fill-opacity=\"0.8\" stroke=\"none\"/><circle cx=\"118\" cy=\"52\" r=\"1.4\" fill=\"currentColor\" fill-opacity=\"0.8\" stroke=\"none\"/></svg>",
  "frase": {
   "inicio": "El fuego se prende temprano.",
   "voy": "Anotado. Te guardamos un lugar en la mesa.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te lo perdés. Brindamos por vos."
  }
 },
 "previa": {
  "nombre": "Previa",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M150 0L100 112H200Z\" fill=\"currentColor\" fill-opacity=\"0.07\" stroke=\"none\"/><path d=\"M60 0L20 112H100Z\" fill=\"currentColor\" fill-opacity=\"0.05\" stroke=\"none\"/><path d=\"M240 0L200 112H280Z\" fill=\"currentColor\" fill-opacity=\"0.05\" stroke=\"none\"/><path d=\"M62 24a22 22 0 1 0 18 34a18 18 0 1 1-18-34z\" fill=\"currentColor\" fill-opacity=\"0.65\" stroke=\"none\"/><path d=\"M150 22v8M146 26h8\" opacity=\"0.7\" stroke-width=\"1.1\"/><path d=\"M222 35v10M217 40h10\" opacity=\"0.7\" stroke-width=\"1.1\"/><path d=\"M110 15v6M107 18h6\" opacity=\"0.7\" stroke-width=\"1.1\"/><path d=\"M270 19v6M267 22h6\" opacity=\"0.7\" stroke-width=\"1.1\"/><path d=\"M0 140V100H22V82H44V104H62V72H88V104H108V90H132V106H150V66H182V104H204V86H228V102H250V76H278V104H300V140Z\" fill=\"currentColor\" fill-opacity=\"0.3\" stroke=\"none\"/><path d=\"M0 140V118H30V106H56V120H92V110H126V122H160V112H196V120H232V108H262V120H300V140Z\" fill=\"currentColor\" fill-opacity=\"0.2\" stroke=\"none\"/><circle cx=\"160\" cy=\"78\" r=\"1.2\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"170\" cy=\"78\" r=\"1.2\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"160\" cy=\"88\" r=\"1.2\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"170\" cy=\"92\" r=\"1.2\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"66\" cy=\"84\" r=\"1.2\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"76\" cy=\"92\" r=\"1.2\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"236\" cy=\"90\" r=\"1.2\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"242\" cy=\"98\" r=\"1.2\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/></svg>",
  "frase": {
   "inicio": "Un rato antes de salir.",
   "voy": "Anotado. Arrancamos con vos.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te esperamos en la próxima."
  }
 },
 "playa": {
  "nombre": "Playa",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"214\" cy=\"46\" r=\"22\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"214\" cy=\"46\" r=\"32\" opacity=\"0.35\"/><circle cx=\"214\" cy=\"46\" r=\"42\" opacity=\"0.2\"/><path d=\"M140 44q6-6 12 0q6-6 12 0\" opacity=\"0.8\"/><path d=\"M0 84Q38 72 75 84T150 84T225 84T300 84V140H0Z\" fill=\"currentColor\" fill-opacity=\"0.18\" stroke=\"none\"/><path d=\"M0 100Q38 88 75 100T150 100T225 100T300 100V140H0Z\" fill=\"currentColor\" fill-opacity=\"0.32\" stroke=\"none\"/><path d=\"M0 118Q50 106 100 118T200 118T300 116V140H0Z\" fill=\"currentColor\" fill-opacity=\"0.6\" stroke=\"none\"/><path d=\"M70 122L84 64\" stroke-width=\"1.6\"/><path d=\"M50 72Q82 34 118 68Z\" fill=\"currentColor\" fill-opacity=\"0.7\" stroke=\"none\"/><path d=\"M84 64V52\" stroke-width=\"1.2\"/></svg>",
  "frase": {
   "inicio": "Protector, reposera y buena compañía.",
   "voy": "Anotado. Nos vemos en la arena.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te mandamos una foto del mar."
  }
 },
 "ruta": {
  "nombre": "Ruta",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"208\" cy=\"40\" r=\"18\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><path d=\"M0 88L50 54 96 88 140 62 190 88 240 58 300 88V140H0Z\" fill=\"currentColor\" fill-opacity=\"0.18\" stroke=\"none\"/><path d=\"M0 88H300V140H0Z\" fill=\"currentColor\" fill-opacity=\"0.3\" stroke=\"none\"/><path d=\"M140 88H160L282 140H18Z\" fill=\"currentColor\" fill-opacity=\"0.6\" stroke=\"none\"/><path d=\"M150 94v8M150 110v12M150 130v10\" opacity=\"0.9\" stroke-width=\"1.8\"/><path d=\"M18 140L140 88M282 140L160 88\" opacity=\"0.8\"/><path d=\"M236 112V84\" stroke-width=\"1.6\"/><path d=\"M224 82h26v12h-26z\" fill=\"currentColor\" fill-opacity=\"0.8\" stroke=\"none\"/></svg>",
  "frase": {
   "inicio": "Cargamos nafta y arrancamos.",
   "voy": "Anotado. Tenés un asiento.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te traemos algo del camino."
  }
 },
 "montana": {
  "nombre": "Montaña",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"78\" cy=\"38\" r=\"14\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><path d=\"M0 124L70 58 120 104 170 42 250 120 300 92V140H0Z\" fill=\"currentColor\" fill-opacity=\"0.18\" stroke=\"none\"/><path d=\"M-10 140L92 68 166 140Z\" fill=\"currentColor\" fill-opacity=\"0.4\" stroke=\"none\"/><path d=\"M112 140L204 50 304 140Z\" fill=\"currentColor\" fill-opacity=\"0.62\" stroke=\"none\"/><path d=\"M204 50l-15 17 11-4 5 8 6-8 11 4z\" fill=\"currentColor\" fill-opacity=\"0.95\" stroke=\"none\"/><path d=\"M92 68l-10 12 8-3 4 6 5-6 8 3z\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><path d=\"M30 140l7-22 7 22z\" fill=\"currentColor\" fill-opacity=\"0.85\" stroke=\"none\"/><path d=\"M30 128l7-20 7 20z\" fill=\"currentColor\" fill-opacity=\"0.7\" stroke=\"none\"/><path d=\"M54 140l7-22 7 22z\" fill=\"currentColor\" fill-opacity=\"0.85\" stroke=\"none\"/><path d=\"M54 128l7-20 7 20z\" fill=\"currentColor\" fill-opacity=\"0.7\" stroke=\"none\"/></svg>",
  "frase": {
   "inicio": "Calzado cómodo y abrigo.",
   "voy": "Anotado. Nos vemos en la cumbre.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te mandamos la vista desde arriba."
  }
 },
 "ochentas": {
  "nombre": "Ochentas",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><defs><mask id=\"ptm\"><rect width=\"300\" height=\"140\" fill=\"#fff\"/><rect y=\"70\" width=\"300\" height=\"3\" fill=\"#000\"/><rect y=\"79\" width=\"300\" height=\"4\" fill=\"#000\"/><rect y=\"88\" width=\"300\" height=\"5\" fill=\"#000\"/></mask></defs><circle cx=\"150\" cy=\"70\" r=\"46\" fill=\"currentColor\" fill-opacity=\".85\" stroke=\"none\" mask=\"url(#ptm)\"/><rect y=\"98\" width=\"300\" height=\"42\" style=\"fill:var(--pt-bg)\" stroke=\"none\"/><path d=\"M0 98H300\" stroke-width=\"1.8\"/><path d=\"M0 106 H300\" opacity=\"0.8\"/><path d=\"M0 116 H300\" opacity=\"0.8\"/><path d=\"M0 130 H300\" opacity=\"0.8\"/><path d=\"M150 98L-60 140\" opacity=\"0.8\"/><path d=\"M150 98L0 140\" opacity=\"0.8\"/><path d=\"M150 98L60 140\" opacity=\"0.8\"/><path d=\"M150 98L110 140\" opacity=\"0.8\"/><path d=\"M150 98L150 140\" opacity=\"0.8\"/><path d=\"M150 98L190 140\" opacity=\"0.8\"/><path d=\"M150 98L240 140\" opacity=\"0.8\"/><path d=\"M150 98L300 140\" opacity=\"0.8\"/><path d=\"M150 98L360 140\" opacity=\"0.8\"/><path d=\"M46 25v10M41 30h10\" opacity=\"0.7\" stroke-width=\"1.1\"/><path d=\"M250 22v8M246 26h8\" opacity=\"0.7\" stroke-width=\"1.1\"/><path d=\"M214 51v6M211 54h6\" opacity=\"0.7\" stroke-width=\"1.1\"/><circle cx=\"90\" cy=\"20\" r=\"1.6\"/><circle cx=\"70\" cy=\"64\" r=\"1.4\"/></svg>",
  "frase": {
   "inicio": "Prendé el neón: arranca la noche.",
   "voy": "Anotado. Nos vemos en la pista.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Qué lástima. Ponemos tu canción igual."
  }
 },
 "noventas": {
  "nombre": "Noventas",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"62\" cy=\"52\" r=\"28\" fill=\"currentColor\" fill-opacity=\"0.22\" stroke=\"none\"/><path d=\"M214 24L262 104H166Z\" fill=\"currentColor\" fill-opacity=\"0.34\" stroke=\"none\"/><path d=\"M116 36h38v38h-38z\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\" transform=\"rotate(14 135 55)\"/><path d=\"M28 112q10-14 20 0t20 0t20 0t20 0\" stroke-width=\"2\"/><path d=\"M178 118l10-12 10 12 10-12 10 12 10-12\" stroke-width=\"2\"/><circle cx=\"250\" cy=\"44\" r=\"14\"/><circle cx=\"92\" cy=\"98\" r=\"6\"/><circle cx=\"22\" cy=\"24\" r=\"1.8\" fill=\"currentColor\" fill-opacity=\"0.7\" stroke=\"none\"/><circle cx=\"22\" cy=\"36\" r=\"1.8\" fill=\"currentColor\" fill-opacity=\"0.7\" stroke=\"none\"/><circle cx=\"34\" cy=\"24\" r=\"1.8\" fill=\"currentColor\" fill-opacity=\"0.7\" stroke=\"none\"/><circle cx=\"34\" cy=\"36\" r=\"1.8\" fill=\"currentColor\" fill-opacity=\"0.7\" stroke=\"none\"/><circle cx=\"46\" cy=\"24\" r=\"1.8\" fill=\"currentColor\" fill-opacity=\"0.7\" stroke=\"none\"/><circle cx=\"46\" cy=\"36\" r=\"1.8\" fill=\"currentColor\" fill-opacity=\"0.7\" stroke=\"none\"/><path d=\"M104 96l24 24M128 96l-24 24\" opacity=\"0.8\" stroke-width=\"1.6\"/></svg>",
  "frase": {
   "inicio": "Rebobiná el casete: noche de los 90.",
   "voy": "Anotado. Llevá tu mejor remera de banda.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te guardamos el pasillo del casete."
  }
 },
 "rock": {
  "nombre": "Rock",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 134H50\" opacity=\"0.4\"/><path d=\"M130 134H170\" opacity=\"0.4\"/><path d=\"M250 134H290\" opacity=\"0.4\"/><path d=\"M170 6L112 82H144L128 134 190 54H154Z\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><rect x=\"26\" y=\"34\" width=\"60\" height=\"80\" rx=\"6\" fill=\"currentColor\" fill-opacity=\".25\" stroke=\"none\"/><rect x=\"26\" y=\"34\" width=\"60\" height=\"80\" rx=\"6\" opacity=\".7\"/><circle cx=\"56\" cy=\"88\" r=\"19\" opacity=\".8\"/><circle cx=\"56\" cy=\"88\" r=\"8\" fill=\"currentColor\" fill-opacity=\".6\" stroke=\"none\"/><circle cx=\"56\" cy=\"50\" r=\"3.5\" fill=\"currentColor\" fill-opacity=\".7\" stroke=\"none\"/><path d=\"M222 56a32 32 0 0 1 0 44M236 44a50 50 0 0 1 0 68M250 32a68 68 0 0 1 0 92\" opacity=\"0.8\" stroke-width=\"1.4\"/><path d=\"M36 115v6M33 118h6\" opacity=\"0.7\" stroke-width=\"1.1\"/><path d=\"M268 15v6M265 18h6\" opacity=\"0.7\" stroke-width=\"1.1\"/></svg>",
  "frase": {
   "inicio": "Se enchufan los amplis.",
   "voy": "Anotado. Guardate la voz para el estribillo.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te tocamos una por vos."
  }
 },
 "futbol": {
  "nombre": "Fútbol",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 0L64 112H0V60Z\" fill=\"currentColor\" fill-opacity=\"0.07\" stroke=\"none\"/><path d=\"M280 0L236 112H300V60Z\" fill=\"currentColor\" fill-opacity=\"0.07\" stroke=\"none\"/><path d=\"M0 112H300V140H0Z\" fill=\"currentColor\" fill-opacity=\"0.26\" stroke=\"none\"/><path d=\"M0 112H300\" opacity=\"0.8\"/><path d=\"M92 112a58 22 0 0 1 116 0\" opacity=\"0.7\"/><path d=\"M150 112v28\" opacity=\"0.7\"/><circle cx=\"150\" cy=\"64\" r=\"36\" fill=\"currentColor\" fill-opacity=\".14\"/><path d=\"M150 44l16 12-6 19h-20l-6-19z\" fill=\"currentColor\" fill-opacity=\"0.85\" stroke=\"none\"/><path d=\"M150 44V30M166 56l15-5M160 75l10 14M140 75l-10 14M134 56l-15-5\" opacity=\"0.9\"/><path d=\"M181 51a36 36 0 0 1 4 24M119 51a36 36 0 0 0-4 24\" opacity=\"0.5\"/><path d=\"M48 32v8M44 36h8\" opacity=\"0.7\" stroke-width=\"1.1\"/><path d=\"M256 27v6M253 30h6\" opacity=\"0.7\" stroke-width=\"1.1\"/></svg>",
  "frase": {
   "inicio": "Pelota al piso y a jugar.",
   "voy": "Anotado. Sos titular.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te quedás en el banco. Te guardamos un lugar."
  }
 },
 "perrito": {
  "nombre": "Perrito",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M118 46C98 44 92 74 104 94 120 90 126 72 124 50Z\" fill=\"currentColor\" fill-opacity=\"0.62\" stroke=\"none\"/><path d=\"M182 46C202 44 208 74 196 94 180 90 174 72 176 50Z\" fill=\"currentColor\" fill-opacity=\"0.62\" stroke=\"none\"/><ellipse cx=\"150\" cy=\"70\" rx=\"36\" ry=\"34\" fill=\"currentColor\" fill-opacity=\".2\"/><ellipse cx=\"150\" cy=\"88\" rx=\"17\" ry=\"13\" fill=\"currentColor\" fill-opacity=\".38\" stroke=\"none\"/><path d=\"M143 76h14l-7 7z\" fill=\"currentColor\" fill-opacity=\"0.95\" stroke=\"none\"/><circle cx=\"137\" cy=\"64\" r=\"2.6\" fill=\"currentColor\" fill-opacity=\"0.95\" stroke=\"none\"/><circle cx=\"163\" cy=\"64\" r=\"2.6\" fill=\"currentColor\" fill-opacity=\"0.95\" stroke=\"none\"/><path d=\"M150 83v7M141 92q9 7 9 0 0 7 9 0\"/><path d=\"M146 93q4 11 8 0z\" fill=\"currentColor\" fill-opacity=\"0.75\" stroke=\"none\"/><path d=\"M118 114q32 16 64 0\" opacity=\"0.9\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"126\" r=\"5.5\" fill=\"currentColor\" fill-opacity=\"0.85\" stroke=\"none\"/><circle cx=\"48\" cy=\"104\" r=\"4\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"43\" cy=\"97\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"48\" cy=\"97\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"53\" cy=\"97\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"72\" cy=\"120\" r=\"4\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"67\" cy=\"113\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"72\" cy=\"113\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"77\" cy=\"113\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"252\" cy=\"98\" r=\"4\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"247\" cy=\"91\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"252\" cy=\"91\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"257\" cy=\"91\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"228\" cy=\"118\" r=\"4\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"223\" cy=\"111\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"228\" cy=\"111\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"233\" cy=\"111\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/></svg>",
  "frase": {
   "inicio": "Una tarde tranqui, de las que mueven la cola.",
   "voy": "Anotado. Venís con buena onda.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te mandamos un ladrido de cariño."
  }
 },
 "vintage": {
  "nombre": "Vintage",
  "escena": "<svg class=\"pt-escena-svg\" aria-hidden=\"true\" viewBox=\"0 0 300 140\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M24 136V140\" opacity=\"0.7\"/><path d=\"M52 132V140\" opacity=\"0.7\"/><path d=\"M84 138V140\" opacity=\"0.7\"/><path d=\"M118 134V140\" opacity=\"0.7\"/><path d=\"M182 136V140\" opacity=\"0.7\"/><path d=\"M206 132V140\" opacity=\"0.7\"/><path d=\"M268 134V140\" opacity=\"0.7\"/><path d=\"M286 138V140\" opacity=\"0.7\"/><circle cx=\"30.9\" cy=\"128.0\" r=\"6\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"26.1\" cy=\"134.6\" r=\"6\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"18.4\" cy=\"132.1\" r=\"6\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"18.4\" cy=\"123.9\" r=\"6\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"26.1\" cy=\"121.4\" r=\"6\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"24\" cy=\"128\" r=\"4.199999999999999\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"60.0\" cy=\"124.0\" r=\"7\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"54.5\" cy=\"131.7\" r=\"7\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"45.5\" cy=\"128.7\" r=\"7\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"45.5\" cy=\"119.3\" r=\"7\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"54.5\" cy=\"116.3\" r=\"7\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"52\" cy=\"124\" r=\"4.8999999999999995\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"89.8\" cy=\"130.0\" r=\"5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"85.8\" cy=\"135.5\" r=\"5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"79.3\" cy=\"133.4\" r=\"5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"79.3\" cy=\"126.6\" r=\"5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"85.8\" cy=\"124.5\" r=\"5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"84\" cy=\"130\" r=\"3.5\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"125.5\" cy=\"126.0\" r=\"6.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"120.3\" cy=\"133.1\" r=\"6.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"112.0\" cy=\"130.4\" r=\"6.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"112.0\" cy=\"121.6\" r=\"6.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"120.3\" cy=\"118.9\" r=\"6.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"118\" cy=\"126\" r=\"4.55\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"188.3\" cy=\"128.0\" r=\"5.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"184.0\" cy=\"134.0\" r=\"5.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"176.9\" cy=\"131.7\" r=\"5.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"176.9\" cy=\"124.3\" r=\"5.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"184.0\" cy=\"122.0\" r=\"5.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"182\" cy=\"128\" r=\"3.8499999999999996\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"214.1\" cy=\"124.0\" r=\"7\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"208.5\" cy=\"131.7\" r=\"7\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"199.5\" cy=\"128.7\" r=\"7\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"199.5\" cy=\"119.3\" r=\"7\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"208.5\" cy=\"116.3\" r=\"7\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"206\" cy=\"124\" r=\"4.8999999999999995\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"275.5\" cy=\"126.0\" r=\"6.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"270.3\" cy=\"133.1\" r=\"6.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"262.0\" cy=\"130.4\" r=\"6.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"262.0\" cy=\"121.6\" r=\"6.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"270.3\" cy=\"118.9\" r=\"6.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"268\" cy=\"126\" r=\"4.55\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"291.2\" cy=\"130.0\" r=\"4.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"287.6\" cy=\"134.9\" r=\"4.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"281.8\" cy=\"133.0\" r=\"4.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"281.8\" cy=\"127.0\" r=\"4.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"287.6\" cy=\"125.1\" r=\"4.5\" fill=\"currentColor\" fill-opacity=\"0.45\" stroke=\"none\"/><circle cx=\"286\" cy=\"130\" r=\"3.15\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><path d=\"M92 84Q150 56 208 84Q196 100 150 102 104 100 92 84Z\" fill=\"currentColor\" fill-opacity=\"0.3\" stroke=\"none\"/><path d=\"M120 76Q120 40 150 40T180 76Z\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><path d=\"M121 70Q150 80 179 70\" stroke-width=\"2.4\"/><path d=\"M176 68l16-6-4 14zM176 68l14 10-6 2z\" fill=\"currentColor\" fill-opacity=\"0.7\" stroke=\"none\"/><path d=\"M92 84Q150 56 208 84Q196 100 150 102 104 100 92 84Z\" opacity=\"0.8\"/><path d=\"M226 100h36l-5 22h-26z\" fill=\"currentColor\" fill-opacity=\"0.4\" stroke=\"none\"/><path d=\"M226 100h36l-5 22h-26zM230 108h28M229 115h30\" opacity=\"0.8\"/><path d=\"M230 100q14-28 28 0\" opacity=\"0.9\" stroke-width=\"1.6\"/><circle cx=\"49.5\" cy=\"40.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"47.1\" cy=\"43.3\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"43.2\" cy=\"42.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"43.2\" cy=\"38.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"47.1\" cy=\"36.7\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"46\" cy=\"40\" r=\"2.0999999999999996\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"253.4\" cy=\"40.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"251.1\" cy=\"43.3\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"247.2\" cy=\"42.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"247.2\" cy=\"38.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"251.1\" cy=\"36.7\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"250\" cy=\"40\" r=\"2.0999999999999996\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"73.5\" cy=\"64.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"71.1\" cy=\"67.3\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"67.2\" cy=\"66.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"67.2\" cy=\"62.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"71.1\" cy=\"60.7\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"70\" cy=\"64\" r=\"2.0999999999999996\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"239.4\" cy=\"66.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"237.1\" cy=\"69.3\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"233.2\" cy=\"68.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"233.2\" cy=\"64.0\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"237.1\" cy=\"62.7\" r=\"3\" fill=\"currentColor\" fill-opacity=\"0.5\" stroke=\"none\"/><circle cx=\"236\" cy=\"66\" r=\"2.0999999999999996\" fill=\"currentColor\" fill-opacity=\"0.9\" stroke=\"none\"/><circle cx=\"150\" cy=\"22\" r=\"1.6\" fill=\"currentColor\" fill-opacity=\"0.6\" stroke=\"none\"/><circle cx=\"100\" cy=\"30\" r=\"1.4\" fill=\"currentColor\" fill-opacity=\"0.6\" stroke=\"none\"/><circle cx=\"206\" cy=\"28\" r=\"1.4\" fill=\"currentColor\" fill-opacity=\"0.6\" stroke=\"none\"/></svg>",
  "frase": {
   "inicio": "Una tarde de flores, té y buena compañía.",
   "voy": "Anotado. Te esperamos con el té listo.",
   "aun_no_se": "Sin apuro; avisá cuando sepas.",
   "no_voy": "Te guardamos un lugar para la próxima."
  }
 }
};
  var PALABRAS = { cumple: ['cumple', 'cumpleaños', 'birthday'], asado: ['asado', 'parrilla', 'choripán', 'chori'],
    previa: ['previa', 'joda', 'boliche', 'fiesta'], playa: ['playa', 'mar', 'costa', 'pileta'],
    ruta: ['ruta', 'roadtrip', 'viaje en auto'], montana: ['montaña', 'montana', 'sierra', 'cerro', 'trekking'],
    ochentas: ['80s', '80\'s', 'ochentas', 'años 80', 'retro'], noventas: ['90s', '90\'s', 'noventas', 'años 90'],
    rock: ['rock', 'recital', 'banda', 'metal'], futbol: ['fútbol', 'futbol', 'partido', 'mundial', 'cancha', 'picado'], perrito: ['perro', 'perrito', 'mascota', 'peludo'],
    vintage: ['vintage', 'años 70', '70s', 'flores', 'merienda', 'té'] };
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
