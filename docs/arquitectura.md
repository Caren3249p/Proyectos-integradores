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