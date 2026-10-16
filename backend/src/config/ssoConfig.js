import { createPrivateKey, createPublicKey } from 'node:crypto';
import { exportJWK, importPKCS8 } from 'jose';

const normalizarPem = (valor) => valor?.replace(/\\n/g, '\n').trim();

export const obtenerConfiguracionSso = () => ({
  keyId: process.env.SSO_KEY_ID || 'principal-pruebas-2026-10-13',
  issuer: process.env.SSO_ISSUER || 'urn:upb:proyectos-integradores',
  audience: process.env.SSO_AUDIENCE || 'urn:educationconnect:chat:pruebas',
  chatServiceUrl: process.env.CHAT_SERVICE_URL || 'http://localhost:5173',
  returnUrl: process.env.SSO_RETURN_URL || 'http://localhost:3312',
  privateKeyPem: normalizarPem(process.env.SSO_PRIVATE_KEY)
    || (process.env.SSO_PRIVATE_KEY_B64
      ? Buffer.from(process.env.SSO_PRIVATE_KEY_B64, 'base64').toString('utf8')
      : null)
});

const exigirClavePrivada = () => {
  const { privateKeyPem } = obtenerConfiguracionSso();
  if (!privateKeyPem) {
    const error = new Error('La clave privada SSO no está configurada');
    error.status = 503;
    error.code = 'SSO_NO_CONFIGURADO';
    throw error;
  }
  return privateKeyPem;
};

export const importarClavePrivadaSso = async () => importPKCS8(exigirClavePrivada(), 'RS256');

export const obtenerJwkPublicaSso = async () => {
  const config = obtenerConfiguracionSso();
  const clavePublica = createPublicKey(createPrivateKey(exigirClavePrivada()));
  const jwk = await exportJWK(clavePublica);
  return {
    ...jwk,
    kid: config.keyId,
    use: 'sig',
    alg: 'RS256',
    kty: 'RSA'
  };
};