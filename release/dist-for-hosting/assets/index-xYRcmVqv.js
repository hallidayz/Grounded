import { R as React, j as jsxRuntimeExports, r as reactExports, a as ReactDOM } from "./react-vendor-C2RmkBAt.js";
import { D as Dexie } from "./db-vendor-CVq4xLia.js";
import { v as v4 } from "./vendor-CBqSsvzT.js";
import { m as motion } from "./animations-CzwLJK7U.js";
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
const COPY = {
  welcome: {
    subtitle: "What's moving through you?"
  },
  conversation: {
    nodes: {
      welcome: {
        message: "Pause. What's moving through you?",
        placeholder: "Take your time..."
      },
      low_energy_offer: {
        message: "That's heavy to carry. You're safe here. Want 1 slow breath with me?",
        quickReplies: ["Yes, guide me", "No, just need space"]
      },
      low_energy_yes: {
        message: "Good. Hand on heart? In... 4... hold 4... out 8... Feel your body settling. What's 1 thing you see nearby?",
        placeholder: "Name something you see..."
      },
      low_energy_no: {
        message: "That's okay. Here's quiet space. Tap when ready, or name 1 color you see.",
        quickReplies: ["Ready now", "Blue"]
      },
      low_energy_grounding: {
        message: "Notice that. Now — 4 more things you can see?",
        placeholder: "4 things you see..."
      },
      low_energy_complete: {
        message: "You're doing this. Rest here as long as you need. I'm with you.",
        quickReplies: ["Thank you", "Done for now"]
      },
      medium_swirl_offer: {
        message: "Sounds swirling — I see you. Name 1 thing you can touch right now?",
        placeholder: "What can you touch?"
      },
      medium_swirl_response: {
        message: "Feel its texture. Good anchor. What's 1 sound nearby?",
        placeholder: "What do you hear?"
      },
      medium_swirl_grounding: {
        message: "That grounding. 3 things you can feel? Then 2 you smell? 1 you taste?",
        placeholder: "Continue grounding..."
      },
      medium_swirl_complete: {
        message: "Thoughts passing like clouds. You're here, steady. What feels steady right now?",
        placeholder: "What feels steady?"
      },
      high_chaos_offer: {
        message: "You're holding so much — here's space to set it down. Safe with me. Hand on heart? In... out...",
        quickReplies: ["Breathing", "Can't focus"]
      },
      high_chaos_grounding: {
        message: "That's okay, just breathe. What's 1 safe thing under your feet? Floor? Chair? Ground?",
        placeholder: "What supports you?"
      },
      high_chaos_visualization: {
        message: "Grounded there. Chaos doesn't own you. Picture a calm place — what do you see? Hear?",
        placeholder: "Describe your safe place..."
      },
      high_chaos_tiny_steps: {
        message: "This feels big. Name 1 tiny step? Water? Walk? Journal? Phone a friend?",
        quickReplies: ["Water", "Walk", "Rest"]
      },
      high_chaos_crisis: {
        message: "Want hotlines nearby, or I can set a timer for pro help to arrive? You're not alone.",
        quickReplies: ["Show hotlines", "Set timer"]
      },
      high_chaos_complete: {
        message: "You showed up for yourself. That's everything. Rest, or tiny step — your call.",
        quickReplies: ["Thank you", "Done"]
      },
      panic_offer: {
        message: "I see the panic — you're safe right here with me. Hand on heart. Feet on floor. Can you press your feet down now?",
        quickReplies: ["Yes", "No, can't move"]
      },
      panic_yes: {
        message: "Perfect anchor. 1 thing you feel under your fingers?",
        placeholder: "What do you feel?"
      },
      panic_no: {
        message: "That's alright. You're held here. Notice air on your face? Just the air. In... out...",
        quickReplies: ["Trying", "Stay here"]
      },
      panic_breath: {
        message: "Good. 1 slow breath with me? In 3... hold 3... out 6. You're pulling through. Name 1 color you see.",
        placeholder: "Name a color..."
      },
      panic_escalate: {
        message: "Want a 988 timer or stay in this breath space with me? You're not alone in this.",
        quickReplies: ["988 timer", "Stay here"]
      },
      panic_complete: {
        message: "You made it through that wave. I'm still here. Want to stay in this breath or tiny step?",
        quickReplies: ["Breathe more", "Tiny step"]
      },
      mild_offer: {
        message: "I feel that edge with you. What's the main worry showing up right now?",
        placeholder: "What's worrying you?"
      },
      mild_specific: {
        message: "That sounds heavy to carry. Can you name 1 thing that's certain right now? (Feet? Phone? Breath?)",
        placeholder: "What's certain?"
      },
      mild_general: {
        message: "The hum of anxiety. Normal to feel that. What's 1 small thing feeling steady under all this?",
        placeholder: "What feels steady?"
      },
      mild_anchor: {
        message: "Good anchor. Let that worry float next to it. Notice which feels more solid?",
        placeholder: "What feels solid?"
      },
      mild_complete: {
        message: "You're being with it instead of fighting it. That's real progress. What feels steadier now?",
        placeholder: "What feels better?"
      },
      crisis_resources: {
        header: "Resources nearby",
        resources: [
          { name: "988 Suicide & Crisis Lifeline", action: "tel:988", description: "Call or text 988 (US)" },
          { name: "Crisis Text Line", action: "sms:741741&body=HOME", description: "Text HOME to 741741" }
        ],
        closing: "You don't have to face this alone. These humans are ready to listen."
      },
      session_complete: {
        message: "Thank you for being here. You've done hard work. Rest well.",
        quickReplies: ["New session", "Done"]
      }
    }
  },
  completion: {
    subtitle: "Thanks for showing up for yourself."
  }
};
function getConversationNode(node) {
  return COPY.conversation.nodes[node];
}
const MASTER_SESSIONS = {
  // 10-second Circuit Breakers
  "10s-reset": {
    id: "10s-reset",
    label: "The Reset",
    type: "breathing",
    message: "Just this breath. You are safe in this moment.",
    category: "10s",
    color: "#fbbf24",
    bgColor: "#fef3c7",
    phases: [
      {
        id: "inhale-1",
        duration: 4,
        label: "Inhale",
        prompt: "Two quick inhales through the nose",
        instruction: "Inhale... Inhale..."
      },
      {
        id: "hold",
        duration: 2,
        label: "Hold",
        prompt: "Hold the breath briefly",
        instruction: "Hold..."
      },
      {
        id: "exhale",
        duration: 4,
        label: "Exhale",
        prompt: "One long, slow exhale through the mouth",
        instruction: "Exhale..."
      }
    ]
  },
  "10s-anchor": {
    id: "10s-anchor",
    label: "The Anchor",
    type: "physical",
    message: "Drop into your body. You are here now.",
    category: "10s",
    color: "#475569",
    bgColor: "#e2e8f0",
    phases: [
      {
        id: "squeeze",
        duration: 3,
        label: "Squeeze",
        prompt: "Squeeze your shoulders to your ears. Clench your fists.",
        instruction: "Squeeze..."
      },
      {
        id: "release",
        duration: 7,
        label: "Release",
        prompt: "Drop the weight. Let your shoulders fall. Unclench your jaw.",
        instruction: "Drop..."
      }
    ]
  },
  "10s-snap": {
    id: "10s-snap",
    label: "The Sensory Snap",
    type: "sensory",
    message: "Found it? Focus on the color. You are here now.",
    category: "10s",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    phases: [
      {
        id: "find-color",
        duration: 10,
        label: "Find Color",
        prompt: "Find one thing in your room that matches this exact color",
        instruction: "Look around..."
      }
    ]
  },
  "10s-compassion": {
    id: "10s-compassion",
    label: "The Compassionate Touch",
    type: "physical",
    message: "Give yourself this moment of kindness. I am here for you.",
    category: "10s",
    color: "#ec4899",
    bgColor: "#fce7f3",
    phases: [
      {
        id: "touch",
        duration: 10,
        label: "Touch",
        prompt: "Place your hands over your heart. Feel the warmth and rhythm.",
        instruction: "Hand on heart..."
      }
    ]
  },
  "10s-hum": {
    id: "10s-hum",
    label: "The Vagus Hum",
    type: "physical",
    message: "Vibrate into calm. You are safe to rest.",
    category: "10s",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    phases: [
      {
        id: "hum",
        duration: 10,
        label: "Hum",
        prompt: 'Take one breath and hum "Mmm" until the timer hits zero to vibrate the Vagus nerve',
        instruction: "Mmmmmmmm"
      }
    ]
  },
  // 2-minute Perspective Shifts
  "2min-grounding": {
    id: "2min-grounding",
    label: "5-4-3-2-1 Sensory Anchor",
    type: "sensory",
    message: "Your senses are your anchor to the present.",
    category: "2min",
    phases: [
      {
        id: "see",
        duration: 40,
        label: "5 Things You See",
        prompt: "Name 5 things you can see around you",
        instruction: "Look around...",
        icon: "👁️"
      },
      {
        id: "feel",
        duration: 30,
        label: "4 Things You Feel",
        prompt: "Name 4 things you can feel (texture, temperature, pressure)",
        instruction: "Touch something...",
        icon: "✋"
      },
      {
        id: "hear",
        duration: 20,
        label: "3 Things You Hear",
        prompt: "Name 3 things you can hear",
        instruction: "Listen...",
        icon: "👂"
      },
      {
        id: "smell",
        duration: 20,
        label: "2 Things You Smell",
        prompt: "Name 2 things you can smell",
        instruction: "Breathe in...",
        icon: "👃"
      },
      {
        id: "taste",
        duration: 10,
        label: "1 Thing You Taste",
        prompt: "Name 1 thing you can taste",
        instruction: "Notice...",
        icon: "👄"
      }
    ]
  },
  "2min-compassion": {
    id: "2min-compassion",
    label: "Self-Compassion Break",
    type: "cognitive-restructuring",
    message: "You are doing your best with a hard moment.",
    category: "2min",
    phases: [
      {
        id: "mindfulness",
        duration: 40,
        label: "Mindfulness",
        prompt: "This is a moment of suffering. Acknowledge the pain without judgment.",
        instruction: "Notice what you feel..."
      },
      {
        id: "common-humanity",
        duration: 40,
        label: "Common Humanity",
        prompt: "Suffering is part of life. I am not alone in this experience.",
        instruction: "Remember you're not alone..."
      },
      {
        id: "self-kindness",
        duration: 40,
        label: "Self-Kindness",
        prompt: "May I be kind to myself. May I give myself the compassion I need.",
        instruction: "Offer yourself kindness..."
      }
    ]
  },
  "2min-reality": {
    id: "2min-reality",
    label: "Reality Check",
    type: "cognitive-restructuring",
    message: "Let's examine the evidence together.",
    category: "2min",
    phases: [
      {
        id: "identify-thought",
        duration: 30,
        label: "Identify Thought",
        prompt: "What is the thought that's causing distress?",
        instruction: "Name the thought..."
      },
      {
        id: "evidence-for",
        duration: 45,
        label: "Evidence For",
        prompt: "What evidence supports this thought? Be honest and specific.",
        instruction: "List evidence for..."
      },
      {
        id: "evidence-against",
        duration: 45,
        label: "Evidence Against",
        prompt: "What evidence contradicts this thought? What would you tell a friend?",
        instruction: "List evidence against..."
      }
    ]
  },
  // 5-minute Deep Support
  "5min-rain": {
    id: "5min-rain",
    label: "RAIN Method",
    type: "inquiry",
    message: "A 5-minute guided process. Four phases: Recognize, Allow, Investigate, Nurture.",
    category: "5min",
    phases: [
      {
        id: "recognize",
        duration: 60,
        label: "Recognize",
        prompt: 'Label the feeling (e.g., "I am feeling anxious"). Tap bubbles for feelings you notice.',
        instruction: "What am I feeling?"
      },
      {
        id: "allow",
        duration: 60,
        label: "Allow",
        prompt: "Let the feeling exist without trying to fix it. You don't have to change it yet.",
        instruction: "Let it be..."
      },
      {
        id: "investigate",
        duration: 120,
        label: "Investigate",
        prompt: 'Where is this in my body? What is this feeling "saying"? Tap where you feel the sensation.',
        instruction: "Where do I feel this?"
      },
      {
        id: "nurture",
        duration: 60,
        label: "Nurture",
        prompt: "The bubbles transform into warm light. Offer yourself compassion and kindness.",
        instruction: "How can I care for myself?"
      }
    ]
  },
  "5min-safe-space": {
    id: "5min-safe-space",
    label: "Safe Space",
    type: "visualization",
    message: "Create a mental sanctuary where you feel completely safe and at peace.",
    category: "5min",
    phases: [
      {
        id: "describe-place",
        duration: 120,
        label: "Describe Place",
        prompt: "Visualize a safe place (beach, forest, library). What do you see? What is the temperature?",
        instruction: "Imagine your safe place..."
      },
      {
        id: "sensory-layering",
        duration: 120,
        label: "Sensory Layering",
        prompt: "Who is there that loves you? What sounds do you hear? What do you smell?",
        instruction: "Add sensory details..."
      },
      {
        id: "anchor",
        duration: 60,
        label: "Anchor",
        prompt: "Associate this feeling with a physical gesture (like touching your heart). Remember this feeling.",
        instruction: "Create an anchor..."
      }
    ]
  },
  "5min-letter": {
    id: "5min-letter",
    label: "Compassionate Letter",
    type: "writing",
    message: "Write from the perspective of a wise, compassionate friend.",
    category: "5min",
    phases: [
      {
        id: "grounding",
        duration: 60,
        label: "Grounding",
        prompt: "Take 3 deep breaths. Find your center.",
        instruction: "Breathe..."
      },
      {
        id: "writing",
        duration: 180,
        label: "Writing",
        prompt: "If a friend you loved was feeling exactly this way, what would you say to them?",
        instruction: "Write with compassion..."
      },
      {
        id: "read-back",
        duration: 60,
        label: "Read Back",
        prompt: "Read these words back to yourself. They are for you, too.",
        instruction: "Read with kindness..."
      }
    ]
  }
};
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
let userValues = { values: [] };
function checkValuesInInput(input) {
  const matchedValues = [];
  const lowerInput = input.toLowerCase();
  userValues.values.forEach((value) => {
    if (lowerInput.includes(value.toLowerCase())) {
      matchedValues.push(value);
    }
  });
  return matchedValues;
}
let engine = null;
let isLoading = false;
let loadPromise = null;
async function getEngine() {
  if (engine) return engine;
  if (isLoading && loadPromise) {
    await loadPromise;
    return engine;
  }
  isLoading = true;
  loadPromise = (async () => {
    try {
      const { CreateMLCEngine } = await __vitePreload(async () => {
        const { CreateMLCEngine: CreateMLCEngine2 } = await import("./vendor-CBqSsvzT.js").then((n) => n.w);
        return { CreateMLCEngine: CreateMLCEngine2 };
      }, true ? [] : void 0);
      const modelName = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
      engine = await CreateMLCEngine(
        modelName,
        {
          initProgressCallback: (progress) => {
            console.log("Model download progress:", progress.progress, progress.text);
          }
        }
      );
    } catch (error) {
      console.error("Failed to load AI engine:", error);
      engine = null;
      throw error;
    } finally {
      isLoading = false;
    }
  })();
  await loadPromise;
  return engine;
}
function classifyEnergy(input) {
  const lower = input.toLowerCase();
  const panicIndicators = [
    "panic",
    "freaking",
    "freak",
    "can't breathe",
    "heart racing",
    "losing it",
    "losing control",
    "dying",
    "spinning out",
    "spinning",
    "失控",
    "疯狂",
    "hyperventilating",
    "chest tight",
    "can't get air",
    "gonna pass out",
    "terrified",
    "horror",
    "emergency",
    "911",
    "emergency room"
  ];
  const mildIndicators = [
    "anxious",
    "anxiety",
    "worried",
    "worry",
    "nervous",
    "stressed",
    "stress",
    "on edge",
    "edgy",
    "uneasy",
    "uptight",
    "tense",
    "apprehensive",
    "butterflies",
    "nervous stomach",
    "future",
    "what if"
  ];
  const lowIndicators = [
    "tired",
    "exhausted",
    "drained",
    "empty",
    "heavy",
    "numb",
    "nothing",
    "done",
    "can't",
    "no energy",
    "so tired",
    "drained",
    "empty",
    "silence",
    "quiet",
    "just",
    "meh",
    "blah",
    "low",
    "zombie",
    "sleepy",
    "wiped",
    "beat",
    "fried",
    "spent",
    "worn",
    "can't do",
    "too much",
    "over it",
    "checked out",
    " depleted"
  ];
  const highIndicators = [
    "chaos",
    "crazy",
    "overwhelm",
    "overwhelmed",
    "too much",
    "everything",
    "breaking",
    "crashing",
    "falling apart",
    "can't think",
    "mind racing",
    "spinning",
    "intense",
    "out of control",
    "bombarded",
    "swamped",
    "snowed under"
  ];
  for (const indicator of panicIndicators) {
    if (lower.includes(indicator)) return "panic";
  }
  for (const indicator of mildIndicators) {
    if (lower.includes(indicator)) return "mild";
  }
  for (const indicator of lowIndicators) {
    if (lower.includes(indicator)) return "low";
  }
  for (const indicator of highIndicators) {
    if (lower.includes(indicator)) return "high";
  }
  if (lower.includes("swirl") || lower.includes("racing") || lower.includes("busy") || lower.includes("mess")) {
    return "medium";
  }
  return null;
}
function routeToNode(userInput, currentNode, energy, quickReply) {
  const input = quickReply || userInput;
  const lower = input.toLowerCase();
  if (currentNode === "welcome") {
    const energyLevel = classifyEnergy(input);
    if (energyLevel === "low") return "low_energy_offer";
    if (energyLevel === "high") return "high_chaos_offer";
    if (energyLevel === "panic") return "panic_offer";
    if (energyLevel === "mild") return "mild_offer";
    return "medium_swirl_offer";
  }
  if (currentNode === "low_energy_offer") {
    if (lower.includes("yes") || lower.includes("sure") || lower.includes("ok") || lower.includes("guide")) {
      return "low_energy_yes";
    }
    return "low_energy_no";
  }
  if (currentNode === "low_energy_no") {
    if (lower.includes("ready") || lower.includes("blue") || lower.includes("color")) {
      return "low_energy_grounding";
    }
    return "low_energy_grounding";
  }
  if (currentNode === "low_energy_grounding") {
    return "low_energy_complete";
  }
  if (currentNode === "medium_swirl_offer") {
    return "medium_swirl_response";
  }
  if (currentNode === "medium_swirl_response") {
    return "medium_swirl_grounding";
  }
  if (currentNode === "medium_swirl_grounding") {
    return "medium_swirl_complete";
  }
  if (currentNode === "high_chaos_offer") {
    if (lower.includes("can't") || lower.includes("focus")) {
      return "high_chaos_grounding";
    }
    return "high_chaos_grounding";
  }
  if (currentNode === "high_chaos_grounding") {
    if (lower.includes("timer") || lower.includes("pro") || lower.includes("help") || lower.includes("hotline")) {
      return "high_chaos_crisis";
    }
    if (lower.includes("water") || lower.includes("walk") || lower.includes("rest") || lower.includes("journal")) {
      return "high_chaos_tiny_steps";
    }
    return "high_chaos_visualization";
  }
  if (currentNode === "high_chaos_visualization") {
    return "high_chaos_tiny_steps";
  }
  if (currentNode === "high_chaos_tiny_steps") {
    return "high_chaos_complete";
  }
  if (currentNode === "high_chaos_crisis") {
    return "high_chaos_complete";
  }
  if (currentNode === "panic_offer") {
    if (lower.includes("yes") || lower.includes("sure")) {
      return "panic_yes";
    }
    return "panic_no";
  }
  if (currentNode === "panic_yes") {
    return "panic_breath";
  }
  if (currentNode === "panic_no") {
    if (lower.includes("988") || lower.includes("timer") || lower.includes("help")) {
      return "panic_escalate";
    }
    return "panic_no";
  }
  if (currentNode === "panic_breath") {
    return "panic_complete";
  }
  if (currentNode === "panic_escalate") {
    return "panic_complete";
  }
  if (currentNode === "mild_offer") {
    if (lower.includes(" ") && !lower.includes("everything") && !lower.includes("nothing")) {
      return "mild_specific";
    }
    return "mild_general";
  }
  if (currentNode === "mild_specific") {
    return "mild_anchor";
  }
  if (currentNode === "mild_general") {
    return "mild_complete";
  }
  if (currentNode === "mild_anchor") {
    return "mild_complete";
  }
  return currentNode;
}
async function continueConversation(state, userInput, quickReply) {
  try {
    const chatEngine = await getEngine();
    const nextNode = routeToNode(userInput, state.node, state.energy, quickReply);
    const matchedValues = checkValuesInInput(userInput);
    const valuesSection = matchedValues.length > 0 ? `

## Detected Values in User's Input
${matchedValues.join(", ")}

If appropriate, gently connect your suggestion to what matters to them.` : "";
    const systemPrompt = `You are a warm, practical support companion. The user just completed a breathing exercise and shared what's on their mind.

## User's Input
"${userInput}"

## Energy Level
${state.energy}

## Context
- The user selected a "${state.energy}" session
- They took time to breathe first
- They want support with what's above${valuesSection}

## What Good Help Looks Like

When someone shares what's hard, you help them:
1. Feel understood first — they need to feel seen before they can move
2. Find one clear, doable thing — not a list, just one next step
3. Remember they're capable — even when they don't feel it

## Your Voice
- Warm and steady, like a good friend who gets it
- Practical, not preachy
- Short enough to read, long enough to help
- You use "you" and "your" to make it personal

## What To Offer

Depending on what they're dealing with, suggest ONE of these (or something similar):
- "What if you started tomorrow with just X?"
- "One thing that might help right now is..."
- "For the rest of today, try..."
- "A small win you could have today is..."
- "When you're ready, one step toward X could be..."

## Examples of Good Responses

User: "I'm overwhelmed with work"
Good response: "That sounds like a lot to carry. One thing that might help right now is writing down just the top 3 things — then letting the rest wait until tomorrow."

User: "I can't stop worrying about my family"
Good response: "That's heavy to carry. What if you reached out to just one person today, even a short text? Connection can ease the worry."

## What NOT To Do
- Don't give long lists
- Don't say "take it one day at a time" — it's not helpful
- Don't minimize their struggle
- Don't lecture or be preachy

## Important
- Reference what they shared — show you heard them
- Match your response to their energy level (10s = short, 2min/5min = more space)
- If they mention self-harm or suicide, gently mention 988 (US crisis line)

${state.energy === "10s" ? "Keep your response SHORT — under 15 words." : ""}`;
    const contextMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `The user shared: "${userInput}"

Energy level: ${state.energy}

What would be a helpful, warm response?` }
    ];
    const response = await chatEngine.chat.completions.create({
      messages: contextMessages,
      max_tokens: 120,
      temperature: 0.8
    });
    const aiMessage = response.choices[0]?.message?.content || "";
    return {
      message: aiMessage,
      state: {
        node: nextNode,
        energy: state.energy,
        depth: state.depth + 1,
        lastUserInput: userInput
      }
    };
  } catch (error) {
    console.error("AI conversation failed:", error);
    return getFallbackResponse(state, userInput, quickReply);
  }
}
function getFallbackResponse(state, userInput, quickReply) {
  const node = routeToNode(userInput, state.node, state.energy, quickReply);
  const fallbackMessages = {
    welcome: "Pause. What's moving through you? Take your time...",
    low_energy_offer: "That's heavy to carry. You're safe here. Want 1 slow breath with me?",
    low_energy_yes: "Good. Hand on heart? In... 4... hold 4... out 8... What's 1 thing you see nearby?",
    low_energy_no: "That's okay. Here's quiet space. Tap when ready, or name 1 color you see.",
    low_energy_grounding: "Notice that. Now — 4 more things you can see?",
    low_energy_complete: "You're doing this. Rest here as long as you need. I'm with you.",
    medium_swirl_offer: "Sounds swirling — I see you. Name 1 thing you can touch right now?",
    medium_swirl_response: "Feel its texture. Good anchor. What's 1 sound nearby?",
    medium_swirl_grounding: "That grounding. 3 things you can feel? Then 2 you smell? 1 you taste?",
    medium_swirl_complete: "Thoughts passing like clouds. You're here, steady. What feels steady right now?",
    high_chaos_offer: "You're holding so much — here's space to set it down. Safe with me. Hand on heart?",
    high_chaos_grounding: "That's okay, just breathe. What's 1 safe thing under your feet?",
    high_chaos_visualization: "Grounded there. Chaos doesn't own you. Picture a calm place — what do you see?",
    high_chaos_tiny_steps: "This feels big. Name 1 tiny step? Water? Walk? Journal?",
    high_chaos_crisis: "Want hotlines nearby? You're not alone.",
    high_chaos_complete: "You showed up for yourself. That's everything.",
    panic_offer: "I see the panic — you're safe right here with me. Hand on heart. Feet on floor. Can you press your feet down?",
    panic_yes: "Perfect anchor. 1 thing you feel under your fingers?",
    panic_no: "That's alright. You're held here. Notice air on your face? Just the air. In... out...",
    panic_breath: "Good. 1 slow breath with me? In 3... hold 3... out 6. You're pulling through. Name 1 color you see.",
    panic_escalate: "Want a 988 timer or stay in this breath space with me?",
    panic_complete: "You made it through that wave. I'm still here.",
    mild_offer: "I feel that edge with you. What's the main worry showing up right now?",
    mild_specific: "That sounds heavy to carry. Can you name 1 thing that's certain right now?",
    mild_general: "The hum of anxiety. Normal to feel that. What's 1 small thing feeling steady under all this?",
    mild_anchor: "Good anchor. Let that worry float next to it. Notice which feels more solid?",
    mild_complete: "You're being with it instead of fighting it. That's real progress.",
    crisis_resources: "Here are some resources nearby...",
    session_complete: "Thank you for being here. You've done hard work. Rest well."
  };
  return {
    message: fallbackMessages[node] || "I'm here with you. Take your time.",
    state: {
      node,
      energy: state.energy,
      depth: state.depth + 1,
      lastUserInput: userInput
    }
  };
}
async function generateWelcomeMessage() {
  return "Pause. What's moving through you?";
}
const TERMS_VERSION = "1.0.0";
const TERMS_OF_SERVICE = `
# Terms of Service

Last updated: January 2026

## Agreement to Terms

By accessing or using the AC Minds app, you agree to be bound by these Terms of Service and all applicable laws and regulations.

## Use of the App

AC Minds is a mental health support tool designed to provide grounding exercises and emotional check-ins. It is not a replacement for professional mental health care.

## AI and Data

- AI responses are generated locally on your device
- Your conversation history is stored only on your device
- We do not collect, store, or transmit your personal data
- The AI model runs entirely on your device (TinyLlama-1.1B)

## Emergency Notice

If you are experiencing a mental health crisis, please call or text 988 (US) immediately. AC Minds is not designed for emergency response.

## Limitation of Liability

AC Minds is provided "as is" without warranties of any kind. Use at your own discretion.

## Changes to Terms

We may update these terms as the app evolves. Continued use constitutes acceptance of updated terms.

## Contact

Questions about these terms? Contact support@acminds.app
`;
const PRIVACY_POLICY = `
# Privacy Policy

Last updated: January 2026

## Data Collection

AC Minds collects NO personal data. Everything stays on your device.

## What We Don't Collect

- No chat history transmission
- No location tracking
- No user accounts
- No analytics
- No third-party data sharing

## Local Storage

Your conversation history and preferences are stored only in your browser's local storage.

## AI Processing

All AI processing happens locally using WebLLM. Your conversations are never sent to external servers.

## Your Rights

- Delete all data: Use the Clear Data option in Settings
- Export data: Not available (data stays local)
- Request data deletion: Not applicable (no data on servers)

## Children

AC Minds is not designed for use by children under 13.

## Changes

This policy may be updated. Continued use constitutes acceptance.
`;
function hasAgreedToTerms() {
  const agreement = localStorage.getItem("acminds_terms_agreement");
  if (!agreement) return false;
  try {
    const parsed = JSON.parse(agreement);
    return parsed.agreed === true && parsed.version === TERMS_VERSION;
  } catch {
    return false;
  }
}
function agreeToTerms() {
  const agreement = {
    agreed: true,
    agreedAt: (/* @__PURE__ */ new Date()).toISOString(),
    version: TERMS_VERSION
  };
  localStorage.setItem("acminds_terms_agreement", JSON.stringify(agreement));
}
function clearAllData() {
  localStorage.removeItem("grounded_moments");
  localStorage.removeItem("acminds_terms_agreement");
  localStorage.removeItem("acminds_crisis_contacts");
  localStorage.removeItem("theme");
  localStorage.removeItem("user_stats");
}
class EncryptedChatDatabase extends Dexie {
  constructor() {
    super("GroundedChatDB");
    this.version(1).stores({
      sessions: "id, createdAt, dateString, *messages"
    });
  }
}
const db = new EncryptedChatDatabase();
const chatDB = {
  async saveSession(messages, energy, customTitle) {
    const now = Date.now();
    const date = new Date(now);
    const dateString = date.toISOString().split("T")[0];
    const timeString = date.toTimeString().slice(0, 5);
    const title = customTitle || messages[0]?.content.slice(0, 50) || "Chat Session";
    const session = {
      id: v4(),
      title,
      messages: messages.map((m) => ({
        ...m,
        timestamp: now
      })),
      energy,
      createdAt: now,
      updatedAt: now,
      dateString,
      timeString
    };
    await db.sessions.put(session);
    return session.id;
  },
  async updateSession(sessionId, messages) {
    const session = await db.sessions.get(sessionId);
    if (session) {
      session.messages = messages;
      session.updatedAt = Date.now();
      await db.sessions.put(session);
    }
  },
  async getSession(sessionId) {
    return db.sessions.get(sessionId);
  },
  async getAllSessions() {
    return db.sessions.orderBy("createdAt").reverse().toArray();
  },
  async getSessionsByDate(dateString) {
    return db.sessions.where("dateString").equals(dateString).reverse().toArray();
  },
  async getDatesWithSessions() {
    const sessions = await db.sessions.toArray();
    const dates = [...new Set(sessions.map((s) => s.dateString))];
    return dates.sort().reverse();
  },
  async deleteSession(sessionId) {
    await db.sessions.delete(sessionId);
  },
  async clearAllSessions() {
    await db.sessions.clear();
  },
  async getSessionCount() {
    return db.sessions.count();
  },
  async exportSession(sessionId) {
    const session = await db.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");
    const exportData = {
      title: session.title,
      date: session.dateString,
      time: session.timeString,
      messages: session.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString()
      }))
    };
    return JSON.stringify(exportData, null, 2);
  },
  async shareSession(sessionId) {
    const session = await db.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");
    const text = session.messages.map((m) => `${m.role === "user" ? "You" : "AI"}: ${m.content}`).join("\n\n");
    const shareText = `Grounded Chat - ${session.dateString} ${session.timeString}

${text}`;
    if (navigator.share) {
      await navigator.share({
        title: session.title,
        text: shareText
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      throw new Error("Copied to clipboard");
    }
  }
};
const ENERGY_OPTIONS = [
  {
    level: "low",
    label: "Low / Drained",
    description: "Heavy, tired, hard to move.",
    image: "/energy-low.svg"
  },
  {
    level: "medium",
    label: "Medium / Managing",
    description: "Getting through, not great, not awful.",
    image: "/energy-medium.svg"
  },
  {
    level: "high",
    label: "High / Wired",
    description: "On edge, restless, keyed up.",
    image: "/energy-high.svg"
  }
];
const EnergySelection = ({ onSelect }) => {
  const [selectedEnergy, setSelectedEnergy] = React.useState(null);
  const handleClick = (energy) => {
    setSelectedEnergy(energy);
    onSelect(energy);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$g.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$g.header, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: styles$g.title, children: "How is your energy right now?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$g.subtext, children: "Pick one that fits right now. There's no wrong answer." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$g.buttonsContainer, children: ENERGY_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        style: {
          ...styles$g.button,
          ...selectedEnergy === option.level ? styles$g.buttonSelected : {}
        },
        onClick: () => handleClick(option.level),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: option.image, alt: option.label, style: styles$g.buttonImage }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$g.buttonLabel, children: option.label }),
          selectedEnergy === option.level && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$g.description, children: option.description })
        ]
      },
      option.level
    )) })
  ] });
};
const styles$g = {
  container: {
    width: "100%",
    padding: "1rem"
  },
  header: {
    marginBottom: "1.5rem",
    textAlign: "center"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem 0",
    color: "var(--text-primary, #1a1a1a)"
  },
  subtext: {
    fontSize: "0.9rem",
    color: "var(--text-secondary, #666)",
    margin: 0
  },
  buttonsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.75rem",
    width: "100%"
  },
  button: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem 0.5rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    backgroundColor: "var(--bg-card, #ffffff)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    minHeight: "80px",
    gap: "0.5rem"
  },
  buttonImage: {
    width: "48px",
    height: "48px",
    objectFit: "contain"
  },
  buttonSelected: {
    borderColor: "var(--primary-color, #02295b)",
    backgroundColor: "var(--primary-light, #f0f4f8)",
    boxShadow: "0 2px 8px rgba(2, 41, 91, 0.15)"
  },
  buttonLabel: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "var(--text-primary, #1a1a1a)",
    textAlign: "center"
  },
  description: {
    fontSize: "0.75rem",
    color: "var(--text-secondary, #666)",
    marginTop: "0.5rem",
    textAlign: "center",
    fontStyle: "italic"
  }
};
function generateId() {
  return `energy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function getSessionId() {
  let sessionId = sessionStorage.getItem("energyCheckInSessionId");
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem("energyCheckInSessionId", sessionId);
  }
  return sessionId;
}
function clearSessionId() {
  sessionStorage.removeItem("energyCheckInSessionId");
}
async function getUserId() {
  try {
    return sessionStorage.getItem("userId") || localStorage.getItem("userId") || "anonymous";
  } catch {
    return "anonymous";
  }
}
async function saveInteraction(data) {
  try {
    const key = `energy_interaction_${data.id}`;
    sessionStorage.setItem(key, JSON.stringify(data));
    const listKey = "energy_interactions_list";
    const existing = sessionStorage.getItem(listKey);
    const list = existing ? JSON.parse(existing) : [];
    list.push(data.id);
    sessionStorage.setItem(listKey, JSON.stringify(list));
  } catch (error) {
    console.warn("[EnergyTracking] Failed to save interaction:", error);
  }
}
async function logEnergySelection(energyLevel) {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    await saveInteraction({
      id: generateId(),
      timestamp,
      type: "energy_checkin",
      sessionId,
      userId: userId !== "anonymous" ? userId : void 0,
      metadata: JSON.stringify({
        action: "energy_selection",
        energyLevel
      })
    });
  } catch (error) {
    console.error("[EnergyTracking] Error logging energy selection:", error);
  }
}
async function logTechniqueSelection(energyLevel, techniqueId, techniqueName) {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    await saveInteraction({
      id: generateId(),
      timestamp,
      type: "energy_checkin",
      sessionId,
      userId: userId !== "anonymous" ? userId : void 0,
      metadata: JSON.stringify({
        action: "technique_selection",
        energyLevel,
        techniqueId,
        techniqueName
      })
    });
  } catch (error) {
    console.error("[EnergyTracking] Error logging technique selection:", error);
  }
}
async function logTechniqueStart(energyLevel, techniqueId, techniqueName) {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    await saveInteraction({
      id: generateId(),
      timestamp,
      type: "energy_checkin",
      sessionId,
      userId: userId !== "anonymous" ? userId : void 0,
      metadata: JSON.stringify({
        action: "technique_start",
        energyLevel,
        techniqueId,
        techniqueName
      })
    });
  } catch (error) {
    console.error("[EnergyTracking] Error logging technique start:", error);
  }
}
async function logTechniqueComplete(energyLevel, techniqueId, techniqueName, duration, completionStatus = "completed") {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    await saveInteraction({
      id: generateId(),
      timestamp,
      type: "energy_checkin",
      sessionId,
      userId: userId !== "anonymous" ? userId : void 0,
      metadata: JSON.stringify({
        action: "technique_complete",
        energyLevel,
        techniqueId,
        techniqueName,
        duration,
        completionStatus
      })
    });
  } catch (error) {
    console.error("[EnergyTracking] Error logging technique completion:", error);
  }
}
async function logTechniqueRepeat(energyLevel, techniqueId, techniqueName, repeatCount) {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    await saveInteraction({
      id: generateId(),
      timestamp,
      type: "energy_checkin",
      sessionId,
      userId: userId !== "anonymous" ? userId : void 0,
      metadata: JSON.stringify({
        action: "technique_repeat",
        energyLevel,
        techniqueId,
        techniqueName,
        repeatCount
      })
    });
  } catch (error) {
    console.error("[EnergyTracking] Error logging technique repeat:", error);
  }
}
async function logTechniqueDone(energyLevel, techniqueId, techniqueName, totalSessionDuration) {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    await saveInteraction({
      id: generateId(),
      timestamp,
      type: "energy_checkin",
      sessionId,
      userId: userId !== "anonymous" ? userId : void 0,
      metadata: JSON.stringify({
        action: "technique_done",
        energyLevel,
        techniqueId,
        techniqueName,
        totalSessionDuration
      })
    });
    clearSessionId();
  } catch (error) {
    console.error("[EnergyTracking] Error logging technique done:", error);
  }
}
const TechniqueWrapper = ({
  children,
  onComplete,
  onRepeat,
  duration,
  techniqueId,
  techniqueName,
  energyLevel
}) => {
  const [isRunning, setIsRunning] = reactExports.useState(false);
  const [isCompleted, setIsCompleted] = reactExports.useState(false);
  const [restartKey, setRestartKey] = reactExports.useState(0);
  const startTimeRef = reactExports.useRef(null);
  const repeatCountRef = reactExports.useRef(0);
  const sessionStartTimeRef = reactExports.useRef(null);
  const handleStart = () => {
    setIsRunning(true);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = Date.now();
    }
    logTechniqueStart(energyLevel, techniqueId, techniqueName).catch(console.error);
  };
  const handleComplete = () => {
    setIsRunning(false);
    setIsCompleted(true);
    if (startTimeRef.current) {
      const actualDuration = Math.floor((Date.now() - startTimeRef.current) / 1e3);
      logTechniqueComplete(energyLevel, techniqueId, techniqueName, actualDuration, "completed").catch(console.error);
    }
  };
  const handleRepeat = () => {
    repeatCountRef.current += 1;
    setIsRunning(false);
    setIsCompleted(false);
    startTimeRef.current = null;
    logTechniqueRepeat(energyLevel, techniqueId, techniqueName, repeatCountRef.current).catch(console.error);
    setRestartKey((prev) => prev + 1);
    onRepeat?.();
  };
  const handleDone = () => {
    const totalDuration = sessionStartTimeRef.current ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1e3) : 0;
    logTechniqueDone(energyLevel, techniqueId, techniqueName, totalDuration).catch(console.error);
    onComplete();
  };
  reactExports.useEffect(() => {
    if (duration && !isRunning && !isCompleted) {
      handleStart();
      const timer = setTimeout(() => {
        handleComplete();
      }, duration * 1e3);
      return () => clearTimeout(timer);
    }
  }, [duration, isRunning, isCompleted, energyLevel, techniqueId, techniqueName, restartKey]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$f.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$f.content, children }, restartKey),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$f.actions, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          style: styles$f.repeatButton,
          onClick: handleRepeat,
          disabled: !isCompleted && !isRunning,
          children: "Repeat"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          style: styles$f.doneButton,
          onClick: handleDone,
          children: "Done"
        }
      )
    ] })
  ] });
};
const styles$f = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    minHeight: "400px"
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem"
  },
  actions: {
    display: "flex",
    gap: "1rem",
    padding: "1rem",
    justifyContent: "center",
    borderTop: "1px solid var(--border-color, #e0e0e0)"
  },
  repeatButton: {
    padding: "0.75rem 1.5rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    backgroundColor: "var(--bg-card, #ffffff)",
    color: "var(--text-primary, #1a1a1a)",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  doneButton: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "0.5rem",
    backgroundColor: "var(--primary-color, #02295b)",
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.2s ease"
  }
};
const GroundingFlashTechnique = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
  bestFor
}) => {
  const [localPhase, setLocalPhase] = reactExports.useState("inhale");
  const [localCountdown, setLocalCountdown] = reactExports.useState(4);
  const phase = currentPhase ? currentPhase.label.toLowerCase().includes("inhale") ? "inhale" : currentPhase.label.toLowerCase().includes("hold") ? "hold" : "exhale" : localPhase;
  const displayCountdown = countdown !== void 0 ? countdown : localCountdown;
  const instruction = currentPhase?.instruction || (phase === "inhale" ? "Inhale..." : phase === "hold" ? "Hold..." : "Exhale slowly...");
  const message = sessionConfig?.message || "Just this breath. You are safe in this moment.";
  const scale = phase === "inhale" ? 1.2 : phase === "hold" ? 1.2 : 0.3;
  reactExports.useEffect(() => {
    if (countdown === void 0) {
      const timer = setInterval(() => {
        setLocalCountdown((prev) => {
          if (prev <= 0) {
            if (localPhase === "inhale") {
              setLocalPhase("hold");
              return 2;
            } else if (localPhase === "hold") {
              setLocalPhase("exhale");
              return 4;
            } else {
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1e3);
      return () => clearInterval(timer);
    }
  }, [countdown, localPhase]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$e.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$e.iconContainer, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$e.icon, children: "⚡" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        style: styles$e.circle,
        animate: {
          scale
        },
        transition: {
          duration: phase === "inhale" ? 4 : phase === "hold" ? 2 : 4,
          ease: phase === "inhale" ? "easeOut" : phase === "exhale" ? "easeIn" : "linear"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$e.countdown, children: displayCountdown })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$e.instruction, children: instruction }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$e.message, children: message }),
    bestFor && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles$e.bestFor, children: [
      "Best for: ",
      bestFor
    ] })
  ] });
};
const styles$e = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: "300px",
    maxHeight: "calc(100svh - 200px)",
    // Fit between header and footer
    padding: "1rem",
    overflowY: "auto"
  },
  circle: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-color, #02295b)",
    opacity: 0.7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "2rem",
    boxShadow: "0 0 40px rgba(2, 41, 91, 0.3)"
  },
  countdown: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "white"
    // White on colored circle background
  },
  instruction: {
    fontSize: "1.25rem",
    fontWeight: "500",
    color: "var(--text-primary, #1a1a1a)",
    marginBottom: "1rem"
  },
  message: {
    fontSize: "1rem",
    color: "var(--text-secondary, #666)",
    textAlign: "center",
    fontStyle: "italic",
    maxWidth: "300px",
    marginBottom: "0.5rem"
  },
  iconContainer: {
    marginBottom: "1rem"
  },
  icon: {
    fontSize: "2.5rem"
  },
  bestFor: {
    fontSize: "0.85rem",
    color: "var(--text-secondary, #666)",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: "0.5rem",
    opacity: 0.8
  }
};
const WeightDropTechnique = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
  bestFor
}) => {
  const [localPhase, setLocalPhase] = reactExports.useState("squeeze");
  const [localCountdown, setLocalCountdown] = reactExports.useState(3);
  const phase = currentPhase ? currentPhase.label.toLowerCase().includes("squeeze") ? "squeeze" : "release" : localPhase;
  const displayCountdown = countdown !== void 0 ? countdown : localCountdown;
  const getInstruction = () => {
    if (currentPhase?.prompt) return currentPhase.prompt;
    return phase === "squeeze" ? "Squeeze your shoulders to your ears. Clench your fists." : "Drop the weight. Let your shoulders fall.";
  };
  const instruction = getInstruction();
  reactExports.useEffect(() => {
    if (countdown === void 0) {
      const timer = setInterval(() => {
        setLocalCountdown((prev) => {
          if (prev <= 0) {
            if (localPhase === "squeeze") {
              setLocalPhase("release");
              return 7;
            } else {
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1e3);
      return () => clearInterval(timer);
    }
  }, [countdown, localPhase]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$d.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        style: styles$d.rocksContainer,
        animate: {
          y: phase === "squeeze" ? 0 : 150,
          opacity: phase === "squeeze" ? 1 : 0.3
        },
        transition: {
          duration: phase === "release" ? 7 : 0,
          ease: "easeIn"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$d.rockPile, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$d.rockIcon, children: "🪨" }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$d.instructions, children: [
      phase === "squeeze" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$d.instruction, children: instruction }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$d.countdown, children: displayCountdown })
      ] }),
      phase === "release" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$d.instruction, children: instruction }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$d.countdown, children: displayCountdown })
      ] }),
      bestFor && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles$d.bestFor, children: [
        "Best for: ",
        bestFor
      ] })
    ] })
  ] });
};
const styles$d = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    minHeight: "300px",
    maxHeight: "calc(100svh - 200px)",
    // Fit between header and footer
    padding: "1rem",
    overflowY: "auto",
    position: "relative"
  },
  rocksContainer: {
    position: "relative",
    top: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.5rem",
    height: "120px"
  },
  rockPile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "0.25rem",
    position: "relative"
  },
  rockIcon: {
    fontSize: "2.5rem",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
    display: "block",
    transform: "rotate(0deg)"
  },
  instructions: {
    textAlign: "center",
    marginTop: "1rem"
  },
  instruction: {
    fontSize: "1.25rem",
    fontWeight: "500",
    color: "var(--text-primary, #1a1a1a)",
    marginBottom: "1rem"
  },
  countdown: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "var(--primary, #2c5282)"
    // Use CSS variable that adapts to dark mode
  },
  bestFor: {
    fontSize: "0.85rem",
    color: "var(--text-secondary, #666)",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: "0.5rem",
    opacity: 0.8
  }
};
const COLORS = [
  { hex: "#E8F5E9", name: "soft green" },
  { hex: "#E3F2FD", name: "soft blue" },
  { hex: "#FFF3E0", name: "soft peach" },
  { hex: "#F3E5F5", name: "soft lavender" },
  { hex: "#E0F2F1", name: "soft teal" }
];
const SensorySnapTechnique = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
  bestFor
}) => {
  const [selectedColor, setSelectedColor] = reactExports.useState(COLORS[0]);
  const [isVisible, setIsVisible] = reactExports.useState(false);
  const [localCountdown, setLocalCountdown] = reactExports.useState(10);
  const displayCountdown = countdown !== void 0 ? countdown : localCountdown;
  reactExports.useEffect(() => {
    setIsVisible(true);
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    setSelectedColor(COLORS[randomIndex]);
  }, []);
  reactExports.useEffect(() => {
    if (countdown === void 0) {
      const timer = setInterval(() => {
        setLocalCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
      return () => clearInterval(timer);
    }
  }, [countdown]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      style: styles$c.container,
      initial: { opacity: 0 },
      animate: { opacity: isVisible ? 1 : 0 },
      transition: { duration: 1, ease: "easeIn" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$c.iconContainer, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$c.icon, children: "👌" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          ...styles$c.colorDisplay,
          backgroundColor: selectedColor.hex
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$c.colorCircle }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$c.content, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { style: styles$c.prompt, children: [
            "Find one thing in your room that is ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: styles$c.colorName, children: selectedColor.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$c.countdownContainer, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$c.countdown, children: displayCountdown }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$c.message, children: "Found it? Focus on the color. You are here now." }),
          bestFor && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles$c.bestFor, children: [
            "Best for: ",
            bestFor
          ] })
        ] })
      ]
    }
  );
};
const styles$c = {
  container: {
    width: "100%",
    minHeight: "300px",
    maxHeight: "calc(100svh - 200px)",
    // Fit between header and footer
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "1rem",
    overflowY: "auto"
  },
  colorDisplay: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "2rem",
    border: "3px solid rgba(255, 255, 255, 0.8)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  },
  colorCircle: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.3)"
  },
  content: {
    textAlign: "center",
    width: "100%"
  },
  prompt: {
    fontSize: "1.1rem",
    fontWeight: "500",
    color: "var(--text-primary, #1a1a1a)",
    marginBottom: "1.5rem",
    lineHeight: "1.5"
  },
  colorName: {
    color: "var(--primary-color, #02295b)",
    fontWeight: "600"
  },
  countdownContainer: {
    marginBottom: "1.5rem"
  },
  countdown: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "var(--primary, #2c5282)"
    // Use CSS variable that adapts to dark mode
  },
  message: {
    fontSize: "0.95rem",
    color: "var(--text-secondary, #666)",
    fontStyle: "italic",
    lineHeight: "1.5",
    marginBottom: "0.5rem"
  },
  iconContainer: {
    marginBottom: "1rem"
  },
  icon: {
    fontSize: "2.5rem"
  },
  bestFor: {
    fontSize: "0.85rem",
    color: "var(--text-secondary, #666)",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: "0.5rem",
    opacity: 0.8
  }
};
const CompassionateTouchTechnique = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
  bestFor
}) => {
  const [localCountdown, setLocalCountdown] = React.useState(10);
  const [isRunning, setIsRunning] = React.useState(false);
  const displayCountdown = countdown !== void 0 ? countdown : localCountdown;
  const instruction = currentPhase?.prompt || "Place your hands over your heart. Feel the warmth and rhythm.";
  const message = sessionConfig?.message || "Give yourself this moment of kindness. I am here for you.";
  React.useEffect(() => {
    if (countdown === void 0 && !isRunning) {
      setIsRunning(true);
      const timer = setInterval(() => {
        setLocalCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
      return () => clearInterval(timer);
    }
  }, [countdown, isRunning]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$b.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        style: styles$b.handsOverHeart,
        animate: {
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        },
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$b.handsContainer, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$b.handIcon, children: "🤲" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$b.heartIcon, children: "❤️" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$b.instructions, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$b.instruction, children: instruction }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$b.countdown, children: displayCountdown }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$b.message, children: message }),
      bestFor && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles$b.bestFor, children: [
        "Best for: ",
        bestFor
      ] })
    ] })
  ] });
};
const styles$b = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    minHeight: "300px",
    maxHeight: "calc(100svh - 200px)",
    // Fit between header and footer
    padding: "1rem",
    overflowY: "auto"
  },
  handsOverHeart: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: "2rem",
    width: "150px",
    height: "150px"
  },
  handsContainer: {
    position: "absolute",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 2
  },
  handIcon: {
    fontSize: "4rem",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
  },
  heartIcon: {
    fontSize: "5rem",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1,
    filter: "drop-shadow(0 0 10px rgba(236, 72, 153, 0.4))"
  },
  instructions: {
    textAlign: "center"
  },
  instruction: {
    fontSize: "1rem",
    color: "var(--text-primary, #1a1a1a)",
    marginBottom: "1rem",
    maxWidth: "300px"
  },
  countdown: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "var(--primary, #2c5282)",
    // Use CSS variable that adapts to dark mode
    marginBottom: "1rem"
  },
  message: {
    fontSize: "1rem",
    color: "var(--text-secondary, #666)",
    fontStyle: "italic",
    maxWidth: "300px",
    marginBottom: "0.5rem"
  },
  bestFor: {
    fontSize: "0.85rem",
    color: "var(--text-secondary, #666)",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: "0.5rem",
    opacity: 0.8
  }
};
const TECHNIQUES$2 = [
  {
    id: "grounding-flash",
    name: "The Grounding Flash",
    description: "Breath-Led",
    icon: "⚡",
    bestFor: 'Feeling "tight" or panicked'
  },
  {
    id: "weight-drop",
    name: "The Weight Drop",
    description: "Body-Led",
    icon: "🪨",
    bestFor: 'High irritability, clenched teeth, or "on-edge" feeling'
  },
  {
    id: "sensory-snap",
    name: "The Sensory Snap",
    description: "Senses-Led",
    icon: "👌",
    bestFor: 'Dissociation, "spacing out," or intense rumination'
  },
  {
    id: "compassionate-touch",
    name: "The Compassionate Touch",
    description: "Emotional-Led",
    icon: "🤗",
    bestFor: 'Self-loathing, shame spirals, or feeling "unraveled"'
  }
];
const LowEnergyTechniques = ({
  selectedTechnique,
  onTechniqueSelect,
  onComplete
}) => {
  if (selectedTechnique) {
    const technique = TECHNIQUES$2.find((t) => t.id === selectedTechnique);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      TechniqueWrapper,
      {
        techniqueId: selectedTechnique,
        techniqueName: technique?.name || "",
        energyLevel: "low",
        duration: 10,
        onComplete,
        children: [
          selectedTechnique === "grounding-flash" && /* @__PURE__ */ jsxRuntimeExports.jsx(GroundingFlashTechnique, { bestFor: technique?.bestFor }),
          selectedTechnique === "weight-drop" && /* @__PURE__ */ jsxRuntimeExports.jsx(WeightDropTechnique, { bestFor: technique?.bestFor }),
          selectedTechnique === "sensory-snap" && /* @__PURE__ */ jsxRuntimeExports.jsx(SensorySnapTechnique, { bestFor: technique?.bestFor }),
          selectedTechnique === "compassionate-touch" && /* @__PURE__ */ jsxRuntimeExports.jsx(CompassionateTouchTechnique, { bestFor: technique?.bestFor })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$a.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$a.subtext, children: "Quick interventions to shift perspective." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$a.optionsGrid, children: TECHNIQUES$2.map((technique) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        style: styles$a.optionButton,
        onClick: () => onTechniqueSelect(technique.id),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$a.optionHeader, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$a.optionIcon, children: technique.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: styles$a.optionName, children: technique.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$a.optionType, children: technique.description })
        ] })
      },
      technique.id
    )) })
  ] });
};
const styles$a = {
  container: {
    width: "100%",
    padding: "1rem"
  },
  subtext: {
    fontSize: "0.9rem",
    color: "var(--text-secondary, #666)",
    textAlign: "center",
    marginBottom: "1.5rem",
    fontStyle: "italic"
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.5rem"
    // Tighter gap to match app style
  },
  optionButton: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 12px",
    // Compact padding to match app style
    border: "1px solid var(--border, rgba(0,0,0,0.1))",
    borderRadius: "12px",
    // Match app button border radius
    backgroundColor: "var(--bg-card, #ffffff)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
    alignItems: "center",
    minHeight: "auto"
    // Remove fixed height
  },
  optionHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.2rem"
  },
  optionIcon: {
    fontSize: "1.5rem",
    // Smaller icon
    marginBottom: "0.2rem"
  },
  optionName: {
    fontSize: "0.8rem",
    // Smaller font to match app style
    fontWeight: "600",
    margin: 0,
    color: "var(--text-primary, #1a1a1a)"
  },
  optionType: {
    fontSize: "0.65rem",
    // Smaller font
    color: "var(--text-secondary, #666)",
    fontStyle: "italic"
  }
};
const ThoughtStreamTechnique = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig
}) => {
  const [thoughts, setThoughts] = reactExports.useState([]);
  const [inputValue, setInputValue] = reactExports.useState("");
  const [leaves, setLeaves] = reactExports.useState([]);
  const containerRef = reactExports.useRef(null);
  const thoughtIdRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    const createLeaf = () => {
      const id = `leaf-${Date.now()}-${Math.random()}`;
      const x = Math.random() * 100;
      return { id, x, y: -10 };
    };
    const interval = setInterval(() => {
      setLeaves((prev) => {
        const newLeaves = [...prev, createLeaf()];
        return newLeaves.filter((leaf) => leaf.y < 110);
      });
    }, 2e3);
    const animateLeaves = setInterval(() => {
      setLeaves(
        (prev) => prev.map((leaf) => ({
          ...leaf,
          y: leaf.y + 0.5
        }))
      );
    }, 50);
    return () => {
      clearInterval(interval);
      clearInterval(animateLeaves);
    };
  }, []);
  const handleAddThought = () => {
    if (!inputValue.trim()) return;
    const newThought = {
      id: `thought-${thoughtIdRef.current++}`,
      text: inputValue,
      x: Math.random() * 80 + 10,
      y: Math.random() * 40 + 20,
      onLeaf: false
    };
    setThoughts((prev) => [...prev, newThought]);
    setInputValue("");
  };
  const handleDragEnd = (thoughtId, event) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (event.x - rect.left) / rect.width * 100;
    const y = (event.y - rect.top) / rect.height * 100;
    const nearbyLeaf = leaves.find((leaf) => Math.abs(leaf.x - x) < 5 && Math.abs(leaf.y - y) < 10);
    if (nearbyLeaf) {
      setThoughts(
        (prev) => prev.map(
          (thought) => thought.id === thoughtId ? { ...thought, onLeaf: true, x: nearbyLeaf.x, y: nearbyLeaf.y } : thought
        )
      );
    } else {
      setThoughts(
        (prev) => prev.map((thought) => thought.id === thoughtId ? { ...thought, x, y } : thought)
      );
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$9.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles$9.title, children: "Leaves on a Stream" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$9.instruction, children: "Type a thought and drag it onto a floating leaf. Watch it float away." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$9.inputContainer, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: inputValue,
          onChange: (e) => setInputValue(e.target.value),
          onKeyPress: (e) => e.key === "Enter" && handleAddThought(),
          placeholder: "Type a thought...",
          style: styles$9.input
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAddThought, style: styles$9.addButton, children: "Add" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, style: styles$9.streamContainer, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$9.river }),
      leaves.map((leaf) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          style: {
            ...styles$9.leaf,
            left: `${leaf.x}%`,
            top: `${leaf.y}%`
          },
          animate: {
            y: [0, -5, 0],
            rotate: [0, 5, -5, 0]
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          children: "🍃"
        },
        leaf.id
      )),
      thoughts.map((thought) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          style: {
            ...styles$9.thought,
            left: `${thought.x}%`,
            top: `${thought.y}%`,
            opacity: thought.onLeaf ? 0.7 : 1
          },
          drag: true,
          dragMomentum: false,
          onDragEnd: (e, info) => handleDragEnd(thought.id, info),
          animate: {
            y: thought.onLeaf ? [0, -100] : 0,
            opacity: thought.onLeaf ? [1, 0] : 1
          },
          transition: {
            y: { duration: 3 },
            opacity: { duration: 3 }
          },
          children: thought.text
        },
        thought.id
      ))
    ] })
  ] });
};
const styles$9 = {
  container: {
    width: "100%",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxHeight: "calc(100svh - 200px)",
    // Fit between header and footer
    overflowY: "auto"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "var(--text-primary, #1a1a1a)"
  },
  instruction: {
    fontSize: "0.9rem",
    color: "var(--text-secondary, #666)",
    marginBottom: "1rem",
    textAlign: "center"
  },
  inputContainer: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    width: "100%",
    maxWidth: "400px"
  },
  input: {
    flex: 1,
    padding: "0.75rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    fontSize: "1rem"
  },
  addButton: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "0.5rem",
    backgroundColor: "var(--primary-color, #02295b)",
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600"
  },
  streamContainer: {
    width: "100%",
    height: "400px",
    position: "relative",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    overflow: "hidden"
  },
  river: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(to bottom, #e3f2fd, #90caf9)",
    opacity: 0.3
  },
  leaf: {
    position: "absolute",
    fontSize: "2rem",
    pointerEvents: "none"
  },
  thought: {
    position: "absolute",
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "2px solid var(--primary-color, #02295b)",
    borderRadius: "1rem",
    fontSize: "0.9rem",
    cursor: "grab",
    maxWidth: "150px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
  }
};
const KIND_PHRASES = [
  "May I be kind to myself",
  "May I accept myself as I am",
  "May I give myself the compassion I need",
  "May I be patient with myself"
];
const SelfCompassionBreakTechnique = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig
}) => {
  const [localStage, setLocalStage] = reactExports.useState(0);
  const [localTimeRemaining, setLocalTimeRemaining] = reactExports.useState(40);
  const [selectedPhrase, setSelectedPhrase] = reactExports.useState(null);
  const [breathPhase, setBreathPhase] = reactExports.useState("in");
  const displayCountdown = countdown !== void 0 ? countdown : localTimeRemaining;
  const currentStageIndex = phaseIndex !== void 0 ? phaseIndex : localStage;
  const stageName = currentPhase?.label || (currentStageIndex === 0 ? "Mindfulness" : currentStageIndex === 1 ? "Common Humanity" : "Self-Kindness");
  const instruction = currentPhase?.prompt || (currentStageIndex === 0 ? 'Labeling the pain: "This is a moment of suffering"' : currentStageIndex === 1 ? '"Suffering is part of life; I am not alone"' : "Select a kind phrase to repeat");
  reactExports.useEffect(() => {
    if (countdown === void 0) {
      const timer = setInterval(() => {
        setLocalTimeRemaining((prev) => {
          if (prev <= 1) {
            if (localStage < 2) {
              setLocalStage((s) => s + 1);
              return 40;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
      const breathTimer = setInterval(() => {
        setBreathPhase((prev) => prev === "in" ? "out" : "in");
      }, 3e3);
      return () => {
        clearInterval(timer);
        clearInterval(breathTimer);
      };
    } else {
      const breathTimer = setInterval(() => {
        setBreathPhase((prev) => prev === "in" ? "out" : "in");
      }, 3e3);
      return () => clearInterval(breathTimer);
    }
  }, [countdown, localStage]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$8.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        style: styles$8.heart,
        animate: {
          scale: breathPhase === "in" ? 1.1 : 1
        },
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$8.heartIcon, children: "💗" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$8.stageInfo, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles$8.stageName, children: stageName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$8.instruction, children: instruction }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles$8.timer, children: [
        displayCountdown,
        "s"
      ] })
    ] }),
    currentStageIndex === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$8.phrasesContainer, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$8.phrasesLabel, children: "Select a phrase:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$8.phrasesGrid, children: KIND_PHRASES.map((phrase) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          style: {
            ...styles$8.phraseButton,
            ...selectedPhrase === phrase ? styles$8.phraseButtonSelected : {}
          },
          onClick: () => setSelectedPhrase(phrase),
          children: phrase
        },
        phrase
      )) }),
      selectedPhrase && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles$8.repeatPhrase, children: [
        'Repeat: "',
        selectedPhrase,
        '"'
      ] })
    ] })
  ] });
};
const styles$8 = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: "300px",
    maxHeight: "calc(100svh - 200px)",
    // Fit between header and footer
    padding: "1rem",
    overflowY: "auto"
  },
  heart: {
    width: "120px",
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    filter: "drop-shadow(0 0 20px rgba(236, 72, 153, 0.5))",
    marginBottom: "2rem"
  },
  heartIcon: {
    fontSize: "4rem"
  },
  stageInfo: {
    textAlign: "center",
    marginBottom: "1.5rem"
  },
  stageName: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "var(--text-primary, #1a1a1a)",
    marginBottom: "0.5rem"
  },
  instruction: {
    fontSize: "1rem",
    color: "var(--text-secondary, #666)",
    marginBottom: "1rem",
    fontStyle: "italic"
  },
  timer: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "var(--primary, #2c5282)"
    // Use CSS variable that adapts to dark mode
  },
  phrasesContainer: {
    width: "100%",
    maxWidth: "400px",
    marginTop: "1rem"
  },
  phrasesLabel: {
    fontSize: "0.9rem",
    color: "var(--text-secondary, #666)",
    marginBottom: "0.5rem",
    textAlign: "center"
  },
  phrasesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.5rem",
    marginBottom: "1rem"
  },
  phraseButton: {
    padding: "0.75rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    backgroundColor: "var(--bg-card, #ffffff)",
    cursor: "pointer",
    fontSize: "0.85rem",
    textAlign: "center",
    transition: "all 0.2s ease"
  },
  phraseButtonSelected: {
    borderColor: "var(--primary-color, #02295b)",
    backgroundColor: "var(--primary-light, #f0f4f8)"
  },
  repeatPhrase: {
    fontSize: "1rem",
    color: "var(--primary-color, #02295b)",
    textAlign: "center",
    fontWeight: "500",
    fontStyle: "italic"
  }
};
const RealityCheckTechnique = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig
}) => {
  const [thought, setThought] = reactExports.useState("");
  const [evidenceFor, setEvidenceFor] = reactExports.useState([]);
  const [evidenceAgainst, setEvidenceAgainst] = reactExports.useState([]);
  const [currentEvidence, setCurrentEvidence] = reactExports.useState("");
  const [evidenceType, setEvidenceType] = reactExports.useState("for");
  const handleAddEvidence = () => {
    if (!currentEvidence.trim()) return;
    if (evidenceType === "for") {
      setEvidenceFor((prev) => [...prev, currentEvidence]);
    } else {
      setEvidenceAgainst((prev) => [...prev, currentEvidence]);
    }
    setCurrentEvidence("");
  };
  const balance = evidenceFor.length - evidenceAgainst.length;
  const rotation = Math.max(-15, Math.min(15, balance * 3));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$7.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles$7.title, children: "Evidence Trial" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$7.questionSection, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: styles$7.label, children: "What is the thought?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: thought,
          onChange: (e) => setThought(e.target.value),
          placeholder: "Type your thought here...",
          style: styles$7.textarea
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$7.scaleContainer, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        style: styles$7.scale,
        animate: {
          rotate: rotation
        },
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 10
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$7.scaleLeft, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$7.scaleLabel, children: "For" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$7.scaleCount, children: evidenceFor.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$7.scaleCenter, children: "⚖️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$7.scaleRight, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$7.scaleLabel, children: "Against" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$7.scaleCount, children: evidenceAgainst.length })
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$7.evidenceSection, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$7.evidenceTypeSelector, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            style: {
              ...styles$7.typeButton,
              ...evidenceType === "for" ? styles$7.typeButtonActive : {}
            },
            onClick: () => setEvidenceType("for"),
            children: "Evidence For"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            style: {
              ...styles$7.typeButton,
              ...evidenceType === "against" ? styles$7.typeButtonActive : {}
            },
            onClick: () => setEvidenceType("against"),
            children: "Evidence Against"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$7.evidenceInput, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: currentEvidence,
            onChange: (e) => setCurrentEvidence(e.target.value),
            onKeyPress: (e) => e.key === "Enter" && handleAddEvidence(),
            placeholder: `Add evidence ${evidenceType === "for" ? "for" : "against"}...`,
            style: styles$7.input
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAddEvidence, style: styles$7.addButton, children: "Add" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$7.evidenceLists, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$7.evidenceList, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: styles$7.evidenceListTitle, children: "Evidence For:" }),
          evidenceFor.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$7.evidenceItem, children: item }, index))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$7.evidenceList, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: styles$7.evidenceListTitle, children: "Evidence Against:" }),
          evidenceAgainst.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$7.evidenceItem, children: item }, index))
        ] })
      ] })
    ] })
  ] });
};
const styles$7 = {
  container: {
    width: "100%",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxHeight: "calc(100svh - 200px)",
    // Fit between header and footer
    overflowY: "auto"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    textAlign: "center",
    color: "var(--text-primary, #1a1a1a)"
  },
  questionSection: {
    width: "100%"
  },
  label: {
    display: "block",
    fontSize: "1rem",
    fontWeight: "500",
    marginBottom: "0.5rem",
    color: "var(--text-primary, #1a1a1a)"
  },
  textarea: {
    width: "100%",
    minHeight: "80px",
    padding: "0.75rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    fontFamily: "inherit"
  },
  scaleContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "1rem 0"
  },
  scale: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
    transformOrigin: "center"
  },
  scaleLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  scaleRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  scaleCenter: {
    fontSize: "2.5rem"
  },
  scaleLabel: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "var(--text-secondary, #666)"
  },
  scaleCount: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "var(--primary, #2c5282)"
    // Use CSS variable that adapts to dark mode
  },
  evidenceSection: {
    width: "100%"
  },
  evidenceTypeSelector: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem"
  },
  typeButton: {
    flex: 1,
    padding: "0.75rem",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    backgroundColor: "var(--bg-card, #ffffff)",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  typeButtonActive: {
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "var(--primary-color, #02295b)",
    backgroundColor: "var(--primary-light, #f0f4f8)",
    color: "var(--primary-color, #02295b)"
  },
  evidenceInput: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem"
  },
  input: {
    flex: 1,
    padding: "0.75rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    fontSize: "1rem"
  },
  addButton: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "0.5rem",
    backgroundColor: "var(--primary-color, #02295b)",
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600"
  },
  evidenceLists: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem"
  },
  evidenceList: {
    padding: "1rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    backgroundColor: "var(--bg-card, #ffffff)"
  },
  evidenceListTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "0.5rem",
    color: "var(--text-primary, #1a1a1a)"
  },
  evidenceItem: {
    padding: "0.5rem",
    marginBottom: "0.25rem",
    backgroundColor: "var(--bg-primary, #fafaf9)",
    borderRadius: "0.25rem",
    fontSize: "0.9rem",
    color: "var(--text-primary, #1a1a1a)"
  }
};
const TECHNIQUES$1 = [
  {
    id: "thought-stream",
    name: "The Thought Stream",
    description: "Defusion",
    bestFor: 'Overthinking or "Sticky" thoughts',
    image: "/exercise-thought-stream.svg"
  },
  {
    id: "self-compassion-break",
    name: "The Self-Compassion Break",
    description: "Based on Dr. Kristin Neff's work",
    bestFor: 'Self-criticism or "not enough-ness"',
    image: "/exercise-self-compassion.svg"
  },
  {
    id: "reality-check",
    name: "The Reality Check",
    description: "Cognitive Distortions",
    bestFor: "Catastrophizing",
    image: "/exercise-reality-check.svg"
  }
];
const MediumEnergyTechniques = ({
  selectedTechnique,
  onTechniqueSelect,
  onComplete
}) => {
  if (selectedTechnique) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      TechniqueWrapper,
      {
        techniqueId: selectedTechnique,
        techniqueName: TECHNIQUES$1.find((t) => t.id === selectedTechnique)?.name || "",
        energyLevel: "medium",
        duration: 120,
        onComplete,
        children: [
          selectedTechnique === "thought-stream" && /* @__PURE__ */ jsxRuntimeExports.jsx(ThoughtStreamTechnique, {}),
          selectedTechnique === "self-compassion-break" && /* @__PURE__ */ jsxRuntimeExports.jsx(SelfCompassionBreakTechnique, {}),
          selectedTechnique === "reality-check" && /* @__PURE__ */ jsxRuntimeExports.jsx(RealityCheckTechnique, {})
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$6.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$6.subtext, children: "Quick interventions to shift the nervous system or cognitive perspective." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$6.optionsGrid, children: TECHNIQUES$1.map((technique) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        style: styles$6.optionButton,
        onClick: () => onTechniqueSelect(technique.id),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$6.optionHeader, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: technique.image, alt: technique.name, style: styles$6.optionImage }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: styles$6.optionName, children: technique.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$6.optionType, children: technique.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles$6.optionBestFor, children: [
            "Best For: ",
            technique.bestFor
          ] })
        ]
      },
      technique.id
    )) })
  ] });
};
const styles$6 = {
  container: {
    width: "100%",
    padding: "1rem"
  },
  subtext: {
    fontSize: "0.9rem",
    color: "var(--text-secondary, #666)",
    textAlign: "center",
    marginBottom: "1.5rem",
    fontStyle: "italic"
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1, 1fr)",
    gap: "1rem"
  },
  optionButton: {
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    backgroundColor: "var(--bg-card, #ffffff)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left"
  },
  optionHeader: {
    marginBottom: "0.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem"
  },
  optionImage: {
    width: "40px",
    height: "40px",
    objectFit: "contain"
  },
  optionName: {
    fontSize: "1rem",
    fontWeight: "600",
    margin: "0 0 0.25rem 0",
    color: "var(--text-primary, #1a1a1a)"
  },
  optionType: {
    fontSize: "0.75rem",
    color: "var(--text-secondary, #666)",
    fontStyle: "italic"
  },
  optionBestFor: {
    fontSize: "0.85rem",
    color: "var(--text-secondary, #666)",
    margin: 0
  }
};
const FEELING_BUBBLES = ["Fear", "Heavy", "Tight", "Angry", "Sad", "Anxious", "Overwhelmed"];
const BODY_PARTS = ["chest", "throat", "stomach", "shoulders", "head", "hands"];
const RAINMethodTechnique = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig
}) => {
  const [localStage, setLocalStage] = reactExports.useState(0);
  const [localTimeRemaining, setLocalTimeRemaining] = reactExports.useState(60);
  const currentStageIndex = phaseIndex !== void 0 ? phaseIndex : localStage;
  const displayCountdown = countdown !== void 0 ? countdown : localTimeRemaining;
  const stageName = currentPhase?.label || (currentStageIndex === 0 ? "Recognize" : currentStageIndex === 1 ? "Allow" : currentStageIndex === 2 ? "Investigate" : "Nurture");
  const instruction = currentPhase?.prompt || (currentStageIndex === 0 ? "Tap bubbles for feelings you notice" : currentStageIndex === 1 ? "Let it be. You don't have to change it yet." : currentStageIndex === 2 ? "Tap where you feel the sensation in your body" : "The bubbles transform into warm light");
  const [selectedFeelings, setSelectedFeelings] = reactExports.useState([]);
  const [selectedBodyParts, setSelectedBodyParts] = reactExports.useState([]);
  const [bubbles, setBubbles] = reactExports.useState([]);
  const [showBody, setShowBody] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (countdown === void 0) {
      const timer = setInterval(() => {
        setLocalTimeRemaining((prev) => {
          if (prev <= 1) {
            if (localStage < 3) {
              const nextStage = localStage + 1;
              setLocalStage(nextStage);
              if (nextStage === 2) {
                setShowBody(true);
              }
              if (nextStage === 3) {
                setShowBody(false);
              }
              return nextStage === 0 ? 60 : nextStage === 1 ? 60 : nextStage === 2 ? 120 : 60;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
      return () => clearInterval(timer);
    } else {
      if (currentStageIndex === 2) {
        setShowBody(true);
      } else if (currentStageIndex === 3) {
        setShowBody(false);
      }
    }
  }, [countdown, localStage, currentStageIndex]);
  reactExports.useEffect(() => {
    if (currentStageIndex === 0) {
      const createBubble = () => {
        const id = `bubble-${Date.now()}-${Math.random()}`;
        const label = FEELING_BUBBLES[Math.floor(Math.random() * FEELING_BUBBLES.length)];
        return {
          id,
          label,
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20
        };
      };
      const bubbleInterval = setInterval(() => {
        setBubbles((prev) => {
          if (prev.length < 8) {
            return [...prev, createBubble()];
          }
          return prev;
        });
      }, 2e3);
      return () => clearInterval(bubbleInterval);
    } else {
      setBubbles([]);
    }
  }, [currentStageIndex]);
  const handleBubbleClick = (label) => {
    if (currentStageIndex === 0 && !selectedFeelings.includes(label)) {
      setSelectedFeelings((prev) => [...prev, label]);
    }
  };
  const handleBodyPartClick = (part) => {
    if (currentStageIndex === 2 && !selectedBodyParts.includes(part)) {
      setSelectedBodyParts((prev) => [...prev, part]);
    }
  };
  const minutes = Math.floor(displayCountdown / 60);
  const seconds = displayCountdown % 60;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$5.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles$5.stageName, children: stageName }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$5.instruction, children: instruction }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles$5.timer, children: [
      minutes,
      ":",
      seconds.toString().padStart(2, "0")
    ] }),
    currentStageIndex === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$5.bubblesContainer, children: bubbles.map((bubble) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.button,
      {
        style: {
          ...styles$5.bubble,
          ...selectedFeelings.includes(bubble.label) ? styles$5.bubbleSelected : {},
          left: `${bubble.x}%`,
          top: `${bubble.y}%`
        },
        onClick: () => handleBubbleClick(bubble.label),
        animate: {
          y: [0, -10, 0],
          scale: selectedFeelings.includes(bubble.label) ? 1.2 : 1
        },
        transition: {
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.2 }
        },
        children: bubble.label
      },
      bubble.id
    )) }),
    currentStageIndex === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$5.allowContainer, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          style: styles$5.dimmedScreen,
          animate: { opacity: 0.5 },
          transition: { duration: 1 }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$5.allowText, children: "Let it be. You don't have to change it yet." })
    ] }),
    currentStageIndex === 2 && showBody && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$5.bodyContainer, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$5.bodySilhouette, children: BODY_PARTS.map((part, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        style: {
          ...styles$5.bodyPart,
          ...selectedBodyParts.includes(part) ? styles$5.bodyPartSelected : {},
          ...getBodyPartPosition(part)
        },
        onClick: () => handleBodyPartClick(part),
        children: part
      },
      part
    )) }) }),
    currentStageIndex === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        style: styles$5.nurtureContainer,
        animate: {
          background: "radial-gradient(circle, rgba(255, 193, 7, 0.3), rgba(255, 193, 7, 0.1))"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$5.nurtureText, children: "Warm light moves toward you" })
      }
    )
  ] });
};
const getBodyPartPosition = (part) => {
  const positions = {
    chest: { top: "40%", left: "50%", transform: "translateX(-50%)" },
    throat: { top: "25%", left: "50%", transform: "translateX(-50%)" },
    stomach: { top: "55%", left: "50%", transform: "translateX(-50%)" },
    shoulders: { top: "30%", left: "50%", transform: "translateX(-50%)", width: "60%" },
    head: { top: "10%", left: "50%", transform: "translateX(-50%)" },
    hands: { top: "70%", left: "50%", transform: "translateX(-50%)", width: "40%" }
  };
  return positions[part] || {};
};
const styles$5 = {
  container: {
    width: "100%",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "300px",
    maxHeight: "calc(100svh - 200px)",
    // Fit between header and footer
    overflowY: "auto"
  },
  stageName: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "var(--text-primary, #1a1a1a)"
  },
  instruction: {
    fontSize: "1rem",
    color: "var(--text-secondary, #666)",
    marginBottom: "1rem",
    textAlign: "center"
  },
  timer: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "var(--primary, #2c5282)",
    // Use CSS variable that adapts to dark mode
    marginBottom: "2rem"
  },
  bubblesContainer: {
    position: "relative",
    width: "100%",
    height: "300px"
  },
  bubble: {
    position: "absolute",
    padding: "0.75rem 1.25rem",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "2px solid var(--primary-color, #02295b)",
    borderRadius: "2rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
  },
  bubbleSelected: {
    backgroundColor: "var(--primary-light, #f0f4f8)",
    borderColor: "var(--primary-color, #02295b)"
  },
  allowContainer: {
    width: "100%",
    height: "300px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  dimmedScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)"
  },
  allowText: {
    position: "relative",
    zIndex: 10,
    fontSize: "1.25rem",
    color: "white",
    textAlign: "center",
    fontWeight: "500"
  },
  bodyContainer: {
    width: "100%",
    height: "400px",
    position: "relative"
  },
  bodySilhouette: {
    width: "200px",
    height: "400px",
    margin: "0 auto",
    position: "relative",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: "100px"
  },
  bodyPart: {
    position: "absolute",
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "2px solid var(--primary-color, #02295b)",
    borderRadius: "1rem",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500"
  },
  bodyPartSelected: {
    backgroundColor: "var(--primary-light, #f0f4f8)"
  },
  nurtureContainer: {
    width: "100%",
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "1rem"
  },
  nurtureText: {
    fontSize: "1.25rem",
    color: "var(--text-primary, #1a1a1a)",
    fontWeight: "500"
  }
};
const SafeSpaceTechnique = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig
}) => {
  const [localStage, setLocalStage] = reactExports.useState(0);
  const currentStageIndex = phaseIndex !== void 0 ? phaseIndex : localStage;
  const stageName = currentPhase?.label || (currentStageIndex === 0 ? "Describe Place" : currentStageIndex === 1 ? "Sensory Layering" : "Anchor");
  const instruction = currentPhase?.prompt || (currentStageIndex === 0 ? "Visualize a safe place (beach, forest, library). What do you see?" : currentStageIndex === 1 ? "Add sensory details. What is the temperature? Who is there that loves you? What sounds do you hear?" : "Associate this feeling with a physical gesture. Touch your heart and remember this feeling");
  const [description, setDescription] = reactExports.useState("");
  const [sensoryDetails, setSensoryDetails] = reactExports.useState({
    temperature: "",
    people: "",
    sounds: ""
  });
  const [landscapeElements, setLandscapeElements] = reactExports.useState([]);
  const handleNext = () => {
    if (currentStageIndex < 2) {
      setLocalStage((prev) => prev + 1);
    }
  };
  const handleAddElement = (element) => {
    if (element.trim() && !landscapeElements.includes(element)) {
      setLandscapeElements((prev) => [...prev, element]);
    }
  };
  const timerStyle = {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "var(--primary, #2c5282)",
    // Use CSS variable that adapts to dark mode
    marginBottom: "2rem"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$4.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles$4.stageName, children: stageName }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$4.instruction, children: instruction }),
    countdown !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: timerStyle, children: [
      Math.floor(countdown / 60),
      ":",
      (countdown % 60).toString().padStart(2, "0")
    ] }),
    currentStageIndex === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$4.stageContent, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$4.prompt, children: "What do you see?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: description,
          onChange: (e) => setDescription(e.target.value),
          placeholder: "Describe your safe place...",
          style: styles$4.textarea
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$4.landscapePreview, children: landscapeElements.map((element, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          style: styles$4.landscapeElement,
          initial: { opacity: 0, scale: 0 },
          animate: { opacity: 1, scale: 1 },
          transition: { delay: index * 0.2 },
          children: element
        },
        index
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$4.quickAdd, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          placeholder: "Add element (e.g., 'ocean', 'trees')...",
          onKeyPress: (e) => {
            if (e.key === "Enter") {
              handleAddElement(e.target.value);
              e.target.value = "";
            }
          },
          style: styles$4.quickAddInput
        }
      ) })
    ] }),
    currentStageIndex === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$4.stageContent, children: ["What is the temperature?", "Who is there that loves you?", "What sounds do you hear?"].map((prompt, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$4.sensoryQuestion, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: styles$4.label, children: prompt }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: index === 0 ? sensoryDetails.temperature : index === 1 ? sensoryDetails.people : sensoryDetails.sounds,
          onChange: (e) => {
            if (index === 0) {
              setSensoryDetails((prev) => ({ ...prev, temperature: e.target.value }));
            } else if (index === 1) {
              setSensoryDetails((prev) => ({ ...prev, people: e.target.value }));
            } else {
              setSensoryDetails((prev) => ({ ...prev, sounds: e.target.value }));
            }
          },
          style: styles$4.input,
          placeholder: "Type your answer..."
        }
      )
    ] }, index)) }),
    currentStageIndex === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$4.stageContent, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$4.prompt, children: "Touch your heart and remember this feeling" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          style: styles$4.heartGesture,
          animate: {
            scale: [1, 1.2, 1]
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$4.heartIcon, children: "💗" })
        }
      )
    ] }),
    countdown === void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleNext, style: styles$4.nextButton, disabled: currentStageIndex === 2, children: currentStageIndex === 2 ? "Complete" : "Next" })
  ] });
};
const styles$4 = {
  container: {
    width: "100%",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "300px",
    maxHeight: "calc(100svh - 200px)",
    // Fit between header and footer
    overflowY: "auto"
  },
  stageName: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "var(--text-primary, #1a1a1a)"
  },
  instruction: {
    fontSize: "1rem",
    color: "var(--text-secondary, #666)",
    marginBottom: "1.5rem",
    textAlign: "center"
  },
  stageContent: {
    width: "100%",
    maxWidth: "500px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },
  prompt: {
    fontSize: "1.1rem",
    fontWeight: "500",
    color: "var(--text-primary, #1a1a1a)",
    marginBottom: "0.5rem"
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "0.75rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    fontFamily: "inherit"
  },
  landscapePreview: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    padding: "1rem",
    backgroundColor: "var(--bg-primary, #fafaf9)",
    borderRadius: "0.5rem",
    minHeight: "100px"
  },
  landscapeElement: {
    padding: "0.5rem 1rem",
    backgroundColor: "var(--primary-light, #f0f4f8)",
    border: "1px solid var(--primary-color, #02295b)",
    borderRadius: "1rem",
    fontSize: "0.9rem",
    color: "var(--text-primary, #1a1a1a)"
  },
  quickAdd: {
    display: "flex",
    gap: "0.5rem"
  },
  quickAddInput: {
    flex: 1,
    padding: "0.75rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    fontSize: "0.9rem"
  },
  sensoryQuestion: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  label: {
    fontSize: "1rem",
    fontWeight: "500",
    color: "var(--text-primary, #1a1a1a)"
  },
  input: {
    padding: "0.75rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    fontSize: "1rem"
  },
  heartGesture: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "150px",
    height: "150px",
    margin: "2rem auto"
  },
  heartIcon: {
    fontSize: "5rem",
    filter: "drop-shadow(0 0 20px rgba(236, 72, 153, 0.5))"
  },
  nextButton: {
    marginTop: "2rem",
    padding: "0.75rem 2rem",
    border: "none",
    borderRadius: "0.5rem",
    backgroundColor: "var(--primary-color, #02295b)",
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600"
  }
};
const CompassionateLetterTechnique = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig
}) => {
  const [localStage, setLocalStage] = reactExports.useState(0);
  const [localTimeRemaining, setLocalTimeRemaining] = reactExports.useState(60);
  const currentStageIndex = phaseIndex !== void 0 ? phaseIndex : localStage;
  const displayCountdown = countdown !== void 0 ? countdown : localTimeRemaining;
  const stageName = currentPhase?.label || (currentStageIndex === 0 ? "Grounding" : currentStageIndex === 1 ? "Writing" : "Read Back");
  const instruction = currentPhase?.prompt || (currentStageIndex === 0 ? "Take 3 deep breaths" : currentStageIndex === 1 ? "Write from the perspective of a Wise, Compassionate Friend" : "Read these words back to yourself");
  const [breathCount, setBreathCount] = reactExports.useState(0);
  const [letterText, setLetterText] = reactExports.useState("");
  const [breathPhase, setBreathPhase] = reactExports.useState("in");
  reactExports.useEffect(() => {
    if (countdown === void 0) {
      const timer = setInterval(() => {
        setLocalTimeRemaining((prev) => {
          if (prev <= 1) {
            if (localStage < 2) {
              setLocalStage((s) => s + 1);
              return localStage === 0 ? 180 : 60;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
      return () => clearInterval(timer);
    }
  }, [countdown, localStage]);
  reactExports.useEffect(() => {
    if (currentStageIndex === 0) {
      const breathTimer = setInterval(() => {
        setBreathPhase((prev) => {
          if (prev === "in") {
            setTimeout(() => setBreathPhase("hold"), 2e3);
            return "in";
          } else if (prev === "hold") {
            setTimeout(() => setBreathPhase("out"), 2e3);
            return "hold";
          } else {
            setBreathCount((c) => Math.min(c + 1, 3));
            setTimeout(() => setBreathPhase("in"), 2e3);
            return "out";
          }
        });
      }, 6e3);
      return () => clearInterval(breathTimer);
    }
  }, [currentStageIndex]);
  const minutes = Math.floor(displayCountdown / 60);
  const seconds = displayCountdown % 60;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$3.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles$3.stageName, children: stageName }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$3.instruction, children: instruction }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles$3.timer, children: [
      minutes,
      ":",
      seconds.toString().padStart(2, "0")
    ] }),
    currentStageIndex === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$3.groundingContainer, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          style: styles$3.breathCircle,
          animate: {
            scale: breathPhase === "in" ? 1.2 : breathPhase === "out" ? 0.8 : 1
          },
          transition: {
            duration: 2,
            ease: breathPhase === "in" ? "easeOut" : "easeIn"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: styles$3.breathText, children: [
            breathPhase === "in" && "Inhale...",
            breathPhase === "hold" && "Hold...",
            breathPhase === "out" && "Exhale..."
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles$3.breathCount, children: [
        "Breath ",
        breathCount,
        " of 3"
      ] })
    ] }),
    currentStageIndex === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$3.writingContainer, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$3.writingPrompt, children: "If a friend you loved was feeling exactly this way, what would you say to them?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$3.parchment, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: letterText,
          onChange: (e) => setLetterText(e.target.value),
          placeholder: "Write your compassionate letter here...",
          style: styles$3.letterTextarea
        }
      ) })
    ] }),
    currentStageIndex === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$3.readBackContainer, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$3.parchment, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$3.letterText, children: letterText || "Your letter will appear here..." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$3.readBackMessage, children: "Read these words back to yourself. They are for you, too." })
    ] })
  ] });
};
const styles$3 = {
  container: {
    width: "100%",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "300px",
    maxHeight: "calc(100svh - 200px)",
    // Fit between header and footer
    overflowY: "auto"
  },
  stageName: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "var(--text-primary, #1a1a1a)"
  },
  instruction: {
    fontSize: "1rem",
    color: "var(--text-secondary, #666)",
    marginBottom: "1rem",
    textAlign: "center"
  },
  timer: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "var(--primary, #2c5282)",
    // Use CSS variable that adapts to dark mode
    marginBottom: "2rem"
  },
  groundingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem"
  },
  breathCircle: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-color, #02295b)",
    opacity: 0.7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 40px rgba(2, 41, 91, 0.3)"
  },
  breathText: {
    fontSize: "1.25rem",
    fontWeight: "500",
    color: "white"
  },
  breathCount: {
    fontSize: "1rem",
    color: "var(--text-secondary, #666)"
  },
  writingContainer: {
    width: "100%",
    maxWidth: "600px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },
  writingPrompt: {
    fontSize: "1.1rem",
    fontWeight: "500",
    color: "var(--text-primary, #1a1a1a)",
    textAlign: "center",
    fontStyle: "italic"
  },
  parchment: {
    backgroundColor: "#faf8f3",
    border: "2px solid #e8e5d8",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    minHeight: "200px"
  },
  letterTextarea: {
    width: "100%",
    minHeight: "200px",
    border: "none",
    backgroundColor: "transparent",
    fontSize: "1rem",
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
    color: "var(--text-primary, #1a1a1a)"
  },
  readBackContainer: {
    width: "100%",
    maxWidth: "600px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },
  letterText: {
    fontSize: "1rem",
    lineHeight: "1.6",
    color: "var(--text-primary, #1a1a1a)",
    whiteSpace: "pre-wrap"
  },
  readBackMessage: {
    fontSize: "1rem",
    color: "var(--text-secondary, #666)",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: "1rem"
  }
};
const TECHNIQUES = [
  {
    id: "rain-method",
    name: "The RAIN Method",
    description: "Compassionate Inquiry",
    bestFor: "De-shaming and emotional processing",
    image: "/exercise-rain-method.svg"
  },
  {
    id: "safe-space",
    name: "The Safe Space",
    description: "Imagery Rescripting",
    bestFor: "High stress or trauma triggers",
    image: "/exercise-safe-space.svg"
  },
  {
    id: "compassionate-letter",
    name: "The Compassionate Letter",
    description: "Perspective Taking",
    bestFor: "Intense guilt or shame",
    image: "/exercise-compassionate-letter.svg"
  }
];
const HighEnergyTechniques = ({
  selectedTechnique,
  onTechniqueSelect,
  onComplete
}) => {
  if (selectedTechnique) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      TechniqueWrapper,
      {
        techniqueId: selectedTechnique,
        techniqueName: TECHNIQUES.find((t) => t.id === selectedTechnique)?.name || "",
        energyLevel: "high",
        duration: 300,
        onComplete,
        children: [
          selectedTechnique === "rain-method" && /* @__PURE__ */ jsxRuntimeExports.jsx(RAINMethodTechnique, {}),
          selectedTechnique === "safe-space" && /* @__PURE__ */ jsxRuntimeExports.jsx(SafeSpaceTechnique, {}),
          selectedTechnique === "compassionate-letter" && /* @__PURE__ */ jsxRuntimeExports.jsx(CompassionateLetterTechnique, {})
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$2.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles$2.subtext, children: "Deeply restorative work for when you have the capacity to sit with your feelings." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles$2.optionsGrid, children: TECHNIQUES.map((technique) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        style: styles$2.optionButton,
        onClick: () => onTechniqueSelect(technique.id),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$2.optionHeader, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: technique.image, alt: technique.name, style: styles$2.optionImage }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: styles$2.optionName, children: technique.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$2.optionType, children: technique.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles$2.optionBestFor, children: [
            "Best For: ",
            technique.bestFor
          ] })
        ]
      },
      technique.id
    )) })
  ] });
};
const styles$2 = {
  container: {
    width: "100%",
    padding: "1rem"
  },
  subtext: {
    fontSize: "0.9rem",
    color: "var(--text-secondary, #666)",
    textAlign: "center",
    marginBottom: "1.5rem",
    fontStyle: "italic"
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1, 1fr)",
    gap: "1rem"
  },
  optionButton: {
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    border: "2px solid var(--border-color, #e0e0e0)",
    borderRadius: "0.5rem",
    backgroundColor: "var(--bg-card, #ffffff)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left"
  },
  optionHeader: {
    marginBottom: "0.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem"
  },
  optionImage: {
    width: "40px",
    height: "40px",
    objectFit: "contain"
  },
  optionName: {
    fontSize: "1rem",
    fontWeight: "600",
    margin: "0 0 0.25rem 0",
    color: "var(--text-primary, #1a1a1a)"
  },
  optionType: {
    fontSize: "0.75rem",
    color: "var(--text-secondary, #666)",
    fontStyle: "italic"
  },
  optionBestFor: {
    fontSize: "0.85rem",
    color: "var(--text-secondary, #666)",
    margin: 0
  }
};
const getTechniqueName = (energyLevel, techniqueId) => {
  if (energyLevel === "low") {
    const lowTechniques = {
      "grounding-flash": "The Grounding Flash",
      "weight-drop": "The Weight Drop",
      "sensory-snap": "The Sensory Snap",
      "compassionate-touch": "The Compassionate Touch"
    };
    return lowTechniques[techniqueId] || techniqueId;
  } else if (energyLevel === "medium") {
    const mediumTechniques = {
      "thought-stream": "The Thought Stream",
      "self-compassion-break": "The Self-Compassion Break",
      "reality-check": "The Reality Check"
    };
    return mediumTechniques[techniqueId] || techniqueId;
  } else if (energyLevel === "high") {
    const highTechniques = {
      "rain-method": "The RAIN Method",
      "safe-space": "The Safe Space",
      "compassionate-letter": "The Compassionate Letter"
    };
    return highTechniques[techniqueId] || techniqueId;
  }
  return techniqueId;
};
const TechniqueCard = ({
  energyLevel,
  selectedTechnique,
  onTechniqueSelect,
  onComplete,
  onBack
}) => {
  const handleTechniqueSelect = (techniqueId) => {
    onTechniqueSelect(techniqueId);
  };
  const getCardTitle = () => {
    switch (energyLevel) {
      case "low":
        return "Tiny step for low energy";
      case "medium":
        return "2-minute reset";
      case "high":
        return "5-minute deep support";
      default:
        return "";
    }
  };
  const getDurationPill = () => {
    switch (energyLevel) {
      case "low":
        return "≈ 10 seconds";
      case "medium":
        return "≈ 2 minutes";
      case "high":
        return "≈ 5 minutes";
      default:
        return "";
    }
  };
  const [isBackHovered, setIsBackHovered] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$1.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$1.header, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          style: {
            ...styles$1.backButton,
            ...isBackHovered ? { opacity: 1 } : {}
          },
          onClick: onBack,
          onMouseEnter: () => setIsBackHovered(true),
          onMouseLeave: () => setIsBackHovered(false),
          "aria-label": "Back to energy selection",
          children: "← Back"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles$1.cardTitle, children: getCardTitle() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles$1.durationPill, children: getDurationPill() })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles$1.content, children: [
      energyLevel === "low" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        LowEnergyTechniques,
        {
          selectedTechnique,
          onTechniqueSelect: (techniqueId) => {
            handleTechniqueSelect(techniqueId);
            const techniqueName = getTechniqueName(energyLevel, techniqueId);
            logTechniqueSelection(energyLevel, techniqueId, techniqueName).catch(console.error);
          },
          onComplete
        }
      ),
      energyLevel === "medium" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MediumEnergyTechniques,
        {
          selectedTechnique,
          onTechniqueSelect: (techniqueId) => {
            handleTechniqueSelect(techniqueId);
            const techniqueName = getTechniqueName(energyLevel, techniqueId);
            logTechniqueSelection(energyLevel, techniqueId, techniqueName).catch(console.error);
          },
          onComplete
        }
      ),
      energyLevel === "high" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        HighEnergyTechniques,
        {
          selectedTechnique,
          onTechniqueSelect: (techniqueId) => {
            handleTechniqueSelect(techniqueId);
            const techniqueName = getTechniqueName(energyLevel, techniqueId);
            logTechniqueSelection(energyLevel, techniqueId, techniqueName).catch(console.error);
          },
          onComplete
        }
      )
    ] })
  ] });
};
const styles$1 = {
  container: {
    width: "100%",
    padding: "1rem"
  },
  header: {
    marginBottom: "1.5rem",
    position: "relative"
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    background: "none",
    border: "none",
    color: "var(--text-primary, #1a1a1a)",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "500",
    padding: "12px 16px",
    opacity: 0.8,
    transition: "opacity 0.2s ease",
    zIndex: 10
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem 0",
    textAlign: "center",
    color: "var(--text-primary, #1a1a1a)"
  },
  durationPill: {
    display: "block",
    textAlign: "center",
    fontSize: "0.85rem",
    color: "var(--text-secondary, #666)",
    fontStyle: "italic"
  },
  content: {
    width: "100%"
  }
};
const EnergyCheckIn = ({ onComplete, onReturnHome }) => {
  const [selectedEnergy, setSelectedEnergy] = reactExports.useState(null);
  const [selectedTechnique, setSelectedTechnique] = reactExports.useState(null);
  const handleEnergySelect = reactExports.useCallback((energy) => {
    setSelectedEnergy(energy);
    setSelectedTechnique(null);
    logEnergySelection(energy).catch(console.error);
  }, []);
  const handleTechniqueSelect = reactExports.useCallback((techniqueId) => {
    setSelectedTechnique(techniqueId);
  }, []);
  const handleTechniqueComplete = reactExports.useCallback(() => {
    setSelectedEnergy(null);
    setSelectedTechnique(null);
    onReturnHome?.();
  }, [onReturnHome]);
  const handleBackToSelection = reactExports.useCallback(() => {
    setSelectedTechnique(null);
    setSelectedEnergy(null);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: "100%" }, children: !selectedEnergy ? /* @__PURE__ */ jsxRuntimeExports.jsx(EnergySelection, { onSelect: handleEnergySelect }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
    TechniqueCard,
    {
      energyLevel: selectedEnergy,
      selectedTechnique,
      onTechniqueSelect: handleTechniqueSelect,
      onComplete: handleTechniqueComplete,
      onBack: handleBackToSelection
    }
  ) });
};
const SessionEngine = ({ sessionKey, onComplete }) => {
  const config = MASTER_SESSIONS[sessionKey];
  if (!config) {
    console.error(`[SessionEngine] Session key "${sessionKey}" not found in MASTER_SESSIONS`);
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Session not found" });
  }
  const [sessionState, setSessionState] = reactExports.useState({
    currentPhaseIndex: 0,
    timeLeftInPhase: config.phases[0].duration,
    isActive: true,
    startedAt: Date.now()
  });
  const [userInput, setUserInput] = reactExports.useState("");
  const [isReducedMotion, setIsReducedMotion] = reactExports.useState(false);
  const wakeLockRef = reactExports.useRef(null);
  const timerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
  reactExports.useEffect(() => {
    if (config.category === "5min" && "wakeLock" in navigator) {
      navigator.wakeLock?.request("screen").then((wakeLock) => {
        wakeLockRef.current = wakeLock;
      }).catch((err) => {
        console.warn("[SessionEngine] Wake Lock not supported:", err);
      });
    }
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(console.error);
      }
    };
  }, [config.category]);
  reactExports.useEffect(() => {
    if (!sessionState.isActive || sessionState.timeLeftInPhase <= 0) {
      return;
    }
    timerRef.current = setInterval(() => {
      setSessionState((prev) => {
        const newTime = prev.timeLeftInPhase - 1;
        if (newTime <= 0) {
          if (prev.currentPhaseIndex < config.phases.length - 1) {
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
            const nextIndex = prev.currentPhaseIndex + 1;
            return {
              ...prev,
              currentPhaseIndex: nextIndex,
              timeLeftInPhase: config.phases[nextIndex].duration
            };
          } else {
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            if (typeof window !== "undefined" && window.localStorage) {
              try {
                const stats = JSON.parse(localStorage.getItem("user_stats") || "{}");
                stats[sessionKey] = (stats[sessionKey] || 0) + 1;
                localStorage.setItem("user_stats", JSON.stringify(stats));
              } catch (e) {
                console.warn("[SessionEngine] Failed to track completion:", e);
              }
            }
            if (wakeLockRef.current) {
              wakeLockRef.current.release().catch(console.error);
            }
            setTimeout(() => {
              onComplete();
            }, 500);
            return {
              ...prev,
              isActive: false,
              timeLeftInPhase: 0
            };
          }
        }
        return {
          ...prev,
          timeLeftInPhase: newTime
        };
      });
    }, 1e3);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionState.isActive, sessionState.timeLeftInPhase, sessionState.currentPhaseIndex, config, sessionKey, onComplete]);
  const currentPhase = config.phases[sessionState.currentPhaseIndex] || config.phases[0];
  if (!currentPhase) {
    console.error(`[SessionEngine] No phase found at index ${sessionState.currentPhaseIndex} for session ${sessionKey}`);
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Error: Session phase not found" });
  }
  const renderTechniqueComponent = () => {
    const techniqueProps = {
      currentPhase,
      countdown: sessionState.timeLeftInPhase,
      phaseIndex: sessionState.currentPhaseIndex,
      sessionConfig: config
    };
    switch (sessionKey) {
      case "10s-reset":
      case "grounding-flash":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(GroundingFlashTechnique, { ...techniqueProps });
      case "10s-anchor":
      case "weight-drop":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(WeightDropTechnique, { ...techniqueProps });
      case "10s-snap":
      case "sensory-snap":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SensorySnapTechnique, { ...techniqueProps });
      case "10s-compassion":
      case "compassionate-touch":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CompassionateTouchTechnique, { ...techniqueProps });
      case "2min-grounding":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SensorySnapTechnique, { ...techniqueProps });
      case "2min-compassion":
      case "self-compassion-break":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SelfCompassionBreakTechnique, { ...techniqueProps });
      case "2min-reality":
      case "reality-check":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RealityCheckTechnique, { ...techniqueProps });
      case "thought-stream":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ThoughtStreamTechnique, { ...techniqueProps });
      case "5min-rain":
      case "rain-method":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RAINMethodTechnique, { ...techniqueProps });
      case "5min-safe-space":
      case "safe-space":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SafeSpaceTechnique, { ...techniqueProps });
      case "5min-letter":
      case "compassionate-letter":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CompassionateLetterTechnique, { ...techniqueProps });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "2rem", textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Technique component not found for: ",
          sessionKey
        ] }) });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "app-stage", style: { width: "100%", minHeight: "100svh" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        style: { position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" },
        children: [
          currentPhase.label,
          ": ",
          sessionState.timeLeftInPhase,
          " seconds remaining. ",
          currentPhase.prompt
        ]
      }
    ),
    renderTechniqueComponent()
  ] });
};
function getSessionKeyFromEnergy(energy) {
  if (!energy) return null;
  if (energy === "10s-reset") return "10s-reset";
  if (energy === "10s-anchor") return "10s-anchor";
  if (energy === "10s-hum") return "10s-hum";
  if (energy === "2min") return "2min-grounding";
  if (energy === "5min") return "5min-rain";
  if (MASTER_SESSIONS[energy]) return energy;
  return null;
}
function App() {
  const [view, setView] = reactExports.useState("loading");
  const [isDarkMode, setIsDarkMode] = reactExports.useState(false);
  const [selectedEnergy, setSelectedEnergy] = reactExports.useState(null);
  const [moments, setMoments] = reactExports.useState(0);
  const [aiMessage, setAiMessage] = reactExports.useState("");
  const [aiLoading, setAiLoading] = reactExports.useState(false);
  const [conversationState, setConversationState] = reactExports.useState(null);
  const [userInput, setUserInput] = reactExports.useState("");
  const [conversationHistory, setConversationHistory] = reactExports.useState([]);
  const [hasAcceptedTerms, setHasAcceptedTerms] = reactExports.useState(false);
  const [showFullTerms, setShowFullTerms] = reactExports.useState(false);
  const [breathingPhase, setBreathingPhase] = reactExports.useState("inhale");
  const [breathingCycle, setBreathingCycle] = reactExports.useState(0);
  const [pendingUserInput, setPendingUserInput] = reactExports.useState("");
  const [inputRows, setInputRows] = reactExports.useState(1);
  const [isWebGPUSupported, setIsWebGPUSupported] = reactExports.useState(true);
  const [selectedTenSecondBreaker, setSelectedTenSecondBreaker] = reactExports.useState("10s-reset");
  const [savedSessions, setSavedSessions] = reactExports.useState([]);
  const [selectedDate, setSelectedDate] = reactExports.useState("");
  const [datesWithSessions, setDatesWithSessions] = reactExports.useState([]);
  const textareaRef = reactExports.useRef(null);
  const messagesEndRef = reactExports.useRef(null);
  const [hoveredNav, setHoveredNav] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const checkWebGPU = async () => {
      const gpu = navigator.gpu;
      if (!gpu) {
        setIsWebGPUSupported(false);
        return;
      }
      try {
        const adapter = await gpu.requestAdapter();
        if (!adapter) {
          setIsWebGPUSupported(false);
        }
      } catch {
        setIsWebGPUSupported(false);
      }
    };
    checkWebGPU();
    const initDB = async () => {
      try {
        const count = await chatDB.getSessionCount();
        console.log("[App] Database initialized. Existing sessions:", count);
      } catch (error) {
        console.error("[App] Database initialization error:", error);
      }
    };
    initDB();
  }, []);
  reactExports.useEffect(() => {
    const savedMoments = localStorage.getItem("grounded_moments");
    if (savedMoments) {
      try {
        const parsed = JSON.parse(savedMoments);
        setMoments(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setMoments(0);
      }
    }
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || !savedTheme && prefersDark;
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  reactExports.useEffect(() => {
    setHasAcceptedTerms(hasAgreedToTerms());
  }, []);
  reactExports.useEffect(() => {
    async function initAI() {
      try {
        const msg = await generateWelcomeMessage();
        setAiMessage(msg);
        setView(hasAcceptedTerms ? "welcome" : "terms");
      } catch {
        setAiMessage(COPY.welcome.subtitle);
        setView(hasAcceptedTerms ? "welcome" : "terms");
      }
    }
    initAI();
  }, [hasAcceptedTerms]);
  reactExports.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory]);
  reactExports.useEffect(() => {
    if (conversationHistory.length >= 2 && view === "conversation" && conversationState) {
      const saveTimer = setTimeout(async () => {
        try {
          const sessionId = await chatDB.saveSession(conversationHistory, selectedEnergy || void 0);
          console.log("[App] Auto-saved session:", sessionId);
          if (view === "sessions") {
            await loadSavedSessions();
          }
        } catch (err) {
          console.error("[App] Auto-save failed:", err);
        }
      }, 2e3);
      return () => clearTimeout(saveTimer);
    }
  }, [conversationHistory.length, view, conversationState, selectedEnergy]);
  const toggleTheme = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  const handleAcceptTerms = () => {
    agreeToTerms();
    setHasAcceptedTerms(true);
    setView("welcome");
  };
  const handleWelcomeInput = async () => {
    if (!pendingUserInput.trim()) return;
    setConversationHistory([{ role: "user", content: pendingUserInput }]);
    setAiLoading(true);
    setView("conversation");
    const energy = "custom";
    setSelectedEnergy(energy);
    setConversationState({ node: "welcome", energy, depth: 0 });
    try {
      const result = await continueConversation(
        { node: "welcome", energy, depth: 0 },
        pendingUserInput
      );
      setAiMessage(result.message);
      setConversationState(result.state);
      setTimeout(() => {
        setConversationHistory((prev) => [...prev, { role: "assistant", content: result.message }]);
      }, 300);
    } catch {
      setConversationHistory((prev) => [...prev, { role: "assistant", content: "I'm still here. Take your time." }]);
    }
    setAiLoading(false);
  };
  const handleBreathingComplete = async () => {
    setConversationState({ node: "welcome", energy: selectedEnergy, depth: 0 });
    if (pendingUserInput.trim()) {
      setConversationHistory([{ role: "user", content: pendingUserInput }]);
      setAiLoading(true);
      setView("conversation");
      try {
        const result = await continueConversation(
          { node: "welcome", energy: selectedEnergy, depth: 0 },
          pendingUserInput
        );
        setAiMessage(result.message);
        setConversationState(result.state);
        setTimeout(() => {
          setConversationHistory((prev) => [...prev, { role: "assistant", content: result.message }]);
        }, 300);
      } catch {
        setConversationHistory((prev) => [...prev, { role: "assistant", content: "I'm still here. Take your time." }]);
      }
      setAiLoading(false);
    } else {
      setView("welcome");
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };
  const handleSendMessage = async (quickReply) => {
    if (!conversationState) return;
    const input = quickReply || userInput.trim();
    if (!input && !quickReply) return;
    setUserInput("");
    setAiLoading(true);
    const userMessage = input;
    setConversationHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    try {
      const result = await continueConversation(conversationState, userMessage, quickReply);
      setAiMessage(result.message);
      setConversationState(result.state);
      setTimeout(() => {
        setConversationHistory((prev) => [...prev, { role: "assistant", content: result.message }]);
      }, 300);
    } catch {
      setConversationHistory((prev) => [...prev, { role: "assistant", content: "I'm still here. Take your time." }]);
    }
    setAiLoading(false);
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const handleNewSession = () => {
    setConversationHistory([]);
    setUserInput("");
    setAiMessage("");
    setConversationState(null);
    setSelectedEnergy(null);
    setView("welcome");
    generateWelcomeMessage().then((msg) => setAiMessage(msg));
  };
  const handleClearData = () => {
    if (confirm("Delete all history? This cannot be undone.")) {
      clearAllData();
      setMoments(0);
      alert("All data cleared.");
    }
  };
  const handleSaveSession = async () => {
    if (conversationHistory.length === 0) {
      alert("No messages to save.");
      return;
    }
    try {
      const sessionId = await chatDB.saveSession(
        conversationHistory,
        selectedEnergy || void 0
      );
      console.log("[App] Session saved with ID:", sessionId);
      if (view === "sessions") {
        await loadSavedSessions();
      }
      await loadSavedSessions();
      alert("Chat saved locally.");
    } catch (error) {
      console.error("[App] Error saving session:", error);
      alert(`Failed to save chat: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  const handleShareSession = async () => {
    if (conversationHistory.length === 0) {
      alert("No messages to share.");
      return;
    }
    try {
      await chatDB.shareSession(conversationState?.energy || "custom");
    } catch (error) {
      if (error.message === "Copied to clipboard") {
        alert("Chat copied to clipboard.");
      } else {
        alert("Failed to share chat.");
      }
    }
  };
  reactExports.useEffect(() => {
    if (selectedDate) {
      chatDB.getSessionsByDate(selectedDate).then(setSavedSessions);
    }
  }, [selectedDate]);
  const loadSavedSessions = async () => {
    const dates = await chatDB.getDatesWithSessions();
    setDatesWithSessions(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  };
  const renderHelp = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "app-stage", style: styles.helpContainer, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.settingsHeader, children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: styles.title, children: "How to Use Grounded" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpSection, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpItem, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.helpIcon, children: "🧘" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpContent, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.helpTitle, children: "1. Choose Your Energy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.helpText, children: "Select how you're feeling: Heavy, Neutral, or Light. Each option provides a different breathing exercise tailored to your current state." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpItem, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.helpIcon, children: "💨" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpContent, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.helpTitle, children: "2. Follow the Exercise" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.helpText, children: "A calming animation will guide you through breathing. Follow along at your own pace. This helps ground you before our chat." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpItem, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.helpIcon, children: "💬" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpContent, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.helpTitle, children: "3. Chat Through It" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.helpText, children: "Share what's on your mind. Our AI listens without judgment and helps you work through difficult emotions privately." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpItem, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.helpIcon, children: "💾" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpContent, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.helpTitle, children: "4. Save or Share" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.helpText, children: "Save your chat for later reference, or share it with someone you trust. All data stays on your device—nothing is sent to servers." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpItem, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.helpIcon, children: "🌙" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpContent, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.helpTitle, children: "5. Dark Mode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.helpText, children: "Tap the sun/moon icon to switch themes. Perfect for nighttime use when you need extra calm." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpItem, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.helpIcon, children: "🚨" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.helpContent, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.helpTitle, children: "Crisis Resources" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.helpText, children: "If you're in crisis, the Crisis tab provides immediate access to hotlines and support resources." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.helpFooter, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.helpFooterText, children: "💡 Grounded runs entirely on your device. Your conversations are never seen by anyone else." }) })
  ] });
  const renderSessions = () => {
    const sessionsForDate = savedSessions.filter((s) => s.dateString === selectedDate);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.container, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.settingsHeader, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.backButton, onClick: () => setView("welcome"), children: "← Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: styles.title, children: "Chat History" })
      ] }),
      datesWithSessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.subtitle, children: "No saved chats yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.dateSelector, children: datesWithSessions.map((date) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            style: {
              ...styles.dateButton,
              ...date === selectedDate ? styles.dateButtonActive : {}
            },
            onClick: () => setSelectedDate(date),
            children: new Date(date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric"
            })
          },
          date
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.sessionsList, children: sessionsForDate.map((session) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.sessionCard, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.sessionHeader, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.sessionTime, children: session.timeString }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.sessionTitle, children: session.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles.sessionPreview, children: [
            session.messages[session.messages.length - 1]?.content.slice(0, 60),
            "..."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.sessionActions, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                style: styles.sessionAction,
                onClick: () => {
                  setConversationHistory(session.messages.map((m) => ({ role: m.role, content: m.content })));
                  setView("conversation");
                },
                children: "Continue"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                style: styles.sessionAction,
                onClick: () => {
                  if (confirm("Delete this chat?")) {
                    chatDB.deleteSession(session.id).then(loadSavedSessions);
                  }
                },
                children: "Delete"
              }
            )
          ] })
        ] }, session.id)) })
      ] })
    ] });
  };
  const [headerHover, setHeaderHover] = reactExports.useState(null);
  const renderHeader = () => {
    if (view === "loading" || view === "terms") return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { style: styles.appHeader, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.headerLeft, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/ac-minds-logo.png", alt: "AC Minds", style: styles.headerLogo }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: styles.headerTitle, children: "Grounded" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.headerRight, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            style: {
              ...styles.headerIconButton,
              ...headerHover === "theme" ? styles.headerIconButtonHover : {}
            },
            onClick: toggleTheme,
            onMouseEnter: () => setHeaderHover("theme"),
            onMouseLeave: () => setHeaderHover(null),
            "aria-label": isDarkMode ? "Switch to light mode" : "Switch to dark mode",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.headerIcon, children: isDarkMode ? "☀️" : "🌙" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            style: {
              ...styles.headerIconButton,
              ...headerHover === "settings" ? styles.headerIconButtonHover : {}
            },
            onClick: () => setView("settings"),
            onMouseEnter: () => setHeaderHover("settings"),
            onMouseLeave: () => setHeaderHover(null),
            "aria-label": "Settings",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.headerIcon, children: "⚙️" })
          }
        )
      ] })
    ] });
  };
  const renderBottomNav = () => {
    if (view === "loading" || view === "terms") return null;
    const navItems = [
      { view: "welcome", icon: "🏠", label: "Home" },
      { view: "help", icon: "❓", label: "Help" },
      { view: "sessions", icon: "📚", label: "History" },
      { view: "crisis-resources", icon: "🚨", label: "Crisis" }
    ];
    return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { style: styles.bottomNav, children: navItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        style: {
          ...styles.bottomNavItem,
          ...view === item.view ? styles.bottomNavActive : {},
          ...hoveredNav === item.view ? styles.bottomNavItemHover : {}
        },
        onClick: () => setView(item.view),
        onMouseEnter: () => setHoveredNav(item.view),
        onMouseLeave: () => setHoveredNav(null),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.bottomNavIcon, children: item.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.bottomNavLabel, children: item.label })
        ]
      },
      item.view
    )) });
  };
  const renderFooterInput = () => {
    if (view !== "welcome" && view !== "conversation") return null;
    if (view === "conversation") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.footerInputContainer, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            style: styles.footerInput,
            placeholder: "Type your response...",
            value: userInput,
            onChange: (e) => setUserInput(e.target.value),
            onKeyDown: handleKeyPress,
            disabled: aiLoading
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            style: styles.footerSendButton,
            onClick: () => handleSendMessage(),
            disabled: aiLoading || !userInput.trim(),
            children: "→"
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.footerInputContainer, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          ref: textareaRef,
          style: styles.footerTextarea,
          placeholder: "Share your thoughts...",
          value: pendingUserInput,
          rows: inputRows,
          onChange: (e) => {
            const value = e.target.value;
            setPendingUserInput(value);
            const lines = value.split("\n").length;
            setInputRows(Math.min(Math.max(lines, 1), 4));
          },
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (pendingUserInput.trim()) {
                handleWelcomeInput();
              }
            }
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          style: { ...styles.footerSendButton, opacity: pendingUserInput.trim() ? 1 : 0.5 },
          onClick: handleWelcomeInput,
          disabled: !pendingUserInput.trim(),
          "aria-label": "Submit what's on your mind",
          children: "→"
        }
      )
    ] });
  };
  const renderThemeToggle = () => null;
  const renderLoading = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.container, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.loadingContent, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.loadingSpinner }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: styles.title, children: "Preparing your space" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.subtitle, children: "Downloading AI model..." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.loadingNote, children: "First time only. Future visits faster." })
  ] }) });
  const renderUnsupportedBrowser = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.settingsHeader, children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: styles.title, children: "Browser Not Supported" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.unsupportedContent, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.unsupportedText, children: "Grounded uses WebGPU for privacy-first, offline AI conversations. Safari doesn't support WebGPU yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.browserOptions, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.browserOptionsTitle, children: "Try one of these:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.google.com/chrome/", style: styles.browserButton, target: "_blank", rel: "noopener", children: "Chrome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.microsoft.com/edge", style: styles.browserButton, target: "_blank", rel: "noopener", children: "Edge" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.mozilla.org/firefox/", style: styles.browserButton, target: "_blank", rel: "noopener", children: "Firefox (may work)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.unsupportedNote, children: "Or come back on a desktop browser with Chrome or Edge." })
    ] })
  ] });
  const renderTerms = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.termsContainer, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.termsHeader, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.backButton, onClick: () => {
        setShowFullTerms(false);
        if (hasAcceptedTerms) setView("welcome");
      }, children: "← Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: styles.title, children: "Terms & Privacy" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.termsScroll, children: !showFullTerms ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.termsSummary, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { style: styles.termsCard, onClick: () => setShowFullTerms(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.termsCardTitle, children: "🔒 Your Privacy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.termsCardText, children: "AI runs locally. No data leaves your device." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { style: styles.termsCard, onClick: () => setShowFullTerms(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.termsCardTitle, children: "🧠 AI Support" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.termsCardText, children: "TinyLlama runs on your device for privacy." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { style: styles.termsCard, onClick: () => setShowFullTerms(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.termsCardTitle, children: "🚨 Emergency" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.termsCardText, children: "Call 988 for immediate help." })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.termsFull, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.termsSectionTitle, children: "Terms of Service" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { style: styles.termsPre, children: TERMS_OF_SERVICE }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.termsSectionTitle, children: "Privacy Policy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { style: styles.termsPre, children: PRIVACY_POLICY })
    ] }) }),
    !showFullTerms && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.primaryButton, onClick: handleAcceptTerms, children: "I Agree — Continue" })
  ] });
  const renderSettings = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.settingsHeader, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.backButton, onClick: () => setView("welcome"), children: "← Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: styles.title, children: "Settings" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { style: styles.settingsItem, onClick: () => setView("terms"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.settingsIcon, children: "📋" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.settingsText, children: "Terms & Privacy" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.settingsInfo, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles.settingsVersion, children: [
        "Version ",
        TERMS_VERSION
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.settingsInfoText, children: "All data stored locally" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { style: { ...styles.settingsItem, ...styles.dangerItem }, onClick: handleClearData, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.settingsIcon, children: "🗑️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.settingsText, children: "Clear All Data" })
    ] })
  ] });
  const renderValues = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.settingsHeader, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.backButton, onClick: () => setView("welcome"), children: "← Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: styles.title, children: "Your Values" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.valuesIntro, children: "What matters most to you?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.valuesGrid, children: [
      { icon: "❤️", label: "Compassion", desc: "For yourself & others" },
      { icon: "🌱", label: "Growth", desc: "Learning & improving" },
      { icon: "🤝", label: "Connection", desc: "Relationships" },
      { icon: "🎯", label: "Presence", desc: "Being here now" },
      { icon: "🛡️", label: "Safety", desc: "Feeling secure" },
      { icon: "✨", label: "Authenticity", desc: "Being true to yourself" },
      { icon: "🌊", label: "Flow", desc: "Natural rhythm" },
      { icon: "🧘", label: "Peace", desc: "Inner calm" }
    ].map((value) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { style: styles.valueCard, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.valueIcon, children: value.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.valueLabel, children: value.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.valueDesc, children: value.desc })
    ] }, value.label)) })
  ] });
  const renderCrisisResources = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.settingsHeader, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.backButton, onClick: () => setView("welcome"), children: "← Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: styles.title, children: "Crisis Resources" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.crisisUrgent, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.crisisUrgentTitle, children: "🚨 In Immediate Danger" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.crisisUrgentText, children: "Call 911 or go to nearest emergency room." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.crisisSectionTitle, children: "📞 Crisis Hotlines" }),
    [
      { name: "988 Suicide & Crisis Lifeline", desc: "Call or text 988 (US)", phone: "tel:988" },
      { name: "Crisis Text Line", desc: "Text HOME to 741741", phone: "sms:741741&body=HOME" },
      { name: "The Trevor Project", desc: "LGBTQ+ support", phone: "tel:1-866-488-7386" },
      { name: "Veterans Crisis Line", desc: "Call 988, press 1", phone: "tel:988" }
    ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.crisisCard, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.crisisCardInfo, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: styles.crisisCardName, children: item.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.crisisCardDesc, children: item.desc })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: item.phone, style: styles.crisisCallButton, children: "Call" })
    ] }, item.name)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: styles.crisisSectionTitle, children: "🌍 International" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.iasp.info/resources/Crisis_Centres/", target: "_blank", rel: "noopener", style: styles.crisisLink, children: "IASP Crisis Centres →" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://befrienders.org/", target: "_blank", rel: "noopener", style: styles.crisisLink, children: "Befrienders Worldwide →" })
  ] });
  const renderWelcome = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.welcomeContainer, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.welcomeLogoSection, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/ac-minds-logo.png", alt: "AC Minds", style: styles.logoImage }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: styles.welcomeTitle, children: "Grounded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.welcomeSubtitle, children: "Small moments, big difference" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EnergyCheckIn,
      {
        onComplete: () => {
        },
        onReturnHome: () => {
        }
      }
    ),
    moments > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: styles.momentsCount, children: [
      moments,
      " moments"
    ] })
  ] });
  const renderBreathing = () => {
    const sessionKey = getSessionKeyFromEnergy(selectedEnergy);
    if (!sessionKey) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.breathingWrapper, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Please select an exercise to begin." }) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.breathingWrapper, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SessionEngine, { sessionKey, onComplete: handleBreathingComplete }) });
  };
  const renderConversation = () => {
    const nodeData = conversationState ? getConversationNode(conversationState.node) : null;
    const quickReplies = nodeData && "quickReplies" in nodeData ? nodeData.quickReplies : void 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.conversationContainer, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.conversationHeader, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.backButton, onClick: () => {
          setPendingUserInput("");
          setView("welcome");
        }, children: "← Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.newChatButton, onClick: handleNewSession, children: "+ New Chat" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.conversationHeading, children: "This is your safe and private space to chat through it." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.chatActions, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.chatActionButton, onClick: handleSaveSession, children: "💾 Save" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.chatActionButton, onClick: handleShareSession, children: "📤 Share" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.chatActionButton, onClick: () => setView("sessions"), children: "📚 History" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.messagesContainer, children: [
        conversationHistory.map((msg, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...styles.messageBubble, ...msg.role === "user" ? styles.userMessage : styles.assistantMessage }, children: msg.content }, index)),
        aiLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.typingIndicator, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "● ● ●" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: messagesEndRef })
      ] }),
      quickReplies && quickReplies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.quickReplies, children: quickReplies.map((reply) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.quickReplyButton, onClick: () => handleSendMessage(reply), disabled: aiLoading, children: reply }, reply)) })
    ] });
  };
  const renderComplete = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: styles.title, children: "Thank you" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.subtitle, children: COPY.completion.subtitle }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: styles.primaryButton, onClick: handleNewSession, children: "New session" })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.app, children: [
    renderHeader(),
    !isWebGPUSupported && renderUnsupportedBrowser(),
    view === "loading" && renderLoading(),
    view === "terms" && renderTerms(),
    view === "settings" && renderSettings(),
    view === "values" && renderValues(),
    view === "welcome" && renderWelcome(),
    view === "breathing" && renderBreathing(),
    view === "conversation" && renderConversation(),
    view === "crisis-resources" && renderCrisisResources(),
    view === "help" && renderHelp(),
    view === "sessions" && renderSessions(),
    view === "complete" && renderComplete(),
    renderFooterInput(),
    renderBottomNav(),
    renderThemeToggle()
  ] });
}
const styles = {
  appHeader: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "60px",
    backgroundColor: "var(--bg-card, #ffffff)",
    borderBottom: "1px solid var(--border, rgba(0,0,0,0.1))",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    zIndex: 1e3,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  headerLogo: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    objectFit: "contain"
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--text-primary, #1b3448)",
    margin: 0
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  headerIconButton: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    transition: "background-color 0.2s ease"
  },
  headerIconButtonHover: {
    backgroundColor: "var(--bg-secondary, #f8f7f4)"
  },
  headerIcon: {
    fontSize: "20px"
  },
  footerInputContainer: {
    position: "fixed",
    bottom: `calc(80px + env(safe-area-inset-bottom))`,
    // Above navigation (60px nav + 20px spacing)
    left: 0,
    right: 0,
    padding: "12px 16px",
    paddingBottom: `calc(12px + env(safe-area-inset-bottom))`,
    backgroundColor: "var(--bg-card, #ffffff)",
    borderTop: "1px solid var(--border, rgba(0,0,0,0.1))",
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
    zIndex: 999,
    boxShadow: "0 -2px 8px rgba(0,0,0,0.05)"
  },
  footerInput: {
    flex: 1,
    padding: "12px 16px",
    fontSize: "15px",
    border: "1px solid var(--border-color, #e0e0e0)",
    borderRadius: "24px",
    outline: "none",
    backgroundColor: "var(--bg-secondary, #f8f7f4)",
    color: "var(--text-primary, #1a1a1a)",
    fontFamily: "inherit",
    maxHeight: "120px"
  },
  footerTextarea: {
    flex: 1,
    padding: "12px 16px",
    fontSize: "15px",
    border: "1px solid var(--border-color, #e0e0e0)",
    borderRadius: "24px",
    outline: "none",
    backgroundColor: "var(--bg-secondary, #f8f7f4)",
    color: "var(--text-primary, #1a1a1a)",
    fontFamily: "inherit",
    resize: "none",
    minHeight: "48px",
    maxHeight: "120px",
    lineHeight: "1.5"
  },
  footerSendButton: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-color, #02295b)",
    color: "white",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "600",
    flexShrink: 0,
    transition: "opacity 0.2s ease, transform 0.2s ease"
  },
  app: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "var(--bg-primary, #fafaf9)",
    color: "var(--text-primary, #1b3448)",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: "relative",
    paddingTop: "60px",
    paddingBottom: "160px"
    // Space for bottom nav (80px) + footer input (80px)
  },
  container: {
    flex: 1,
    padding: "20px",
    paddingBottom: "100px",
    maxWidth: "500px",
    margin: "0 auto"
  },
  helpContainer: {
    width: "100%",
    maxWidth: "100%",
    minHeight: "calc(100svh - 60px)",
    // Account for header
    maxHeight: "calc(100svh - 60px)",
    // Fit within viewport
    paddingTop: "calc(60px + env(safe-area-inset-top))",
    // Header height + safe area
    paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
    // Navigation + safe area
    paddingLeft: "max(20px, env(safe-area-inset-left))",
    paddingRight: "max(20px, env(safe-area-inset-right))",
    overflowY: "auto",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column"
  },
  loadingContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    minHeight: "60vh"
  },
  loadingSpinner: {
    width: "48px",
    height: "48px",
    border: "3px solid var(--border, #e5e3df)",
    borderTopColor: "#2c5282",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "24px"
  },
  title: {
    fontSize: "clamp(20px, 4vw, 28px)",
    // Responsive title
    fontWeight: "700",
    marginBottom: "clamp(8px, 2vw, 12px)",
    // Responsive margin
    textAlign: "center",
    color: "var(--text-primary, #1b3448)"
  },
  subtitle: {
    fontSize: "16px",
    opacity: 0.7,
    textAlign: "center"
  },
  loadingNote: {
    fontSize: "12px",
    opacity: 0.5,
    marginTop: "16px"
  },
  unsupportedContent: {
    padding: "20px",
    textAlign: "center"
  },
  unsupportedText: {
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "32px",
    color: "var(--text-primary, #1b3448)"
  },
  browserOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px"
  },
  browserOptionsTitle: {
    fontSize: "14px",
    opacity: 0.7,
    marginBottom: "8px"
  },
  browserButton: {
    display: "block",
    padding: "14px 20px",
    backgroundColor: "var(--bg-card, #ffffff)",
    borderRadius: "12px",
    textDecoration: "none",
    color: "#1b3448",
    fontWeight: "500",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  unsupportedNote: {
    fontSize: "14px",
    opacity: 0.6
  },
  termsContainer: {
    padding: "20px",
    paddingBottom: "100px",
    maxWidth: "500px",
    margin: "0 auto"
  },
  termsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px"
  },
  backButton: {
    padding: "12px 16px",
    fontSize: "18px",
    fontWeight: "500",
    opacity: 0.8,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-primary, #1a1a1a)",
    transition: "opacity 0.2s ease"
  },
  termsScroll: {
    maxHeight: "calc(100vh - 200px)",
    overflow: "auto"
  },
  termsSummary: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  termsCard: {
    display: "block",
    width: "100%",
    textAlign: "left",
    backgroundColor: "var(--bg-card, #ffffff)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    cursor: "pointer",
    border: "none"
  },
  termsCardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block"
  },
  termsCardText: {
    fontSize: "14px",
    opacity: 0.7,
    lineHeight: 1.6,
    margin: 0
  },
  termsSectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "16px",
    marginTop: "24px",
    display: "block"
  },
  termsPre: {
    whiteSpace: "pre-wrap",
    fontSize: "13px",
    opacity: 0.7,
    backgroundColor: "var(--bg-card, #ffffff)",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "24px",
    lineHeight: 1.7,
    overflow: "auto"
  },
  primaryButton: {
    display: "block",
    width: "100%",
    padding: "16px 48px",
    marginTop: "24px",
    fontSize: "18px",
    fontWeight: "600",
    backgroundColor: "var(--primary, #2c5282)",
    color: "#ffffff",
    borderRadius: "30px",
    border: "none",
    cursor: "pointer",
    textAlign: "center"
  },
  settingsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "clamp(8px, 2vw, 12px)",
    // Responsive gap
    marginBottom: "clamp(16px, 3vw, 24px)",
    // Responsive margin
    flexShrink: 0
    // Prevent header from shrinking
  },
  settingsItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "16px",
    backgroundColor: "var(--bg-card, #ffffff)",
    borderRadius: "12px",
    marginBottom: "8px",
    fontSize: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    cursor: "pointer",
    border: "none",
    textAlign: "left"
  },
  settingsIcon: {
    fontSize: "20px"
  },
  settingsText: {
    fontSize: "16px"
  },
  dangerItem: {
    color: "#c53030"
  },
  settingsInfo: {
    marginTop: "24px",
    textAlign: "center",
    marginBottom: "16px"
  },
  settingsVersion: {
    fontSize: "12px",
    opacity: 0.5,
    display: "block",
    margin: 0
  },
  settingsInfoText: {
    fontSize: "12px",
    opacity: 0.5,
    display: "block",
    margin: 0
  },
  valuesIntro: {
    fontSize: "16px",
    opacity: 0.7,
    marginBottom: "24px",
    textAlign: "center",
    lineHeight: 1.6,
    display: "block"
  },
  valuesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px"
  },
  valueCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 16px",
    backgroundColor: "var(--bg-card, #ffffff)",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    cursor: "pointer",
    border: "none",
    textAlign: "center"
  },
  valueIcon: {
    fontSize: "32px",
    marginBottom: "8px",
    display: "block"
  },
  valueLabel: {
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "4px",
    display: "block"
  },
  valueDesc: {
    fontSize: "12px",
    opacity: 0.6,
    textAlign: "center",
    display: "block"
  },
  crisisUrgent: {
    padding: "16px",
    backgroundColor: "rgba(197, 48, 48, 0.1)",
    borderRadius: "12px",
    marginBottom: "24px"
  },
  crisisUrgentTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block"
  },
  crisisUrgentText: {
    fontSize: "14px",
    opacity: 0.8,
    margin: 0
  },
  crisisSectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "12px",
    marginTop: "8px",
    display: "block"
  },
  crisisCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "var(--bg-card, #ffffff)",
    borderRadius: "12px",
    marginBottom: "8px"
  },
  crisisCardInfo: {
    display: "flex",
    flexDirection: "column"
  },
  crisisCardName: {
    fontSize: "15px",
    fontWeight: "600",
    display: "block"
  },
  crisisCardDesc: {
    fontSize: "13px",
    opacity: 0.6,
    display: "block"
  },
  crisisCallButton: {
    padding: "10px 20px",
    backgroundColor: "var(--primary, #2c5282)",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500"
  },
  crisisLink: {
    display: "block",
    padding: "14px 16px",
    backgroundColor: "var(--bg-card, #ffffff)",
    borderRadius: "12px",
    marginBottom: "8px",
    color: "var(--primary, #2c5282)",
    textDecoration: "none",
    fontSize: "14px"
  },
  welcomeContainer: {
    padding: "12px",
    paddingBottom: "20px",
    maxWidth: "500px",
    margin: "0 auto"
  },
  welcomeLogoSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "12px",
    marginTop: "8px"
  },
  logoImage: {
    display: "none"
    // Logo now in header
  },
  welcomeTitle: {
    display: "none"
    // Title now in header
  },
  welcomeSubtitle: {
    fontSize: "14px",
    opacity: 0.7,
    textAlign: "center"
  },
  conversationContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 200px)",
    // Account for header (60px) + footer input (80px) + bottom nav (60px)
    maxHeight: "calc(100vh - 200px)",
    overflow: "hidden"
  },
  conversationHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "16px 20px",
    borderBottom: "1px solid var(--border, rgba(0,0,0,0.1))"
  },
  newChatButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "20px",
    backgroundColor: "var(--primary, #2c5282)",
    color: "#ffffff",
    border: "none",
    cursor: "pointer"
  },
  conversationHeading: {
    fontSize: "18px",
    fontWeight: "500",
    color: "var(--text-secondary, #4a5568)",
    textAlign: "center",
    padding: "12px 20px",
    margin: "0 16px",
    lineHeight: 1.4,
    fontStyle: "italic"
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
    scrollBehavior: "smooth",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  messageBubble: {
    maxWidth: "85%",
    padding: "14px 18px",
    borderRadius: "20px",
    marginBottom: "12px"
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "var(--primary, #2c5282)",
    color: "#ffffff"
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "var(--bg-card, #ffffff)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    color: "var(--text-primary, #1b3448)"
  },
  typingIndicator: {
    padding: "12px 16px",
    alignSelf: "flex-start",
    backgroundColor: "var(--bg-card, #ffffff)",
    borderRadius: "20px",
    marginBottom: "12px",
    opacity: 0.5
  },
  quickReplies: {
    display: "flex",
    gap: "8px",
    padding: "12px 20px",
    overflowX: "auto",
    borderTop: "1px solid rgba(0,0,0,0.1)",
    scrollBehavior: "smooth"
  },
  quickReplyButton: {
    padding: "10px 16px",
    backgroundColor: "rgba(2, 41, 91, 0.08)",
    borderRadius: "20px",
    flexShrink: 0,
    cursor: "pointer",
    border: "none",
    fontSize: "14px",
    color: "var(--primary, #2c5282)"
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "500px",
    backgroundColor: "transparent",
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingBottom: "max(20px, env(safe-area-inset-bottom))",
    // Increased for thumb reachability
    paddingTop: "16px",
    // Increased for thumb reachability
    paddingLeft: "12px",
    // Increased for thumb reachability
    paddingRight: "12px",
    // Increased for thumb reachability
    borderTop: "1px solid var(--border, rgba(0,0,0,0.1))",
    zIndex: 100
  },
  bottomNavItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    // Increased gap
    padding: "12px 20px",
    // Increased padding for thumb reachability
    background: "none",
    border: "none",
    cursor: "pointer",
    minWidth: "72px",
    // Increased for thumb reachability
    minHeight: "56px",
    // Increased for thumb reachability (44px minimum + padding)
    opacity: 0.6,
    borderRadius: "12px",
    // Added for better touch target
    transition: "background-color 0.2s ease, opacity 0.2s ease"
  },
  bottomNavItemHover: {
    backgroundColor: "var(--bg-secondary, rgba(248, 247, 244, 0.5))",
    opacity: 0.8
  },
  bottomNavActive: {
    opacity: 1
  },
  bottomNavIcon: {
    fontSize: "24px",
    display: "block"
  },
  bottomNavLabel: {
    fontSize: "11px",
    fontWeight: "500",
    opacity: 0.7,
    color: "var(--text-secondary, #4a5568)"
  },
  breathingWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 80px)",
    padding: "20px"
  },
  chatActions: {
    display: "flex",
    gap: "8px",
    padding: "8px 20px",
    borderBottom: "1px solid var(--border, rgba(0,0,0,0.1))"
  },
  chatActionButton: {
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "16px",
    backgroundColor: "var(--bg-card, rgba(255,255,255,0.8))",
    border: "1px solid var(--border, rgba(0,0,0,0.1))",
    cursor: "pointer",
    color: "var(--text-primary, #1b3448)"
  },
  dateSelector: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    padding: "12px 0",
    marginBottom: "16px",
    scrollBehavior: "smooth"
  },
  dateButton: {
    padding: "8px 12px",
    fontSize: "13px",
    borderRadius: "16px",
    backgroundColor: "var(--bg-card, #ffffff)",
    border: "1px solid var(--border, rgba(0,0,0,0.1))",
    cursor: "pointer",
    whiteSpace: "nowrap",
    color: "var(--text-primary, #1b3448)"
  },
  dateButtonActive: {
    backgroundColor: "var(--primary, #2c5282)",
    color: "#ffffff",
    borderColor: "var(--primary, #2c5282)"
  },
  sessionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  sessionCard: {
    padding: "16px",
    backgroundColor: "var(--bg-card, #ffffff)",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  sessionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px"
  },
  sessionTime: {
    fontSize: "12px",
    padding: "4px 8px",
    backgroundColor: "var(--bg-secondary, rgba(0,0,0,0.05))",
    borderRadius: "8px",
    color: "var(--text-secondary, #4a5568)"
  },
  sessionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-primary, #1b3448)"
  },
  sessionPreview: {
    fontSize: "13px",
    color: "var(--text-secondary, #4a5568)",
    marginBottom: "12px",
    lineHeight: 1.4
  },
  sessionActions: {
    display: "flex",
    gap: "8px"
  },
  sessionAction: {
    padding: "8px 16px",
    fontSize: "12px",
    borderRadius: "12px",
    backgroundColor: "var(--bg-secondary, rgba(0,0,0,0.05))",
    border: "none",
    cursor: "pointer",
    color: "var(--text-primary, #1b3448)"
  },
  helpSection: {
    display: "flex",
    flexDirection: "column",
    gap: "clamp(12px, 2vw, 20px)",
    // Responsive gap
    flex: 1,
    overflowY: "auto"
  },
  helpItem: {
    display: "flex",
    gap: "clamp(12px, 2vw, 16px)",
    // Responsive gap
    padding: "clamp(12px, 2vw, 16px)",
    // Responsive padding
    backgroundColor: "var(--bg-card, #ffffff)",
    borderRadius: "clamp(12px, 2vw, 16px)",
    // Responsive border radius
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    flexShrink: 0
    // Prevent items from shrinking
  },
  helpIcon: {
    fontSize: "clamp(24px, 4vw, 32px)",
    // Responsive icon size
    width: "clamp(40px, 6vw, 48px)",
    // Responsive width
    height: "clamp(40px, 6vw, 48px)",
    // Responsive height
    minWidth: "clamp(40px, 6vw, 48px)",
    // Prevent shrinking
    minHeight: "clamp(40px, 6vw, 48px)",
    // Prevent shrinking
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--bg-secondary, rgba(0,0,0,0.05))",
    borderRadius: "clamp(10px, 2vw, 12px)",
    // Responsive border radius
    flexShrink: 0
    // Prevent icon from shrinking
  },
  helpContent: {
    flex: 1
  },
  helpTitle: {
    fontSize: "clamp(14px, 2.5vw, 16px)",
    // Responsive title
    fontWeight: "600",
    color: "var(--text-primary, #1b3448)",
    marginBottom: "clamp(6px, 1vw, 8px)"
    // Responsive margin
  },
  helpText: {
    fontSize: "clamp(13px, 2vw, 14px)",
    // Responsive text
    color: "var(--text-secondary, #4a5568)",
    lineHeight: 1.5
  },
  helpFooter: {
    marginTop: "clamp(16px, 3vw, 24px)",
    // Responsive margin
    padding: "clamp(12px, 2vw, 16px)",
    // Responsive padding
    backgroundColor: "var(--bg-secondary, rgba(0,0,0,0.05))",
    borderRadius: "clamp(10px, 2vw, 12px)",
    // Responsive border radius
    flexShrink: 0
    // Prevent footer from shrinking
  },
  helpFooterText: {
    fontSize: "clamp(12px, 2vw, 13px)",
    // Responsive text
    color: "var(--text-secondary, #4a5568)",
    textAlign: "center",
    lineHeight: 1.5
  }
};
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
