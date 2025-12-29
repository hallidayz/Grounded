# HIPAA Policies

## Access Control Policy

### Purpose

This policy establishes requirements for access control to protect electronic Protected Health Information (ePHI) in the Grounded application.

### Scope

This policy applies to all users, administrators, and systems that access ePHI within the Grounded application.

### Policy

#### 1. User Identification

- Each user must have a unique identifier (user ID)
- User IDs must not be shared between users
- User IDs must be traceable to individual users

#### 2. Authentication

- **Encrypted Mode**: Password-based authentication required
  - Minimum password length: 8 characters
  - Passwords are used to derive encryption keys
  - Passwords are never stored in plaintext
- **Legacy Mode**: No authentication required (data not encrypted)

#### 3. Session Management

- **Session Timeout**: 15 minutes of inactivity
- **Activity Tracking**: User activity is monitored (mouse, keyboard, scroll, touch)
- **Automatic Logoff**: Sessions automatically terminate after timeout
- **Session Restoration**: Users must re-authenticate after timeout

#### 4. Access Levels

- **Client Role**: Access to own data only (read/write)
- **LCSW Role**: Access to authorized client data (read/write)
- **Admin Role**: Full system access (read/write/delete)

#### 5. Access Control Implementation

- Access control is enforced at the application level
- Database encryption ensures data is protected at rest
- Session management prevents unauthorized access
- Audit logs track all access attempts

### Procedures

1. **User Registration**
   - User creates account with unique username
   - User sets password (encrypted mode only)
   - User ID is assigned and stored

2. **User Authentication**
   - User enters password (encrypted mode)
   - System derives encryption key from password
   - System unlocks encrypted database
   - Session is established with activity tracking

3. **Session Management**
   - System tracks user activity
   - System checks session validity every minute
   - System logs out user after 15 minutes of inactivity
   - User must re-authenticate to continue

4. **Access Revocation**
   - User can log out manually
   - System automatically logs out after timeout
   - Session data is cleared on logout

### Enforcement

- Violations of this policy may result in:
  - Immediate session termination
  - Account suspension
  - Legal action if applicable

### Review

This policy is reviewed annually or as needed based on:
- Security incidents
- Regulatory changes
- Technology updates

---

## Key Management Policy

### Purpose

This policy establishes requirements for encryption key management to protect ePHI in the Grounded application.

### Scope

This policy applies to all encryption keys used to protect ePHI within the Grounded application.

### Policy

#### 1. Key Derivation

- **Algorithm**: PBKDF2 (Password-Based Key Derivation Function 2)
- **Hash Function**: SHA-256
- **Iterations**: 100,000
- **Salt**: Random 16-byte salt, stored securely
- **Key Length**: 256 bits (AES-256)

#### 2. Key Storage

- **Encryption Keys**: Never stored in plaintext
- **Key Derivation**: Keys are derived on-demand from user password
- **Salt Storage**: Salt stored in localStorage (not sensitive alone)
- **Key Material**: Never transmitted over network

#### 3. Key Usage

- **Encryption Algorithm**: AES-256-GCM
- **IV Generation**: Random 12-byte IV per encryption operation
- **Key Scope**: One key per user, per database
- **Key Lifetime**: Key exists only during active session

#### 4. Key Protection

- **Password Protection**: Keys are protected by user passwords
- **Session Isolation**: Keys are not shared between sessions
- **Memory Management**: Keys are cleared from memory on logout
- **No Key Backup**: Keys are not backed up (password recovery required)

#### 5. Key Rotation

- **Current Policy**: No automatic key rotation
- **Manual Rotation**: Users can change password (creates new key)
- **Migration**: Old data remains accessible with old password
- **Future Consideration**: Key rotation may be implemented

### Procedures

1. **Key Derivation**
   - User enters password
   - System retrieves or creates salt
   - System derives key using PBKDF2
   - Key is used for current session only

2. **Key Usage**
   - Key is used to encrypt/decrypt database
   - Key is stored in memory only (never persisted)
   - Key is cleared on logout or timeout

3. **Password Change**
   - User provides old password
   - System unlocks database with old key
   - User provides new password
   - System derives new key
   - System re-encrypts database with new key
   - Old key is discarded

4. **Key Recovery**
   - Keys cannot be recovered without password
   - Users must remember passwords
   - Backup/restore available for data recovery
   - Password reset requires data migration

### Security Considerations

1. **Password Strength**: Users should use strong passwords
2. **Password Storage**: Passwords are never stored
3. **Key Compromise**: If password is compromised, key is compromised
4. **Physical Security**: Device security is important
5. **Session Security**: Keys exist only during active sessions

### Compliance

This policy ensures compliance with:
- HIPAA §164.312(e)(1) - Encryption and Decryption
- NIST SP 800-63B - Digital Identity Guidelines
- OWASP Key Management Cheat Sheet

### Review

This policy is reviewed annually or as needed based on:
- Security incidents
- Cryptographic best practices updates
- Regulatory changes

---

## Document Control

**Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Next Review**: 2026-01-XX  
**Owner**: Development Team  
**Approved By**: [To be filled]

