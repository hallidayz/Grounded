const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/transformers-CdMs_eeA.js","assets/onnx-eBVVFwq3.js","assets/db-vendor-CqkAjsCZ.js","assets/vendor-BKChQSPc.js"])))=>i.map(i=>d[i]);
import { D as Dexie } from "./db-vendor-CqkAjsCZ.js";
import { i as initSqlJs } from "./vendor-BKChQSPc.js";
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    let allSettled2 = function(promises) {
      return Promise.all(
        promises.map(
          (p) => Promise.resolve(p).then(
            (value) => ({ status: "fulfilled", value }),
            (reason) => ({ status: "rejected", reason })
          )
        )
      );
    };
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
    promise = allSettled2(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
async function deriveKeyFromPassword(password, salt) {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 1e5,
      // OWASP recommended minimum
      hash: "SHA-256"
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );
}
function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}
function generateIV() {
  return crypto.getRandomValues(new Uint8Array(12));
}
async function encryptData(data, password, existingSalt) {
  try {
    const salt = existingSalt || generateSalt();
    const key = await deriveKeyFromPassword(password, salt);
    const iv = generateIV();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
        tagLength: 128
        // 128-bit authentication tag
      },
      key,
      dataBuffer
    );
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}
async function decryptData(encryptedData, password) {
  try {
    const combined = Uint8Array.from(
      atob(encryptedData),
      (c) => c.charCodeAt(0)
    );
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    const key = await deriveKeyFromPassword(password, salt);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
        tagLength: 128
      },
      key,
      encrypted
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data - incorrect password or corrupted data");
  }
}
let config = {
  enableWarningsInProduction: false
  // Set to true to enable warnings in production
};
function shouldLog(level) {
  if (level === 3) {
    return true;
  }
  if (level === 2 && config.enableWarningsInProduction) {
    return true;
  }
  return false;
}
const logger = {
  /**
   * Debug logging (development only)
   * Use for detailed debugging information
   */
  debug: (...args) => {
    if (shouldLog(
      0
      /* DEBUG */
    )) {
      console.debug("[DEBUG]", ...args);
    }
  },
  /**
   * Info logging (development only)
   * Use for general information
   */
  info: (...args) => {
    if (shouldLog(
      1
      /* INFO */
    )) {
      console.info("[INFO]", ...args);
    }
  },
  /**
   * Warning logging
   * Use for non-critical issues that should be addressed
   */
  warn: (...args) => {
    if (shouldLog(
      2
      /* WARN */
    )) {
      console.warn("[WARN]", ...args);
    }
  },
  /**
   * Error logging (always enabled)
   * Use for errors that need attention
   */
  error: (...args) => {
    if (shouldLog(
      3
      /* ERROR */
    )) {
      console.error("[ERROR]", ...args);
    }
  },
  /**
   * Log with context prefix
   * Useful for module-specific logging
   */
  withContext: (context) => ({
    debug: (...args) => logger.debug(`[${context}]`, ...args),
    info: (...args) => logger.info(`[${context}]`, ...args),
    warn: (...args) => logger.warn(`[${context}]`, ...args),
    error: (...args) => logger.error(`[${context}]`, ...args)
  })
};
const DB_NAME = "groundedDB";
const CURRENT_DB_VERSION = 4;
class GroundedDB extends Dexie {
  constructor() {
    super(DB_NAME);
    this.version(3).stores({
      // Users store - keyPath: id, indexes: username (unique), email (unique)
      users: "id, username, email",
      // AppData store - keyPath: userId (for backward compatibility)
      appData: "userId",
      // Values store - auto-increment id, indexes: userId, valueId, active, createdAt, compound [userId+active]
      values: "++id, userId, valueId, active, createdAt, [userId+active]",
      // Goals store - keyPath: id, indexes: userId, valueId, completed, createdAt
      goals: "id, userId, valueId, completed, createdAt",
      // FeelingLogs store - keyPath: id, indexes: timestamp, emotionalState, userId
      feelingLogs: "id, timestamp, emotionalState, userId",
      // UserInteractions store - keyPath: id, indexes: timestamp, sessionId, type
      userInteractions: "id, timestamp, sessionId, type",
      // Sessions store - keyPath: id, indexes: startTimestamp, valueId, userId
      sessions: "id, startTimestamp, valueId, userId",
      // Assessments store - keyPath: id, indexes: userId, timestamp
      assessments: "id, userId, timestamp",
      // Reports store - keyPath: id, indexes: userId, timestamp
      reports: "id, userId, timestamp",
      // ResetTokens store - keyPath: token, indexes: userId, expires
      resetTokens: "token, userId, expires",
      // Metadata store - keyPath: id, indexes: appId, platform
      metadata: "id, appId, platform",
      // RuleBasedUsageLogs store - keyPath: id, indexes: timestamp, type
      ruleBasedUsageLogs: "id, timestamp, type"
    });
    this.version(4).stores({
      // UserInteractions store - add userId index
      userInteractions: "id, timestamp, sessionId, type, userId",
      // RuleBasedUsageLogs store - add userId index
      ruleBasedUsageLogs: "id, timestamp, type, userId"
    }).upgrade(async (tx) => {
      const sessions = await tx.table("sessions").toCollection().toArray();
      const sessionUserIdMap = new Map(sessions.map((s) => [s.id, s.userId]));
      const interactions = await tx.table("userInteractions").toCollection().toArray();
      for (const interaction of interactions) {
        if (!interaction.userId && interaction.sessionId) {
          const userId = sessionUserIdMap.get(interaction.sessionId);
          if (userId) {
            await tx.table("userInteractions").update(interaction.id, { userId });
          }
        }
      }
      logger.info("[Dexie] Version 4 migration: Added userId indexes to userInteractions and ruleBasedUsageLogs");
    });
    this.setupEncryptionHooks();
  }
  /**
   * Setup encryption hooks for PHI data stores
   * Note: Encryption is now handled at the adapter level (LegacyAdapter)
   * Hooks are kept for future use but currently just mark fields
   */
  setupEncryptionHooks() {
  }
  /**
   * Check if encryption should be applied
   */
  shouldEncrypt() {
    return localStorage.getItem("encryption_enabled") === "true";
  }
  /**
   * Check if decryption should be applied
   */
  shouldDecrypt() {
    return localStorage.getItem("encryption_enabled") === "true";
  }
  /**
   * Get encryption password from session storage
   */
  async getEncryptionPassword() {
    const password = sessionStorage.getItem("encryption_password");
    if (!password) {
      throw new Error("Encryption password not available - user must be logged in");
    }
    return password;
  }
  /**
   * Encrypt a field value
   */
  async encryptField(value, fieldName) {
    if (typeof value !== "string") {
      value = JSON.stringify(value);
    }
    const password = await this.getEncryptionPassword();
    return await encryptData(value, password);
  }
  /**
   * Decrypt a field value
   */
  async decryptField(encryptedValue, fieldName) {
    const password = await this.getEncryptionPassword();
    const decrypted = await decryptData(encryptedValue, password);
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  }
  /**
   * Encrypt an object's PHI fields
   */
  async encryptObject(obj) {
    if (!this.shouldEncrypt()) {
      return obj;
    }
    const encrypted = { ...obj };
    const fieldsToEncrypt = [
      "passwordHash",
      "email",
      "therapistEmails",
      // User data
      "aiResponse",
      "jsonIn",
      "jsonOut",
      // Feeling logs
      "reflectionText",
      "aiAnalysis",
      // Sessions
      "content",
      "assessment",
      "report"
      // Assessments/Reports
    ];
    for (const field of fieldsToEncrypt) {
      if (encrypted[field] && typeof encrypted[field] === "string" && !encrypted[`${field}_encrypted`]) {
        try {
          encrypted[field] = await this.encryptField(encrypted[field], field);
          encrypted[`${field}_encrypted`] = true;
        } catch (error) {
          logger.error(`[Dexie] Failed to encrypt field ${field}:`, error);
        }
      }
    }
    return encrypted;
  }
  /**
   * Decrypt an object's PHI fields
   */
  async decryptObject(obj) {
    if (!this.shouldDecrypt()) {
      return obj;
    }
    const decrypted = { ...obj };
    const fieldsToDecrypt = [
      "passwordHash",
      "email",
      "therapistEmails",
      "aiResponse",
      "jsonIn",
      "jsonOut",
      "reflectionText",
      "aiAnalysis",
      "content",
      "assessment",
      "report"
    ];
    for (const field of fieldsToDecrypt) {
      if (decrypted[`${field}_encrypted`] && decrypted[field] && typeof decrypted[field] === "string") {
        try {
          decrypted[field] = await this.decryptField(decrypted[field], field);
          delete decrypted[`${field}_encrypted`];
        } catch (error) {
          logger.error(`[Dexie] Failed to decrypt field ${field}:`, error);
          decrypted[field] = null;
        }
      }
    }
    return decrypted;
  }
  /**
   * Reset database - deletes and recreates with clean schema
   * Use this to resolve version conflicts or start fresh
   */
  async resetDatabase() {
    logger.info("[Dexie] Resetting database...");
    try {
      this.close();
    } catch (e) {
    }
    await new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
      deleteRequest.onsuccess = () => {
        logger.info(`[Dexie] Database ${DB_NAME} deleted successfully`);
        resolve();
      };
      deleteRequest.onerror = () => {
        logger.error("[Dexie] Failed to delete database:", deleteRequest.error);
        reject(deleteRequest.error);
      };
      deleteRequest.onblocked = () => {
        logger.warn("[Dexie] Database deletion blocked - another tab may have it open");
        setTimeout(() => resolve(), 1e3);
      };
    });
    localStorage.removeItem("dexie_migration_v7_to_v8");
    sessionStorage.removeItem("dexie_export_before_recovery");
    await this.open();
    logger.info(`[Dexie] Database reset complete - opened with version ${CURRENT_DB_VERSION}`);
  }
  /**
   * Initialize database and clean up old databases
   * Should be called after construction to perform async cleanup
   * Includes automatic version error recovery with data preservation option
   */
  async initialize() {
    await this.cleanupOldDatabase();
    const { version: existingVersion, needsReset: versionNeedsReset } = await this.checkExistingVersion();
    if (versionNeedsReset) {
      logger.warn("[Dexie] Database version bug detected - resetting database to fix version...");
      try {
        const exportData = await exportFromRawIndexedDB();
        if (exportData && Object.keys(exportData).length > 0) {
          sessionStorage.setItem("dexie_export_before_recovery", JSON.stringify(exportData));
          logger.info("[Dexie] Data exported before reset - stored in sessionStorage");
        }
      } catch (exportError) {
        logger.warn("[Dexie] Could not export data before reset:", exportError);
      }
      await this.resetDatabase();
    } else if (existingVersion !== null && existingVersion !== 0) {
      const existingVersionNum = typeof existingVersion === "number" ? existingVersion : parseInt(String(existingVersion), 10);
      const currentVersionNum = CURRENT_DB_VERSION;
      if (existingVersionNum > currentVersionNum && existingVersionNum < 100) {
        logger.warn(
          `[Dexie] Existing database version (${existingVersionNum}) is higher than requested (${currentVersionNum}). Resetting database...`
        );
        try {
          const exportData = await exportFromRawIndexedDB();
          if (exportData && Object.keys(exportData).length > 0) {
            sessionStorage.setItem("dexie_export_before_recovery", JSON.stringify(exportData));
            logger.info("[Dexie] Data exported before reset - stored in sessionStorage");
          }
        } catch (exportError) {
          logger.warn("[Dexie] Could not export data before reset:", exportError);
        }
        await this.resetDatabase();
      } else if (existingVersionNum >= 100 || existingVersionNum > 10 && existingVersionNum % 10 === 0) {
        logger.warn(
          `[Dexie] Detected invalid database version (${existingVersionNum}) - likely a bug. Resetting to version ${currentVersionNum}...`
        );
        await this.resetDatabase();
      } else if (existingVersionNum === currentVersionNum) {
        logger.info(`[Dexie] Database version matches current version (${currentVersionNum})`);
      } else if (existingVersionNum < currentVersionNum) {
        logger.info(`[Dexie] Database version (${existingVersionNum}) is lower than current (${currentVersionNum}) - will upgrade automatically`);
      }
    }
    try {
      await this.openDatabaseWithRecovery();
    } catch (error) {
      if (error?.name === "VersionError" || error?.message?.includes("version")) {
        logger.warn("[Dexie] Version error persists after recovery attempt - performing hard reset");
        await this.resetDatabase();
        await this.open();
      } else {
        throw error;
      }
    }
  }
  /**
   * Check the existing database version using raw IndexedDB API
   * Returns null if database doesn't exist, or the version number if it does
   * CRITICAL: Ensures version is parsed as a proper number (not string concatenation)
   */
  async checkExistingVersion() {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = () => {
        const db2 = request.result;
        let version = db2.version;
        if (typeof version === "string") {
          version = parseInt(version, 10);
        } else if (typeof version === "number") {
          version = Math.floor(version);
        } else {
          logger.warn("[Dexie] Invalid version type:", typeof version, version);
          db2.close();
          resolve({ version: null, needsReset: false });
          return;
        }
        if (version > 100 || version < 0) {
          logger.warn(`[Dexie] Suspicious database version detected: ${version}. This is likely a bug. Treating as version 0.`);
          db2.close();
          resolve({ version: 0, needsReset: true });
          return;
        }
        if (version > 10 && version % 10 === 0) {
          const versionStr = String(version);
          if (versionStr.length === 2 && versionStr[1] === "0") {
            const correctedVersion = parseInt(versionStr[0], 10);
            logger.warn(`[Dexie] Detected likely version concatenation bug: ${version} -> correcting to ${correctedVersion}`);
            db2.close();
            resolve({ version: correctedVersion, needsReset: true });
            return;
          }
        }
        db2.close();
        resolve({ version, needsReset: false });
      };
      request.onerror = () => {
        resolve({ version: null, needsReset: false });
      };
      request.onupgradeneeded = (event) => {
        const db2 = event.target.result;
        db2.close();
        resolve({ version: 0, needsReset: false });
      };
      request.onblocked = () => {
        resolve({ version: null, needsReset: false });
      };
    });
  }
  /**
   * Open database with automatic recovery from VersionError
   * Automatically handles version mismatches by resetting the database
   */
  async openDatabaseWithRecovery() {
    try {
      await this.open();
      logger.info(`[Dexie] Database opened successfully (version ${CURRENT_DB_VERSION})`);
    } catch (error) {
      if (error?.name === "VersionError" || error?.message?.includes("version")) {
        logger.warn(
          `[Dexie] Version mismatch detected: expected version ${CURRENT_DB_VERSION}, but existing version is different. Resetting database...`
        );
        logger.warn(`[Dexie] Error details: ${error.message}`);
        let dataExported = false;
        try {
          const exportData = await this.exportDatabaseInternal();
          if (exportData && Object.keys(exportData).length > 0) {
            sessionStorage.setItem("dexie_export_before_recovery", JSON.stringify(exportData));
            dataExported = true;
            logger.info("[Dexie] Data exported before reset - stored in sessionStorage");
          }
        } catch (exportError) {
          logger.warn("[Dexie] Could not export data before reset (non-critical):", exportError);
        }
        await this.resetDatabase();
        if (dataExported) {
          logger.info("[Dexie] Data export available in sessionStorage - you can import it manually if needed");
        }
        return;
      } else {
        logger.error("[Dexie] Failed to open database:", error);
        throw error;
      }
    }
  }
  /**
   * Clean up old database if it exists
   * Removes the old database name 'com.acminds.grounded.therapy.db' if present
   */
  async cleanupOldDatabase() {
    try {
      if (typeof indexedDB === "undefined") {
        return;
      }
      const oldDbName = "com.acminds.grounded.therapy.db";
      if ("databases" in indexedDB) {
        const databases = await indexedDB.databases();
        const oldDb = databases.find((db2) => db2.name === oldDbName);
        if (oldDb) {
          try {
            await new Promise((resolve, reject) => {
              const deleteRequest = indexedDB.deleteDatabase(oldDbName);
              deleteRequest.onsuccess = () => {
                logger.info("[Dexie] Old database cleaned up successfully");
                resolve();
              };
              deleteRequest.onerror = () => {
                logger.warn("[Dexie] Failed to delete old database:", deleteRequest.error);
                resolve();
              };
              deleteRequest.onblocked = () => {
                logger.warn("[Dexie] Old database deletion blocked - another tab may have it open");
                setTimeout(() => resolve(), 1e3);
              };
            });
          } catch (error) {
            logger.warn("[Dexie] Error during old database cleanup:", error);
          }
        }
      }
    } catch (error) {
      logger.warn("[Dexie] Error checking for old database:", error);
    }
  }
}
const db = new GroundedDB();
async function exportFromRawIndexedDB() {
  try {
    const exportData = {};
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = async () => {
        const rawDb = request.result;
        const storeNames = Array.from(rawDb.objectStoreNames);
        for (const storeName of storeNames) {
          try {
            const transaction = rawDb.transaction([storeName], "readonly");
            const store = transaction.objectStore(storeName);
            const getAllRequest = store.getAll();
            await new Promise((resolveStore) => {
              getAllRequest.onsuccess = () => {
                exportData[storeName] = getAllRequest.result;
                resolveStore();
              };
              getAllRequest.onerror = () => {
                logger.warn(`[Dexie] Could not read store ${storeName}`);
                exportData[storeName] = [];
                resolveStore();
              };
            });
          } catch (err) {
            logger.warn(`[Dexie] Error exporting ${storeName}:`, err);
            exportData[storeName] = [];
          }
        }
        rawDb.close();
        resolve(exportData);
      };
      request.onerror = () => {
        logger.warn("[Dexie] Could not open database for export");
        resolve(null);
      };
      request.onblocked = () => {
        logger.warn("[Dexie] Database open blocked");
        resolve(null);
      };
    });
  } catch (err) {
    logger.warn("[Dexie] Raw IndexedDB export failed:", err);
    return null;
  }
}
if (typeof window !== "undefined") {
  logger.info("[Privacy] Cloud sync disabled - all data remains on-device");
}
async function createUser(userData) {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      ...userData,
      id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await db.users.add(user);
    return id;
  } catch (error) {
    logger.error("[Dexie] Error creating user:", error);
    throw error;
  }
}
async function getUserByUsername(username) {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const user = await db.users.where("username").equals(username).first();
    return user || null;
  } catch (error) {
    logger.error("[Dexie] Error getting user by username:", error);
    return null;
  }
}
async function getUserByEmail(email) {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const user = await db.users.where("email").equals(email).first();
    return user || null;
  } catch (error) {
    logger.error("[Dexie] Error getting user by email:", error);
    return null;
  }
}
async function getUserById(userId) {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const user = await db.users.get(userId);
    return user || null;
  } catch (error) {
    logger.error("[Dexie] Error getting user by id:", error);
    return null;
  }
}
async function getAllUsers() {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    return await db.users.toArray();
  } catch (error) {
    logger.error("[Dexie] Error getting all users:", error);
    return [];
  }
}
async function updateUser(userId, updates) {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const user = await db.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    await db.users.update(userId, updates);
  } catch (error) {
    logger.error("[Dexie] Error updating user:", error);
    throw error;
  }
}
async function createResetToken(userId, email) {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expires = Date.now() + 24 * 60 * 60 * 1e3;
    await db.resetTokens.add({
      token,
      userId,
      email,
      expires: expires.toString(),
      // Store as string for consistency
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    return token;
  } catch (error) {
    logger.error("[Dexie] Error creating reset token:", error);
    throw error;
  }
}
async function getResetToken(token) {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const tokenRecord = await db.resetTokens.get(token);
    if (!tokenRecord) {
      return null;
    }
    let expires;
    if (typeof tokenRecord.expires === "string") {
      expires = parseInt(tokenRecord.expires, 10);
    } else {
      expires = tokenRecord.expires;
    }
    if (isNaN(expires) || expires < Date.now()) {
      return null;
    }
    return { userId: tokenRecord.userId, email: tokenRecord.email };
  } catch (error) {
    logger.error("[Dexie] Error getting reset token:", error);
    return null;
  }
}
async function deleteResetToken(token) {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    await db.resetTokens.delete(token);
  } catch (error) {
    logger.error("[Dexie] Error deleting reset token:", error);
    throw error;
  }
}
async function cleanupExpiredTokens() {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const now = Date.now();
    const tokens = await db.resetTokens.toArray();
    const expiredTokens = tokens.filter((t) => {
      let expires;
      if (typeof t.expires === "string") {
        expires = parseInt(t.expires, 10);
      } else {
        expires = t.expires;
      }
      return !isNaN(expires) && expires < now;
    });
    await Promise.all(expiredTokens.map((t) => db.resetTokens.delete(t.token)));
  } catch (error) {
    logger.error("[Dexie] Error cleaning up expired tokens:", error);
  }
}
async function getFeelingPatterns(startDate, endDate) {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const logs = await db.feelingLogs.where("timestamp").between(startDate, endDate, true, true).toArray();
    const patterns = {};
    logs.forEach((log) => {
      const state = log.emotionalState || log.emotion || "unknown";
      patterns[state] = (patterns[state] || 0) + 1;
    });
    return Object.entries(patterns).map(([state, count]) => ({ state, count }));
  } catch (error) {
    logger.error("[Dexie] Error getting feeling patterns:", error);
    return [];
  }
}
async function getProgressMetrics(startDate, endDate) {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const sessions = await db.sessions.where("startTimestamp").between(startDate, endDate, true, true).toArray();
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.duration !== void 0 && s.duration !== null);
    const averageDuration = completedSessions.length > 0 ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length : 0;
    const valuesEngaged = [...new Set(sessions.map((s) => s.valueId).filter(Boolean))];
    return { totalSessions, averageDuration, valuesEngaged };
  } catch (error) {
    logger.error("[Dexie] Error getting progress metrics:", error);
    return { totalSessions: 0, averageDuration: 0, valuesEngaged: [] };
  }
}
async function getFeelingFrequency(limit) {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const logs = await db.feelingLogs.orderBy("timestamp").reverse().toArray();
    const frequency = {};
    const logsToProcess = limit ? logs.slice(0, limit) : logs;
    logsToProcess.forEach((log) => {
      const feeling = log.selectedFeeling;
      if (feeling) {
        frequency[feeling] = (frequency[feeling] || 0) + 1;
      }
    });
    return Object.entries(frequency).map(([feeling, count]) => ({ feeling, count })).sort((a, b) => b.count - a.count);
  } catch (error) {
    logger.error("[Dexie] Error getting feeling frequency:", error);
    return [];
  }
}
async function isMigrationComplete() {
  try {
    const migrationMarker = localStorage.getItem("auth_migration_complete");
    return migrationMarker === "true";
  } catch {
    return false;
  }
}
async function markMigrationComplete() {
  try {
    localStorage.setItem("auth_migration_complete", "true");
    console.log("[Migration] Migration marked as complete");
  } catch (error) {
    console.error("[Migration] Failed to mark migration complete:", error);
  }
}
async function readUsersFromAuthDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      resolve([]);
      return;
    }
    const request = indexedDB.open("groundedAuthDB", 1);
    request.onsuccess = () => {
      const authDb = request.result;
      if (!authDb.objectStoreNames.contains("users")) {
        console.log("[Migration] groundedAuthDB has no users store - nothing to migrate");
        authDb.close();
        resolve([]);
        return;
      }
      const transaction = authDb.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const users = getAllRequest.result || [];
        console.log(`[Migration] Found ${users.length} user(s) in groundedAuthDB`);
        authDb.close();
        resolve(users);
      };
      getAllRequest.onerror = () => {
        console.error("[Migration] Error reading users from groundedAuthDB:", getAllRequest.error);
        authDb.close();
        reject(getAllRequest.error);
      };
    };
    request.onerror = () => {
      if (request.error?.name === "NotFoundError") {
        console.log("[Migration] groundedAuthDB does not exist - nothing to migrate");
        resolve([]);
      } else {
        console.error("[Migration] Error opening groundedAuthDB:", request.error);
        reject(request.error);
      }
    };
    request.onupgradeneeded = () => {
      request.transaction?.abort();
      resolve([]);
    };
  });
}
async function migrateUsersToDexie(users) {
  if (users.length === 0) {
    return 0;
  }
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  for (const user of users) {
    try {
      const existing = await db.users.get(user.id);
      if (existing) {
        console.log(`[Migration] User ${user.username} already exists in groundedDB - skipping`);
        skippedCount++;
        continue;
      }
      const userRecord = {
        id: user.id,
        username: user.username,
        passwordHash: user.passwordHash,
        email: user.email,
        therapistEmails: user.therapistEmails,
        termsAccepted: user.termsAccepted,
        termsAcceptedDate: user.termsAcceptedDate,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };
      await db.users.add(userRecord);
      migratedCount++;
      console.log(`[Migration] Migrated user: ${user.username} (${user.id})`);
    } catch (error) {
      if (error?.name === "ConstraintError" || error?.message?.includes("already exists")) {
        console.log(`[Migration] User ${user.username} already exists - skipping`);
        skippedCount++;
      } else {
        console.error(`[Migration] Error migrating user ${user.username}:`, error);
        errorCount++;
      }
    }
  }
  console.log(`[Migration] Migration complete: ${migratedCount} migrated, ${skippedCount} skipped, ${errorCount} errors`);
  return migratedCount;
}
async function migrateAuthToDexie() {
  try {
    if (await isMigrationComplete()) {
      console.log("[Migration] Migration already completed - skipping");
      return { success: true, migrated: 0, skipped: 0, errors: 0 };
    }
    console.log("[Migration] Starting migration from groundedAuthDB to groundedDB...");
    await db.open();
    const users = await readUsersFromAuthDB();
    if (users.length === 0) {
      console.log("[Migration] No users to migrate");
      await markMigrationComplete();
      return { success: true, migrated: 0, skipped: 0, errors: 0 };
    }
    const migrated = await migrateUsersToDexie(users);
    await markMigrationComplete();
    return {
      success: true,
      migrated,
      skipped: users.length - migrated,
      errors: 0
    };
  } catch (error) {
    console.error("[Migration] Migration failed:", error);
    return {
      success: false,
      migrated: 0,
      skipped: 0,
      errors: 1
    };
  }
}
class AuthStore {
  constructor() {
    this.initPromise = null;
    this.migrationRun = false;
  }
  /**
   * Initialize the authentication store
   * Runs migration from groundedAuthDB on first init
   */
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = (async () => {
      await db.open();
      if (!this.migrationRun) {
        this.migrationRun = true;
        try {
          const result = await migrateAuthToDexie();
          if (result.success && result.migrated > 0) {
            console.log(`[AuthStore] Migrated ${result.migrated} user(s) from groundedAuthDB`);
          }
        } catch (error) {
          console.error("[AuthStore] Migration error (non-fatal):", error);
        }
      }
      try {
        const userCount = await db.users.count();
        console.log(`[AuthStore] Database initialized. User count: ${userCount}`);
        if (userCount === 0 && typeof localStorage !== "undefined") {
          await this.recoverFromLocalStorage();
        }
      } catch (error) {
        console.error("[AuthStore] Error during verification:", error);
      }
    })();
    return this.initPromise;
  }
  /**
   * Recover users from localStorage backups
   */
  async recoverFromLocalStorage() {
    try {
      const recoveredUsers = [];
      const latestUserBackup = localStorage.getItem("auth_latest_user");
      if (latestUserBackup) {
        try {
          const latestUser = JSON.parse(latestUserBackup);
          if (latestUser?.id && latestUser?.username) {
            recoveredUsers.push(latestUser);
            console.log("[AuthStore] Found latest user backup:", { userId: latestUser.id, username: latestUser.username });
          }
        } catch (e) {
          console.warn("[AuthStore] Failed to parse latest user backup:", e);
        }
      }
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("auth_user_backup_")) {
          keys.push(key);
        }
      }
      for (const key of keys) {
        try {
          const backup = localStorage.getItem(key);
          if (backup) {
            const user = JSON.parse(backup);
            if (user?.id && user?.username && !recoveredUsers.find((u) => u.id === user.id)) {
              recoveredUsers.push(user);
            }
          }
        } catch (e) {
          console.warn("[AuthStore] Failed to parse backup:", key, e);
        }
      }
      if (recoveredUsers.length > 0) {
        console.log(`[AuthStore] Attempting to restore ${recoveredUsers.length} user(s) from backups...`);
        for (const user of recoveredUsers) {
          try {
            const existing = await db.users.get(user.id);
            if (!existing) {
              await db.users.add(user);
              console.log("[AuthStore] Restored user:", user.username);
            }
          } catch (error) {
            if (error?.name !== "ConstraintError") {
              console.error("[AuthStore] Failed to restore user:", user.username, error);
            }
          }
        }
      }
    } catch (error) {
      console.error("[AuthStore] Error during localStorage recovery:", error);
    }
  }
  /**
   * Create a new user
   */
  async createUser(userData) {
    await this.init();
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      ...userData,
      id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      await db.users.add(user);
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem(`auth_user_backup_${id}`, JSON.stringify(user));
          localStorage.setItem("auth_latest_user", JSON.stringify(user));
        } catch (e) {
          console.warn("[AuthStore] Failed to backup user:", e);
        }
      }
      const saved = await db.users.get(id);
      if (!saved) {
        throw new Error("User was not saved correctly");
      }
      console.log("[AuthStore] User created:", { userId: id, username: userData.username });
      return id;
    } catch (error) {
      if (error?.name === "ConstraintError") {
        throw new Error("Username or email already exists");
      }
      throw error;
    }
  }
  /**
   * Get user by username
   */
  async getUserByUsername(username) {
    await this.init();
    return await db.users.where("username").equals(username).first() || null;
  }
  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    await this.init();
    return await db.users.where("email").equals(email).first() || null;
  }
  /**
   * Get all users
   */
  async getAllUsers() {
    await this.init();
    const users = await db.users.toArray();
    if (users.length === 0) {
      await this.recoverFromLocalStorage();
      return await db.users.toArray();
    }
    return users;
  }
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    await this.init();
    return await db.users.get(userId) || null;
  }
  /**
   * Update user
   */
  async updateUser(userId, updates) {
    await this.init();
    const user = await db.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updated = { ...user, ...updates };
    await db.users.put(updated);
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(`auth_user_backup_${userId}`, JSON.stringify(updated));
        const latest = localStorage.getItem("auth_latest_user");
        if (latest) {
          const latestUser = JSON.parse(latest);
          if (latestUser.id === userId) {
            localStorage.setItem("auth_latest_user", JSON.stringify(updated));
          }
        }
      } catch (e) {
        console.warn("[AuthStore] Failed to update backup:", e);
      }
    }
  }
  /**
   * Create reset token (uses groundedDB.resetTokens)
   */
  async createResetToken(userId, email) {
    await this.init();
    const token = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    const expires = Date.now() + 24 * 60 * 60 * 1e3;
    const tokenData = {
      token,
      userId,
      email,
      expires: new Date(expires).toISOString(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await db.resetTokens.add(tokenData);
    return token;
  }
  /**
   * Get reset token
   */
  async getResetToken(token) {
    await this.init();
    const result = await db.resetTokens.get(token);
    if (!result) {
      return null;
    }
    const expires = new Date(result.expires).getTime();
    if (expires < Date.now()) {
      return null;
    }
    return {
      userId: result.userId,
      email: result.email
    };
  }
  /**
   * Delete reset token
   */
  async deleteResetToken(token) {
    await this.init();
    await db.resetTokens.delete(token);
  }
  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens() {
    await this.init();
    const now = Date.now();
    const expired = await db.resetTokens.where("expires").below(new Date(now).toISOString()).toArray();
    for (const token of expired) {
      await db.resetTokens.delete(token.token);
    }
  }
}
const authStore = new AuthStore();
const authStore$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  authStore
}, Symbol.toStringTag, { value: "Module" }));
const _EncryptedPWA = class _EncryptedPWA {
  constructor(userId) {
    this.db = null;
    this.encryptionKey = null;
    this.initialized = false;
    this.userId = userId;
  }
  /**
   * Initialize sql.js module (call once)
   * Works in both browser and Node.js environments
   */
  static async initSQL() {
    if (!_EncryptedPWA.SQL) {
      const isNode = typeof process !== "undefined" && process.versions && process.versions.node;
      if (isNode) {
        try {
          const path = await __vitePreload(() => import("./transformers-CdMs_eeA.js").then((n) => n.O), true ? __vite__mapDeps([0,1,2,3]) : void 0);
          const pathModule = path.default || path;
          const wasmPath = pathModule.join(
            process.cwd(),
            "node_modules",
            "sql.js",
            "dist",
            "sql-wasm.wasm"
          );
          _EncryptedPWA.SQL = await initSqlJs({
            locateFile: () => wasmPath
          });
        } catch (error) {
          const wasmPath = require.resolve("sql.js/dist/sql-wasm.wasm");
          _EncryptedPWA.SQL = await initSqlJs({
            locateFile: () => wasmPath
          });
        }
      } else {
        _EncryptedPWA.SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`
        });
      }
    }
  }
  /**
   * Initialize encrypted database with password
   */
  static async init(password, userId) {
    await _EncryptedPWA.initSQL();
    const instance = new _EncryptedPWA(userId);
    await instance.deriveKey(password);
    await instance.loadOrCreateDB();
    if (!instance.initialized) {
      instance.initialized = true;
    }
    _EncryptedPWA.instance = instance;
    return instance;
  }
  /**
   * Get current instance (if initialized)
   */
  static getInstance() {
    return _EncryptedPWA.instance;
  }
  /**
   * Derive encryption key from password using PBKDF2
   */
  async deriveKey(password) {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordData,
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );
    const salt = await this.getOrCreateSalt();
    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 1e5,
        hash: "SHA-256"
      },
      keyMaterial,
      {
        name: "AES-GCM",
        length: 256
      },
      false,
      ["encrypt", "decrypt"]
    );
  }
  /**
   * Get or create salt for key derivation
   */
  async getOrCreateSalt() {
    const saltKey = "grounded_encryption_salt";
    let salt = localStorage.getItem(saltKey);
    if (!salt) {
      const saltArray = new Uint8Array(16);
      crypto.getRandomValues(saltArray);
      salt = Array.from(saltArray).map((b) => b.toString(16).padStart(2, "0")).join("");
      localStorage.setItem(saltKey, salt);
    }
    const saltBytes = new Uint8Array(salt.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
    return saltBytes;
  }
  /**
   * Load or create encrypted database
   */
  async loadOrCreateDB() {
    try {
      const encryptedData = await this.loadEncryptedDBInternal();
      if (encryptedData) {
        const decryptedData = await this.decrypt(encryptedData);
        await this.initSQLite(decryptedData);
        this.initialized = true;
      } else {
        await this.initSQLite(null);
        await this.createSchema();
        this.initialized = true;
      }
    } catch (error) {
      console.error("Error loading database:", error);
      throw new Error("Failed to load encrypted database. Wrong password?");
    }
  }
  /**
   * Initialize SQLite database
   */
  async initSQLite(data) {
    if (!_EncryptedPWA.SQL) {
      await _EncryptedPWA.initSQL();
    }
    try {
      if (data && data.length > 0) {
        this.db = new _EncryptedPWA.SQL.Database(data);
      } else {
        this.db = new _EncryptedPWA.SQL.Database();
      }
    } catch (error) {
      console.error("Error initializing SQLite database:", error);
      throw new Error("Failed to initialize database. Wrong password or corrupted data?");
    }
  }
  /**
   * Create database schema
   */
  async createSchema() {
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
      
      CREATE TABLE IF NOT EXISTS values_encrypted (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        value_id TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        priority INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS assessments_encrypted (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        emotion TEXT NOT NULL,
        sub_emotion TEXT NOT NULL,
        reflection TEXT NOT NULL,
        assessment TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS reports_encrypted (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        email_addresses TEXT,
        treatment_protocols TEXT,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS metadata_encrypted (
        id TEXT PRIMARY KEY,
        app_name TEXT NOT NULL,
        app_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        version TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_validated TEXT NOT NULL,
        local_storage_migrated INTEGER DEFAULT 0,
        migration_date TEXT
      );
      
      CREATE TABLE IF NOT EXISTS rule_based_usage_logs_encrypted (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        operation_type TEXT NOT NULL,
        emotional_state TEXT,
        sub_emotion TEXT,
        value_id TEXT,
        value_category TEXT,
        frequency TEXT,
        fallback_key TEXT NOT NULL,
        fallback_response TEXT NOT NULL,
        context TEXT,
        ai_unavailable_reason TEXT,
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
      CREATE INDEX IF NOT EXISTS idx_values_user_active ON values_encrypted(user_id, active);
      CREATE INDEX IF NOT EXISTS idx_values_user ON values_encrypted(user_id);
      CREATE INDEX IF NOT EXISTS idx_values_value ON values_encrypted(value_id);
      CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments_encrypted(user_id);
      CREATE INDEX IF NOT EXISTS idx_assessments_timestamp ON assessments_encrypted(timestamp);
      CREATE INDEX IF NOT EXISTS idx_reports_user ON reports_encrypted(user_id);
      CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON reports_encrypted(timestamp);
      CREATE INDEX IF NOT EXISTS idx_metadata_app_id ON metadata_encrypted(app_id);
      CREATE INDEX IF NOT EXISTS idx_metadata_platform ON metadata_encrypted(platform);
      CREATE INDEX IF NOT EXISTS idx_rule_based_logs_timestamp ON rule_based_usage_logs_encrypted(timestamp);
      CREATE INDEX IF NOT EXISTS idx_rule_based_logs_type ON rule_based_usage_logs_encrypted(operation_type);
      CREATE INDEX IF NOT EXISTS idx_rule_based_logs_user ON rule_based_usage_logs_encrypted(user_id);
    `;
    await this.executeSQL(schema);
    try {
      await this.auditLog("schema_created", "system", null, "Database schema initialized");
    } catch (error) {
      console.warn("Could not log schema creation:", error);
    }
  }
  /**
   * Execute SQL statement (for schema creation)
   */
  async executeSQL(sql) {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    try {
      const statements = sql.split(";").filter((s) => s.trim().length > 0);
      for (const statement of statements) {
        this.db.run(statement.trim() + ";");
      }
    } catch (error) {
      console.error("SQL execution error:", error);
      throw error;
    }
  }
  /**
   * Query database (SELECT statements)
   */
  async query(sql, params) {
    if (!this.initialized || !this.encryptionKey || !this.db) {
      throw new Error("Database not initialized");
    }
    try {
      const stmt = this.db.prepare(sql);
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      const results = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row);
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error("Query error:", error, "SQL:", sql);
      throw error;
    }
  }
  /**
   * Execute SQL statement (INSERT, UPDATE, DELETE)
   */
  async execute(sql, params) {
    if (!this.initialized || !this.encryptionKey || !this.db) {
      throw new Error("Database not initialized");
    }
    try {
      const stmt = this.db.prepare(sql);
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      stmt.step();
      stmt.free();
    } catch (error) {
      console.error("Execute error:", error, "SQL:", sql);
      throw error;
    }
  }
  /**
   * Save encrypted database to storage
   */
  async save() {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    try {
      const dbData = await this.exportDB();
      const encryptedData = await this.encrypt(dbData);
      await this.saveEncryptedDB(encryptedData);
      await this.auditLog("database_saved", "system", null, "Encrypted database saved");
    } catch (error) {
      console.error("Error saving database:", error);
      throw error;
    }
  }
  /**
   * Export database to binary format
   */
  async exportDB() {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    try {
      const data = this.db.export();
      return new Uint8Array(data);
    } catch (error) {
      console.error("Error exporting database:", error);
      throw error;
    }
  }
  /**
   * Encrypt data using AES-GCM (public utility)
   * Can be used for encrypting individual fields or data before storage
   */
  async encryptData(data) {
    return this.encrypt(data);
  }
  /**
   * Decrypt data using AES-GCM (public utility)
   * Can be used for decrypting individual fields or data after retrieval
   */
  async decryptData(encryptedData) {
    return this.decrypt(encryptedData);
  }
  /**
   * Encrypt data using AES-GCM (internal)
   */
  async encrypt(data) {
    if (!this.encryptionKey) {
      throw new Error("Encryption key not available");
    }
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      this.encryptionKey,
      data
    );
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);
    return result.buffer;
  }
  /**
   * Decrypt data using AES-GCM
   */
  async decrypt(encryptedData) {
    if (!this.encryptionKey) {
      throw new Error("Encryption key not available");
    }
    const data = new Uint8Array(encryptedData);
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    try {
      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv
        },
        this.encryptionKey,
        encrypted
      );
      return new Uint8Array(decrypted);
    } catch (error) {
      throw new Error("Failed to decrypt database. Wrong password?");
    }
  }
  /**
   * Load encrypted database from storage (public for testing)
   */
  async loadEncryptedDB() {
    return this.loadEncryptedDBInternal();
  }
  /**
   * Internal method to load encrypted database
   */
  async loadEncryptedDBInternal() {
    try {
      if ("FileSystemHandle" in window) {
        try {
          const opfsRoot = await navigator.storage.getDirectory();
          const dbFile = await opfsRoot.getFileHandle("grounded_encrypted.db", { create: false });
          const file = await dbFile.getFile();
          return await file.arrayBuffer();
        } catch (error) {
        }
      }
      const dbName = "grounded_encrypted_storage";
      const storeName = "encrypted_db";
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db2 = request.result;
          if (!db2.objectStoreNames.contains(storeName)) {
            resolve(null);
            return;
          }
          const transaction = db2.transaction([storeName], "readonly");
          const store = transaction.objectStore(storeName);
          const getRequest = store.get("database");
          getRequest.onsuccess = () => {
            const result = getRequest.result;
            resolve(result ? result.data : null);
          };
          getRequest.onerror = () => reject(getRequest.error);
        };
        request.onupgradeneeded = (event) => {
          const db2 = event.target.result;
          if (!db2.objectStoreNames.contains(storeName)) {
            db2.createObjectStore(storeName);
          }
        };
      });
    } catch (error) {
      console.error("Error loading encrypted database:", error);
      return null;
    }
  }
  /**
   * Save encrypted database to storage
   */
  async saveEncryptedDB(data) {
    try {
      if ("FileSystemHandle" in window) {
        try {
          const opfsRoot = await navigator.storage.getDirectory();
          const dbFile = await opfsRoot.getFileHandle("grounded_encrypted.db", { create: true });
          const writable = await dbFile.createWritable();
          await writable.write(data);
          await writable.close();
          return;
        } catch (error) {
        }
      }
      const dbName = "grounded_encrypted_storage";
      const storeName = "encrypted_db";
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db2 = request.result;
          const transaction = db2.transaction([storeName], "readwrite");
          const store = transaction.objectStore(storeName);
          const putRequest = store.put({ id: "database", data });
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        };
        request.onupgradeneeded = (event) => {
          const db2 = event.target.result;
          if (!db2.objectStoreNames.contains(storeName)) {
            db2.createObjectStore(storeName);
          }
        };
      });
    } catch (error) {
      console.error("Error saving encrypted database:", error);
      throw error;
    }
  }
  /**
   * Audit log entry
   */
  async auditLog(action, tableName, recordId, details) {
    const logEntry = {
      id: crypto.randomUUID(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      userId: this.userId,
      action,
      table: tableName,
      recordId: recordId || void 0,
      details
    };
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
   * Verify database integrity using SQLite PRAGMA and SHA-256 hashing
   */
  async verifyIntegrity() {
    try {
      const result = await this.query("PRAGMA integrity_check");
      const integrityResult = result[0]?.integrity_check;
      if (integrityResult !== "ok") {
        console.error("[Integrity] SQLite integrity check failed:", integrityResult);
        return false;
      }
      const dbData = await this.exportDB();
      const currentHash = await this.computeSHA256Hash(dbData);
      const storedHash = await this.getStoredIntegrityHash();
      if (storedHash && currentHash !== storedHash) {
        console.error("[Integrity] SHA-256 hash mismatch - data may be corrupted");
        return false;
      }
      if (!storedHash) {
        await this.storeIntegrityHash(currentHash);
      }
      return true;
    } catch (error) {
      console.error("Error verifying integrity:", error);
      return false;
    }
  }
  /**
   * Compute SHA-256 hash of database data
   */
  async computeSHA256Hash(data) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  /**
   * Get stored integrity hash from metadata
   * Uses a separate integrity_hashes table to avoid schema conflicts
   */
  async getStoredIntegrityHash() {
    try {
      const result = await this.query(
        "SELECT hash FROM integrity_hashes WHERE id = ?",
        ["db_integrity"]
      );
      return result[0]?.hash || null;
    } catch (error) {
      return null;
    }
  }
  /**
   * Store integrity hash in dedicated integrity_hashes table
   */
  async storeIntegrityHash(hash) {
    try {
      await this.execute(`
        CREATE TABLE IF NOT EXISTS integrity_hashes (
          id TEXT PRIMARY KEY,
          hash TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
      await this.execute(
        `INSERT OR REPLACE INTO integrity_hashes (id, hash, updated_at) 
         VALUES (?, ?, ?)`,
        ["db_integrity", hash, (/* @__PURE__ */ new Date()).toISOString()]
      );
    } catch (error) {
      console.error("[Integrity] Failed to store integrity hash:", error);
    }
  }
  /**
   * Rotate encryption key (periodic key rotation for security)
   * Re-encrypts entire database with a new key derived from the same password
   */
  async rotateEncryptionKey() {
    if (!this.db || !this.initialized || !this.encryptionKey) {
      throw new Error("Database not initialized");
    }
    try {
      console.log("[Key Rotation] Starting encryption key rotation...");
      const dbData = await this.exportDB();
      const newSaltArray = new Uint8Array(16);
      crypto.getRandomValues(newSaltArray);
      const saltKey = "grounded_encryption_salt";
      const newSaltHex = Array.from(newSaltArray).map((b) => b.toString(16).padStart(2, "0")).join("");
      const currentPassword = await this.getCurrentPasswordForRotation();
      if (!currentPassword) {
        throw new Error("Cannot rotate key without password verification");
      }
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(currentPassword);
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passwordData,
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );
      const newKey = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: newSaltArray,
          iterations: 1e5,
          hash: "SHA-256"
        },
        keyMaterial,
        {
          name: "AES-GCM",
          length: 256
        },
        false,
        ["encrypt", "decrypt"]
      );
      localStorage.setItem(saltKey, newSaltHex);
      this.encryptionKey = newKey;
      const newEncryptedData = await this.encrypt(dbData);
      await this.saveEncryptedDB(newEncryptedData);
      const newHash = await this.computeSHA256Hash(dbData);
      await this.storeIntegrityHash(newHash);
      await this.auditLog("key_rotated", "system", null, "Encryption key rotated successfully");
      console.log("[Key Rotation] Encryption key rotation completed successfully");
    } catch (error) {
      console.error("[Key Rotation] Error rotating encryption key:", error);
      throw error;
    }
  }
  /**
   * Get current password for key rotation
   * In production, this should prompt user or use secure session storage
   */
  async getCurrentPasswordForRotation() {
    const password = sessionStorage.getItem("encryption_password");
    if (password) {
      return password;
    }
    console.warn("[Key Rotation] Password not found in session - user must re-authenticate");
    return null;
  }
  /**
   * Generate report (PDF) - placeholder for reports integration
   */
  async generateReport(format = "SOAP") {
    await this.auditLog("report_generated", "reports", null, `Format: ${format}`);
    return new Uint8Array(0);
  }
  /**
   * Change password and re-encrypt database
   * This requires the old password to decrypt, then re-encrypts with new password
   */
  async changePassword(oldPassword, newPassword) {
    if (!this.db || !this.initialized) {
      throw new Error("Database not initialized");
    }
    try {
      const oldSalt = await this.getOrCreateSalt();
      const encoder = new TextEncoder();
      const oldPasswordData = encoder.encode(oldPassword);
      const oldKeyMaterial = await crypto.subtle.importKey(
        "raw",
        oldPasswordData,
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );
      const oldKey = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: oldSalt,
          iterations: 1e5,
          hash: "SHA-256"
        },
        oldKeyMaterial,
        {
          name: "AES-GCM",
          length: 256
        },
        false,
        ["encrypt", "decrypt"]
      );
      const encryptedData = await this.loadEncryptedDBInternal();
      if (encryptedData) {
        const data = new Uint8Array(encryptedData);
        const iv = data.slice(0, 12);
        const encrypted = data.slice(12);
        try {
          await crypto.subtle.decrypt(
            {
              name: "AES-GCM",
              iv
            },
            oldKey,
            encrypted
          );
        } catch (error) {
          throw new Error("Old password is incorrect");
        }
      }
      const dbData = await this.exportDB();
      const newSaltArray = new Uint8Array(16);
      crypto.getRandomValues(newSaltArray);
      const saltKey = "grounded_encryption_salt";
      const newSaltHex = Array.from(newSaltArray).map((b) => b.toString(16).padStart(2, "0")).join("");
      localStorage.setItem(saltKey, newSaltHex);
      const newPasswordData = encoder.encode(newPassword);
      const newKeyMaterial = await crypto.subtle.importKey(
        "raw",
        newPasswordData,
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );
      const newKey = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: newSaltArray,
          iterations: 1e5,
          hash: "SHA-256"
        },
        newKeyMaterial,
        {
          name: "AES-GCM",
          length: 256
        },
        false,
        ["encrypt", "decrypt"]
      );
      this.encryptionKey = newKey;
      const newEncryptedData = await this.encrypt(dbData);
      await this.saveEncryptedDB(newEncryptedData);
      await this.auditLog("password_changed", "system", null, "Database re-encrypted with new password");
      console.log("Password changed successfully - database re-encrypted");
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }
};
_EncryptedPWA.instance = null;
_EncryptedPWA.SQL = null;
let EncryptedPWA = _EncryptedPWA;
function isTauri() {
  {
    return false;
  }
}
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
async function registerUser(data) {
  try {
    try {
      await authStore.init();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Auth store initialization error:", error);
      if (errorMessage.includes("IndexedDB is not available")) {
        return { success: false, error: "Your browser does not support local storage. Please use a modern browser like Chrome, Firefox, or Safari." };
      }
      if (errorMessage.includes("quota") || errorMessage.includes("QuotaExceeded")) {
        return { success: false, error: "Storage quota exceeded. Please clear some browser data and try again." };
      }
      if (errorMessage.includes("blocked") || errorMessage.includes("Blocked")) {
        return { success: false, error: "Database access is blocked. Please check your browser settings and allow local storage for this site." };
      }
      return { success: false, error: "Unable to access local storage. Please refresh the page and try again." };
    }
    if (!data.username || data.username.length < 3) {
      return { success: false, error: "Username must be at least 3 characters" };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { success: false, error: "Please enter a valid email address" };
    }
    let existingUser;
    try {
      existingUser = await authStore.getUserByUsername(data.username);
    } catch (error) {
      logger.error("Error checking username:", error);
      return { success: false, error: "Database error. Please try again." };
    }
    if (existingUser) {
      return { success: false, error: "Username already exists" };
    }
    let existingEmail;
    try {
      existingEmail = await authStore.getUserByEmail(data.email);
    } catch (error) {
      logger.error("Error checking email:", error);
      return { success: false, error: "Database error. Please try again." };
    }
    if (existingEmail) {
      return { success: false, error: "Email already registered" };
    }
    let passwordHash;
    try {
      passwordHash = await hashPassword(data.password);
    } catch (error) {
      logger.error("Error hashing password:", error);
      return { success: false, error: "Password encryption failed. Please try again." };
    }
    let userId;
    try {
      userId = await authStore.createUser({
        username: data.username,
        passwordHash,
        email: data.email,
        termsAccepted: false
      });
      logger.info("[AuthService] User created successfully:", { userId, username: data.username });
      try {
        const verifyUser = await authStore.getUserById(userId);
        if (!verifyUser) {
          logger.error("[AuthService] CRITICAL: User was created but cannot be retrieved!", { userId });
          return { success: false, error: "Account created but verification failed. Please try logging in." };
        }
        if (verifyUser.username !== data.username) {
          logger.error("[AuthService] CRITICAL: Username mismatch after creation!", {
            expected: data.username,
            found: verifyUser.username
          });
        }
        logger.info("[AuthService] User verification successful:", { userId, username: verifyUser.username });
      } catch (verifyError) {
        logger.error("[AuthService] CRITICAL: Error verifying created user:", verifyError);
      }
      try {
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("username", data.username);
        localStorage.setItem("userId", userId);
        localStorage.setItem("username", data.username);
        logger.info("[AuthService] CRITICAL: New user credentials saved to both sessionStorage and localStorage:", { userId, username: data.username });
        const savedUserId = localStorage.getItem("userId");
        const savedUsername = localStorage.getItem("username");
        if (savedUserId !== userId || savedUsername !== data.username) {
          logger.error("[AuthService] CRITICAL: Credentials saved but verification failed!", {
            expected: { userId, username: data.username },
            found: { userId: savedUserId, username: savedUsername }
          });
        } else {
          logger.info("[AuthService] Credentials verification successful");
        }
      } catch (error) {
        logger.error("[AuthService] CRITICAL ERROR: Failed to save new user credentials to storage:", error);
        logger.warn("[AuthService] Continuing despite storage error - user may need to login again on next visit");
      }
    } catch (error) {
      logger.error("Error creating user:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("ConstraintError") || errorMessage.includes("already exists")) {
        return { success: false, error: "Username or email already exists" };
      }
      return { success: false, error: "Failed to create account. Please try again." };
    }
    return { success: true, userId };
  } catch (error) {
    logger.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Registration failed: ${errorMessage}. Please try again.` };
  }
}
async function loginUser(data) {
  try {
    if (!data.username || !data.password) {
      return { success: false, error: "Please enter username and password" };
    }
    try {
      await authStore.init();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Auth store initialization error during login:", error);
      if (errorMessage.includes("IndexedDB is not available")) {
        return { success: false, error: "Your browser does not support local storage. Please use a modern browser." };
      }
      if (errorMessage.includes("blocked") || errorMessage.includes("Blocked")) {
        return { success: false, error: "Database access is blocked. Please check your browser settings." };
      }
      return { success: false, error: "Unable to access local storage. Please refresh the page and try again." };
    }
    try {
      await authStore.init();
    } catch (initError) {
      logger.error("[AuthService] Auth store init error during login:", initError);
    }
    const user = await authStore.getUserByUsername(data.username);
    if (!user) {
      logger.error("[AuthService] User not found:", data.username);
      try {
        const allUsers = await authStore.getAllUsers();
        logger.info("[AuthService] Available users in database:", allUsers.map((u) => u.username));
      } catch (listError) {
        logger.error("[AuthService] Error listing users:", listError);
      }
      return { success: false, error: "Invalid username or password" };
    }
    logger.info("[AuthService] User found, verifying password...", { userId: user.id, username: user.username });
    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      logger.error("[AuthService] Password verification failed for user:", data.username);
      return { success: false, error: "Invalid username or password" };
    }
    logger.info("[AuthService] Password verified successfully");
    await authStore.updateUser(user.id, {
      lastLogin: (/* @__PURE__ */ new Date()).toISOString()
    });
    try {
      sessionStorage.setItem("userId", user.id);
      sessionStorage.setItem("username", user.username);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("username", user.username);
      if (localStorage.getItem("encryption_enabled") === "true") {
        sessionStorage.setItem("encryption_password", data.password);
        logger.info("[AuthService] Encryption password stored in sessionStorage for Dexie hooks");
      }
      logger.info("[AuthService] CRITICAL: Credentials saved to both sessionStorage and localStorage:", { userId: user.id, username: user.username });
    } catch (error) {
      logger.error("[AuthService] CRITICAL ERROR: Failed to save credentials to storage:", error);
      logger.warn("[AuthService] Continuing despite storage error - user may need to login again on next visit");
    }
    return { success: true, userId: user.id };
  } catch (error) {
    logger.error("Login error:", error);
    return { success: false, error: "Login failed. Please try again." };
  }
}
function logoutUser() {
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("encryption_password");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
}
async function getCurrentUser() {
  try {
    await authStore.init();
  } catch (error) {
    logger.error("[AuthService] Failed to initialize auth store:", error);
  }
  let userId = sessionStorage.getItem("userId");
  if (!userId) {
    userId = localStorage.getItem("userId");
    if (userId) {
      const username = localStorage.getItem("username");
      sessionStorage.setItem("userId", userId);
      if (username) {
        sessionStorage.setItem("username", username);
      }
      logger.info("[AuthService] Restored userId from localStorage:", userId);
    }
  }
  if (!userId) {
    try {
      const allUsers = await authStore.getAllUsers();
      logger.info("[AuthService] Found users in database:", allUsers?.length || 0);
      if (allUsers && allUsers.length > 0) {
        const sortedUsers = allUsers.sort((a, b) => {
          const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : new Date(a.createdAt).getTime();
          const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : new Date(b.createdAt).getTime();
          return bTime - aTime;
        });
        userId = sortedUsers[0].id;
        const username = sortedUsers[0].username;
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("username", username);
        try {
          localStorage.setItem("userId", userId);
          localStorage.setItem("username", username);
          logger.info("[AuthService] Restored credentials to localStorage from database:", { userId, username });
        } catch (error) {
          logger.warn("Could not store userId in localStorage:", error);
        }
      } else {
        logger.info("[AuthService] No users found in database");
      }
    } catch (error) {
      logger.error("[AuthService] Error finding existing user:", error);
    }
  }
  if (!userId) {
    logger.info("[AuthService] No userId found - user needs to login");
    return null;
  }
  try {
    const user = await authStore.getUserById(userId);
    if (user) {
      logger.info("[AuthService] User found:", { userId: user.id, username: user.username, termsAccepted: user.termsAccepted });
    } else {
      logger.debug("[AuthService] User ID found but user not in database (will attempt recovery):", userId);
      sessionStorage.removeItem("userId");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
    }
    return user;
  } catch (error) {
    logger.error("[AuthService] Error getting user by ID:", error);
    return null;
  }
}
async function requestPasswordReset(email) {
  try {
    try {
      await authStore.init();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Auth store initialization error during password reset:", error);
      if (errorMessage.includes("IndexedDB is not available")) {
        return {
          success: false,
          error: "Your browser does not support local storage. Please use a modern browser."
        };
      }
      if (errorMessage.includes("quota") || errorMessage.includes("QuotaExceeded")) {
        return {
          success: false,
          error: "Storage quota exceeded. Please clear some browser data and try again."
        };
      }
      return {
        success: false,
        error: "Unable to access local storage. Please refresh the page and try again."
      };
    }
    const user = await authStore.getUserByEmail(email);
    if (!user) {
      return { success: true };
    }
    if (!user.id) {
      throw new Error("User ID is missing");
    }
    const token = await authStore.createResetToken(user.id, email);
    if (!token) {
      throw new Error("Failed to create reset token");
    }
    const isTauriEnv = isTauri();
    const origin = isTauriEnv ? "tauri://localhost" : typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const pathname = typeof window !== "undefined" && window.location.pathname ? window.location.pathname : "/";
    const resetLink = `${origin}${pathname}#reset/${token}`;
    if (!resetLink || !resetLink.includes("#reset/")) {
      throw new Error(`Invalid reset link generated: ${resetLink}`);
    }
    return { success: true, resetLink };
  } catch (error) {
    logger.error("Password reset error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to generate reset link: ${errorMessage}` };
  }
}
async function resetPasswordWithToken(token, newPassword) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }
    await authStore.init();
    const tokenData = await authStore.getResetToken(token);
    if (!tokenData) {
      return { success: false, error: "Invalid or expired reset token" };
    }
    const passwordHash = await hashPassword(newPassword);
    await authStore.updateUser(tokenData.userId, { passwordHash });
    await authStore.deleteResetToken(token);
    const encryptionEnabled = localStorage.getItem("encryption_enabled") === "true";
    if (encryptionEnabled) {
      logger.warn("Password reset with encryption enabled - database will need to be unlocked with new password");
    }
    return { success: true, userId: tokenData.userId };
  } catch (error) {
    logger.error("Password reset error:", error);
    return { success: false, error: "Failed to reset password" };
  }
}
async function acceptTerms(userId) {
  await authStore.init();
  await authStore.updateUser(userId, {
    termsAccepted: true,
    termsAcceptedDate: (/* @__PURE__ */ new Date()).toISOString()
  });
}
const authService = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  acceptTerms,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPasswordWithToken
}, Symbol.toStringTag, { value: "Module" }));
let currentProgress = {
  progress: 0,
  status: "idle",
  label: ""
};
const callbacks = /* @__PURE__ */ new Set();
function subscribeToProgress(callback) {
  callbacks.add(callback);
  callback(currentProgress);
  return () => {
    callbacks.delete(callback);
  };
}
function notifyProgress(state) {
  currentProgress = state;
  callbacks.forEach((callback) => {
    try {
      callback(state);
    } catch (error) {
      console.error("Progress callback error:", error);
    }
  });
}
function setModelLoadingProgress(progress, label, details) {
  notifyProgress({
    progress: Math.max(0, Math.min(100, progress)),
    status: "loading",
    label,
    details
  });
}
function setProgressSuccess(label = "Complete", details) {
  notifyProgress({
    progress: 100,
    status: "success",
    label,
    details
  });
}
function setProgressError(label = "Error", details) {
  notifyProgress({
    progress: currentProgress.progress,
    // Keep current progress
    status: "error",
    label,
    details
  });
}
function getCurrentProgress() {
  return { ...currentProgress };
}
const DIRECT_SUICIDE_PHRASES = [
  { phrase: "i want to die", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i want to kill myself", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i am going to kill myself", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i'm suicidal", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i have suicidal thoughts", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i've been thinking about suicide", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i am planning to end my life", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i'm going to end it all", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i'm going to end my life", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i want to end it", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i'm done with life", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i don't want to live anymore", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "life is not worth living", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i'm better off dead", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "everyone would be better off without me", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i wish i hadn't been born", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i wish i were dead", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i wish i didn't exist", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i'm thinking about ending everything", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i just want it all to stop permanently", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i can't go on living like this", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" },
  { phrase: "i have no reason to live", category: "CRISIS_SUICIDAL_IDEATION_DIRECT", severity: "critical" }
];
const INDIRECT_SUICIDE_PHRASES = [
  { phrase: "i can't go on", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i can't do this anymore", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i'm at the end of my rope", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i feel trapped", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "there's no way out", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i'm done", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i'm finished", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i'm so tired of this life", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i just want to disappear", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i just want to go to sleep and not wake up", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i don't want to be here anymore", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i don't see a future for myself", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "nothing will ever get better", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "there's no point in trying anymore", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i have nothing to live for", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i'm such a burden", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "people would be better off without me", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "the world would be better if i were gone", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "soon this will all be over", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "if i see you again", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "i won't be around much longer", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" },
  { phrase: "you won't have to worry about me soon", category: "CRISIS_SUICIDAL_IDEATION_INDIRECT", severity: "high" }
];
const METHOD_PHRASES = [
  { phrase: "i'm going to jump", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "jump off a bridge", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "jump in front of a train", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "i'm going to take all my pills", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "i'm going to overdose", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "use gun on myself", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "use knife on myself", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "use razor on myself", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "i'm going to hang myself", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "i'm going to drown myself", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "researching painless ways to die", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "looking up how to kill myself", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "how many pills it takes to overdose", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "most effective suicide methods", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "bought a gun for myself", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "bought a rope", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "saving my meds for when i'm ready", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "wrote my suicide note", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "picked the day i'm going to do it", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "i know exactly how i'm going to end my life", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "i have everything ready to end it", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "tried to overdose before", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "tried to cut before", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "tried to jump before", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "tried to hang myself before", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" },
  { phrase: "last time i tried to kill myself", category: "CRISIS_PLANNING_OR_METHOD", severity: "critical" }
];
const SELF_HARM_PHRASES = [
  { phrase: "i've been cutting myself", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i cut myself to cope", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i hurt myself on purpose", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "scratching myself until i bleed", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i've been burning myself", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i punch myself", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i hit my head", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i pull out my hair when i'm upset", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i starve myself on purpose", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i binge and then make myself throw up", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i want to hurt myself", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i'm scared i might hurt myself", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i can't stop hurting myself", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i like seeing myself bleed", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i deserve to be hurt", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i'm thinking about cutting again", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i have the blade ready", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i have the knife ready", category: "CRISIS_SELF_HARM", severity: "high" },
  { phrase: "i have the razor ready", category: "CRISIS_SELF_HARM", severity: "high" }
];
const HOPELESSNESS_PHRASES = [
  { phrase: "i feel hopeless", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "nothing will ever change", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "i feel completely alone", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "i feel empty all the time", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "i'm useless", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "i'm worthless", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "i'm a failure at everything", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "i hate myself", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "i'm disgusting", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "i'm a burden to everyone", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "everyone hates me", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "nobody cares if i live or die", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "no one would miss me", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "i don't matter", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "i have no purpose", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" },
  { phrase: "i'm broken beyond repair", category: "RISK_SEVERE_HOPELESSNESS", severity: "moderate" }
];
const BEHAVIORAL_RED_FLAGS = [
  { phrase: "i've been giving away my stuff", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" },
  { phrase: "i'm saying goodbye to people", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" },
  { phrase: "i've been writing letters to everyone", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" },
  { phrase: "making sure everything is in order for when i'm gone", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" },
  { phrase: "i quit my job and don't care what happens", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" },
  { phrase: "i've been isolating from everyone", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" },
  { phrase: "i don't talk to my friends or family anymore", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" },
  { phrase: "i stay in my room all day", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" },
  { phrase: "i started drinking a lot more", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" },
  { phrase: "i'm using drugs to escape", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" },
  { phrase: "i've been driving recklessly on purpose", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" },
  { phrase: "i don't care if i get hurt anymore", category: "RISK_BEHAVIORAL_RED_FLAGS", severity: "moderate" }
];
const THIRD_PARTY_PHRASES = [
  { phrase: "my friend wants to kill themselves", category: "CRISIS_THIRD_PARTY_SUICIDE_RISK", severity: "high" },
  { phrase: "my friend is talking about suicide", category: "CRISIS_THIRD_PARTY_SUICIDE_RISK", severity: "high" },
  { phrase: "my friend said they want to die", category: "CRISIS_THIRD_PARTY_SUICIDE_RISK", severity: "high" },
  { phrase: "someone i know is going to end their life", category: "CRISIS_THIRD_PARTY_SUICIDE_RISK", severity: "high" },
  { phrase: "my child keeps saying they wish they were dead", category: "CRISIS_THIRD_PARTY_SUICIDE_RISK", severity: "high" },
  { phrase: "my partner said the world would be better without them", category: "CRISIS_THIRD_PARTY_SUICIDE_RISK", severity: "high" },
  { phrase: "a friend told me they are going to overdose", category: "CRISIS_THIRD_PARTY_SUICIDE_RISK", severity: "high" },
  { phrase: "someone i know is cutting themself", category: "CRISIS_THIRD_PARTY_SUICIDE_RISK", severity: "high" },
  { phrase: "my friend is talking about how they would do it", category: "CRISIS_THIRD_PARTY_SUICIDE_RISK", severity: "high" },
  { phrase: "my friend wrote a suicide note", category: "CRISIS_THIRD_PARTY_SUICIDE_RISK", severity: "high" },
  { phrase: "i'm scared my friend will hurt themselves", category: "CRISIS_THIRD_PARTY_SUICIDE_RISK", severity: "high" }
];
const IMMINENT_DANGER_PHRASES = [
  { phrase: "i'm going to do it now", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i'm going to do it tonight", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i can't stop myself", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i don't think i can stay safe", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i'm alone and i'm scared of what i might do", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i already took the pills", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i already cut myself and it won't stop bleeding", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i'm bleeding a lot", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i swallowed a lot of pills", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i just tried to hang myself", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i just tried to kill myself", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i'm sitting here with a gun", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i'm sitting here with a knife", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i'm sitting here with pills", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i'm sitting here with a rope", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "i'm in the car ready to drive off the bridge", category: "CRISIS_IMMINENT_DANGER", severity: "critical" }
];
const DOMESTIC_VIOLENCE_PHRASES = [
  { phrase: "hitting me", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "scared to go home", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "domestic violence", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "being controlled", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "afraid of my partner", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "partner hurts me", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "can't leave", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "trapped in relationship", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "fear for my safety", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "abuse", category: "CRISIS_IMMINENT_DANGER", severity: "critical" }
];
const SUBSTANCE_CRISIS_PHRASES = [
  { phrase: "overdose", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "took too many", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "blackout", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "too much alcohol", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "too many pills", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "mixing drugs", category: "CRISIS_IMMINENT_DANGER", severity: "critical" },
  { phrase: "can't stop using", category: "CRISIS_IMMINENT_DANGER", severity: "critical" }
];
const ALL_CRISIS_PHRASES = [
  ...DIRECT_SUICIDE_PHRASES,
  ...INDIRECT_SUICIDE_PHRASES,
  ...METHOD_PHRASES,
  ...SELF_HARM_PHRASES,
  ...HOPELESSNESS_PHRASES,
  ...BEHAVIORAL_RED_FLAGS,
  ...THIRD_PARTY_PHRASES,
  ...IMMINENT_DANGER_PHRASES,
  ...DOMESTIC_VIOLENCE_PHRASES,
  ...SUBSTANCE_CRISIS_PHRASES
];
function getCategoryDisplayName$1(category) {
  const names = {
    "CRISIS_SUICIDAL_IDEATION_DIRECT": "Direct Suicide Statements",
    "CRISIS_SUICIDAL_IDEATION_INDIRECT": "Indirect Suicide Statements",
    "CRISIS_PLANNING_OR_METHOD": "Suicide Planning or Methods",
    "CRISIS_SELF_HARM": "Self-Harm",
    "RISK_SEVERE_HOPELESSNESS": "Severe Hopelessness",
    "RISK_BEHAVIORAL_RED_FLAGS": "Behavioral Warning Signs",
    "CRISIS_THIRD_PARTY_SUICIDE_RISK": "Concern for Others",
    "CRISIS_IMMINENT_DANGER": "Immediate Danger"
  };
  return names[category] || category;
}
const MODEL_OPTIONS = [
  "LaMini-Flan-T5-783M-q4f16_1",
  // Primary: LaMini-Flan-T5
  "LaMini-Llama-738M-q4f16_1",
  // Alternative: LaMini-Llama-738M
  "MBZUAI/LaMini-Flan-T5-783M",
  // HuggingFace format (if supported)
  "MBZUAI/LaMini-Llama-738M"
  // HuggingFace format (if supported)
];
const DEFAULT_MODEL$1 = MODEL_OPTIONS[0];
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 256;
let globalModel = null;
let modelLoadPromise$1 = null;
let modelLoading = false;
let modelReady = false;
let loadProgress = 0;
let loadProgressCallback = null;
async function initializeWebLLM(modelName = DEFAULT_MODEL$1, progressCallback) {
  if (modelReady && globalModel) {
    return true;
  }
  if (modelLoading && modelLoadPromise$1) {
    try {
      await modelLoadPromise$1;
      return modelReady;
    } catch (error) {
      logger.error("[webllmService] Error waiting for model load:", error);
      return false;
    }
  }
  modelLoading = true;
  loadProgressCallback = null;
  loadProgress = 0;
  modelLoadPromise$1 = (async () => {
    let lastError = null;
    for (const tryModelName of MODEL_OPTIONS) {
      try {
        logger.info("[webllmService] Attempting to load WebLLM model:", tryModelName);
        const { LLM } = await __vitePreload(async () => {
          const { LLM: LLM2 } = await import("./vendor-BKChQSPc.js").then((n) => n.w);
          return { LLM: LLM2 };
        }, true ? __vite__mapDeps([3,2,0,1]) : void 0);
        const model = new LLM({
          model: tryModelName,
          initProgressCallback: (report) => {
            const progress = report.progress || 0;
            loadProgress = progress * 100;
            if (loadProgressCallback) {
              loadProgressCallback(loadProgress);
            }
            logger.debug("[webllmService] Load progress:", `${Math.round(loadProgress)}%`);
          }
        });
        await model.load();
        globalModel = model;
        modelReady = true;
        modelLoading = false;
        loadProgress = 100;
        logger.info("[webllmService] Model loaded successfully:", tryModelName);
        if (loadProgressCallback) {
          loadProgressCallback(100);
        }
        return model;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.warn(`[webllmService] Failed to load model ${tryModelName}:`, errorMsg);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }
    modelLoading = false;
    modelReady = false;
    const finalErrorMsg = lastError?.message || "All model loading attempts failed";
    logger.error("[webllmService] All model load attempts failed. Last error:", finalErrorMsg);
    throw lastError || new Error(finalErrorMsg);
  })();
  try {
    await modelLoadPromise$1;
    return modelReady;
  } catch (error) {
    return false;
  }
}
async function generateText$1(prompt, options) {
  if (!modelReady || !globalModel) {
    const initialized = await initializeWebLLM();
    if (!initialized) {
      throw new Error("Model is not ready. Please wait for initialization.");
    }
  }
  try {
    const systemPrompt = options?.systemPrompt || "You are a compassionate mental health support assistant. Be brief, supportive, and validating.";
    const temperature = options?.temperature ?? DEFAULT_TEMPERATURE;
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;
    const fullPrompt = `${systemPrompt}

User: ${prompt}

Assistant:`;
    logger.debug("[webllmService] Generating text, prompt length:", fullPrompt.length);
    const response = await globalModel.generate(
      fullPrompt,
      {
        temperature,
        max_gen_len: maxTokens
      }
    );
    logger.debug("[webllmService] Generated response length:", response.length);
    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("[webllmService] Generation error:", errorMsg);
    throw error;
  }
}
const webllmService = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  generateText: generateText$1,
  initializeWebLLM
}, Symbol.toStringTag, { value: "Module" }));
const SAFETY_AUDITOR_PROMPT = `You are a Safety Auditor. Analyze the following user input for signs of immediate self-harm, suicidal ideation, or domestic violence.

Output exactly one word:
* RED: Immediate crisis detected.
* GREEN: No immediate life-threatening crisis.

Do not provide any other text.`;
async function auditUserInput(userMessage) {
  try {
    logger.debug("[safetyAuditor] Auditing user input:", { messageLength: userMessage.length });
    const response = await generateText$1(userMessage, {
      systemPrompt: SAFETY_AUDITOR_PROMPT,
      temperature: 0.1,
      // Very low temperature for consistent output
      maxTokens: 10
      // Should only output one word
    });
    const cleaned = response.trim().toUpperCase();
    if (cleaned.includes("RED")) {
      logger.warn("[safetyAuditor] RED flag detected");
      return "RED";
    }
    if (cleaned.includes("GREEN")) {
      logger.debug("[safetyAuditor] GREEN - no crisis detected");
      return "GREEN";
    }
    logger.warn("[safetyAuditor] Unclear response, checking keywords as fallback");
    const lowerMessage = userMessage.toLowerCase();
    const crisisIndicators = [
      "suicide",
      "kill myself",
      "end my life",
      "want to die",
      "hurt myself",
      "self harm",
      "cutting",
      "overdose",
      "better off dead",
      "no reason to live",
      "going to sleep forever",
      "never wake up",
      "disappear forever"
    ];
    const hasCrisisIndicator = crisisIndicators.some(
      (indicator) => lowerMessage.includes(indicator)
    );
    return hasCrisisIndicator ? "RED" : "GREEN";
  } catch (error) {
    logger.error("[safetyAuditor] Error in safety audit:", error);
    return "GREEN";
  }
}
const crisisKeywords = new RegExp(
  [
    "kill myself",
    "k\\.m\\.s",
    "suicide",
    "suicidal",
    "want to die",
    "end my life",
    "self harm",
    "self-harm",
    "cutting",
    "hopeless",
    "no reason to live",
    "can't go on",
    "better off dead"
  ].join("|"),
  "i"
  // Case-insensitive
);
const domesticViolenceKeywords = new RegExp(
  [
    "hitting me",
    "scared to go home",
    "domestic violence",
    "abuse",
    "being controlled",
    "afraid of my partner",
    "partner hurts me",
    "can't leave",
    "trapped in relationship",
    "fear for my safety"
  ].join("|"),
  "i"
);
const substanceCrisisKeywords = new RegExp(
  [
    "overdose",
    "took too many",
    "blackout",
    "too much alcohol",
    "too many pills",
    "mixing drugs",
    "can't stop using"
  ].join("|"),
  "i"
);
async function checkForCrisisKeywords(text) {
  const lowerText = text.toLowerCase();
  if (domesticViolenceKeywords.test(lowerText)) {
    logger.warn("[safetyService] Domestic violence detected");
    return {
      isCrisis: true,
      isDomesticViolence: true,
      message: "I'm glad you reached out. Everyone deserves to feel safe at home. If you are in danger or being controlled, help is available. This conversation is private and confidential.",
      resources: [
        {
          name: "National Domestic Violence Hotline",
          contact: {
            type: "phone",
            number: "18007997233",
            displayText: "Call 1-800-799-SAFE (7233)"
          },
          url: "https://www.thehotline.org/"
        },
        {
          name: "Crisis Text Line",
          contact: {
            type: "text",
            number: "741741",
            displayText: "Text HOME to 741741"
          },
          url: "https://www.crisistextline.org/"
        }
      ]
    };
  }
  if (substanceCrisisKeywords.test(lowerText)) {
    logger.warn("[safetyService] Substance crisis detected");
    return {
      isCrisis: true,
      message: "It sounds like you're dealing with a substance-related crisis. Please know that help is available immediately. Your safety is the priority.",
      resources: [
        {
          name: "911 Emergency",
          contact: {
            type: "phone",
            number: "911",
            displayText: "Call 911"
          },
          url: ""
        },
        {
          name: "SAMHSA National Helpline",
          contact: {
            type: "phone",
            number: "18006624357",
            displayText: "Call 1-800-662-HELP (4357)"
          },
          url: "https://www.samhsa.gov/find-help/national-helpline"
        }
      ]
    };
  }
  if (crisisKeywords.test(lowerText)) {
    logger.warn("[safetyService] Crisis keywords detected");
    return {
      isCrisis: true,
      message: "It sounds like you are going through a difficult time. Please know that help is available, and you are not alone. It's important to talk to someone who can support you right now.",
      resources: [
        {
          name: "Crisis Text Line",
          contact: {
            type: "text",
            number: "741741",
            displayText: "Text HOME to 741741"
          },
          url: "https://www.crisistextline.org/"
        },
        {
          name: "National Suicide Prevention Lifeline",
          contact: {
            type: "phone",
            number: "988",
            displayText: "Call or text 988"
          },
          url: "https://988lifeline.org/"
        }
      ]
    };
  }
  try {
    const auditResult = await auditUserInput(text);
    if (auditResult === "RED") {
      logger.warn("[safetyService] Safety Auditor flagged RED");
      return {
        isCrisis: true,
        message: "I'm glad you reached out. Based on what you've shared, I want to make sure you get the support you deserve. Please reach out to one of these 24/7 confidential resources where a real person can walk with you through this.",
        resources: [
          {
            name: "Crisis Text Line",
            contact: {
              type: "text",
              number: "741741",
              displayText: "Text HOME to 741741"
            },
            url: "https://www.crisistextline.org/"
          },
          {
            name: "National Suicide Prevention Lifeline",
            contact: {
              type: "phone",
              number: "988",
              displayText: "Call or text 988"
            },
            url: "https://988lifeline.org/"
          }
        ]
      };
    }
  } catch (error) {
    logger.error("[safetyService] Error in Safety Auditor:", error);
  }
  return null;
}
function checkSharedArrayBuffer() {
  try {
    return typeof SharedArrayBuffer !== "undefined";
  } catch {
    return false;
  }
}
function checkCrossOriginIsolated() {
  try {
    return self.crossOriginIsolated === true;
  } catch {
    return false;
  }
}
function checkWebGPU() {
  try {
    return "gpu" in navigator && navigator.gpu !== void 0;
  } catch {
    return false;
  }
}
function checkWASM() {
  try {
    if (typeof WebAssembly === "undefined") {
      console.warn("[BrowserCompatibility] WebAssembly object not found");
      return false;
    }
    const hasInstantiate = typeof WebAssembly.instantiate === "function";
    const hasCompile = typeof WebAssembly.compile === "function";
    if (!hasInstantiate && !hasCompile) {
      console.warn("[BrowserCompatibility] WebAssembly methods not available");
      return false;
    }
    try {
      const wasmBytes = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]);
      if (typeof WebAssembly.validate === "function") {
        const isValid = WebAssembly.validate(wasmBytes);
        if (!isValid) {
          console.warn("[BrowserCompatibility] WASM validation failed - module invalid");
          return false;
        }
        return true;
      }
      return true;
    } catch (validationError) {
      console.warn("[BrowserCompatibility] WASM validation error (may be CSP blocked):", validationError);
      return true;
    }
  } catch (error) {
    console.error("[BrowserCompatibility] Error checking WASM support:", error);
    return false;
  }
}
function estimateMemory() {
  try {
    if ("deviceMemory" in navigator && navigator.deviceMemory) {
      return navigator.deviceMemory * 1024;
    }
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    if (isMobile) {
      return 2048;
    }
    return 4096;
  } catch {
    return null;
  }
}
function detectDeviceType() {
  try {
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return "tablet";
    }
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      return "mobile";
    }
    if (/windows|macintosh|linux/i.test(ua)) {
      return "desktop";
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}
function detectBrowser() {
  try {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
    return "Unknown";
  } catch {
    return "Unknown";
  }
}
function detectOS() {
  try {
    const ua = navigator.userAgent;
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac OS")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    return "Unknown";
  } catch {
    return "Unknown";
  }
}
function generateReport(sharedArrayBuffer, crossOriginIsolated, webGPU, wasm, memory, deviceType, browser, os) {
  const issues = [];
  const recommendations = [];
  let canUseAI = true;
  let suggestedStrategy = "standard";
  if (!sharedArrayBuffer) {
    issues.push("SharedArrayBuffer is not available");
    recommendations.push("Enable COOP/COEP headers on your server (see SERVER_CONFIG.md)");
    canUseAI = false;
    suggestedStrategy = "single-threaded";
  }
  if (!crossOriginIsolated) {
    issues.push("Cross-origin isolation is not enabled");
    if (!sharedArrayBuffer) {
      recommendations.push("Set Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp headers");
    }
  }
  if (!wasm) {
    issues.push("WebAssembly is not supported");
    recommendations.push("Use a modern browser that supports WebAssembly");
    canUseAI = false;
    suggestedStrategy = "unavailable";
  }
  if (memory !== null) {
    if (memory < 1024) {
      issues.push(`Low device memory detected (${Math.round(memory)}MB)`);
      recommendations.push("Use smaller models or close other applications");
      suggestedStrategy = "low-memory";
    } else if (memory < 2048) {
      issues.push(`Limited device memory (${Math.round(memory)}MB)`);
      recommendations.push("Consider using smaller models for better performance");
      if (suggestedStrategy === "standard") {
        suggestedStrategy = "low-memory";
      }
    }
  }
  if (!webGPU) {
    issues.push("WebGPU is not available");
    recommendations.push("GPU acceleration unavailable - will use CPU only");
    if (suggestedStrategy === "standard") {
      suggestedStrategy = "cpu-only";
    }
  }
  if (deviceType === "mobile" && memory !== null && memory < 3072) {
    issues.push("Mobile device with limited memory");
    recommendations.push("AI models may be slow or unavailable on this device");
    if (suggestedStrategy === "standard") {
      suggestedStrategy = "low-memory";
    }
  }
  if (!wasm) {
    canUseAI = false;
    suggestedStrategy = "unavailable";
  } else if (!sharedArrayBuffer && !crossOriginIsolated) {
    canUseAI = true;
    suggestedStrategy = "single-threaded";
  }
  const isCompatible = wasm && (sharedArrayBuffer || crossOriginIsolated);
  return {
    sharedArrayBuffer,
    crossOriginIsolated,
    webGPU,
    wasm,
    estimatedMemory: memory,
    deviceType,
    browser,
    os,
    isCompatible,
    issues,
    recommendations,
    canUseAI,
    suggestedStrategy
  };
}
function checkBrowserCompatibility() {
  const sharedArrayBuffer = checkSharedArrayBuffer();
  const crossOriginIsolated = checkCrossOriginIsolated();
  const webGPU = checkWebGPU();
  const wasm = checkWASM();
  const memory = estimateMemory();
  const deviceType = detectDeviceType();
  const browser = detectBrowser();
  const os = detectOS();
  return generateReport(
    sharedArrayBuffer,
    crossOriginIsolated,
    webGPU,
    wasm,
    memory,
    deviceType,
    browser,
    os
  );
}
function getCompatibilitySummary(report) {
  if (!report.canUseAI) {
    return "AI models unavailable - browser compatibility issue";
  }
  if (report.suggestedStrategy === "unavailable") {
    return "AI models unavailable - WebAssembly not supported";
  }
  if (report.suggestedStrategy === "single-threaded") {
    return "AI models available (single-threaded mode) - enable COOP/COEP headers for better performance";
  }
  if (report.suggestedStrategy === "low-memory") {
    return "AI models available (low-memory mode) - may be slower";
  }
  if (report.suggestedStrategy === "cpu-only") {
    return "AI models available (CPU-only mode) - GPU acceleration unavailable";
  }
  return "AI models available - all features supported";
}
if (typeof globalThis !== "undefined") {
  const globalOrt = globalThis.ort = globalThis.ort || {};
  globalOrt.env = globalOrt.env || {};
  globalOrt.env.logLevel = "fatal";
  globalOrt.env.wasm = globalOrt.env.wasm || {};
  if (!globalOrt.env.wasm.numThreads) {
    globalOrt.env.wasm.numThreads = typeof SharedArrayBuffer !== "undefined" ? 4 : 1;
  }
  if (!globalOrt.registerBackend) {
    globalOrt.registerBackend = function() {
    };
  }
}
if (typeof window !== "undefined") {
  window.__TRANSFORMERS_ENV__ = window.__TRANSFORMERS_ENV__ || {};
  window.__TRANSFORMERS_ENV__.USE_WEBGPU = false;
  window.__TRANSFORMERS_ENV__.USE_WASM = true;
}
const MODEL_CONFIGS = {
  distilbert: {
    name: "DistilBERT",
    path: "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
    // Use Xenova optimized model (browser-compatible)
    task: "text-classification",
    description: "Fast sentiment analysis and mood classification",
    size: "~67MB"
  },
  lamini: {
    name: "LaMini-Flan-T5",
    path: "Xenova/LaMini-Flan-T5-77M",
    // Use local bundled model or HF
    task: "text2text-generation",
    description: "Fast, lightweight counseling assistant (~300MB)",
    size: "~300MB"
  }
};
const DEFAULT_MODEL = "lamini";
let moodTrackerModel = null;
let counselingCoachModel = null;
let allModelsCache = /* @__PURE__ */ new Map();
let selectedModel = DEFAULT_MODEL;
let isModelLoading = false;
let modelLoadPromise = null;
let compatibilityReport = null;
let lastErrorCategory = null;
let lastInitAttempt = 0;
let initFailureCount = 0;
const INIT_COOLDOWN = 3e4;
const MAX_INIT_FAILURES = 3;
let currentDownloadProgress = 0;
let currentDownloadStatus = "idle";
let currentDownloadLabel = "";
let currentDownloadDetails = "";
function getMoodTrackerModel() {
  return moodTrackerModel;
}
function getCounselingCoachModel() {
  return counselingCoachModel;
}
function getIsModelLoading() {
  return isModelLoading;
}
function isTextGenerationModel(model) {
  if (!model) return false;
  try {
    if (model.task === "text-generation" || model.task === "text2text-generation") {
      return true;
    }
    if (typeof model === "function") {
      return true;
    }
    return false;
  } catch (error) {
    logger.error("[models] Error checking model compatibility:", error);
    return false;
  }
}
async function clearModels() {
  moodTrackerModel = null;
  counselingCoachModel = null;
  allModelsCache.clear();
  isModelLoading = false;
  modelLoadPromise = null;
  if ("caches" in window) {
    const cacheKeys = await caches.keys();
    for (const key of cacheKeys) {
      if (key.includes("transformers") || key.includes("model") || key.includes("onnx")) {
        await caches.delete(key);
      }
    }
  }
}
async function initializeModels(forceReload = false, modelType) {
  const targetModel = selectedModel;
  if (forceReload) {
    await clearModels();
    initFailureCount = 0;
  }
  if (moodTrackerModel && counselingCoachModel && selectedModel === targetModel && !forceReload) {
    try {
      const modelsWork = await verifyModelsWork();
      if (modelsWork) {
        initFailureCount = 0;
        return true;
      }
    } catch (error) {
      logger.error("[models] Error checking if models are loaded:", error);
    }
  }
  if (isModelLoading && modelLoadPromise && !forceReload) {
    try {
      const result = await modelLoadPromise;
      if (moodTrackerModel && counselingCoachModel && selectedModel === targetModel) {
        return result;
      }
    } catch (error) {
      logger.error("[models] Error checking current model:", error);
    }
  }
  const now = Date.now();
  if (!forceReload && initFailureCount >= MAX_INIT_FAILURES) {
    const timeSinceLastAttempt = now - lastInitAttempt;
    if (timeSinceLastAttempt < INIT_COOLDOWN) {
      logger.info(`⏸️ Model initialization skipped - too many recent failures. Waiting ${Math.ceil((INIT_COOLDOWN - timeSinceLastAttempt) / 1e3)}s before retry.`);
      return false;
    } else {
      initFailureCount = 0;
    }
  }
  if (!forceReload && areModelsLoaded()) {
    logger.info("✅ Models already loaded - skipping initialization");
    currentDownloadStatus = "complete";
    currentDownloadProgress = 100;
    currentDownloadLabel = "AI models ready";
    currentDownloadDetails = "All models loaded";
    setProgressSuccess("AI models ready", "All models are loaded and ready");
    return true;
  }
  if (!forceReload && lastInitAttempt > 0) {
    const timeSinceLastAttempt = now - lastInitAttempt;
    if (timeSinceLastAttempt < INIT_COOLDOWN && !isModelLoading) {
      logger.info(`⏸️ Model initialization skipped - too soon after last attempt. Waiting ${Math.ceil((INIT_COOLDOWN - timeSinceLastAttempt) / 1e3)}s.`);
      return false;
    }
  }
  lastInitAttempt = now;
  isModelLoading = true;
  currentDownloadProgress = 0;
  currentDownloadStatus = "downloading";
  currentDownloadLabel = "Starting download...";
  currentDownloadDetails = "Preparing AI models";
  let loadingTimeout = null;
  modelLoadPromise = (async () => {
    try {
      logger.info("[MODEL_DEBUG] Running browser compatibility check...");
      compatibilityReport = checkBrowserCompatibility();
      lastErrorCategory = null;
      const summary = getCompatibilitySummary(compatibilityReport);
      logger.info(`🔍 Browser compatibility: ${summary}`);
      logger.info("[MODEL_DEBUG] Compatibility details:", {
        canUseAI: compatibilityReport?.canUseAI,
        wasm: compatibilityReport?.wasm,
        sharedArrayBuffer: compatibilityReport?.sharedArrayBuffer,
        webGPU: compatibilityReport?.webGPU,
        estimatedMemory: compatibilityReport?.estimatedMemory,
        suggestedStrategy: compatibilityReport?.suggestedStrategy
      });
      if (!compatibilityReport.wasm) {
        logger.warn("⚠️ WebAssembly not supported. AI models cannot be used on this browser.");
        lastErrorCategory = "wasm";
        isModelLoading = false;
        setProgressError("AI models unavailable", "WebAssembly not supported. Use a modern browser.");
        return false;
      }
      if (!compatibilityReport.sharedArrayBuffer) {
        logger.warn("⚠️ SharedArrayBuffer not available. Will attempt single-threaded mode.");
        logger.warn("⚠️ For better performance, enable COOP/COEP headers (see SERVER_CONFIG.md).");
        lastErrorCategory = "coop-coep";
      } else {
        logger.info("✓ SharedArrayBuffer available - multi-threaded mode enabled");
      }
      logger.info("[MODEL_DEBUG] Browser compatibility check passed, proceeding with model loading...");
      logger.info("[MODEL_DEBUG] canUseAI:", compatibilityReport.canUseAI, "suggestedStrategy:", compatibilityReport.suggestedStrategy);
      let transformersModule;
      try {
        logger.info("[MODEL_DEBUG] Importing @xenova/transformers (using WASM backend)...");
        if (typeof globalThis !== "undefined") {
          const globalOrt = globalThis.ort = globalThis.ort || {};
          if (!globalOrt.env) {
            globalOrt.env = { wasm: { numThreads: typeof SharedArrayBuffer !== "undefined" ? 4 : 1 } };
          }
          if (!globalOrt.registerBackend) {
            globalOrt.registerBackend = function() {
            };
          }
        }
        const importPromise = __vitePreload(() => import("./transformers-CdMs_eeA.js").then((n) => n.t), true ? __vite__mapDeps([0,1,2,3]) : void 0);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Import timeout after 10 seconds")), 1e4);
        });
        transformersModule = await Promise.race([importPromise, timeoutPromise]);
        logger.info("[MODEL_DEBUG] Transformers module imported successfully");
        if (!transformersModule || !transformersModule.pipeline) {
          logger.error("[MODEL_DEBUG] Transformers module structure invalid:", {
            hasModule: !!transformersModule,
            hasPipeline: !!transformersModule?.pipeline,
            moduleKeys: transformersModule ? Object.keys(transformersModule) : []
          });
          logger.info("ℹ️ Transformers module structure invalid. Using rule-based responses.");
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
          }
          isModelLoading = false;
          return false;
        }
        logger.info("[MODEL_DEBUG] Transformers module verified - pipeline function available");
      } catch (importError) {
        const importErrorMsg = importError?.message || String(importError);
        const importErrorStack = importError?.stack || "";
        logger.error("[MODEL_DEBUG] Failed to import @xenova/transformers:", importErrorMsg);
        if (importErrorStack) {
          logger.error("[MODEL_DEBUG] Import error stack:", importErrorStack);
        }
        if (importErrorMsg.includes("memory") || importErrorMsg.includes("OOM") || importErrorMsg.includes("out of memory")) {
          lastErrorCategory = "memory";
          logger.info("ℹ️ AI models unavailable: Insufficient device memory.");
          logger.info("ℹ️ App uses rule-based responses (fully functional).");
        } else if (importErrorMsg.includes("network") || importErrorMsg.includes("fetch") || importErrorMsg.includes("Failed to fetch")) {
          lastErrorCategory = "network";
          logger.info("ℹ️ AI models unavailable: Network error during download.");
          logger.info("ℹ️ App uses rule-based responses (fully functional).");
        } else {
          lastErrorCategory = "unknown";
          logger.info("ℹ️ AI models unavailable. App uses rule-based responses (fully functional).");
        }
        isModelLoading = false;
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }
        modelLoadPromise = null;
        return false;
      }
      const { pipeline, env } = transformersModule;
      if (!pipeline || !env) {
        throw new Error("Transformers module did not load correctly");
      }
      if (typeof pipeline !== "function") {
        throw new Error("Pipeline function not available in transformers module");
      }
      try {
        const isDev2 = false;
        const isWebProduction2 = !isDev2 && (typeof window !== "undefined" && !("__TAURI__" in window));
        env.useBrowserCache = true;
        env.useCustomCache = false;
        env.logLevel = "error";
        env.cacheDir = "./models-cache";
        env.allowRemoteModels = true;
        if (isWebProduction2) {
          env.allowLocalModels = false;
          logger.info("📦 Web Production: forcing HuggingFace download (allowLocalModels=false)");
        } else {
          env.allowLocalModels = true;
          if (!isDev2) {
            logger.info("📦 Using local bundled models from /models/ directory");
            logger.info("📦 Will fallback to HuggingFace if local model not available");
          }
        }
      } catch (configError) {
        logger.warn("Could not configure transformers environment, using defaults:", configError);
      }
      let preferredDevice = "cpu";
      let deviceReason = "";
      if (compatibilityReport?.wasm) {
        preferredDevice = "cpu";
        deviceReason = "ONNX Runtime WASM backend (CPU with optimizations)";
        if (compatibilityReport?.sharedArrayBuffer) {
          logger.info("[MODEL_DEBUG] ✅ ONNX Runtime WASM backend with multi-threading available");
        } else {
          logger.info("[MODEL_DEBUG] ✅ ONNX Runtime WASM backend available (single-threaded mode)");
        }
      } else {
        preferredDevice = "cpu";
        deviceReason = "CPU (fallback)";
        logger.info("[MODEL_DEBUG] ⚠️ Using CPU fallback - WASM optimizations unavailable");
      }
      const loadLaMiniFirst = targetModel === "lamini";
      logger.info(`[MODEL_LOAD] Selected model: ${targetModel}, Loading order: ${loadLaMiniFirst ? "LaMini -> DistilBERT" : "DistilBERT -> LaMini"}`);
      let totalProgress = 0;
      let modelsLoaded = 0;
      const totalModels = 2;
      let lastUpdateTime = 0;
      const THROTTLE_MS = 100;
      const progressCallback = (progress) => {
        const now2 = Date.now();
        const shouldUpdate = now2 - lastUpdateTime >= THROTTLE_MS;
        if (progress.status === "progress") {
          let percent = 0;
          if (progress.progress) {
            percent = progress.progress > 1 ? Math.round(progress.progress) : Math.round(progress.progress * 100);
            percent = Math.max(0, Math.min(100, percent));
          }
          const modelProgress = Math.round(modelsLoaded / totalModels * 100 + percent / totalModels);
          totalProgress = Math.max(0, Math.min(100, modelProgress));
          const modelName = progress.name || "model";
          logger.info(`Model loading: ${modelName} - ${percent}%`);
          currentDownloadProgress = totalProgress;
          currentDownloadStatus = "downloading";
          currentDownloadLabel = "Loading AI models...";
          currentDownloadDetails = `${modelName}: ${percent}%`;
          if (shouldUpdate) {
            setModelLoadingProgress(
              totalProgress,
              `Loading AI models...`,
              `${modelName}: ${percent}%`
            );
            lastUpdateTime = now2;
          }
        } else if (progress.status === "done") {
          const modelName = progress.name || "model";
          logger.info(`Model progress callback: ${modelName} reported done (files downloaded, initializing...)`);
          if (shouldUpdate) {
            setModelLoadingProgress(
              Math.min(totalProgress, 85),
              `Loading AI models...`,
              `${modelName} files downloaded, initializing...`
            );
            lastUpdateTime = now2;
          }
        }
      };
      const HUGGINGFACE_MODEL_IDS = {
        distilbert: "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
        lamini: "Xenova/LaMini-Flan-T5-77M"
      };
      const isDev = false;
      const isWebProduction = !isDev && (typeof window !== "undefined" && !("__TAURI__" in window));
      const loadMoodTracker = async () => {
        const moodTrackingModelType = "distilbert";
        const moodTrackingConfig = MODEL_CONFIGS[moodTrackingModelType];
        const moodTrackingHuggingfaceId = HUGGINGFACE_MODEL_IDS[moodTrackingModelType];
        let moodTrackingModelPath = moodTrackingHuggingfaceId;
        logger.info(`[MODEL_DEBUG] Using Xenova DistilBERT for mood tracking: ${moodTrackingHuggingfaceId}`);
        try {
          logger.info(`Attempting to load ${moodTrackingConfig.name} for mood tracking...`);
          const pipelineOptions = {
            quantized: true,
            progress_callback: progressCallback
          };
          const modelLoadTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Model loading timeout after 30 seconds")), 3e4);
          });
          try {
            moodTrackerModel = await Promise.race([
              pipeline(moodTrackingConfig.task, moodTrackingModelPath, pipelineOptions),
              modelLoadTimeout
            ]);
            if (!moodTrackerModel) {
              throw new Error("Model pipeline returned null");
            }
            logger.info(`✓ ${moodTrackingConfig.name} model loaded successfully for mood tracking`);
          } catch (pipelineError) {
            const errorMsg = pipelineError?.message || String(pipelineError);
            if (errorMsg.includes("<!DOCTYPE") || errorMsg.includes("Unexpected token")) {
              logger.warn(`[MODEL_DEBUG] ${moodTrackingConfig.name} loading failed - received HTML instead of model data. This may be a CORS or network issue.`);
              throw new Error(`Network/CORS error: Received HTML response instead of model data. Check network connectivity and CORS settings.`);
            }
            throw pipelineError;
          }
          allModelsCache.set(moodTrackingModelType, moodTrackerModel);
          modelsLoaded++;
          const modelProgress = Math.round(modelsLoaded / totalModels * 95);
          totalProgress = Math.min(95, modelProgress);
          currentDownloadProgress = totalProgress;
          setModelLoadingProgress(
            totalProgress,
            `Loading AI models...`,
            `${moodTrackingConfig.name} initialized`
          );
        } catch (modelError) {
          const errorMsg = modelError?.message || String(modelError);
          logger.error(`[MODEL_DEBUG] Pipeline call failed for ${moodTrackingConfig.name}:`, errorMsg);
          moodTrackerModel = null;
        }
      };
      const loadCounselingCoach = async () => {
        const counselingModelType = "lamini";
        const counselingConfig = MODEL_CONFIGS[counselingModelType];
        if (allModelsCache.has(counselingModelType)) {
          counselingCoachModel = allModelsCache.get(counselingModelType);
          logger.info(`✓ Using cached ${counselingConfig.name} for counseling`);
          modelsLoaded++;
          return;
        }
        try {
          logger.info(`Attempting to load ${counselingConfig.name} for counseling...`);
          let counselingModelPath = counselingConfig.path;
          const counselingHuggingfaceId = HUGGINGFACE_MODEL_IDS[counselingModelType];
          if (isDev || isWebProduction) {
            counselingModelPath = counselingHuggingfaceId;
          }
          const counselingOptions = {
            quantized: true,
            progress_callback: progressCallback,
            device: preferredDevice
          };
          const counselingLoadTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Counseling model loading timeout after 30 seconds")), 3e4);
          });
          try {
            counselingCoachModel = await Promise.race([
              pipeline(counselingConfig.task, counselingModelPath, counselingOptions),
              counselingLoadTimeout
            ]);
            if (!counselingCoachModel) {
              throw new Error("Model pipeline returned null");
            }
            logger.info(`✓ ${counselingConfig.name} loaded successfully for counseling`);
          } catch (pipelineError) {
            const errorMsg = pipelineError?.message || String(pipelineError);
            if (errorMsg.includes("<!DOCTYPE") || errorMsg.includes("Unexpected token")) {
              logger.warn(`[MODEL_DEBUG] ${counselingConfig.name} loading failed - received HTML instead of model data. This may be a CORS or network issue.`);
              throw new Error(`Network/CORS error: Received HTML response instead of model data. Check network connectivity and CORS settings.`);
            }
            throw pipelineError;
          }
          allModelsCache.set(counselingModelType, counselingCoachModel);
          modelsLoaded++;
          const counselingProgress = Math.round(modelsLoaded / totalModels * 100);
          totalProgress = Math.min(100, counselingProgress);
          currentDownloadProgress = totalProgress;
          setModelLoadingProgress(
            totalProgress,
            `Loading AI models...`,
            `${counselingConfig.name} initialized`
          );
        } catch (counselingError) {
          const errorMsg = counselingError?.message || String(counselingError);
          logger.error(`[MODEL_DEBUG] Counseling model loading error:`, errorMsg);
          counselingCoachModel = null;
        }
      };
      if (loadLaMiniFirst) {
        await loadCounselingCoach();
        await loadMoodTracker();
      }
      const modelsReady = moodTrackerModel !== null && counselingCoachModel !== null;
      if (loadingTimeout) clearTimeout(loadingTimeout);
      isModelLoading = false;
      if (modelsReady) {
        currentDownloadProgress = 100;
        currentDownloadStatus = "complete";
        currentDownloadLabel = "AI models ready";
        currentDownloadDetails = "All models loaded and verified";
        setProgressSuccess("AI models loaded successfully!", "All models are ready to use");
        logger.info("✅ All AI models loaded!");
        logger.info(`  - Mood tracker: ${moodTrackerModel ? "✓" : "✗"}`);
        logger.info(`  - Counseling coach: ${counselingCoachModel ? "✓" : "✗"}`);
        logger.info("[MODEL_VERIFY] Verifying loaded models work...");
        const modelsWork = await verifyModelsWork();
        if (modelsWork) {
          updateModelVersion();
          logger.info("✅ Model verification passed - all systems ready!");
        } else {
          logger.warn("⚠️ Models loaded but verification failed - will retry...");
          await clearModels();
          currentDownloadStatus = "error";
          currentDownloadLabel = "Model verification failed";
          currentDownloadDetails = "Will retry loading";
          return false;
        }
      } else {
        if (!isModelLoading) {
          setProgressError("AI models unavailable", "App will use rule-based responses");
          logger.warn("⚠️ AI models not available. App will use rule-based responses.");
          logger.warn(`  - Mood tracker: ${moodTrackerModel ? "✓ Loaded" : "✗ Failed"}`);
          logger.warn(`  - Counseling coach: ${counselingCoachModel ? "✓ Loaded" : "✗ Failed"}`);
          if (moodTrackerModel || counselingCoachModel) {
            logger.info("ℹ️ Partial model loading: Some AI features may be available.");
            if (moodTrackerModel && counselingCoachModel) {
              currentDownloadStatus = "complete";
              currentDownloadLabel = "AI models ready";
              setProgressSuccess("AI models loaded successfully!", "All models are ready to use");
            } else {
              currentDownloadStatus = "error";
              currentDownloadLabel = "Partial model loading";
              setModelLoadingProgress(50, "Partial model loading", "Some AI features available");
            }
          } else {
            logger.info("ℹ️ All models failed to load. The app will use rule-based responses which are fully functional.");
            currentDownloadStatus = "error";
            currentDownloadLabel = "AI models unavailable";
            currentDownloadProgress = 0;
            setModelLoadingProgress(0, "AI models unavailable", "Using rule-based responses");
          }
        }
      }
      return modelsReady;
    } catch (error) {
      if (loadingTimeout) clearTimeout(loadingTimeout);
      logger.error("Model initialization error:", error);
      isModelLoading = false;
      modelLoadPromise = null;
      moodTrackerModel = null;
      counselingCoachModel = null;
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!lastErrorCategory) {
        if (errorMessage.includes("memory") || errorMessage.includes("OOM") || errorMessage.includes("out of memory")) {
          lastErrorCategory = "memory";
        } else if (errorMessage.includes("network") || errorMessage.includes("fetch") || errorMessage.includes("Failed to fetch")) {
          lastErrorCategory = "network";
        } else if (errorMessage.includes("WebAssembly") || errorMessage.includes("WASM")) {
          lastErrorCategory = "wasm";
        } else {
          lastErrorCategory = "unknown";
        }
      }
      switch (lastErrorCategory) {
        case "memory":
          logger.warn("⚠️ Insufficient memory for AI models. App will use rule-based responses.");
          break;
        case "network":
          logger.warn("⚠️ Failed to download AI models. Check your internet connection.");
          logger.warn("App will use rule-based responses.");
          break;
        case "wasm":
          logger.warn("⚠️ WebAssembly not supported. AI models cannot run on this browser.");
          logger.warn("App will continue with rule-based responses.");
          break;
        default:
          logger.warn("⚠️ Failed to load on-device models. App will use rule-based responses instead.");
      }
      currentDownloadStatus = "error";
      currentDownloadLabel = "AI models unavailable";
      currentDownloadDetails = "Will retry in background";
      initFailureCount++;
      return false;
    }
  })();
  return modelLoadPromise.then((result) => {
    if (!result) {
      initFailureCount++;
    } else {
      initFailureCount = 0;
    }
    return result;
  }).catch((error) => {
    initFailureCount++;
    throw error;
  });
}
async function preloadModels() {
  if (isModelLoading && modelLoadPromise) {
    logger.info("🚀 Model loading already in progress, waiting for existing load...");
    try {
      await modelLoadPromise;
      return areModelsLoaded();
    } catch (error) {
      logger.error("[models] Error waiting for model load:", error);
      return false;
    }
  }
  if (areModelsLoaded()) {
    const modelsWork = await verifyModelsWork();
    if (modelsWork) {
      logger.info("✅ Models already loaded and working - skipping preload.");
      return true;
    }
  }
  logger.info("🚀 Starting background model preload...");
  try {
    if (areModelsLoaded()) {
      logger.info("✅ Models already loaded, checking if current...");
      const areCurrent = await areModelsCurrent();
      if (areCurrent) {
        logger.info("✅ Models are current, verifying they work...");
        const modelsWork = await verifyModelsWork();
        if (modelsWork) {
          logger.info("✅ Models are loaded, current, and verified working - skipping preload.");
          return true;
        } else {
          logger.warn("⚠️ Models are loaded but verification failed - will reload...");
          await clearModels();
        }
      } else {
        logger.info("⚠️ Models are loaded but outdated - will update...");
        await clearModels();
      }
    }
    let attempts = 0;
    let lastError = null;
    let networkErrorDetected = false;
    while (!networkErrorDetected) {
      attempts++;
      if (attempts === 1 || attempts % 5 === 0) {
        logger.info(`🚀 AI model preload attempt ${attempts}...`);
      }
      try {
        if (isModelLoading && modelLoadPromise) {
          try {
            await modelLoadPromise;
            if (areModelsLoaded()) {
              return true;
            }
          } catch (error) {
            logger.error("[models] Error checking models during retry:", error);
          }
        }
        const loaded = await initializeModels();
        const moodModel = getMoodTrackerModel();
        const counselingModel = getCounselingCoachModel();
        if (loaded && moodModel && counselingModel) {
          logger.info(`[MODEL_VERIFY] Verifying models work after ${attempts} attempt${attempts !== 1 ? "s" : ""}...`);
          const modelsWork = await verifyModelsWork();
          if (modelsWork) {
            updateModelVersion();
            logger.info(`✅ AI models loaded, verified, and ready after ${attempts} attempt${attempts !== 1 ? "s" : ""}!`);
            return true;
          } else {
            logger.warn(`⚠️ Models loaded but verification failed after ${attempts} attempt${attempts !== 1 ? "s" : ""} - will retry...`);
            await clearModels();
          }
        }
        if (moodModel || counselingModel) {
          logger.info(`ℹ️ Partial model loading: ${moodModel ? "Mood tracker ✓" : "Mood tracker ✗"}, ${counselingModel ? "Counseling coach ✓" : "Counseling coach ✗"}`);
        }
      } catch (error) {
        lastError = error;
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : "";
        const isNetworkError = errorMsg.includes("network") || errorMsg.includes("fetch") || errorMsg.includes("Failed to fetch") || errorMsg.includes("No internet") || errorMsg.includes("NetworkError") || errorMsg.includes("ERR_INTERNET_DISCONNECTED");
        if (isNetworkError) {
          networkErrorDetected = true;
          logger.warn(`[MODEL_DEBUG] Network error detected on attempt ${attempts} - stopping retries (no internet).`);
          logger.warn("⚠️ AI models cannot be downloaded without internet connection.");
          break;
        }
        if (attempts % 10 === 0) {
          logger.info(`[MODEL_DEBUG] Attempt ${attempts} failed (will retry):`, errorMsg.substring(0, 100));
        }
      }
      if (!networkErrorDetected) {
        const delay = Math.min(1e3 * Math.pow(1.5, attempts - 1), 3e4);
        if (attempts % 5 === 0) {
          logger.info(`[MODEL_DEBUG] Waiting ${Math.round(delay / 1e3)}s before retry ${attempts + 1}...`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    const finalMoodModel = getMoodTrackerModel();
    const finalCounselingModel = getCounselingCoachModel();
    if (finalMoodModel || finalCounselingModel) {
      logger.info(`⚠️ Model preload completed with partial loading after ${attempts} attempts:`);
      logger.info(`  - Mood tracker: ${finalMoodModel ? "✓" : "✗"}`);
      logger.info(`  - Counseling coach: ${finalCounselingModel ? "✓" : "✗"}`);
      logger.info(`  - Some AI features may be available.`);
      return true;
    } else {
      if (networkErrorDetected) {
        logger.warn(`⚠️ AI models unavailable after ${attempts} attempts: No internet connection.`);
        logger.warn("⚠️ Connect to internet to enable AI features. App uses rule-based responses.");
      } else {
        logger.warn(`⚠️ AI models unavailable after ${attempts} attempts. Will continue retrying in background.`);
      }
    }
    return false;
  } catch (error) {
    logger.error("[MODEL_DEBUG] preloadModels() caught unexpected error:", error);
    return false;
  }
}
async function areModelsCurrent() {
  try {
    const versionKey = `ai-models-version-${selectedModel}`;
    const storedVersion = localStorage.getItem(versionKey);
    if (!storedVersion) {
      return false;
    }
    const versionData = JSON.parse(storedVersion);
    const { timestamp, modelPath } = versionData;
    const daysSinceUpdate = (Date.now() - timestamp) / (1e3 * 60 * 60 * 24);
    if (daysSinceUpdate > 7) {
      logger.info(`[MODEL_VERSION] Models are ${Math.round(daysSinceUpdate)} days old - checking for updates...`);
      return false;
    }
    const currentModelPath = MODEL_CONFIGS[selectedModel].path;
    if (modelPath !== currentModelPath) {
      logger.info(`[MODEL_VERSION] Model path changed from ${modelPath} to ${currentModelPath} - update needed`);
      return false;
    }
    return true;
  } catch (error) {
    logger.warn("[MODEL_VERSION] Error checking model version:", error);
    return true;
  }
}
function updateModelVersion() {
  try {
    const versionKey = `ai-models-version-${selectedModel}`;
    const versionData = {
      timestamp: Date.now(),
      modelPath: MODEL_CONFIGS[selectedModel].path,
      modelType: selectedModel
    };
    localStorage.setItem(versionKey, JSON.stringify(versionData));
    logger.info(`[MODEL_VERSION] Updated version info for ${selectedModel}`);
  } catch (error) {
    logger.warn("[MODEL_VERSION] Error updating model version:", error);
  }
}
async function verifyModelsWork() {
  try {
    const moodModel = getMoodTrackerModel();
    const counselingModel = getCounselingCoachModel();
    if (!moodModel && !counselingModel) {
      logger.info("[MODEL_VERIFY] No models loaded to verify");
      return false;
    }
    let moodWorks = false;
    let counselingWorks = false;
    if (moodModel) {
      try {
        logger.info("[MODEL_VERIFY] Testing mood tracker model...");
        const testText = "I feel happy and grateful today";
        const testResult = await Promise.race([
          moodModel(testText),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Test timeout")), 5e3))
        ]);
        if (testResult !== null && testResult !== void 0) {
          moodWorks = true;
          logger.info("[MODEL_VERIFY] ✓ Mood tracker model works");
        } else {
          logger.warn("[MODEL_VERIFY] ✗ Mood tracker returned invalid result");
        }
      } catch (error) {
        logger.warn("[MODEL_VERIFY] ✗ Mood tracker test failed:", error instanceof Error ? error.message : String(error));
      }
    } else {
      logger.info("[MODEL_VERIFY] Mood tracker model not loaded");
    }
    if (counselingModel) {
      try {
        logger.info("[MODEL_VERIFY] Testing counseling coach model...");
        const testPrompt = "Test prompt for counseling model";
        const testResult = await Promise.race([
          counselingModel(testPrompt, { max_new_tokens: 10, temperature: 0.7 }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Test timeout")), 1e4))
        ]);
        if (testResult && (Array.isArray(testResult) && testResult.length > 0 && testResult[0]?.generated_text || typeof testResult === "object" && testResult.generated_text)) {
          counselingWorks = true;
          logger.info("[MODEL_VERIFY] ✓ Counseling coach model works");
        } else {
          logger.warn("[MODEL_VERIFY] ✗ Counseling coach returned invalid result");
        }
      } catch (error) {
        logger.warn("[MODEL_VERIFY] ✗ Counseling coach test failed:", error instanceof Error ? error.message : String(error));
      }
    } else {
      logger.info("[MODEL_VERIFY] Counseling coach model not loaded");
    }
    const result = (moodModel ? moodWorks : true) && (counselingModel ? counselingWorks : true);
    if (result) {
      logger.info("[MODEL_VERIFY] ✓ All loaded models verified and working");
    } else {
      logger.warn("[MODEL_VERIFY] ✗ Some models failed verification");
    }
    return result;
  } catch (error) {
    logger.error("[MODEL_VERIFY] Error during model verification:", error);
    return false;
  }
}
function areModelsLoaded(requireBoth = true) {
  if (requireBoth) {
    return moodTrackerModel !== null && counselingCoachModel !== null;
  }
  return moodTrackerModel !== null || counselingCoachModel !== null;
}
function getModelStatus() {
  return {
    loaded: areModelsLoaded(),
    loading: isModelLoading,
    moodTracker: moodTrackerModel !== null,
    counselingCoach: counselingCoachModel !== null,
    compatibility: compatibilityReport || void 0,
    errorCategory: lastErrorCategory
  };
}
function getCompatibilityReport() {
  return compatibilityReport;
}
const models = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MODEL_CONFIGS,
  areModelsLoaded,
  clearModels,
  getCompatibilityReport,
  getCounselingCoachModel,
  getIsModelLoading,
  getModelStatus,
  getMoodTrackerModel,
  initializeModels,
  isTextGenerationModel,
  preloadModels
}, Symbol.toStringTag, { value: "Module" }));
function detectCrisis(text, lcswConfig) {
  const lowerText = text.toLowerCase();
  const detectedPhrases = [];
  const detectedCategories = [];
  let maxSeverity = "low";
  for (const crisisPhrase of ALL_CRISIS_PHRASES) {
    if (lowerText.includes(crisisPhrase.phrase)) {
      detectedPhrases.push(crisisPhrase.phrase);
      if (!detectedCategories.includes(crisisPhrase.category)) {
        detectedCategories.push(crisisPhrase.category);
      }
      if (crisisPhrase.severity === "critical") {
        maxSeverity = "critical";
      } else if (crisisPhrase.severity === "high" && maxSeverity !== "critical") {
        maxSeverity = "high";
      } else if (crisisPhrase.severity === "moderate" && maxSeverity === "low") {
        maxSeverity = "moderate";
      }
    }
  }
  const hasModerateRisk = detectedCategories.some(
    (cat) => cat === "RISK_SEVERE_HOPELESSNESS" || cat === "RISK_BEHAVIORAL_RED_FLAGS"
  );
  const hasCrisisCategory = detectedCategories.some(
    (cat) => cat.startsWith("CRISIS_")
  );
  if (hasModerateRisk && hasCrisisCategory && maxSeverity === "moderate") {
    maxSeverity = "high";
  }
  const isCrisis = detectedPhrases.length > 0;
  let recommendedAction = "continue";
  if (maxSeverity === "critical") {
    recommendedAction = "emergency";
  } else if (maxSeverity === "high" || detectedCategories.includes("CRISIS_SELF_HARM") || detectedCategories.includes("CRISIS_THIRD_PARTY_SUICIDE_RISK")) {
    recommendedAction = "contact_lcsw";
  } else if (isCrisis) {
    recommendedAction = "show_crisis_info";
  }
  return {
    isCrisis,
    severity: maxSeverity,
    detectedPhrases,
    recommendedAction,
    categories: detectedCategories
  };
}
function formatAnalysisForReport(analysis) {
  if (!analysis) return "";
  let content = analysis;
  if (typeof content === "string") {
    if (content.trim().startsWith("{") || content.trim().startsWith("[")) {
      try {
        content = JSON.parse(content);
      } catch (e) {
      }
    }
  }
  if (typeof content === "object" && content !== null) {
    const { coreThemes, lcswLens, reflectiveInquiry, sessionPrep } = content;
    let text = "";
    if (coreThemes && Array.isArray(coreThemes) && coreThemes.length > 0) {
      text += `Core Themes: ${coreThemes.join(", ")}
`;
    }
    if (lcswLens) {
      let cleanedLens = lcswLens;
      const repetitivePattern = /(The LCSW Lens is a ['"]LCSW Lens['"].*?)(?:\1){2,}/gi;
      if (repetitivePattern.test(cleanedLens)) {
        const match = cleanedLens.match(/(The LCSW Lens is a ['"]LCSW Lens['"].*?)(?:\1)/i);
        if (match) {
          cleanedLens = match[1].trim();
        } else {
          cleanedLens = cleanedLens.split(/The LCSW Lens is a ['"]LCSW Lens['"]/i)[0] + cleanedLens.match(/The LCSW Lens is a ['"]LCSW Lens['"]([^T]*?)(?=The LCSW Lens|$)/i)?.[1] || "";
        }
      }
      const phrases = cleanedLens.split(/\.\s+/);
      const uniquePhrases = [];
      const seenPhrases = /* @__PURE__ */ new Set();
      for (const phrase of phrases) {
        const normalized = phrase.trim().toLowerCase();
        const isDuplicate = Array.from(seenPhrases).some((seen2) => {
          const similarity = normalized.length > 0 && seen2.length > 0 ? normalized.split(" ").filter((w) => seen2.includes(w)).length / Math.max(normalized.split(" ").length, seen2.split(" ").length) : 0;
          return similarity > 0.8;
        });
        if (!isDuplicate && phrase.trim().length > 10) {
          uniquePhrases.push(phrase.trim());
          seenPhrases.add(normalized);
        }
      }
      cleanedLens = uniquePhrases.join(". ").trim();
      if (cleanedLens.length > 20) {
        text += `LCSW Lens: ${cleanedLens}
`;
      }
    }
    if (reflectiveInquiry && Array.isArray(reflectiveInquiry) && reflectiveInquiry.length > 0) {
      text += `Inquiry: ${reflectiveInquiry.join(" ")}
`;
    }
    if (sessionPrep) {
      text += `Session Prep: ${sessionPrep}
`;
    }
    return text.trim();
  }
  if (typeof content === "string") {
    return content.replace(/\\n/g, "\n").replace(/([a-z0-9])n-/gi, "$1\n-").replace(/n##/g, "\n##").replace(/nn##/g, "\n\n##");
  }
  return String(content);
}
function generateFallbackReport(logs, values, goals) {
  const valueCounts = {};
  const moodCounts = {};
  logs.forEach((log) => {
    const valueName = values.find((v) => v.id === log.valueId)?.name || "Unknown";
    valueCounts[valueName] = (valueCounts[valueName] || 0) + 1;
    if (log.mood) {
      moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    }
  });
  const topValue = Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const logsByDay = {};
  logs.forEach((log) => {
    const dayKey = log.date.split("T")[0];
    if (!logsByDay[dayKey]) {
      logsByDay[dayKey] = [];
    }
    logsByDay[dayKey].push(log);
  });
  let detailedEntries = "";
  const days = Object.keys(logsByDay).sort().reverse().slice(0, 14);
  days.forEach((day) => {
    const dayLogs = logsByDay[day];
    const date = new Date(day).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    detailedEntries += `

**${date}**
`;
    dayLogs.forEach((log) => {
      const value = values.find((v) => v.id === log.valueId);
      detailedEntries += `
*${value?.name || "General"}*
`;
      if (log.mood) detailedEntries += `Mood: ${log.mood} `;
      if (log.emotionalState) detailedEntries += `Emotional State: ${log.emotionalState} `;
      if (log.selectedFeeling) detailedEntries += `Feeling: ${log.selectedFeeling}`;
      detailedEntries += "\n";
      if (log.deepReflection) {
        detailedEntries += `
Deep Reflection:
${log.deepReflection}
`;
      }
      if (log.goalText) {
        const isCompleted = log.type === "goal-completion";
        detailedEntries += `
${isCompleted ? "✅ COMPLETED " : ""}Committed Action/Goal:
${log.goalText}
`;
      }
      if (log.reflectionAnalysis) {
        detailedEntries += `
Suggested Next Steps:
${formatAnalysisForReport(log.reflectionAnalysis)}
`;
      }
    });
  });
  if (goals && goals.length > 0) {
    const completedGoals = goals.filter((g) => g.completed);
    const activeGoals = goals.filter((g) => !g.completed);
    detailedEntries += "\n\n**Goals Summary**\n";
    if (completedGoals.length > 0) {
      detailedEntries += `
Completed Goals (${completedGoals.length}):
`;
      completedGoals.forEach((goal) => {
        const valueName = values.find((v) => v.id === goal.valueId)?.name || "General";
        detailedEntries += `  ✅ ${valueName}: ${goal.text}
`;
      });
    }
    if (activeGoals.length > 0) {
      detailedEntries += `
Active Goals (${activeGoals.length}):
`;
      activeGoals.forEach((goal) => {
        const valueName = values.find((v) => v.id === goal.valueId)?.name || "General";
        detailedEntries += `  📋 ${valueName}: ${goal.text} (${goal.frequency})
`;
      });
    }
  }
  const dateRange = logs.length > 0 ? `${new Date(logs[logs.length - 1]?.date || Date.now()).toLocaleDateString()} to ${new Date(logs[0]?.date || Date.now()).toLocaleDateString()}` : "No date range";
  return `═══════════════════════════════════════════════════════════════
# SOAP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
Mood indicators show: ${topMood} as most common. Client has logged ${logs.length} reflection entries across ${Object.keys(valueCounts).length} values.

## Subjective
Client has logged ${logs.length} reflection entries, with primary focus on ${topValue}. Most common mood indicator: ${topMood}.${detailedEntries}

## Objective
Patterns show engagement with value-based reflection practice. Entries span ${dateRange}. Total entries: ${logs.length}, Values engaged: ${Object.keys(valueCounts).length}.

## Assessment
Client is actively engaging in self-reflection and value alignment work. Consistent practice observed with mood tracking and goal setting.

## Plan
Continue value-based reflection. Review patterns with LCSW in next session. Maintain current engagement level.

═══════════════════════════════════════════════════════════════
# DAP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
Mood indicators show: ${topMood} as most common. Client has logged ${logs.length} reflection entries across ${Object.keys(valueCounts).length} values.

## Data
${logs.length} entries, ${Object.keys(valueCounts).length} values engaged, mood tracking active. Date range: ${dateRange}.${detailedEntries}

## Assessment
Consistent engagement with reflection practice. Primary value focus: ${topValue}. Active mood monitoring and goal tracking observed.

## Plan
Maintain current practice. Discuss themes and patterns with LCSW. Continue value-based reflection work.

═══════════════════════════════════════════════════════════════
# BIRP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
Mood indicators show: ${topMood} as most common. Client has logged ${logs.length} reflection entries across ${Object.keys(valueCounts).length} values.

## Behavior
Client consistently logs reflections and tracks mood states. Engages with value-based practice regularly.${detailedEntries}

## Intervention
Value-based reflection practice, self-monitoring, mood tracking, goal setting and completion.

## Response
Active engagement, ${logs.length} entries completed. Consistent practice maintained. Positive engagement with therapeutic tools.

## Plan
Continue practice, review with LCSW. Maintain current engagement level. Monitor progress and adjust goals as needed.

═══════════════════════════════════════════════════════════════

*This is a basic summary. For detailed analysis, please review entries manually or discuss with your LCSW.*`;
}
async function generateHumanReports(logs, values, lcswConfig, goals) {
  try {
    if (logs.length === 0) {
      return "No logs available for synthesis.";
    }
    const allText = logs.map((l) => l.note).filter(Boolean).join(" ");
    const crisisCheck = detectCrisis(allText, lcswConfig);
    if (crisisCheck.isCrisis && crisisCheck.severity === "critical") {
      const emergencyContact = lcswConfig?.emergencyContact;
      const therapistContact = emergencyContact ? `${emergencyContact.name || "Your therapist"}: ${emergencyContact.phone}` : "Your therapist or healthcare provider";
      return `# 🚨 SAFETY CONCERN DETECTED IN LOGS

**Your safety is the priority.** These logs contain language that suggests you may be thinking about ending your life or hurting yourself.

**If you are in immediate danger or feel you might act on thoughts of suicide, please contact emergency services (911 in the U.S.) or the 988 Suicide & Crisis Lifeline right now.**

**This app cannot help in an emergency. If you are about to harm yourself, please call 911 or 988, or your local emergency number, immediately.**

**Please also reach out to someone you trust right now**—a close friend, family member, or someone who can be with you. You don't have to go through this alone.

**Resources available right now:**
• **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)
• **Crisis Text Line** - Text HOME to 741741
• **Emergency Services** - 911 (U.S.) or your local emergency number
• **Your Therapist**: ${therapistContact}

---

# Clinical Summary

Due to safety concerns detected in these logs, a full clinical summary should be reviewed with your LCSW or mental health professional in person.

*Feeling suicidal is a medical and emotional emergency, not a personal failure. You deserve support, and help is available.*`;
    }
    const counselingCoachModel2 = getCounselingCoachModel();
    if (!counselingCoachModel2) {
      const modelsLoaded = await initializeModels();
      if (!modelsLoaded) {
        const fallbackReport = generateFallbackReport(logs, values, goals);
        const disclaimer2 = `

---

*This report was generated using rule-based analysis. All processing happens on your device for privacy.*`;
        return `${fallbackReport}${disclaimer2}`;
      }
    }
    const moodCounts = {};
    const emotionalStateCounts = {};
    const feelingCounts = {};
    logs.forEach((l) => {
      if (l.mood) {
        moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
      }
      if (l.emotionalState) {
        emotionalStateCounts[l.emotionalState] = (emotionalStateCounts[l.emotionalState] || 0) + 1;
      }
      if (l.selectedFeeling) {
        feelingCounts[l.selectedFeeling] = (feelingCounts[l.selectedFeeling] || 0) + 1;
      }
    });
    let moodTrendText = "Mood Indicators:\n";
    if (Object.keys(moodCounts).length > 0) {
      moodTrendText += Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).map(([mood, count]) => `  ${mood}: ${count} entries`).join("\n");
    }
    if (Object.keys(emotionalStateCounts).length > 0) {
      moodTrendText += "\n\nEmotional States:\n";
      moodTrendText += Object.entries(emotionalStateCounts).sort((a, b) => b[1] - a[1]).map(([state, count]) => `  ${state}: ${count} entries`).join("\n");
    }
    if (Object.keys(feelingCounts).length > 0) {
      moodTrendText += "\n\nSelected Feelings:\n";
      moodTrendText += Object.entries(feelingCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([feeling, count]) => `  ${feeling}: ${count} entries`).join("\n");
    }
    const logsByDay = {};
    logs.forEach((l) => {
      const dayKey = l.date.split("T")[0];
      if (!logsByDay[dayKey]) {
        logsByDay[dayKey] = [];
      }
      logsByDay[dayKey].push(l);
    });
    const days = Object.keys(logsByDay).sort().reverse();
    const summary = days.map((day) => {
      const dayLogs = logsByDay[day];
      const date = new Date(day).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      let daySummary = `
=== ${date} ===
`;
      dayLogs.forEach((l) => {
        const vName = values.find((v) => v.id === l.valueId)?.name || "General";
        daySummary += `
[${l.date.split("T")[1]?.substring(0, 5) || "Time unknown"}] Value: ${vName}`;
        if (l.mood) daySummary += `, Mood: ${l.mood}`;
        if (l.emotionalState) daySummary += `, Emotional State: ${l.emotionalState}`;
        if (l.selectedFeeling) daySummary += `, Feeling: ${l.selectedFeeling}`;
        daySummary += "\n";
        if (l.deepReflection) {
          daySummary += `  Deep Reflection: ${l.deepReflection.substring(0, 500)}${l.deepReflection.length > 500 ? "..." : ""}
`;
        }
        if (l.goalText) {
          daySummary += `  Committed Action/Goal: ${l.goalText}
`;
        }
        if (l.type === "goal-completion" && l.goalText) {
          daySummary += `  ✅ GOAL COMPLETED: ${l.goalText}
`;
        }
        if (l.reflectionAnalysis) {
          const analysis = formatAnalysisForReport(l.reflectionAnalysis);
          daySummary += `  Suggested Next Steps: ${analysis.substring(0, 300)}${analysis.length > 300 ? "..." : ""}
`;
        }
        if (l.note && !l.deepReflection && l.type !== "goal-completion") {
          daySummary += `  Note: ${l.note.substring(0, 200)}${l.note.length > 200 ? "..." : ""}
`;
        }
      });
      return daySummary;
    }).join("\n");
    let completedGoalsText = "";
    if (goals && goals.length > 0) {
      const completedGoals = goals.filter((g) => g.completed);
      const activeGoals = goals.filter((g) => !g.completed);
      if (completedGoals.length > 0) {
        completedGoalsText = "\n\nCompleted Goals:\n";
        completedGoals.forEach((goal) => {
          const valueName = values.find((v) => v.id === goal.valueId)?.name || "General";
          completedGoalsText += `  ✅ [${valueName}] ${goal.text} (Completed ${new Date(goal.createdAt).toLocaleDateString()})
`;
        });
      }
      if (activeGoals.length > 0) {
        completedGoalsText += "\nActive Goals:\n";
        activeGoals.forEach((goal) => {
          const valueName = values.find((v) => v.id === goal.valueId)?.name || "General";
          completedGoalsText += `  📋 [${valueName}] ${goal.text} (${goal.frequency})
`;
        });
      }
    }
    const prompt = `Generate a clinical report for therapist review. Format as THREE SEPARATE TEMPLATES: SOAP, DAP, and BIRP.

MOOD TRENDS DATA:
${moodTrendText}${completedGoalsText}

DAILY ACTIVITY LOGS (organized by date):
${summary}

OUTPUT FORMAT REQUIREMENTS:
Generate THREE separate, complete reports using these exact templates:

═══════════════════════════════════════════════════════════════
# SOAP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
[Analyze the mood trends data provided above - include patterns, shifts, and insights]

## Subjective
[Client's reported experiences, feelings, reflections organized by day. Include:
- Daily reflections and what they worked on
- Emotional states and feelings
- Goals committed to and completed
- Patterns over time]

## Objective
[Observable data and patterns:
- Number of entries, date range
- Mood indicators and emotional state patterns
- Goal completion rates
- Engagement patterns]

## Assessment
[Clinical interpretation:
- Themes and patterns identified
- Progress observed
- Areas of focus
- Connection to treatment goals]

## Plan
[Recommendations for continued work:
- Suggested focus areas
- Goals to maintain or adjust
- Therapeutic considerations]

═══════════════════════════════════════════════════════════════
# DAP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
[Analyze the mood trends data provided above - include patterns, shifts, and insights]

## Data
[Factual information from logs:
- Daily activities organized by date
- Reflections, goals, emotional states
- Completed goals and progress
- Engagement metrics]

## Assessment
[Clinical assessment:
- Patterns in mood and emotional states
- Progress toward goals
- Themes in reflections
- Strengths and areas for growth]

## Plan
[Next steps and recommendations:
- Continued focus areas
- Goal adjustments if needed
- Therapeutic interventions to consider]

═══════════════════════════════════════════════════════════════
# BIRP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
[Analyze the mood trends data provided above - include patterns, shifts, and insights]

## Behavior
[Observed behaviors and activities:
- Daily reflection practices
- Goal-setting and completion behaviors
- Engagement with values
- Self-monitoring activities]

## Intervention
[Therapeutic interventions and strategies:
- Value-based reflection practice
- Goal-setting and tracking
- Mood monitoring
- Self-advocacy activities]

## Response
[Client's response to interventions:
- Mood and emotional state changes
- Goal completion rates
- Engagement levels
- Progress indicators]

## Plan
[Future planning:
- Maintain current practices
- Adjust goals as needed
- Continue monitoring
- Therapeutic considerations]

═══════════════════════════════════════════════════════════════

CRITICAL: 
- Each format must be COMPLETE and STANDALONE
- Include mood trends analysis in EACH format
- Organize daily content clearly showing what client worked on each day
- Mark completed goals clearly with ✅
- Use clear headings and spacing for readability
- Tone: Supportive, clinical, human`;
    let report = generateFallbackReport(logs, values, goals);
    let currentCounselingCoachModel = getCounselingCoachModel();
    if (!currentCounselingCoachModel) {
      const isModelLoading2 = getIsModelLoading();
      if (isModelLoading2) {
        const maxWaitTime = 3e4;
        const startTime = Date.now();
        while (!currentCounselingCoachModel && Date.now() - startTime < maxWaitTime) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          currentCounselingCoachModel = getCounselingCoachModel();
        }
      } else {
        await initializeModels();
        currentCounselingCoachModel = getCounselingCoachModel();
      }
    }
    if (currentCounselingCoachModel && isTextGenerationModel(currentCounselingCoachModel)) {
      try {
        console.log("🤖 Using on-device AI model for report generation...");
        const startTime = performance.now();
        const result = await currentCounselingCoachModel(prompt, {
          max_new_tokens: 2e3,
          // Increased for comprehensive three-format reports
          temperature: 0.3,
          // Lower temperature to reduce repetition
          do_sample: true,
          repetition_penalty: 1.3
          // Penalize repetition
        });
        const endTime = performance.now();
        const generatedText = result[0]?.generated_text || "";
        console.log("🔍 Raw AI report response (first 500 chars):", generatedText.substring(0, 500));
        let extracted = generatedText.replace(prompt, "").trim();
        if (extracted.length < 100) {
          extracted = generatedText.split(/Generate a comprehensive report|You are a therapy integration|OUTPUT FORMAT REQUIREMENTS|MOOD TRENDS DATA|DAILY ACTIVITY LOGS/i)[1] || generatedText;
          extracted = extracted.trim();
        }
        extracted = extracted.replace(/OUTPUT FORMAT REQUIREMENTS:[\s\S]*?═══════════════════════════════════════════════════════════════/i, "").trim();
        const sentences = extracted.split(/([.!?]\s+)/);
        const uniqueSentences = [];
        const recentSentences = [];
        const WINDOW_SIZE = 5;
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];
          if (/[.!?]\s+/.test(sentence)) {
            if (uniqueSentences.length > 0) {
              uniqueSentences.push(sentence);
            }
            continue;
          }
          const normalized = sentence.trim().toLowerCase();
          if (normalized.length < 20) {
            uniqueSentences.push(sentence);
            continue;
          }
          const isDuplicate = recentSentences.some((seen2) => {
            const words1 = normalized.split(/\s+/);
            const words2 = seen2.split(/\s+/);
            const commonWords = words1.filter((w) => words2.includes(w)).length;
            const similarity = commonWords / Math.max(words1.length, words2.length);
            return similarity > 0.85;
          });
          if (!isDuplicate) {
            uniqueSentences.push(sentence);
            recentSentences.push(normalized);
            if (recentSentences.length > WINDOW_SIZE) {
              recentSentences.shift();
            }
          }
        }
        extracted = uniqueSentences.join("").trim();
        extracted = extracted.replace(/(The LCSW Lens is a ['"]LCSW Lens['"].*?)(?:\1){2,}/gi, (match, first) => first);
        extracted = extracted.replace(/The LCSW Lens is a ['"]LCSW Lens['"]/gi, "The LCSW Lens analysis indicates");
        const hasReportContent = extracted.includes("SOAP") || extracted.includes("DAP") || extracted.includes("BIRP") || extracted.includes("Subjective") || extracted.includes("Assessment") || extracted.length > 200;
        if (extracted && extracted.length > 50 && hasReportContent) {
          report = extracted;
          console.log(`✅ On-device AI generated report (${Math.round(endTime - startTime)}ms)`);
        } else {
          console.warn("⚠️ AI model returned insufficient report content, using fallback");
          console.warn("Extracted length:", extracted.length, "Has report content:", hasReportContent);
        }
      } catch (error) {
        console.error("❌ On-device AI report generation failed:", error);
        if (error instanceof Error && (error.message.includes("not a function") || error.message.includes("Cannot read"))) {
          await initializeModels(true);
          const reloadedModel = getCounselingCoachModel();
          if (reloadedModel) {
            try {
              const retryResult = await reloadedModel(prompt, {
                max_new_tokens: 2e3,
                // Increased for comprehensive three-format reports
                temperature: 0.3,
                // Lower temperature to reduce repetition
                do_sample: true,
                repetition_penalty: 1.3
                // Penalize repetition
              });
              const retryText = retryResult[0]?.generated_text || "";
              let retryExtracted = retryText.replace(prompt, "").trim();
              const retrySentences = retryExtracted.split(/([.!?]\s+)/);
              const retryUniqueSentences = [];
              const retryRecentSentences = [];
              const WINDOW_SIZE = 5;
              for (let i = 0; i < retrySentences.length; i++) {
                const sentence = retrySentences[i];
                if (/[.!?]\s+/.test(sentence)) {
                  if (retryUniqueSentences.length > 0) {
                    retryUniqueSentences.push(sentence);
                  }
                  continue;
                }
                const normalized = sentence.trim().toLowerCase();
                if (normalized.length < 20) {
                  retryUniqueSentences.push(sentence);
                  continue;
                }
                const isDuplicate = retryRecentSentences.some((seen2) => {
                  const words1 = normalized.split(/\s+/);
                  const words2 = seen2.split(/\s+/);
                  const commonWords = words1.filter((w) => words2.includes(w)).length;
                  const similarity = commonWords / Math.max(words1.length, words2.length);
                  return similarity > 0.85;
                });
                if (!isDuplicate) {
                  retryUniqueSentences.push(sentence);
                  retryRecentSentences.push(normalized);
                  if (retryRecentSentences.length > WINDOW_SIZE) {
                    retryRecentSentences.shift();
                  }
                }
              }
              retryExtracted = retryUniqueSentences.join("").trim();
              retryExtracted = retryExtracted.replace(/(The LCSW Lens is a ['"]LCSW Lens['"].*?)(?:\1){2,}/gi, (match, first) => first);
              if (retryExtracted && retryExtracted.length > 50) {
                report = retryExtracted;
              }
            } catch (retryError) {
              console.warn("Retry report generation failed:", retryError);
            }
          }
        }
      }
    }
    const disclaimer = `

---

*This report is generated on-device for your personal review and discussion with your LCSW. It is not a substitute for professional clinical assessment.*`;
    return report + disclaimer;
  } catch (error) {
    console.error("Report generation error:", error);
    const fallbackReport = generateFallbackReport(logs, values, goals);
    const disclaimer = `

---

*This report was generated using rule-based analysis. All processing happens on your device for privacy.*`;
    return `${fallbackReport}${disclaimer}`;
  }
}
const getUserName = () => {
  try {
    const userStr = localStorage.getItem("user_data");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.name || user.username || "Friend";
    }
  } catch (e) {
  }
  return "Friend";
};
async function generateEmotionalEncouragement(emotion, subEmotion) {
  const userName = getUserName();
  const emotionContext = subEmotion ? `${emotion} (feeling ${subEmotion})` : emotion;
  const prompt = `
    User: ${userName}
    Emotion: ${emotionContext}
    
    Give ${userName} a brief, encouraging message about feeling ${emotionContext}.
    Be supportive and validating. Use "you". Under 50 words.
    ${subEmotion ? `Specifically acknowledge their feeling of ${subEmotion}.` : ""}
  `;
  logger.debug("[generateEmotionalEncouragement] Generating with:", {
    emotion,
    subEmotion,
    emotionContext
  });
  try {
    const response = await generateText(prompt);
    if (typeof response === "object" && "isCrisis" in response) {
      console.warn("[generateEmotionalEncouragement] Crisis detected, using fallback");
      return `Your feelings are valid. Take care of yourself.`;
    }
    const encouragement = response;
    logger.debug("[generateEmotionalEncouragement] Generated encouragement:", encouragement);
    return encouragement;
  } catch (error) {
    logger.error("[generateEmotionalEncouragement] Error generating encouragement:", error);
    return `Your feelings are valid. Take care of yourself.`;
  }
}
const LIMITING_BELIEF_REFRAMER = {
  id: "limiting-belief-reframer",
  name: "Limiting Belief Reframer",
  description: "Identify and deconstruct limiting beliefs using CBT evidence-gathering",
  framework: "Cognitive Behavioral Therapy (CBT)",
  useCase: "When experiencing negative self-beliefs or cognitive distortions",
  systemPrompt: `You are a Logical Investigator and Cognitive Behavioral Coach. Your tone is sharp, objective, and curious. You don't offer empty 'you can do it' talk; you offer the truth.

First, you must secure the room. Your very first message must be: 'Welcome to the Lab. Think of this as an "Off the Record" space—a private vault for the facts. No judgment, just data. This information is safe here, so you can be brutally honest. What is the specific "Limiting Belief" or negative thought we are putting under the microscope today? Type it out exactly as it sounds in your head.'

The Investigation Protocol: Once the user shares the belief, you must follow this chain of thought:
1. Origin Tracing: Ask, 'When did this story start? Was there a specific event that wrote this rule in your mind?'
2. Cross-Examination (The Evidence): Ask for 3 pieces of 'Hard Evidence' that contradict this belief. If the user says 'I have none,' push them to look for 'Micro-Wins' or exceptions to the rule.
3. The Verdict (Balanced Thought): Help the user synthesize the original belief and the new evidence into a 'Balanced Thought.' This thought must be 100% based on facts, not wishful thinking. (e.g., instead of 'I am a failure,' it becomes 'I failed at this specific task, but I have successfully completed 5 others this week.')

The Constraint: You are a detective, not a cheerleader. If the user gives a vague answer, ask a clarifying follow-up question. Wait for their input after every step.`
};
const INNER_CRITIC_TRANSLATOR = {
  id: "inner-critic-translator",
  name: "Inner Critic Translator",
  description: "Translate harsh self-criticism into protective intent using IFS",
  framework: "Internal Family Systems (IFS) / Self-Compassion",
  useCase: "When experiencing harsh self-criticism or negative self-talk",
  systemPrompt: `You are an expert in Internal Family Systems (IFS) and self-compassion. Your tone is calm, analytical, and deeply supportive—like a trusted confidant who remains objective.

First, you must establish safety. Your very first message to the user must be: 'I've got the floor ready for you. Whatever is weighing on you—messy, loud, or quiet—this is the place to leave it. This is a digital cul-de-sac; your words stay here, encrypted and unjudged. We don't sell your feelings; we just help you navigate them. What's the "Inner Critic" saying to you right now?'

Once the user responds: Your role is not to argue with the critic, but to 'translate' its harshness into its original mission. Every harsh thought has a 'protective intent'—it is trying to prevent a specific fear from coming true.

For every thought shared, you must:
1. Validate the discomfort: Acknowledge how heavy that thought feels.
2. Identify the Fear: What specific catastrophe is this critic trying to protect the user from?
3. The Functional Response: Suggest a way to address that underlying fear with logic rather than self-attack.

Speak as a calm guide. Do not offer generic 'be kind to yourself' advice. Focus on the mechanics of the fear. Wait for the user's input before moving to the next step.`
};
const IMPOSTOR_SYNDROME_REFRAMER = {
  id: "impostor-syndrome-reframer",
  name: "Impostor Syndrome Reframer",
  description: "Build competence evidence and reframe challenges as growth edges",
  framework: "Performance Psychology / Growth Mindset",
  useCase: "When feeling like a fraud or that success is luck-based",
  systemPrompt: `You are a Performance Psychologist and Success Auditor. Your tone is high-energy, respectful, and rigorously objective. You believe that feelings are valid, but facts are final.

First, you must create a secure perimeter. Your very first message must be: 'Welcome to the private Archive. This is an "Off the Record" session where we look at the raw data of your career and life. No social masks are required here; this information is safe, encrypted, and for your eyes only. We're here to conduct a "Competence Audit" because your brain is currently filtering out your wins. What is the specific achievement or role that is making you feel like a "fraud" today?'

The Audit Protocol: Once the user shares their situation, do not offer empty praise. Instead, execute these steps:
1. Extract 'Hard Evidence': Ask the user to list 3 specific problems they solved or skills they mastered to reach their current position. If they say 'it was luck,' ask them to describe the work they had to do to be in the position for that luck to happen.
2. External Validation Check: Ask the user to recall a specific piece of objective, positive feedback or a metric (a grade, a promotion, a thank you) that they didn't give themselves.
3. The Growth Reframe: Help them identify their 'Growth Edge.' Explain that feeling like an impostor often just means they are operating outside their comfort zone—which is where learning happens.

The Constraint: Act like a coach reviewing game tape. You are looking for proof of skill. Wait for the user to provide their 'Evidence' before moving to the next audit step.`
};
const EMOTIONAL_REGULATION_COACH = {
  id: "emotional-regulation-coach",
  name: "Emotional Regulation Coach",
  description: "Help name emotions precisely and suggest context-appropriate grounding",
  framework: "Window of Tolerance / Grounding Techniques",
  useCase: "When feeling overwhelmed, dysregulated, or emotionally flooded",
  systemPrompt: `You are an Emotional Regulation Coach specializing in the 'Window of Tolerance.' You are calm, direct, and grounded. Your voice is the steady anchor in a storm.

First, you must stabilize the user. Your very first message must be immediate and grounding: 'I'm right here with you. This is a safe harbor where the pressure ends. Before we dive into the "why," let's steady the "now." Take a second to feel your feet on the floor or your back against the chair. You are safe, and this space is private. To help me guide you: Where are you right now (at work, home, in public?) and on a scale of 1-10, how loud is the overwhelm?'

The Strategy: Once the user provides context, use the 'Name it to Tame it' technique. Do not give generic 'take a deep breath' advice. Instead:
1. Granularity Check: Help them move from a broad feeling (e.g., 'I'm stressed') to a specific emotion (e.g., 'I am feeling overlooked' or 'I am feeling frantic').
2. Environment-Specific Grounding: Suggest 2-3 grounding techniques based only on their location. (e.g., if at work, suggest 'box breathing' or 'clenching toes'; if at home, suggest 'cold water on the face').
3. Assess the Window: If they are at a 9 or 10 (Hyper-arousal), keep your sentences short and commands clear. If they are at a 4 or 5, move toward reflective dialogue.

The Constraint: Always wait for the user to respond to the grounding exercise before moving to the 'logical investigation' of the emotion.`
};
const LONELINESS_REFRAMER = {
  id: "loneliness-reframer",
  name: "Loneliness Reframer",
  description: "Differentiate solitude from loneliness and build connection inventory",
  framework: "Social Wellness / Connection Inventory",
  useCase: "When feeling lonely or isolated",
  systemPrompt: `You are a Social Wellness Guide and Connection Architect. Your tone is warm, empathetic, and expansive. You don't offer generic 'go join a club' advice; you help the user map their social landscape and reclaim their time alone.

First, you must provide a sanctuary. Your very first message must be: 'I've opened up a quiet space just for us. This is a "Safe Harbor"—a private, off-the-record corner where you don't have to "perform" or pretend you're busy. Your feelings here are safe and strictly confidential. Loneliness is just a signal that a need isn't being met, not a flaw in who you are. To start: Does this feel like "Painful Isolation" (feeling disconnected from others) or "Empty Solitude" (feeling disconnected from yourself)?'

The Transformation Protocol: Once the user describes their feeling, guide them through these steps:
1. Differentiate the signal: Explain the 'Social Nutrition' framework. Just as we need different vitamins, we need different types of connection (Intimate, Relational, and Collective). Ask: 'Which "vitamin" feels most missing right now?'
2. The Connection Inventory: Ask the user to identify 2 'Micro-Connections'—low-stakes interactions (a text, a wave to a neighbor, a brief chat with a cashier) that they could engage in today to break the silence.
3. The Self-Date Design: If the user is physically alone, help them reframe 'Isolation' into 'Productive Solitude.' Ask: 'If you were hosting your favorite person in the world today, what one high-quality activity would you plan? Can we plan that for you?'

The Constraint: You are a bridge-builder. You must validate the pain of loneliness first before suggesting any action. Wait for the user to tell you which 'vitamin' is missing before suggesting the inventory.`
};
const GRATITUDE_JOURNAL_COACH = {
  id: "gratitude-journal-coach",
  name: "Gratitude Journal Coach",
  description: "Deep gratitude practice with specificity techniques",
  framework: "Positive Psychology / Three Good Things Method",
  useCase: "When wanting to practice gratitude with depth and specificity",
  systemPrompt: `You are a Positive Psychology Coach and Neural Strength Trainer. Your tone is energetic, disciplined, and insightful. You treat gratitude not as a sentiment, but as a rigorous cognitive skill.

First, you must establish the training ground. Your very first message must be: 'Welcome to the Strength Lab. This is your "Private Training Ground"—a secure, off-the-record space to rewire your brain's perspective. No one else sees these reps; this is strictly for your mental baseline. We aren't here for "fluff"; we're here to hunt for the specific data points that prove your day had wins. Are you ready to start today's Neural Rewiring?'

The Training Protocol: Once the user is ready, guide them through the 'Three Good Things' exercise using high specificity. Do not accept vague answers like 'I'm grateful for my health.' Instead, follow these 'Reps':
1. Hunt for Specificity: When a user lists a 'Good Thing,' ask: 'What exactly was your role in that happening?' or 'What was the specific moment that felt best?'
2. Sensory Integration: Ask: 'How did that feel in your body for those few seconds?' (e.g., a warm chest, a sudden smile).
3. Causal Analysis: Ask: 'Why did this happen today instead of not happening?' This helps the user recognize the patterns of goodness in their life.

The Constraint: You are a trainer, not a diary. If the user gives a generic answer, push them for one more layer of detail. Wait for the user to complete one 'Rep' (one good thing) before moving to the next.`
};
const SYSTEM_PROMPTS = {
  "limiting-belief-reframer": LIMITING_BELIEF_REFRAMER,
  "inner-critic-translator": INNER_CRITIC_TRANSLATOR,
  "impostor-syndrome-reframer": IMPOSTOR_SYNDROME_REFRAMER,
  "emotional-regulation-coach": EMOTIONAL_REGULATION_COACH,
  "loneliness-reframer": LONELINESS_REFRAMER,
  "gratitude-journal-coach": GRATITUDE_JOURNAL_COACH
};
function getSystemPrompt(type) {
  return SYSTEM_PROMPTS[type];
}
const ROUTER_SYSTEM_PROMPT = `You are the Triage Director for a mental wellness app. Your only job is to analyze the user's opening statement and categorize it into one of six specific 'Lanes.'

The Categories:
1. CRITIC: User is being mean to themselves, feeling shame, or self-loathing.
2. OVERWHELM: User is panicking, highly stressed, or emotionally flooded.
3. BELIEF: User feels 'stuck,' uses 'always/never' language, or feels they can't change.
4. IMPOSTOR: User feels like a fraud, lucky, or undeserving of success.
5. LONELY: User feels isolated, disconnected, or misunderstood by others.
6. MAINTENANCE: User feels okay but wants to stay positive or practice gratitude.

Your Output Format: You must only output the CATEGORY NAME and a 1-sentence 'Handover' note that bridges the gap.

Example: User: 'I'm terrified I'm going to get fired because I have no idea what I'm doing.' Output: IMPOSTOR | The user is struggling with competence anxiety and needs a success audit.`;
const CATEGORY_TO_FRAMEWORK = {
  "CRITIC": "inner-critic-translator",
  "OVERWHELM": "emotional-regulation-coach",
  "BELIEF": "limiting-belief-reframer",
  "IMPOSTOR": "impostor-syndrome-reframer",
  "LONELY": "loneliness-reframer",
  "MAINTENANCE": "gratitude-journal-coach"
};
function parseRouterResponse(response) {
  try {
    const cleaned = response.trim();
    const parts = cleaned.split("|").map((p) => p.trim());
    if (parts.length < 2) {
      const categoryMatch = cleaned.match(/^(CRITIC|OVERWHELM|BELIEF|IMPOSTOR|LONELY|MAINTENANCE)/i);
      if (categoryMatch) {
        const category2 = categoryMatch[1].toUpperCase();
        const handover2 = cleaned.replace(categoryMatch[0], "").trim();
        return {
          category: category2,
          handover: handover2 || "Routing to appropriate support framework.",
          framework: CATEGORY_TO_FRAMEWORK[category2]
        };
      }
      return null;
    }
    const category = parts[0].toUpperCase();
    const handover = parts.slice(1).join("|").trim();
    if (!CATEGORY_TO_FRAMEWORK[category]) {
      logger.warn("[triageRouter] Invalid category received:", category);
      return null;
    }
    return {
      category,
      handover: handover || "Routing to appropriate support framework.",
      framework: CATEGORY_TO_FRAMEWORK[category]
    };
  } catch (error) {
    logger.error("[triageRouter] Error parsing router response:", error);
    return null;
  }
}
function fallbackKeywordRouting(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  if (lowerMessage.match(/\b(hate myself|self-critical|self-loathing|shame|worthless|disgusting|terrible person)\b/)) {
    return "inner-critic-translator";
  }
  if (lowerMessage.match(/\b(overwhelmed|panicking|stressed|anxious|can't breathe|flooded|chaotic|scattered)\b/)) {
    return "emotional-regulation-coach";
  }
  if (lowerMessage.match(/\b(always|never|can't change|stuck|impossible|will never|always fail)\b/)) {
    return "limiting-belief-reframer";
  }
  if (lowerMessage.match(/\b(fraud|impostor|lucky|don't deserve|fake|pretending|not qualified)\b/)) {
    return "impostor-syndrome-reframer";
  }
  if (lowerMessage.match(/\b(lonely|isolated|alone|disconnected|no one understands|misunderstood|no friends)\b/)) {
    return "loneliness-reframer";
  }
  if (lowerMessage.match(/\b(grateful|gratitude|appreciate|good day|feeling good|positive|practice)\b/)) {
    return "gratitude-journal-coach";
  }
  return "emotional-regulation-coach";
}
async function routeUserInput(userMessage) {
  try {
    logger.debug("[triageRouter] Routing user input:", { messageLength: userMessage.length });
    const routerPrompt = `User: ${userMessage}`;
    const response = await generateText$1(routerPrompt, {
      systemPrompt: ROUTER_SYSTEM_PROMPT,
      temperature: 0.3,
      // Low temperature for more consistent categorization
      maxTokens: 128
      // Short response expected
    });
    const parsed = parseRouterResponse(response);
    if (parsed) {
      logger.info("[triageRouter] Successfully routed to:", parsed.framework);
      return parsed;
    }
    logger.warn("[triageRouter] AI routing failed, using keyword fallback");
    const fallbackFramework = fallbackKeywordRouting(userMessage);
    return {
      category: getCategoryFromFramework(fallbackFramework),
      handover: "Routing to appropriate support framework based on your message.",
      framework: fallbackFramework
    };
  } catch (error) {
    logger.error("[triageRouter] Error in routing:", error);
    const fallbackFramework = fallbackKeywordRouting(userMessage);
    return {
      category: getCategoryFromFramework(fallbackFramework),
      handover: "Routing to appropriate support framework.",
      framework: fallbackFramework
    };
  }
}
function getCategoryFromFramework(framework) {
  const entries = Object.entries(CATEGORY_TO_FRAMEWORK);
  const found = entries.find(([_, f]) => f === framework);
  return found ? found[0] : "OVERWHELM";
}
function getCategoryDisplayName(category) {
  const names = {
    "CRITIC": "Inner Critic",
    "OVERWHELM": "Emotional Regulation",
    "BELIEF": "Limiting Beliefs",
    "IMPOSTOR": "Impostor Syndrome",
    "LONELY": "Loneliness",
    "MAINTENANCE": "Gratitude Practice"
  };
  return names[category] || category;
}
const triageRouter = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getCategoryDisplayName,
  routeUserInput
}, Symbol.toStringTag, { value: "Module" }));
const TOKEN_STORAGE_KEY = "session_tokens";
function getSessionTokens(userId) {
  try {
    const storageKey = `${TOKEN_STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    logger.error("[sessionMemory] Error loading session tokens:", error);
  }
  return [];
}
async function loadLastSessionToken(userId) {
  try {
    const tokens = getSessionTokens(userId);
    if (tokens.length === 0) {
      return null;
    }
    const sorted = tokens.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted[0] || null;
  } catch (error) {
    logger.error("[sessionMemory] Error loading last session token:", error);
    return null;
  }
}
function formatSessionContextForPrompt(token) {
  const date = new Date(token.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  let context = `Welcome back. Last time we talked (${date}), we were working on ${getFrameworkDisplayName(token.framework)}. `;
  context += `Your key breakthrough was: ${token.keyBreakthrough}`;
  if (token.pendingHomework) {
    context += ` You had a pending action: ${token.pendingHomework}`;
  }
  context += ` How has that been feeling since then?`;
  return context;
}
function getFrameworkDisplayName(framework) {
  const names = {
    "inner-critic-translator": "your Inner Critic",
    "emotional-regulation-coach": "emotional regulation",
    "limiting-belief-reframer": "limiting beliefs",
    "impostor-syndrome-reframer": "impostor syndrome",
    "loneliness-reframer": "loneliness and connection",
    "gratitude-journal-coach": "gratitude practice"
  };
  return names[framework] || "your progress";
}
async function continueCounselingSession(session, userMessage) {
  const crisisResponse = await checkForCrisisKeywords(userMessage);
  if (crisisResponse) {
    logger.warn("[specializedCounseling] Crisis detected in continuation");
    return crisisResponse;
  }
  try {
    const conversationHistory = session.messages.map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`).join("\n\n");
    const systemPromptConfig = getSystemPrompt(session.promptType);
    let contextString = "";
    if (session.context) {
      if (session.context.location) {
        contextString += `

Context: I am currently at ${session.context.location}.`;
      }
      if (session.context.emotionalState) {
        contextString += `

Current emotional state: ${session.context.emotionalState}.`;
      }
      if (session.context.additionalInfo) {
        contextString += `

Additional context: ${session.context.additionalInfo}.`;
      }
    }
    const userPrompt = `${conversationHistory}

User: ${userMessage}${contextString}`;
    logger.debug("[specializedCounseling] Continuing session:", {
      promptType: session.promptType,
      messageCount: session.messages.length,
      newMessageLength: userMessage.length
    });
    const response = await generateText$1(userPrompt, {
      systemPrompt: systemPromptConfig.systemPrompt,
      temperature: 0.7,
      maxTokens: 512
    });
    return response;
  } catch (error) {
    logger.error("[specializedCounseling] Error continuing session:", error);
    throw error;
  }
}
async function startCounselingSessionWithTriage(userMessage, context) {
  const crisisResponse = await checkForCrisisKeywords(userMessage);
  if (crisisResponse) {
    logger.warn("[specializedCounseling] Crisis detected in triage, returning safety response");
    return {
      response: crisisResponse,
      framework: "emotional-regulation-coach"
      // Default fallback
    };
  }
  try {
    logger.debug("[specializedCounseling] Routing user input through triage");
    const routerResult = await routeUserInput(userMessage);
    const framework = routerResult.framework;
    logger.info("[specializedCounseling] Routed to framework:", framework, "Handover:", routerResult.handover);
    let sessionContext = "";
    try {
      const { getCurrentUser: getCurrentUser2 } = await __vitePreload(async () => {
        const { getCurrentUser: getCurrentUser3 } = await Promise.resolve().then(() => authService);
        return { getCurrentUser: getCurrentUser3 };
      }, true ? void 0 : void 0);
      const user = await getCurrentUser2();
      if (user?.id) {
        const lastToken = await loadLastSessionToken(user.id);
        if (lastToken && lastToken.framework === framework) {
          sessionContext = formatSessionContextForPrompt(lastToken);
          logger.debug("[specializedCounseling] Loaded session memory for continuity");
        }
      }
    } catch (error) {
      logger.warn("[specializedCounseling] Error loading session memory:", error);
    }
    const systemPromptConfig = getSystemPrompt(framework);
    let contextString = sessionContext ? `

${sessionContext}

` : "";
    if (context) ;
    const userPrompt = `${userMessage}${contextString}`;
    const response = await generateText$1(userPrompt, {
      systemPrompt: systemPromptConfig.systemPrompt,
      temperature: 0.7,
      maxTokens: 512
    });
    return {
      response,
      framework,
      category: routerResult.category,
      handover: routerResult.handover
    };
  } catch (error) {
    logger.error("[specializedCounseling] Error in triage session:", error);
    throw error;
  }
}
const responseCache = /* @__PURE__ */ new Map();
const CACHE_TTL = 5 * 60 * 1e3;
async function generateText(prompt, modelName) {
  const crisisResponse = await checkForCrisisKeywords(prompt);
  if (crisisResponse) {
    logger.warn("[aiService] Crisis keyword detected. Bypassing AI and returning safety response.");
    return Promise.resolve(crisisResponse);
  }
  const cacheKey = `text-generation-${"default"}-${prompt}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.debug("[aiService] Returning cached response");
    return Promise.resolve(cached.data);
  }
  try {
    const { generateText: webllmGenerate } = await __vitePreload(async () => {
      const { generateText: webllmGenerate2 } = await Promise.resolve().then(() => webllmService);
      return { generateText: webllmGenerate2 };
    }, true ? void 0 : void 0);
    const systemPrompt = "You are a compassionate mental health support assistant. Be brief, supportive, and validating. Keep responses under 50 words.";
    const response = await webllmGenerate(prompt, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 256
    });
    responseCache.set(cacheKey, { data: response, timestamp: Date.now() });
    return response;
  } catch (error) {
    logger.error("[aiService] Error generating text with WebLLM:", error);
    error instanceof Error ? error.message : String(error);
    logger.warn("[aiService] WebLLM unavailable, returning fallback response");
    return "I understand you're going through something difficult. Your feelings are valid. Please take care of yourself.";
  }
}
const aiService = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SYSTEM_PROMPTS,
  areModelsLoaded,
  checkBrowserCompatibility,
  clearModels,
  continueCounselingSession,
  detectCrisis,
  generateEmotionalEncouragement,
  generateFallbackReport,
  generateHumanReports,
  generateText,
  getCompatibilityReport,
  getCompatibilitySummary,
  getCounselingCoachModel,
  getIsModelLoading,
  getModelStatus,
  getMoodTrackerModel,
  getSystemPrompt,
  initializeModels,
  isTextGenerationModel,
  preloadModels,
  startCounselingSessionWithTriage
}, Symbol.toStringTag, { value: "Module" }));
export {
  ALL_CRISIS_PHRASES as A,
  getModelStatus as B,
  getCompatibilityReport as C,
  generateEmotionalEncouragement as D,
  EncryptedPWA as E,
  loadLastSessionToken as F,
  startCounselingSessionWithTriage as G,
  continueCounselingSession as H,
  formatSessionContextForPrompt as I,
  authStore$1 as J,
  authService as K,
  models as L,
  triageRouter as M,
  aiService as N,
  __vitePreload as _,
  getUserByEmail as a,
  getUserById as b,
  createUser as c,
  db as d,
  getAllUsers as e,
  createResetToken as f,
  getUserByUsername as g,
  getResetToken as h,
  deleteResetToken as i,
  cleanupExpiredTokens as j,
  getFeelingPatterns as k,
  getProgressMetrics as l,
  getFeelingFrequency as m,
  getCurrentUser as n,
  acceptTerms as o,
  logoutUser as p,
  logger as q,
  getCurrentProgress as r,
  subscribeToProgress as s,
  loginUser as t,
  updateUser as u,
  registerUser as v,
  requestPasswordReset as w,
  resetPasswordWithToken as x,
  getCategoryDisplayName$1 as y,
  generateHumanReports as z
};
