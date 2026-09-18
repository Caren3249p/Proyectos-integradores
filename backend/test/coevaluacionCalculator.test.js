import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularTotalCoevaluacion, validarCalificacionesCoevaluacion } from '../src/services/coevaluacionCalculator.js';

const criterios = [1, 2, 3, 4, 5].map((id) => ({ id_criterio: id }));

const calificaciones = (valor) => criterios.map(({ id_criterio }) => ({ id_criterio, calificacion_base: valor }));

test('convierte cinco calificaciones de 100 en 100%', () => {
  assert.equal(calcularTotalCoevaluacion(calificaciones(100), criterios), 100);
});

test('aplica la curva de raíz cuadrada', () => {
  assert.ok(Math.abs(calcularTotalCoevaluacion(calificaciones(80), criterios) - 89.442719) < 0.000001);
});

test('rechaza una calificación fuera de la escala permitida', () => {
  assert.throws(
    () => validarCalificacionesCoevaluacion(calificaciones(70), criterios, (message) => new Error(message)),
    /0, 20, 40, 60, 80 o 100/
  );
});
