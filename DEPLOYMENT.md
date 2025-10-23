# 🚀 Guía de Despliegue y Desarrollo

Esta guía te ayudará a trabajar en el proyecto desde cualquier computadora.

---

## 📥 Clonar el proyecto en una nueva computadora

### 1. Prerequisitos

Asegurate de tener instalado:
- [Node.js 18+](https://nodejs.org/) (verificá con `node -v`)
- [Git](https://git-scm.com/) (verificá con `git --version`)
- Editor de código (VS Code recomendado)

### 2. Clonar el repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/santiagogimenez/elecciones-octubre-2025.git

# Entrar al directorio
cd elecciones-octubre-2025
```

### 3. Instalar dependencias

```bash
npm install
```

Esto instalará todas las librerías necesarias (~500MB, tarda 2-3 minutos).

### 4. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```bash
# En Windows PowerShell
New-Item .env.local

# En macOS/Linux
touch .env.local
```

Agregar estas líneas (con tus credenciales de Supabase):

```env
NEXT_PUBLIC_SUPABASE_URL=https://ghslasokiylkgxnfzwfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2xhc29raXlsa2d4bmZ6d2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTgwODEsImV4cCI6MjA3NjY5NDA4MX0.hctUg0eRCun93_eU4JpWNgILwomnA4ReZLlWFQJoeTk
```

⚠️ **Importante**: Este archivo NO se sube a GitHub (está en `.gitignore`).

### 5. Ejecutar en modo desarrollo

```bash
npm run dev
```

El proyecto estará disponible en: **http://localhost:3000**

---

## 🔄 Flujo de trabajo con Git

### Obtener cambios del repositorio

Antes de empezar a trabajar, siempre descargá los últimos cambios:

```bash
git pull origin main
```

### Hacer cambios y guardarlos

1. **Ver qué archivos cambiaron:**
```bash
git status
```

2. **Agregar archivos al staging:**
```bash
# Agregar todos los cambios
git add .

# O agregar archivos específicos
git add app/page.tsx
git add app/carga/page.tsx
```

3. **Hacer commit con un mensaje descriptivo:**
```bash
git commit -m "Descripción clara del cambio realizado"
```

**Ejemplos de buenos mensajes:**
- `"Agregado validación para impedir mesas duplicadas"`
- `"Corregidos colores de partidos en gráficos"`
- `"Mejorada responsividad en móviles"`

4. **Subir cambios a GitHub:**
```bash
git push origin main
```

### Ver historial de cambios

```bash
# Ver últimos commits
git log --oneline

# Ver cambios en un archivo específico
git log -p app/page.tsx
```

---

## 🌐 Desplegar en Vercel

### Opción 1: Deploy automático (recomendado)

Si ya conectaste el repo a Vercel:

1. Hacer `git push origin main`
2. Vercel detecta el cambio automáticamente
3. Compila y despliega en ~2 minutos
4. Recibís email cuando está listo

### Opción 2: Deploy manual desde nueva computadora

Si es la primera vez desde esta compu:

1. Ir a [vercel.com](https://vercel.com/)
2. Login con GitHub
3. El proyecto ya debería estar listado
4. Para forzar un nuevo deploy: Dashboard → Project → Deployments → "Redeploy"

### Opción 3: Deploy desde CLI

```bash
# Instalar Vercel CLI (solo una vez)
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

---

## 🗄️ Base de datos Supabase

### Acceder al dashboard

1. Ir a [app.supabase.com](https://app.supabase.com/)
2. Login con tu cuenta
3. Seleccionar proyecto: **VotoP**

### Ver datos

- **Table Editor**: Ver/editar registros en las tablas
- **SQL Editor**: Ejecutar queries personalizadas
- **Database**: Ver estructura y relaciones

### Ejecutar migraciones (si hay cambios en el schema)

Si modificaste la estructura de la base de datos:

1. Ir a **SQL Editor** en Supabase
2. Ejecutar el script `supabase-setup.sql`
3. O ejecutar queries específicas

---

## 📦 Scripts disponibles

```bash
# Desarrollo local
npm run dev

# Compilar para producción
npm run build

# Ejecutar versión de producción localmente
npm start

# Verificar errores de TypeScript
npm run type-check

# Formatear código (si tenés prettier)
npm run format
```

---

## 🐛 Troubleshooting común

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: "Port 3000 is already in use"

```bash
# Windows PowerShell
taskkill /F /IM node.exe

# macOS/Linux
killall node

# Luego reiniciar
npm run dev
```

### Error: "Supabase connection failed"

1. Verificar que `.env.local` existe y tiene las credenciales correctas
2. Verificar que el proyecto de Supabase esté activo
3. Revisar que las URLs no tengan espacios ni comillas

### La app no se actualiza en el navegador

1. Hard refresh: `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
2. Limpiar caché del navegador
3. Reiniciar el servidor (`Ctrl + C` y `npm run dev`)

---

## 🔐 Seguridad

### Credenciales

- **NUNCA** commitear el archivo `.env.local`
- **NUNCA** hacer hardcode de las keys en el código
- Si exponés las keys por error: regenerarlas en Supabase

### Para compartir credenciales con el equipo

Usar un gestor de contraseñas seguro (no WhatsApp/Email).

---

## 📱 Probar la PWA localmente

### En desarrollo (localhost)

La PWA solo funciona parcialmente en `http://localhost:3000`.

Para probar todas las features offline:

1. Hacer build de producción:
```bash
npm run build
npm start
```

2. Abrir en: `http://localhost:3000`

### En móvil (mismo WiFi)

1. Obtener tu IP local:
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

2. Buscar tu IP (ej: `192.168.1.50`)

3. En el móvil, abrir: `http://192.168.1.50:3000`

4. Instalar la PWA desde el navegador

---

## 🔄 Sincronizar con el repositorio remoto

### Cambiar de rama

```bash
# Ver ramas disponibles
git branch -a

# Crear nueva rama para features
git checkout -b feature/nueva-funcionalidad

# Volver a main
git checkout main
```

### Resolver conflictos

Si hay conflictos al hacer pull:

1. Git marcará los archivos en conflicto
2. Abrir el archivo y buscar `<<<<<<<` y `>>>>>>>`
3. Editar manualmente para resolver
4. Hacer `git add` del archivo resuelto
5. Hacer `git commit`

---

## 📞 Contacto y soporte

- **Repositorio**: https://github.com/santiagogimenez/elecciones-octubre-2025
- **Supabase Dashboard**: https://app.supabase.com/project/ghslasokiylkgxnfzwfo
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## ✅ Checklist para nueva computadora

- [ ] Node.js 18+ instalado
- [ ] Git instalado y configurado
- [ ] Repositorio clonado
- [ ] `npm install` ejecutado correctamente
- [ ] Archivo `.env.local` creado con las credenciales
- [ ] `npm run dev` ejecutándose sin errores
- [ ] App abierta en http://localhost:3000
- [ ] Dashboard carga datos desde Supabase
- [ ] Formulario de carga funciona correctamente

---

**Última actualización**: Octubre 2025  
**Proyecto**: Sistema de Elecciones Formosa - PWA con Next.js 14 + Supabase
