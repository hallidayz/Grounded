/**
 * Encrypted PWA Database Service
 * HIPAA-compliant encrypted SQLite database with audit logging
 */

import initSqlJs, { Database } from 'sql.js';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: number;
  action: string;
  table?: string;
  recordId?: string;
  details?: string;
}

export interface QueryResult {
  [key: string]: any;
}

export class EncryptedPWA {
  private static instance: EncryptedPWA | null = null;
  private static SQL: any = null; // sql.js module
  private db: Database | null = null; // SQLite database instance
  private encryptionKey: CryptoKey | null = null;
  private userId: number;
  private initialized: boolean = false;
  
  private constructor(userId: number) {
    this.userId = userId;
  }
  
  /**
   * Initialize sql.js module (call once)
   * Works in both browser and Node.js environments
   */
  private static async initSQL(): Promise<void> {
    if (!EncryptedPWA.SQL) {
      // Detect environment
      const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
      
      if (isNode) {
        // Node.js environment - use file system path
        try {
          const path = await import('path');
          const pathModule = path.default || path;
          const wasmPath = pathModule.join(
            process.cwd(),
            'node_modules',
            'sql.js',
            'dist',
            'sql-wasm.wasm'
          );
          
          EncryptedPWA.SQL = await initSqlJs({
            locateFile: () => wasmPath
          });
        } catch (error) {
          // Fallback: try using URL path relative to node_modules
          const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
          EncryptedPWA.SQL = await initSqlJs({
            locateFile: () => wasmPath
          });
        }
      } else {
        // Browser environment - use CDN URL
        EncryptedPWA.SQL = await initSqlJs({
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`
        });
      }
    }
  }

  /**
   * Initialize encrypted database with password
   */
  static async init(password: string, userId: number): Promise<EncryptedPWA> {
    await EncryptedPWA.initSQL();
    const instance = new EncryptedPWA(userId);
    await instance.deriveKey(password);
    await instance.loadOrCreateDB();
    // Mark as initialized after database is loaded/created
    // (initialized flag is also set in loadOrCreateDB for new databases)
    if (!instance.initialized) {
      instance.initialized = true;
    }
    EncryptedPWA.instance = instance;
    return instance;
  }
  
  /**
   * Get current instance (if initialized)
   */
  static getInstance(): EncryptedPWA | null {
    return EncryptedPWA.instance;
  }
  
  /**
   * Derive encryption key from password using PBKDF2
   */
  private async deriveKey(password: string): Promise<void> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Derive key using PBKDF2
    const salt = await this.getOrCreateSalt();
    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Get or create salt for key derivation
   */
  private async getOrCreateSalt(): Promise<Uint8Array> {
    const saltKey = 'grounded_encryption_salt';
    let salt = localStorage.getItem(saltKey);
    
    if (!salt) {
      // Generate new salt
      const saltArray = new Uint8Array(16);
      crypto.getRandomValues(saltArray);
      salt = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(saltKey, salt);
    }
    
    // Convert hex string back to Uint8Array
    const saltBytes = new Uint8Array(salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return saltBytes;
  }
  
  /**
   * Load or create encrypted database
   */
  private async loadOrCreateDB(): Promise<void> {
    try {
      // Try to load existing encrypted database
      const encryptedData = await this.loadEncryptedDBInternal();
      
      if (encryptedData) {
        // Decrypt and load database
        const decryptedData = await this.decrypt(encryptedData);
        await this.initSQLite(decryptedData);
        // Mark as initialized after database is loaded
        this.initialized = true;
      } else {
        // Create new database
        await this.initSQLite(null);
        await this.createSchema();
        // Mark as initialized after schema is created
        this.initialized = true;
      }
    } catch (error) {
      console.error('Error loading database:', error);
      throw new Error('Failed to load encrypted database. Wrong password?');
    }
  }
  
  /**
   * Initialize SQLite database
   */
  private async initSQLite(data: Uint8Array | null): Promise<void> {
    if (!EncryptedPWA.SQL) {
      await EncryptedPWA.initSQL();
    }
    
    try {
      if (data && data.length > 0) {
        this.db = new EncryptedPWA.SQL.Database(data);
      } else {
        this.db = new EncryptedPWA.SQL.Database();
      }
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
      throw new Error('Failed to initialize database. Wrong password or corrupted data?');
    }
  }
  
  /**
   * Create database schema
   */
  private async createSchema(): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS users_encrypted (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        therapist_emails TEXT,
        terms_accepted INTEGER DEFAULT 0,
        terms_accepted_date TEXT,
        created_at TEXT NOT NULL,
        last_login TEXT
      );
      
      CREATE TABLE IF NOT EXISTS app_data_encrypted (
        user_id TEXT PRIMARY KEY,
        settings TEXT,
        logs TEXT,
        goals TEXT,
        "values" TEXT,
        lcsw_config TEXT,
        updated_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS feeling_logs_encrypted (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        timestamp TEXT NOT NULL,
        emotional_state TEXT,
        selected_feeling TEXT,
        reflection_text TEXT,
        ai_analysis TEXT,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS goals_encrypted (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        value_id TEXT NOT NULL,
        text TEXT NOT NULL,
        frequency TEXT,
        completed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );
      
      CREATE TABLE IF NOT EXISTS goal_updates_encrypted (
        id TEXT PRIMARY KEY,
        goal_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        note TEXT,
        mood TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (goal_id) REFERENCES goals_encrypted(id)
      );
      
      CREATE TABLE IF NOT EXISTS reset_tokens_encrypted (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        expires INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS user_interactions_encrypted (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        type TEXT NOT NULL,
        session_id TEXT NOT NULL,
        user_id TEXT,
        value_id TEXT,
        emotional_state TEXT,
        selected_feeling TEXT,
        metadata TEXT,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS sessions_encrypted (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        start_timestamp TEXT NOT NULL,
        end_timestamp TEXT,
        value_id TEXT NOT NULL,
        initial_emotional_state TEXT,
        final_emotional_state TEXT,
        selected_feeling TEXT,
        reflection_length INTEGER,
        goal_created INTEGER DEFAULT 0,
        duration INTEGER,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        table_name TEXT,
        record_id TEXT,
        details TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
      CREATE INDEX IF NOT EXISTS idx_feeling_logs_user ON feeling_logs_encrypted(user_id);
      CREATE INDEX IF NOT EXISTS idx_goals_user ON goals_encrypted(user_id);
      CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON reset_tokens_encrypted(user_id);
      CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires ON reset_tokens_encrypted(expires);
      CREATE INDEX IF NOT EXISTS idx_user_interactions_session ON user_interactions_encrypted(session_id);
      CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions_encrypted(timestamp);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions_encrypted(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_value ON sessions_encrypted(value_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions_encrypted(start_timestamp);
    `;
    
    // Execute schema
    await this.executeSQL(schema);
    
    // Log schema creation (skip if database not fully initialized yet)
    try {
      await this.auditLog('schema_created', 'system', null, 'Database schema initialized');
    } catch (error) {
      // Ignore audit log errors during initial schema creation
      console.warn('Could not log schema creation:', error);
    }
  }
  
  /**
   * Execute SQL statement (for schema creation)
   */
  private async executeSQL(sql: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      // Split multiple statements
      const statements = sql.split(';').filter(s => s.trim().length > 0);
      for (const statement of statements) {
        this.db.run(statement.trim() + ';');
      }
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }
  
  /**
   * Query database (SELECT statements)
   */
  async query(sql: string, params?: any[]): Promise<QueryResult[]> {
    if (!this.initialized || !this.encryptionKey || !this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const stmt = this.db.prepare(sql);
      
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      
      const results: QueryResult[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row);
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('Query error:', error, 'SQL:', sql);
      throw error;
    }
  }
  
  /**
   * Execute SQL statement (INSERT, UPDATE, DELETE)
   */
  async execute(sql: string, params?: any[]): Promise<void> {
    if (!this.initialized || !this.encryptionKey || !this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const stmt = this.db.prepare(sql);
      
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      
      stmt.step();
      stmt.free();
    } catch (error) {
      console.error('Execute error:', error, 'SQL:', sql);
      throw error;
    }
  }
  
  /**
   * Save encrypted database to storage
   */
  async save(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      // Export database to binary
      const dbData = await this.exportDB();
      
      // Encrypt database
      const encryptedData = await this.encrypt(dbData);
      
      // Save to OPFS or IndexedDB
      await this.saveEncryptedDB(encryptedData);
      
      // Audit log
      await this.auditLog('database_saved', 'system', null, 'Encrypted database saved');
    } catch (error) {
      console.error('Error saving database:', error);
      throw error;
    }
  }
  
  /**
   * Export database to binary format
   */
  private async exportDB(): Promise<Uint8Array> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const data = this.db.export();
      return new Uint8Array(data);
    } catch (error) {
      console.error('Error exporting database:', error);
      throw error;
    }
  }
  
  /**
   * Encrypt data using AES-GCM
   */
  private async encrypt(data: Uint8Array): Promise<ArrayBuffer> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      data
    );
    
