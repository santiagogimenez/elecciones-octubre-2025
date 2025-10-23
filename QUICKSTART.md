# ⚡ Inicio Rápido

## 📦 Paso 1: Instalar dependencias

```bash
npm install
```

## 🔐 Paso 2: Configurar Supabase

1. **Ejecutar el script SQL en Supabase**:
   - Abrir [app.supabase.com](https://app.supabase.com/)
   - Seleccionar proyecto **VotoP**
   - Ir a **SQL Editor** → **New query**
   - Copiar y pegar el contenido de `supabase-setup.sql`
   - Clic en **Run**

2. **Habilitar Realtime**:
   - Ir a **Database** → **Replication**
   - Buscar tabla `resultados`
   - Activar el switch **Realtime**

3. **Copiar credenciales**:
   - Ir a **Project Settings** → **API**
   - Copiar:
     - **Project URL**
     - **anon public key**

4. **Editar `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

## 🚀 Paso 3: Ejecutar la aplicación

```bash
npm run dev
```

Abrir en el navegador:
- **Dashboard**: http://localhost:3000
- **Carga**: http://localhost:3000/carga

## ✅ Verificación rápida

1. Ir a `/carga`
2. Ingresar:
   - Circuito: "Test"
   - Código: "T01"
   - Mesa: 1
   - Votos: 100, 150, 75, 25 (para cada partido)
   - Blancos: 10
   - Nulos: 5
   - Recurridos: 0
   - **Total**: 365 ✓
3. Clic en **Enviar**
4. Abrir `/` → verificar que aparezcan los totales

## 📖 Documentación completa

- [README.md](README.md) - Documentación principal
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Guía detallada de Supabase
- [supabase-setup.sql](supabase-setup.sql) - Script SQL

## 🆘 Problemas comunes

### "No se encuentra el módulo X"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Error al conectar con Supabase"
Verificar que `.env.local` tenga las credenciales correctas.

### Dashboard no actualiza en tiempo real
Habilitar Realtime en la tabla `resultados` (Database → Replication).

---

¿Todo listo? 🎉 **Ahora podés deployar a Vercel** siguiendo las instrucciones en [README.md](README.md#-deploy-en-vercel)
