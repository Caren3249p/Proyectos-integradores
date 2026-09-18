export const PESO_CRITERIO = 0.2;
export const ESCALA_COEVALUACION = new Set([0, 20, 40, 60, 80, 100]);

export const calcularTotalCoevaluacion = (calificaciones, criterios) => criterios.reduce((total, criterio) => {
  const item = calificaciones.find(({ id_criterio }) => id_criterio === criterio.id_criterio);
  const valorReal = 100 * Math.sqrt(Number(item?.calificacion_base || 0) / 100);
  return total + valorReal * PESO_CRITERIO;
}, 0);

export const validarCalificacionesCoevaluacion = (calificaciones, criterios, errorConEstado) => {
  if (!Array.isArray(calificaciones) || calificaciones.length !== criterios.length) {
    throw errorConEstado('Debe calificar todos los criterios de la rúbrica de coevaluación', 400);
  }
  const ids = new Set(criterios.map(({ id_criterio }) => id_criterio));
  const recibidos = new Set();
  for (const item of calificaciones) {
    if (!ids.has(item.id_criterio) || recibidos.has(item.id_criterio)) {
      throw errorConEstado('Los criterios enviados no pertenecen a la rúbrica o están repetidos', 400);
    }
    if (!ESCALA_COEVALUACION.has(Number(item.calificacion_base))) {
      throw errorConEstado('Las calificaciones deben ser 0, 20, 40, 60, 80 o 100', 400);
    }
    recibidos.add(item.id_criterio);
  }
};
