# Juntada V1.16 — regresión técnica (2026-11-11)

## Alcance
Vista previa `preview-v116.html`. No se modificó `index.html` ni Supabase.

## Comprobaciones estáticas realizadas
- [x] HTML completo con viewport móvil y 15 secciones.
- [x] Cinco bloques JavaScript analizados sin errores de sintaxis.
- [x] 84 elementos button y 76 atributos onclick detectados (presencia, no ejecución).
- [x] Crear evento, fecha fija, votación y fecha posterior presentes.
- [x] Invitaciones, asistencia, modo invitado, solicitudes de ingreso y opciones de gastos presentes.
- [x] CSS de portada de Crear apunta a `juntada_create_cover_v115.jpg`.
- [x] El SVG defectuoso ya no está referenciado.
- [x] El JPG existe en el repositorio.
- [ ] **Bloqueante:** JPG del repositorio de solo 220×102 px; reemplazar por original 960×443 px.
- [ ] **Bloqueante:** comprobar que GitHub Pages sirve el HTML y el JPG (no accesible desde las herramientas de esta sesión).
- [ ] Probar interacciones reales en Android y desktop.
- [ ] Probar persistencia, creación/edición/suspensión, votaciones, permisos, invitaciones, modo invitado, accesibilidad.
- [ ] Validar coorganizadores y tarjeta de Actividad respecto a especificación V7.2.

## Dictamen
NO GO. Regresión estática parcial, no equivale a QA funcional end-to-end. Mantener `index.html` intacto.

## Iteración adicional — 2026-11-11
- Original local verificado: JPEG 960×443 px; también se generaron variantes optimizadas manteniendo la resolución.
- El archivo JPEG actualmente presente en GitHub continúa siendo la miniatura de 220×102 px: **bloqueante sin resolver**.
- Intentos de abrir la página V1.16 y el JPG mediante consulta web: no accesibles desde la herramienta; **no implica prueba concluyente de que el sitio esté caído para usuarios**.
- La conexión GitHub disponible acepta blobs base64, pero no acepta una referencia directa al archivo binario local; no se debe afirmar que el reemplazo está completado.
- Dictamen permanece **NO GO**; no modificar index.html ni Supabase.
