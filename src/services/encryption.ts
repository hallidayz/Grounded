// src/services/encryption.ts
/**
 * Provides AES-GCM encryption and decryption using the WebCrypto API.
 * Fully asynchronous, lightweight, and secure.
 */

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

const IV_SIZE = 12; // for AES-GCM

async function getKey(secret: string): Promise<CryptoKey> {
  const keyData = ENCODER.encode(secret.padEnd(32, '0').slice(0, 32)); // 256-bit key
  return crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptData(plainText: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    ENCODER.encode(plainText)
  );

  const buffer = new Uint8Array(iv.length + encrypted.byteLength);
  buffer.set(iv, 0);
  buffer.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...buffer));
}

export async function decryptData(cipherText: string, secret: string): Promise<string> {
  const data = Uint8Array.from(atob(cipherText), (c) => c.charCodeAt(0));
  const iv = data.slice(0, IV_SIZE);
  const content = data.slice(IV_SIZE);

  const key = await getKey(secret);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, content);

  return DECODER.decode(decrypted);
}

