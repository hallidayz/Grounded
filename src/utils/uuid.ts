/**
 * UUID Generation Utility
 * 
 * Centralized UUID generation to replace duplicate implementations.
 * Uses native crypto.randomUUID() when available, falls back to RFC4122 v4 compliant implementation.
 */

/**
 * Generate a UUID v4 (random)
 * 
 * @returns A UUID string in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * 
 * @example
 * const id = generateUUID();
 * // Returns: "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateUUID(): string {
  // Use native crypto.randomUUID() if available (modern browsers, Node.js 14.17+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: RFC4122 version 4 compliant UUID
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate UUID format
 * 
 * @param uuid - The UUID string to validate
 * @returns true if the UUID is in valid format
 * 
 * @example
 * isValidUUID('550e8400-e29b-41d4-a716-446655440000'); // true
 * isValidUUID('invalid'); // false
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
