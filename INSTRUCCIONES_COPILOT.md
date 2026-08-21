# INSTRUCCIONES PARA COPILOT — MÓDULO DE USUARIOS Y ACCESO

> **Proyecto:** Plataforma centralizada para la gestión, calificación y visualización de proyectos integradores
> **Repositorio:** https://github.com/Caren3249p/Proyectos-integradores.git
> **Fase:** Semana 4 — Diseño y desarrollo (Sprint 1)
> **Tareas de Jira:** KAN-12 (Registro/login) y KAN-25 (Seguridad de contraseñas)

---

## 📌 CONTEXTO GENERAL DEL PROYECTO

**Descripción:** Sistema que permite a estudiantes gestionar sus proyectos integradores (fichas, versiones, archivos, backlog, actas) y a docentes evaluarlos con rúbrica ponderada, seguimiento en tiempo real y retroalimentación obligatoria.

**Estructura actual del repositorio:**
```
Proyectos-integradores/
├── backend/          # Código del servidor (API)
├── docs/             # Documentación
└── frontend/         # Código de la interfaz de usuario (futuro)
```

**Base de datos:** PostgreSQL 16+ (script `esquema_completo.sql` ya ejecutado)

---

## 🧱 STACK TECNOLÓGICO

| Capa | Tecnología | Versión |
|------|------------|---------|
| Backend | Node.js + Express | v18+ |
| ORM | Prisma | Última estable |
| Base de datos | PostgreSQL | 16+ |
| Autenticación | JWT (jsonwebtoken) | Última estable |
| Hash de contraseñas | bcrypt | Última estable |
| Validación | Zod | Última estable |
| Variables de entorno | dotenv | Última estable |
| Frontend (futuro) | React + Vite | v18+ |

---

## 🗄️ TABLA `usuario` EN POSTGRESQL

```sql
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('estudiante', 'docente')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    github_username VARCHAR(100) UNIQUE,
    plane_user_id VARCHAR(100) UNIQUE
);
```

**Observaciones clave:**
- `correo` debe ser único y validado con regex: `@upb.edu.co$`
- `rol` solo puede ser `estudiante` o `docente`
- `contraseña_hash` almacena el hash de bcrypt (nunca la contraseña en texto plano)
- `github_username` y `plane_user_id` son opcionales para integraciones futuras

---

## 📋 REQUERIMIENTOS FUNCIONALES (RF-01)

| # | Criterio de aceptación |
|---|------------------------|
| 1 | Si el correo ingresado no pertenece al dominio `@upb.edu.co`, el sistema rechaza el registro y muestra: *"Dominio institucional no válido"* |
| 2 | Si el correo ya está registrado, el sistema muestra *"Este correo ya se encuentra registrado"* y redirige a inicio de sesión |
| 3 | Si la contraseña no cumple la política de seguridad, el sistema rechaza el registro y lista los requisitos faltantes |
| 4 | Al iniciar sesión con credenciales válidas, el sistema redirige al usuario a su panel correspondiente en **menos de 2 segundos** |

---

## 🔐 REQUERIMIENTOS NO FUNCIONALES (RNF-09)

| Requisito | Especificación |
|-----------|----------------|
| **Hash de contraseñas** | bcrypt con 10-12 rondas |
| **Política de contraseñas** | Mínimo 8 caracteres, al menos 1 mayúscula y 1 número |
| **Expiración de sesión** | 30 minutos de inactividad (JWT) |
| **Validación de correo** | Dominio `@upb.edu.co` (regex: `^[a-zA-Z0-9._%+-]+@upb\.edu\.co$`) |

---

## 📊 TAREAS DE JIRA A CUBRIR

| ID | Título | Prioridad | Puntos de historia |
|----|--------|-----------|-------------------|
| **KAN-12** | Registro e inicio de sesión por rol | Highest | 3 |
| **KAN-25** | Almacenamiento seguro de contraseñas y expiración de sesión | Highest | 5 |

