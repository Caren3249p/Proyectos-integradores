import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

const getKey = () => {
  const rawKey = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!rawKey) throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY no está configurada');
  const key = Buffer.from(rawKey, 'base64');
  if (key.length !== 32) throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY debe ser una clave base64 de 32 bytes');
  return key;
};

export const encryptSecret = (value) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map((part) => part.toString('base64')).join(':');
};

export const decryptSecret = (payload) => {
  const [ivEncoded, authTagEncoded, encryptedEncoded] = String(payload || '').split(':');
  if (!ivEncoded || !authTagEncoded || !encryptedEncoded) throw new Error('Secreto cifrado inválido');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivEncoded, 'base64'));
  decipher.setAuthTag(Buffer.from(authTagEncoded, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, 'base64')),
    decipher.final()
  ]).toString('utf8');
};

export const createOAuthState = () => crypto.randomBytes(32).toString('hex');
