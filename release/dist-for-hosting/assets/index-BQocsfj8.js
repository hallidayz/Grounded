const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ai-services-DJUX-74P.js","assets/db-vendor-CqkAjsCZ.js","assets/vendor-BKChQSPc.js","assets/transformers-CdMs_eeA.js","assets/onnx-eBVVFwq3.js","assets/useAppInitialization-CmNh7W4F.js","assets/react-vendor-BgnRdV3Y.js"])))=>i.map(i=>d[i]);
import { j as jsxRuntimeExports, r as reactExports, R as React, a as ReactDOM } from "./react-vendor-BgnRdV3Y.js";
import { d as db, c as createUser, g as getUserByUsername, a as getUserByEmail, b as getUserById, e as getAllUsers, u as updateUser, f as createResetToken, h as getResetToken, i as deleteResetToken, j as cleanupExpiredTokens, k as getFeelingPatterns, l as getProgressMetrics, m as getFeelingFrequency, _ as __vitePreload, n as getCurrentUser, o as acceptTerms, p as logoutUser, q as logger, E as EncryptedPWA, r as getCurrentProgress, s as subscribeToProgress, t as loginUser, v as registerUser, w as requestPasswordReset, x as resetPasswordWithToken, A as ALL_CRISIS_PHRASES, y as getCategoryDisplayName, z as generateHumanReports, B as getModelStatus, C as getCompatibilityReport, D as generateEmotionalEncouragement, F as loadLastSessionToken, G as startCounselingSessionWithTriage, H as continueCounselingSession, I as formatSessionContextForPrompt } from "./ai-services-DJUX-74P.js";
import { m as motion, A as AnimatePresence } from "./animations-DRv3JgZH.js";
import "./vendor-BKChQSPc.js";
import "./db-vendor-CqkAjsCZ.js";
import "./transformers-CdMs_eeA.js";
import "./onnx-eBVVFwq3.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const ErrorFallback = ({ error, errorInfo, onReset }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-dark-bg-secondary rounded-2xl sm:rounded-3xl border border-border-soft dark:border-dark-border shadow-2xl p-6 sm:p-8 max-w-2xl w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4 sm:space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl sm:text-4xl", children: "⚠️" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl sm:text-2xl font-black text-text-primary dark:text-white mb-2", children: "Something went wrong" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary dark:text-text-secondary text-sm sm:text-base", children: "We encountered an unexpected error. Don't worry, your data is safe." })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-secondary dark:bg-dark-bg-primary rounded-xl p-4 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest mb-2", children: "Error Details" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm text-text-primary dark:text-white font-mono break-all", children: error.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onReset,
          className: "px-6 py-3 sm:py-4 bg-navy-primary dark:bg-navy-primary text-white dark:text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg",
          children: "Try Again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => window.location.reload(),
          className: "px-6 py-3 sm:py-4 bg-bg-primary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-80 transition-all border border-border-soft dark:border-dark-border/30",
          children: "Reload Page"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-tertiary dark:text-text-tertiary", children: "If this problem persists, please contact support." })
  ] }) }) });
};
class ErrorBoundary extends reactExports.Component {
  constructor(props) {
    super(props);
    this.handleReset = () => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    };
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        ErrorFallback,
        {
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          onReset: this.handleReset
        }
      );
    }
    return this.props.children;
  }
}
function isEncryptionEnabled() {
  try {
    return localStorage.getItem("encryption_enabled") === "true";
  } catch (error) {
    console.error("[LegacyAdapter] Error checking encryption status:", error);
    return false;
  }
}
let initializationPromise = null;
let isInitialized = false;
class LegacyAdapter {
  constructor() {
    if (isEncryptionEnabled()) {
      console.warn(
        "[LegacyAdapter] SECURITY WARNING: Encryption is enabled but LegacyAdapter is being used. This should only happen during initialization. PHI data operations will fail."
      );
    }
  }
  async init() {
    if (isInitialized) {
      return;
    }
    if (initializationPromise) {
      return initializationPromise;
    }
    initializationPromise = (async () => {
      try {
        await db.initialize();
        isInitialized = true;
      } catch (error) {
        initializationPromise = null;
        throw error;
      }
    })();
    return initializationPromise;
  }
  async createUser(userData) {
    return createUser(userData);
  }
  async getUserByUsername(username) {
    return getUserByUsername(username);
  }
  async getUserByEmail(email) {
    return getUserByEmail(email);
  }
  async getUserById(userId) {
    return getUserById(userId);
  }
  async getAllUsers() {
    return getAllUsers();
  }
  async updateUser(userId, updates) {
    return updateUser(userId, updates);
  }
  async getAppData(userId) {
    const appData = await db.appData.get(userId);
    return appData?.data || null;
  }
  async saveAppData(userId, data) {
    await db.appData.put({
      userId,
      data
    });
  }
  async createResetToken(userId, email) {
    return createResetToken(userId, email);
  }
  async getResetToken(token) {
    return getResetToken(token);
  }
  async deleteResetToken(token) {
    return deleteResetToken(token);
  }
  async cleanupExpiredTokens() {
    return cleanupExpiredTokens();
  }
  async saveFeelingLog(feelingLog) {
    await db.feelingLogs.put({
      id: feelingLog.id,
      timestamp: feelingLog.timestamp,
      userId: feelingLog.userId,
      emotion: feelingLog.emotionalState,
      subEmotion: feelingLog.selectedFeeling,
      aiResponse: feelingLog.aiResponse,
      isAIResponse: feelingLog.isAIResponse,
      lowStateCount: feelingLog.lowStateCount,
      emotionalState: feelingLog.emotionalState,
      selectedFeeling: feelingLog.selectedFeeling
    });
  }
  async getFeelingLogs(limit, userId) {
    let logs = await db.feelingLogs.orderBy("timestamp").reverse().toArray();
    if (userId) {
      logs = logs.filter((log) => log.userId === userId);
    }
    return limit ? logs.slice(0, limit) : logs;
  }
  async getFirstFeelingLog(userId) {
    let logs = await db.feelingLogs.orderBy("timestamp").toArray();
    if (userId) {
      logs = logs.filter((log) => log.userId === userId);
    }
    return logs.length > 0 ? logs[0] : null;
  }
  async getFeelingLogsByState(emotionalState, limit) {
    let logs = await db.feelingLogs.where("emotionalState").equals(emotionalState).toArray();
    logs.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    return limit ? logs.slice(0, limit) : logs;
  }
  async deleteFeelingLog(logId) {
    await db.feelingLogs.delete(logId);
  }
  async saveUserInteraction(interaction) {
    let userId = interaction.userId;
    if (!userId && interaction.sessionId) {
      try {
        const session = await db.sessions.get(interaction.sessionId);
        if (session) {
          userId = session.userId;
        }
      } catch (err) {
        console.warn("[LegacyAdapter] Could not get userId from session:", err);
      }
    }
    await db.userInteractions.put({
      id: interaction.id,
      timestamp: interaction.timestamp,
      type: interaction.type,
      sessionId: interaction.sessionId,
      userId,
      valueId: interaction.valueId,
      emotionalState: interaction.emotionalState,
      selectedFeeling: interaction.selectedFeeling,
      metadata: interaction.metadata
    });
  }
  async getUserInteractions(sessionId, limit) {
    let interactions = await db.userInteractions.orderBy("timestamp").reverse().toArray();
    if (sessionId) {
      interactions = interactions.filter((interaction) => interaction.sessionId === sessionId);
    }
    return limit ? interactions.slice(0, limit) : interactions;
  }
  async deleteUserInteraction(interactionId) {
    await db.userInteractions.delete(interactionId);
  }
  async saveSession(session) {
    await db.sessions.put({
      id: session.id,
      userId: session.userId,
      startTimestamp: session.startTimestamp,
      endTimestamp: session.endTimestamp,
      valueId: session.valueId,
      initialEmotionalState: session.initialEmotionalState,
      finalEmotionalState: session.finalEmotionalState,
      selectedFeeling: session.selectedFeeling,
      reflectionLength: session.reflectionLength,
      goalCreated: session.goalCreated,
      duration: session.duration
    });
  }
  async updateSession(sessionId, updates) {
    await db.sessions.update(sessionId, updates);
  }
  async getSessions(userId, limit) {
    let sessions = await db.sessions.where("userId").equals(userId).toArray();
    sessions.sort((a, b) => {
      const timeA = new Date(a.startTimestamp).getTime();
      const timeB = new Date(b.startTimestamp).getTime();
      return timeB - timeA;
    });
    return limit ? sessions.slice(0, limit) : sessions;
  }
  async getSessionsByValue(valueId, limit) {
    let sessions = await db.sessions.where("valueId").equals(valueId).toArray();
    sessions.sort((a, b) => {
      const timeA = new Date(a.startTimestamp).getTime();
      const timeB = new Date(b.startTimestamp).getTime();
      return timeB - timeA;
    });
    return limit ? sessions.slice(0, limit) : sessions;
  }
  async getFeelingPatterns(startDate, endDate) {
    return getFeelingPatterns(startDate, endDate);
  }
  async getProgressMetrics(startDate, endDate) {
    return getProgressMetrics(startDate, endDate);
  }
  async getFeelingFrequency(limit) {
    return getFeelingFrequency(limit);
  }
  async saveAssessment(assessment) {
    await db.assessments.put({
      id: assessment.id,
      userId: assessment.userId,
      emotion: assessment.emotion,
      subEmotion: assessment.subEmotion,
      reflection: assessment.reflection,
      assessment: assessment.assessment,
      timestamp: assessment.timestamp
    });
  }
  async getAssessments(userId, limit) {
    let assessments = await db.assessments.where("userId").equals(userId).toArray();
    assessments.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    return limit ? assessments.slice(0, limit) : assessments;
  }
  async saveReport(report) {
    await db.reports.put({
      id: report.id,
      userId: report.userId,
      content: report.content,
      timestamp: report.timestamp,
      emailAddresses: report.emailAddresses,
      treatmentProtocols: report.treatmentProtocols
    });
  }
  async getReports(userId, limit) {
    let reports = await db.reports.where("userId").equals(userId).toArray();
    reports.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    return limit ? reports.slice(0, limit) : reports;
  }
  // Values operations
  async getActiveValues(userId) {
    if (!userId || typeof userId !== "string") {
      console.warn("[LegacyAdapter] Invalid userId for getActiveValues:", userId);
      return [];
    }
    try {
      const allValues = await db.values.where("userId").equals(userId).toArray();
      const values = allValues.filter((v) => v.active === true || v.active === 1).sort((a, b) => (a.priority || 0) - (b.priority || 0));
      return values.map((v) => v.valueId);
    } catch (error) {
      console.error("[LegacyAdapter] Error getting active values:", error);
      return [];
    }
  }
  async setValuesActive(userId, valueIds) {
    const allUserValues = await db.values.where("userId").equals(userId).toArray();
    allUserValues.map((v) => ({
      ...v,
      active: false,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
    const existingValueIds = allUserValues.map((v) => v.valueId);
    valueIds.filter((id) => !existingValueIds.includes(id));
    for (let i = 0; i < valueIds.length; i++) {
      const valueId = valueIds[i];
      const existing = allUserValues.find((v) => v.valueId === valueId);
      if (existing) {
        await db.values.update(existing.id, {
          active: true,
          priority: i,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        await db.values.add({
          userId,
          valueId,
          active: true,
          priority: i,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    const toDeactivate = allUserValues.filter((v) => !valueIds.includes(v.valueId));
    for (const value of toDeactivate) {
      await db.values.update(value.id, {
        active: false,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  async saveValue(userId, valueId, active = true, priority) {
    const allUserValues = await db.values.where("userId").equals(userId).toArray();
    const existing = allUserValues.find((v) => v.valueId === valueId);
    if (existing) {
      await db.values.update(existing.id, {
        active,
        priority: priority !== void 0 ? priority : existing.priority,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      const activeCount = await db.values.where("[userId+active]").equals([userId, true]).count();
      const defaultPriority = priority !== void 0 ? priority : activeCount;
      await db.values.add({
        userId,
        valueId,
        active,
        priority: defaultPriority,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  // Goals operations
  async saveGoal(goal) {
    await db.goals.put(goal);
  }
  async getGoals(userId) {
    const goals = await db.goals.where("userId").equals(userId).sortBy("createdAt");
    return goals.reverse();
  }
  async deleteGoal(goalId) {
    await db.goals.delete(goalId);
  }
  async clearAllData(userId) {
    if (!userId || typeof userId !== "string") {
      throw new Error("Invalid userId for clearAllData");
    }
    try {
      const [valuesToDelete, goalsToDelete, feelingLogsToDelete, sessionsToDelete, assessmentsToDelete, reportsToDelete] = await Promise.all([
        db.values.where("userId").equals(userId).toArray(),
        db.goals.where("userId").equals(userId).toArray(),
        db.feelingLogs.where("userId").equals(userId).toArray(),
        db.sessions.where("userId").equals(userId).toArray(),
        db.assessments.where("userId").equals(userId).toArray(),
        db.reports.where("userId").equals(userId).toArray()
      ]);
      const [userInteractionsToDelete, ruleBasedUsageLogsToDelete] = await Promise.all([
        db.userInteractions.where("userId").equals(userId).toArray().catch((error) => {
          console.error("[LegacyAdapter] Error getting userInteractions:", error);
          return [];
        }),
        db.ruleBasedUsageLogs.where("userId").equals(userId).toArray().catch((error) => {
          console.error("[LegacyAdapter] Error getting ruleBasedUsageLogs:", error);
          return [];
        })
      ]);
      await Promise.all([
        Promise.all(valuesToDelete.map((v) => db.values.delete(v.id))),
        Promise.all(goalsToDelete.map((g) => db.goals.delete(g.id))),
        Promise.all(feelingLogsToDelete.map((f) => db.feelingLogs.delete(f.id))),
        Promise.all(sessionsToDelete.map((s) => db.sessions.delete(s.id))),
        Promise.all(userInteractionsToDelete.map((u) => db.userInteractions.delete(u.id))),
        Promise.all(assessmentsToDelete.map((a) => db.assessments.delete(a.id))),
        Promise.all(reportsToDelete.map((r) => db.reports.delete(r.id))),
        Promise.all(ruleBasedUsageLogsToDelete.map((r) => db.ruleBasedUsageLogs.delete(r.id)))
      ]);
      await db.appData.where("userId").equals(userId).delete();
      console.log("[LegacyAdapter] Cleared all data for user:", userId);
    } catch (error) {
      console.error("[LegacyAdapter] Error clearing all data:", error);
      throw error;
    }
  }
}
function getDatabaseAdapter() {
  return new LegacyAdapter();
}
const databaseAdapter = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  LegacyAdapter,
  getDatabaseAdapter
}, Symbol.toStringTag, { value: "Module" }));
const AuthContext = reactExports.createContext(void 0);
const requestPersistentStorage = async () => {
  if (navigator.storage && typeof navigator.storage.persist === "function") {
    try {
      const isPersisted = await navigator.storage.persist();
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isPersisted) {
        logger.debug(`[AuthContext] Persistent storage granted (platform: ${navigator.platform})`);
      } else if (isMobile) {
        logger.warn(`[AuthContext] Persistent storage denied on mobile (platform: ${navigator.platform}) - credentials may be lost on app updates`);
      } else {
        logger.debug(`[AuthContext] Persistent storage denied on desktop (platform: ${navigator.platform}) - this is expected, credentials will still persist in localStorage/IndexedDB`);
      }
      return isPersisted;
    } catch (error) {
      logger.warn("[AuthContext] Error requesting persistent storage:", error);
      return false;
    }
  }
  logger.debug("[AuthContext] Persistent Storage API not supported - using standard storage (credentials will persist in localStorage/IndexedDB)");
  return false;
};
const checkStoragePersistence = async () => {
  if (navigator.storage && typeof navigator.storage.persisted === "function") {
    try {
      return await navigator.storage.persisted();
    } catch (error) {
      logger.warn("[AuthContext] Error checking storage persistence:", error);
      return false;
    }
  }
  return false;
};
const AuthProvider = ({
  children,
  onLoginComplete,
  onLogoutComplete
}) => {
  const [authState, setAuthState] = reactExports.useState("checking");
  const [userId, setUserId] = reactExports.useState(null);
  const hasInitializedRef = React.useRef(false);
  const initializationPromiseRef = React.useRef(null);
  reactExports.useEffect(() => {
    if (hasInitializedRef.current || initializationPromiseRef.current) {
      return;
    }
    const initPromise = (async () => {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;
      try {
        console.log("[AuthContext] Initializing auth state...");
        await requestPersistentStorage();
        const { authStore } = await __vitePreload(async () => {
          const { authStore: authStore2 } = await import("./ai-services-DJUX-74P.js").then((n) => n.J);
          return { authStore: authStore2 };
        }, true ? __vite__mapDeps([0,1,2,3,4]) : void 0);
        try {
          await authStore.init();
          console.log("[AuthContext] Auth store initialized");
        } catch (initError) {
          console.error("[AuthContext] Auth store init error:", initError);
        }
        const { isPWAInstalled: isPWAInstalled2 } = await __vitePreload(async () => {
          const { isPWAInstalled: isPWAInstalled3 } = await Promise.resolve().then(() => installCheck);
          return { isPWAInstalled: isPWAInstalled3 };
        }, true ? void 0 : void 0);
        const isInstalled = isPWAInstalled2();
        const installationCompleteKey = "app_installation_complete";
        const wasJustInstalled = !localStorage.getItem(installationCompleteKey);
        if (isInstalled && !wasJustInstalled) {
          localStorage.setItem(installationCompleteKey, "true");
          console.log("[AuthContext] App just installed - going to login for account creation");
          setAuthState("login");
          return;
        }
        const user = await getCurrentUser();
        if (user) {
          console.log("[AuthContext] User found, checking terms...", { userId: user.id, termsAccepted: user.termsAccepted });
          setUserId(user.id);
          if (user.termsAccepted) {
            try {
              const adapter = getDatabaseAdapter();
              await adapter.init();
              const appData = await adapter.getAppData(user.id);
              let activeValues = [];
              try {
                activeValues = await Promise.race([
                  adapter.getActiveValues(user.id),
                  new Promise((_, reject) => setTimeout(() => reject(new Error("getActiveValues timeout")), 2e3))
                ]).catch((error) => {
                  console.error("[AuthContext] Error loading activeValues:", error);
                  return [];
                });
                console.log("[AuthContext] Active values from table:", activeValues.length);
              } catch (error) {
                console.warn("[AuthContext] Could not load values from table:", error);
              }
              if (appData) {
                const loadedSettings = appData.settings || { reminders: { enabled: false, frequency: "daily", time: "09:00" } };
                if (loadedSettings.reminders && !loadedSettings.reminders.frequency) {
                  loadedSettings.reminders.frequency = "daily";
                }
                const values = activeValues.length > 0 ? activeValues : appData.values || [];
                onLoginComplete?.(user.id, {
                  values,
                  logs: appData.logs || [],
                  goals: appData.goals || [],
                  settings: loadedSettings
                });
              } else {
                const values = activeValues.length > 0 ? activeValues : [];
                onLoginComplete?.(user.id, {
                  values,
                  logs: [],
                  goals: [],
                  settings: { reminders: { enabled: false, frequency: "daily", time: "09:00" } }
                });
              }
            } catch (error) {
              console.error("[AuthContext] Error loading app data on init:", error);
              onLoginComplete?.(user.id, {
                values: [],
                logs: [],
                goals: [],
                settings: { reminders: { enabled: false, frequency: "daily", time: "09:00" } }
              });
            }
            setAuthState("app");
          } else {
            setAuthState("terms");
          }
        } else {
          console.log("[AuthContext] No user found - showing login");
          const localUserId = localStorage.getItem("userId");
          if (localUserId) {
            console.log("[AuthContext] Found userId in localStorage, attempting to restore:", localUserId);
            try {
              const localUser = await getCurrentUser();
              if (localUser) {
                console.log("[AuthContext] Successfully restored user from localStorage");
                setUserId(localUser.id);
                if (localUser.termsAccepted) {
                  setAuthState("app");
                } else {
                  setAuthState("terms");
                }
                return;
              }
            } catch (restoreError) {
              console.error("[AuthContext] Failed to restore user from localStorage:", restoreError);
            }
          }
          setAuthState("login");
        }
      } catch (error) {
        console.error("[AuthContext] Error initializing auth:", error);
        const localUserId = localStorage.getItem("userId");
        if (localUserId) {
          console.log("[AuthContext] Attempting recovery from localStorage:", localUserId);
          try {
            const localUser = await getCurrentUser();
            if (localUser) {
              console.log("[AuthContext] Recovery successful");
              setUserId(localUser.id);
              if (localUser.termsAccepted) {
                setAuthState("app");
              } else {
                setAuthState("terms");
              }
              return;
            }
          } catch (recoveryError) {
            console.error("[AuthContext] Recovery failed:", recoveryError);
          }
        }
        setAuthState("login");
        hasInitializedRef.current = false;
      }
    })();
    initializationPromiseRef.current = initPromise;
    initPromise.finally(() => {
      initializationPromiseRef.current = null;
    });
  }, []);
  const handleLogin = reactExports.useCallback(async (loggedInUserId) => {
    try {
      console.log("[LOGIN] handleLogin called with userId:", loggedInUserId);
      await requestPersistentStorage();
      setUserId(loggedInUserId);
      const { resetInitialization } = await __vitePreload(async () => {
        const { resetInitialization: resetInitialization2 } = await import("./useAppInitialization-CmNh7W4F.js");
        return { resetInitialization: resetInitialization2 };
      }, true ? __vite__mapDeps([5,6,1,2,3,4,0]) : void 0);
      resetInitialization();
      const userDataPromise = getCurrentUser();
      const userDataTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("getCurrentUser timeout")), 5e3);
      });
      const user = await Promise.race([userDataPromise, userDataTimeout]);
      console.log("[LOGIN] User data loaded:", user ? "found" : "not found");
      if (user) {
        if (user.termsAccepted) {
          try {
            console.log("[LOGIN] Loading app data...");
            const adapter = getDatabaseAdapter();
            console.log("[LOGIN] Database adapter:", adapter.constructor.name);
            await adapter.init();
            const appDataPromise = adapter.getAppData(loggedInUserId);
            const appDataTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error("getAppData timeout")), 5e3);
            });
            const appData = await Promise.race([appDataPromise, appDataTimeout]);
            console.log("[LOGIN] App data loaded:", appData ? "found" : "not found");
            let activeValues = [];
            try {
              activeValues = await Promise.race([
                adapter.getActiveValues(loggedInUserId),
                new Promise((_, reject) => setTimeout(() => reject(new Error("getActiveValues timeout")), 2e3))
              ]).catch((error) => {
                console.error("[AuthContext] Error loading activeValues (login):", error);
                return [];
              });
              console.log("[LOGIN] Active values from table:", activeValues.length);
            } catch (error) {
              console.warn("[LOGIN] Could not load values from table:", error);
            }
            if (appData) {
              const loadedSettings = appData.settings || { reminders: { enabled: false, frequency: "daily", time: "09:00" } };
              if (loadedSettings.reminders && !loadedSettings.reminders.frequency) {
                loadedSettings.reminders.frequency = "daily";
              }
              const values = activeValues.length > 0 ? activeValues : appData.values || [];
              onLoginComplete?.(loggedInUserId, {
                values,
                logs: appData.logs || [],
                goals: appData.goals || [],
                settings: loadedSettings
              });
            } else {
              const values = activeValues.length > 0 ? activeValues : [];
              console.log("[LOGIN] No app data found - using defaults with values from table:", values.length);
              onLoginComplete?.(loggedInUserId, {
                values,
                logs: [],
                goals: [],
                settings: { reminders: { enabled: false, frequency: "daily", time: "09:00" } }
              });
            }
          } catch (appDataError) {
            console.error("[LOGIN] Failed to load app data after login:", appDataError);
            onLoginComplete?.(loggedInUserId, {
              values: [],
              logs: [],
              goals: [],
              settings: { reminders: { enabled: false, frequency: "daily", time: "09:00" } }
            });
          }
          console.log("[LOGIN] Setting authState to app");
          setAuthState("app");
        } else {
          console.log("[LOGIN] User has not accepted terms - showing terms screen");
          setAuthState("terms");
        }
      } else {
        console.error("[LOGIN] No user found after login");
        setAuthState("login");
      }
    } catch (error) {
      console.error("[LOGIN] Error in handleLogin:", error);
      setAuthState("login");
    }
  }, [onLoginComplete]);
  const handleAcceptTerms = reactExports.useCallback(async () => {
    if (userId) {
      await acceptTerms(userId);
      setAuthState("app");
      const { preloadModels } = await __vitePreload(async () => {
        const { preloadModels: preloadModels2 } = await import("./ai-services-DJUX-74P.js").then((n) => n.N);
        return { preloadModels: preloadModels2 };
      }, true ? __vite__mapDeps([0,1,2,3,4]) : void 0);
      preloadModels().catch((error) => {
        console.warn("AI model preload retry failed:", error);
      });
    }
  }, [userId]);
  const handleDeclineTerms = reactExports.useCallback(() => {
    logoutUser();
    setAuthState("login");
    setUserId(null);
  }, []);
  const handleLogout = reactExports.useCallback(() => {
    logoutUser();
    setAuthState("login");
    setUserId(null);
    onLogoutComplete?.();
  }, [onLogoutComplete]);
  reactExports.useEffect(() => {
    const checkOnResume = async () => {
      if (!await checkStoragePersistence() && userId) {
        logger.debug("[AuthContext] Storage permission lost - re-requesting");
        await requestPersistentStorage();
      }
    };
    const handler = () => {
      if (document.visibilityState === "visible") checkOnResume();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [userId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AuthContext.Provider,
    {
      value: {
        authState,
        userId,
        setAuthState,
        setUserId,
        handleLogin,
        handleAcceptTerms,
        handleDeclineTerms,
        handleLogout
      },
      children
    }
  );
};
const useAuthContext = () => {
  const context = reactExports.useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
const DataContext = reactExports.createContext(void 0);
const DataProvider = ({
  children,
  userId,
  authState,
  initialData
}) => {
  const [selectedValueIds, setSelectedValueIds] = reactExports.useState(
    initialData?.selectedValueIds || []
  );
  const [logs, setLogs] = reactExports.useState(initialData?.logs || []);
  const [goals, setGoals] = reactExports.useState(initialData?.goals || []);
  const [settings, setSettings] = reactExports.useState(
    initialData?.settings || { reminders: { enabled: false, frequency: "daily", time: "09:00" } }
  );
  const [isHydrating, setIsHydrating] = reactExports.useState(true);
  const adapter = reactExports.useMemo(() => getDatabaseAdapter(), []);
  const hasLoadedInitialDataRef = reactExports.useRef(false);
  const initializationTimeoutRef = reactExports.useRef(null);
  const pendingSaveRef = reactExports.useRef(null);
  const hasTriedDatabaseLoadRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    const hasData = initialData && (initialData.selectedValueIds && initialData.selectedValueIds.length > 0 || initialData.logs && initialData.logs.length > 0 || initialData.goals && initialData.goals.length > 0 || initialData.settings);
    if (hasData && !hasLoadedInitialDataRef.current) {
      logger.info("[DataContext] Loading initial data from props", {
        values: initialData.selectedValueIds?.length || 0,
        logs: initialData.logs?.length || 0,
        goals: initialData.goals?.length || 0,
        hasSettings: !!initialData.settings
      });
      if (initialData.selectedValueIds !== void 0) {
        setSelectedValueIds(initialData.selectedValueIds);
      }
      if (initialData.logs !== void 0) {
        setLogs(initialData.logs);
      }
      if (initialData.goals !== void 0) {
        setGoals(initialData.goals);
      }
      if (initialData.settings) {
        setSettings(initialData.settings);
      }
      hasLoadedInitialDataRef.current = true;
      setIsHydrating(false);
    } else if (initialData !== void 0 && !hasData) {
      setIsHydrating(false);
    }
  }, [initialData]);
  reactExports.useEffect(() => {
    if (hasTriedDatabaseLoadRef.current || !userId || authState !== "app") {
      return;
    }
    hasTriedDatabaseLoadRef.current = true;
    const loadFromDatabase = async () => {
      try {
        logger.info("[DataContext] Loading values from database...", { userId });
        await adapter.init();
        let activeValues = await adapter.getActiveValues(userId);
        if (activeValues.length === 0) {
          const appData = await adapter.getAppData(userId);
          if (appData?.values && appData.values.length > 0) {
            activeValues = appData.values;
            await adapter.setValuesActive(userId, activeValues);
            logger.info("[DataContext] Migrated values from appData to values table");
          }
        }
        if (activeValues.length > 0) {
          logger.info("[DataContext] Loaded values from database:", activeValues.length, activeValues);
          setSelectedValueIds(activeValues);
        } else {
          logger.info("[DataContext] No values found - user is first-time user");
        }
        hasLoadedInitialDataRef.current = true;
        setIsHydrating(false);
      } catch (error) {
        logger.error("[DataContext] Error loading values:", error);
        setTimeout(async () => {
          try {
            const retryValues = await adapter.getActiveValues(userId);
            if (retryValues.length > 0) {
              setSelectedValueIds(retryValues);
            }
          } catch (retryError) {
            logger.error("[DataContext] Retry failed:", retryError);
          }
          hasLoadedInitialDataRef.current = true;
          setIsHydrating(false);
        }, 1e3);
      }
    };
    const timeoutId = setTimeout(loadFromDatabase, 200);
    return () => clearTimeout(timeoutId);
  }, [userId, authState, adapter]);
  reactExports.useEffect(() => {
    if ((userId || selectedValueIds.length > 0 || logs.length > 0 || goals.length > 0) && !hasLoadedInitialDataRef.current) {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      const delay = userId ? 100 : 1e3;
      initializationTimeoutRef.current = setTimeout(() => {
        logger.info("[DataContext] Marking data as loaded after sync", {
          values: selectedValueIds.length,
          logs: logs.length,
          goals: goals.length,
          userId: !!userId
        });
        hasLoadedInitialDataRef.current = true;
        setIsHydrating(false);
      }, delay);
    }
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, [selectedValueIds.length, logs.length, goals.length, userId]);
  reactExports.useEffect(() => {
    if (userId && authState === "app") {
      if (!hasLoadedInitialDataRef.current && (selectedValueIds.length > 0 || logs.length > 0 || goals.length > 0)) {
        hasLoadedInitialDataRef.current = true;
      }
      const shouldSaveValues = hasLoadedInitialDataRef.current || selectedValueIds.length > 0;
      if (hasLoadedInitialDataRef.current || selectedValueIds.length > 0 || logs.length > 0 || goals.length > 0) {
        const saveData = async () => {
          try {
            const appDataToSave = {
              settings,
              logs,
              goals,
              lcswConfig: settings.lcswConfig
            };
            if (shouldSaveValues) {
              appDataToSave.values = selectedValueIds;
            }
            logger.info("[DataContext] Saving app data", {
              values: shouldSaveValues ? selectedValueIds.length : "(skipped - not loaded yet)",
              logs: logs.length,
              goals: goals.length,
              userId,
              hasLoadedInitialData: hasLoadedInitialDataRef.current,
              shouldSaveValues
            });
            await adapter.saveAppData(userId, appDataToSave);
            if (shouldSaveValues && selectedValueIds.length > 0) {
              await adapter.setValuesActive(userId, selectedValueIds);
            }
            if (goals.length > 0) {
              for (const goal of goals) {
                await adapter.saveGoal(goal);
              }
            }
            pendingSaveRef.current = null;
          } catch (error) {
            logger.error("Error saving app data:", error);
            pendingSaveRef.current = null;
          }
        };
        pendingSaveRef.current = saveData();
        const timeoutId = setTimeout(() => {
          saveData();
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [userId, settings, logs, goals, selectedValueIds, authState, adapter]);
  const handleLogEntry = reactExports.useCallback((entry) => {
    setLogs((prev) => [entry, ...prev]);
  }, []);
  const handleUpdateGoals = reactExports.useCallback((updatedGoals) => {
    setGoals(updatedGoals);
  }, []);
  const handleUpdateGoalProgress = reactExports.useCallback((goalId, update) => {
    setGoals(
      (prevGoals) => prevGoals.map((goal) => {
        if (goal.id === goalId) {
          const goalUpdate = {
            id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: update.date,
            note: update.note,
            mood: void 0
            // Optional field
          };
          return { ...goal, updates: [...goal.updates || [], goalUpdate] };
        }
        return goal;
      })
    );
  }, []);
  const handleClearData = reactExports.useCallback(() => {
    setLogs([]);
    setSelectedValueIds([]);
    setGoals([]);
    setSettings({ reminders: { enabled: false, frequency: "daily", time: "09:00" } });
  }, []);
  const handleSelectionComplete = reactExports.useCallback(async (ids) => {
    setSelectedValueIds(ids);
    if (userId && authState === "app") {
      try {
        await adapter.setValuesActive(userId, ids);
        logger.info("[DataContext] Saved values to values table with priorities", {
          userId,
          count: ids.length,
          priorities: ids.map((id, index) => ({ id, priority: index }))
        });
      } catch (error) {
        logger.error("Error saving values to table:", error);
      }
    }
  }, [userId, authState, adapter]);
  const handleMoodLoopEntry = reactExports.useCallback(async (emotion, feeling) => {
    if (!emotion || !feeling) {
      logger.warn("[DataContext] handleMoodLoopEntry called with invalid parameters", { emotion, feeling });
      return;
    }
    try {
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const logId = `mood-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const feelingLogData = {
        id: logId,
        timestamp,
        userId: userId || void 0,
        emotionalState: emotion,
        selectedFeeling: feeling || null,
        aiResponse: "",
        isAIResponse: false,
        lowStateCount: 0
      };
      if (userId && authState === "app") {
        try {
          if (adapter && typeof adapter.saveFeelingLog === "function") {
            await adapter.saveFeelingLog(feelingLogData);
            logger.info("[DataContext] Mood entry saved to database", { emotion, feeling, userId, logId });
          } else {
            logger.warn("[DataContext] saveFeelingLog method not available on adapter");
          }
        } catch (error) {
          logger.error("[DataContext] Error saving mood entry to database:", error);
        }
      } else {
        logger.warn("[DataContext] Cannot save mood entry - user not authenticated", { userId, authState });
      }
      const allowedEmotionalStates = [
        "drained",
        "heavy",
        "overwhelmed",
        "mixed",
        "calm",
        "hopeful",
        "positive",
        "energized"
      ];
      const validEmotionalState = allowedEmotionalStates.includes(emotion) ? emotion : void 0;
      const logEntry2 = {
        id: logId,
        date: timestamp,
        valueId: "",
        // No value associated with mood loop entry
        livedIt: false,
        note: `Mood: ${emotion} - ${feeling}`,
        emotionalState: validEmotionalState,
        selectedFeeling: feeling
      };
      setLogs((prev) => [logEntry2, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error("[DataContext] Error recording mood entry:", errorMessage, err);
      throw new Error(`Failed to record mood entry: ${errorMessage}`);
    }
  }, [userId, authState, adapter]);
  const persistData = reactExports.useCallback(async () => {
    if (!userId || authState !== "app") {
      return;
    }
    if (pendingSaveRef.current) {
      try {
        await pendingSaveRef.current;
      } catch (error) {
        logger.error("[DataContext] Error waiting for pending save:", error);
      }
    }
    try {
      logger.info("[DataContext] Persisting data on exit", {
        values: selectedValueIds.length,
        logs: logs.length,
        goals: goals.length,
        userId
      });
      await adapter.saveAppData(userId, {
        settings,
        logs,
        goals,
        values: selectedValueIds,
        lcswConfig: settings.lcswConfig
      });
      if (selectedValueIds.length > 0) {
        await adapter.setValuesActive(userId, selectedValueIds);
      }
      if (goals.length > 0) {
        for (const goal of goals) {
          await adapter.saveGoal(goal);
        }
      }
      logger.info("[DataContext] Data persisted successfully");
    } catch (error) {
      logger.error("[DataContext] Error persisting data on exit:", error);
    }
  }, [userId, authState, selectedValueIds, logs, goals, settings, adapter]);
  reactExports.useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (userId && authState === "app" && (selectedValueIds.length > 0 || logs.length > 0 || goals.length > 0)) {
        JSON.stringify({
          userId,
          values: selectedValueIds,
          logs: logs.slice(0, 10),
          // Only save recent logs to avoid payload size issues
          goals: goals.slice(0, 10),
          // Only save recent goals
          settings
        });
        persistData().catch((error) => {
          logger.error("[DataContext] Failed to persist on exit:", error);
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    const handleVisibilityChange = () => {
      if (document.hidden && userId && authState === "app") {
        persistData().catch((error) => {
          logger.error("[DataContext] Failed to persist on visibility change:", error);
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId, authState, selectedValueIds, logs, goals, settings, persistData]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DataContext.Provider,
    {
      value: {
        selectedValueIds,
        logs,
        goals,
        settings,
        isHydrating,
        setSelectedValueIds,
        setLogs,
        setGoals,
        setSettings,
        handleLogEntry,
        handleUpdateGoals,
        handleUpdateGoalProgress,
        handleClearData,
        handleSelectionComplete,
        handleMoodLoopEntry,
        persistData
      },
      children
    }
  );
};
const useData = () => {
  const context = reactExports.useContext(DataContext);
  if (context === void 0) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
const useDataContext = useData;
const ThemeContext = reactExports.createContext(void 0);
const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = reactExports.useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return "light";
  });
  reactExports.useEffect(() => {
    const root2 = document.documentElement;
    if (theme === "dark") {
      root2.classList.add("dark");
    } else {
      root2.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => {
    setThemeState((prev) => prev === "light" ? "dark" : "light");
  };
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeContext.Provider, { value: { theme, toggleTheme, setTheme }, children });
};
const useTheme = () => {
  const context = reactExports.useContext(ThemeContext);
  if (context === void 0) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick: toggleTheme,
      className: "w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-opacity-20 dark:hover:bg-opacity-20",
      "aria-label": "Toggle theme",
      title: theme === "light" ? "Switch to dark mode" : "Switch to light mode",
      children: theme === "light" ? (
        // Moon icon for dark mode
        /* PREV: text-yellow-warm */
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-brand", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" }) })
      ) : (
        // Sun icon for light mode
        /* PREV: text-yellow-warm */
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-brand-light", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" }) })
      )
    }
  );
};
const BottomNavigation = ({ currentView, onViewChange, onLogout }) => {
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "values", label: "Values", icon: "💛" },
    { id: "goals", label: "Goals", icon: "🎯" },
    { id: "report", label: "Reports", icon: "📊" }
  ];
  const navRef = reactExports.useRef(null);
  const touchStartX = reactExports.useRef(0);
  const touchStartY = reactExports.useRef(0);
  const [swipeDirection, setSwipeDirection] = reactExports.useState(null);
  const currentIndex = tabs.findIndex((tab) => tab.id === currentView);
  reactExports.useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    };
    const handleTouchEnd = (e) => {
      if (!touchStartX.current || !touchStartY.current) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentIndex > 0) {
          onViewChange(tabs[currentIndex - 1].id);
          setSwipeDirection("right");
        } else if (deltaX < 0 && currentIndex < tabs.length - 1) {
          onViewChange(tabs[currentIndex + 1].id);
          setSwipeDirection("left");
        }
        setTimeout(() => setSwipeDirection(null), 300);
      }
      touchStartX.current = 0;
      touchStartY.current = 0;
    };
    nav.addEventListener("touchstart", handleTouchStart, { passive: true });
    nav.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      nav.removeEventListener("touchstart", handleTouchStart);
      nav.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentIndex, onViewChange]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "nav",
    {
      ref: navRef,
      className: `fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-bg-primary border-t border-border-soft dark:border-dark-border shadow-lg z-50 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ${swipeDirection === "left" ? "translate-x-[-10px]" : swipeDirection === "right" ? "translate-x-[10px]" : ""}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-around items-center", children: [
        tabs.map((tab) => {
          const isActive = currentView === tab.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: (e) => {
                e.preventDefault();
                if (tab.id === "home") {
                  onViewChange("home");
                  if (window.__dashboardReset) {
                    window.__dashboardReset();
                  }
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  onViewChange(tab.id);
                }
              },
              className: `
                  flex flex-col items-center justify-center py-3 px-1 min-w-[60px] min-h-[60px]
                  transition-all duration-200
                  ${isActive ? "text-navy-primary dark:text-brand-light" : "text-text-secondary dark:text-white/60"}
                  active:scale-95
                `,
              "aria-label": tab.label,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl mb-1", children: tab.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `
                  text-[10px] font-medium uppercase tracking-tight
                  ${isActive ? "font-bold" : ""}
                `, children: tab.label })
              ]
            },
            tab.id
          );
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-3 px-1 min-w-[60px] min-h-[60px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium uppercase tracking-tight text-text-secondary dark:text-white/60", children: "Theme" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: (e) => {
              e.preventDefault();
              if (window.confirm("Are you sure you want to log out?")) {
                onLogout();
              }
            },
            className: "flex flex-col items-center justify-center py-3 px-1 min-w-[60px] min-h-[60px] transition-all duration-200 text-text-secondary dark:text-white/60 hover:text-red-600 dark:hover:text-red-400 active:scale-95",
            "aria-label": "Logout",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6 mb-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium uppercase tracking-tight", children: "Logout" })
            ]
          }
        )
      ] }) })
    }
  );
};
const EMOTIONAL_STATES = [
  {
    state: "drained",
    label: "🌧️ Drained — running on empty",
    emoji: "🌧️",
    shortLabel: "Drained",
    color: "#94a3b8",
    // Soft desaturated blue-gray
    bgColor: "bg-slate-300",
    reflectionPrompt: "I feel drained because...",
    encouragementPrompt: {
      type: "AI_GENERATED",
      instruction: "Generate compassionate and restorative encouragement for someone feeling drained. Acknowledge exhaustion, promote rest or small self-care actions."
    },
    feelings: ["tired", "empty", "numb", "burned out", "exhausted", "drained", "flat", "lifeless"]
  },
  {
    state: "heavy",
    label: "🩶 Heavy — carrying a lot right now",
    emoji: "🩶",
    shortLabel: "Heavy",
    color: "#475569",
    // Deeper muted blue-navy
    bgColor: "bg-slate-600",
    reflectionPrompt: "I feel heavy because...",
    encouragementPrompt: {
      type: "AI_GENERATED",
      instruction: "Generate supportive encouragement for someone feeling emotionally weighed down. Validate emotions and offer gentle release or comfort."
    },
    feelings: ["sad", "disappointed", "lonely", "discouraged", "down", "gloomy", "melancholy", "weighed down"]
  },
  {
    state: "overwhelmed",
    label: "🌫️ Overwhelmed — too much at once",
    emoji: "🌫️",
    shortLabel: "Overwhelmed",
    color: "#64748b",
    // Medium blue-gray
    bgColor: "bg-slate-500",
    reflectionPrompt: "I feel overwhelmed because...",
    encouragementPrompt: {
      type: "AI_GENERATED",
      instruction: "Generate a calming message for someone feeling overwhelmed. Focus on grounding, prioritization, and reassurance."
    },
    feelings: ["anxious", "stressed", "scattered", "pressured", "swamped", "flooded", "chaotic", "unable to focus"]
  },
  {
    state: "mixed",
    label: "🌗 Mixed — somewhere in between",
    emoji: "🌗",
    shortLabel: "Mixed",
    color: "#14b8a6",
    // Neutral teal
    bgColor: "bg-teal-500",
    reflectionPrompt: "I feel mixed because...",
    encouragementPrompt: {
      type: "AI_GENERATED",
      instruction: "Generate a balanced reflection for someone with mixed emotions. Encourage mindfulness and acceptance of multiple feelings."
    },
    feelings: ["uncertain", "okay", "conflicted", "reflective", "neutral", "ambivalent", "contemplative", "processing"]
  },
  {
    state: "calm",
    label: "🌿 Calm — steady and centered",
    emoji: "🌿",
    shortLabel: "Calm",
    color: "#34d399",
    // Soft green
    bgColor: "bg-emerald-400",
    reflectionPrompt: "I feel calm because...",
    encouragementPrompt: {
      type: "AI_GENERATED",
      instruction: "Generate gratitude-based encouragement for someone feeling calm. Reinforce peace and mindfulness."
    },
    feelings: ["peaceful", "centered", "balanced", "serene", "grounded", "stable", "tranquil", "at ease"]
  },
  {
    state: "hopeful",
    label: "🌱 Hopeful — seeing a small light ahead",
    emoji: "🌱",
    shortLabel: "Hopeful",
    color: "#a3e635",
    // Light green-yellow
    bgColor: "bg-lime-400",
    reflectionPrompt: "I feel hopeful because...",
    encouragementPrompt: {
      type: "AI_GENERATED",
      instruction: "Generate uplifting encouragement for someone feeling hopeful. Support optimism and momentum toward goals."
    },
    feelings: ["optimistic", "encouraged", "motivated", "inspired", "forward-looking", "promising", "bright", "upward"]
  },
  {
    state: "positive",
    label: "🌤️ Positive — grounded and grateful",
    emoji: "🌤️",
    shortLabel: "Positive",
    color: "#fbbf24",
    // Soft yellow-gold
    bgColor: "bg-yellow-400",
    reflectionPrompt: "I feel positive because...",
    encouragementPrompt: {
      type: "AI_GENERATED",
      instruction: "Generate reflective encouragement for someone feeling positive. Celebrate gratitude and inspire sharing kindness."
    },
    feelings: ["hopeful", "curious", "calm", "engaged", "content", "peaceful", "optimistic", "grateful"]
  },
  {
    state: "energized",
    label: "☀️ Energized — ready to move forward",
    emoji: "☀️",
    shortLabel: "Energized",
    color: "#f59e0b",
    // Warm yellow-orange
    bgColor: "bg-amber-500",
    reflectionPrompt: "I feel energized because...",
    encouragementPrompt: {
      type: "AI_GENERATED",
      instruction: "Generate motivational encouragement for someone feeling energized. Focus on purposeful action and balanced enthusiasm."
    },
    feelings: ["joyful", "excited", "inspired", "proud", "elated", "enthusiastic", "motivated", "vibrant"]
  }
];
function getEmotionalState(state) {
  return EMOTIONAL_STATES.find((s) => s.state === state);
}
const FEELING_EMOJIS = {
  // Drained
  "tired": "😴",
  "empty": "🫗",
  "numb": "😐",
  "burned out": "🔥",
  "exhausted": "😮‍💨",
  "drained": "💧",
  "flat": "➖",
  "lifeless": "💀",
  // Heavy
  "sad": "😢",
  "disappointed": "😞",
  "lonely": "😔",
  "discouraged": "😓",
  "down": "⬇️",
  "gloomy": "☁️",
  "melancholy": "🌧️",
  "weighed down": "⚖️",
  // Overwhelmed
  "anxious": "😰",
  "stressed": "😓",
  "scattered": "💨",
  "pressured": "⏰",
  "swamped": "🌊",
  "flooded": "💦",
  "chaotic": "🌀",
  "unable to focus": "🎯",
  // Mixed
  "uncertain": "🤔",
  "okay": "😐",
  "conflicted": "⚖️",
  "reflective": "🤔",
  "neutral": "➖",
  "ambivalent": "↔️",
  "contemplative": "🧘",
  "processing": "⚙️",
  // Calm
  "peaceful": "🕊️",
  "centered": "🎯",
  "balanced": "⚖️",
  "serene": "🌊",
  "grounded": "🌱",
  "stable": "🏔️",
  "tranquil": "🌸",
  "at ease": "😌",
  // Hopeful
  "optimistic": "☀️",
  "encouraged": "💪",
  "motivated": "🚀",
  "inspired": "✨",
  "forward-looking": "👀",
  "promising": "🌟",
  "bright": "💡",
  "upward": "📈",
  // Positive
  "hopeful": "🌱",
  "curious": "🤔",
  "calm": "🌿",
  "engaged": "🎯",
  "content": "😊",
  "grateful": "🙏",
  // Energized
  "joyful": "😄",
  "excited": "🎉",
  "proud": "🦁",
  "elated": "🎊",
  "enthusiastic": "🔥",
  "vibrant": "🌈"
};
const AIResponseBubble = ({
  message,
  emotion,
  feeling,
  feelingEmoji,
  onActionClick,
  onMoodChange,
  encouragement,
  encouragementLoading
}) => {
  const { handleMoodLoopEntry } = useData();
  const [isVisible, setIsVisible] = reactExports.useState(false);
  const bubbleRef = reactExports.useRef(null);
  const touchStartX = reactExports.useRef(0);
  const mouseStartX = reactExports.useRef(0);
  const isDragging = reactExports.useRef(false);
  const [selectionLevel, setSelectionLevel] = reactExports.useState("none");
  const [currentPrimaryIndex, setCurrentPrimaryIndex] = reactExports.useState(-1);
  const [currentSubIndex, setCurrentSubIndex] = reactExports.useState(0);
  const currentPrimary = currentPrimaryIndex >= 0 ? EMOTIONAL_STATES[currentPrimaryIndex] : null;
  const hasLoadedLastEmotionRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (emotion || feeling || hasLoadedLastEmotionRef.current) return;
    const loadFirstEmotion = async () => {
      try {
        const { getDatabaseAdapter: getDatabaseAdapter2 } = await __vitePreload(async () => {
          const { getDatabaseAdapter: getDatabaseAdapter3 } = await Promise.resolve().then(() => databaseAdapter);
          return { getDatabaseAdapter: getDatabaseAdapter3 };
        }, true ? void 0 : void 0);
        const { getCurrentUser: getCurrentUser2 } = await __vitePreload(async () => {
          const { getCurrentUser: getCurrentUser3 } = await import("./ai-services-DJUX-74P.js").then((n) => n.K);
          return { getCurrentUser: getCurrentUser3 };
        }, true ? __vite__mapDeps([0,1,2,3,4]) : void 0);
        const user = await getCurrentUser2();
        if (!user?.id) {
          hasLoadedLastEmotionRef.current = true;
          return;
        }
        const adapter = getDatabaseAdapter2();
        await adapter.init();
        const firstLog = await adapter.getFirstFeelingLog(user.id);
        if (firstLog) {
          const firstEmotion = firstLog.emotionalState || firstLog.emotion;
          const firstFeeling = firstLog.selectedFeeling || firstLog.subEmotion;
          if (firstEmotion && firstFeeling) {
            const primaryIndex = EMOTIONAL_STATES.findIndex((e) => e.state === firstEmotion);
            if (primaryIndex >= 0) {
              setCurrentPrimaryIndex(primaryIndex);
              const feelings = EMOTIONAL_STATES[primaryIndex].feelings;
              const subIndex = feelings.findIndex((f) => f === firstFeeling);
              if (subIndex >= 0) {
                setCurrentSubIndex(subIndex);
                setSelectionLevel("sub");
                onMoodChange?.(firstEmotion, firstFeeling);
                logger.debug("[AIResponseBubble] Loaded first emotion from database:", { firstEmotion, firstFeeling });
              } else {
                setSelectionLevel("primary");
              }
            }
          }
        }
        hasLoadedLastEmotionRef.current = true;
      } catch (error) {
        logger.error("[AIResponseBubble] Error loading first emotion:", error);
        hasLoadedLastEmotionRef.current = true;
      }
    };
    loadFirstEmotion();
  }, [emotion, feeling, onMoodChange]);
  reactExports.useEffect(() => {
    if (emotion) {
      const primaryIndex = EMOTIONAL_STATES.findIndex((e) => e.state === emotion);
      if (primaryIndex >= 0) {
        setCurrentPrimaryIndex(primaryIndex);
        setSelectionLevel("primary");
        if (feeling) {
          const subIndex = EMOTIONAL_STATES[primaryIndex].feelings.findIndex((f) => f === feeling);
          if (subIndex >= 0) {
            setCurrentSubIndex(subIndex);
            setSelectionLevel("sub");
          }
        }
      }
    }
  }, [emotion, feeling]);
  reactExports.useEffect(() => {
    const bubble = bubbleRef.current;
    if (!bubble || !onMoodChange) return;
    const changeMood = (deltaX) => {
      if (Math.abs(deltaX) > 50) {
        if (selectionLevel === "primary" || selectionLevel === "none") {
          let newIndex = currentPrimaryIndex;
          if (currentPrimaryIndex < 0) {
            newIndex = deltaX > 0 ? EMOTIONAL_STATES.length - 1 : 0;
          } else {
            if (deltaX > 0) {
              newIndex = currentPrimaryIndex > 0 ? currentPrimaryIndex - 1 : EMOTIONAL_STATES.length - 1;
            } else {
              newIndex = currentPrimaryIndex < EMOTIONAL_STATES.length - 1 ? currentPrimaryIndex + 1 : 0;
            }
          }
          setCurrentPrimaryIndex(newIndex);
          setCurrentSubIndex(0);
          setSelectionLevel("primary");
        } else {
          if (currentPrimaryIndex < 0) return;
          const feelings = EMOTIONAL_STATES[currentPrimaryIndex].feelings;
          let newIndex = currentSubIndex;
          if (deltaX > 0) {
            newIndex = currentSubIndex > 0 ? currentSubIndex - 1 : feelings.length - 1;
          } else {
            newIndex = currentSubIndex < feelings.length - 1 ? currentSubIndex + 1 : 0;
          }
          setCurrentSubIndex(newIndex);
          const selectedFeeling = feelings[newIndex];
          onMoodChange?.(EMOTIONAL_STATES[currentPrimaryIndex].state, selectedFeeling);
          handleMoodLoopEntry(EMOTIONAL_STATES[currentPrimaryIndex].state, selectedFeeling).catch((error) => {
            logger.error("[AIResponseBubble] Error saving mood entry:", error);
          });
        }
      }
    };
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
    };
    const handleTouchEnd = (e) => {
      if (!touchStartX.current) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;
      changeMood(deltaX);
      touchStartX.current = 0;
    };
    const handleMouseDown = (e) => {
      isDragging.current = true;
      mouseStartX.current = e.clientX;
      e.preventDefault();
    };
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
    };
    const handleMouseUp = (e) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const deltaX = e.clientX - mouseStartX.current;
      changeMood(deltaX);
      mouseStartX.current = 0;
    };
    bubble.addEventListener("touchstart", handleTouchStart, { passive: true });
    bubble.addEventListener("touchend", handleTouchEnd, { passive: true });
    bubble.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      bubble.removeEventListener("touchstart", handleTouchStart);
      bubble.removeEventListener("touchend", handleTouchEnd);
      bubble.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [selectionLevel, currentPrimaryIndex, currentSubIndex, onMoodChange, handleMoodLoopEntry]);
  reactExports.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  const handleActionClick = reactExports.useCallback((action) => {
    onActionClick?.(action);
  }, [onActionClick]);
  const handlePrimaryClick = () => {
    if (currentPrimaryIndex < 0) {
      setCurrentPrimaryIndex(0);
    }
    setSelectionLevel("primary");
  };
  const handleSubClick = () => {
    if (currentPrimaryIndex < 0) return;
    setSelectionLevel("sub");
    const selectedFeeling = currentPrimary.feelings[currentSubIndex];
    onMoodChange?.(currentPrimary.state, selectedFeeling);
    handleMoodLoopEntry(currentPrimary.state, selectedFeeling).catch((error) => {
      logger.error("[AIResponseBubble] Error saving mood entry:", error);
    });
  };
  const currentSubFeeling = currentPrimary ? currentPrimary.feelings[currentSubIndex] || currentPrimary.feelings[0] : null;
  const subFeelingEmoji = currentSubFeeling ? FEELING_EMOJIS[currentSubFeeling] || "" : "";
  const showSwipeHint = onMoodChange;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      ref: bubbleRef,
      initial: { opacity: 0, y: 20 },
      animate: { opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 },
      transition: { duration: 0.5, ease: "easeOut" },
      className: "bg-navy-light/10 dark:bg-dark-bg-secondary rounded-3xl p-6 space-y-4 relative",
      children: [
        showSwipeHint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-left text-xs sm:text-sm text-text-secondary dark:text-white/50 mb-2", children: "← Swipe or drag to change →" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity",
            onClick: handlePrimaryClick,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
              (selectionLevel === "primary" || selectionLevel === "none") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.span,
                {
                  className: "text-navy-primary dark:text-yellow-warm text-2xl sm:text-3xl font-bold",
                  animate: {
                    x: [0, 5, 0]
                  },
                  transition: {
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  },
                  children: "→"
                }
              ),
              currentPrimaryIndex >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-navy-primary dark:bg-yellow-warm rounded-full flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white dark:text-navy-dark text-lg sm:text-xl", children: currentPrimary.emoji }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base sm:text-lg font-semibold text-navy-primary dark:text-yellow-warm capitalize", children: currentPrimary.shortLabel })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-bg-secondary dark:bg-dark-bg-secondary rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-navy-primary/50 dark:border-yellow-warm/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-secondary dark:text-white/50 text-lg sm:text-xl", children: "?" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base sm:text-lg font-semibold text-text-secondary dark:text-white/70", children: "Select" })
              ] })
            ] })
          }
        ),
        currentPrimaryIndex >= 0 && currentPrimary && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity ml-8 sm:ml-10",
            onClick: handleSubClick,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
              selectionLevel === "sub" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.span,
                {
                  className: "text-navy-primary dark:text-yellow-warm text-2xl sm:text-3xl font-bold",
                  animate: {
                    x: [0, 5, 0]
                  },
                  transition: {
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  },
                  children: "→"
                }
              ),
              subFeelingEmoji && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg sm:text-xl", children: subFeelingEmoji }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm sm:text-base text-text-secondary dark:text-white/70 capitalize", children: currentSubFeeling })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-primary dark:text-white leading-relaxed", children: message }),
        onActionClick && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary dark:text-white/70", children: "Would you like to:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleActionClick("reflection"),
                className: "w-full bg-white dark:bg-dark-bg-tertiary text-text-primary dark:text-white rounded-xl p-4 text-left font-medium shadow-sm hover:shadow-md transition-all active:scale-98",
                children: "📝 Write a reflection"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleActionClick("values"),
                className: "w-full bg-white dark:bg-dark-bg-tertiary text-text-primary dark:text-white rounded-xl p-4 text-left font-medium shadow-sm hover:shadow-md transition-all active:scale-98",
                children: "🎯 See your values"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleActionClick("resources"),
                className: "w-full bg-white dark:bg-dark-bg-tertiary text-text-primary dark:text-white rounded-xl p-4 text-left font-medium shadow-sm hover:shadow-md transition-all active:scale-98",
                children: "📞 View resources"
              }
            )
          ] })
        ] })
      ]
    }
  );
};
const AIResponseBubble$1 = React.memo(AIResponseBubble);
const SESSION_TIMEOUT = 15 * 60 * 1e3;
const LAST_ACTIVITY_KEY = "encrypted_session_last_activity";
const SESSION_USER_ID_KEY = "encrypted_session_user_id";
function useAuth() {
  const [authState, setAuthState] = reactExports.useState({
    isAuthenticated: false,
    isUnlocking: false,
    error: null,
    userId: null
  });
  const isEncryptionEnabled2 = () => {
    return localStorage.getItem("encryption_enabled") === "true";
  };
  const isSessionValid = reactExports.useCallback(() => {
    if (!isEncryptionEnabled2()) {
      return true;
    }
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) {
      return false;
    }
    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const timeSinceActivity = now - lastActivityTime;
    return timeSinceActivity < SESSION_TIMEOUT;
  }, []);
  const updateLastActivity = reactExports.useCallback(() => {
    if (isEncryptionEnabled2()) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  }, []);
  reactExports.useEffect(() => {
    if (!isEncryptionEnabled2()) {
      setAuthState({
        isAuthenticated: true,
        isUnlocking: false,
        error: null,
        userId: null
      });
      return;
    }
    const encryptedDb = EncryptedPWA.getInstance();
    if (encryptedDb && isSessionValid()) {
      const userId = parseInt(localStorage.getItem(SESSION_USER_ID_KEY) || "0", 10);
      setAuthState({
        isAuthenticated: true,
        isUnlocking: false,
        error: null,
        userId
      });
      updateLastActivity();
    } else {
      setAuthState({
        isAuthenticated: false,
        isUnlocking: false,
        error: null,
        userId: null
      });
    }
  }, [isSessionValid, updateLastActivity]);
  const handleLogout = reactExports.useCallback(() => {
    if (!isEncryptionEnabled2()) {
      return;
    }
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.removeItem(SESSION_USER_ID_KEY);
    setAuthState({
      isAuthenticated: false,
      isUnlocking: false,
      error: null,
      userId: null
    });
  }, []);
  reactExports.useEffect(() => {
    if (!isEncryptionEnabled2() || !authState.isAuthenticated) {
      return;
    }
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handleActivity = () => {
      updateLastActivity();
    };
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    const checkInterval = setInterval(() => {
      if (!isSessionValid()) {
        handleLogout();
      }
    }, 6e4);
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(checkInterval);
    };
  }, [authState.isAuthenticated, isSessionValid, updateLastActivity, handleLogout]);
  const login = reactExports.useCallback(async (password, userId) => {
    if (!isEncryptionEnabled2()) {
      return true;
    }
    setAuthState((prev) => ({ ...prev, isUnlocking: true, error: null }));
    try {
      const encryptedDb = await EncryptedPWA.init(password, userId);
      if (encryptedDb) {
        localStorage.setItem(SESSION_USER_ID_KEY, userId.toString());
        updateLastActivity();
        setAuthState({
          isAuthenticated: true,
          isUnlocking: false,
          error: null,
          userId
        });
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to unlock database";
      setAuthState((prev) => ({
        ...prev,
        isUnlocking: false,
        error: errorMessage
      }));
      return false;
    }
  }, [updateLastActivity]);
  return {
    ...authState,
    login,
    logout: handleLogout,
    updateActivity: updateLastActivity,
    isEncryptionEnabled: isEncryptionEnabled2()
  };
}
const Login = ({ onLogin }) => {
  const auth = useAuth();
  const [mode, setMode] = reactExports.useState("login");
  const [username, setUsername] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [resetToken, setResetToken] = reactExports.useState("");
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [resetLink, setResetLink] = reactExports.useState("");
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = reactExports.useState(false);
  const [showNewPassword, setShowNewPassword] = reactExports.useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = reactExports.useState(false);
  const [modelProgress, setModelProgress] = reactExports.useState(getCurrentProgress());
  const progressTimeoutRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      const resetMatch = hash.match(/^#reset\/(.+)$/);
      if (resetMatch) {
        setResetToken(resetMatch[1]);
        setMode("reset");
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => {
      window.removeEventListener("hashchange", checkHash);
    };
  }, []);
  reactExports.useEffect(() => {
    const unsubscribe = subscribeToProgress((state) => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
        progressTimeoutRef.current = null;
      }
      if (state.status === "loading" && state.progress > 0) {
        setModelProgress(state);
      } else if (state.status === "success" && state.progress === 100) {
        setModelProgress({ ...state, label: "AI models ready" });
        progressTimeoutRef.current = setTimeout(() => {
          setModelProgress((prev) => ({ ...prev, status: "idle", progress: 0 }));
          progressTimeoutRef.current = null;
        }, 1500);
      } else if (state.status === "idle") {
        setModelProgress((prev) => ({ ...prev, status: "idle", progress: 0 }));
      }
    });
    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
        progressTimeoutRef.current = null;
      }
      unsubscribe();
    };
  }, []);
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    const result = await registerUser({ username, password, email });
    setLoading(false);
    if (result.success) {
      const loginResult = await loginUser({ username, password });
      if (loginResult.success && loginResult.userId) {
        onLogin(loginResult.userId);
      }
    } else {
      setError(result.error || "Registration failed");
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginUser({ username, password });
      if (!result.success || !result.userId) {
        setError(result.error || "Login failed");
        setLoading(false);
        return;
      }
      if (auth.isEncryptionEnabled) {
        let numericUserId;
        const numericMatch = result.userId.match(/\d+/);
        if (numericMatch) {
          numericUserId = parseInt(numericMatch[0], 10);
        } else {
          let hash = 0;
          for (let i = 0; i < result.userId.length; i++) {
            const char = result.userId.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
          }
          numericUserId = Math.abs(hash);
        }
        const unlockSuccess = await auth.login(password, numericUserId);
        if (!unlockSuccess) {
          setError(auth.error || "Failed to unlock encrypted database");
          setLoading(false);
          return;
        }
      }
      setLoading(false);
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("app_init_started");
        sessionStorage.removeItem("app_init_complete");
      }
      onLogin(result.userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (result.success && result.resetLink) {
      setResetLink(result.resetLink);
      setError("");
    } else {
      setError(result.error || "Failed to generate reset link");
    }
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    const result = await resetPasswordWithToken(resetToken, newPassword);
    setLoading(false);
    if (result.success) {
      setError("");
      alert("Password reset successful! Please login with your new password.");
      setMode("login");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(result.error || "Failed to reset password");
    }
  };
  const copyResetLink = () => {
    navigator.clipboard.writeText(resetLink);
    alert("Reset link copied to clipboard! Save this link to reset your password.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center p-4 sm:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full bg-white dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl shadow-2xl border border-border-soft dark:border-dark-border/30 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 sm:p-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: "/ac-minds-logo.png",
            alt: "AC MINDS",
            className: "w-12 h-12 sm:w-16 sm:h-16 object-contain mx-auto"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight", children: "Grounded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm sm:text-base text-text-primary/60 dark:text-white/60", children: [
          mode === "login" && "Sign in to continue",
          mode === "register" && "Create your account",
          mode === "forgot" && "Reset your password",
          mode === "reset" && "Set new password"
        ] })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700 dark:text-red-300", children: error }) }),
      resetLink && mode === "forgot" && /* PREV: bg-yellow-warm/20 ... border-yellow-warm/50 */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-brand/10 dark:bg-brand/20 border border-brand/30 dark:border-brand-light/30 rounded-lg p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-text-primary dark:text-white", children: "Reset Link Generated" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-primary/70 dark:text-white/70", children: "Copy this link to reset your password. It will expire in 24 hours." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: resetLink,
              readOnly: true,
              className: "flex-1 px-3 py-2 bg-white dark:bg-dark-bg-primary rounded-lg text-xs border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: copyResetLink,
              className: "px-4 py-2 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90",
              children: "Copy"
            }
          )
        ] })
      ] }),
      mode === "login" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2", children: "Username" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              required: true,
              autoComplete: "username",
              className: "w-full px-4 py-3 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-brand/50 dark:focus:ring-brand-light/50 outline-none",
              placeholder: "Enter your username"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: showPassword ? "text" : "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                autoComplete: "current-password",
                className: "w-full px-4 py-3 pr-12 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-brand/50 dark:focus:ring-brand-light/50 outline-none",
                placeholder: "Enter your password"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors",
                "aria-label": showPassword ? "Hide password" : "Show password",
                children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                ] })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full py-3 sm:py-4 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg",
            children: loading ? "Signing in..." : "Sign In"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between gap-2 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setMode("register"),
              className: "text-xs sm:text-sm text-brand dark:text-brand-light hover:underline",
              children: "Create Account"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setMode("forgot"),
              className: "text-xs sm:text-sm text-text-primary/60 dark:text-white/60 hover:underline",
              children: "Forgot Password?"
            }
          )
        ] })
      ] }),
      mode === "register" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleRegister, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2", children: "Username" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              required: true,
              minLength: 3,
              autoComplete: "username",
              className: "w-full px-4 py-3 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-brand/50 dark:focus:ring-brand-light/50 outline-none",
              placeholder: "Choose a username (min 3 characters)"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              className: "w-full px-4 py-3 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-brand/50 dark:focus:ring-brand-light/50 outline-none",
              placeholder: "your.email@example.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: showPassword ? "text" : "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                minLength: 6,
                autoComplete: "new-password",
                className: "w-full px-4 py-3 pr-12 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-brand/50 dark:focus:ring-brand-light/50 outline-none",
                placeholder: "Choose a password (min 6 characters)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors",
                "aria-label": showPassword ? "Hide password" : "Show password",
                children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                ] })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2", children: "Confirm Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: showConfirmPassword ? "text" : "password",
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                required: true,
                minLength: 6,
                autoComplete: "new-password",
                className: "w-full px-4 py-3 pr-12 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-brand/50 dark:focus:ring-brand-light/50 outline-none",
                placeholder: "Confirm your password"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowConfirmPassword(!showConfirmPassword),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors",
                "aria-label": showConfirmPassword ? "Hide password" : "Show password",
                children: showConfirmPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                ] })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full py-3 sm:py-4 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg",
            children: loading ? "Creating Account..." : "Create Account"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setMode("login"),
            className: "text-xs sm:text-sm text-brand dark:text-brand-light hover:underline",
            children: "Already have an account? Sign In"
          }
        ) })
      ] }),
      mode === "forgot" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleForgotPassword, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2", children: "Email Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              className: "w-full px-4 py-3 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-brand/50 dark:focus:ring-brand-light/50 outline-none",
              placeholder: "Enter your email address"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-primary/60 dark:text-white/60", children: "A reset link will be generated. Copy and save it to reset your password." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full py-3 sm:py-4 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg",
            children: loading ? "Generating Link..." : "Generate Reset Link"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setMode("login");
              setEmail("");
              setResetLink("");
            },
            className: "text-xs sm:text-sm text-brand dark:text-brand-light hover:underline",
            children: "Back to Sign In"
          }
        ) })
      ] }),
      mode === "reset" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleResetPassword, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2", children: "New Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: showNewPassword ? "text" : "password",
                value: newPassword,
                onChange: (e) => setNewPassword(e.target.value),
                required: true,
                minLength: 6,
                autoComplete: "new-password",
                className: "w-full px-4 py-3 pr-12 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-brand/50 dark:focus:ring-brand-light/50 outline-none",
                placeholder: "Enter new password (min 6 characters)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowNewPassword(!showNewPassword),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors",
                "aria-label": showNewPassword ? "Hide password" : "Show password",
                children: showNewPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                ] })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2", children: "Confirm New Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: showResetConfirmPassword ? "text" : "password",
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                required: true,
                minLength: 6,
                autoComplete: "new-password",
                className: "w-full px-4 py-3 pr-12 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-brand/50 dark:focus:ring-brand-light/50 outline-none",
                placeholder: "Confirm new password"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowResetConfirmPassword(!showResetConfirmPassword),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors",
                "aria-label": showResetConfirmPassword ? "Hide password" : "Show password",
                children: showResetConfirmPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                ] })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full py-3 sm:py-4 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg",
            children: loading ? "Resetting Password..." : "Reset Password"
          }
        )
      ] })
    ] }),
    (modelProgress.status === "loading" || modelProgress.status === "success" && modelProgress.progress === 100) && modelProgress.progress > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border-soft dark:border-dark-border/30 pt-3 mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: modelProgress.label || "Initializing..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
          Math.round(modelProgress.progress),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-0.5 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-full bg-navy-primary/50 dark:bg-navy-primary/40 rounded-full transition-all duration-300 ease-out",
          style: { width: `${Math.max(0, Math.min(100, modelProgress.progress))}%` }
        }
      ) }),
      modelProgress.details && modelProgress.status === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 dark:text-gray-500 mt-1", children: modelProgress.details })
    ] })
  ] }) });
};
const TermsAcceptance = ({ onAccept, onDecline }) => {
  const [readTerms, setReadTerms] = reactExports.useState(false);
  const [readDisclaimer, setReadDisclaimer] = reactExports.useState(false);
  const canAccept = readTerms && readDisclaimer;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl w-full bg-white dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl shadow-2xl border border-border-soft dark:border-dark-border/30 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight", children: "Acceptance of Terms and Conditions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base text-text-primary/60 dark:text-white/60", children: "Please read the following information carefully before using this app." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-text-primary dark:text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base leading-relaxed", children: 'By selecting "I Accept," you confirm that you have read, understood, and agree to the Terms and Conditions governing the use of this application ("the App").' }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 border-t border-border-soft dark:border-dark-border/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg sm:text-xl font-black text-text-primary dark:text-white", children: "DISCLAIMER" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm sm:text-base leading-relaxed", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "This App is designed for general wellness and informational purposes only. It is ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "not" }),
              " a substitute for professional therapy, medical advice, diagnosis, or treatment."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You should always seek help from a licensed therapist, counselor, psychiatrist, or other qualified healthcare provider for mental health concerns." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "If you are in crisis or believe you may be in danger, do not use this App as a source of emergency support. Please contact local emergency services or crisis resources immediately." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-primary dark:bg-dark-bg-primary/50 rounded-lg p-4 sm:p-5 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-sm sm:text-base", children: "In the United States:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-sm sm:text-base list-disc list-inside ml-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "Call ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "911" }),
                " for emergencies"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "988 Suicide and Crisis Lifeline" }),
                " – Dial 988 (24/7, free, confidential)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Crisis Text Line" }),
                " – Text HOME to 741741"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "National Domestic Violence Hotline" }),
                " – 1-800-799-SAFE (7233)"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base leading-relaxed pt-2", children: "By proceeding, you acknowledge that you understand and agree to these terms and that you accept full responsibility for your use of the App." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 border-t border-border-soft dark:border-dark-border/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg sm:text-xl font-black text-text-primary dark:text-white", children: "CRISIS DETECTION & SAFETY" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm sm:text-base leading-relaxed", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "This app includes automatic crisis detection" }),
              " to help protect your safety and wellbeing. The app monitors your journal entries and reflections for language that may indicate you are in crisis or at risk of self-harm."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "If the app detects crisis language, it will:" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Immediately stop normal AI responses" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Display crisis resources and emergency contact information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Encourage you to contact professional help or emergency services" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Provide direct links to crisis hotlines and support resources" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-red-800 dark:text-red-300 mb-2", children: "⚠️ Important Safety Information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-red-700 dark:text-red-200 text-sm", children: [
                "The app treats ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "any direct or indirect self-harm language as a crisis trigger" }),
                ", even if used hypothetically or in a joking manner. This is to ensure your safety. All suicide and self-harm mentions are taken seriously and will trigger immediate crisis guidance."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer font-bold text-text-primary dark:text-white hover:text-yellow-warm", children: "View Crisis Detection Categories (Click to expand)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-4 pl-4 border-l-2 border-border-soft dark:border-dark-border/30", children: Array.from(new Set(ALL_CRISIS_PHRASES.map((p) => p.category))).map((category) => {
                const categoryPhrases = ALL_CRISIS_PHRASES.filter((p) => p.category === category);
                const severity = categoryPhrases[0]?.severity || "moderate";
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm", children: [
                    getCategoryDisplayName(category),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-2 px-2 py-0.5 rounded text-xs ${severity === "critical" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" : severity === "high" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"}`, children: severity.toUpperCase() })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-primary/70 dark:text-white/70", children: [
                    'The app monitors for phrases like: "',
                    categoryPhrases.slice(0, 3).map((p) => p.phrase).join('", "'),
                    '" and ',
                    categoryPhrases.length - 3 > 0 ? `${categoryPhrases.length - 3} more similar phrases` : "similar phrases",
                    "."
                  ] })
                ] }, category);
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-primary/60 dark:text-white/60 italic pt-2", children: "These crisis detection phrases are hardcoded into the app and cannot be modified or disabled. This ensures consistent safety monitoring regardless of settings." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 border-t border-border-soft dark:border-dark-border/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: readTerms,
              onChange: (e) => setReadTerms(e.target.checked),
              className: "mt-1 w-5 h-5 rounded border-2 border-text-primary/30 dark:border-white/30 text-yellow-warm focus:ring-2 focus:ring-yellow-warm/50 cursor-pointer"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm sm:text-base text-text-primary dark:text-white leading-relaxed flex-1", children: "I have read and understand the Terms and Conditions." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: readDisclaimer,
              onChange: (e) => setReadDisclaimer(e.target.checked),
              className: "mt-1 w-5 h-5 rounded border-2 border-text-primary/30 dark:border-white/30 text-yellow-warm focus:ring-2 focus:ring-yellow-warm/50 cursor-pointer"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm sm:text-base text-text-primary dark:text-white leading-relaxed flex-1", children: "I acknowledge this App does not replace professional therapy or emergency resources." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onDecline,
            className: "flex-1 px-6 py-3 sm:py-4 bg-bg-primary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-80 transition-all border border-border-soft dark:border-dark-border/30",
            children: "Decline"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onAccept,
            disabled: !canAccept,
            className: `flex-1 px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base transition-all ${canAccept ? "bg-yellow-warm text-text-primary hover:opacity-90 shadow-lg active:scale-[0.98]" : "bg-border-soft dark:bg-dark-bg-primary/30 text-text-tertiary dark:text-white/30 cursor-not-allowed"}`,
            children: "Accept"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #cbd5e1; 
          border-radius: 10px; 
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #4a5568; 
        }
      ` })
  ] });
};
const MarkdownRenderer = ({ children, className = "" }) => {
  if (!children) return null;
  const blocks = children.split(/\n\n+/);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `space-y-4 ${className}`, children: blocks.map((block, index) => {
    if (block.startsWith("### ")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-navy-primary dark:text-white mt-4 mb-2", children: parseInline(block.replace("### ", "")) }, index);
    }
    if (block.startsWith("## ")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black text-navy-primary dark:text-white mt-6 mb-3 border-b border-border-soft dark:border-dark-border pb-2", children: parseInline(block.replace("## ", "")) }, index);
    }
    if (block.startsWith("# ")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black text-navy-primary dark:text-white mt-6 mb-4", children: parseInline(block.replace("# ", "")) }, index);
    }
    if (block.startsWith("- ") || block.startsWith("* ")) {
      const items = block.split("\n").map((line) => line.replace(/^[-*] /, ""));
      return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc pl-5 space-y-1 text-text-primary dark:text-white", children: items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: parseInline(item) }, i)) }, index);
    }
    if (/^\d+\.\s/.test(block)) {
      const items = block.split("\n").map((line) => line.replace(/^\d+\.\s/, ""));
      return /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "list-decimal pl-5 space-y-1 text-text-primary dark:text-white", children: items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: parseInline(item) }, i)) }, index);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base leading-relaxed text-text-primary dark:text-white", children: parseInline(block) }, index);
  }) });
};
const parseInline = (text) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-bold text-navy-primary dark:text-brand-light", children: part.slice(2, -2) }, i);
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "italic", children: part.slice(1, -1) }, i);
    }
    return part;
  });
};
const GoalsSection = ({
  goals,
  values,
  onCompleteGoal,
  onDeleteGoal
}) => {
  const activeGoals = goals.filter((g) => !g.completed);
  if (activeGoals.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 pt-4 sm:pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-brand/10 dark:bg-brand/20 border border-brand/30 dark:border-brand/30 rounded-xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-text-primary dark:text-white mb-2", children: "Set Goals Based on Your Values 🌱" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary dark:text-white/70 leading-relaxed mb-3", children: "Goals help you turn your values into actionable commitments. Create goals that align with your selected values to track your progress and build momentum." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-text-secondary dark:text-white/70 leading-relaxed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "To get started:" }),
        " Navigate to your values, select a value, and add a goal. You can also write a reflection to generate AI-suggested goals based on your values."
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-4 sm:pt-6 border-t border-border-soft dark:border-dark-border/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm sm:text-base font-black text-text-primary dark:text-white tracking-tight", children: "Active Commitments" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest", children: 'The "Work"' })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: activeGoals.map((goal) => {
      const val = values.find((v) => v.id === goal.valueId);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-primary p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border/30 shadow-sm relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 sm:top-3 right-3 sm:right-4 px-1.5 py-0.5 bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light rounded-md text-xs font-black uppercase tracking-widest", children: goal.frequency }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-light" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest", children: val?.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm sm:text-base font-bold text-text-primary dark:text-white mb-3 sm:mb-4 leading-snug pr-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MarkdownRenderer, { children: goal.text }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => onCompleteGoal(goal),
              className: "flex-1 py-2 bg-calm-sage dark:bg-calm-sage text-white rounded-lg text-xs sm:text-sm font-black uppercase tracking-widest shadow-sm hover:opacity-90",
              children: "Done"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => onDeleteGoal(goal.id),
              className: "w-8 h-8 bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/30 dark:text-white/30 rounded-lg hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" }) })
            }
          )
        ] })
      ] }, goal.id);
    }) })
  ] });
};
const GoalsSection$1 = React.memo(GoalsSection);
const ALL_VALUES = [
  // Character
  { id: "v1", name: "Integrity", description: "Being honest and having strong moral principles.", category: "Character" },
  { id: "v19", name: "Authenticity", description: "Being true to one's own personality or spirit.", category: "Character" },
  { id: "v24", name: "Resilience", description: "The capacity to recover quickly from difficulties.", category: "Character" },
  { id: "v25", name: "Responsibility", description: "Having a duty to deal with something.", category: "Character" },
  { id: "v26", name: "Courage", description: "The ability to do something that frightens one.", category: "Character" },
  { id: "v27", name: "Humility", description: "A modest or low view of one's own importance.", category: "Character" },
  // Relationships
  { id: "v2", name: "Family", description: "Prioritizing the well-being of loved ones.", category: "Relationships" },
  { id: "v7", name: "Kindness", description: "Being friendly, generous, and considerate.", category: "Relationships" },
  { id: "v11", name: "Respect", description: "Deep admiration for someone or something.", category: "Relationships" },
  { id: "v20", name: "Compassion", description: "Concern for the sufferings or misfortunes of others.", category: "Relationships" },
  { id: "v23", name: "Loyalty", description: "Giving or showing firm and constant support.", category: "Relationships" },
  { id: "v28", name: "Community", description: "A feeling of fellowship with others.", category: "Relationships" },
  // Expression & Creativity
  { id: "v3", name: "Creativity", description: "Using imagination to create something new.", category: "Expression" },
  { id: "v21", name: "Humor", description: "The quality of being amusing or comic.", category: "Expression" },
  { id: "v29", name: "Artistry", description: "Creative skill or ability.", category: "Expression" },
  { id: "v30", name: "Curiosity", description: "A strong desire to know or learn something.", category: "Expression" },
  // Well-being & Environment
  { id: "v5", name: "Health", description: "Maintaining physical and mental well-being.", category: "Well-being" },
  { id: "v10", name: "Peace", description: "Freedom from disturbance; tranquility.", category: "Well-being" },
  { id: "v9", name: "Nature", description: "Appreciation and care for the natural world.", category: "Environment" },
  { id: "v31", name: "Balance", description: "Stability or even distribution of effort.", category: "Well-being" },
  { id: "v32", name: "Sustainability", description: "Avoiding depletion of natural resources.", category: "Environment" },
  // Growth & Learning
  { id: "v8", name: "Learning", description: "The acquisition of knowledge or skills.", category: "Growth" },
  { id: "v14", name: "Spirituality", description: "Connection to something bigger than oneself.", category: "Growth" },
  { id: "v17", name: "Wisdom", description: "Experience, knowledge, and good judgment.", category: "Growth" },
  { id: "v33", name: "Open-Mindedness", description: "Willingness to consider new ideas.", category: "Growth" },
  // Achievement & Influence
  { id: "v15", name: "Success", description: "The accomplishment of an aim or purpose.", category: "Achievement" },
  { id: "v16", name: "Wealth", description: "An abundance of valuable possessions.", category: "Achievement" },
  { id: "v22", name: "Leadership", description: "Leading a group or an organization.", category: "Influence" },
  { id: "v34", name: "Impact", description: "Having a strong effect on someone or something.", category: "Influence" },
  // Society & Autonomy
  { id: "v4", name: "Freedom", description: "The power to act, speak, or think without restraint.", category: "Autonomy" },
  { id: "v6", name: "Justice", description: "Upholding what is right and fair.", category: "Society" },
  { id: "v13", name: "Service", description: "Helping others and contributing to society.", category: "Society" },
  { id: "v18", name: "Adventure", description: "Engaging in exciting experiences.", category: "Autonomy" }
];
const emailTemplateCache = /* @__PURE__ */ new Map();
function getCachedTemplate(key, generator) {
  if (emailTemplateCache.has(key)) {
    return emailTemplateCache.get(key);
  }
  const template = generator();
  emailTemplateCache.set(key, template);
  return template;
}
function isWebShareAvailable() {
  return typeof navigator !== "undefined" && "share" in navigator;
}
async function shareViaEmail(emailData, recipientEmails = []) {
  try {
    if (isWebShareAvailable()) {
      const shareData = {
        title: emailData.subject,
        text: emailData.body
      };
      try {
        await navigator.share(shareData);
        return true;
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Web Share failed, using mailto fallback:", error);
        }
      }
    }
    return openMailtoLink(emailData, recipientEmails);
  } catch (error) {
    console.error("Email share error:", error);
    return false;
  }
}
function openMailtoLink(emailData, recipientEmails) {
  try {
    const to = recipientEmails.length > 0 ? recipientEmails.join(",") : "";
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailData.body);
    const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    return true;
  } catch (error) {
    console.error("Mailto link error:", error);
    return false;
  }
}
function formatReportForEmail(reportText) {
  if (!reportText) return "";
  let formatted = reportText;
  formatted = formatted.replace(/^# (.+)$/gm, "\n\n═══════════════════════════════════════════════════════════════\n$1\n═══════════════════════════════════════════════════════════════\n");
  formatted = formatted.replace(/^## (.+)$/gm, "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n$1\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  formatted = formatted.replace(/^### (.+)$/gm, "\n\n$1\n────────────────────────────────────────────────────────────────\n");
  formatted = formatted.replace(/^#### (.+)$/gm, "\n\n$1\n────────────────────────────────\n");
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, "$1");
  formatted = formatted.replace(/\*(.+?)\*/g, "$1");
  formatted = formatted.replace(/^[-*] (.+)$/gm, "  • $1");
  formatted = formatted.replace(/^\d+\. (.+)$/gm, "  $1");
  formatted = formatted.replace(/\n{3,}/g, "\n\n");
  formatted = formatted.replace(/(═══════════════════════════════════════════════════════════════)/g, "\n$1\n");
  return formatted.trim();
}
function generateEmailReport(logs, values, reportText) {
  const dateRange = logs.length > 0 ? `${new Date(logs[logs.length - 1].date).toLocaleDateString()} - ${new Date(logs[0].date).toLocaleDateString()}` : "No date range";
  const subject = `Grounded Therapy Integration Report - ${dateRange}`;
  let body = "";
  if (reportText) {
    body = formatReportForEmail(reportText);
  } else {
    body = `Grounded by AC MiNDS - Therapy Integration Summary

`;
    body += `Date Range: ${dateRange}
`;
    body += `Total Entries: ${logs.length}

`;
    if (logs.length > 0) {
      body += `Recent Activity:
`;
      logs.slice(0, 10).forEach((log) => {
        const value = values.find((v) => v.id === log.valueId);
        let entry = `
- ${new Date(log.date).toLocaleDateString()}: ${value?.name || "General"}`;
        if (log.deepReflection) {
          entry += `
  Deep Reflection: ${log.deepReflection}`;
        }
        if (log.goalText) {
          entry += `
  Committed Action/Goal: ${log.goalText}`;
        }
        if (log.reflectionAnalysis) {
          entry += `
  Suggested Next Steps: ${log.reflectionAnalysis}`;
        }
        if (log.emotionalState) {
          entry += `
  Emotional State: ${log.emotionalState}`;
          if (log.selectedFeeling) {
            entry += ` (${log.selectedFeeling})`;
          }
        }
        if (log.note && !log.deepReflection) {
          entry += `
  Note: ${log.note}`;
        }
        entry += "\n";
        body += entry;
      });
    }
  }
  body += `

────────────────────────────────────────────────────────────────
`;
  body += `This report was generated by Grounded by AC MiNDS, a privacy-first therapy integration app.
`;
  body += `All data processing happens on-device. This report is for sharing with your LCSW.
`;
  return { subject, body };
}
function generateGoalsEmail(goals, values, completedGoals, includeUpdates = true) {
  const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString();
  const subject = `Grounded Goals Update - ${dateStr}`;
  const headerTemplate = getCachedTemplate(
    "goals_email_header",
    () => `Grounded by AC MiNDS - Goals & Progress Update

`
  );
  let body = headerTemplate;
  body += `Date: ${dateStr}

`;
  if (completedGoals.length > 0) {
    body += `✅ Completed Goals:
`;
    completedGoals.forEach((goal) => {
      const value = values.find((v) => v.id === goal.valueId);
      body += `
- ${value?.name || "General"}: ${goal.text}
`;
      if (goal.updates.length > 0 && includeUpdates) {
        body += `  Progress Updates:
`;
        goal.updates.forEach((update) => {
          body += `    • ${new Date(update.timestamp).toLocaleDateString()}${update.mood ? ` ${update.mood}` : ""}: ${update.note}
`;
        });
      } else if (goal.updates.length > 0) {
        body += `  Total Updates: ${goal.updates.length}
`;
      }
    });
    body += `
`;
  }
  const activeGoals = goals.filter((g) => !g.completed);
  if (activeGoals.length > 0) {
    body += `📋 Active Goals & Progress:
`;
    activeGoals.forEach((goal) => {
      const value = values.find((v) => v.id === goal.valueId);
      body += `
- ${value?.name || "General"}: ${goal.text}
`;
      body += `  Frequency: ${goal.frequency}
`;
      if (goal.updates.length > 0) {
        if (includeUpdates) {
          body += `  Recent Progress Updates:
`;
          goal.updates.slice().reverse().slice(0, 5).forEach((update) => {
            body += `    • ${new Date(update.timestamp).toLocaleDateString()}${update.mood ? ` ${update.mood}` : ""}: ${update.note}
`;
          });
          if (goal.updates.length > 5) {
            body += `    ... and ${goal.updates.length - 5} more update(s)
`;
          }
        } else {
          body += `  Total Updates: ${goal.updates.length}
`;
        }
      } else {
        body += `  No updates yet
`;
      }
    });
  }
  body += `

---
`;
  body += `This update was generated by Grounded by AC MiNDS.
`;
  body += `Regular progress updates help track growth and inform therapy sessions.
`;
  return { subject, body };
}
function generateDataExportEmail(logs, goals, values, settings) {
  const subject = `Grounded Complete Data Export - ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`;
  let body = `Grounded by AC MiNDS - Complete Data Export

`;
  body += `Export Date: ${(/* @__PURE__ */ new Date()).toISOString()}
`;
  body += `Total Logs: ${logs.length}
`;
  body += `Total Goals: ${goals.length}
`;
  body += `Active Values: ${values.length}

`;
  body += `=== LOGS ===

`;
  if (logs.length === 0) {
    body += `No logs recorded.

`;
  } else {
    logs.forEach((log) => {
      const value = values.find((v) => v.id === log.valueId);
      body += `[${new Date(log.date).toLocaleDateString()}] ${value?.name || "General"}
`;
      body += `Mood: ${log.mood || "N/A"}
`;
      body += `Note: ${log.note}
`;
      if (log.goalText) {
        body += `Related Goal: ${log.goalText}
`;
      }
      body += `
`;
    });
  }
  body += `=== GOALS ===

`;
  if (goals.length === 0) {
    body += `No goals set.

`;
  } else {
    goals.forEach((goal) => {
      const value = values.find((v) => v.id === goal.valueId);
      body += `${goal.completed ? "✅" : "📋"} ${value?.name || "General"}
`;
      body += `Goal: ${goal.text}
`;
      body += `Frequency: ${goal.frequency}
`;
      body += `Created: ${new Date(goal.createdAt).toLocaleDateString()}
`;
      if (goal.updates.length > 0) {
        body += `Updates:
`;
        goal.updates.forEach((update) => {
          body += `  - ${new Date(update.timestamp).toLocaleDateString()}: ${update.note}
`;
        });
      }
      body += `
`;
    });
  }
  body += `
---
`;
  body += `This export contains all your Grounded data.
`;
  body += `Keep this email secure and only share with trusted healthcare providers.
`;
  return { subject, body };
}
function VirtualList({
  items,
  renderItem,
  itemHeight = 80,
  containerHeight = 400,
  overscan = 3,
  className = "",
  onScroll,
  threshold = 10
  // Only virtualize if more than 10 items
}) {
  const [scrollTop, setScrollTop] = reactExports.useState(0);
  const containerRef = reactExports.useRef(null);
  const scrollTimeoutRef = reactExports.useRef(null);
  const shouldVirtualize = items.length > threshold;
  const { startIndex, endIndex, totalHeight, offsetY } = reactExports.useMemo(() => {
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: items.length - 1,
        totalHeight: items.length * itemHeight,
        offsetY: 0
      };
    }
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex2 = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex2 = Math.min(
      items.length - 1,
      startIndex2 + visibleCount + overscan * 2
    );
    const totalHeight2 = items.length * itemHeight;
    const offsetY2 = startIndex2 * itemHeight;
    return { startIndex: startIndex2, endIndex: endIndex2, totalHeight: totalHeight2, offsetY: offsetY2 };
  }, [scrollTop, items.length, itemHeight, containerHeight, overscan, shouldVirtualize]);
  const visibleItems = reactExports.useMemo(() => {
    if (!shouldVirtualize) {
      return items.map((item, index) => ({ item, index }));
    }
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, startIndex, endIndex, shouldVirtualize]);
  const handleScroll = reactExports.useCallback((e) => {
    const newScrollTop = e.currentTarget.scrollTop;
    requestAnimationFrame(() => {
      setScrollTop(newScrollTop);
    });
    if (onScroll) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        onScroll(newScrollTop);
      }, 16);
    }
  }, [onScroll]);
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  if (!shouldVirtualize) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: containerRef,
        className: `overflow-auto ${className}`,
        style: {
          height: containerHeight,
          willChange: "scroll-position"
        },
        onScroll: handleScroll,
        children: visibleItems.map(({ item, index }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: renderItem(item, index) }, item.id || index))
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref: containerRef,
      className: `overflow-auto ${className}`,
      style: {
        height: containerHeight,
        willChange: "scroll-position",
        // Optimize scrolling performance
        WebkitOverflowScrolling: "touch"
      },
      onScroll: handleScroll,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          style: {
            height: totalHeight,
            position: "relative",
            willChange: "contents"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              style: {
                transform: `translate3d(0, ${offsetY}px, 0)`,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                willChange: "transform",
                // Force GPU acceleration for smooth scrolling
                backfaceVisibility: "hidden",
                perspective: 1e3,
                // Additional performance optimizations
                transformOrigin: "top left",
                // Prevent layout thrashing
                contain: "layout style paint"
              },
              children: visibleItems.map(({ item, index }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  style: {
                    height: itemHeight,
                    willChange: "auto",
                    // Optimize item rendering
                    contain: "layout style"
                  },
                  children: renderItem(item, index)
                },
                item.id || index
              ))
            }
          )
        }
      )
    }
  );
}
const VirtualList$1 = React.memo(VirtualList);
const VaultControl = ({ logs, goals, settings, onUpdateSettings, onClearData, selectedValueIds = [] }) => {
  const [userId, setUserId] = reactExports.useState(null);
  const [selectedStartDate, setSelectedStartDate] = reactExports.useState("");
  const [selectedEndDate, setSelectedEndDate] = reactExports.useState("");
  const [showDateRangePicker, setShowDateRangePicker] = reactExports.useState(false);
  reactExports.useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setUserId(user.id);
    });
  }, []);
  const handleEmailExport = async () => {
    let filteredLogs = logs;
    if (selectedStartDate || selectedEndDate) {
      filteredLogs = logs.filter((log) => {
        const logDate = new Date(log.date).toISOString().split("T")[0];
        if (selectedStartDate && logDate < selectedStartDate) return false;
        if (selectedEndDate && logDate > selectedEndDate) return false;
        return true;
      });
      if (filteredLogs.length === 0) {
        alert("No entries found in the selected date range.");
        return;
      }
    }
    const values = ALL_VALUES.filter((v) => filteredLogs.some((l) => l.valueId === v.id));
    const emailData = generateDataExportEmail(filteredLogs, [], values);
    const success = await shareViaEmail(emailData, []);
    if (!success) {
      alert("Could not open email. Please try again.");
    }
  };
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-12 animate-fade-in pb-20 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border/30 shadow-xl overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 sm:p-8 lg:p-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl sm:text-4xl font-black text-text-primary dark:text-white tracking-tight mb-2", children: "Total Impact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-primary/60 dark:text-white/60 text-sm sm:text-lg mb-6", children: "Your journey in numbers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center sm:text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl sm:text-3xl font-black text-text-primary dark:text-white", children: [
            logs.length,
            " Entries"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 w-full sm:w-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setShowDateRangePicker(!showDateRangePicker),
                  className: "flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:opacity-80 transition-colors",
                  children: selectedStartDate || selectedEndDate ? "📅 Date Range" : "📅 Select Dates"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleEmailExport,
                  className: "flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:opacity-90 transition-colors",
                  children: isWebShareAvailable() ? "📧 Share" : "📧 Email"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClearData,
                  className: "flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors",
                  children: "Wipe Data"
                }
              )
            ] }),
            showDateRangePicker && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-xl p-4 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest block mb-1", children: "Start Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "date",
                      value: selectedStartDate,
                      onChange: (e) => setSelectedStartDate(e.target.value),
                      className: "w-full p-2 rounded-lg bg-white dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border/30 text-xs"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest block mb-1", children: "End Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "date",
                      value: selectedEndDate,
                      onChange: (e) => setSelectedEndDate(e.target.value),
                      className: "w-full p-2 rounded-lg bg-white dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border/30 text-xs"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => {
                      setSelectedStartDate("");
                      setSelectedEndDate("");
                    },
                    className: "flex-1 px-3 py-2 bg-border-soft dark:bg-dark-bg-primary text-text-primary dark:text-white rounded-lg text-xs sm:text-sm font-black uppercase tracking-widest",
                    children: "Clear"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setShowDateRangePicker(false),
                    className: "flex-1 px-3 py-2 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-lg text-xs sm:text-sm font-black uppercase tracking-widest",
                    children: "Done"
                  }
                )
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 sm:p-8 lg:p-10", children: sortedLogs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 sm:py-20 text-text-primary/30 dark:text-white/30 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-12 sm:w-16 h-12 sm:h-16 mx-auto opacity-20", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-lg sm:text-xl text-text-primary dark:text-white", children: "The Vault is currently empty." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm text-text-primary/60 dark:text-white/60", children: "Start by reflecting on your values in the Dashboard." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        VirtualList$1,
        {
          items: sortedLogs,
          itemHeight: 100,
          containerHeight: typeof window !== "undefined" ? Math.min(600, window.innerHeight * 0.6) : 600,
          overscan: 2,
          className: "space-y-2",
          threshold: 5,
          renderItem: (log, index) => {
            const val = ALL_VALUES.find((v) => v.id === log.valueId);
            const isGoalAchieved = log.type === "goal-completion";
            const isCommitment = log.goalText && !isGoalAchieved;
            const goalStatus = isGoalAchieved ? "Goal Achieved" : isCommitment ? "Goal Set" : "Reflection";
            const formattedDate = new Date(log.date).toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" });
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "details",
              {
                className: "group bg-white dark:bg-dark-bg-secondary border border-border-soft dark:border-dark-border rounded-xl overflow-hidden transition-all hover:shadow-md",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer list-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 sm:p-5 gap-3 sm:gap-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-24 sm:w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm font-black text-text-primary dark:text-white", children: formattedDate }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg sm:text-xl flex-shrink-0", title: log.mood || log.emotionalState, children: log.mood || (log.emotionalState ? EMOTIONAL_STATES.find((e) => e.state === log.emotionalState)?.emoji : "✨") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm font-black text-text-primary dark:text-white truncate", children: val?.name || "Reflection" })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs sm:text-sm font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest ${isGoalAchieved ? "bg-calm-sage text-white dark:text-white" : isCommitment ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light" : "bg-bg-tertiary dark:bg-dark-bg-tertiary text-text-secondary dark:text-text-secondary"}`, children: goalStatus }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "svg",
                        {
                          className: "w-4 h-4 text-text-tertiary dark:text-text-tertiary transition-transform group-open:rotate-180 flex-shrink-0",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
                        }
                      )
                    ] })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 sm:px-5 pb-4 sm:pb-5 pt-0 space-y-4 border-t border-border-soft dark:border-dark-border", children: [
                    log.note && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest mb-2", children: "Reflection" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm sm:text-base text-text-primary dark:text-white leading-relaxed italic", children: [
                        '"',
                        log.note,
                        '"'
                      ] })
                    ] }),
                    log.deepReflection && /* PREV: bg-yellow-warm/10 ... border-yellow-warm/30 ... text-yellow-warm */
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 sm:p-4 bg-brand/5 dark:bg-brand/10 rounded-lg border border-brand/20 dark:border-brand/30", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm font-black text-brand dark:text-brand-light uppercase tracking-widest mb-2", children: "Deep Reflection" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm text-text-primary/80 dark:text-white/80 leading-relaxed", children: log.deepReflection })
                    ] }),
                    log.reflectionAnalysis && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 sm:p-4 bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-lg border border-border-soft dark:border-dark-border/30", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest mb-2", children: "Reflection Analysis" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs sm:text-sm text-text-primary/70 dark:text-white/70 leading-relaxed whitespace-pre-line", children: log.reflectionAnalysis })
                    ] }),
                    log.goalText && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 sm:p-4 rounded-lg border ${isGoalAchieved ? "bg-calm-sage/10 dark:bg-calm-sage/20 border-calm-sage/30" : "bg-brand/5 dark:bg-brand/10 border-brand/20 dark:border-brand/30"}`, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs sm:text-sm font-black uppercase tracking-widest mb-2 ${/* PREV: text-yellow-warm */
                      isGoalAchieved ? "text-calm-sage" : "text-brand dark:text-brand-light"}`, children: isGoalAchieved ? "Accomplished Target" : "Commitment Target" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs sm:text-sm font-bold ${isGoalAchieved ? "text-calm-sage dark:text-calm-sage" : "text-text-primary dark:text-white"}`, children: log.goalText })
                    ] })
                  ] })
                ]
              },
              log.id
            );
          }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-text-primary/50 dark:text-white/50 font-medium", children: "Encrypted local storage. Your data remains strictly on your device." })
  ] });
};
const StatusIndicator = ({
  status,
  label,
  size = "md",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3"
  };
  const statusConfig = {
    "not-done": {
      dot: "bg-red-500",
      pulse: false,
      ariaLabel: "Not processed"
    },
    "processing": {
      dot: "bg-yellow-500",
      pulse: true,
      ariaLabel: "Processing"
    },
    "complete": {
      dot: "bg-green-500",
      pulse: false,
      ariaLabel: "Complete"
    }
  };
  const config = statusConfig[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1.5 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `
          ${sizeClasses[size]} 
          ${config.dot} 
          rounded-full 
          ${config.pulse ? "animate-pulse" : ""}
        `,
        role: "status",
        "aria-label": config.ariaLabel,
        title: config.ariaLabel
      }
    ),
    label && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-secondary dark:text-white/60", children: label })
  ] });
};
const GoalsUpdateView = ({
  goals,
  values,
  lcswConfig,
  onUpdateGoal,
  onCompleteGoal,
  onDeleteGoal,
  onEditGoal
}) => {
  const [selectedGoalId, setSelectedGoalId] = reactExports.useState(null);
  const [updateNote, setUpdateNote] = reactExports.useState("");
  const [isEditingText, setIsEditingText] = reactExports.useState(false);
  const [editedText, setEditedText] = reactExports.useState("");
  const [selectedMood, setSelectedMood] = reactExports.useState(void 0);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [showSuccess, setShowSuccess] = reactExports.useState(false);
  const activeGoals = goals.filter((g) => !g.completed);
  const selectedGoal = selectedGoalId ? goals.find((g) => g.id === selectedGoalId) : null;
  const handleUpdateGoal = async () => {
    if (!selectedGoal || !updateNote.trim()) return;
    setIsSubmitting(true);
    try {
      const update = {
        id: Date.now().toString() + "-update",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        note: updateNote.trim(),
        mood: selectedMood
      };
      onUpdateGoal(selectedGoal.id, update);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3e3);
      setUpdateNote("");
      setSelectedMood(void 0);
      setSelectedGoalId(null);
    } catch (error) {
      console.error("Error updating goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCompleteGoal = async (goal) => {
    onCompleteGoal(goal);
    setSelectedGoalId(null);
  };
  if (activeGoals.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24 lg:pb-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border/30 shadow-sm p-6 sm:p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl mb-4", children: "🎯" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl sm:text-2xl font-black text-text-primary dark:text-white mb-2", children: "No Active Goals" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base text-text-secondary dark:text-white/70", children: "You don't have any active goals to update. Create goals from your reflections to track progress." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24 lg:pb-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 sm:space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl sm:text-3xl font-black text-text-primary dark:text-white mb-2", children: "Update Goals" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary dark:text-white/70", children: "Track your progress on active commitments" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm sm:text-base font-black text-text-primary dark:text-white tracking-tight", children: "Select a Goal to Update" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: activeGoals.map((goal) => {
        const val = values.find((v) => v.id === goal.valueId);
        const isSelected = selectedGoalId === goal.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setSelectedGoalId(goal.id);
              setIsEditingText(false);
            },
            className: `
                    bg-white dark:bg-dark-bg-primary p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left relative
                    ${isSelected ? "border-brand dark:border-brand-light shadow-lg dark:shadow-xl" : "border-border-soft dark:border-dark-border/30 shadow-sm hover:border-brand/50 dark:hover:border-brand-light/50"}
                  `,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 sm:top-3 right-3 sm:right-4 px-1.5 py-0.5 bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light rounded-md text-xs font-black uppercase tracking-widest", children: goal.frequency }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-light" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest", children: val?.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  StatusIndicator,
                  {
                    status: isSubmitting && selectedGoalId === goal.id ? "processing" : goal.updates.length > 0 ? "complete" : "not-done",
                    size: "sm"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm sm:text-base font-bold text-text-primary dark:text-white mb-2 sm:mb-3 leading-snug pr-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MarkdownRenderer, { children: goal.text }) }),
              goal.updates.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-secondary dark:text-white/60", children: [
                goal.updates.length,
                " update",
                goal.updates.length !== 1 ? "s" : ""
              ] })
            ]
          },
          goal.id
        );
      }) })
    ] }),
    selectedGoal && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border/30 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6 animate-pop", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm sm:text-base font-black text-text-primary dark:text-white tracking-tight", children: "Update Progress" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setSelectedGoalId(null);
              setUpdateNote("");
              setSelectedMood(void 0);
            },
            className: "w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-lg sm:rounded-xl p-3 sm:p-4 relative group", children: isEditingText ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: editedText,
            onChange: (e) => setEditedText(e.target.value),
            className: "w-full p-2 rounded-lg bg-white dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border/30 focus:ring-2 focus:ring-brand/30 dark:focus:ring-brand-light/30 outline-none text-text-primary dark:text-white min-h-[100px] text-sm"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setIsEditingText(false),
              className: "px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                if (editedText.trim()) {
                  onEditGoal(selectedGoal.id, editedText.trim());
                  setIsEditingText(false);
                }
              },
              className: "px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-lg hover:opacity-90",
              children: "Save Text"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setEditedText(selectedGoal.text);
              setIsEditingText(true);
            },
            className: "absolute top-2 right-2 p-1.5 rounded-full bg-white/50 dark:bg-black/20 text-text-tertiary hover:text-navy-primary dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all",
            title: "Edit text",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm sm:text-base font-bold text-text-primary dark:text-white mb-1 pr-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MarkdownRenderer, { children: selectedGoal.text }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs sm:text-sm text-text-secondary dark:text-white/60", children: [
          values.find((v) => v.id === selectedGoal.valueId)?.name,
          " • ",
          selectedGoal.frequency
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 sm:space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest mb-2 px-1", children: "How's it going?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: updateNote,
              onChange: (e) => setUpdateNote(e.target.value),
              placeholder: "Share your progress, challenges, or insights...",
              className: "w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-secondary dark:bg-dark-bg-primary/50 border-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-brand-light/30 outline-none text-text-primary dark:text-white min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base leading-relaxed shadow-inner"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest mb-2 px-1", children: "Current Energy (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-1.5 sm:gap-2", children: ["🌱", "🔥", "✨", "🧗"].map((mood) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setSelectedMood(selectedMood === mood ? void 0 : mood),
              className: `
                        p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center
                        ${selectedMood === mood ? "border-brand dark:border-brand-light bg-brand/10 dark:bg-brand/20 shadow-sm scale-105" : "border-border-soft dark:border-dark-border/30 hover:border-brand/50 dark:hover:border-brand-light/50 bg-white dark:bg-dark-bg-primary"}
                      `,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl sm:text-2xl", children: mood }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] sm:text-xs font-bold uppercase tracking-wide mt-1 opacity-70 text-text-primary dark:text-white", children: mood === "🌱" ? "Calm" : mood === "🔥" ? "Energized" : mood === "✨" ? "Magical" : "Hanging on" })
              ]
            },
            mood
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleUpdateGoal,
              disabled: !updateNote.trim() || isSubmitting,
              className: "flex-1 py-2 sm:py-2.5 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed",
              children: isSubmitting ? "Saving..." : "💾 Save Update"
            }
          ),
          lcswConfig?.emergencyContact?.email && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: async () => {
                const updatedGoals = goals.map(
                  (g) => g.id === selectedGoal.id ? { ...g, updates: [...g.updates] } : g
                );
                const emailData = generateGoalsEmail(
                  updatedGoals,
                  values,
                  [],
                  true
                );
                await shareViaEmail(emailData, [lcswConfig.emergencyContact.email]);
              },
              className: "px-3 py-2 sm:py-2.5 bg-calm-sage dark:bg-calm-sage text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-sm hover:opacity-90 transition-all active:scale-[0.98]",
              title: "Share progress with therapist",
              children: "📧 Share"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleCompleteGoal(selectedGoal),
              className: "flex-1 py-2 sm:py-2.5 bg-calm-sage dark:bg-calm-sage text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-sm hover:opacity-90 transition-all active:scale-[0.98]",
              children: "✅ Done"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => onDeleteGoal(selectedGoal.id),
              className: "w-8 h-8 sm:w-10 sm:h-10 bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/30 dark:text-white/30 rounded-lg hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-colors",
              "aria-label": "Delete goal",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" }) })
            }
          )
        ] }),
        showSuccess && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 p-3 bg-calm-sage/20 dark:bg-calm-sage/20 border border-calm-sage/30 rounded-lg animate-pop", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm font-semibold text-calm-sage dark:text-calm-sage text-center", children: "✅ Update saved! Email sent to therapist." }) })
      ] }),
      selectedGoal.updates.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border-soft dark:border-dark-border/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs sm:text-sm font-black text-text-primary dark:text-white mb-3 uppercase tracking-widest", children: "Previous Updates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 sm:space-y-3", children: selectedGoal.updates.slice().reverse().map((update) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-lg sm:rounded-xl p-3 sm:p-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-secondary dark:text-white/60", children: new Date(update.timestamp).toLocaleDateString() }),
                update.mood && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg sm:text-xl", children: update.mood })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base text-text-primary dark:text-white leading-relaxed", children: update.note })
            ]
          },
          update.id
        )) })
      ] })
    ] })
  ] }) });
};
const ValueSelection = ({ initialSelected, onComplete, isReorderingOnly = false, onAddGoal, goals = [], onSave, hideConfirm = false }) => {
  const [selected, setSelected] = reactExports.useState(initialSelected);
  const [shakeId, setShakeId] = reactExports.useState(null);
  const [collapsedCategories, setCollapsedCategories] = reactExports.useState(/* @__PURE__ */ new Set());
  const [viewMode, setViewMode] = reactExports.useState(initialSelected.length > 0 ? "sort" : "pick");
  const [draggedIndex, setDraggedIndex] = reactExports.useState(null);
  const [dragOverIndex, setDragOverIndex] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);
  const groupedValues = reactExports.useMemo(() => {
    return ALL_VALUES.reduce((acc, value) => {
      if (!acc[value.category]) acc[value.category] = [];
      acc[value.category].push(value);
      return acc;
    }, {});
  }, []);
  const selectedObjects = reactExports.useMemo(() => {
    return selected.map((id) => ALL_VALUES.find((v) => v.id === id)).filter(Boolean);
  }, [selected]);
  const toggleValue = (id) => {
    setSelected((prev) => {
      let newSelected;
      if (prev.includes(id)) {
        newSelected = prev.filter((v) => v !== id);
      } else if (prev.length >= 10) {
        setShakeId(id);
        setTimeout(() => setShakeId(null), 500);
        return prev;
      } else {
        newSelected = [...prev, id];
      }
      setTimeout(() => {
        if (newSelected.length > 0 || prev.length > 0) {
          if (onSave) {
            onSave(newSelected);
          } else {
            onComplete(newSelected);
          }
        }
      }, 200);
      return newSelected;
    });
  };
  const moveValue = (index, direction) => {
    const newSelected = [...selected];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSelected.length) return;
    [newSelected[index], newSelected[targetIndex]] = [newSelected[targetIndex], newSelected[index]];
    setSelected(newSelected);
    setTimeout(() => {
      if (onSave) {
        onSave(newSelected);
      } else {
        onComplete(newSelected);
      }
    }, 200);
  };
  const handleDragStart = (index) => setDraggedIndex(index);
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };
  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newSelected = [...selected];
    const itemToMove = newSelected.splice(draggedIndex, 1)[0];
    newSelected.splice(index, 0, itemToMove);
    setSelected(newSelected);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTimeout(() => {
      if (onSave) {
        onSave(newSelected);
      } else {
        onComplete(newSelected);
      }
    }, 200);
  };
  const toggleCategory = (category) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto space-y-3 sm:space-y-4 animate-fade-in pb-20 sm:pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2 px-3 sm:px-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-lg sm:text-xl font-black text-text-primary dark:text-white tracking-tight", children: [
        viewMode === "pick" ? "Define Your " : "Rank Your ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand dark:text-brand-light", children: "Compass" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-1 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setViewMode("pick"),
            className: `px-3 py-1 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-widest transition-all ${viewMode === "pick" ? "bg-brand dark:bg-brand-light text-white dark:text-navy-dark shadow-sm" : "bg-white dark:bg-dark-bg-primary text-text-primary/60 dark:text-white/60 border border-border-soft dark:border-dark-border/30"}`,
            children: "Selection"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setViewMode("sort"),
            disabled: selected.length === 0,
            className: `px-3 py-1 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-widest transition-all ${viewMode === "sort" ? "bg-brand dark:bg-brand-light text-white dark:text-navy-dark shadow-sm" : "bg-white dark:bg-dark-bg-primary text-text-primary/60 dark:text-white/60 border border-border-soft dark:border-dark-border/30"} disabled:opacity-30`,
            children: "Priority"
          }
        )
      ] })
    ] }),
    viewMode === "pick" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: Object.entries(groupedValues).map(([category, items]) => {
      const isCollapsed = collapsedCategories.has(category);
      const selectedInCategory = items.filter((v) => selected.includes(v.id)).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-white dark:bg-dark-bg-primary rounded-xl border border-border-soft dark:border-dark-border/30 overflow-hidden shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => toggleCategory(category),
            className: "w-full flex items-center justify-between p-3 bg-bg-secondary/50 dark:bg-dark-bg-primary/50 hover:bg-bg-secondary dark:hover:bg-dark-bg-primary transition-colors text-left",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs sm:text-sm font-black text-text-primary dark:text-white uppercase tracking-widest", children: category }),
                selectedInCategory > 0 && /* PREV: bg-yellow-warm text-text-primary */
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-brand dark:bg-brand-light text-white dark:text-navy-dark text-xs font-black px-1.5 py-0.5 rounded uppercase", children: selectedInCategory })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: `w-3 h-3 text-text-primary/40 dark:text-white/40 transition-transform ${isCollapsed ? "-rotate-90" : ""}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M19 9l-7 7-7-7" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100 p-2 sm:p-3"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: items.map((value) => {
          const isSelected = selected.includes(value.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => toggleValue(value.id),
              className: `p-2 sm:p-3 rounded-lg sm:rounded-xl border text-left transition-all ${isSelected ? "border-brand dark:border-brand-light bg-brand/10 dark:bg-brand/20 shadow-sm" : "border-border-soft dark:border-dark-border/30 bg-white dark:bg-dark-bg-primary/50 hover:border-brand/50 dark:hover:border-brand-light/50"} ${shakeId === value.id ? "animate-shake" : ""}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `font-black text-xs sm:text-sm tracking-tight ${isSelected ? "text-text-primary dark:text-white" : "text-text-primary dark:text-white"}`, children: value.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-xs leading-tight font-medium mt-0.5 ${isSelected ? "text-text-primary/70 dark:text-white/70" : "text-text-primary/50 dark:text-white/50"}`, children: [
                  value.description.substring(0, 45),
                  "..."
                ] })
              ]
            },
            value.id
          );
        }) }) })
      ] }, category);
    }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-md mx-auto space-y-2 animate-pop", children: selectedObjects.map((value, index) => {
      const isDragging = draggedIndex === index;
      const isDragOver = dragOverIndex === index;
      const valueGoals = goals.filter((g) => g.valueId === value.id);
      valueGoals.length > 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          draggable: true,
          onDragStart: () => handleDragStart(index),
          onDragOver: (e) => handleDragOver(e, index),
          onDragLeave: () => setDragOverIndex(null),
          onDrop: () => handleDrop(index),
          className: `relative flex items-center gap-2 sm:gap-3 bg-white dark:bg-dark-bg-primary p-2 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all cursor-grab active:cursor-grabbing ${isDragging ? "opacity-30 scale-95 border-dashed border-brand/50 dark:border-brand-light/50" : "border-border-soft dark:border-dark-border/30 shadow-sm"} ${isDragOver ? "border-brand dark:border-brand-light" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5 items-center bg-bg-secondary dark:bg-dark-bg-primary/50 p-1 rounded-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                e.stopPropagation();
                moveValue(index, "up");
              }, disabled: index === 0, className: "text-text-primary/30 dark:text-white/30 hover:text-brand dark:hover:text-brand-light disabled:opacity-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 15l7-7 7 7" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                e.stopPropagation();
                moveValue(index, "down");
              }, disabled: index === selected.length - 1, className: "text-text-primary/30 dark:text-white/30 hover:text-brand dark:hover:text-brand-light disabled:opacity-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M19 9l-7 7-7-7" }) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-grow select-none flex items-center gap-2 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-black w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${index === 0 ? "bg-brand dark:bg-brand-light text-white dark:text-navy-dark" : "bg-navy-primary dark:bg-navy-primary text-white dark:text-white"}`, children: index + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-black text-text-primary dark:text-white text-sm sm:text-base tracking-tight truncate", children: value.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-primary/50 dark:text-white/50 font-bold uppercase tracking-widest", children: value.category })
              ] })
            ] }),
            onAddGoal && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  onAddGoal(value.id);
                },
                className: "w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-brand dark:bg-brand-light text-white dark:text-navy-dark hover:opacity-90 transition-all shadow-sm active:scale-95 flex-shrink-0",
                title: "Add goal",
                "aria-label": "Add goal",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4v16m8-8H4" }) })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-text-primary/20 dark:text-white/20 pr-1 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" }) }) })
          ]
        },
        value.id
      );
    }) }),
    !hideConfirm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-0 left-0 right-0 p-3 z-40 safe-area-inset-bottom", style: { paddingBottom: "calc(env(safe-area-inset-bottom) + 4rem)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto bg-white/95 dark:bg-dark-bg-primary/95 backdrop-blur shadow-2xl border border-border-soft dark:border-dark-border/30 rounded-xl sm:rounded-2xl p-3 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 sm:px-3 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-primary/50 dark:text-white/50 font-black uppercase tracking-widest", children: "Strength" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-text-primary dark:text-white", children: [
          selected.length,
          "/10"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onComplete(selected),
          disabled: selected.length === 0,
          className: `px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all flex-shrink-0 ${selected.length > 0 ? "bg-brand dark:bg-brand-light text-white dark:text-navy-dark hover:opacity-90 shadow-lg" : "bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/30 dark:text-white/30 cursor-not-allowed"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Confirm Compass" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Confirm" })
          ]
        }
      )
    ] }) })
  ] });
};
const ReportView = ({ logs, values, lcswConfig, goals }) => {
  const [selectedLogIds, setSelectedLogIds] = reactExports.useState(new Set(logs.map((l) => l.id)));
  const [generatedReport, setGeneratedReport] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [mode, setMode] = reactExports.useState("review");
  const [dateRange, setDateRange] = reactExports.useState({ type: "7days" });
  React.useEffect(() => {
    const now = /* @__PURE__ */ new Date();
    let start = /* @__PURE__ */ new Date();
    let end = /* @__PURE__ */ new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    if (dateRange.type === "7days") {
      start.setDate(now.getDate() - 7);
    } else if (dateRange.type === "30days") {
      start.setDate(now.getDate() - 30);
    } else if (dateRange.type === "custom" && dateRange.start && dateRange.end) {
      start = new Date(dateRange.start);
      end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
    }
    const idsInRange = logs.filter((l) => {
      const logDate = new Date(l.date);
      return logDate >= start && logDate <= end;
    }).map((l) => l.id);
    setSelectedLogIds(new Set(idsInRange));
  }, [dateRange, logs]);
  const filteredLogs = reactExports.useMemo(() => {
    return logs.filter((l) => selectedLogIds.has(l.id));
  }, [logs, selectedLogIds]);
  const sortedLogs = reactExports.useMemo(() => {
    return [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs]);
  const handleGenerate = reactExports.useCallback(async () => {
    if (filteredLogs.length === 0) {
      alert("Please select at least one log to synthesize.");
      return;
    }
    setLoading(true);
    try {
      const report = await generateHumanReports(filteredLogs, values, lcswConfig, goals);
      setGeneratedReport(report);
      setMode("generate");
    } catch (error) {
      console.error("Report synthesis failed:", error);
      const { generateFallbackReport } = await __vitePreload(async () => {
        const { generateFallbackReport: generateFallbackReport2 } = await import("./ai-services-DJUX-74P.js").then((n) => n.N);
        return { generateFallbackReport: generateFallbackReport2 };
      }, true ? __vite__mapDeps([0,1,2,3,4]) : void 0);
      const fallbackReport = generateFallbackReport(filteredLogs, values, goals);
      const disclaimer = `

---

*This report was generated using rule-based analysis. All processing happens on your device for privacy.*`;
      setGeneratedReport(fallbackReport + disclaimer);
      setMode("generate");
    } finally {
      setLoading(false);
    }
  }, [filteredLogs, values, lcswConfig]);
  const toggleLog = reactExports.useCallback((id) => {
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in pb-12 sm:pb-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-black text-navy-primary dark:text-white tracking-tight", children: "Clinical Synthesis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary dark:text-text-secondary text-sm sm:text-lg mt-1", children: "Human-first insights for professional sharing." })
      ] }),
      mode === "generate" && /* PREV: text-yellow-warm dark:text-yellow-warm */
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMode("review"), className: "text-brand dark:text-brand-light font-black uppercase text-xs sm:text-sm tracking-widest hover:underline", children: "← Edit Selection" })
    ] }),
    mode === "review" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-dark-bg-secondary rounded-2xl border border-border-soft dark:border-dark-border shadow-sm items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setDateRange({ type: "7days" }),
              className: `px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${dateRange.type === "7days" ? "bg-brand dark:bg-brand-light text-white dark:text-navy-dark" : "bg-bg-tertiary dark:bg-dark-bg-tertiary text-text-primary dark:text-white hover:bg-brand/10 dark:hover:bg-brand/20"}`,
              children: "Past 7 Days"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setDateRange({ type: "30days" }),
              className: `px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${dateRange.type === "30days" ? "bg-brand dark:bg-brand-light text-white dark:text-navy-dark" : "bg-bg-tertiary dark:bg-dark-bg-tertiary text-text-primary dark:text-white hover:bg-brand/10 dark:hover:bg-brand/20"}`,
              children: "Past 30 Days"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setDateRange((prev) => ({ ...prev, type: "custom" })),
              className: `px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${dateRange.type === "custom" ? "bg-brand dark:bg-brand-light text-white dark:text-navy-dark" : "bg-bg-tertiary dark:bg-dark-bg-tertiary text-text-primary dark:text-white hover:bg-brand/10 dark:hover:bg-brand/20"}`,
              children: "Custom"
            }
          )
        ] }),
        dateRange.type === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "date",
              value: dateRange.start || "",
              onChange: (e) => setDateRange((prev) => ({ ...prev, start: e.target.value })),
              className: "px-3 py-2 rounded-lg bg-bg-tertiary dark:bg-dark-bg-tertiary border border-border-soft dark:border-dark-border text-xs font-medium text-text-primary dark:text-white outline-none focus:ring-2 focus:ring-brand dark:focus:ring-brand-light"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-secondary dark:text-text-secondary text-xs", children: "to" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "date",
              value: dateRange.end || "",
              onChange: (e) => setDateRange((prev) => ({ ...prev, end: e.target.value })),
              className: "px-3 py-2 rounded-lg bg-bg-tertiary dark:bg-dark-bg-tertiary border border-border-soft dark:border-dark-border text-xs font-medium text-text-primary dark:text-white outline-none focus:ring-2 focus:ring-brand dark:focus:ring-brand-light"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-3 sm:space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs sm:text-sm font-black text-text-secondary dark:text-text-secondary uppercase tracking-widest", children: "Select your records" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs sm:text-sm font-bold text-brand dark:text-brand-light bg-brand/10 dark:bg-brand/20 px-2 sm:px-3 py-1 rounded-full uppercase", children: [
            selectedLogIds.size,
            " Ready"
          ] })
        ] }),
        sortedLogs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-16 sm:py-24 bg-white dark:bg-dark-bg-primary rounded-2xl sm:rounded-[40px] border border-dashed border-border-soft dark:border-dark-border text-text-tertiary dark:text-text-tertiary", children: "No data in the vault yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          VirtualList$1,
          {
            items: sortedLogs,
            itemHeight: 140,
            containerHeight: typeof window !== "undefined" ? Math.min(600, window.innerHeight * 0.6) : 600,
            overscan: 2,
            className: "space-y-3 sm:space-y-4 pr-2 custom-scrollbar",
            threshold: 5,
            renderItem: (log, index) => {
              const val = values.find((v) => v.id === log.valueId);
              const isSelected = selectedLogIds.has(log.id);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => toggleLog(log.id),
                  className: `w-full text-left bg-white dark:bg-dark-bg-primary p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] border-2 transition-all flex gap-3 sm:gap-6 ${isSelected ? "border-brand dark:border-brand-light shadow-xl" : "border-border-soft dark:border-dark-border opacity-50"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-1 ${isSelected ? "bg-brand dark:bg-brand-light border-brand dark:border-brand-light" : "border-border-soft dark:border-dark-border"}`, children: isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-navy-dark", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 4, d: "M5 13l4 4L19 7" }) }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-grow min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mb-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs sm:text-sm font-black text-text-secondary dark:text-text-secondary uppercase tracking-widest", children: new Date(log.date).toLocaleDateString() }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl sm:text-2xl", children: log.mood })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base sm:text-lg font-black text-text-primary dark:text-white truncate", children: val?.name }),
                      log.deepReflection && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-text-primary dark:text-white/80 mt-2 sm:mt-3 leading-relaxed text-xs sm:text-sm line-clamp-2 font-medium", children: [
                        "Deep Reflection: ",
                        log.deepReflection.substring(0, 100),
                        log.deepReflection.length > 100 ? "..." : ""
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-text-primary/70 dark:text-white/70 mt-2 sm:mt-3 italic leading-relaxed text-sm sm:text-base line-clamp-2", children: [
                        '"',
                        log.note,
                        '"'
                      ] })
                    ] })
                  ]
                },
                log.id
              );
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-primary p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[48px] border border-border-soft dark:border-dark-border shadow-2xl sticky top-20 sm:top-24 space-y-6 sm:space-y-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 sm:space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-text-primary dark:text-white", children: "Synthesis Engine" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-text-secondary leading-relaxed", children: "This will generate a natural-language report in SOAP, DAP, and BIRP formats simultaneously. Perfect for review with your therapist." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleGenerate,
            disabled: loading || selectedLogIds.size === 0,
            className: "w-full py-4 sm:py-5 bg-navy-primary dark:bg-navy-primary text-white dark:text-white rounded-2xl sm:rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-20 text-xs sm:text-sm",
            children: loading ? "Synthesizing..." : "Generate All"
          }
        )
      ] }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 sm:space-y-8 animate-pop", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-primary p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-[56px] shadow-2xl border border-brand/20 dark:border-brand/30 max-w-4xl mx-auto prose prose-slate dark:prose-invert", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-border-soft dark:border-dark-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm font-black text-brand dark:text-brand-light uppercase tracking-[0.3em]", children: "Confidential Clinical Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  navigator.clipboard.writeText(generatedReport);
                  alert("All formats copied to clipboard!");
                },
                className: "px-4 sm:px-6 py-2 bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light rounded-full text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-brand/20 dark:hover:bg-brand/30",
                children: "Copy"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: async () => {
                  const emailData = generateEmailReport(filteredLogs, values, generatedReport);
                  const therapistEmails = lcswConfig?.emergencyContact?.phone ? [] : [];
                  const success = await shareViaEmail(emailData, therapistEmails);
                  if (!success) {
                    alert("Could not open email. Please copy the report and send manually.");
                  }
                },
                className: "px-4 sm:px-6 py-2 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-full text-xs sm:text-sm font-black uppercase tracking-widest hover:opacity-90",
                children: isWebShareAvailable() ? "📧 Share" : "📧 Email"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-sans text-text-primary dark:text-white leading-relaxed text-sm sm:text-base lg:text-lg prose prose-slate dark:prose-invert max-w-none clinical-report", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MarkdownRenderer, { children: generatedReport }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-text-tertiary dark:text-text-tertiary text-xs font-medium", children: "These reports are generated on-device using local AI for your personal review. All processing happens on your device for privacy." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; }
      ` })
  ] });
};
const ReportView$1 = React.memo(ReportView);
async function clearAllCaches() {
  console.log("[CacheService] Starting cache clear...");
  try {
    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        console.log(`[CacheService] Found ${cacheNames.length} cache(s) to delete`);
        await Promise.all(
          cacheNames.map((cacheName) => {
            console.log(`[CacheService] Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        console.log("[CacheService] Cleared all Cache API caches");
      } catch (error) {
        console.warn("[CacheService] Failed to clear Cache API caches:", error);
      }
    }
    if ("serviceWorker" in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`[CacheService] Found ${registrations.length} service worker(s) to unregister`);
        await Promise.all(
          registrations.map((registration) => {
            console.log(`[CacheService] Unregistering service worker: ${registration.scope}`);
            return registration.unregister();
          })
        );
        console.log("[CacheService] Unregistered all service workers");
      } catch (error) {
        console.warn("[CacheService] Failed to unregister service workers:", error);
      }
    }
    try {
      const { clearModels } = await __vitePreload(async () => {
        const { clearModels: clearModels2 } = await import("./ai-services-DJUX-74P.js").then((n) => n.L);
        return { clearModels: clearModels2 };
      }, true ? __vite__mapDeps([0,1,2,3,4]) : void 0);
      await clearModels();
      console.log("[CacheService] Cleared AI model cache");
    } catch (error) {
      console.warn("[CacheService] Failed to clear AI model cache:", error);
    }
    try {
      const aiCacheKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("ai_cache_")) {
          aiCacheKeys.push(key);
        }
      }
      aiCacheKeys.forEach((key) => localStorage.removeItem(key));
      console.log(`[CacheService] Cleared ${aiCacheKeys.length} AI response cache entries`);
    } catch (error) {
      console.warn("[CacheService] Failed to clear AI response cache:", error);
    }
    if ("storage" in navigator && "getDirectory" in navigator.storage) {
      try {
        const root2 = await navigator.storage.getDirectory();
        let clearedCount = 0;
        for await (const [name, handle] of root2.entries()) {
          if (handle.kind === "file" && (name.includes("cache") || name.includes("model"))) {
            try {
              await root2.removeEntry(name, { recursive: true });
              clearedCount++;
            } catch (e) {
            }
          }
        }
        console.log(`[CacheService] Cleared ${clearedCount} OPFS cache files`);
      } catch (error) {
        console.warn("[CacheService] Failed to clear OPFS cache:", error);
      }
    }
    console.log("[CacheService] Cache clear completed successfully");
  } catch (error) {
    console.error("[CacheService] Error during cache clear:", error);
    throw new Error(`Failed to clear caches: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function clearCacheAndReload() {
  await clearAllCaches();
  console.log("[CacheService] Reloading page after cache clear...");
  window.location.reload();
}
if (typeof window !== "undefined") {
  window.clearCache = clearAllCaches;
  window.clearCacheAndReload = clearCacheAndReload;
  console.log("[CacheService] Cache clearing functions available globally: window.clearCache() and window.clearCacheAndReload()");
}
const Settings = ({ onLogout, onShowHelp, version = "1.0.0" }) => {
  const { theme, toggleTheme } = reactExports.useContext(ThemeContext);
  const { isEncryptionEnabled: isEncryptionEnabled2 } = useAuth();
  const context = useDataContext();
  const [userEmail, setUserEmail] = reactExports.useState("");
  const [therapistEmails, setTherapistEmails] = reactExports.useState([]);
  const [username, setUsername] = reactExports.useState("");
  const [settings, setSettings] = reactExports.useState(context.settings || {
    reminders: { enabled: false, frequency: "daily", time: "09:00" }
  });
  const [isClearingCache, setIsClearingCache] = reactExports.useState(false);
  const [showEmailModal, setShowEmailModal] = reactExports.useState(false);
  const [emailModalType, setEmailModalType] = reactExports.useState(null);
  const [emailInput, setEmailInput] = reactExports.useState("");
  reactExports.useEffect(() => {
    const loadUserData = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserEmail(user.email || "");
        setUsername(user.username || "");
        setTherapistEmails(user.therapistEmails || []);
      }
    };
    loadUserData();
  }, []);
  reactExports.useEffect(() => {
    if (context) {
      context.setSettings(settings);
    }
  }, [settings, context]);
  const updateEmailSchedule = (updates) => {
    setSettings((prev) => ({
      ...prev,
      emailSchedule: {
        enabled: prev.emailSchedule?.enabled || false,
        frequency: prev.emailSchedule?.frequency || "weekly",
        time: prev.emailSchedule?.time || "09:00",
        dayOfWeek: prev.emailSchedule?.dayOfWeek ?? 1,
        // Default to Monday
        dayOfMonth: prev.emailSchedule?.dayOfMonth ?? 1,
        // Default to 1st of month
        recipientEmails: prev.emailSchedule?.recipientEmails || [],
        sendGoalCompletions: prev.emailSchedule?.sendGoalCompletions || false,
        sendReports: prev.emailSchedule?.sendReports || false,
        ...updates
      }
    }));
  };
  const updateLCSWConfig = (updates) => {
    setSettings((prev) => ({
      ...prev,
      lcswConfig: {
        protocols: prev.lcswConfig?.protocols || [],
        crisisPhrases: prev.lcswConfig?.crisisPhrases || [],
        allowStructuredRecommendations: prev.lcswConfig?.allowStructuredRecommendations || false,
        ...prev.lcswConfig,
        ...updates
      }
    }));
  };
  const updateReminders = (updates) => {
    setSettings((prev) => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        ...updates
      }
    }));
  };
  const openEmailModal = (type) => {
    setEmailModalType(type);
    setEmailInput("");
    setShowEmailModal(true);
  };
  const handleEmailSubmit = () => {
    if (emailInput && emailInput.includes("@")) {
      if (emailModalType === "therapist") {
        setTherapistEmails((prev) => [...prev, emailInput]);
      } else if (emailModalType === "recipient") {
        updateEmailSchedule({
          recipientEmails: [...settings.emailSchedule?.recipientEmails || [], emailInput]
        });
      }
      setShowEmailModal(false);
      setEmailInput("");
      setEmailModalType(null);
    }
  };
  const removeTherapistEmail = (index) => {
    setTherapistEmails((prev) => prev.filter((_, i) => i !== index));
  };
  const removeRecipientEmail = (index) => {
    updateEmailSchedule({
      recipientEmails: settings.emailSchedule?.recipientEmails?.filter((_, i) => i !== index) || []
    });
  };
  const handleClearCache = async () => {
    const confirmed = window.confirm(
      "Clear all caches?\n\nThis will clear:\n• Browser cache\n• Service worker cache\n• AI model cache\n• AI response cache\n\nYour data (logs, goals, values) will NOT be deleted.\n\nThe page will reload after clearing."
    );
    if (!confirmed) return;
    setIsClearingCache(true);
    try {
      await clearCacheAndReload();
    } catch (error) {
      console.error("[Settings] Failed to clear cache:", error);
      alert("Failed to clear cache. Please try again.");
      setIsClearingCache(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 pb-24 animate-fade-in max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl sm:text-3xl font-black text-text-primary dark:text-white", children: "Settings" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-text-primary dark:text-white", children: "Theme" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary dark:text-white/60", children: theme === "dark" ? "Dark Mode" : "Light Mode" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {})
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-bold text-text-primary dark:text-white mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📧" }),
        " Email Configuration"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Your Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: userEmail,
              onChange: (e) => setUserEmail(e.target.value),
              placeholder: "your@email.com",
              className: "w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Therapist Emails" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            therapistEmails.map((email, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "email",
                  value: email,
                  onChange: (e) => {
                    const updated = [...therapistEmails];
                    updated[index] = e.target.value;
                    setTherapistEmails(updated);
                  },
                  className: "flex-1 px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => removeTherapistEmail(index),
                  className: "px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg",
                  children: "Remove"
                }
              )
            ] }, index)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => openEmailModal("therapist"),
                className: "w-full px-3 py-2 text-sm bg-bg-secondary dark:bg-dark-bg-primary text-text-primary dark:text-white rounded-lg hover:bg-bg-secondary/80 transition-colors",
                children: "+ Add Therapist Email"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-bold text-text-primary dark:text-white mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🚨" }),
        " Emergency Contacts"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Contact Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: settings.lcswConfig?.emergencyContact?.name || "",
              onChange: (e) => updateLCSWConfig({
                emergencyContact: {
                  ...settings.lcswConfig?.emergencyContact,
                  name: e.target.value,
                  phone: settings.lcswConfig?.emergencyContact?.phone || ""
                }
              }),
              placeholder: "Emergency contact name",
              className: "w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Phone Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "tel",
              value: settings.lcswConfig?.emergencyContact?.phone || "",
              onChange: (e) => updateLCSWConfig({
                emergencyContact: {
                  ...settings.lcswConfig?.emergencyContact,
                  name: settings.lcswConfig?.emergencyContact?.name || "",
                  phone: e.target.value
                }
              }),
              placeholder: "(555) 123-4567",
              className: "w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Email (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: settings.lcswConfig?.emergencyContact?.email || "",
              onChange: (e) => updateLCSWConfig({
                emergencyContact: {
                  ...settings.lcswConfig?.emergencyContact,
                  name: settings.lcswConfig?.emergencyContact?.name || "",
                  phone: settings.lcswConfig?.emergencyContact?.phone || "",
                  email: e.target.value
                }
              }),
              placeholder: "contact@email.com",
              className: "w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-bold text-text-primary dark:text-white mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📊" }),
        " Report Settings"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: settings.emailSchedule?.enabled || false,
              onChange: (e) => updateEmailSchedule({ enabled: e.target.checked }),
              className: "w-4 h-4 rounded"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-text-primary dark:text-white", children: "Enable Email Reports" })
        ] }),
        settings.emailSchedule?.enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Frequency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: settings.emailSchedule?.frequency || "weekly",
                onChange: (e) => updateEmailSchedule({ frequency: e.target.value }),
                className: "w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "daily", children: "Daily" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "weekly", children: "Weekly" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "monthly", children: "Monthly" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Send Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "time",
                value: settings.emailSchedule?.time || "09:00",
                onChange: (e) => updateEmailSchedule({ time: e.target.value }),
                className: "w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
              }
            )
          ] }),
          settings.emailSchedule?.frequency === "weekly" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Day of Week" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: settings.emailSchedule?.dayOfWeek ?? 1,
                onChange: (e) => updateEmailSchedule({ dayOfWeek: parseInt(e.target.value) }),
                className: "w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 0, children: "Sunday" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 1, children: "Monday" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 2, children: "Tuesday" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 3, children: "Wednesday" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 4, children: "Thursday" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 5, children: "Friday" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 6, children: "Saturday" })
                ]
              }
            )
          ] }),
          settings.emailSchedule?.frequency === "monthly" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Day of Month" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: settings.emailSchedule?.dayOfMonth ?? 1,
                onChange: (e) => updateEmailSchedule({ dayOfMonth: parseInt(e.target.value) }),
                className: "w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white",
                children: Array.from({ length: 31 }, (_, i) => i + 1).map((day) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: day, children: [
                  day,
                  day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"
                ] }, day))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Recipient Emails" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              settings.emailSchedule?.recipientEmails?.map((email, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "email",
                    value: email,
                    readOnly: true,
                    className: "flex-1 px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => removeRecipientEmail(index),
                    className: "px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg",
                    children: "Remove"
                  }
                )
              ] }, index)),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => openEmailModal("recipient"),
                  className: "w-full px-3 py-2 text-sm bg-bg-secondary dark:bg-dark-bg-primary text-text-primary dark:text-white rounded-lg hover:bg-bg-secondary/80 transition-colors",
                  children: "+ Add Recipient Email"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: settings.emailSchedule?.sendGoalCompletions || false,
                  onChange: (e) => updateEmailSchedule({ sendGoalCompletions: e.target.checked }),
                  className: "w-4 h-4 rounded"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-text-primary dark:text-white", children: "Include Goal Completions" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: settings.emailSchedule?.sendReports || false,
                  onChange: (e) => updateEmailSchedule({ sendReports: e.target.checked }),
                  className: "w-4 h-4 rounded"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-text-primary dark:text-white", children: "Include Clinical Reports" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-bold text-text-primary dark:text-white mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🔔" }),
        " Nudges & Reminders"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: settings.reminders?.enabled || false,
              onChange: (e) => updateReminders({ enabled: e.target.checked }),
              className: "w-4 h-4 rounded"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-text-primary dark:text-white", children: "Enable Reminders" })
        ] }),
        settings.reminders?.enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Frequency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: settings.reminders?.frequency || "daily",
                onChange: (e) => updateReminders({ frequency: e.target.value }),
                className: "w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hourly", children: "Hourly" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "daily", children: "Daily" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "weekly", children: "Weekly" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "monthly", children: "Monthly" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-primary dark:text-white mb-1", children: "Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "time",
                value: settings.reminders?.time || "09:00",
                onChange: (e) => updateReminders({ time: e.target.value }),
                className: "w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-bold text-text-primary dark:text-white mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🔐" }),
        " Account & Data"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-xl bg-bg-secondary dark:bg-dark-bg-primary/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-text-secondary dark:text-white/60", children: "Username" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-text-primary dark:text-white", children: username || "Not set" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-text-secondary dark:text-white/60", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-text-primary dark:text-white", children: userEmail || "Not set" })
          ] })
        ] }) }),
        isEncryptionEnabled2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: onLogout,
            className: "w-full flex items-center justify-between p-3 rounded-xl bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white hover:bg-bg-secondary/80 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Lock App" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: "🔒" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleClearCache,
            disabled: isClearingCache,
            className: "w-full flex items-center justify-between p-3 rounded-xl bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white hover:bg-bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: isClearingCache ? "Clearing Cache..." : "Clear Cache" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: "🗑️" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center pt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-bold text-text-tertiary uppercase tracking-widest", children: [
        "GROUNDED V",
        version
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-tertiary mt-1", children: "Made with 💙 for mental wellness" })
    ] }),
    showEmailModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-primary dark:bg-dark-bg-primary text-text-primary dark:text-white rounded-2xl max-w-md w-full p-6 shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold mb-4", children: emailModalType === "therapist" ? "Add Therapist Email" : "Add Recipient Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "email",
          value: emailInput,
          onChange: (e) => setEmailInput(e.target.value),
          placeholder: emailModalType === "therapist" ? "therapist@example.com" : "recipient@example.com",
          className: "w-full px-4 py-3 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white mb-4 focus:ring-2 focus:ring-brand dark:focus:ring-brand-light outline-none",
          autoFocus: true,
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              handleEmailSubmit();
            } else if (e.key === "Escape") {
              setShowEmailModal(false);
              setEmailInput("");
              setEmailModalType(null);
            }
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setShowEmailModal(false);
              setEmailInput("");
              setEmailModalType(null);
            },
            className: "flex-1 px-4 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary text-text-primary dark:text-white hover:bg-bg-secondary/80 transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleEmailSubmit,
            disabled: !emailInput || !emailInput.includes("@"),
            className: "flex-1 px-4 py-2 rounded-lg bg-brand dark:bg-brand-light text-white dark:text-navy-dark hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            children: "Add"
          }
        )
      ] })
    ] }) })
  ] });
};
const MAX_LOG_ENTRIES = 100;
const logEntries = [];
function clearDebugLog() {
  logEntries.length = 0;
  logEntry("info", "Debug log cleared by user");
}
function clearLogEntriesByLevel(level) {
  const initialLength = logEntries.length;
  for (let i = logEntries.length - 1; i >= 0; i--) {
    if (logEntries[i].level === level) {
      logEntries.splice(i, 1);
    }
  }
  if (logEntries.length < initialLength) {
    logEntry("info", `Cleared ${level} entries from debug log`);
  }
}
function clearLogEntry(timestamp, message, level) {
  const index = logEntries.findIndex(
    (e) => e.timestamp === timestamp && e.message === message && e.level === level
  );
  if (index !== -1) {
    logEntries.splice(index, 1);
    return true;
  }
  return false;
}
function logEntry(level, message, details) {
  const entry = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level,
    message,
    details,
    stack: details?.error instanceof Error ? details.error.stack : void 0
  };
  logEntries.push(entry);
  if (logEntries.length > MAX_LOG_ENTRIES) {
    logEntries.shift();
  }
}
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";
  let engine = "Unknown";
  if (ua.includes("Edg")) {
    browserName = "Edge";
    const match = ua.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
    engine = "Blink";
  } else if (ua.includes("Chrome") && !ua.includes("Edg")) {
    browserName = "Chrome";
    const match = ua.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
    engine = "Blink";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browserName = "Safari";
    const match = ua.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
    engine = "WebKit";
  } else if (ua.includes("Firefox")) {
    browserName = "Firefox";
    const match = ua.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
    engine = "Gecko";
  }
  if (engine === "Unknown") {
    if (ua.includes("WebKit")) {
      engine = "WebKit";
    } else if (ua.includes("Gecko")) {
      engine = "Gecko";
    }
  }
  return { name: browserName, version: browserVersion, engine };
}
function getPlatformInfo() {
  const platform = navigator.platform;
  return platform;
}
async function getIndexedDBDatabases() {
  try {
    if (!("indexedDB" in window)) {
      return [];
    }
    if ("databases" in indexedDB) {
      const databases = await indexedDB.databases();
      return databases.map((db2) => db2.name);
    }
    return ["GroundedDB"];
  } catch (error) {
    return [];
  }
}
async function getServiceWorkerInfo() {
  const available = "serviceWorker" in navigator;
  let registered = false;
  let scope;
  if (available) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      registered = !!registration;
      scope = registration?.scope;
    } catch (error) {
    }
  }
  return { available, registered, scope };
}
function getNetworkInfo() {
  const online = navigator.onLine;
  let connectionType;
  if ("connection" in navigator) {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      connectionType = conn.effectiveType || conn.type;
    }
  }
  return { online, connectionType };
}
async function generateDebugLog() {
  const compatibilityReport = getCompatibilityReport();
  const compatibility = compatibilityReport || {
    sharedArrayBuffer: false,
    crossOriginIsolated: false,
    webGPU: false,
    wasm: false,
    estimatedMemory: null,
    deviceType: "unknown",
    browser: "Unknown",
    os: "Unknown"
  };
  const modelStatus = getModelStatus();
  const errors = logEntries.filter((e) => e.level === "error");
  const warnings = logEntries.filter((e) => e.level === "warning");
  const recentLogs = logEntries.slice(-20);
  const browserInfo = getBrowserInfo();
  const indexedDBDatabases = await getIndexedDBDatabases();
  const serviceWorkerInfo = await getServiceWorkerInfo();
  const networkInfo = getNetworkInfo();
  const localStorageKeys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageKeys.push(key);
      }
    }
  } catch (error) {
  }
  return {
    appVersion: "1.12.27",
    // Should match package.json version
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    userAgent: navigator.userAgent,
    platform: getPlatformInfo(),
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    browserInfo,
    compatibility: {
      sharedArrayBuffer: compatibility.sharedArrayBuffer,
      crossOriginIsolated: compatibility.crossOriginIsolated,
      webGPU: compatibility.webGPU,
      webAssembly: compatibility.wasm,
      estimatedMemory: compatibility.estimatedMemory || 0,
      device: compatibility.deviceType,
      browser: `${compatibility.browser} on ${compatibility.os}`
    },
    aiModelStatus: {
      loaded: modelStatus.loaded,
      loading: modelStatus.loading,
      moodTracker: modelStatus.moodTracker,
      counselingCoach: modelStatus.counselingCoach
    },
    errors,
    warnings,
    recentLogs,
    localStorage: {
      available: typeof Storage !== "undefined",
      keys: localStorageKeys
    },
    indexedDB: {
      available: "indexedDB" in window,
      databases: indexedDBDatabases
    },
    serviceWorker: serviceWorkerInfo,
    networkStatus: networkInfo
  };
}
function formatDebugLogForEmail(log) {
  const lines = [];
  lines.push("=".repeat(60));
  lines.push("GROUNDED APP DEBUG LOG");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push(`Generated: ${log.timestamp}`);
  lines.push(`App Version: ${log.appVersion}`);
  lines.push("");
  lines.push("SYSTEM INFORMATION");
  lines.push("-".repeat(60));
  lines.push(`Platform: ${log.platform}`);
  lines.push(`Browser: ${log.browserInfo.name} ${log.browserInfo.version} (${log.browserInfo.engine})`);
  lines.push(`User Agent: ${log.userAgent}`);
  lines.push(`Language: ${log.language}`);
  lines.push(`Timezone: ${log.timezone}`);
  lines.push(`Screen Resolution: ${log.screenResolution}`);
  lines.push("");
  lines.push("BROWSER COMPATIBILITY");
  lines.push("-".repeat(60));
  lines.push(`SharedArrayBuffer: ${log.compatibility.sharedArrayBuffer ? "✓ Available" : "✗ Not Available"}`);
  lines.push(`Cross-Origin Isolated: ${log.compatibility.crossOriginIsolated ? "✓ Enabled" : "✗ Not Enabled"}`);
  lines.push(`WebGPU: ${log.compatibility.webGPU ? "✓ Available" : "✗ Not Available"}`);
  lines.push(`WebAssembly: ${log.compatibility.webAssembly ? "✓ Available" : "✗ Not Available"}`);
  lines.push(`Estimated Memory: ${log.compatibility.estimatedMemory} MB`);
  lines.push(`Device: ${log.compatibility.device}`);
  lines.push(`Browser: ${log.compatibility.browser}`);
  lines.push("");
  lines.push("AI MODEL STATUS");
  lines.push("-".repeat(60));
  lines.push(`Models Loaded: ${log.aiModelStatus.loaded ? "✓ Yes" : "✗ No"}`);
  lines.push(`Currently Loading: ${log.aiModelStatus.loading ? "Yes" : "No"}`);
  lines.push(`Mood Tracker: ${log.aiModelStatus.moodTracker ? "✓ Available" : "✗ Not Available"}`);
  lines.push(`Counseling Coach: ${log.aiModelStatus.counselingCoach ? "✓ Available" : "✗ Not Available"}`);
  lines.push("");
  lines.push("STORAGE");
  lines.push("-".repeat(60));
  lines.push(`LocalStorage: ${log.localStorage.available ? "✓ Available" : "✗ Not Available"}`);
  lines.push(`LocalStorage Keys: ${log.localStorage.keys.join(", ") || "None"}`);
  lines.push(`IndexedDB: ${log.indexedDB.available ? "✓ Available" : "✗ Not Available"}`);
  lines.push(`IndexedDB Databases: ${log.indexedDB.databases.join(", ") || "None"}`);
  lines.push("");
  lines.push("SERVICE WORKER");
  lines.push("-".repeat(60));
  lines.push(`Available: ${log.serviceWorker.available ? "✓ Yes" : "✗ No"}`);
  lines.push(`Registered: ${log.serviceWorker.registered ? "✓ Yes" : "✗ No"}`);
  if (log.serviceWorker.scope) {
    lines.push(`Scope: ${log.serviceWorker.scope}`);
  }
  lines.push("");
  lines.push("NETWORK");
  lines.push("-".repeat(60));
  lines.push(`Online: ${log.networkStatus.online ? "✓ Yes" : "✗ No"}`);
  if (log.networkStatus.connectionType) {
    lines.push(`Connection Type: ${log.networkStatus.connectionType}`);
  }
  lines.push("");
  if (log.errors.length > 0) {
    lines.push("ERRORS");
    lines.push("-".repeat(60));
    log.errors.forEach((error, index) => {
      lines.push(`${index + 1}. [${error.timestamp}] ${error.message}`);
      if (error.stack) {
        lines.push(`   Stack: ${error.stack.split("\n").slice(0, 3).join("\n   ")}`);
      }
      if (error.details) {
        lines.push(`   Details: ${JSON.stringify(error.details, null, 2).split("\n").slice(0, 5).join("\n   ")}`);
      }
      lines.push("");
    });
  }
  if (log.warnings.length > 0) {
    lines.push("WARNINGS");
    lines.push("-".repeat(60));
    log.warnings.forEach((warning, index) => {
      lines.push(`${index + 1}. [${warning.timestamp}] ${warning.message}`);
      if (warning.details) {
        lines.push(`   Details: ${JSON.stringify(warning.details, null, 2).split("\n").slice(0, 3).join("\n   ")}`);
      }
      lines.push("");
    });
  }
  if (log.recentLogs.length > 0) {
    lines.push("RECENT LOG ENTRIES (Last 20)");
    lines.push("-".repeat(60));
    log.recentLogs.forEach((entry, index) => {
      lines.push(`${index + 1}. [${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`);
    });
    lines.push("");
  }
  lines.push("=".repeat(60));
  lines.push("END OF DEBUG LOG");
  lines.push("=".repeat(60));
  return lines.join("\n");
}
function createEmailWithDebugLog(log) {
  const subject = encodeURIComponent("Grounded App Debug Log - Support Request");
  const body = encodeURIComponent(
    `Hello,

I'm experiencing issues with the Grounded app. Please find the debug log attached below.

---

${formatDebugLogForEmail(log)}

---

Thank you for your help!`
  );
  return `mailto:ac.minds.ai@gmail.com?subject=${subject}&body=${body}`;
}
const DebugLogComponent = ({ onClose }) => {
  const [log, setLog] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [copied, setCopied] = reactExports.useState(false);
  const [emailed, setEmailed] = reactExports.useState(false);
  const [expandedSections, setExpandedSections] = reactExports.useState(/* @__PURE__ */ new Set(["errors", "warnings"]));
  reactExports.useEffect(() => {
    generateDebugLog().then((debugLog) => {
      setLog(debugLog);
      setLoading(false);
    }).catch((error) => {
      console.error("Failed to generate debug log:", error);
      setLoading(false);
      setLog(null);
    });
  }, []);
  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };
  const handleCopy = async () => {
    if (!log) return;
    const logText = formatDebugLogForEmail(log);
    try {
      await navigator.clipboard.writeText(logText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard. Please use the email button instead.");
    }
  };
  const handleEmail = () => {
    if (!log) return;
    const emailLink = createEmailWithDebugLog(log);
    window.location.href = emailLink;
    setEmailed(true);
  };
  const handleClear = () => {
    if (window.confirm("Warning: This will permanently delete all captured debug logs. Are you sure?")) {
      clearDebugLog();
      setLoading(true);
      generateDebugLog().then((debugLog) => {
        setLog(debugLog);
        setLoading(false);
        setCopied(false);
        setEmailed(false);
      });
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-dark-bg-primary w-full max-w-2xl rounded-[40px] shadow-2xl p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-navy-primary mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary dark:text-text-secondary", children: "Generating debug log..." })
    ] }) }) });
  }
  if (!log) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-dark-bg-primary w-full max-w-2xl rounded-[40px] shadow-2xl p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary dark:text-text-secondary", children: "Failed to generate debug log." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          className: "mt-4 px-6 py-3 bg-navy-primary text-white rounded-xl font-black uppercase tracking-widest",
          children: "Close"
        }
      )
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-primary w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-border-soft dark:border-dark-border flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-text-primary dark:text-white", children: "Debug Log" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary dark:text-text-secondary mt-1", children: "Diagnostic information for troubleshooting" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          className: "w-10 h-10 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Section,
        {
          title: "System Information",
          expanded: expandedSections.has("system"),
          onToggle: () => toggleSection("system"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "App Version", value: log.appVersion }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Platform", value: log.platform }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Browser", value: `${log.browserInfo.name} ${log.browserInfo.version}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Engine", value: log.browserInfo.engine }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Language", value: log.language }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Timezone", value: log.timezone }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Screen", value: log.screenResolution })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Section,
        {
          title: "Browser Compatibility",
          expanded: expandedSections.has("compatibility"),
          onToggle: () => toggleSection("compatibility"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "SharedArrayBuffer", value: log.compatibility.sharedArrayBuffer }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "Cross-Origin Isolated", value: log.compatibility.crossOriginIsolated }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "WebGPU", value: log.compatibility.webGPU }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "WebAssembly", value: log.compatibility.webAssembly }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Estimated Memory", value: `${log.compatibility.estimatedMemory} MB` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Device", value: log.compatibility.device }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Browser", value: log.compatibility.browser })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Section,
        {
          title: "AI Model Status",
          expanded: expandedSections.has("ai"),
          onToggle: () => toggleSection("ai"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "Models Loaded", value: log.aiModelStatus.loaded }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Loading", value: log.aiModelStatus.loading ? "Yes" : "No" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "Mood Tracker", value: log.aiModelStatus.moodTracker }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "Counseling Coach", value: log.aiModelStatus.counselingCoach })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Section,
        {
          title: "Storage",
          expanded: expandedSections.has("storage"),
          onToggle: () => toggleSection("storage"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "LocalStorage", value: log.localStorage.available }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Keys", value: log.localStorage.keys.join(", ") || "None" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "IndexedDB", value: log.indexedDB.available }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Databases", value: log.indexedDB.databases.join(", ") || "None" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Section,
        {
          title: "Service Worker",
          expanded: expandedSections.has("sw"),
          onToggle: () => toggleSection("sw"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "Available", value: log.serviceWorker.available }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "Registered", value: log.serviceWorker.registered }),
            log.serviceWorker.scope && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Scope", value: log.serviceWorker.scope })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Section,
        {
          title: "Network",
          expanded: expandedSections.has("network"),
          onToggle: () => toggleSection("network"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRow, { label: "Online", value: log.networkStatus.online }),
            log.networkStatus.connectionType && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Connection", value: log.networkStatus.connectionType })
          ] })
        }
      ),
      log.errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Section,
        {
          title: `Errors (${log.errors.length})`,
          expanded: expandedSections.has("errors"),
          onToggle: () => toggleSection("errors"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 text-sm", children: log.errors.map((error, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-red-800 dark:text-red-200", children: error.message }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 dark:text-red-400 mt-1", children: error.timestamp }),
            error.stack && /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs text-red-600 dark:text-red-400 mt-2 whitespace-pre-wrap break-all", children: error.stack.split("\n").slice(0, 3).join("\n") })
          ] }, index)) })
        }
      ),
      log.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Section,
        {
          title: `Warnings (${log.warnings.length})`,
          expanded: expandedSections.has("warnings"),
          onToggle: () => toggleSection("warnings"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 text-sm", children: log.warnings.map((warning, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-yellow-800 dark:text-yellow-200", children: warning.message }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-yellow-600 dark:text-yellow-400 mt-1", children: warning.timestamp })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  if (clearLogEntry(warning.timestamp, warning.message, "warning")) {
                    generateDebugLog().then((debugLog) => {
                      setLog(debugLog);
                    });
                  }
                },
                className: "text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 px-2 py-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors flex-shrink-0",
                title: "Clear this warning",
                children: "✕"
              }
            )
          ] }, index)) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-t border-border-soft dark:border-dark-border space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleCopy,
            className: "flex-1 px-4 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary",
            children: copied ? "✓ Copied!" : "Copy Log"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleEmail,
            className: "flex-1 px-4 py-3 bg-navy-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90",
            children: "📧 Email Support"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleClear,
            className: "px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30",
            children: "🗑️ Clear All"
          }
        ),
        log.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              if (window.confirm(`Clear all ${log.warnings.length} warning(s)?`)) {
                clearLogEntriesByLevel("warning");
                generateDebugLog().then((debugLog) => {
                  setLog(debugLog);
                });
              }
            },
            className: "px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
            children: "⚠️ Clear Warnings"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-tertiary dark:text-text-tertiary text-center", children: 'Click "Email Support" to open your email client with the debug log attached' })
    ] })
  ] }) });
};
const Section = ({ title, expanded, onToggle, children }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-border-soft dark:border-dark-border overflow-hidden", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: onToggle,
      className: "w-full px-4 py-3 flex items-center justify-between text-left hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black text-text-primary dark:text-white uppercase tracking-widest", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            className: `w-5 h-5 text-text-tertiary dark:text-text-tertiary transition-transform ${expanded ? "rotate-180" : ""}`,
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
          }
        )
      ]
    }
  ),
  expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-t border-border-soft dark:border-dark-border", children })
] });
const InfoRow = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-secondary dark:text-text-secondary", children: [
    label,
    ":"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-text-primary dark:text-white", children: value })
] });
const StatusRow = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-secondary dark:text-text-secondary", children: [
    label,
    ":"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-semibold ${value ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`, children: value ? "✓" : "✗" })
] });
class DatabaseService {
  constructor() {
    this.dbName = "groundedDB";
    this.dbVersion = 8;
    this.db = null;
    this.oldDbName = "com.acminds.grounded.therapy.db";
    this.APP_ID = "com.acminds.grounded";
    this.APP_NAME = "Grounded";
    this.metadataValidated = false;
    this.oldDatabaseCheckCache = null;
    this.metadataCache = null;
  }
  /**
   * Check if old database exists and needs migration
   * Optimized: Uses cached result and faster detection method
   */
  async checkForOldDatabase() {
    if (this.oldDatabaseCheckCache !== null) {
      return this.oldDatabaseCheckCache;
    }
    if (typeof indexedDB === "undefined") {
      this.oldDatabaseCheckCache = false;
      return false;
    }
    try {
      const result = await new Promise((resolve) => {
        const request = indexedDB.open(this.oldDbName);
        const timeout = setTimeout(() => {
          resolve(false);
        }, 100);
        request.onsuccess = () => {
          clearTimeout(timeout);
          request.result.close();
          resolve(true);
        };
        request.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };
      });
      this.oldDatabaseCheckCache = result;
      return result;
    } catch (error) {
      logger.warn("Error checking for old database:", error);
      this.oldDatabaseCheckCache = false;
      return false;
    }
  }
  /**
   * Delete old database if it exists
   */
  async deleteOldDatabase() {
    try {
      if ("databases" in indexedDB) {
        const databases = await indexedDB.databases();
        const oldDb = databases.find((db2) => db2.name === this.oldDbName);
        if (oldDb) {
          await new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(this.oldDbName);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
            deleteRequest.onblocked = () => {
              logger.warn("Old database deletion blocked - another tab may have it open");
              setTimeout(() => resolve(), 1e3);
            };
          });
          logger.info("✅ Old database deleted successfully");
        }
      }
    } catch (error) {
      logger.warn("Error deleting old database:", error);
    }
  }
  /**
   * Validate that database was created by this app
   * Optimized: Only validates once per session, uses cached metadata
   */
  async validateDatabase() {
    if (this.metadataValidated) {
      return true;
    }
    if (!this.db) {
      return false;
    }
    try {
      let metadata = this.metadataCache;
      if (!metadata) {
        metadata = await this.getMetadata();
        this.metadataCache = metadata;
      }
      if (!metadata) {
        this.setMetadata().catch((err) => {
          logger.warn("Failed to set metadata (non-critical):", err);
        });
        this.metadataValidated = true;
        return true;
      }
      const isValid = metadata.appId === this.APP_ID && metadata.appName === this.APP_NAME;
      if (!isValid) {
        logger.error("Database validation failed - metadata mismatch");
        return false;
      }
      this.metadataValidated = true;
      this.updateMetadataValidation().catch((err) => {
        logger.warn("Failed to update metadata validation timestamp (non-critical):", err);
      });
      return true;
    } catch (error) {
      logger.error("Error validating database:", error);
      return false;
    }
  }
  /**
   * Get database metadata
   * Optimized: Returns cached metadata if available
   */
  async getMetadata() {
    if (this.metadataCache !== null) {
      return this.metadataCache;
    }
    if (!this.db) {
      return null;
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(["metadata"], "readonly");
        const store = transaction.objectStore("metadata");
        const request = store.get("app_metadata");
        request.onsuccess = () => {
          const result = request.result || null;
          this.metadataCache = result;
          resolve(result);
        };
        request.onerror = () => {
          resolve(null);
        };
      } catch (error) {
        resolve(null);
      }
    });
  }
  /**
   * Set database metadata
   */
  async setMetadata() {
    if (!this.db) {
      return;
    }
    if (!this.db.objectStoreNames.contains("metadata")) {
      logger.warn("Metadata object store does not exist - database may need upgrade");
      return;
    }
    const platform = this.detectPlatform();
    let version = "1.0.0";
    {
      version = "1.13.8";
    }
    const metadata = {
      appName: this.APP_NAME,
      appId: this.APP_ID,
      platform,
      // Uses actual detected platform (desktop/android/ios/pwa)
      version,
      // Uses version from package.json via Vite env
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastValidated: (/* @__PURE__ */ new Date()).toISOString()
    };
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(["metadata"], "readwrite");
        const store = transaction.objectStore("metadata");
        const request = store.put({ id: "app_metadata", ...metadata });
        request.onsuccess = () => resolve();
        request.onerror = () => {
          logger.warn("Failed to set metadata (non-critical):", request.error);
          resolve();
        };
      } catch (error) {
        logger.warn("Failed to set metadata (non-critical):", error);
        resolve();
      }
    });
  }
  /**
   * Update metadata validation timestamp
   */
  async updateMetadataValidation() {
    if (!this.db || !this.db.objectStoreNames.contains("metadata")) {
      return;
    }
    const metadata = await this.getMetadata();
    if (metadata) {
      try {
        metadata.lastValidated = (/* @__PURE__ */ new Date()).toISOString();
        const transaction = this.db.transaction(["metadata"], "readwrite");
        const store = transaction.objectStore("metadata");
        store.put({ id: "app_metadata", ...metadata });
      } catch (error) {
        logger.warn("Failed to update metadata validation (non-critical):", error);
      }
    }
  }
  /**
   * Detect current platform
   */
  detectPlatform() {
    if (typeof window === "undefined") {
      return "unknown";
    }
    if (typeof window !== "undefined" && "__TAURI__" in window) {
      return "desktop";
    }
    if (typeof window !== "undefined" && window.Capacitor) {
      const platform = window.Capacitor.getPlatform();
      return platform || "mobile";
    }
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
      return "android";
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "ios";
    }
    return "pwa";
  }
  // Migration: Move existing values/goals from appData to new tables
  async migrateToNewTables() {
    if (!this.db) return;
    try {
      const migrationKey = "values_goals_migration_complete";
      const migrationDone = localStorage.getItem(migrationKey);
      if (migrationDone === "true") {
        return;
      }
      logger.info("[MIGRATION] Starting migration of values and goals to new tables...");
      if (!this.db.objectStoreNames.contains("appData")) {
        localStorage.setItem(migrationKey, "true");
        return;
      }
      const transaction = this.db.transaction(["appData", "values", "goals"], "readwrite");
      const appDataStore = transaction.objectStore("appData");
      const valuesStore = transaction.objectStore("values");
      const goalsStore = transaction.objectStore("goals");
      const getAllRequest = appDataStore.getAll();
      await new Promise((resolve, reject) => {
        getAllRequest.onsuccess = async () => {
          const allAppData = getAllRequest.result;
          let migrated = 0;
          for (const appDataEntry of allAppData) {
            const { userId, data } = appDataEntry;
            if (!userId || !data) continue;
            if (data.values && Array.isArray(data.values) && data.values.length > 0) {
              try {
                await this.setValuesActive(userId, data.values);
                migrated++;
              } catch (err) {
                logger.warn(`[MIGRATION] Failed to migrate values for user ${userId}:`, err);
              }
            }
            if (data.goals && Array.isArray(data.goals) && data.goals.length > 0) {
              for (const goal of data.goals) {
                try {
                  await this.saveGoal(goal);
                } catch (err) {
                  logger.warn(`[MIGRATION] Failed to migrate goal ${goal.id}:`, err);
                }
              }
            }
          }
          logger.info(`[MIGRATION] Completed: migrated ${migrated} users' data`);
          localStorage.setItem(migrationKey, "true");
          resolve();
        };
        getAllRequest.onerror = () => {
          logger.warn("[MIGRATION] Failed to read appData for migration");
          localStorage.setItem(migrationKey, "true");
          resolve();
        };
      });
    } catch (error) {
      logger.warn("[MIGRATION] Migration error (non-critical):", error);
      localStorage.setItem("values_goals_migration_complete", "true");
    }
  }
  async init() {
    if (this.db) {
      return Promise.resolve();
    }
    const maxRetries = 2;
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await new Promise((resolve, reject) => {
          this.initDatabase(resolve, reject);
        });
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message;
        if (errorMessage.includes("backing store") || errorMessage.includes("Internal error")) {
          if (attempt < maxRetries - 1) {
            logger.warn(`Database initialization attempt ${attempt + 1} failed, retrying...`);
            await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
            continue;
          }
        }
        throw lastError;
      }
    }
    throw lastError || new Error("Database initialization failed after retries");
  }
  initDatabase(resolve, reject) {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser"));
      return;
    }
    const request = indexedDB.open(this.dbName, this.dbVersion);
    request.onerror = () => {
      const error = request.error || new Error("Unknown database error");
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Database open error:", error);
      if (errorMessage.includes("backing store") || errorMessage.includes("Internal error")) {
        reject(new Error("Database storage error. Please try refreshing the page or clearing browser data."));
      } else if (errorMessage.includes("QuotaExceeded") || errorMessage.includes("quota")) {
        reject(new Error("Storage quota exceeded. Please clear some browser data and try again."));
      } else if (errorMessage.includes("blocked") || errorMessage.includes("Blocked")) {
        reject(new Error("Database access is blocked. Please check your browser settings and allow local storage."));
      } else {
        reject(error);
      }
    };
    request.onsuccess = async () => {
      try {
        this.db = request.result;
        if (!this.db) {
          reject(new Error("Database connection is null"));
          return;
        }
        this.db.onerror = (event) => {
          logger.error("Database error:", event);
        };
        this.db.onclose = () => {
          logger.warn("Database connection closed");
          this.db = null;
          this.metadataValidated = false;
          this.metadataCache = null;
        };
        if (!this.metadataValidated) {
          const isValid = await this.validateDatabase();
          if (!isValid) {
            reject(new Error("Database validation failed - database may be corrupted or from another app"));
            return;
          }
        }
        resolve();
      } catch (error) {
        logger.error("Error setting up database:", error);
        reject(error);
      }
    };
    request.onupgradeneeded = (event) => {
      const db2 = event.target.result;
      if (!db2) {
        reject(new Error("Database upgrade failed - database is null"));
        return;
      }
      if (!db2.objectStoreNames.contains("users")) {
        const userStore = db2.createObjectStore("users", { keyPath: "id" });
        userStore.createIndex("username", "username", { unique: true });
        userStore.createIndex("email", "email", { unique: true });
      }
      if (!db2.objectStoreNames.contains("appData")) {
        const appDataStore = db2.createObjectStore("appData", { keyPath: "userId" });
        appDataStore.createIndex("userId", "userId", { unique: true });
      }
      if (!db2.objectStoreNames.contains("resetTokens")) {
        const resetStore = db2.createObjectStore("resetTokens", { keyPath: "token" });
        resetStore.createIndex("userId", "userId", { unique: false });
        resetStore.createIndex("expires", "expires", { unique: false });
      }
      if (!db2.objectStoreNames.contains("feelingLogs")) {
        const feelingLogStore = db2.createObjectStore("feelingLogs", { keyPath: "id" });
        feelingLogStore.createIndex("timestamp", "timestamp", { unique: false });
        feelingLogStore.createIndex("emotionalState", "emotionalState", { unique: false });
      }
      if (!db2.objectStoreNames.contains("userInteractions")) {
        const interactionStore = db2.createObjectStore("userInteractions", { keyPath: "id" });
        interactionStore.createIndex("timestamp", "timestamp", { unique: false });
        interactionStore.createIndex("sessionId", "sessionId", { unique: false });
        interactionStore.createIndex("type", "type", { unique: false });
      }
      if (!db2.objectStoreNames.contains("sessions")) {
        const sessionStore = db2.createObjectStore("sessions", { keyPath: "id" });
        sessionStore.createIndex("startTimestamp", "startTimestamp", { unique: false });
        sessionStore.createIndex("valueId", "valueId", { unique: false });
        sessionStore.createIndex("userId", "userId", { unique: false });
      }
      if (!db2.objectStoreNames.contains("assessments")) {
        const assessmentStore = db2.createObjectStore("assessments", { keyPath: "id" });
        assessmentStore.createIndex("userId", "userId", { unique: false });
        assessmentStore.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!db2.objectStoreNames.contains("reports")) {
        const reportStore = db2.createObjectStore("reports", { keyPath: "id" });
        reportStore.createIndex("userId", "userId", { unique: false });
        reportStore.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!db2.objectStoreNames.contains("metadata")) {
        const metadataStore = db2.createObjectStore("metadata", { keyPath: "id" });
        metadataStore.createIndex("appId", "appId", { unique: false });
        metadataStore.createIndex("platform", "platform", { unique: false });
      }
      if (!db2.objectStoreNames.contains("ruleBasedUsageLogs")) {
        const ruleBasedLogStore = db2.createObjectStore("ruleBasedUsageLogs", { keyPath: "id" });
        ruleBasedLogStore.createIndex("timestamp", "timestamp", { unique: false });
        ruleBasedLogStore.createIndex("type", "type", { unique: false });
      }
      if (!db2.objectStoreNames.contains("assessments")) {
        const assessmentStore = db2.createObjectStore("assessments", { keyPath: "id" });
        assessmentStore.createIndex("userId", "userId", { unique: false });
        assessmentStore.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!db2.objectStoreNames.contains("reports")) {
        const reportStore = db2.createObjectStore("reports", { keyPath: "id" });
        reportStore.createIndex("userId", "userId", { unique: false });
        reportStore.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!db2.objectStoreNames.contains("values")) {
        const valuesStore = db2.createObjectStore("values", { keyPath: "id", autoIncrement: true });
        valuesStore.createIndex("userId", "userId", { unique: false });
        valuesStore.createIndex("valueId", "valueId", { unique: false });
        valuesStore.createIndex("active", "active", { unique: false });
        valuesStore.createIndex("createdAt", "createdAt", { unique: false });
        valuesStore.createIndex("userId_active", ["userId", "active"], { unique: false });
      }
      if (!db2.objectStoreNames.contains("goals")) {
        const goalsStore = db2.createObjectStore("goals", { keyPath: "id" });
        goalsStore.createIndex("userId", "userId", { unique: false });
        goalsStore.createIndex("valueId", "valueId", { unique: false });
        goalsStore.createIndex("completed", "completed", { unique: false });
        goalsStore.createIndex("createdAt", "createdAt", { unique: false });
      }
      request.onblocked = () => {
        logger.warn("Database upgrade blocked - another tab may have the database open");
      };
    };
  }
  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error("Database initialization failed");
    }
    return this.db;
  }
  // User operations
  async createUser(userData) {
    const db2 = await this.ensureDB();
    const user = {
      ...userData,
      id: this.generateUUID(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      const request = store.add(user);
      request.onsuccess = () => resolve(user.id);
      request.onerror = () => reject(request.error);
    });
  }
  async getUserByUsername(username) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const index = store.index("username");
      const request = index.get(username);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  async getUserByEmail(email) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const index = store.index("email");
      const request = index.get(email);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  async getUserById(userId) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  async getAllUsers() {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }
  async updateUser(userId, updates) {
    const db2 = await this.ensureDB();
    return new Promise(async (resolve, reject) => {
      const user = await this.getUserById(userId);
      if (!user) {
        reject(new Error("User not found"));
        return;
      }
      const transaction = db2.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      const updatedUser = { ...user, ...updates };
      const request = store.put(updatedUser);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  // App data operations
  async getAppData(userId) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("appData")) {
      return null;
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["appData"], "readonly");
        const store = transaction.objectStore("appData");
        const request = store.get(userId);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => {
          logger.warn("Failed to get app data (non-critical):", request.error);
          resolve(null);
        };
      } catch (error) {
        logger.warn("Failed to get app data (non-critical):", error);
        resolve(null);
      }
    });
  }
  async saveAppData(userId, data) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("appData")) {
      logger.warn("App data store not available - data will not be saved");
      return;
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["appData"], "readwrite");
        const store = transaction.objectStore("appData");
        const request = store.put({ userId, data });
        request.onsuccess = () => resolve();
        request.onerror = () => {
          logger.warn("Failed to save app data (non-critical):", request.error);
          resolve();
        };
      } catch (error) {
        logger.warn("Failed to save app data (non-critical):", error);
        resolve();
      }
    });
  }
  // Reset token operations
  async createResetToken(userId, email) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("resetTokens")) {
      throw new Error("Reset tokens store not available - database may need upgrade");
    }
    const token = generateUUID();
    const expires = Date.now() + 24 * 60 * 60 * 1e3;
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["resetTokens"], "readwrite");
        const store = transaction.objectStore("resetTokens");
        const request = store.add({
          token,
          userId,
          email,
          expires,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        request.onsuccess = () => resolve(token);
        request.onerror = (event) => {
          const error = event.target.error;
          logger.error("Failed to create reset token:", error);
          reject(error || new Error("Failed to create reset token in database"));
        };
      } catch (error) {
        logger.error("Failed to create reset token:", error);
        reject(error);
      }
    });
  }
  async getResetToken(token) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("resetTokens")) {
      return null;
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["resetTokens"], "readonly");
        const store = transaction.objectStore("resetTokens");
        const request = store.get(token);
        request.onsuccess = () => {
          const result = request.result;
          if (!result) {
            resolve(null);
            return;
          }
          if (result.expires < Date.now()) {
            resolve(null);
            return;
          }
          resolve({ userId: result.userId, email: result.email });
        };
        request.onerror = () => {
          logger.warn("Failed to get reset token (non-critical):", request.error);
          resolve(null);
        };
      } catch (error) {
        logger.warn("Failed to get reset token (non-critical):", error);
        resolve(null);
      }
    });
  }
  async deleteResetToken(token) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("resetTokens")) {
      return;
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["resetTokens"], "readwrite");
        const store = transaction.objectStore("resetTokens");
        const request = store.delete(token);
        request.onsuccess = () => resolve();
        request.onerror = () => {
          logger.warn("Failed to delete reset token (non-critical):", request.error);
          resolve();
        };
      } catch (error) {
        logger.warn("Failed to delete reset token (non-critical):", error);
        resolve();
      }
    });
  }
  // Cleanup expired tokens
  async cleanupExpiredTokens() {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("resetTokens")) {
      return;
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["resetTokens"], "readwrite");
        const store = transaction.objectStore("resetTokens");
        if (!store.indexNames.contains("expires")) {
          resolve();
          return;
        }
        const index = store.index("expires");
        const request = index.openCursor();
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.value.expires < Date.now()) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => {
          logger.warn("Failed to cleanup expired tokens (non-critical):", request.error);
          resolve();
        };
      } catch (error) {
        logger.warn("Failed to cleanup expired tokens (non-critical):", error);
        resolve();
      }
    });
  }
  // Feeling logs operations - for behavioral tracking and AI context
  async saveFeelingLog(feelingLog) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("feelingLogs")) {
      logger.warn("feelingLogs object store does not exist");
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["feelingLogs"], "readwrite");
        const store = transaction.objectStore("feelingLogs");
        const normalizedLog = {
          id: feelingLog.id,
          timestamp: feelingLog.timestamp,
          // New schema fields
          emotion: feelingLog.emotion || feelingLog.emotionalState || "",
          subEmotion: feelingLog.subEmotion !== void 0 ? feelingLog.subEmotion : feelingLog.selectedFeeling || null,
          jsonIn: feelingLog.jsonIn || "",
          jsonOut: feelingLog.jsonOut || "",
          focusLens: feelingLog.focusLens || "",
          reflection: feelingLog.reflection || "",
          selfAdvocacy: feelingLog.selfAdvocacy || "",
          frequency: feelingLog.frequency || "daily",
          jsonAssessment: feelingLog.jsonAssessment || "",
          userId: feelingLog.userId || "anonymous",
          // Ensure userId is saved
          // Legacy fields for backward compatibility
          emotionalState: feelingLog.emotionalState || feelingLog.emotion || "",
          selectedFeeling: feelingLog.selectedFeeling !== void 0 ? feelingLog.selectedFeeling : feelingLog.subEmotion || null,
          aiResponse: feelingLog.aiResponse || feelingLog.jsonOut || "",
          isAIResponse: feelingLog.isAIResponse !== void 0 ? feelingLog.isAIResponse : true,
          lowStateCount: feelingLog.lowStateCount || 0
        };
        const request = store.put(normalizedLog);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        logger.error("Error saving feeling log:", error);
        resolve();
      }
    });
  }
  async saveRuleBasedUsage(log) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("ruleBasedUsageLogs")) {
      logger.warn("ruleBasedUsageLogs object store does not exist - skipping save (non-critical)");
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["ruleBasedUsageLogs"], "readwrite");
        const store = transaction.objectStore("ruleBasedUsageLogs");
        const request = store.add(log);
        request.onsuccess = () => resolve();
        request.onerror = () => {
          logger.error("Failed to save rule-based usage log:", request.error);
          resolve();
        };
      } catch (error) {
        logger.error("Error saving rule-based usage log:", error);
        resolve();
      }
    });
  }
  async getRuleBasedUsageLogs(limit, days) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("ruleBasedUsageLogs")) {
      return Promise.resolve([]);
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["ruleBasedUsageLogs"], "readonly");
        const store = transaction.objectStore("ruleBasedUsageLogs");
        const index = store.index("timestamp");
        let range = null;
        if (days) {
          const cutoffDate = /* @__PURE__ */ new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          range = IDBKeyRange.lowerBound(cutoffDate.toISOString());
        }
        const request = range ? index.getAll(range) : index.getAll();
        request.onsuccess = () => {
          let results = request.result || [];
          if (limit) {
            results = results.slice(0, limit);
          }
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        logger.error("Error getting rule-based usage logs:", error);
        resolve([]);
      }
    });
  }
  async getFeelingLogs(limit, userId) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["feelingLogs"], "readonly");
      const store = transaction.objectStore("feelingLogs");
      const index = store.index("timestamp");
      const request = index.openCursor(null, "prev");
      const logs = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && (!limit || logs.length < limit)) {
          if (!userId || cursor.value.userId === userId) {
            logs.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(logs);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  async getFeelingLogsByState(emotionalState, limit) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["feelingLogs"], "readonly");
      const store = transaction.objectStore("feelingLogs");
      const index = store.index("emotionalState");
      const request = index.openCursor(IDBKeyRange.only(emotionalState));
      const logs = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && (!limit || logs.length < limit)) {
          logs.push(cursor.value);
          cursor.continue();
        } else {
          resolve(logs);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  // User interactions operations - for tracking user behavior
  async saveUserInteraction(interaction) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["userInteractions"], "readwrite");
      const store = transaction.objectStore("userInteractions");
      const request = store.add(interaction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  async getUserInteractions(sessionId, limit) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["userInteractions"], "readonly");
      const store = transaction.objectStore("userInteractions");
      const index = sessionId ? store.index("sessionId") : store.index("timestamp");
      const request = sessionId ? index.openCursor(IDBKeyRange.only(sessionId)) : index.openCursor(null, "prev");
      const interactions = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && (!limit || interactions.length < limit)) {
          interactions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(interactions);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  // Sessions operations - for tracking check-in sessions
  async saveSession(session) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["sessions"], "readwrite");
      const store = transaction.objectStore("sessions");
      const request = store.add(session);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  async updateSession(sessionId, updates) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["sessions"], "readwrite");
      const store = transaction.objectStore("sessions");
      const request = store.get(sessionId);
      request.onsuccess = () => {
        const session = request.result;
        if (session) {
          Object.assign(session, updates);
          const updateRequest = store.put(session);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error("Session not found"));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  async getSessions(userId, limit) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["sessions"], "readonly");
      const store = transaction.objectStore("sessions");
      const index = store.index("userId");
      const request = index.openCursor(IDBKeyRange.only(userId), "prev");
      const sessions = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && (!limit || sessions.length < limit)) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  async getSessionsByValue(valueId, limit) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["sessions"], "readonly");
      const store = transaction.objectStore("sessions");
      const index = store.index("valueId");
      const request = index.openCursor(IDBKeyRange.only(valueId), "prev");
      const sessions = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && (!limit || sessions.length < limit)) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  // Analytics helper methods for charts/graphs
  async getFeelingPatterns(startDate, endDate) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["feelingLogs"], "readonly");
      const store = transaction.objectStore("feelingLogs");
      const index = store.index("timestamp");
      const request = index.openCursor(IDBKeyRange.bound(startDate, endDate));
      const patterns = {};
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const state = cursor.value.emotionalState;
          patterns[state] = (patterns[state] || 0) + 1;
          cursor.continue();
        } else {
          resolve(Object.entries(patterns).map(([state, count]) => ({ state, count })));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  async getProgressMetrics(startDate, endDate) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["sessions"], "readonly");
      const store = transaction.objectStore("sessions");
      const index = store.index("startTimestamp");
      const request = index.openCursor(IDBKeyRange.bound(startDate, endDate));
      const sessions = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          const totalSessions = sessions.length;
          const completedSessions = sessions.filter((s) => s.duration !== void 0);
          const averageDuration = completedSessions.length > 0 ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length : 0;
          const valuesEngaged = [...new Set(sessions.map((s) => s.valueId))];
          resolve({ totalSessions, averageDuration, valuesEngaged });
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  async getFeelingFrequency(limit) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["feelingLogs"], "readonly");
      const store = transaction.objectStore("feelingLogs");
      const request = store.openCursor(null, "prev");
      const frequency = {};
      let count = 0;
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && (!limit || count < limit)) {
          const feeling = cursor.value.selectedFeeling;
          if (feeling) {
            frequency[feeling] = (frequency[feeling] || 0) + 1;
          }
          count++;
          cursor.continue();
        } else {
          resolve(Object.entries(frequency).map(([feeling, count2]) => ({ feeling, count: count2 })).sort((a, b) => b.count - a.count));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  /**
   * Export all data for debugging/inspection
   */
  // Assessment Operations
  async saveAssessment(assessment) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["assessments"], "readwrite");
      const store = transaction.objectStore("assessments");
      const request = store.add(assessment);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  async getAssessments(userId, limit) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["assessments"], "readonly");
      const store = transaction.objectStore("assessments");
      const index = store.index("userId");
      const request = index.openCursor(IDBKeyRange.only(userId), "prev");
      const assessments = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && (!limit || assessments.length < limit)) {
          assessments.push(cursor.value);
          cursor.continue();
        } else {
          resolve(assessments);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  // Report Operations
  async saveReport(report) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["reports"], "readwrite");
      const store = transaction.objectStore("reports");
      const request = store.add(report);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  async getReports(userId, limit) {
    const db2 = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction(["reports"], "readonly");
      const store = transaction.objectStore("reports");
      const index = store.index("userId");
      const request = index.openCursor(IDBKeyRange.only(userId), "prev");
      const reports = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && (!limit || reports.length < limit)) {
          reports.push(cursor.value);
          cursor.continue();
        } else {
          resolve(reports);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  async exportAllData() {
    const db2 = await this.ensureDB();
    const exportData = {};
    const objectStoreNames = Array.from(db2.objectStoreNames);
    for (const storeName of objectStoreNames) {
      try {
        exportData[storeName] = await new Promise((resolve, reject) => {
          const transaction = db2.transaction([storeName], "readonly");
          const store = transaction.objectStore(storeName);
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        logger.warn(`Failed to export store ${storeName}:`, error);
        exportData[storeName] = { error: String(error) };
      }
    }
    return exportData;
  }
  // Values operations - track value selections over time
  async saveValue(userId, valueId, active = true, priority) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("values")) {
      logger.warn("Values object store does not exist");
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["values"], "readwrite");
        const store = transaction.objectStore("values");
        const index = store.index("userId");
        const range = IDBKeyRange.only(userId);
        const getAllRequest = index.getAll(range);
        getAllRequest.onsuccess = () => {
          const allUserValues = getAllRequest.result;
          const existing = allUserValues.find((v) => v.valueId === valueId);
          if (existing) {
            existing.active = active;
            if (priority !== void 0) existing.priority = priority;
            existing.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
            const updateRequest = store.put(existing);
            updateRequest.onsuccess = () => resolve();
            updateRequest.onerror = () => reject(updateRequest.error);
          } else {
            const valueEntry = {
              userId,
              valueId,
              active,
              priority: priority ?? allUserValues.filter((v) => v.active).length,
              createdAt: (/* @__PURE__ */ new Date()).toISOString(),
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            const addRequest = store.add(valueEntry);
            addRequest.onsuccess = () => resolve();
            addRequest.onerror = () => reject(addRequest.error);
          }
        };
        getAllRequest.onerror = () => reject(getAllRequest.error);
      } catch (error) {
        logger.error("Error saving value:", error);
        reject(error);
      }
    });
  }
  async getActiveValues(userId) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("values")) {
      return [];
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["values"], "readonly");
        const store = transaction.objectStore("values");
        const index = store.index("userId_active");
        const range = IDBKeyRange.bound([userId, true], [userId, true]);
        const request = index.getAll(range);
        request.onsuccess = () => {
          const values = request.result.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)).map((v) => v.valueId);
          resolve(values);
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        logger.error("Error getting active values:", error);
        resolve([]);
      }
    });
  }
  async setValuesActive(userId, valueIds) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("values")) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["values"], "readwrite");
        const store = transaction.objectStore("values");
        const index = store.index("userId");
        const range = IDBKeyRange.only(userId);
        const request = index.getAll(range);
        request.onsuccess = () => {
          const allUserValues = request.result;
          let completed = 0;
          let errors = 0;
          if (allUserValues.length === 0 && valueIds.length === 0) {
            resolve();
            return;
          }
          allUserValues.forEach((value) => {
            const shouldBeActive = valueIds.includes(value.valueId);
            if (value.active !== shouldBeActive) {
              value.active = shouldBeActive;
              value.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
              const updateRequest = store.put(value);
              updateRequest.onsuccess = () => {
                completed++;
                if (completed + errors === allUserValues.length) {
                  const existingValueIds = allUserValues.map((v) => v.valueId);
                  const newValueIds = valueIds.filter((id) => !existingValueIds.includes(id));
                  if (newValueIds.length === 0) {
                    resolve();
                    return;
                  }
                  let newCompleted = 0;
                  newValueIds.forEach((valueId, index2) => {
                    const newValue = {
                      userId,
                      valueId,
                      active: true,
                      priority: index2,
                      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
                      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
                    };
                    const addRequest = store.add(newValue);
                    addRequest.onsuccess = () => {
                      newCompleted++;
                      if (newCompleted === newValueIds.length) resolve();
                    };
                    addRequest.onerror = () => {
                      errors++;
                      if (newCompleted + errors === newValueIds.length) resolve();
                    };
                  });
                }
              };
              updateRequest.onerror = () => {
                errors++;
                if (completed + errors === allUserValues.length) resolve();
              };
            } else {
              completed++;
              if (completed + errors === allUserValues.length) resolve();
            }
          });
          if (allUserValues.length === 0) {
            valueIds.forEach((valueId, index2) => {
              const newValue = {
                userId,
                valueId,
                active: true,
                priority: index2,
                createdAt: (/* @__PURE__ */ new Date()).toISOString(),
                updatedAt: (/* @__PURE__ */ new Date()).toISOString()
              };
              const addRequest = store.add(newValue);
              addRequest.onsuccess = () => {
                completed++;
                if (completed === valueIds.length) resolve();
              };
              addRequest.onerror = () => {
                errors++;
                if (completed + errors === valueIds.length) resolve();
              };
            });
          }
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        logger.error("Error setting values active:", error);
        resolve();
      }
    });
  }
  // Goals operations - save goals to separate table
  async saveGoal(goal) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("goals")) {
      logger.warn("Goals object store does not exist");
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["goals"], "readwrite");
        const store = transaction.objectStore("goals");
        const request = store.put(goal);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        logger.error("Error saving goal:", error);
        resolve();
      }
    });
  }
  async getGoals(userId) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("goals")) {
      return [];
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["goals"], "readonly");
        const store = transaction.objectStore("goals");
        const index = store.index("userId");
        const range = IDBKeyRange.only(userId);
        const request = index.getAll(range);
        request.onsuccess = () => {
          const goals = request.result.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          resolve(goals);
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        logger.error("Error getting goals:", error);
        resolve([]);
      }
    });
  }
  async deleteGoal(goalId) {
    const db2 = await this.ensureDB();
    if (!db2.objectStoreNames.contains("goals")) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      try {
        const transaction = db2.transaction(["goals"], "readwrite");
        const store = transaction.objectStore("goals");
        const request = store.delete(goalId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        logger.error("Error deleting goal:", error);
        resolve();
      }
    });
  }
  /**
   * Uninstall app data - completely wipes all local storage
   * Wipes IndexedDB, localStorage, sessionStorage, and cache
   * Use with caution - this is irreversible!
   */
  async uninstallAppData() {
    logger.info("[Uninstall] Starting complete data wipe...");
    try {
      if (this.db) {
        this.db.close();
        this.db = null;
      }
      const databasesToDelete = [
        this.dbName,
        this.oldDbName,
        "groundedDB",
        // Dexie database name
        "com.acminds.grounded.therapy.db"
        // Legacy database
      ];
      for (const dbName of databasesToDelete) {
        try {
          await new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(dbName);
            deleteRequest.onsuccess = () => {
              logger.info(`[Uninstall] Deleted IndexedDB: ${dbName}`);
              resolve();
            };
            deleteRequest.onerror = () => {
              logger.warn(`[Uninstall] Failed to delete IndexedDB: ${dbName}`, deleteRequest.error);
              resolve();
            };
            deleteRequest.onblocked = () => {
              logger.warn(`[Uninstall] IndexedDB deletion blocked: ${dbName}`);
              setTimeout(() => resolve(), 1e3);
            };
          });
        } catch (error) {
          logger.warn(`[Uninstall] Error deleting IndexedDB ${dbName}:`, error);
        }
      }
      const localStorageKeys = Object.keys(localStorage);
      for (const key of localStorageKeys) {
        if (key.startsWith("workbox-") || key.startsWith("sw-")) {
          continue;
        }
        try {
          localStorage.removeItem(key);
        } catch (error) {
          logger.warn(`[Uninstall] Failed to remove localStorage key ${key}:`, error);
        }
      }
      logger.info("[Uninstall] Cleared localStorage");
      try {
        sessionStorage.clear();
        logger.info("[Uninstall] Cleared sessionStorage");
      } catch (error) {
        logger.warn("[Uninstall] Failed to clear sessionStorage:", error);
      }
      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => {
              logger.info(`[Uninstall] Deleting cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
          logger.info("[Uninstall] Cleared cache storage");
        } catch (error) {
          logger.warn("[Uninstall] Failed to clear cache storage:", error);
        }
      }
      if ("serviceWorker" in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map((registration) => {
              logger.info(`[Uninstall] Unregistering service worker: ${registration.scope}`);
              return registration.unregister();
            })
          );
          logger.info("[Uninstall] Unregistered service workers");
        } catch (error) {
          logger.warn("[Uninstall] Failed to unregister service workers:", error);
        }
      }
      if ("storage" in navigator && "getDirectory" in navigator.storage) {
        try {
          const root2 = await navigator.storage.getDirectory();
          for await (const [name, handle] of root2.entries()) {
            if (handle.kind === "file") {
              await root2.removeEntry(name, { recursive: true });
            }
          }
          logger.info("[Uninstall] Cleared OPFS");
        } catch (error) {
          logger.warn("[Uninstall] Failed to clear OPFS:", error);
        }
      }
      this.metadataValidated = false;
      this.oldDatabaseCheckCache = null;
      this.metadataCache = null;
      logger.info("[Uninstall] Complete data wipe finished successfully");
    } catch (error) {
      logger.error("[Uninstall] Error during data wipe:", error);
      throw new Error(`Failed to uninstall app data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
const dbService = new DatabaseService();
const DatabaseViewer = ({ onClose }) => {
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    dbService.exportAllData().then(setData).catch((err) => setError(String(err))).finally(() => setLoading(false));
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-primary w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border-soft dark:border-dark-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-border-soft dark:border-dark-border flex justify-between items-center bg-white dark:bg-dark-bg-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-black text-text-primary dark:text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "🗄️" }),
          " Database Inspector"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-text-secondary mt-1", children: "Raw contents of groundedDB (Unencrypted)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          className: "p-2 hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary rounded-full transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6 text-text-tertiary hover:text-text-primary dark:text-text-tertiary dark:hover:text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-auto p-6 bg-bg-secondary/50 dark:bg-black/20 font-mono text-xs", children: [
      loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-navy-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary", children: "Loading database content..." })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400", children: [
        "Error: ",
        error
      ] }),
      data && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: Object.keys(data).map((storeName) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold text-navy-primary dark:text-brand-light uppercase tracking-wider sticky top-0 bg-bg-secondary dark:bg-dark-bg-secondary p-2 rounded-lg border border-border-soft dark:border-dark-border/50", children: [
          storeName,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-50", children: [
            "(",
            data[storeName].length,
            " items)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pl-2 border-l-2 border-border-soft dark:border-dark-border ml-2", children: data[storeName].length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "whitespace-pre-wrap break-all text-text-primary dark:text-white/80 overflow-x-auto", children: JSON.stringify(data[storeName], null, 2) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-tertiary italic p-2", children: "Empty store" }) })
      ] }, storeName)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border-soft dark:border-dark-border flex justify-between items-center bg-white dark:bg-dark-bg-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-500 font-bold uppercase tracking-widest flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
        "Confidential Data"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `grounded-db-dump-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
            a.click();
          },
          className: "px-4 py-2 bg-navy-primary text-white rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 shadow-lg flex items-center gap-2",
          disabled: !data,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" }) }),
            "Download JSON"
          ]
        }
      )
    ] })
  ] }) });
};
const HelpOverlay = ({ onClose }) => {
  const { handleLogout } = useAuthContext();
  const [showDebugLog, setShowDebugLog] = reactExports.useState(false);
  const [showDatabaseViewer, setShowDatabaseViewer] = reactExports.useState(false);
  const [showSystemDanger, setShowSystemDanger] = reactExports.useState(false);
  const [termsAcceptedDate, setTermsAcceptedDate] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const loadUserData = async () => {
      const user = await getCurrentUser();
      if (user?.termsAcceptedDate) {
        setTermsAcceptedDate(user.termsAcceptedDate);
      }
    };
    loadUserData();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-dark/60 backdrop-blur-sm animate-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "bg-white dark:bg-dark-bg-primary w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-pop relative border border-border-soft dark:border-dark-border",
        onClick: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: onClose,
              className: "absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" }) })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 space-y-8 max-h-[90vh] overflow-y-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-text-primary dark:text-white tracking-tight", children: "How to navigate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary dark:text-text-secondary font-medium", children: "Mastering Grounded in 3 steps." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-navy-primary dark:bg-navy-primary flex items-center justify-center text-white font-black shrink-0 shadow-lg", children: "1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-black text-text-primary dark:text-white text-lg", children: "Define & Rank" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-text-secondary dark:text-text-secondary text-sm leading-relaxed", children: [
                    "Pick up to 10 values in the ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Values" }),
                    ' tab. Rank them by dragging. Your top value becomes your "North Star" for the Dashboard guidance.'
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-brand dark:bg-brand-light flex items-center justify-center text-white dark:text-navy-dark font-black shrink-0 shadow-lg", children: "2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-black text-text-primary dark:text-white text-lg", children: "Embody Daily" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-text-secondary dark:text-text-secondary text-sm leading-relaxed", children: [
                    "In the ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Dashboard" }),
                    ', open a value to reflect on your progress. Log a win or set a "Next Aim" (micro-goal) to build momentum.'
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-calm-sage dark:bg-calm-sage flex items-center justify-center text-white dark:text-navy-primary font-black shrink-0 shadow-lg", children: "3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-black text-text-primary dark:text-white text-lg", children: "Synthesize" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-text-secondary dark:text-text-secondary text-sm leading-relaxed", children: [
                    "Use ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Reports" }),
                    " to generate clinical-style summaries (SOAP/DAP) of your journey to share with a therapist or for personal growth audits."
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border-soft dark:border-dark-border space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-text-primary dark:text-white", children: "Tips & Best Practices" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl flex items-start gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl mt-1", children: "💡" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black text-text-primary dark:text-white uppercase tracking-widest", children: "Pro Tip" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-secondary dark:text-text-secondary leading-relaxed font-medium", children: [
                      "Head to ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Settings" }),
                      ' to enable "Growth and Progress" nudges—system notifications that keep your North Star top-of-mind.'
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl flex items-start gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl mt-1", children: "📱" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black text-text-primary dark:text-white uppercase tracking-widest", children: "Daily Practice" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-text-secondary leading-relaxed font-medium", children: "Check your Dashboard daily to log wins and set micro-goals. Small consistent actions build lasting change." })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl flex items-start gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl mt-1", children: "📊" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black text-text-primary dark:text-white uppercase tracking-widest", children: "Therapy Integration" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-secondary dark:text-text-secondary leading-relaxed font-medium", children: [
                      "Use the ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Reports" }),
                      " feature to generate summaries you can share with your therapist during sessions."
                    ] })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border-soft dark:border-dark-border space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-text-primary dark:text-white", children: "AI Model Information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2", children: "On-Device AI Processing" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs text-text-secondary dark:text-text-secondary leading-relaxed", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Privacy First:" }),
                    " All AI processing happens entirely on your device. No data is sent to external servers."
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Fast Loading:" }),
                    " AI models begin downloading immediately when the app starts, so they're ready when you need them."
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Offline Capable:" }),
                    " Once downloaded, models are cached locally for instant loading and offline use."
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Progress Tracking:" }),
                    " Watch the progress bar during first launch to see model download status."
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Fallback Mode:" }),
                    " If models fail to load, the app continues with rule-based responses. Core functionality remains available."
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border-soft dark:border-dark-border space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-text-primary dark:text-white", children: "Support & Troubleshooting" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-brand/10 dark:bg-brand/20 p-6 rounded-3xl border-2 border-brand/30 space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: "🔧" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-black text-text-primary dark:text-white mb-1", children: "Experiencing Issues?" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-text-secondary leading-relaxed mb-3", children: "Generate a debug log with diagnostic information. Debug logging starts automatically when the app launches." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => setShowDebugLog(true),
                      className: "w-full px-4 py-3 bg-navy-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 flex items-center justify-center gap-2 shadow-lg",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }),
                        "Generate Debug Log"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => setShowDatabaseViewer(true),
                      className: "w-full px-4 py-2 bg-transparent text-navy-primary dark:text-white border-2 border-navy-primary/10 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-navy-primary/5 dark:hover:bg-white/5 flex items-center justify-center gap-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" }) }),
                        "View Database"
                      ]
                    }
                  )
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary dark:text-text-secondary leading-relaxed", children: "Need help or have questions? We're here to assist you." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-navy-primary dark:text-brand-light flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: "mailto:ac.minds.ai@gmail.com?subject=Grounded App Support",
                      className: "text-sm font-bold text-navy-primary dark:text-brand-light hover:underline",
                      children: "ac.minds.ai@gmail.com"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border-soft dark:border-dark-border space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-text-primary dark:text-white", children: "Account Information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl space-y-3", children: termsAcceptedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black text-text-primary dark:text-white uppercase tracking-widest", children: "Terms & Conditions" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-secondary dark:text-text-secondary leading-relaxed", children: [
                  "Accepted on: ",
                  new Date(termsAcceptedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border-soft dark:border-dark-border space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-text-primary dark:text-white", children: "License" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-3xl space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black text-text-primary dark:text-white uppercase tracking-widest", children: "Apache License 2.0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs text-text-secondary dark:text-text-secondary leading-relaxed", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    "Copyright ",
                    (/* @__PURE__ */ new Date()).getFullYear(),
                    " AC MiNDS"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at:' }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: "http://www.apache.org/licenses/LICENSE-2.0",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "text-navy-primary dark:text-brand-light hover:underline break-all",
                      children: "http://www.apache.org/licenses/LICENSE-2.0"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.' })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t-2 border-red-200 dark:border-red-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setShowSystemDanger(!showSystemDanger),
                  className: "w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "⚠️" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-black text-red-600 dark:text-red-400", children: "System Danger Zone" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600/80 dark:text-red-400/80", children: "Irreversible data deletion" })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "svg",
                      {
                        className: `w-5 h-5 text-red-600 dark:text-red-400 transition-transform ${showSystemDanger ? "rotate-180" : ""}`,
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
                      }
                    )
                  ]
                }
              ),
              showSystemDanger && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-black text-red-600 dark:text-red-400", children: "Hard Clear All Data" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600/80 dark:text-red-400/80 leading-relaxed", children: "Permanently delete ALL data from the database. This includes all logs, goals, settings, values, and user interactions. This action CANNOT be undone." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: async () => {
                      if (window.confirm("⚠️ WARNING: This will permanently delete ALL data from the database. This includes logs, goals, settings, and values. This action CANNOT be undone. Are you absolutely sure?")) {
                        if (window.confirm("This is your final warning. All data will be permanently deleted. Are you absolutely certain?")) {
                          try {
                            const { getDatabaseAdapter: getDatabaseAdapter2 } = await __vitePreload(async () => {
                              const { getDatabaseAdapter: getDatabaseAdapter3 } = await Promise.resolve().then(() => databaseAdapter);
                              return { getDatabaseAdapter: getDatabaseAdapter3 };
                            }, true ? void 0 : void 0);
                            const adapter = getDatabaseAdapter2();
                            await adapter.init();
                            const userId = sessionStorage.getItem("userId") || localStorage.getItem("userId");
                            if (userId) {
                              await adapter.clearAllData(userId);
                              logoutUser();
                              handleLogout();
                              sessionStorage.clear();
                              localStorage.clear();
                              const vercelUrl = "https://grounded-nu.vercel.app";
                              if (window.location.origin !== vercelUrl) {
                                window.location.href = vercelUrl;
                              } else {
                                window.location.reload();
                              }
                            } else {
                              alert("Error: No user ID found. Please log in and try again.");
                            }
                          } catch (error) {
                            console.error("Error clearing data:", error);
                            alert("Error clearing data. Please check the console for details.");
                          }
                        }
                      }
                    },
                    className: "w-full px-4 py-3 bg-red-600 dark:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 flex items-center justify-center gap-2 shadow-lg",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }),
                      "Hard Clear All Data"
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: onClose,
                className: "w-full py-5 bg-navy-primary dark:bg-navy-primary text-white dark:text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-[0.98]",
                children: "Got it, Let's grow"
              }
            ) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -z-10", onClick: onClose }),
    showDebugLog && /* @__PURE__ */ jsxRuntimeExports.jsx(DebugLogComponent, { onClose: () => setShowDebugLog(false) }),
    showDatabaseViewer && /* @__PURE__ */ jsxRuntimeExports.jsx(DatabaseViewer, { onClose: () => setShowDatabaseViewer(false) })
  ] });
};
const US_RESOURCES = {
  primary: {
    name: "988",
    displayName: "988 Suicide & Crisis Lifeline",
    callAction: "tel:988",
    textAction: "sms:988",
    buttonLabel: "Call or Text 988",
    subtext: "Confidential support for people in distress. Available 24/7.",
    url: "https://988lifeline.org/"
  },
  secondary: {
    name: "CrisisTextLine",
    displayName: "Crisis Text Line",
    textAction: "sms:741741",
    textBody: "HOME",
    buttonLabel: "Text HOME to 741741",
    subtext: "Free, 24/7 crisis support via text message.",
    url: "https://www.crisistextline.org/"
  },
  lgbtq: {
    name: "TrevorProject",
    displayName: "The Trevor Project",
    textAction: "sms:678678",
    textBody: "START",
    buttonLabel: "Text START to 678-678",
    subtext: "LGBTQ+ specific crisis support. Available 24/7.",
    url: "https://www.thetrevorproject.org/"
  },
  domesticViolence: {
    name: "NDVH",
    displayName: "National Domestic Violence Hotline",
    callAction: "tel:18007997233",
    textAction: "sms:88788",
    textBody: "START",
    buttonLabel: "Call 1-800-799-SAFE (7233)",
    subtext: "24/7 support for domestic violence.",
    url: "https://www.thehotline.org/"
  }
};
const UK_RESOURCES = {
  primary: {
    name: "Samaritans",
    displayName: "Samaritans UK",
    callAction: "tel:116123",
    buttonLabel: "Call 116 123",
    subtext: "Available 24 hours a day, 365 days a year.",
    url: "https://www.samaritans.org/"
  },
  secondary: {
    name: "Shout",
    displayName: "Shout",
    textAction: "sms:85258",
    textBody: "SHOUT",
    buttonLabel: "Text SHOUT to 85258",
    subtext: "Free, confidential, 24/7 text support.",
    url: "https://giveusashout.org/"
  },
  domesticViolence: {
    name: "Refuge",
    displayName: "Refuge National Domestic Abuse Helpline",
    callAction: "tel:08082000247",
    buttonLabel: "Call 0808 2000 247",
    subtext: "24/7 support for domestic abuse.",
    url: "https://www.nationaldahelpline.org.uk/"
  }
};
const CA_RESOURCES = {
  primary: {
    name: "988",
    displayName: "Suicide Crisis Helpline",
    callAction: "tel:988",
    textAction: "sms:988",
    buttonLabel: "Call or Text 988",
    subtext: "Available 24/7 for suicide prevention and crisis support.",
    url: "https://www.crisisservicescanada.ca/"
  },
  secondary: {
    name: "KidsHelpPhone",
    displayName: "Kids Help Phone (Youth)",
    textAction: "sms:686868",
    textBody: "CONNECT",
    buttonLabel: "Text CONNECT to 686868",
    subtext: "Free, confidential support for youth. Available 24/7.",
    url: "https://kidshelpphone.ca/"
  }
};
const AU_RESOURCES = {
  primary: {
    name: "Lifeline",
    displayName: "Lifeline",
    callAction: "tel:131114",
    buttonLabel: "Call 13 11 14",
    subtext: "Available 24/7 for crisis support and suicide prevention.",
    url: "https://www.lifeline.org.au/"
  },
  secondary: {
    name: "BeyondBlue",
    displayName: "Beyond Blue",
    callAction: "tel:1300224636",
    buttonLabel: "Call 1300 22 4636",
    subtext: "24/7 support for anxiety, depression, and suicide prevention.",
    url: "https://www.beyondblue.org.au/"
  }
};
const INTL_RESOURCES = {
  primary: {
    name: "Befrienders",
    displayName: "Befrienders Worldwide",
    buttonLabel: "Visit befrienders.org",
    subtext: "Global directory of crisis support centers.",
    url: "https://www.befrienders.org/"
  },
  secondary: {
    name: "IASP",
    displayName: "IASP Resources",
    buttonLabel: "Visit iasp.info",
    subtext: "International Association for Suicide Prevention resources.",
    url: "https://www.iasp.info/resources/Crisis_Centres"
  }
};
function getCrisisResources(region = "US") {
  switch (region) {
    case "US":
      return US_RESOURCES;
    case "UK":
      return UK_RESOURCES;
    case "CA":
      return CA_RESOURCES;
    case "AU":
      return AU_RESOURCES;
    case "INTL":
    default:
      return INTL_RESOURCES;
  }
}
function detectRegion() {
  if (typeof window === "undefined") {
    return "US";
  }
  const locale = navigator.language || navigator.languages?.[0] || "en-US";
  const country = locale.split("-")[1]?.toUpperCase();
  switch (country) {
    case "US":
      return "US";
    case "GB":
      return "UK";
    case "CA":
      return "CA";
    case "AU":
      return "AU";
    default:
      return "INTL";
  }
}
function buildSMSUri(number, body) {
  const separator = /iPhone|iPad|iPod/.test(navigator.userAgent) ? "&" : "?";
  const bodyParam = body ? `${separator}body=${encodeURIComponent(body)}` : "";
  return `sms:${number}${bodyParam}`;
}
const CrisisResourcesModal = ({ onClose, lcswConfig, region: overrideRegion }) => {
  const [detectedRegion, setDetectedRegion] = reactExports.useState("US");
  const [resources, setResources] = reactExports.useState(getCrisisResources("US"));
  reactExports.useEffect(() => {
    const region = overrideRegion || detectRegion();
    setDetectedRegion(region);
    setResources(getCrisisResources(region));
  }, [overrideRegion]);
  const handleCall = (action) => {
    if (action && action.startsWith("tel:")) {
      window.location.href = action;
    }
  };
  const handleText = (action, body) => {
    if (action && action.startsWith("sms:")) {
      const number = action.replace("sms:", "").split(/[?&]/)[0];
      const smsUri = buildSMSUri(number, body);
      window.location.href = smsUri;
    }
  };
  const renderResourceButton = (resource) => {
    if (!resource) return null;
    if (resource.callAction) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: resource.callAction,
          onClick: (e) => {
            e.preventDefault();
            handleCall(resource.callAction);
          },
          className: "flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded-lg transition-all active:scale-95",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📞" }),
            resource.buttonLabel
          ]
        }
      );
    }
    if (resource.textAction) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "#",
          onClick: (e) => {
            e.preventDefault();
            handleText(resource.textAction, resource.textBody);
          },
          className: "flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-lg transition-all active:scale-95",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💬" }),
            resource.buttonLabel
          ]
        }
      );
    }
    if (resource.url) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: resource.url,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-navy-primary hover:bg-navy-dark text-white font-bold text-base rounded-lg transition-all active:scale-95",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🌐" }),
            resource.buttonLabel
          ]
        }
      );
    }
    return null;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-dark/60 backdrop-blur-sm animate-fade-in",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white dark:bg-dark-bg-primary w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-pop relative border border-border-soft dark:border-dark-border",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: onClose,
                className: "absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors z-10",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" }) })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 sm:p-10 space-y-6 max-h-[90vh] overflow-y-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl mb-2", children: "📞" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight", children: "Crisis Resources" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base text-text-primary/60 dark:text-white/60", children: "You're not alone. Help is available 24/7." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 sm:p-5 rounded-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-red-800 dark:text-red-300 mb-2", children: "🚨 Emergency Services" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm text-red-700 dark:text-red-200", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "911" }),
                      " - For immediate emergencies"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 dark:text-red-300", children: "Call 911 if you or someone else is in immediate danger." })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-yellow-warm/10 dark:bg-yellow-warm/20 border-l-4 border-yellow-warm p-4 sm:p-5 rounded-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-text-primary dark:text-white mb-3", children: "📞 Immediate Help (24/7, Free, Confidential)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-base text-text-primary dark:text-white mb-2", children: resources.primary.displayName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                      renderResourceButton(resources.primary),
                      resources.primary.url && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "a",
                        {
                          href: resources.primary.url,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className: "flex items-center justify-center py-3 px-3 bg-white dark:bg-white/5 border border-border-soft dark:border-white/10 text-text-secondary dark:text-white/60 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors",
                          children: "🌐"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-white/70 mt-2", children: resources.primary.subtext })
                  ] }) })
                ] }),
                resources.secondary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-navy-primary/10 dark:bg-navy-primary/20 border-l-4 border-navy-primary p-4 sm:p-5 rounded-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-text-primary dark:text-white mb-3", children: "Alternative Support" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-base text-text-primary dark:text-white", children: resources.secondary.displayName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                      renderResourceButton(resources.secondary),
                      resources.secondary.url && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "a",
                        {
                          href: resources.secondary.url,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className: "flex items-center justify-center py-3 px-3 bg-white dark:bg-white/5 border border-border-soft dark:border-white/10 text-text-secondary dark:text-white/60 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors",
                          children: "🌐"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-white/70 mt-2", children: resources.secondary.subtext })
                  ] })
                ] }),
                resources.lgbtq && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4 sm:p-5 rounded-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-text-primary dark:text-white mb-3", children: "LGBTQ+ Support" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-base text-text-primary dark:text-white", children: resources.lgbtq.displayName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                      renderResourceButton(resources.lgbtq),
                      resources.lgbtq.url && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "a",
                        {
                          href: resources.lgbtq.url,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className: "flex items-center justify-center py-3 px-3 bg-white dark:bg-white/5 border border-border-soft dark:border-white/10 text-text-secondary dark:text-white/60 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors",
                          children: "🌐"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-white/70 mt-2", children: resources.lgbtq.subtext })
                  ] })
                ] }),
                resources.domesticViolence && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 sm:p-5 rounded-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-text-primary dark:text-white mb-3", children: "Domestic Violence Support" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-base text-text-primary dark:text-white", children: resources.domesticViolence.displayName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                      renderResourceButton(resources.domesticViolence),
                      resources.domesticViolence.url && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "a",
                        {
                          href: resources.domesticViolence.url,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className: "flex items-center justify-center py-3 px-3 bg-white dark:bg-white/5 border border-border-soft dark:border-white/10 text-text-secondary dark:text-white/60 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors",
                          children: "🌐"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-white/70 mt-2", children: resources.domesticViolence.subtext }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-white/70 mt-2 italic", children: "You can clear your browser history after visiting this page." })
                  ] })
                ] }),
                lcswConfig?.emergencyContact?.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-navy-primary/10 dark:bg-navy-primary/20 border-l-4 border-navy-primary p-4 sm:p-5 rounded-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-text-primary dark:text-white mb-2", children: "👤 Your Therapist" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm text-text-primary dark:text-white", children: [
                    lcswConfig.emergencyContact.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Phone:" }),
                      " ",
                      lcswConfig.emergencyContact.phone
                    ] }),
                    lcswConfig.emergencyContact.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Email:" }),
                      " ",
                      lcswConfig.emergencyContact.email
                    ] }),
                    lcswConfig.emergencyContact.name && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-secondary dark:text-text-secondary mt-1", children: [
                      "Contact: ",
                      lcswConfig.emergencyContact.name
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-bg-secondary dark:bg-dark-bg-secondary p-4 sm:p-5 rounded-xl border border-border-soft dark:border-dark-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-secondary dark:text-text-secondary leading-relaxed", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Remember:" }),
                  " These resources are available 24/7. If you're in crisis, don't wait - reach out immediately. Your safety and wellbeing are important."
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "w-full py-4 bg-navy-primary dark:bg-navy-primary text-white dark:text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-[0.98]",
                  children: "Got it"
                }
              ) })
            ] })
          ]
        }
      )
    }
  );
};
const getContactLink = (contact) => {
  if (contact.type === "phone") {
    return `tel:${contact.number}`;
  }
  if (contact.type === "text") {
    return `sms:${contact.number}`;
  }
  return "#";
};
const CrisisAlertModal = ({ data, onClose }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-secondary w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-2 border-red-500/20 animate-scale-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 p-6 text-center border-b border-red-100 dark:border-red-900/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl mb-2 block", children: "❤️‍🩹" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-black text-red-600 dark:text-red-400 uppercase tracking-wide", children: "Support is Available" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-primary dark:text-white/90 text-center font-medium leading-relaxed", children: data.message }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: data.resources.map((resource, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-bg-secondary dark:bg-dark-bg-primary rounded-xl p-4 border border-border-soft dark:border-dark-border",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-navy-primary dark:text-white mb-2", children: resource.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: getContactLink(resource.contact),
                  className: "flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-brand dark:bg-brand-light text-white dark:text-navy-primary rounded-lg font-bold text-sm hover:opacity-90 transition-opacity active:scale-95",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: resource.contact.type === "phone" ? "📞" : "💬" }),
                    resource.contact.displayText
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: resource.url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "flex items-center justify-center py-2 px-3 bg-white dark:bg-white/5 border border-border-soft dark:border-white/10 text-text-secondary dark:text-white/60 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors",
                  children: "🌐"
                }
              )
            ] })
          ]
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-bg-secondary dark:bg-dark-bg-primary border-t border-border-soft dark:border-dark-border text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onClose,
        className: "text-text-tertiary hover:text-text-primary dark:text-white/40 dark:hover:text-white text-sm font-bold uppercase tracking-widest transition-colors",
        children: "Close"
      }
    ) })
  ] }) });
};
const SkeletonLoader = ({
  className = "",
  width = "100%",
  height = "1rem"
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `animate-pulse bg-bg-tertiary dark:bg-dark-bg-tertiary rounded ${className}`,
      style: { width, height }
    }
  );
};
const ReflectionForm = ({
  value,
  emotionalState,
  selectedFeeling,
  showFeelingsList,
  reflectionText,
  goalText,
  goalFreq,
  reflectionAnalysis,
  analyzingReflection,
  coachInsight,
  valueMantra,
  loading,
  aiGoalLoading,
  lcswConfig,
  onEmotionalStateChange,
  onShowFeelingsListToggle,
  onSelectedFeelingChange,
  onReflectionTextChange,
  onGoalTextChange,
  onGoalFreqChange,
  onSuggestGoal,
  onCommit,
  getReflectionPlaceholder,
  onTriggerReflectionAnalysis
}) => {
  const [showAiInsights, setShowAiInsights] = reactExports.useState(false);
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [processingTime, setProcessingTime] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (reflectionAnalysis && !analyzingReflection) {
      setShowAiInsights(true);
    }
  }, [reflectionAnalysis, analyzingReflection]);
  const handleCommit = () => {
    if (loading || isProcessing) return;
    setIsProcessing(true);
    setProcessingTime(0);
    setInterval(() => {
      setProcessingTime((prev) => prev + 1);
    }, 1e3);
    onCommit();
  };
  reactExports.useEffect(() => {
    if (!loading && isProcessing) {
      setIsProcessing(false);
    } else if (loading && !isProcessing) {
      setIsProcessing(true);
    }
  }, [loading]);
  reactExports.useEffect(() => {
    let interval;
    if (isProcessing) {
      interval = setInterval(() => {
        setProcessingTime((prev) => prev + 1);
      }, 1e3);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 sm:mt-6 space-y-4 sm:space-y-6 animate-pop border-t border-border-soft dark:border-dark-border/30 pt-4 sm:pt-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-navy-primary dark:bg-navy-primary rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md border border-navy-primary/20 dark:border-dark-border/50 relative overflow-hidden group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm font-black text-brand/80 dark:text-brand-light/80 uppercase tracking-widest mb-1.5", children: "Focus Lens" }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonLoader, { width: "75%", height: "0.625rem", className: "bg-brand/10 dark:bg-brand/20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonLoader, { width: "50%", height: "0.625rem", className: "bg-brand/10 dark:bg-brand/20" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white dark:text-white font-medium italic text-xs sm:text-sm leading-relaxed relative z-10", children: coachInsight }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 right-3 sm:right-4 text-xs sm:text-sm font-black text-brand/60 dark:text-brand-light/60 uppercase opacity-60", children: valueMantra })
    ] }),
    selectedFeeling && (() => {
      const stateConfig = getEmotionalState(emotionalState);
      if (!stateConfig) return null;
      return (
        /* PREV: bg-yellow-warm/10 ... border-yellow-warm/30 ... text-yellow-warm */
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-brand/5 dark:bg-brand/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-brand/20 dark:border-brand/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-base sm:text-lg font-black text-text-primary dark:text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl sm:text-2xl", children: stateConfig.emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: selectedFeeling }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand dark:text-brand-light", children: "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary/70 dark:text-white/70", children: stateConfig.shortLabel })
        ] }) })
      );
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest", children: "1. Deep Reflection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs sm:text-sm font-bold text-brand dark:text-brand-light uppercase tracking-widest", children: "Systemic Focus" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: reflectionText,
            onChange: (e) => onReflectionTextChange(e.target.value),
            placeholder: getReflectionPlaceholder(goalFreq, selectedFeeling),
            className: "w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-secondary dark:bg-dark-bg-primary/50 border-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-brand-light/30 outline-none text-text-primary dark:text-white min-h-[140px] sm:min-h-[160px] resize-none text-sm sm:text-base leading-relaxed shadow-inner"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: async () => {
              if (reflectionText.trim()) {
                onTriggerReflectionAnalysis();
              }
            },
            disabled: analyzingReflection || !reflectionText.trim(),
            className: "w-full py-2 sm:py-2.5 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed",
            children: analyzingReflection ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
              ] }),
              "Processing..."
            ] }) : "💾 Save"
          }
        ),
        analyzingReflection && /* PREV: text-yellow-warm */
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs sm:text-sm text-brand dark:text-brand-light font-bold uppercase tracking-widest animate-pulse", children: "Analyzing reflection..." }),
        reflectionAnalysis && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/50 dark:bg-dark-bg-secondary/30 rounded-xl p-4 border border-brand/10 dark:border-brand-light/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: "🧠" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-navy-primary dark:text-brand-light text-sm uppercase tracking-wide", children: "AI Insights" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                StatusIndicator,
                {
                  status: analyzingReflection ? "processing" : reflectionAnalysis ? "complete" : "not-done",
                  size: "sm"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setShowAiInsights(!showAiInsights),
                  className: "text-xs font-bold text-brand dark:text-brand-light hover:underline uppercase tracking-wide",
                  children: showAiInsights ? "Hide Insights" : "Show Insights"
                }
              )
            ] })
          ] }),
          showAiInsights && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-fade-in text-sm sm:text-base text-text-primary dark:text-white leading-relaxed mt-3 pt-3 border-t border-brand/5 dark:border-brand-light/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: onTriggerReflectionAnalysis,
                disabled: analyzingReflection || !reflectionText.trim() || !emotionalState || emotionalState === "mixed" || !selectedFeeling,
                className: "text-xs sm:text-sm font-black text-brand dark:text-brand-light uppercase tracking-widest hover:underline disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5",
                title: "Refresh analysis",
                children: analyzingReflection ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin h-3 w-3", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                  ] }),
                  "Processing..."
                ] }) : "🔄 Refresh"
              }
            ) }),
            (() => {
              let analysisText;
              if (typeof reflectionAnalysis === "string") {
                analysisText = reflectionAnalysis;
              } else if (reflectionAnalysis && typeof reflectionAnalysis === "object") {
                const analysis = reflectionAnalysis;
                analysisText = `## Core Themes