---

## 🔌 ENDPOINTS DE LA API

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Registrar un nuevo usuario | ❌ No |
| POST | `/api/auth/login` | Iniciar sesión y obtener token | ❌ No |
| POST | `/api/auth/logout` | Cerrar sesión (opcional) | ✅ Sí |
| GET | `/api/auth/me` | Obtener perfil del usuario autenticado | ✅ Sí |

---

## 📁 ESTRUCTURA DE ARCHIVOS A CREAR EN `backend/`

```
backend/
├── .env                          # Variables de entorno
├── package.json                  # Dependencias
├── prisma/
│   ├── schema.prisma             # Modelo de Usuario
│   └── .env                      # (opcional, usar el .env raíz)
├── src/
│   ├── app.js                    # Punto de entrada
│   ├── config/
│   │   ├── database.js           # Cliente de Prisma
│   │   └── jwt.js                # Configuración de JWT
│   ├── services/
│   │   └── authService.js        # Lógica de negocio
│   ├── controllers/
│   │   └── authController.js     # Controladores
│   ├── routes/
│   │   ├── authRoutes.js         # Rutas de autenticación
│   │   └── index.js              # Centralizar rutas
│   ├── middleware/
│   │   ├── authMiddleware.js     # Verificar JWT
│   │   └── validationMiddleware.js # Validar entrada con Zod
│   └── utils/
│       └── validators.js         # Esquemas de Zod
└── tests/
    └── auth.test.js              # (Opcional) Pruebas
```

---

## 📦 DEPENDENCIAS A INSTALAR

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.3",
    "zod": "^3.21.4",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🔐 VARIABLES DE ENTORNO (`.env`)

```env
PORT=3000
DATABASE_URL=postgresql://usuario:contraseña@host:5432/plataforma_pi
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=30m
BCRYPT_ROUNDS=10
```

---

## 🧩 CÓDIGO ESPERADO (RESUMEN)

### 1. Prisma Schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Usuario {
  id_usuario       Int      @id @default(autoincrement())
  nombre           String   @db.VarChar(100)
  correo           String   @unique @db.VarChar(100)
  contraseña_hash  String   @db.VarChar(255)
  rol              String   @db.VarChar(20)
  fecha_registro   DateTime @default(now())
  github_username  String?  @unique @db.VarChar(100)
  plane_user_id    String?  @unique @db.VarChar(100)

  @@map("usuario")
}
```

### 2. Validaciones con Zod (`src/utils/validators.js`)
```javascript
import { z } from 'zod';

const correoRegex = /^[a-zA-Z0-9._%+-]+@upb\.edu\.co$/;
const contraseñaRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  correo: z.string().regex(correoRegex, "El correo debe ser institucional (@upb.edu.co)"),
  contraseña: z.string().regex(contraseñaRegex, "La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número"),
  rol: z.enum(["estudiante", "docente"])
});

export const loginSchema = z.object({
  correo: z.string().email("Correo inválido"),
  contraseña: z.string().min(1, "La contraseña es obligatoria")
});
```

### 3. Middleware de autenticación (`src/middleware/authMiddleware.js`)
```javascript
import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "No autorizado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
};
```

### 4. Servicio de autenticación (`src/services/authService.js`)
```javascript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

export const registrarUsuario = async (data) => {
  const { nombre, correo, contraseña, rol } = data;

  const existe = await prisma.usuario.findUnique({ where: { correo } });
  if (existe) {
    throw new Error("Este correo ya se encuentra registrado");
  }

  const hash = await bcrypt.hash(contraseña, BCRYPT_ROUNDS);

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      correo,
      contraseña_hash: hash,
      rol
    }
  });

  return usuario;
};

