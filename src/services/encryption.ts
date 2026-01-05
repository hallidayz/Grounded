/**
 * Encryption Service for HIPAA Compliance
 * 
 * Implements AES-GCM encryption for all PHI stored in IndexedDB
 * Meets HIPAA encryption requirements (45 CFR § 164.312(a)(2)(iv))
 * 
 * Security Features:
 * - AES-GCM 256-bit encryption (FIPS 140-2 compliant)
 * - Key derivation from user password using PBKDF2
 * - Unique IV (Initialization Vector) for each encryption operation
 * - Authentication tag for data integrity verification
 */

interface EncryptionKey {
  key: CryptoKey;
  salt: Uint8Array;
}

/**
 * Derive encryption key from user password using PBKDF2
 * This ensures the encryption key is unique per user and not stored
 */
async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // OWASP recommended minimum
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random salt for key derivation
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate a random IV (Initialization Vector) for AES-GCM
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
}

/**
 * Encrypt data using AES-GCM
 * Returns: base64-encoded string containing salt + IV + encrypted data + auth tag
 */
export async function encryptData(
  data: string,
  password: string,
  existingSalt?: Uint8Array
): Promise<string> {
  try {
    // Generate or use existing salt
    const salt = existingSalt || generateSalt();
    
    // Derive encryption key from password
    const key = await deriveKeyFromPassword(password, salt);
    
    // Generate IV
    const iv = generateIV();
    
    // Encrypt data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128, // 128-bit authentication tag
      },
      key,
      dataBuffer
    );
    
    // Combine salt + IV + encrypted data for storage
    // Format: [salt (16 bytes)][IV (12 bytes)][encrypted data + auth tag]
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    // Convert to base64 for storage in IndexedDB
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-GCM
 * Input: base64-encoded string containing salt + IV + encrypted data + auth tag
 */
export async function decryptData(
  encryptedData: string,
  password: string
): Promise<string> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(
      atob(encryptedData),
      c => c.charCodeAt(0)
    );
    
    // Extract components
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    // Derive encryption key from password
    const key = await deriveKeyFromPassword(password, salt);
    
    // Decrypt data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      key,
      encrypted
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - incorrect password or corrupted data');
  }
}

/**
 * Generate a secure encryption key for the current user session
 * This key is derived from the user's password and stored in memory only
 */
export async function generateEncryptionKey(password: string): Promise<EncryptionKey> {
  const salt = generateSalt();
  const key = await deriveKeyFromPassword(password, salt);
  return { key, salt };
}

/**
 * Verify encryption key is valid by attempting to decrypt a test value
 */
export async function verifyEncryptionKey(
  encryptedTestValue: string,
  password: string
): Promise<boolean> {
  try {
    await decryptData(encryptedTestValue, password);
    return true;
  } catch {
    return false;
  }
}