${(analysis.coreThemes || []).map((t) => `- ${t}`).join("\n")}

## The 'LCSW Lens'
${analysis.lcswLens || ""}

## Reflective Inquiry
${(analysis.reflectiveInquiry || []).map((q) => `- ${q}`).join("\n")}

## Session Prep
${analysis.sessionPrep || ""}`;
              } else {
                analysisText = "";
              }
              return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap leading-relaxed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MarkdownRenderer, { children: analysisText }) });
            })()
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest", children: "2. Self-Advocacy Aim" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSuggestGoal, disabled: aiGoalLoading, className: "text-xs sm:text-sm font-black text-brand dark:text-brand-light uppercase tracking-widest hover:underline disabled:opacity-50 flex items-center gap-1.5", children: aiGoalLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin h-3 w-3", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
              ] }),
              "Suggesting..."
            ] }) : "✨ Suggest" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StatusIndicator,
              {
                status: aiGoalLoading ? "processing" : goalText ? "complete" : "not-done",
                size: "sm"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: ["daily", "weekly", "monthly"].map((f) => (
            /* PREV: bg-yellow-warm */
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onGoalFreqChange(f), className: `flex-1 py-1 rounded-lg text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${goalFreq === f ? "bg-brand dark:bg-brand-light text-white dark:text-navy-dark shadow-sm" : "bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/40 dark:text-white/40"}`, children: f }, f)
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: goalText,
              onChange: (e) => onGoalTextChange(e.target.value),
              placeholder: "Define one tool or boundary to implement next.",
              className: "w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-secondary dark:bg-dark-bg-primary/50 border-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-brand-light/30 outline-none text-text-primary dark:text-white min-h-[160px] sm:min-h-[180px] resize-y text-sm sm:text-base leading-relaxed shadow-inner",
              style: { minHeight: "160px" }
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleCommit,
        disabled: !reflectionText.trim() && !goalText.trim() || loading || isProcessing,
        className: `w-full py-3 sm:py-4 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-20 text-xs sm:text-sm ${isProcessing ? "cursor-not-allowed" : ""}`,
        children: isProcessing ? `Processing (${processingTime}s)...` : "Archive & Commit"
      }
    )
  ] });
};
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
function generateUUID$1() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function useDashboard({
  values = [],
  goals = [],
  logs = [],
  lcswConfig,
  onLog = () => {
  },
  onUpdateGoals = () => {
  }
}) {
  const [activeValueId, setActiveValueId] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [emotionalState, setEmotionalState] = reactExports.useState("mixed");
  const [selectedFeeling, setSelectedFeeling] = reactExports.useState(null);
  const [lowStateCount, setLowStateCount] = reactExports.useState(0);
  const [encouragementText, setEncouragementText] = reactExports.useState(null);
  const [encouragementLoading, setEncouragementLoading] = reactExports.useState(false);
  const [reflectionText, setReflectionText] = reactExports.useState("");
  const [goalText, setGoalText] = reactExports.useState("");
  const [goalFreq, setGoalFreq] = reactExports.useState("daily");
  const [reflectionAnalysis, setReflectionAnalysis] = reactExports.useState(
    null
  );
  const [rawReflectionAnalysis, setRawReflectionAnalysis] = reactExports.useState(null);
  const [coachInsight, setCoachInsight] = reactExports.useState(null);
  const [valueMantra, setValueMantra] = reactExports.useState(null);
  const [crisisAlert, setCrisisAlert] = reactExports.useState(null);
  useDebounce(reflectionText, 1e3);
  reactExports.useRef({});
  const saveEmotionInteraction = reactExports.useCallback(
    async (emotion, subEmotion, valueId) => {
      try {
        let userId = "anonymous";
        try {
          const user = await getCurrentUser();
          userId = user?.id || sessionStorage.getItem("userId") || "anonymous";
        } catch (err) {
          userId = sessionStorage.getItem("userId") || "anonymous";
        }
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        const logId = generateUUID$1();
        const jsonIn = JSON.stringify({ emotion, subEmotion, valueId, timestamp, userId });
        const encouragement = await generateEmotionalEncouragement(
          emotion,
          subEmotion
        );
        const feelingLog = {
          id: logId,
          timestamp,
          userId: userId !== "anonymous" ? userId : void 0,
          // Add userId to feelingLog
          emotion,
          subEmotion,
          jsonIn,
          jsonOut: JSON.stringify(encouragement),
          focusLens: "",
          reflection: "",
          selfAdvocacy: "",
          frequency: "daily",
          jsonAssessment: "",
          isAIResponse: true,
          lowStateCount
        };
        const adapter = getDatabaseAdapter();
        await adapter.saveFeelingLog({
          id: feelingLog.id,
          timestamp: feelingLog.timestamp,
          userId: feelingLog.userId,
          emotionalState: feelingLog.emotion || feelingLog.emotionalState || "",
          selectedFeeling: feelingLog.subEmotion || feelingLog.selectedFeeling || null,
          aiResponse: feelingLog.jsonOut || "",
          isAIResponse: feelingLog.isAIResponse !== void 0 ? feelingLog.isAIResponse : true,
          lowStateCount: feelingLog.lowStateCount || 0
        });
      } catch (err) {
        console.error("Error saving emotion interaction:", err);
      }
    },
    [lcswConfig, lowStateCount]
  );
  const handleEmotionalEncourage = reactExports.useCallback(
    async (state, subEmotion) => {
      setEncouragementLoading(true);
      setEncouragementText(null);
      const feelingToUse = subEmotion !== void 0 ? subEmotion : selectedFeeling;
      let newLowCount = lowStateCount;
      if (["heavy", "drained", "overwhelmed"].includes(state))
        newLowCount += 1;
      else newLowCount = 0;
      setLowStateCount(newLowCount);
      try {
        const encouragement = await generateEmotionalEncouragement(
          state,
          feelingToUse || null
        );
        setEncouragementText(encouragement);
        const adapter = getDatabaseAdapter();
        await adapter.saveFeelingLog({
          id: generateUUID$1(),
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          emotionalState: state,
          selectedFeeling: feelingToUse || null,
          aiResponse: encouragement,
          isAIResponse: true,
          lowStateCount: newLowCount
        });
      } catch (err) {
        console.error("Encouragement generation failed, fallback:", err);
        setEncouragementText("You're doing important work. One step at a time.");
      } finally {
        setEncouragementLoading(false);
      }
    },
    [selectedFeeling, lowStateCount, lcswConfig]
  );
  const handleCommit = reactExports.useCallback(
    async (valueId) => {
      if (reflectionText.trim().length < MIN_REFLECTION_LENGTH && !goalText.trim()) return;
      let userId = null;
      try {
        const user = await getCurrentUser();
        userId = user?.id || null;
      } catch (err) {
        userId = sessionStorage.getItem("userId") || null;
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const hasGoal = goalText.trim().length > 0;
      if (hasGoal) {
        const newGoal = {
          id: generateUUID$1(),
          valueId,
          userId: userId || void 0,
          // Add userId to goal
          text: goalText,
          frequency: goalFreq,
          completed: false,
          createdAt: timestamp,
          updates: []
        };
        onUpdateGoals([newGoal, ...goals]);
      }
      const logEntry2 = {
        id: generateUUID$1(),
        date: timestamp,
        valueId,
        livedIt: true,
        note: reflectionText.trim(),
        type: "goal-update",
        mood: emotionalState
      };
      onLog(logEntry2);
      const adapter = getDatabaseAdapter();
      await adapter.saveFeelingLog({
        id: generateUUID$1(),
        timestamp,
        userId: userId || void 0,
        emotionalState: emotionalState || "",
        selectedFeeling: selectedFeeling || null,
        aiResponse: JSON.stringify({ reflection: reflectionText, selfAdvocacy: goalText }),
        isAIResponse: true,
        lowStateCount
      });
      setReflectionText("");
      setGoalText("");
      setActiveValueId(null);
    },
    [
      reflectionText,
      goalText,
      goalFreq,
      emotionalState,
      selectedFeeling,
      goals,
      onLog,
      onUpdateGoals,
      lowStateCount
    ]
  );
  const resetEncouragement = reactExports.useCallback(() => {
    setEncouragementText(null);
  }, []);
  return {
    // state
    activeValueId,
    emotionalState,
    selectedFeeling,
    reflectionText,
    goalText,
    goalFreq,
    encouragementText,
    encouragementLoading,
    coachInsight,
    valueMantra,
    reflectionAnalysis,
    crisisAlert,
    loading,
    // setters
    setActiveValueId,
    setEmotionalState,
    setSelectedFeeling,
    setReflectionText,
    setGoalText,
    setGoalFreq,
    setCrisisAlert,
    setEncouragementText,
    // Expose for setting encouragement from external sources
    // handlers
    handleEmotionalEncourage,
    handleCommit,
    saveEmotionInteraction,
    resetEncouragement
  };
}
const defaultState = {
  primaryEmotion: null,
  subEmotion: null,
  source: null
};
const EmotionContext = reactExports.createContext({
  emotionState: defaultState,
  setPrimaryEmotion: () => {
  },
  setSubEmotion: () => {
  },
  clearEmotions: () => {
  }
});
const useEmotion = () => reactExports.useContext(EmotionContext);
const Dashboard = ({
  values,
  logs,
  goals,
  lcswConfig,
  onNavigate,
  onLog,
  onUpdateGoals,
  initialEmotion,
  initialFeeling,
  initialEncouragement
}) => {
  const dashboard = useDashboard({
    values,
    goals,
    logs,
    lcswConfig,
    onLog: onLog || (() => {
    }),
    onUpdateGoals: onUpdateGoals || (() => {
    })
  });
  reactExports.useEffect(() => {
    if (initialEmotion) {
      dashboard.setEmotionalState(initialEmotion);
      if (initialFeeling) {
        dashboard.setSelectedFeeling(initialFeeling);
      }
    }
    if (initialEncouragement && dashboard.setEncouragementText) {
      dashboard.setEncouragementText(initialEncouragement);
    }
  }, [initialEmotion, initialFeeling, initialEncouragement, dashboard]);
  const { setPrimaryEmotion, setSubEmotion } = useEmotion();
  const [showReflectionModal, setShowReflectionModal] = reactExports.useState(false);
  const [selectedValue, setSelectedValue] = reactExports.useState(null);
  const [showResourcesModal, setShowResourcesModal] = reactExports.useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (dashboard.activeValueId) {
      localStorage.setItem("selectedValueId", dashboard.activeValueId.toString());
    }
  }, [dashboard.activeValueId]);
  reactExports.useEffect(() => {
    const savedId = localStorage.getItem("selectedValueId");
    if (savedId) {
      dashboard.setActiveValueId(savedId);
    }
  }, []);
  reactExports.useEffect(() => {
    console.log("[Dashboard] Reflection modal state changed:", {
      showReflectionModal,
      selectedValue: selectedValue?.name || null,
      valuesCount: values.length
    });
  }, [showReflectionModal, selectedValue, values.length]);
  const handleCheckInClick = (val) => {
    setSelectedValue(val);
    dashboard.setActiveValueId(val.id);
    setShowReflectionModal(true);
  };
  const closeReflectionModal = () => {
    setShowReflectionModal(false);
    setSelectedValue(null);
    dashboard.setActiveValueId(null);
  };
  const getReflectionPlaceholder = (freq, subFeeling) => {
    const base = `What does ${selectedValue?.name || "this value"} mean to you right now?`;
    if (subFeeling) {
      return `${base} How does feeling ${subFeeling} relate to ${selectedValue?.name || "this"}?`;
    }
    return base;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard-container px-4 pb-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 mb-8", children: values.map((val, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "p-3 border rounded-md flex items-center justify-between shadow-sm hover:shadow transition relative",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0", children: [
              "#",
              index + 1
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-800 dark:text-gray-200 truncate", children: val.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleCheckInClick(val),
              className: "bg-brand hover:bg-brand-dark text-white rounded-full w-8 h-8 text-xl flex items-center justify-center leading-[1] flex-shrink-0",
              title: "Check in",
              children: "+"
            }
          )
        ]
      },
      val.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GoalsSection$1, { goals }),
    showReflectionModal && selectedValue && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        onClick: (e) => {
          if (e.target === e.currentTarget) {
            closeReflectionModal();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            role: "dialog",
            "aria-modal": "true",
            className: "bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-semibold text-text-primary dark:text-white", children: [
                  "Reflection: ",
                  selectedValue.name
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    "aria-label": "Close",
                    onClick: closeReflectionModal,
                    className: "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white text-xl font-bold",
                    children: "×"
                  }
                )
              ] }),
              dashboard.encouragementText && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-4 bg-brand/5 dark:bg-brand/10 rounded-xl border border-brand/20 dark:border-brand/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-text-primary dark:text-white text-sm italic", children: [
                '"',
                dashboard.encouragementText,
                '"'
              ] }) }),
              dashboard.encouragementLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-4 bg-brand/5 dark:bg-brand/10 rounded-xl border border-brand/20 dark:border-brand/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary dark:text-white/70 text-sm italic", children: "Generating encouragement..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ReflectionForm,
                {
                  value: selectedValue,
                  emotionalState: dashboard.emotionalState,
                  selectedFeeling: dashboard.selectedFeeling,
                  showFeelingsList: false,
                  reflectionText: dashboard.reflectionText,
                  goalText: dashboard.goalText,
                  goalFreq: dashboard.goalFreq,
                  reflectionAnalysis: dashboard.reflectionAnalysis,
                  analyzingReflection: false,
                  coachInsight: dashboard.coachInsight,
                  valueMantra: dashboard.valueMantra,
                  loading: dashboard.loading,
                  aiGoalLoading: false,
                  lcswConfig,
                  onEmotionalStateChange: dashboard.setEmotionalState,
                  onShowFeelingsListToggle: () => {
                  },
                  onSelectedFeelingChange: dashboard.setSelectedFeeling,
                  onReflectionTextChange: dashboard.setReflectionText,
                  onGoalTextChange: dashboard.setGoalText,
                  onGoalFreqChange: dashboard.setGoalFreq,
                  onSuggestGoal: () => {
                  },
                  onCommit: () => {
                    if (selectedValue) {
                      dashboard.handleCommit(selectedValue.id);
                      closeReflectionModal();
                    }
                  },
                  getReflectionPlaceholder,
                  onTriggerReflectionAnalysis: () => {
                  }
                }
              )
            ]
          }
        )
      }
    ),
    showResourcesModal && /* @__PURE__ */ jsxRuntimeExports.jsx(CrisisResourcesModal, { onClose: () => setShowResourcesModal(false) }),
    showCrisisAlert && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CrisisAlertModal,
      {
        onClose: () => setShowCrisisAlert(false),
        lcswConfig
      }
    )
  ] });
};
const CrisisCard = ({
  onClose,
  showQuickExit = false,
  region: overrideRegion
}) => {
  const [detectedRegion, setDetectedRegion] = reactExports.useState("US");
  const [resources, setResources] = reactExports.useState(getCrisisResources("US"));
  reactExports.useEffect(() => {
    const region = overrideRegion || detectRegion();
    setDetectedRegion(region);
    setResources(getCrisisResources(region));
  }, [overrideRegion]);
  const handleQuickExit = () => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/");
      window.close();
      setTimeout(() => {
        window.location.href = "https://www.google.com";
      }, 100);
    }
  };
  const handleCall = (action) => {
    if (action && action.startsWith("tel:")) {
      window.location.href = action;
    }
  };
  const handleText = (action, body) => {
    if (action && action.startsWith("sms:")) {
      const number = action.replace("sms:", "").split(/[?&]/)[0];
      const smsUri = buildSMSUri(number, body);
      window.location.href = smsUri;
    }
  };
  const renderResourceButton = (resource) => {
    if (resource.callAction) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => handleCall(resource.callAction),
          className: "w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📞" }),
            resource.buttonLabel
          ]
        }
      );
    }
    if (resource.textAction) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => handleText(resource.textAction, resource.textBody),
          className: "w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💬" }),
            resource.buttonLabel
          ]
        }
      );
    }
    if (resource.url) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: resource.url,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "w-full py-4 px-6 bg-navy-primary hover:bg-navy-dark text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🌐" }),
            resource.buttonLabel
          ]
        }
      );
    }
    return null;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-primary w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-2 border-red-500/30", children: [
    showQuickExit && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-600 text-white p-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleQuickExit,
        className: "text-sm font-bold uppercase tracking-wide hover:underline",
        children: "🚨 Quick Exit"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 p-6 sm:p-8 text-center border-b border-red-100 dark:border-red-900/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl mb-3", children: "❤️‍🩹" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mb-2", children: "I'm glad you reached out" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base text-red-700 dark:text-red-300 leading-relaxed", children: "I'm glad you reached out, but I need you to talk to a person. As an AI, I have limits. What you're describing needs a human touch and professional support. These services are free, confidential, and available 24/7." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-text-primary dark:text-white", children: "Immediate Help" }),
        renderResourceButton(resources.primary),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-white/70", children: resources.primary.subtext })
      ] }),
      resources.secondary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-text-primary dark:text-white", children: "Alternative Support" }),
        renderResourceButton(resources.secondary),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-white/70", children: resources.secondary.subtext })
      ] }),
      resources.lgbtq && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-text-primary dark:text-white", children: "LGBTQ+ Support" }),
        renderResourceButton(resources.lgbtq),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-white/70", children: resources.lgbtq.subtext })
      ] }),
      resources.domesticViolence && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-text-primary dark:text-white", children: "Domestic Violence Support" }),
        renderResourceButton(resources.domesticViolence),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-white/70 mt-2", children: resources.domesticViolence.subtext }),
        showQuickExit && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary dark:text-white/70 mt-2 italic", children: "You can clear your browser history after visiting this page." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-red-800 dark:text-red-300 mb-2", children: "🚨 Emergency Services" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-700 dark:text-red-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "911" }),
          " (US) or your local emergency number - For immediate life-threatening emergencies"
        ] })
      ] })
    ] }),
    onClose && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-bg-secondary dark:bg-dark-bg-secondary border-t border-border-soft dark:border-dark-border text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onClose,
        className: "text-text-tertiary hover:text-text-primary dark:text-white/60 dark:hover:text-white text-sm font-bold uppercase tracking-widest transition-colors",
        children: "Close"
      }
    ) })
  ] }) });
};
const COLORS = ["blue", "green", "red", "yellow", "purple", "orange", "brown", "black", "white"];
const GroundingTool = ({ onComplete, onClose }) => {
  const [currentScreen, setCurrentScreen] = reactExports.useState("instruction");
  const [selectedColor, setSelectedColor] = reactExports.useState("");
  const [breathPhase, setBreathPhase] = reactExports.useState("in");
  const [breathCount, setBreathCount] = reactExports.useState(0);
  const [touchProgress, setTouchProgress] = reactExports.useState(0);
  const breathIntervalRef = reactExports.useRef(null);
  const touchIntervalRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    setSelectedColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }, []);
  reactExports.useEffect(() => {
    let timer;
    switch (currentScreen) {
      case "instruction":
        timer = setTimeout(() => setCurrentScreen("sight"), 5e3);
        break;
      case "sight":
        timer = setTimeout(() => setCurrentScreen("touch"), 15e3);
        break;
      case "touch":
        timer = setTimeout(() => {
          setCurrentScreen("breath");
          startBreathing();
        }, 15e3);
        break;
      case "breath":
        timer = setTimeout(() => {
          stopBreathing();
          setCurrentScreen("landing");
        }, 15e3);
        break;
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentScreen]);
  const startBreathing = () => {
    let phase = "in";
    let count = 0;
    breathIntervalRef.current = setInterval(() => {
      if (phase === "in") {
        phase = "hold";
        setTimeout(() => {
          phase = "out";
          setBreathPhase("out");
        }, 2e3);
      } else if (phase === "out") {
        phase = "pause";
        setBreathPhase("pause");
        count++;
        setBreathCount(count);
        setTimeout(() => {
          phase = "in";
          setBreathPhase("in");
        }, 2e3);
      } else {
        setBreathPhase(phase);
      }
    }, 4e3);
  };
  const stopBreathing = () => {
    if (breathIntervalRef.current) {
      clearInterval(breathIntervalRef.current);
      breathIntervalRef.current = null;
    }
  };
  reactExports.useEffect(() => {
    if (currentScreen === "touch") {
      touchIntervalRef.current = setInterval(() => {
        setTouchProgress((prev) => Math.min(prev + 1, 100));
      }, 150);
      return () => {
        if (touchIntervalRef.current) {
          clearInterval(touchIntervalRef.current);
        }
      };
    } else {
      setTouchProgress(0);
    }
  }, [currentScreen]);
  reactExports.useEffect(() => {
    return () => {
      stopBreathing();
      if (touchIntervalRef.current) {
        clearInterval(touchIntervalRef.current);
      }
    };
  }, []);
  const handleAction = (action) => {
    onComplete?.(action);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] bg-gradient-to-br from-sage-green via-navy-dark to-sage-green flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
    currentScreen === "instruction" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        className: "bg-white dark:bg-dark-bg-primary rounded-3xl p-8 text-center shadow-2xl",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "🧘" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-text-primary dark:text-white mb-4", children: "Just breathe." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-text-secondary dark:text-white/70 leading-relaxed", children: "We're going to find your center. Follow the prompts—no typing needed." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 border-4 border-navy-primary dark:border-yellow-warm border-t-transparent rounded-full animate-spin" }) })
        ]
      },
      "instruction"
    ),
    currentScreen === "sight" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        className: "bg-white dark:bg-dark-bg-primary rounded-3xl p-8 text-center shadow-2xl",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "👀" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-text-primary dark:text-white mb-4", children: "Find 3 things" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg text-text-secondary dark:text-white/70 mb-6", children: [
            "Look around the room. Find ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-navy-primary dark:text-yellow-warm capitalize", children: selectedColor }),
            " things."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setCurrentScreen("touch"),
              className: "w-full py-4 bg-navy-primary dark:bg-yellow-warm text-white dark:text-navy-dark font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-opacity",
              children: "Found Them"
            }
          )
        ]
      },
      "sight"
    ),
    currentScreen === "touch" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        className: "bg-white dark:bg-dark-bg-primary rounded-3xl p-8 text-center shadow-2xl",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "✋" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-text-primary dark:text-white mb-4", children: "Feel your body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-text-secondary dark:text-white/70 mb-6 leading-relaxed", children: "Press your feet firmly into the floor. Feel the texture of your chair or your clothes. Notice the weight of your body." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-bg-secondary dark:bg-dark-bg-secondary rounded-full h-3 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "bg-navy-primary dark:bg-yellow-warm h-3 rounded-full",
              initial: { width: 0 },
              animate: { width: `${touchProgress}%` },
              transition: { duration: 0.15 }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-tertiary dark:text-white/50", children: "Focus on the sensations..." })
        ]
      },
      "touch"
    ),
    currentScreen === "breath" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        className: "bg-white dark:bg-dark-bg-primary rounded-3xl p-8 text-center shadow-2xl",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "🦉" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-text-primary dark:text-white mb-4", children: "Breathe with me" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-text-secondary dark:text-white/70 mb-6", children: "Listen for the furthest sound you can hear. Now, breathe with the owl." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "relative",
                animate: {
                  scale: breathPhase === "in" ? 1.2 : breathPhase === "out" ? 0.9 : 1
                },
                transition: {
                  duration: 4,
                  ease: "easeInOut"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-32 h-32 bg-navy-primary dark:bg-yellow-warm rounded-full flex items-center justify-center relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-6 w-6 h-6 bg-white rounded-full" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 right-6 w-6 h-6 bg-white rounded-full" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-white rounded-full" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-white dark:bg-dark-bg-secondary border-2 border-navy-primary dark:border-yellow-warm rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-navy-primary dark:text-yellow-warm", children: breathCount }) })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-navy-primary dark:text-yellow-warm mt-4", children: [
              breathPhase === "in" && "Breathe In...",
              breathPhase === "hold" && "Hold...",
              breathPhase === "out" && "Breathe Out...",
              breathPhase === "pause" && "Pause..."
            ] })
          ] })
        ]
      },
      "breath"
    ),
    currentScreen === "landing" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        className: "bg-white dark:bg-dark-bg-primary rounded-3xl p-8 text-center shadow-2xl",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { scale: 0 },
              animate: { scale: 1 },
              transition: { type: "spring", stiffness: 200 },
              className: "text-6xl mb-4",
              children: "✓"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-text-primary dark:text-white mb-2", children: "You're back." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-text-secondary dark:text-white/70 mb-6 leading-relaxed", children: "You just gave your nervous system a moment to catch up. The air is a little clearer now. Take one more breath—there is no rush." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleAction("coach"),
                className: "w-full py-4 bg-navy-primary dark:bg-yellow-warm text-white dark:text-navy-dark font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-opacity",
                children: "I'm ready to process"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleAction("better"),
                className: "w-full py-4 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-opacity",
                children: "I just need a moment of peace"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleAction("more-help"),
                className: "w-full py-4 bg-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-opacity",
                children: "I need more help"
              }
            )
          ] })
        ]
      },
      "landing"
    )
  ] }) }) });
};
const ChatInterface = ({ onClose, initialMessage }) => {
  const [messages, setMessages] = reactExports.useState([]);
  const [inputValue, setInputValue] = reactExports.useState(initialMessage || "");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [isRouting, setIsRouting] = reactExports.useState(false);
  const [routingFramework, setRoutingFramework] = reactExports.useState(null);
  const [session, setSession] = reactExports.useState(null);
  const [showCrisisCard, setShowCrisisCard] = reactExports.useState(false);
  const [crisisResponse, setCrisisResponse] = reactExports.useState(null);
  const [showGrounding, setShowGrounding] = reactExports.useState(false);
  const [hasSessionMemory, setHasSessionMemory] = reactExports.useState(false);
  const messagesEndRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const checkSessionMemory = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.id) {
          const token = await loadLastSessionToken(user.id);
          setHasSessionMemory(!!token);
        }
      } catch (error) {
        logger.error("[ChatInterface] Error checking session memory:", error);
      }
    };
    checkSessionMemory();
  }, []);
  reactExports.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  reactExports.useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const handleSend = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    try {
      if (messages.length === 0) {
        setIsRouting(true);
        const result = await startCounselingSessionWithTriage(message);
        if (typeof result.response === "object" && "isCrisis" in result.response) {
          setCrisisResponse(result.response);
          setShowCrisisCard(true);
          setIsLoading(false);
          setIsRouting(false);
          return;
        }
        if (result.handover) {
          const { getCategoryDisplayName: getCategoryDisplayName2 } = await __vitePreload(async () => {
            const { getCategoryDisplayName: getCategoryDisplayName3 } = await import("./ai-services-DJUX-74P.js").then((n) => n.M);
            return { getCategoryDisplayName: getCategoryDisplayName3 };
          }, true ? __vite__mapDeps([0,1,2,3,4]) : void 0);
          const category = result.category || "OVERWHELM";
          setRoutingFramework(getCategoryDisplayName2(category));
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
        setIsRouting(false);
        setRoutingFramework(null);
        const newSession = {
          promptType: result.framework,
          messages: [
            { role: "user", content: message, timestamp: userMessage.timestamp },
            { role: "assistant", content: result.response, timestamp: (/* @__PURE__ */ new Date()).toISOString() }
          ]
        };
        setSession(newSession);
        const assistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.response,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        if (!session) {
          logger.error("[ChatInterface] No session found for continuation");
          return;
        }
        const result = await continueCounselingSession(session, message);
        if (typeof result === "object" && "isCrisis" in result) {
          setCrisisResponse(result);
          setShowCrisisCard(true);
          setIsLoading(false);
          return;
        }
        const updatedSession = {
          ...session,
          messages: [
            ...session.messages,
            { role: "user", content: message, timestamp: userMessage.timestamp },
            { role: "assistant", content: result, timestamp: (/* @__PURE__ */ new Date()).toISOString() }
          ]
        };
        setSession(updatedSession);
        const assistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      logger.error("[ChatInterface] Error in chat:", error);
      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again or use the 60-Second Reset if you need immediate support.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleGroundingComplete = (action) => {
    setShowGrounding(false);
    if (action === "coach") {
      inputRef.current?.focus();
    } else if (action === "more-help") {
      setShowCrisisCard(true);
    }
  };
  if (showCrisisCard && crisisResponse) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CrisisCard,
      {
        onClose: () => {
          setShowCrisisCard(false);
          setCrisisResponse(null);
        },
        showQuickExit: crisisResponse.isDomesticViolence
      }
    );
  }
  if (showGrounding) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(GroundingTool, { onComplete: handleGroundingComplete, onClose: () => setShowGrounding(false) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 bg-bg-primary dark:bg-dark-bg-primary flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-secondary border-b border-border-soft dark:border-dark-border p-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-text-primary dark:text-white", children: "Protected Space" }),
        hasSessionMemory && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-secondary dark:text-white/70 bg-bg-secondary dark:bg-dark-bg-tertiary px-2 py-1 rounded", children: "Previous session available" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowGrounding(true),
            className: "px-3 py-1.5 bg-yellow-warm dark:bg-yellow-warm text-navy-dark font-bold text-sm rounded-lg hover:opacity-90 transition-opacity",
            children: "🧘 60-Second Reset"
          }
        ),
        onClose && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onClose,
            className: "w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary dark:hover:bg-dark-bg-tertiary",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: [
      messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary dark:text-white/70 mb-4", children: "This is your Protected Space. Share what's on your mind, and I'll help you find the right support." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-tertiary dark:text-white/50", children: "Your words stay here, encrypted and unjudged." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { children: [
        isRouting && routingFramework && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0 },
            className: "bg-navy-primary/10 dark:bg-yellow-warm/10 rounded-xl p-4 text-center",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-text-primary dark:text-white", children: [
              "Switching to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: routingFramework }),
              "..."
            ] })
          }
        ),
        messages.map((message) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            className: `flex ${message.role === "user" ? "justify-end" : "justify-start"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `max-w-[80%] rounded-2xl p-4 ${message.role === "user" ? "bg-navy-primary dark:bg-yellow-warm text-white dark:text-navy-dark" : "bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed whitespace-pre-wrap", children: message.content })
              }
            )
          },
          message.id
        )),
        isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            className: "flex justify-start",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-bg-secondary dark:bg-dark-bg-secondary rounded-2xl p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 bg-text-secondary dark:text-white/50 rounded-full animate-bounce", style: { animationDelay: "0ms" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 bg-text-secondary dark:text-white/50 rounded-full animate-bounce", style: { animationDelay: "150ms" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 bg-text-secondary dark:text-white/50 rounded-full animate-bounce", style: { animationDelay: "300ms" } })
            ] }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: messagesEndRef })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-dark-bg-secondary border-t border-border-soft dark:border-dark-border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            ref: inputRef,
            value: inputValue,
            onChange: (e) => setInputValue(e.target.value),
            onKeyPress: handleKeyPress,
            placeholder: "Share what's on your mind...",
            className: "flex-1 resize-none rounded-xl p-3 bg-bg-secondary dark:bg-dark-bg-tertiary text-text-primary dark:text-white border border-border-soft dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-navy-primary dark:focus:ring-yellow-warm",
            rows: 2,
            disabled: isLoading
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleSend,
            disabled: !inputValue.trim() || isLoading,
            className: "px-6 py-3 bg-navy-primary dark:bg-yellow-warm text-white dark:text-navy-dark font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed",
            children: "Send"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-tertiary dark:text-white/50 mt-2 text-center", children: "Press Enter to send, Shift+Enter for new line" })
    ] })
  ] });
};
const AppHeader = ({
  authState,
  showNav,
  view,
  aiStatusText,
  onViewChange,
  onOpenLCSWConfig,
  onOpenHelp,
  onLogout
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-white dark:bg-dark-bg-primary border-b border-border-soft dark:border-dark-border sticky top-0 z-40 shadow-sm dark:shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: "/ac-minds-logo.png",
          alt: "AC MINDS",
          className: "w-7 h-7 object-contain"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-base sm:text-lg tracking-tight text-text-primary dark:text-white hidden sm:inline", children: "Grounded" }),
      authState === "app" && aiStatusText && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full border ${aiStatusText === "AI Ready" ? "bg-green-500/20 dark:bg-green-500/30 text-green-600 dark:text-green-400 border-green-500/30" : "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light border-brand/30"}`, children: aiStatusText })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1.5 sm:space-x-2", children: [
      showNav && /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden lg:flex items-center space-x-0.5 sm:space-x-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: (e) => {
              e.preventDefault();
              onViewChange("home");
              if (window.__dashboardReset) {
                window.__dashboardReset();
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
            className: `px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === "home" ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light" : "text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Home" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "H" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onViewChange("values"),
            className: `px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === "values" ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light" : "text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Values" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "V" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onViewChange("goals"),
            className: `px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === "goals" ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light" : "text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Goals" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "G" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onViewChange("report"),
            className: `px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === "report" ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light" : "text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Reports" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "R" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onViewChange("vault"),
            className: `px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === "vault" ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light" : "text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Vault" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "V" })
            ]
          }
        )
      ] }),
      showNav && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onOpenLCSWConfig,
          className: "w-8 h-8 flex items-center justify-center rounded-full text-text-secondary dark:text-text-secondary hover:text-brand dark:hover:text-brand-light hover:bg-brand/10 dark:hover:bg-brand/20 transition-all",
          "aria-label": "Configuration",
          title: "Configuration",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onOpenHelp,
          className: "w-8 h-8 flex items-center justify-center rounded-full text-text-secondary dark:text-text-secondary hover:text-brand dark:hover:text-brand-light hover:bg-brand/10 dark:hover:bg-brand/20 transition-all",
          "aria-label": "Help",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onLogout,
          className: "w-8 h-8 flex items-center justify-center rounded-full text-text-secondary dark:text-text-secondary hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",
          "aria-label": "Logout",
          title: "Logout",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) })
        }
      )
    ] })
  ] }) });
};
function AppContent({ onHydrationReady }) {
  const authContext = useAuthContext();
  const { authState, handleLogin, handleAcceptTerms, handleDeclineTerms, handleLogout } = authContext;
  let context;
  try {
    context = useDataContext();
  } catch (error) {
    console.error("[AppContent] Error accessing DataContext:", error);
    context = null;
  }
  const [currentView, setCurrentView] = reactExports.useState("home");
  const [showHelp, setShowHelp] = reactExports.useState(false);
  const [showSettings, setShowSettings] = reactExports.useState(false);
  const [showResources, setShowResources] = reactExports.useState(false);
  const [showReflection, setShowReflection] = reactExports.useState(false);
  const [showChat, setShowChat] = reactExports.useState(false);
  const [showGrounding, setShowGrounding] = reactExports.useState(false);
  const [encouragementText, setEncouragementText] = reactExports.useState(null);
  const [encouragementLoading, setEncouragementLoading] = reactExports.useState(false);
  const [currentEmotion, setCurrentEmotion] = reactExports.useState(void 0);
  const [currentFeeling, setCurrentFeeling] = reactExports.useState(void 0);
  const [hasSessionMemory, setHasSessionMemory] = reactExports.useState(false);
  const [sessionMemorySummary, setSessionMemorySummary] = reactExports.useState(null);
  const selectedValues = reactExports.useMemo(
    () => (context?.selectedValueIds || []).map((id) => ALL_VALUES.find((v) => v.id === id)).filter(Boolean),
    [context?.selectedValueIds]
  );
  const isFirstTimeUser = reactExports.useMemo(() => {
    if (!context || context.isHydrating) {
      return false;
    }
    return !context.selectedValueIds || context.selectedValueIds.length === 0;
  }, [context?.selectedValueIds, context?.isHydrating]);
  reactExports.useEffect(() => {
    if (context && authState === "app" && onHydrationReady) {
      onHydrationReady();
    }
  }, [context, authState, onHydrationReady]);
  reactExports.useEffect(() => {
    if (isFirstTimeUser && currentView === "home" && authState === "app" && context) {
      setCurrentView("values");
    }
  }, [isFirstTimeUser, currentView, authState, context]);
  const handleActionClick = reactExports.useCallback((action) => {
    if (action === "values") {
      setCurrentView("values");
    } else if (action === "reflection") {
      setShowReflection(true);
    } else if (action === "resources") {
      setShowResources(true);
    }
  }, [setCurrentView, setShowReflection, setShowResources]);
  reactExports.useEffect(() => {
    if (!context || context.isHydrating || authState !== "app") return;
    if (currentEmotion && currentFeeling) return;
    const loadLastEmotion = async () => {
      try {
        const user = await getCurrentUser();
        if (!user?.id) return;
        const adapter = getDatabaseAdapter();
        await adapter.init();
        const firstLog = await adapter.getFirstFeelingLog(user.id);
        if (firstLog) {
          const emotion = firstLog.emotionalState || firstLog.emotion;
          const feeling = firstLog.selectedFeeling || firstLog.subEmotion;
          if (emotion && feeling) {
            setCurrentEmotion(emotion);
            setCurrentFeeling(feeling);
            setEncouragementLoading(true);
            try {
              const encouragement = await generateEmotionalEncouragement(emotion, feeling);
              setEncouragementText(encouragement);
              logger.debug("[AppContent] Loaded first emotion and generated encouragement:", { emotion, feeling });
            } catch (error) {
              logger.error("[AppContent] Error generating encouragement for loaded emotion:", error);
            } finally {
              setEncouragementLoading(false);
            }
          }
        }
      } catch (error) {
        logger.error("[AppContent] Error loading last emotion:", error);
      }
    };
    loadLastEmotion();
  }, [authState, context, currentEmotion, currentFeeling]);
  reactExports.useEffect(() => {
    if (!context || context.isHydrating || authState !== "app") return;
    const loadSessionMemory = async () => {
      try {
        const user = await getCurrentUser();
        if (!user?.id) return;
        const token = await loadLastSessionToken(user.id);
        if (token) {
          setHasSessionMemory(true);
          setSessionMemorySummary(formatSessionContextForPrompt(token));
          logger.debug("[AppContent] Loaded session memory:", token.framework);
        }
      } catch (error) {
        logger.error("[AppContent] Error loading session memory:", error);
      }
    };
    loadSessionMemory();
  }, [authState, context]);
  const handleMoodChange = reactExports.useCallback(async (emotion, feeling) => {
    logger.debug("[AppContent] Mood changed:", emotion, feeling);
    setCurrentEmotion(emotion);
    setCurrentFeeling(feeling);
    setEncouragementLoading(true);
    setEncouragementText(null);
    try {
      const encouragement = await generateEmotionalEncouragement(emotion, feeling);
      setEncouragementText(encouragement);
      logger.debug("[AppContent] Encouragement generated:", encouragement);
    } catch (error) {
      logger.error("[AppContent] Error generating encouragement:", error);
      setEncouragementText("Your feelings are valid. Take care of yourself.");
    } finally {
      setEncouragementLoading(false);
    }
  }, [setCurrentEmotion, setCurrentFeeling, setEncouragementLoading, setEncouragementText]);
  if (authState === "checking") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-screen text-text-primary dark:text-white bg-bg-primary dark:bg-dark-bg-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Initializing Grounded …" }) });
  }
  if (authState === "login") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Login, { onLogin: handleLogin });
  }
  if (authState === "terms") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(TermsAcceptance, { onAccept: handleAcceptTerms, onDecline: handleDeclineTerms });
  }
  if (!context || authState !== "app") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-screen text-text-primary dark:text-white bg-bg-primary dark:bg-dark-bg-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Loading Grounded data …" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col bg-bg-primary dark:bg-dark-bg-primary text-text-primary dark:text-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AppHeader,
      {
        authState,
        showNav: authState === "app",
        view: currentView === "settings" ? "settings" : currentView === "home" ? "home" : currentView,
        onViewChange: (view) => {
          if (view === "settings") {
            setShowSettings(true);
            setCurrentView("home");
          } else {
            setCurrentView(view);
          }
        },
        onOpenLCSWConfig: () => {
          setShowSettings(true);
        },
        onOpenHelp: () => setShowHelp(true),
        onLogout: handleLogout
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 w-full overflow-y-auto p-4 pb-24", children: [
      currentView === "home" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto py-8 space-y-4", children: [
        hasSessionMemory && sessionMemorySummary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-navy-primary/10 dark:bg-yellow-warm/10 rounded-xl p-4 mb-4 border border-navy-primary/20 dark:border-yellow-warm/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-primary dark:text-white italic", children: sessionMemorySummary }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AIResponseBubble$1,
          {
            message: "Welcome to Grounded. How are you feeling today?",
            emotion: currentEmotion,
            feeling: currentFeeling,
            onActionClick: handleActionClick,
            onMoodChange: handleMoodChange,
            encouragement: encouragementText,
            encouragementLoading
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowChat(true),
            className: "w-full py-4 bg-navy-primary dark:bg-yellow-warm text-white dark:text-navy-dark font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💬" }),
              "Start a New Session"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-24 right-4 z-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowGrounding(true),
            className: "w-16 h-16 bg-yellow-warm dark:bg-yellow-warm text-navy-dark font-black text-xl rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center animate-pulse",
            title: "60-Second Emergency Grounding",
            children: "🧘"
          }
        ) })
      ] }),
      currentView === "goals" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        GoalsSection$1,
        {
          goals: context?.goals || [],
          values: selectedValues,
          onCompleteGoal: (goal) => {
            if (context) {
              const updatedGoals = (context.goals || []).map(
                (g) => g.id === goal.id ? { ...g, completed: true } : g
              );
              context.handleUpdateGoals(updatedGoals);
            }
          },
          onDeleteGoal: (goalId) => {
            if (context) {
              const updatedGoals = (context.goals || []).filter((g) => g.id !== goalId);
              context.handleUpdateGoals(updatedGoals);
            }
          }
        }
      ),
      currentView === "update" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        GoalsUpdateView,
        {
          goals: context?.goals || [],
          values: selectedValues,
          onUpdateGoal: (goalId, update) => {
            if (context) {
              const updatedGoals = (context.goals || []).map((g) => {
                if (g.id === goalId) {
                  return { ...g, updates: [...g.updates || [], update] };
                }
                return g;
              });
              context.handleUpdateGoals(updatedGoals);
            }
          },
          onCompleteGoal: (goal) => {
            if (context) {
              const updatedGoals = (context.goals || []).map(
                (g) => g.id === goal.id ? { ...g, completed: true } : g
              );
              context.handleUpdateGoals(updatedGoals);
            }
          },
          onDeleteGoal: (goalId) => {
            if (context) {
              const updatedGoals = (context.goals || []).filter((g) => g.id !== goalId);
              context.handleUpdateGoals(updatedGoals);
            }
          },
          onEditGoal: (goalId, newText) => {
            if (context) {
              const updatedGoals = (context.goals || []).map(
                (g) => g.id === goalId ? { ...g, text: newText } : g
              );
              context.handleUpdateGoals(updatedGoals);
            }
          }
        }
      ),
      currentView === "vault" && /* @__PURE__ */ jsxRuntimeExports.jsx(VaultControl, {}),
      currentView === "values" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto", children: [
        isFirstTimeUser && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 p-4 bg-brand/10 dark:bg-brand/20 border border-brand/30 dark:border-brand/30 rounded-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-text-primary dark:text-white mb-2", children: "Welcome to Grounded! 🌱" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary dark:text-white/70 leading-relaxed mb-2", children: "To get started, select up to 10 values that matter most to you. These will guide your self-care journey." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-text-secondary dark:text-white/70 leading-relaxed", children: [
            "Once you've selected your values, click ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Confirm Compass"' }),
            " to save and begin tracking your self-care."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ValueSelection,
          {
            initialSelected: context?.selectedValueIds || [],
            hideConfirm: showSettings || showHelp || showResources,
            onSave: (ids) => {
              if (context) {
                context.handleSelectionComplete(ids);
              }
            },
            onComplete: (ids) => {
              if (context) {
                context.handleSelectionComplete(ids);
              }
              setCurrentView("home");
            },
            onAddGoal: (valueId) => {
              if (context && context.selectedValueIds.length > 0) {
                context.handleSelectionComplete(context.selectedValueIds);
              }
              setCurrentView("update");
            },
            goals: context?.goals || []
          }
        )
      ] }),
      currentView === "report" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReportView$1,
        {
          logs: context?.logs || [],
          values: selectedValues,
          goals: context?.goals || []
        }
      ),
      showSettings && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-primary dark:bg-dark-bg-primary text-text-primary dark:text-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowSettings(false),
            className: "absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Settings,
          {
            onLogout: handleLogout,
            onShowHelp: () => {
              setShowSettings(false);
              setShowHelp(true);
            }
          }
        )
      ] }) })
    ] }),
    currentView !== "values" && /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "flex-shrink-0 border-t border-border-soft dark:border-dark-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      BottomNavigation,
      {
        currentView,
        onViewChange: (view) => {
          if (view === "goals" || view === "vault" || view === "home" || view === "values" || view === "report") {
            setCurrentView(view);
          }
        },
        onLogout: handleLogout
      }
    ) }),
    showHelp && /* @__PURE__ */ jsxRuntimeExports.jsx(HelpOverlay, { onClose: () => setShowHelp(false) }),
    showReflection && context && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-primary dark:bg-dark-bg-primary rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowReflection(false),
          className: "absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Dashboard,
        {
          values: selectedValues,
          logs: context.logs || [],
          goals: context.goals || [],
          lcswConfig: context.settings?.lcswConfig,
          initialEmotion: currentEmotion,
          initialFeeling: currentFeeling,
          initialEncouragement: encouragementText,
          onLog: (entry) => {
            if (context) {
              context.handleLogEntry(entry);
            }
          },
          onUpdateGoals: (updatedGoals) => {
            if (context) {
              context.handleUpdateGoals(updatedGoals);
            }
          }
        }
      ) })
    ] }) }),
    showResources && context && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CrisisResourcesModal,
      {
        onClose: () => setShowResources(false),
        lcswConfig: context.settings?.lcswConfig
      }
    ),
    showChat && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ChatInterface,
      {
        onClose: () => setShowChat(false)
      }
    ),
    showGrounding && /* @__PURE__ */ jsxRuntimeExports.jsx(
      GroundingTool,
      {
        onComplete: (action) => {
          setShowGrounding(false);
          if (action === "coach") {
            setShowChat(true);
          } else if (action === "more-help") {
            setShowResources(true);
          }
        },
        onClose: () => setShowGrounding(false)
      }
    )
  ] });
}
function isPWAInstalled() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }
  if (window.navigator.standalone === true) {
    return true;
  }
  if (window.matchMedia("(display-mode: fullscreen)").matches) {
    return true;
  }
  return false;
}
function detectPlatform() {
  if (typeof window === "undefined") return "unknown";
  const ua = window.navigator.userAgent || "";
  const platform = window.navigator.platform || "";
  if (/iPad|iPhone|iPod/.test(ua) || platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return "ios";
  }
  if (/Android/.test(ua)) {
    return "android";
  }
  return "desktop";
}
async function checkServiceWorkerStatus() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    if (registration.active) {
      return true;
    }
    if (registration.installing) {
      return new Promise((resolve) => {
        const stateChangeHandler = () => {
          if (registration.installing.state === "activated") {
            resolve(true);
          } else if (registration.installing.state === "redundant") {
            resolve(false);
          }
        };
        registration.installing.addEventListener("statechange", stateChangeHandler);
        setTimeout(() => resolve(false), 5e3);
      });
    }
    return false;
  } catch (error) {
    console.error("[installCheck] Error checking service worker:", error);
    return false;
  }
}
async function checkCacheReady() {
  if (typeof window === "undefined" || !("caches" in window)) {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return true;
    }
    return false;
  }
  try {
    const cacheNames = await caches.keys();
    if (cacheNames.length === 0) {
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return true;
      }
      return false;
    }
    const criticalFiles = [
      "/",
      "/index.html",
      "/manifest.json"
    ];
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const cached = await Promise.all(
        criticalFiles.map((url) => cache.match(url))
      );
      if (cached.some((response) => response !== void 0)) {
        return true;
      }
    }
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return true;
    }
    return false;
  } catch (error) {
    console.error("[installCheck] Error checking cache:", error);
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return true;
    }
    return false;
  }
}
async function checkForUpdates() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    await registration.update();
    if (registration.waiting) {
      return true;
    }
    if (registration.installing) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("[installCheck] Error checking for updates:", error);
    return false;
  }
}
async function getInstallationStatus() {
  const [serviceWorkerActive, cacheReady, needsUpdate] = await Promise.all([
    checkServiceWorkerStatus(),
    checkCacheReady(),
    checkForUpdates()
  ]);
  return {
    isInstalled: isPWAInstalled(),
    isStandalone: window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true,
    serviceWorkerActive,
    cacheReady,
    needsUpdate,
    platform: detectPlatform()
  };
}
const installCheck = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  checkCacheReady,
  checkForUpdates,
  checkServiceWorkerStatus,
  detectPlatform,
  getInstallationStatus,
  isPWAInstalled
}, Symbol.toStringTag, { value: "Module" }));
function isDevelopment() {
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return true;
    }
  }
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("dev_mode") === "true";
  }
  return false;
}
const InstallationGate = ({ children, onInstallComplete }) => {
  const [status, setStatus] = reactExports.useState({
    isInstalled: false,
    serviceWorkerActive: false,
    cacheReady: false,
    needsUpdate: false,
    platform: "unknown",
    checking: true,
    updating: false,
    bypassed: false
  });
  const hasCheckedRef = reactExports.useRef(false);
  const checkTimeoutRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (isDevelopment()) {
      console.log("[InstallationGate] Development mode - bypassing installation check");
      setStatus((prev) => ({
        ...prev,
        isInstalled: true,
        serviceWorkerActive: true,
        cacheReady: true,
        checking: false,
        bypassed: true
      }));
      return;
    }
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    const checkStatus = async () => {
      try {
        setStatus((prev) => ({ ...prev, checking: true }));
        const installationStatus = await getInstallationStatus();
        setStatus({
          isInstalled: installationStatus.isInstalled,
          serviceWorkerActive: installationStatus.serviceWorkerActive,
          cacheReady: installationStatus.cacheReady,
          needsUpdate: installationStatus.needsUpdate,
          platform: installationStatus.platform,
          checking: false,
          updating: false,
          bypassed: false
        });
        if (installationStatus.isInstalled && installationStatus.needsUpdate && !isDevelopment()) {
          await applyUpdate();
        }
        if (installationStatus.isInstalled && onInstallComplete) {
          onInstallComplete();
        }
      } catch (error) {
        console.error("[InstallationGate] Error checking status:", error);
        setStatus((prev) => ({
          ...prev,
          checking: false,
          isInstalled: true,
          serviceWorkerActive: true,
          cacheReady: true
        }));
      }
    };
    checkStatus();
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    checkTimeoutRef.current = setTimeout(async () => {
      const currentStatus = await getInstallationStatus();
      if (!currentStatus.isInstalled && !status.bypassed) {
        setStatus((prev) => ({
          ...prev,
          isInstalled: currentStatus.isInstalled,
          serviceWorkerActive: currentStatus.serviceWorkerActive,
          cacheReady: currentStatus.cacheReady
        }));
      }
    }, 5e3);
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);
  const applyUpdate = async () => {
    setStatus((prev) => ({ ...prev, updating: true }));
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            resolve();
          }, { once: true });
          setTimeout(() => resolve(), 5e3);
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("[InstallationGate] Error applying update:", error);
      setStatus((prev) => ({ ...prev, updating: false }));
    }
  };
  const isReady = status.bypassed || status.isInstalled && (status.serviceWorkerActive || status.cacheReady) && !status.checking || isDevelopment() && !status.checking;
  if (isReady) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
  }
  if (status.checking || status.updating) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-bg-primary dark:bg-dark-bg-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4 p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-brand dark:border-brand-light mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-primary dark:text-white font-medium", children: status.updating ? "Updating app..." : "Checking installation..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-bg-primary dark:bg-dark-bg-primary p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black text-text-primary dark:text-white", children: "Install Grounded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary dark:text-white/70", children: "Install the app locally for the best experience" })
    ] }),
    status.platform === "ios" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-blue-900 dark:text-blue-200 mb-2", children: "iOS Installation Instructions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "text-xs text-blue-800 dark:text-blue-300 space-y-2 list-decimal list-inside", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Tap the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Share" }),
            " button ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "📤" }),
            " at the bottom of Safari"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Scroll down and tap ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Add to Home Screen"' })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Tap ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Add"' }),
            " in the top right corner"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "The app will open from your home screen" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-text-secondary dark:text-white/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Important:" }),
          ` iOS doesn't download from the address bar. You must use "Add to Home Screen" to install the app.`
        ] })
      ] })
    ] }),
    status.platform === "android" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-green-900 dark:text-green-200 mb-2", children: "Android Installation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-800 dark:text-green-300", children: 'Look for the install prompt that appears in your browser, or tap the menu (⋮) and select "Install app" or "Add to Home screen".' })
    ] }) }),
    status.platform === "desktop" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-purple-900 dark:text-purple-200 mb-2", children: "Desktop Installation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-purple-800 dark:text-purple-300", children: `Look for the install icon in your browser's address bar, or check the browser menu for "Install Grounded" option.` })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border-soft dark:border-dark-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: async () => {
            const currentStatus = await getInstallationStatus();
            if (currentStatus.isInstalled) {
              setStatus((prev) => ({
                ...prev,
                isInstalled: true,
                serviceWorkerActive: currentStatus.serviceWorkerActive,
                cacheReady: currentStatus.cacheReady
              }));
              if (onInstallComplete) {
                onInstallComplete();
              }
            } else {
              window.location.reload();
            }
          },
          className: "w-full py-3 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity",
          children: "I've Installed It - Continue"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setStatus((prev) => ({
              ...prev,
              isInstalled: true,
              serviceWorkerActive: true,
              cacheReady: true,
              bypassed: true
            }));
          },
          className: "w-full mt-2 py-2 text-sm text-text-secondary dark:text-white/60 hover:text-text-primary dark:hover:text-white transition-colors",
          children: "Continue Without Installing"
        }
      )
    ] })
  ] }) });
};
const AppWithData = ({ onHydrationReady }) => {
  const authContext = useAuthContext();
  const { appData } = React.useContext(AppDataContext);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DataProvider,
    {
      userId: authContext.userId,
      authState: authContext.authState,
      initialData: appData || {},
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(AppContent, { onHydrationReady })
    }
  );
};
const DiagnosticOverlay = ({ status }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "div",
  {
    style: {
      position: "fixed",
      top: 8,
      right: 8,
      background: "rgba(0,0,0,0.65)",
      color: "#00ffff",
      padding: "4px 8px",
      fontSize: 10,
      borderRadius: 4,
      fontFamily: "monospace",
      zIndex: 9999,
      pointerEvents: "none",
      opacity: 0.8
    },
    children: [
      "⚙️ ",
      status
    ]
  }
);
const AppDataContext = React.createContext({
  appData: null,
  setAppData: () => {
  }
});
const App = () => {
  const [status, setStatus] = React.useState("Initializing contexts...");
  const [showStatus, setShowStatus] = React.useState(true);
  const [appData, setAppData] = React.useState(null);
  React.useEffect(() => {
    if (status) {
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 5e3);
      return () => clearTimeout(timer);
    }
  }, [status]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center justify-center h-screen bg-bg-primary dark:bg-dark-bg-primary text-text-primary dark:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse text-lg tracking-wide", children: "Loading Grounded ..." }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(InstallationGate, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AppDataContext.Provider, { value: { appData, setAppData }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      AuthProvider,
      {
        onLoginComplete: (userId, loginAppData) => {
          setAppData(loginAppData);
          setStatus("User authenticated");
        },
        onLogoutComplete: () => {
          setAppData(null);
          setStatus("User logged out");
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AppWithData, { onHydrationReady: () => setStatus("Rendering ready") })
      }
    ) }) }) }) }),
    showStatus && /* @__PURE__ */ jsxRuntimeExports.jsx(DiagnosticOverlay, { status })
  ] });
};
function watchServiceWorkerVersion(scope = "/") {
  if (!("serviceWorker" in navigator)) return;
  const log = (...args) => console.debug("[refresh-cache]", ...args);
  const forceReload = () => {
    log("Detected updated service worker. Reloading PWA…");
    window.location.reload();
  };
  navigator.serviceWorker.register("/sw.js", { scope }).then((registration) => {
    log("Service worker registered.", registration.scope);
    if (registration.waiting) {
      forceReload();
      return;
    }
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          newWorker.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
  }).catch((error) => {
    console.error("[refresh-cache] Registration failed:", error);
  });
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    log("Service worker controller changed. Triggering reload.");
    forceReload();
  });
}
const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; background-color: #f6f7f9;">
      <h1 style="font-size: 24px; margin-bottom: 16px; color: #000;">Critical Error</h1>
      <p style="margin-bottom: 16px; color: #666;">Root element not found. Please check the HTML structure.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 16px;">
        Reload
      </button>
    </div>
  `;
  throw new Error("Could not find root element to mount to");
}
rootElement.innerHTML = `
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f6f7f9; font-family: 'Inter', sans-serif;">
    <div style="text-align: center;">
      <img src="/ac-minds-logo.png" alt="AC MINDS" style="width: 80px; height: 80px; margin: 0 auto 24px; object-fit: contain;" onerror="this.style.display='none'" />
      <h2 style="font-size: 20px; font-weight: 900; color: #000; margin-bottom: 16px;">Loading...</h2>
      <div style="width: 200px; height: 4px; background-color: #e5e7eb; border-radius: 2px; margin: 0 auto; overflow: hidden;">
        <div style="width: 30%; height: 100%; background-color: #02295b; animation: pulse 1.5s ease-in-out infinite;"></div>
      </div>
      <style>
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      </style>
    </div>
  </div>
