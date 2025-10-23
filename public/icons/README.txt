<!-- NOTA: Reemplazar estos archivos SVG con PNG reales antes del deploy -->

Los archivos icon-192.svg e icon-512.svg son placeholder.

Para generar PNG reales (recomendado para mejor compatibilidad):

OPCIÓN 1 - Online (más rápido):
1. Ir a https://realfavicongenerator.net/
2. Subir un logo cuadrado (mínimo 512x512)
3. Configurar para Android Chrome
4. Descargar y reemplazar los archivos en esta carpeta
5. Actualizar public/manifest.json con las rutas .png

OPCIÓN 2 - Manual:
1. Crear imágenes PNG de 192x192 y 512x512
2. Guardar como icon-192.png e icon-512.png
3. Actualizar manifest.json:
   - Cambiar "icon-192.svg" → "icon-192.png"
   - Cambiar "icon-512.svg" → "icon-512.png"
   - Cambiar type "image/svg+xml" → "image/png"

Los SVG actuales funcionan pero PNG da mejor compatibilidad en todos los dispositivos.

