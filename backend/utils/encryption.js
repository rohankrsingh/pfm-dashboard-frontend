import CryptoJS from 'crypto-js';

// Encryption key must be set in env — 32 chars recommended
const ENCRYPTION_KEY = process.env.PLAID_ENCRYPTION_KEY || process.env.JWT_SECRET;

if (!ENCRYPTION_KEY) {
  console.error('[SECURITY] PLAID_ENCRYPTION_KEY not set. Access tokens will not be encrypted securely.');
}

/**
 * Encrypt a plaintext string (e.g. Plaid access_token) before storing.
 */
export function encrypt(plaintext) {
  if (!plaintext) return null;
  return CryptoJS.AES.encrypt(plaintext, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt a previously encrypted string.
 */
export function decrypt(ciphertext) {
  if (!ciphertext) return null;
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
