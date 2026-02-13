/**
 * Security utility for encrypting and decrypting sensitive data at rest.
 * Uses Web Crypto API (AES-GCM 256-bit).
 */

const KEY_NAME = 'acminds_crypto_key';

/**
 * Gets the existing encryption key from localStorage or generates a new one.
 * The key is stored as a base64 string in localStorage.
 */
async function getOrCreateKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem(KEY_NAME);
  if (storedKey) {
    try {
      const keyData = Uint8Array.from(atob(storedKey), c => c.charCodeAt(0));
      return await crypto.subtle.importKey(
        'raw',
        keyData,
        'AES-GCM',
        true,
        ['encrypt', 'decrypt']
      );
    } catch (e) {
      console.error('[Crypto] Failed to import encryption key, generating new one:', e);
    }
  }

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exported = await crypto.subtle.exportKey('raw', key);
  const exportedArray = new Uint8Array(exported);
  let binary = '';
  for (let i = 0; i < exportedArray.byteLength; i++) {
    binary += String.fromCharCode(exportedArray[i]);
  }
  localStorage.setItem(KEY_NAME, btoa(binary));

  return key;
}

/**
 * Encrypts a plaintext string using AES-GCM.
 * Returns a base64 encoded string containing the IV and the ciphertext.
 */
export async function encrypt(text: string): Promise<string> {
  try {
    const key = await getOrCreateKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);

    let binary = '';
    for (let i = 0; i < combined.byteLength; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error('[Crypto] Encryption failed:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypts a base64 encoded string containing IV and ciphertext.
 * Returns the original plaintext string.
 */
export async function decrypt(encryptedBase64: string): Promise<string> {
  try {
    const key = await getOrCreateKey();
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

    if (combined.length < 13) {
      throw new Error('Invalid encrypted data');
    }

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('[Crypto] Decryption failed:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Removes the encryption key from localStorage.
 * Warning: This will make all previously encrypted data unrecoverable.
 */
export function clearCryptoKey(): void {
  localStorage.removeItem(KEY_NAME);
}
