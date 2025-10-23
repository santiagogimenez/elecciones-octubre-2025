# 🎯 Próximos Pasos

## ✅ Proyecto creado exitosamente

El proyecto **Elecciones Formosa PWA** está configurado y listo para usar.

## 🔧 Lo que falta configurar

### 1. ⚠️ URGENTE: Editar `.env.local`

El archivo `.env.local` tiene valores placeholder. Necesitás reemplazarlos con tus credenciales reales de Supabase:

```env
# REEMPLAZAR ESTOS VALORES:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

**Cómo obtenerlas:**
1. Ir a https://app.supabase.com/
2. Seleccionar proyecto **VotoP**
3. Project Settings → API
4. Copiar **Project URL** y **anon public key**

### 2. 📊 Ejecutar script SQL en Supabase

1. En Supabase: **SQL Editor** → **New query**
2. Copiar contenido de `supabase-setup.sql`
3. Ejecutar (Run)
4. Verificar en **Table Editor** que se crearon las tablas

### 3. ⚡ Habilitar Realtime

En Supabase:
1. Database → Replication
2. Tabla `resultados` → Activar switch

## 🚀 Comandos útiles

```bash
# Desarrollo (ya corriendo en http://localhost:3000)
npm run dev

# Build para producción
npm run build

# Ejecutar producción local
npm start

# Lint
npm run lint
```

## 📱 Rutas de la aplicación

| URL | Descripción |
|-----|-------------|
| http://localhost:3000 | Dashboard con totales en tiempo real |
| http://localhost:3000/carga | Formulario de carga para fiscales |

## 🧪 Primera prueba

Una vez que hayas configurado `.env.local` y ejecutado el SQL:

1. Ir a http://localhost:3000/carga
2. Completar formulario:
   - Circuito: "Formosa Capital"
   - Código: "FC"
   - Mesa: 1
   - Votos (ej): 120, 180, 95, 45
   - Blancos: 8
   - Nulos: 2
   - Recurridos: 0
   - Total: 450 ✓
3. Enviar
4. Abrir http://localhost:3000
5. Verificar que aparecen los totales

## 📚 Documentación

- **[QUICKSTART.md](QUICKSTART.md)** - Inicio rápido (3 pasos)
- **[README.md](README.md)** - Documentación completa
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Guía detallada de Supabase
- **[supabase-setup.sql](supabase-setup.sql)** - Script SQL listo para ejecutar

## 🌐 Deploy a producción

Cuando estés listo para publicar:

1. Subir a GitHub
2. Conectar con Vercel
3. Configurar variables de entorno en Vercel
4. Deploy automático

Ver [README.md#deploy-en-vercel](README.md#-deploy-en-vercel) para instrucciones detalladas.

## 🎨 Personalización

### Cambiar íconos PWA

Los íconos actuales son SVG placeholder. Para usar PNG reales:

1. Generar en https://www.favicon-generator.org/
2. Reemplazar archivos en `public/icons/`
3. Actualizar `public/manifest.json`

### Modificar partidos

Editar en Supabase (Table Editor → `partidos`):
- Agregar, editar o eliminar partidos
- Cambiar orden con la columna `orden`

### Cambiar estilos

- **Colores globales**: `app/globals.css`
- **Configuración Tailwind**: `tailwind.config.ts`
- **Tema de la PWA**: `public/manifest.json` (theme_color)

## 🔒 Seguridad para producción

⚠️ **Esta versión MVP permite acceso público sin autenticación**.

Para producción, considerar:
- Implementar login de fiscales
- Restringir políticas RLS
- Agregar rate limiting
- Validaciones en servidor (API Routes)

Ver [SUPABASE_SETUP.md#seguridad-para-producción](SUPABASE_SETUP.md#-seguridad-para-producción) para ejemplos de código.

## 🆘 Soporte

Si tenés problemas:

1. Revisar errores en la consola del navegador (F12)
2. Verificar logs del servidor (terminal donde corre `npm run dev`)
3. Consultar la sección "Troubleshooting" en [README.md](README.md#-resolución-de-problemas)

---

## ✨ Todo listo para comenzar

1. ✅ Editá `.env.local` con tus credenciales
2. ✅ Ejecutá `supabase-setup.sql` en Supabase
3. ✅ Habilitá Realtime
4. ✅ Probá la carga en `/carga`
5. ✅ Verificá el dashboard en `/`

**¡Éxitos con las elecciones!** 🗳️