export const iniciarSesion = async (correo, contraseña) => {
  const usuario = await prisma.usuario.findUnique({ where: { correo } });
  if (!usuario) {
    throw new Error("Credenciales inválidas");
  }

  const valido = await bcrypt.compare(contraseña, usuario.contraseña_hash);
  if (!valido) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
  );

  return {
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol
    }
  };
};
```

### 5. Controlador (`src/controllers/authController.js`)
```javascript
import { registrarUsuario, iniciarSesion } from '../services/authService.js';
import { registerSchema, loginSchema } from '../utils/validators.js';

export const register = async (req, res) => {
  try {
    const validData = registerSchema.parse(req.body);
    const usuario = await registrarUsuario(validData);
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: "Datos inválidos",
        detalles: error.errors
      });
    }
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contraseña } = loginSchema.parse(req.body);
    const { token, usuario } = await iniciarSesion(correo, contraseña);
    res.json({
      message: "Inicio de sesión exitoso",
      token,
      usuario
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: "Datos inválidos",
        detalles: error.errors
      });
    }
    res.status(401).json({ error: error.message });
  }
};

export const getPerfil = async (req, res) => {
  res.json({ usuario: req.usuario });
};
```

### 6. Rutas (`src/routes/authRoutes.js`)
```javascript
import express from 'express';
import { register, login, getPerfil } from '../controllers/authController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verificarToken, getPerfil);

export default router;
```

### 7. Punto de entrada (`src/app.js`)
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API de Plataforma de Proyectos Integradores' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
```

---

## 🧪 PRUEBAS CON CURL (EJEMPLOS)

### Registro exitoso
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Perez","correo":"juan@upb.edu.co","contraseña":"Abc123456","rol":"estudiante"}'
```
**Respuesta esperada (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Juan Perez",
    "correo": "juan@upb.edu.co",
    "rol": "estudiante"
  }
}
```

### Registro con correo inválido
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Perez","correo":"juan@gmail.com","contraseña":"Abc123456","rol":"estudiante"}'
```
**Respuesta esperada (400):**
```json
{
  "error": "Datos inválidos",
  "detalles": [
    { "message": "El correo debe ser institucional (@upb.edu.co)" }
  ]
}
```

### Login exitoso
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"juan@upb.edu.co","contraseña":"Abc123456"}'
```
**Respuesta esperada (200):**
```json
{
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Juan Perez",
    "correo": "juan@upb.edu.co",
    "rol": "estudiante"
  }
}
```

### Perfil (requiere token)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

---

## ✅ CRITERIOS DE ACEPTACIÓN PARA ESTA FASE

| # | Criterio | Estado |
|---|----------|--------|
| 1 | Prisma configurado y conectado a la base de datos | Pendiente |
| 2 | Modelo de Usuario creado y migrado | Pendiente |
| 3 | Endpoint `/register` funcionando con validaciones | Pendiente |
| 4 | Endpoint `/login` funcionando con JWT | Pendiente |
| 5 | Middleware de autenticación protege rutas | Pendiente |
| 6 | Todos los errores manejados y mensajes en español | Pendiente |
| 7 | Contraseñas hasheadas con bcrypt | Pendiente |
| 8 | JWT expira en 30 minutos | Pendiente |
| 9 | Código documentado y limpio | Pendiente |

---

## 🧭 INSTRUCCIONES FINALES PARA COPILOT

1. **Empieza por la configuración de Prisma** y la migración del modelo `Usuario`.
2. **Luego implementa los servicios** (`authService.js`) con la lógica de negocio.
3. **Después los controladores** (`authController.js`) con el manejo de errores.
4. **Crea los middlewares** (`authMiddleware.js`, `validationMiddleware.js`).
5. **Monta las rutas** en `src/app.js`.
6. **Prueba cada endpoint** con cURL antes de pasar al siguiente.
7. **Asegúrate de que los mensajes de error estén en español** y sean claros.
8. **Incluye comentarios** en el código para explicar la lógica.

---

**¡Adelante con el desarrollo del Módulo de Usuarios y Acceso! 🚀**
