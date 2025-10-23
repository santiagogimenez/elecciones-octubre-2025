# Elecciones Formosa - PWA

Sistema de carga y visualización en tiempo real de resultados electorales para la provincia de Formosa.

## 🚀 Características

- ✅ **PWA (Progressive Web App)**: instalable en móviles y funciona offline
- ✅ **Carga de resultados por mesa**: fiscales ingresan votos sin necesidad de login
- ✅ **Validación estricta**: suma de votos debe coincidir con total escrutado
- ✅ **Offline-first**: guarda datos en cola local si no hay conexión y sincroniza automáticamente
- ✅ **Dashboard en tiempo real**: actualización instantánea vía Supabase Realtime
- ✅ **Sin autenticación de fiscales**: acceso directo para carga rápida (MVP)

## 📋 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilos**: TailwindCSS
- **Base de datos**: Supabase (PostgreSQL + Realtime)
- **Validación**: Zod
- **Deployment**: Vercel (recomendado)

## ⚙️ Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Editá el archivo `.env.local` y reemplazá con tus credenciales de Supabase (proyecto: **VotoP**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Dónde obtenerlas:**
- Ir a [app.supabase.com](https://app.supabase.com/)
- Seleccionar tu proyecto **VotoP**
- Ir a **Project Settings → API**
- Copiar **Project URL** y **anon public key**

### 3. Verificar la base de datos

Asegurate de haber ejecutado el script SQL completo en Supabase para crear:
- Tablas: `partidos`, `circuitos`, `mesas`, `resultados`, `actas`
- Vista: `v_totales_partido`
- Políticas RLS (Row Level Security)
- Realtime habilitado en la tabla `resultados`

## 🎯 Uso

### Desarrollo local

```bash
npm run dev
```

La app estará disponible en:
- **Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Carga de votos**: [http://localhost:3000/carga](http://localhost:3000/carga)

### Build para producción

```bash
npm run build
npm start
```

## 📱 Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard con totales por partido (actualización en tiempo real) |
| `/carga` | Formulario de carga de resultados para fiscales |

## 🧪 Flujo de prueba

1. **Abrir `/carga`**
   - Ingresar circuito (ej: "Formosa Capital")
   - Ingresar código de circuito (opcional, ej: "FC")
   - Ingresar número de mesa (ej: 1234)
   - Cargar votos por partido (5 partidos predefinidos)
   - Cargar blancos, nulos y recurridos
   - Ingresar total de votos escrutados
   - Verificar que la suma coincida (✓)
   - Enviar

2. **Verificar en `/`**
   - Los totales se actualizan automáticamente
   - Se muestra porcentaje por partido
   - Ordenados de mayor a menor

3. **Probar modo offline**
   - Desconectar internet (modo avión)
   - Cargar una mesa en `/carga`
   - Verificar mensaje "Pendientes ↓"
   - Reconectar internet
   - La sincronización es automática

## 🔒 Seguridad (MVP)

⚠️ **Importante**: Esta versión MVP tiene políticas RLS abiertas para permitir carga sin autenticación.

**Para producción**, se recomienda:
- Implementar autenticación de fiscales (JWT o passcode)
- Restringir políticas RLS solo a usuarios autenticados
- Agregar rate limiting
- Implementar validación de servidor (API routes)

## 📦 Deploy en Vercel

1. Subir el proyecto a GitHub
2. Ir a [vercel.com](https://vercel.com/)
3. Importar el repositorio
4. Agregar las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

La PWA estará disponible en tu dominio de Vercel. Los usuarios pueden instalarla desde el navegador (opción "Agregar a pantalla de inicio").

## 🎨 Íconos PWA

Los íconos actuales son placeholders SVG. Para reemplazarlos con imágenes PNG reales:

1. Ir a [favicon-generator.org](https://www.favicon-generator.org/)
2. Subir un logo o diseño
3. Generar y descargar PNG de 192x192 y 512x512
4. Reemplazar los archivos en `public/icons/`
5. Actualizar `public/manifest.json` (cambiar extensión `.svg` → `.png` y tipo `image/svg+xml` → `image/png`)

## 🛠️ Estructura del proyecto

```
/
├── app/
│   ├── layout.tsx          # Layout raíz con registro de SW
│   ├── page.tsx            # Dashboard (home)
│   ├── carga/
│   │   └── page.tsx        # Formulario de carga
│   └── globals.css         # Estilos globales + Tailwind
├── components/
│   └── PendingQueueSync.tsx # Indicador y sincronizador de cola offline
├── lib/
│   ├── supabaseClient.ts    # Cliente Supabase
│   ├── validation.ts        # Schema Zod
│   └── offlineQueue.ts      # Gestión de cola localStorage
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service Worker
│   └── icons/               # Íconos PWA
├── .env.local               # Variables de entorno (NO commitear)
└── package.json
```

## 📝 Notas técnicas

- **Next.js 14 App Router**: todas las páginas usan `'use client'` (client-side rendering)
- **Supabase Realtime**: suscripción a cambios en la tabla `resultados`
- **Offline queue**: usa `localStorage` para almacenar payloads pendientes
- **Service Worker**: estrategia network-first con fallback a caché
- **Validación dual**: en cliente (Zod) y en DB (constraints y checks)

## 🐛 Resolución de problemas

### Error: "No se puede conectar a Supabase"
- Verificar que las variables de entorno estén correctamente configuradas
- Asegurar que el proyecto Supabase esté activo
- Revisar consola del navegador para errores específicos

### Error: "No se insertan datos"
- Verificar que las políticas RLS estén activas y configuradas correctamente
- Revisar en Supabase → Table Editor que las políticas `public insert/update` existan
- Confirmar que la tabla `resultados` tenga Realtime habilitado

### No se actualiza el dashboard en tiempo real
- Ir a Database → Replication en Supabase
- Habilitar Realtime para la tabla `resultados`
- Recargar la página del dashboard

### Error al instalar dependencias
```bash
# Limpiar caché e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licencia

MIT

## 👥 Contacto

Para consultas sobre el proyecto contactar al equipo de desarrollo.

---

**Versión**: 0.1.0 (MVP)  
**Estado**: Desarrollo  
**Base de datos**: VotoP (Supabase)
