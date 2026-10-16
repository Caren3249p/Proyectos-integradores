# Guion de sustentación

## Plataforma para la gestión de proyectos integradores

**Duración estimada:** 7 a 8 minutos  
**Participantes:** Caren Julieth Díaz Calderón y Juan Sebastián Hernández Remolina

---

## Persona 1 — Caren

### Diapositivas 1 a 6 — Problema, pregunta y objetivos

**Diapositiva 1 — Portada**

Buenos días. Somos Caren Julieth Díaz Calderón y Juan Sebastián Hernández Remolina, estudiantes de Ingeniería de Sistemas e Informática de la UPB.

Presentaremos nuestra propuesta: una plataforma centralizada para la gestión, seguimiento, evaluación y visualización de proyectos integradores.

El propósito principal es conectar en un mismo sistema la información académica, técnica y operativa de los proyectos.

**Diapositiva 2 — Descripción del problema**

Actualmente, la información de los proyectos integradores se encuentra distribuida en diferentes herramientas como Teams, Drive, hojas de cálculo, chats y repositorios.

Esta fragmentación genera tres dificultades principales: no siempre está claro cuál es la versión correcta del proyecto, el docente debe solicitar manualmente los avances y el backlog no es visible de forma centralizada.

Esto dificulta el seguimiento, la evaluación y la toma de decisiones.

**Diapositiva 3 — Pregunta problematizadora**

A partir de esta situación planteamos la siguiente pregunta:

¿Cómo diseñar una plataforma que permita planificar, organizar, calificar y visualizar los proyectos integradores, integrando el repositorio de resultados y las herramientas de gestión?

Esta pregunta orientó tanto el diseño funcional como la arquitectura de la solución.

**Diapositivas 4 y 5 — Objetivos**

El objetivo general fue desarrollar una plataforma web responsive, complementada con una aplicación móvil, que centralice la gestión, el seguimiento, la evaluación y la visualización de los proyectos integradores.

Para lograrlo, definimos objetivos específicos relacionados con la centralización de fichas e integrantes, la gestión de versiones y archivos, la visibilidad del backlog, la evaluación mediante rúbricas jerárquicas, la coevaluación y la integración con GitHub, Plane y los mecanismos de seguridad.

**Diapositiva 6 — Estado del arte**

Al revisar diferentes alternativas encontramos que algunas soluciones se enfocan en repositorios, otras en gestión de tareas y otras en evaluación por pares.

Sin embargo, ninguna de las alternativas revisadas reúne en un mismo flujo el repositorio académico, el backlog, las versiones, las rúbricas y la coevaluación.

Por eso, nuestra propuesta busca integrar esas capacidades en una plataforma orientada específicamente a los proyectos integradores.

---

## Persona 2 — Juan

### Diapositivas 7 a 12 — Marco conceptual y arquitectura

**Diapositiva 7 — Centralización**

La primera idea del marco conceptual es pasar de la información fragmentada a una fuente centralizada.

La plataforma reúne la ficha del proyecto, sus integrantes, el docente asesor, las versiones, las evidencias y el backlog en un mismo modelo.

De esta forma, el docente puede consultar la información principal del proyecto sin solicitarla por separado al equipo.

**Diapositiva 8 — Trazabilidad de entregas**

La centralización por sí sola no es suficiente. También es necesario conservar la evolución del proyecto.

Por eso, la solución relaciona las tareas del backlog con el avance, las versiones y los archivos entregados.

Una versión puede estar abierta mientras se trabaja, pero cuando se marca como final queda protegida para garantizar que la evaluación se realice sobre la evidencia correcta.

**Diapositiva 9 — Rúbrica y cálculo de la nota**

La evaluación se realiza mediante rúbricas jerárquicas.

Estas rúbricas pueden contener cortes académicos, actividades y criterios evaluables. Los criterios hoja reciben la calificación y los criterios padre consolidan los resultados.

El cálculo se realiza de abajo hacia arriba, aplicando los pesos definidos y validando que los criterios hermanos sumen el cien por ciento.

Así se reduce el cálculo manual y se conserva la trazabilidad de cómo se obtiene la nota final.

**Diapositivas 10 y 11 — Arquitectura y confiabilidad**

La plataforma utiliza una arquitectura con clientes web y móvil que consumen una API REST común.

El backend está desarrollado con Node.js y Express, organizado en rutas, controladores, servicios y acceso a datos mediante Prisma y PostgreSQL.

También se integran Plane para la gestión del backlog y GitHub para los repositorios.

En seguridad se utilizan JWT, bcrypt, validación de datos con Zod, control de roles y transacciones para proteger las operaciones críticas, especialmente el registro de evaluaciones.

**Diapositiva 12 — Integración conceptual**

Estos conceptos no funcionan de manera aislada.

El problema de la fragmentación conduce a los módulos de centralización. Esos módulos requieren una arquitectura común. La arquitectura debe estar protegida por mecanismos de seguridad y todas las reglas importantes deben comprobarse mediante pruebas.

El resultado es una plataforma funcional que conecta gestión, trazabilidad y evaluación.

---

## Persona 1 — Caren

### Diapositivas 13 a 22 — Requisitos, gestión y evaluación

**Diapositivas 13 y 14 — Requisitos**

Los requisitos funcionales cubren usuarios, roles, proyectos, integrantes, repositorios, versiones, rúbricas, evaluaciones, entregables, coevaluaciones, backlog e integraciones.

La mayoría de los módulos principales se encuentran implementados o funcionales. Algunos elementos, como la aplicación móvil completa, las notificaciones y ciertos reportes, permanecen como trabajo parcial o futuro.

