export const EXTENSIONES_PERMITIDAS = new Set(['.pdf', '.docx', '.pptx', '.zip']);

export const TIPOS_PERMITIDOS = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]);

export const archivoPermitido = (extension, mimetype) => (
  EXTENSIONES_PERMITIDAS.has(String(extension).toLowerCase()) && TIPOS_PERMITIDOS.has(mimetype)
);
