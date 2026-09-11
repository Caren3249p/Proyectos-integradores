## Integracion con GitHub

La aplicación permite conectar una cuenta GitHub mediante OAuth y almacenar el token cifrado exclusivamente en el backend. El usuario puede crear un repositorio nuevo o enlazar uno existente; enlazar no modifica sus archivos, commits ni ramas.

Variables requeridas en el backend:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
GITHUB_FRONTEND_REDIRECT_URI=http://localhost:3312
GITHUB_TOKEN_ENCRYPTION_KEY=
```

Para generar la clave de cifrado en Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

El callback registrado en la OAuth App debe coincidir exactamente con `GITHUB_REDIRECT_URI`. El scope actual es `repo`, necesario para crear y consultar repositorios privados mediante una OAuth App de GitHub.
# Arquitectura inicial

## Descripción

El proyecto se desarrollará como una aplicación web con enfoque
mobile-first para el seguimiento y evaluación básica de proyectos
integradores.

La arquitectura estará compuesta inicialmente por tres elementos
principales:

1. Frontend
2. Backend
3. Base de datos

## Arquitectura

Usuario
   ↓
React + Vite
   ↓
HTTP / JSON
   ↓
Node.js + Express
   ↓
MySQL

## Frontend

El frontend será desarrollado utilizando React y Vite.

Su función será proporcionar la interfaz con la que interactuarán
estudiantes y docentes.

La interfaz se diseñará inicialmente considerando dispositivos móviles.

## Backend

El backend será desarrollado utilizando Node.js y Express.

Será responsable de gestionar las solicitudes provenientes del
frontend, aplicar la lógica necesaria y comunicarse con la base de datos.

## Base de datos

Se utilizará MySQL para almacenar la información necesaria para el
funcionamiento del prototipo.

Inicialmente se contemplan entidades relacionadas con:

- Usuarios
- Proyectos
- Tareas

Posteriormente podrán incorporarse otras entidades según las
necesidades identificadas durante el desarrollo.

## Comunicación

El frontend y el backend se comunicarán mediante solicitudes HTTP,
utilizando datos en formato JSON.

El backend será el encargado de comunicarse con MySQL.

## Alcance

Esta arquitectura corresponde a la primera versión del prototipo.

No se plantea inicialmente una arquitectura distribuida ni una
infraestructura preparada para grandes cantidades de usuarios.

Las necesidades de escalabilidad o integración institucional podrán
analizarse como trabajo futuro.