`;
const renderTimeout = setTimeout(() => {
  const currentContent = rootElement.innerHTML;
  if (currentContent.includes("Initializing...")) {
    console.error("React failed to render within 5 seconds - showing error screen");
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; background-color: #f6f7f9;">
        <h1 style="font-size: 24px; margin-bottom: 16px; color: #000;">Loading Timeout</h1>
        <p style="margin-bottom: 16px; color: #666; text-align: center; max-width: 500px;">The app is taking longer than expected to load. This may be due to a network issue or a problem with the deployment.</p>
        <p style="margin-bottom: 16px; color: #999; font-size: 14px;">Check the browser console (F12) for error details.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 16px;">
          Reload
        </button>
      </div>
    `;
  }
}, 5e3);
watchServiceWorkerVersion();
const root = ReactDOM.createRoot(rootElement);
try {
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
  );
  clearTimeout(renderTimeout);
} catch (error) {
  clearTimeout(renderTimeout);
  console.error("Error mounting App:", error);
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "20px", fontFamily: "sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", backgroundColor: "#fff" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "24px", marginBottom: "16px", color: "#000" }, children: "Error Loading App" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginBottom: "16px", color: "#666" }, children: String(error) }),
      error instanceof Error && error.stack && /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { style: { fontSize: "12px", color: "#999", maxWidth: "600px", overflow: "auto", textAlign: "left", padding: "16px", backgroundColor: "#f5f5f5", borderRadius: "4px" }, children: error.stack }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => window.location.reload(),
          style: { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "16px" },
          children: "Reload"
        }
      )
    ] })
  );
}