    // Prepend IV to encrypted data
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);
    
    return result.buffer;
  }
  
  /**
   * Decrypt data using AES-GCM
   */
  private async decrypt(encryptedData: ArrayBuffer): Promise<Uint8Array> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }
    
    const data = new Uint8Array(encryptedData);
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    
    try {
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey!,
        encrypted
      );
      
      return new Uint8Array(decrypted);
    } catch (error) {
      // Wrong password or corrupted data
      throw new Error('Failed to decrypt database. Wrong password?');
    }
  }
  
  /**
   * Load encrypted database from storage (public for testing)
   */
  async loadEncryptedDB(): Promise<ArrayBuffer | null> {
    return this.loadEncryptedDBInternal();
  }
  
  /**
   * Internal method to load encrypted database
   */
  private async loadEncryptedDBInternal(): Promise<ArrayBuffer | null> {
    try {
      // Try OPFS first (if available)
      if ('FileSystemHandle' in window) {
        try {
          const opfsRoot = await navigator.storage.getDirectory();
          const dbFile = await opfsRoot.getFileHandle('grounded_encrypted.db', { create: false });
          const file = await dbFile.getFile();
          return await file.arrayBuffer();
        } catch (error) {
          // OPFS not available or file doesn't exist
        }
      }
      
      // Fallback to IndexedDB
      const dbName = 'grounded_encrypted_storage';
      const storeName = 'encrypted_db';
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            resolve(null);
            return;
          }
          
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const getRequest = store.get('database');
          
          getRequest.onsuccess = () => {
            const result = getRequest.result;
            resolve(result ? result.data : null);
          };
          
          getRequest.onerror = () => reject(getRequest.error);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        };
      });
    } catch (error) {
      console.error('Error loading encrypted database:', error);
      return null;
    }
  }
  
  /**
   * Save encrypted database to storage
   */
  private async saveEncryptedDB(data: ArrayBuffer): Promise<void> {
    try {
      // Try OPFS first (if available)
      if ('FileSystemHandle' in window) {
        try {
          const opfsRoot = await navigator.storage.getDirectory();
          const dbFile = await opfsRoot.getFileHandle('grounded_encrypted.db', { create: true });
          const writable = await dbFile.createWritable();
          await writable.write(data);
          await writable.close();
          return;
        } catch (error) {
          // OPFS not available, fall through to IndexedDB
        }
      }
      
      // Fallback to IndexedDB
      const dbName = 'grounded_encrypted_storage';
      const storeName = 'encrypted_db';
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const putRequest = store.put({ id: 'database', data: data });
          
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        };
      });
    } catch (error) {
      console.error('Error saving encrypted database:', error);
      throw error;
    }
  }
  
  /**
   * Audit log entry
   */
  async auditLog(
    action: string,
    tableName?: string,
    recordId?: string | null,
    details?: string
  ): Promise<void> {
    const logEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action,
      table: tableName,
      recordId: recordId || undefined,
      details
    };
    
    // Insert into audit_log table
    await this.execute(
      `INSERT INTO audit_log (id, timestamp, user_id, action, table_name, record_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        logEntry.id,
        logEntry.timestamp,
        logEntry.userId,
        logEntry.action,
        logEntry.table || null,
        logEntry.recordId || null,
        logEntry.details || null
      ]
    );
  }
  
  /**
   * Verify database integrity
   */
  async verifyIntegrity(): Promise<boolean> {
    try {
      const result = await this.query('PRAGMA integrity_check');
      const integrityResult = result[0]?.integrity_check;
      return integrityResult === 'ok';
    } catch (error) {
      console.error('Error verifying integrity:', error);
      return false;
    }
  }
  
  /**
   * Generate report (PDF) - placeholder for reports integration
   */
  async generateReport(format: 'SOAP' | 'DAP' | 'BIRP' = 'SOAP'): Promise<Uint8Array> {
    // TODO: Implement PDF generation using pdfmake
    // This will be implemented in reports_integration todo
    await this.auditLog('report_generated', 'reports', null, `Format: ${format}`);
    return new Uint8Array(0);
  }

  /**
   * Change password and re-encrypt database
   * This requires the old password to decrypt, then re-encrypts with new password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (!this.db || !this.initialized) {
      throw new Error('Database not initialized');
    }

    try {
      // Step 1: Verify old password by trying to decrypt
      // We need to temporarily derive the old key to verify
      const oldSalt = await this.getOrCreateSalt();
      const encoder = new TextEncoder();
      const oldPasswordData = encoder.encode(oldPassword);
      const oldKeyMaterial = await crypto.subtle.importKey(
        'raw',
        oldPasswordData,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      const oldKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: oldSalt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        oldKeyMaterial,
        {
          name: 'AES-GCM',
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      );

      // Try to decrypt existing database with old password to verify it's correct
      const encryptedData = await this.loadEncryptedDBInternal();
      if (encryptedData) {
        const data = new Uint8Array(encryptedData);
        const iv = data.slice(0, 12);
        const encrypted = data.slice(12);
        
        try {
          await crypto.subtle.decrypt(
            {
              name: 'AES-GCM',
              iv: iv
            },
            oldKey,
            encrypted
          );
        } catch (error) {
          throw new Error('Old password is incorrect');
        }
      }

      // Step 2: Export current database (unencrypted)
      const dbData = await this.exportDB();

      // Step 3: Generate new salt for new password
      const newSaltArray = new Uint8Array(16);
      crypto.getRandomValues(newSaltArray);
      const saltKey = 'grounded_encryption_salt';
      const newSaltHex = Array.from(newSaltArray).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(saltKey, newSaltHex);

      // Step 4: Derive new encryption key from new password
      const newPasswordData = encoder.encode(newPassword);
      const newKeyMaterial = await crypto.subtle.importKey(
        'raw',
        newPasswordData,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      const newKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: newSaltArray,
          iterations: 100000,
          hash: 'SHA-256'
        },
        newKeyMaterial,
        {
          name: 'AES-GCM',
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      );

      // Step 5: Update encryption key
      this.encryptionKey = newKey;

      // Step 6: Re-encrypt and save database
      const newEncryptedData = await this.encrypt(dbData);
      await this.saveEncryptedDB(newEncryptedData);

      // Step 7: Audit log
      await this.auditLog('password_changed', 'system', null, 'Database re-encrypted with new password');

      console.log('Password changed successfully - database re-encrypted');
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

