export const ESTADOS = {
  por_hacer: 'por_hacer',
  en_progreso: 'en_progreso',
  hecho: 'hecho'
};

export const normalizarEstado = (estado) => {
  const valor = String(estado || '').trim().toLowerCase().replaceAll(' ', '_');
  if (!Object.hasOwn(ESTADOS, valor)) {
    const error = new Error('Estado inválido. Usa por_hacer, en_progreso o hecho.');
    error.status = 400;
    throw error;
  }
  return valor;
};

export const estadoPlaneEsHecho = (issue) => {
  const nombre = String(issue.state_detail?.name || issue.state?.name || issue.state || '').toLowerCase();
  return ['hecho', 'done', 'completed', 'closed'].some((valor) => nombre.includes(valor));
};

export const resultados = (data) => Array.isArray(data) ? data : data?.results || [];