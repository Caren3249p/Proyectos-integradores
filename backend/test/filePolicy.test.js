import test from 'node:test';
import assert from 'node:assert/strict';
import { archivoPermitido, EXTENSIONES_PERMITIDAS, TIPOS_PERMITIDOS } from '../src/utils/filePolicy.js';

const formatos = [
  ['.pdf', 'application/pdf'],
  ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  ['.zip', 'application/zip'],
  ['.zip', 'application/x-zip-compressed']
];

test('permite exactamente los formatos institucionales definidos', () => {
  for (const [extension, mime] of formatos) {
    assert.equal(EXTENSIONES_PERMITIDAS.has(extension), true, `Falta extension ${extension}`);
    assert.equal(TIPOS_PERMITIDOS.has(mime), true, `Falta MIME ${mime}`);
    assert.equal(archivoPermitido(extension, mime), true);
  }
});

test('rechaza formatos ejecutables y documentos no autorizados', () => {
  assert.equal(EXTENSIONES_PERMITIDAS.has('.exe'), false);
  assert.equal(EXTENSIONES_PERMITIDAS.has('.xlsx'), false);
  assert.equal(TIPOS_PERMITIDOS.has('application/x-msdownload'), false);
  assert.equal(TIPOS_PERMITIDOS.has('text/html'), false);
  assert.equal(archivoPermitido('.pdf', 'text/html'), false);
  assert.equal(archivoPermitido('.exe', 'application/pdf'), false);
});
