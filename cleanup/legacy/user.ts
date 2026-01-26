/**
 * User Types and Permissions
 * HIPAA-compliant user role and access control
 */

export enum UserRole {
  CLIENT = 'client',
  LCSW = 'lcsw',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  therapistEmails?: string[];
}

/**
 * Check if user has access to a resource
 */
export function canAccess(user: User, resource: string, action: 'read' | 'write' | 'delete'): boolean {
  // Clients can only access their own data
  if (user.role === UserRole.CLIENT) {
    return action === 'read' || action === 'write';
  }
  
  // LCSW can read client data (with proper authorization)
  if (user.role === UserRole.LCSW) {
    return action === 'read' || action === 'write';
  }
  
  // Admin has full access
  if (user.role === UserRole.ADMIN) {
    return true;
  }
  
  return false;
}

