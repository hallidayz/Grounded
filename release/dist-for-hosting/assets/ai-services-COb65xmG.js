const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/transformers-DYceLRQ3.js","assets/onnx-eBVVFwq3.js","assets/db-vendor-CqkAjsCZ.js","assets/vendor-Dvad8g1z.js"])))=>i.map(i=>d[i]);
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
const ALL_CRISIS_PHRASES = [
  ...DIRECT_SUICIDE_PHRASES,
  ...INDIRECT_SUICIDE_PHRASES,
  ...METHOD_PHRASES,
  ...SELF_HARM_PHRASES,
  ...HOPELESSNESS_PHRASES,
  ...BEHAVIORAL_RED_FLAGS,
  ...THIRD_PARTY_PHRASES,
  ...IMMINENT_DANGER_PHRASES
];
function getCategoryDisplayName(category) {
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
function checkForCrisisKeywords(text) {
  if (crisisKeywords.test(text)) {
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
    console.error("[models] Error checking model compatibility:", error);
    return false;
  }
}
function getSelectedModel() {
  return selectedModel;
}
function getModelConfig(modelType) {
  return MODEL_CONFIGS[modelType];
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
      console.error("[models] Error checking if models are loaded:", error);
    }
  }
  if (isModelLoading && modelLoadPromise && !forceReload) {
    try {
      const result = await modelLoadPromise;
      if (moodTrackerModel && counselingCoachModel && selectedModel === targetModel) {
        return result;
      }
    } catch (error) {
      console.error("[models] Error checking current model:", error);
    }
  }
  const now = Date.now();
  if (!forceReload && initFailureCount >= MAX_INIT_FAILURES) {
    const timeSinceLastAttempt = now - lastInitAttempt;
    if (timeSinceLastAttempt < INIT_COOLDOWN) {
      console.log(`⏸️ Model initialization skipped - too many recent failures. Waiting ${Math.ceil((INIT_COOLDOWN - timeSinceLastAttempt) / 1e3)}s before retry.`);
      return false;
    } else {
      initFailureCount = 0;
    }
  }
  if (!forceReload && areModelsLoaded()) {
    console.log("✅ Models already loaded - skipping initialization");
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
      console.log(`⏸️ Model initialization skipped - too soon after last attempt. Waiting ${Math.ceil((INIT_COOLDOWN - timeSinceLastAttempt) / 1e3)}s.`);
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
      console.log("[MODEL_DEBUG] Running browser compatibility check...");
      compatibilityReport = checkBrowserCompatibility();
      lastErrorCategory = null;
      const summary = getCompatibilitySummary(compatibilityReport);
      console.log(`🔍 Browser compatibility: ${summary}`);
      console.log("[MODEL_DEBUG] Compatibility details:", {
        canUseAI: compatibilityReport?.canUseAI,
        wasm: compatibilityReport?.wasm,
        sharedArrayBuffer: compatibilityReport?.sharedArrayBuffer,
        webGPU: compatibilityReport?.webGPU,
        estimatedMemory: compatibilityReport?.estimatedMemory,
        suggestedStrategy: compatibilityReport?.suggestedStrategy
      });
      if (!compatibilityReport.wasm) {
        console.warn("⚠️ WebAssembly not supported. AI models cannot be used on this browser.");
        lastErrorCategory = "wasm";
        isModelLoading = false;
        setProgressError("AI models unavailable", "WebAssembly not supported. Use a modern browser.");
        return false;
      }
      if (!compatibilityReport.sharedArrayBuffer) {
        console.warn("⚠️ SharedArrayBuffer not available. Will attempt single-threaded mode.");
        console.warn("⚠️ For better performance, enable COOP/COEP headers (see SERVER_CONFIG.md).");
        lastErrorCategory = "coop-coep";
      } else {
        console.log("✓ SharedArrayBuffer available - multi-threaded mode enabled");
      }
      console.log("[MODEL_DEBUG] Browser compatibility check passed, proceeding with model loading...");
      console.log("[MODEL_DEBUG] canUseAI:", compatibilityReport.canUseAI, "suggestedStrategy:", compatibilityReport.suggestedStrategy);
      let transformersModule;
      try {
        console.log("[MODEL_DEBUG] Importing @xenova/transformers (using WASM backend)...");
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
        const importPromise = __vitePreload(() => import("./transformers-DYceLRQ3.js").then((n) => n.t), true ? __vite__mapDeps([0,1,2,3]) : void 0);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Import timeout after 10 seconds")), 1e4);
        });
        transformersModule = await Promise.race([importPromise, timeoutPromise]);
        console.log("[MODEL_DEBUG] Transformers module imported successfully");
        if (!transformersModule || !transformersModule.pipeline) {
          console.error("[MODEL_DEBUG] Transformers module structure invalid:", {
            hasModule: !!transformersModule,
            hasPipeline: !!transformersModule?.pipeline,
            moduleKeys: transformersModule ? Object.keys(transformersModule) : []
          });
          console.info("ℹ️ Transformers module structure invalid. Using rule-based responses.");
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
          }
          isModelLoading = false;
          return false;
        }
        console.log("[MODEL_DEBUG] Transformers module verified - pipeline function available");
      } catch (importError) {
        const importErrorMsg = importError?.message || String(importError);
        const importErrorStack = importError?.stack || "";
        console.error("[MODEL_DEBUG] Failed to import @xenova/transformers:", importErrorMsg);
        if (importErrorStack) {
          console.error("[MODEL_DEBUG] Import error stack:", importErrorStack);
        }
        if (importErrorMsg.includes("memory") || importErrorMsg.includes("OOM") || importErrorMsg.includes("out of memory")) {
          lastErrorCategory = "memory";
          console.info("ℹ️ AI models unavailable: Insufficient device memory.");
          console.info("ℹ️ App uses rule-based responses (fully functional).");
        } else if (importErrorMsg.includes("network") || importErrorMsg.includes("fetch") || importErrorMsg.includes("Failed to fetch")) {
          lastErrorCategory = "network";
          console.info("ℹ️ AI models unavailable: Network error during download.");
          console.info("ℹ️ App uses rule-based responses (fully functional).");
        } else {
          lastErrorCategory = "unknown";
          console.info("ℹ️ AI models unavailable. App uses rule-based responses (fully functional).");
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
          console.log("📦 Web Production: forcing HuggingFace download (allowLocalModels=false)");
        } else {
          env.allowLocalModels = true;
          if (!isDev2) {
            console.log("📦 Using local bundled models from /models/ directory");
            console.log("📦 Will fallback to HuggingFace if local model not available");
          }
        }
      } catch (configError) {
        console.warn("Could not configure transformers environment, using defaults:", configError);
      }
      let preferredDevice = "cpu";
      let deviceReason = "";
      if (compatibilityReport?.wasm) {
        preferredDevice = "cpu";
        deviceReason = "ONNX Runtime WASM backend (CPU with optimizations)";
        if (compatibilityReport?.sharedArrayBuffer) {
          console.log("[MODEL_DEBUG] ✅ ONNX Runtime WASM backend with multi-threading available");
        } else {
          console.log("[MODEL_DEBUG] ✅ ONNX Runtime WASM backend available (single-threaded mode)");
        }
      } else {
        preferredDevice = "cpu";
        deviceReason = "CPU (fallback)";
        console.log("[MODEL_DEBUG] ⚠️ Using CPU fallback - WASM optimizations unavailable");
      }
      const loadLaMiniFirst = targetModel === "lamini";
      console.log(`[MODEL_LOAD] Selected model: ${targetModel}, Loading order: ${loadLaMiniFirst ? "LaMini -> DistilBERT" : "DistilBERT -> LaMini"}`);
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
          console.log(`Model loading: ${modelName} - ${percent}%`);
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
          console.log(`Model progress callback: ${modelName} reported done (files downloaded, initializing...)`);
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
        console.log(`[MODEL_DEBUG] Using Xenova DistilBERT for mood tracking: ${moodTrackingHuggingfaceId}`);
        try {
          console.log(`Attempting to load ${moodTrackingConfig.name} for mood tracking...`);
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
            console.log(`✓ ${moodTrackingConfig.name} model loaded successfully for mood tracking`);
          } catch (pipelineError) {
            const errorMsg = pipelineError?.message || String(pipelineError);
            if (errorMsg.includes("<!DOCTYPE") || errorMsg.includes("Unexpected token")) {
              console.warn(`[MODEL_DEBUG] ${moodTrackingConfig.name} loading failed - received HTML instead of model data. This may be a CORS or network issue.`);
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
          console.error(`[MODEL_DEBUG] Pipeline call failed for ${moodTrackingConfig.name}:`, errorMsg);
          moodTrackerModel = null;
        }
      };
      const loadCounselingCoach = async () => {
        const counselingModelType = "lamini";
        const counselingConfig = MODEL_CONFIGS[counselingModelType];
        if (allModelsCache.has(counselingModelType)) {
          counselingCoachModel = allModelsCache.get(counselingModelType);
          console.log(`✓ Using cached ${counselingConfig.name} for counseling`);
          modelsLoaded++;
          return;
        }
        try {
          console.log(`Attempting to load ${counselingConfig.name} for counseling...`);
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
            console.log(`✓ ${counselingConfig.name} loaded successfully for counseling`);
          } catch (pipelineError) {
            const errorMsg = pipelineError?.message || String(pipelineError);
            if (errorMsg.includes("<!DOCTYPE") || errorMsg.includes("Unexpected token")) {
              console.warn(`[MODEL_DEBUG] ${counselingConfig.name} loading failed - received HTML instead of model data. This may be a CORS or network issue.`);
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
          console.error(`[MODEL_DEBUG] Counseling model loading error:`, errorMsg);
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
        console.log("✅ All AI models loaded!");
        console.log(`  - Mood tracker: ${moodTrackerModel ? "✓" : "✗"}`);
        console.log(`  - Counseling coach: ${counselingCoachModel ? "✓" : "✗"}`);
        console.log("[MODEL_VERIFY] Verifying loaded models work...");
        const modelsWork = await verifyModelsWork();
        if (modelsWork) {
          updateModelVersion();
          console.log("✅ Model verification passed - all systems ready!");
        } else {
          console.warn("⚠️ Models loaded but verification failed - will retry...");
          await clearModels();
          currentDownloadStatus = "error";
          currentDownloadLabel = "Model verification failed";
          currentDownloadDetails = "Will retry loading";
          return false;
        }
      } else {
        if (!isModelLoading) {
          setProgressError("AI models unavailable", "App will use rule-based responses");
          console.warn("⚠️ AI models not available. App will use rule-based responses.");
          console.warn(`  - Mood tracker: ${moodTrackerModel ? "✓ Loaded" : "✗ Failed"}`);
          console.warn(`  - Counseling coach: ${counselingCoachModel ? "✓ Loaded" : "✗ Failed"}`);
          if (moodTrackerModel || counselingCoachModel) {
            console.info("ℹ️ Partial model loading: Some AI features may be available.");
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
            console.info("ℹ️ All models failed to load. The app will use rule-based responses which are fully functional.");
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
      console.error("Model initialization error:", error);
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
          console.warn("⚠️ Insufficient memory for AI models. App will use rule-based responses.");
          break;
        case "network":
          console.warn("⚠️ Failed to download AI models. Check your internet connection.");
          console.warn("App will use rule-based responses.");
          break;
        case "wasm":
          console.warn("⚠️ WebAssembly not supported. AI models cannot run on this browser.");
          console.warn("App will continue with rule-based responses.");
          break;
        default:
          console.warn("⚠️ Failed to load on-device models. App will use rule-based responses instead.");
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
    console.log("🚀 Model loading already in progress, waiting for existing load...");
    try {
      await modelLoadPromise;
      return areModelsLoaded();
    } catch (error) {
      console.error("[models] Error waiting for model load:", error);
      return false;
    }
  }
  if (areModelsLoaded()) {
    const modelsWork = await verifyModelsWork();
    if (modelsWork) {
      console.log("✅ Models already loaded and working - skipping preload.");
      return true;
    }
  }
  console.log("🚀 Starting background model preload...");
  try {
    if (areModelsLoaded()) {
      console.log("✅ Models already loaded, checking if current...");
      const areCurrent = await areModelsCurrent();
      if (areCurrent) {
        console.log("✅ Models are current, verifying they work...");
        const modelsWork = await verifyModelsWork();
        if (modelsWork) {
          console.log("✅ Models are loaded, current, and verified working - skipping preload.");
          return true;
        } else {
          console.warn("⚠️ Models are loaded but verification failed - will reload...");
          await clearModels();
        }
      } else {
        console.log("⚠️ Models are loaded but outdated - will update...");
        await clearModels();
      }
    }
    let attempts = 0;
    let lastError = null;
    let networkErrorDetected = false;
    while (!networkErrorDetected) {
      attempts++;
      if (attempts === 1 || attempts % 5 === 0) {
        console.log(`🚀 AI model preload attempt ${attempts}...`);
      }
      try {
        if (isModelLoading && modelLoadPromise) {
          try {
            await modelLoadPromise;
            if (areModelsLoaded()) {
              return true;
            }
          } catch (error) {
            console.error("[models] Error checking models during retry:", error);
          }
        }
        const loaded = await initializeModels();
        const moodModel = getMoodTrackerModel();
        const counselingModel = getCounselingCoachModel();
        if (loaded && moodModel && counselingModel) {
          console.log(`[MODEL_VERIFY] Verifying models work after ${attempts} attempt${attempts !== 1 ? "s" : ""}...`);
          const modelsWork = await verifyModelsWork();
          if (modelsWork) {
            updateModelVersion();
            console.log(`✅ AI models loaded, verified, and ready after ${attempts} attempt${attempts !== 1 ? "s" : ""}!`);
            return true;
          } else {
            console.warn(`⚠️ Models loaded but verification failed after ${attempts} attempt${attempts !== 1 ? "s" : ""} - will retry...`);
            await clearModels();
          }
        }
        if (moodModel || counselingModel) {
          console.log(`ℹ️ Partial model loading: ${moodModel ? "Mood tracker ✓" : "Mood tracker ✗"}, ${counselingModel ? "Counseling coach ✓" : "Counseling coach ✗"}`);
        }
      } catch (error) {
        lastError = error;
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : "";
        const isNetworkError = errorMsg.includes("network") || errorMsg.includes("fetch") || errorMsg.includes("Failed to fetch") || errorMsg.includes("No internet") || errorMsg.includes("NetworkError") || errorMsg.includes("ERR_INTERNET_DISCONNECTED");
        if (isNetworkError) {
          networkErrorDetected = true;
          console.warn(`[MODEL_DEBUG] Network error detected on attempt ${attempts} - stopping retries (no internet).`);
          console.warn("⚠️ AI models cannot be downloaded without internet connection.");
          break;
        }
        if (attempts % 10 === 0) {
          console.log(`[MODEL_DEBUG] Attempt ${attempts} failed (will retry):`, errorMsg.substring(0, 100));
        }
      }
      if (!networkErrorDetected) {
        const delay = Math.min(1e3 * Math.pow(1.5, attempts - 1), 3e4);
        if (attempts % 5 === 0) {
          console.log(`[MODEL_DEBUG] Waiting ${Math.round(delay / 1e3)}s before retry ${attempts + 1}...`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    const finalMoodModel = getMoodTrackerModel();
    const finalCounselingModel = getCounselingCoachModel();
    if (finalMoodModel || finalCounselingModel) {
      console.log(`⚠️ Model preload completed with partial loading after ${attempts} attempts:`);
      console.log(`  - Mood tracker: ${finalMoodModel ? "✓" : "✗"}`);
      console.log(`  - Counseling coach: ${finalCounselingModel ? "✓" : "✗"}`);
      console.log(`  - Some AI features may be available.`);
      return true;
    } else {
      if (networkErrorDetected) {
        console.warn(`⚠️ AI models unavailable after ${attempts} attempts: No internet connection.`);
        console.warn("⚠️ Connect to internet to enable AI features. App uses rule-based responses.");
      } else {
        console.warn(`⚠️ AI models unavailable after ${attempts} attempts. Will continue retrying in background.`);
      }
    }
    return false;
  } catch (error) {
    console.error("[MODEL_DEBUG] preloadModels() caught unexpected error:", error);
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
      console.log(`[MODEL_VERSION] Models are ${Math.round(daysSinceUpdate)} days old - checking for updates...`);
      return false;
    }
    const currentModelPath = MODEL_CONFIGS[selectedModel].path;
    if (modelPath !== currentModelPath) {
      console.log(`[MODEL_VERSION] Model path changed from ${modelPath} to ${currentModelPath} - update needed`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[MODEL_VERSION] Error checking model version:", error);
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
    console.log(`[MODEL_VERSION] Updated version info for ${selectedModel}`);
  } catch (error) {
    console.warn("[MODEL_VERSION] Error updating model version:", error);
  }
}
async function verifyModelsWork() {
  try {
    const moodModel = getMoodTrackerModel();
    const counselingModel = getCounselingCoachModel();
    if (!moodModel && !counselingModel) {
      console.log("[MODEL_VERIFY] No models loaded to verify");
      return false;
    }
    let moodWorks = false;
    let counselingWorks = false;
    if (moodModel) {
      try {
        console.log("[MODEL_VERIFY] Testing mood tracker model...");
        const testText = "I feel happy and grateful today";
        const testResult = await Promise.race([
          moodModel(testText),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Test timeout")), 5e3))
        ]);
        if (testResult !== null && testResult !== void 0) {
          moodWorks = true;
          console.log("[MODEL_VERIFY] ✓ Mood tracker model works");
        } else {
          console.warn("[MODEL_VERIFY] ✗ Mood tracker returned invalid result");
        }
      } catch (error) {
        console.warn("[MODEL_VERIFY] ✗ Mood tracker test failed:", error instanceof Error ? error.message : String(error));
      }
    } else {
      console.log("[MODEL_VERIFY] Mood tracker model not loaded");
    }
    if (counselingModel) {
      try {
        console.log("[MODEL_VERIFY] Testing counseling coach model...");
        const testPrompt = "Test prompt for counseling model";
        const testResult = await Promise.race([
          counselingModel(testPrompt, { max_new_tokens: 10, temperature: 0.7 }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Test timeout")), 1e4))
        ]);
        if (testResult && (Array.isArray(testResult) && testResult.length > 0 && testResult[0]?.generated_text || typeof testResult === "object" && testResult.generated_text)) {
          counselingWorks = true;
          console.log("[MODEL_VERIFY] ✓ Counseling coach model works");
        } else {
          console.warn("[MODEL_VERIFY] ✗ Counseling coach returned invalid result");
        }
      } catch (error) {
        console.warn("[MODEL_VERIFY] ✗ Counseling coach test failed:", error instanceof Error ? error.message : String(error));
      }
    } else {
      console.log("[MODEL_VERIFY] Counseling coach model not loaded");
    }
    const result = (moodModel ? moodWorks : true) && (counselingModel ? counselingWorks : true);
    if (result) {
      console.log("[MODEL_VERIFY] ✓ All loaded models verified and working");
    } else {
      console.warn("[MODEL_VERIFY] ✗ Some models failed verification");
    }
    return result;
  } catch (error) {
    console.error("[MODEL_VERIFY] Error during model verification:", error);
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
  getModelConfig,
  getModelStatus,
  getMoodTrackerModel,
  getSelectedModel,
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
  const selectedModelType = getSelectedModel();
  const modelConfig = getModelConfig(selectedModelType);
  const modelName = modelConfig.path;
  const userName = getUserName();
  const emotionContext = subEmotion ? `${emotion} (feeling ${subEmotion})` : emotion;
  const prompt = `
    User: ${userName}
    Emotion: ${emotionContext}
    
    Give ${userName} a brief, encouraging message about feeling ${emotionContext}.
    Be supportive and validating. Use "you". Under 50 words.
    ${subEmotion ? `Specifically acknowledge their feeling of ${subEmotion}.` : ""}
  `;
  console.log("[generateEmotionalEncouragement] Generating with:", {
    emotion,
    subEmotion,
    modelName,
    emotionContext
  });
  try {
    const response = await generateText(prompt, modelName);
    if (typeof response === "object" && "isCrisis" in response) {
      console.warn("[generateEmotionalEncouragement] Crisis detected, using fallback");
      return `Your feelings are valid. Take care of yourself.`;
    }
    const encouragement = response;
    console.log("[generateEmotionalEncouragement] Generated encouragement:", encouragement);
    return encouragement;
  } catch (error) {
    console.error("[generateEmotionalEncouragement] Error generating encouragement:", error);
    return `Your feelings are valid. Take care of yourself.`;
  }
}
let globalWorker = null;
const pendingRequests = /* @__PURE__ */ new Map();
const responseCache = /* @__PURE__ */ new Map();
const CACHE_TTL = 5 * 60 * 1e3;
function getWorker() {
  if (!globalWorker) {
    globalWorker = new Worker(new URL(
      /* @vite-ignore */
      "/assets/aiWorker-BkqYiQQt.js",
      import.meta.url
    ), { type: "module" });
    globalWorker.onmessage = (e) => {
      const { id, output, error } = e.data;
      const request = pendingRequests.get(id);
      if (request) {
        if (error) request.reject(new Error(error));
        else request.resolve(output);
        pendingRequests.delete(id);
      }
    };
    globalWorker.onerror = (err) => {
      console.error("Global AI Worker Error:", err);
    };
  }
  return globalWorker;
}
function runAIWorker(inputText, task = "text2text-generation", modelName, generationConfig) {
  const crisisResponse = checkForCrisisKeywords(inputText);
  if (crisisResponse) {
    console.warn("Crisis keyword detected. Bypassing AI and returning safety response.");
    return Promise.resolve(crisisResponse);
  }
  const cacheKey = `${task}-${modelName}-${inputText}-${JSON.stringify(generationConfig)}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("[AIService] Returning cached response");
    return Promise.resolve(cached.data);
  }
  const id = crypto.randomUUID();
  const worker = getWorker();
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, {
      resolve: (data) => {
        responseCache.set(cacheKey, { data, timestamp: Date.now() });
        resolve(data);
      },
      reject
    });
    worker.postMessage({ id, text: inputText, task, modelName, generationConfig });
  });
}
async function generateText(prompt, modelName) {
  return runAIWorker(prompt, "text2text-generation", modelName);
}
const aiService = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  areModelsLoaded,
  checkBrowserCompatibility,
  clearModels,
  detectCrisis,
  generateEmotionalEncouragement,
  generateFallbackReport,
  generateHumanReports,
  generateText,
  getCompatibilityReport,
  getCompatibilitySummary,
  getCounselingCoachModel,
  getIsModelLoading,
  getModelConfig,
  getModelStatus,
  getMoodTrackerModel,
  getSelectedModel,
  initializeModels,
  isTextGenerationModel,
  preloadModels,
  runAIWorker
}, Symbol.toStringTag, { value: "Module" }));
export {
  ALL_CRISIS_PHRASES as A,
  __vitePreload as _,
  getCategoryDisplayName as a,
  generateHumanReports as b,
  getModelStatus as c,
  getCompatibilityReport as d,
  generateEmotionalEncouragement as e,
  aiService as f,
  getCurrentProgress as g,
  models as m,
  subscribeToProgress as s
};