Entre los requisitos no funcionales se priorizaron la seguridad, la trazabilidad, la integridad de los datos y la portabilidad.

**Diapositivas 15 a 17 — Gestión y versiones**

La plataforma integra la información académica, técnica y operativa de cada proyecto.

El flujo comienza con la planificación de tareas, continúa con el desarrollo y la actualización de estados, y termina con la preparación de una versión y sus evidencias.

El ciclo de vida de la versión permite crearla, adjuntar archivos, consultarla y marcarla como final. Después de finalizarla, queda en modo de solo lectura para proteger la entrega.

**Diapositivas 18 a 21 — Rúbricas y evaluación**

La rúbrica puede configurarse con criterios padre, subcriterios, pesos y niveles de desempeño.

Esto permite adaptar la evaluación a diferentes momentos académicos.

Durante la calificación, el docente evalúa únicamente los criterios hoja. El sistema valida que todos estén completos, aplica las ponderaciones, calcula los criterios padre y guarda el resultado dentro de una transacción.

Además, se validan los permisos del docente, la existencia del proyecto, la rúbrica activa y la integridad de los datos.

**Diapositiva 22 — Gestión y evaluación**

La principal integración funcional es la conexión entre el desarrollo del proyecto y su evaluación.

El backlog muestra el trabajo pendiente y el avance. Las versiones conservan las evidencias. Las entregas relacionan esas evidencias con una actividad. Finalmente, la rúbrica transforma la evidencia en una calificación trazable.

---

## Persona 2 — Juan

### Diapositivas 23 a 31 — Diseño, metodología y despliegue

**Diapositivas 23 y 24 — Diagramas**

El diagrama de clases representa las principales entidades del sistema, como usuarios, proyectos, versiones, archivos, rúbricas, criterios y evaluaciones.

El diagrama de secuencia muestra cómo se crea una evaluación: se valida el usuario, se comprueba el proyecto, se revisan los criterios hoja, se calcula la nota mediante el algoritmo Bottom-Up y finalmente se guarda todo en una transacción.

Estos diagramas ayudan a comprobar que la implementación corresponde con el diseño planteado.

**Diapositivas 25 a 29 — Metodología y Kanban**

Utilizamos Kanban sobre un backlog priorizado.

El trabajo se organizó por módulos, como proyectos, rúbricas, evaluación, backlog, seguridad y aplicación móvil.

Se trabajó con una capacidad limitada de tareas en progreso y cada historia debía validarse al terminar.

El tablero permitió visualizar qué tareas estaban por hacer, cuáles estaban en desarrollo, cuáles se encontraban en revisión y cuáles habían sido completadas.

El cronograma se organizó en diecisiete semanas, incluyendo levantamiento de requisitos, desarrollo, validación, documentación y sustentación.

**Diapositivas 30 y 31 — Arquitectura y despliegue**

La solución utiliza clientes web y móvil, una API REST, servicios de negocio, Prisma, PostgreSQL y almacenamiento de archivos.

También contempla las integraciones con Plane, GitHub y el servicio externo de chat mediante SSO.

El diagrama de despliegue muestra cómo se conectan los clientes, el servidor de aplicación, la base de datos, el almacenamiento y los servicios externos.

---

## Persona 1 — Caren

### Diapositivas 32 y 33 — Demostración y resultados

**Diapositiva 32 — Demostración**

La demostración presenta el flujo principal de la plataforma:

Primero, el inicio de sesión y la diferenciación de roles. Luego, la consulta de la ficha del proyecto, sus integrantes y el repositorio.

Después se muestra el backlog y el porcentaje de avance, la creación de una versión final protegida, la configuración de una rúbrica y el registro de la evaluación.

Finalmente, se evidencia cómo el sistema calcula automáticamente la nota final.

> **En este momento se reproduce el video de demostración.**

**Diapositiva 33 — Resultados y validación**

Como resultados, el backend cuenta con quince de dieciséis pruebas aprobadas, el frontend compiló correctamente con mil seiscientos nueve módulos transformados y el esquema de Prisma contiene veintitrés modelos relacionales.

Estos resultados muestran que el prototipo es funcional y que sus principales reglas de negocio fueron verificadas.

También identificamos actividades pendientes de validación en un entorno real, como las pruebas con usuarios reales y la comprobación completa de algunas integraciones.

---

## Persona 2 — Juan

### Diapositivas 34 y 35 — Conclusiones

Como primera conclusión, la centralización mejora la trazabilidad porque la ficha, las versiones, las evidencias y las evaluaciones permanecen relacionadas en un mismo sistema.

Como segunda conclusión, la rúbrica jerárquica automatiza el proceso de evaluación, ya que calcula la nota desde los criterios hoja hasta el resultado final aplicando pesos validados.

También comprobamos que las integraciones con Plane y GitHub permiten aprovechar herramientas existentes sin duplicarlas.

Finalmente, reconocemos que el resultado es un prototipo funcional con aspectos de mejora, como corregir una prueba pendiente, fortalecer la autorización por objeto y ampliar la validación con usuarios reales.

---

## Cierre — Ambos

**Caren:**

En conclusión, la plataforma permite conectar la gestión del proyecto con la evaluación académica de sus resultados.

**Juan:**

De esta manera, se mejora la visibilidad del avance, se protegen las evidencias y se facilita una evaluación más organizada, consistente y trazable.

**Caren:**

Muchas gracias por su atención.

**Juan:**

Quedamos atentos a sus preguntas.
