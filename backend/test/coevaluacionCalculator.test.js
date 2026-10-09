import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularNotaDefinitiva, calcularTotalCoevaluacion, validarCalificacionesCoevaluacion } from '../src/services/coevaluacionCalculator.js';

const criterios = [1, 2, 3, 4, 5].map((id) => ({ id_criterio: id }));

const calificaciones = (valor) => criterios.map(({ id_criterio }) => ({ id_criterio, calificacion_base: valor }));
const errorConEstado = (message, status = 400) => Object.assign(new Error(message), { status });

test('convierte cinco calificaciones de 100 en 100%', () => {
  assert.equal(calcularTotalCoevaluacion(calificaciones(100), criterios), 100);
});

test('aplica la curva de raíz cuadrada', () => {
  assert.ok(Math.abs(calcularTotalCoevaluacion(calificaciones(80), criterios) - 89.442719) < 0.000001);
});

test('rechaza una calificación fuera de la escala permitida', () => {
  assert.throws(
    () => validarCalificacionesCoevaluacion(calificaciones(70), criterios, errorConEstado),
    /0, 20, 40, 60, 80 o 100/
  );
});

test('rechaza criterios duplicados o ajenos a la rúbrica', () => {
  assert.throws(
    () => validarCalificacionesCoevaluacion([
      { id_criterio: 1, calificacion_base: 100 },
      { id_criterio: 1, calificacion_base: 80 },
      ...calificaciones(0).slice(2)
    ], criterios, errorConEstado),
    /no pertenecen.*repetidos/i
  );
});

test('rechaza una coevaluación incompleta', () => {
  assert.throws(
    () => validarCalificacionesCoevaluacion(calificaciones(100).slice(0, 4), criterios, errorConEstado),
    /todos los criterios/i
  );
});

test('calcula la nota definitiva con la fórmula institucional', () => {
  assert.equal(calcularNotaDefinitiva(4.5, 80), 3.6);
  assert.equal(calcularNotaDefinitiva(5, 100), 5);
  assert.equal(calcularNotaDefinitiva(5, 0), 0);
});

test('mantiene pendiente la nota definitiva si no hay nota base', () => {
  assert.equal(calcularNotaDefinitiva(null, 80), null);
  assert.equal(calcularNotaDefinitiva(undefined, 80), null);
});
