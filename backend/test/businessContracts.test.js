import test from 'node:test';
import assert from 'node:assert/strict';
import {
  actividadEntregableSchema,
  actualizarEstadoTareaSchema,
  asignarProyectosSchema,
  evaluacionEntregaSchema,
  rubricaSchema,
  tareaBacklogSchema
} from '../src/utils/validators.js';

const nivelesDocentes = [0, 1, 2, 3, 4, 5].map((nivel) => ({ nivel, puntos: nivel, descripcion: `Nivel ${nivel}` }));
const nivelesCoevaluacion = [0, 20, 40, 60, 80, 100].map((puntos, nivel) => ({ nivel, puntos, descripcion: `Nivel ${puntos}` }));

const crearRubricaCoevaluacion = () => ({
  nombre: 'Coevaluacion del equipo',
  tipo: 'COEVALUACION',
  criterios: Array.from({ length: 5 }, (_, indice) => ({
    nombre: `Criterio ${indice + 1}`,
    peso: 20,
    niveles: nivelesCoevaluacion
  }))
});

test('acepta una actividad grupal con coevaluacion configurada', () => {
  const actividad = actividadEntregableSchema.parse({
    nombre: 'Entrega final',
    descripcion: 'Presentar la evidencia del sprint final.',
    fecha_limite: '2026-10-30T23:59:00.000Z',
    tipo: 'GRUPAL',
    id_rubrica_docente: 10,
    id_rubrica_coevaluacion: 11,
    coevaluacion_activa: true,
    criterios: [1, 2],
    proyectos: [4, 5]
  });

  assert.equal(actividad.tipo, 'GRUPAL');
  assert.equal(actividad.coevaluacion_activa, true);
});

test('rechaza coevaluacion activa en una actividad individual', () => {
  const resultado = actividadEntregableSchema.safeParse({
    nombre: 'Entrega individual',
    descripcion: 'Evidencia individual del estudiante.',
    fecha_limite: '2026-10-30T23:59:00.000Z',
    tipo: 'INDIVIDUAL',
    id_rubrica_docente: 10,
    id_rubrica_coevaluacion: 11,
    coevaluacion_activa: true,
    criterios: [1],
    proyectos: [4]
  });

  assert.equal(resultado.success, false);
  assert.match(resultado.error.issues[0].message, /solo aplica/i);
});

test('acepta una rubrica de coevaluacion con cinco criterios de 20%', () => {
  const rubrica = rubricaSchema.parse(crearRubricaCoevaluacion());
  assert.equal(rubrica.criterios.length, 5);
});

test('rechaza una rubrica de coevaluacion con pesos incorrectos', () => {
  const rubrica = crearRubricaCoevaluacion();
  rubrica.criterios[0].peso = 10;
  const resultado = rubricaSchema.safeParse(rubrica);

  assert.equal(resultado.success, false);
  assert.match(resultado.error.issues.map(({ message }) => message).join(' '), /20%/);
});

test('rechaza una evaluacion sin retroalimentacion suficiente', () => {
  const resultado = evaluacionEntregaSchema.safeParse({
    calificaciones: [{ id_criterio: 1, nota: 4 }],
    retroalimentacion: 'Muy bien'
  });

  assert.equal(resultado.success, false);
  assert.match(resultado.error.issues[0].message, />=20 characters|20 caracteres/i);
});

test('valida asignaciones y estados del backlog', () => {
  assert.deepEqual(asignarProyectosSchema.parse({ proyectos: ['4', 5] }), { proyectos: [4, 5] });
  assert.equal(tareaBacklogSchema.parse({ titulo: 'Configurar despliegue' }).estado, 'por_hacer');
  assert.deepEqual(actualizarEstadoTareaSchema.parse({ estado: 'hecho' }), { estado: 'hecho' });
  assert.equal(actualizarEstadoTareaSchema.safeParse({ estado: 'cancelado' }).success, false);
});

test('rechaza una rubrica docente con niveles fuera de 0 a 5', () => {
  const rubrica = {
    nombre: 'Rubrica docente',
    tipo: 'DOCENTE',
    criterios: [{ nombre: 'Calidad', peso: 100, niveles: [...nivelesDocentes, { nivel: 6, puntos: 6 }] }]
  };
  assert.equal(rubricaSchema.safeParse(rubrica).success, false);
});
