/**
 * Browser Compatibility Detection for ONNX Runtime
 * 
 * Checks browser capabilities required for AI model execution:
 * - SharedArrayBuffer availability (requires COOP/COEP headers)
 * - Cross-origin isolation status
 * - Memory constraints
 * - WebGPU support
 * - WASM support
 * - Browser/device type
 */

export interface CompatibilityReport {
  sharedArrayBuffer: boolean;
  crossOriginIsolated: boolean;
  webGPU: boolean;
  wasm: boolean;
  estimatedMemory: number | null; // MB
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser: string;
  os: string;
  isCompatible: boolean;
  issues: string[];
  recommendations: string[];
  canUseAI: boolean;
  suggestedStrategy: 'standard' | 'single-threaded' | 'low-memory' | 'cpu-only' | 'unavailable';
}

/**
 * Check if SharedArrayBuffer is available
 * Requires COOP/COEP headers to be set on the server
 */
function checkSharedArrayBuffer(): boolean {
  try {
    // SharedArrayBuffer is only available in cross-origin isolated contexts
    return typeof SharedArrayBuffer !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Check if cross-origin isolation is enabled
 * This is required for SharedArrayBuffer
 */
function checkCrossOriginIsolated(): boolean {
  try {
    // crossOriginIsolated is a read-only property
    return (self as any).crossOriginIsolated === true;
  } catch {
    return false;
  }
}

/**
 * Check WebGPU support
 */
function checkWebGPU(): boolean {
  try {
    return 'gpu' in navigator && navigator.gpu !== undefined;
  } catch {
    return false;
  }
}

/**
 * Check WASM support
 * Enhanced check that also verifies WebAssembly can actually be instantiated
 */
function checkWASM(): boolean {
  try {
    // Basic check
    if (typeof WebAssembly === 'undefined') {
      return false;
    }
    
    // Check for required methods
    if (typeof WebAssembly.instantiate !== 'function' && 
        typeof WebAssembly.compile !== 'function') {
      return false;
    }
    
    // Try to create a minimal WASM module to verify it actually works
    // This catches cases where WASM is disabled by CSP or other policies
    try {
      // Create a minimal valid WASM binary (module with empty function)
      // This is a valid WASM module: (module)
      const wasmBytes = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
      
      // Try to compile it (async, but we can't await here, so just check if method exists)
      if (WebAssembly.validate) {
        const isValid = WebAssembly.validate(wasmBytes);
        return isValid;
      }
      
      // If validate doesn't exist, assume WASM is available if the object exists
      return true;
    } catch (validationError) {
      // If validation fails, WASM might be blocked by CSP
      console.warn('[BrowserCompatibility] WASM validation failed:', validationError);
      // Still return true if WebAssembly object exists - let runtime handle errors
      return true;
    }
  } catch (error) {
    console.error('[BrowserCompatibility] Error checking WASM support:', error);
    return false;
  }
}

/**
 * Estimate available device memory
 * Returns memory in MB, or null if not available
 */
function estimateMemory(): number | null {
  try {
    // @ts-ignore - navigator.deviceMemory is not in all type definitions
    if ('deviceMemory' in navigator && navigator.deviceMemory) {
      // deviceMemory is in GB, convert to MB
      return navigator.deviceMemory * 1024;
    }
    
    // Fallback: Estimate based on user agent and device type
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    
    if (isMobile) {
      // Conservative estimate for mobile devices
      return 2048; // 2GB
    }
    
    // Desktop typically has more memory
    return 4096; // 4GB default
  } catch {
    return null;
  }
}

/**
 * Detect device type
 */
function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  try {
    const ua = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      return 'mobile';
    }
    
    if (/windows|macintosh|linux/i.test(ua)) {
      return 'desktop';
    }
    
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Detect browser name
 */
function detectBrowser(): string {
  try {
    const ua = navigator.userAgent;
    
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Detect operating system
 */
function detectOS(): string {
  try {
    const ua = navigator.userAgent;
    
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Generate compatibility report with issues and recommendations
 */
function generateReport(
  sharedArrayBuffer: boolean,
  crossOriginIsolated: boolean,
  webGPU: boolean,
  wasm: boolean,
  memory: number | null,
  deviceType: string,
  browser: string,
  os: string
): CompatibilityReport {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let canUseAI = true;
  let suggestedStrategy: CompatibilityReport['suggestedStrategy'] = 'standard';
  
  // Check SharedArrayBuffer requirement
  if (!sharedArrayBuffer) {
    issues.push('SharedArrayBuffer is not available');
    recommendations.push('Enable COOP/COEP headers on your server (see SERVER_CONFIG.md)');
    canUseAI = false; // Critical for multi-threaded performance
    suggestedStrategy = 'single-threaded';
  }
  
  // Check cross-origin isolation
  if (!crossOriginIsolated) {
    issues.push('Cross-origin isolation is not enabled');
    if (!sharedArrayBuffer) {
      recommendations.push('Set Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp headers');
    }
  }
  
  // Check WASM (critical)
  if (!wasm) {
    issues.push('WebAssembly is not supported');
    recommendations.push('Use a modern browser that supports WebAssembly');
    canUseAI = false;
    suggestedStrategy = 'unavailable';
  }
  
  // Check memory constraints
  if (memory !== null) {
    if (memory < 1024) {
      issues.push(`Low device memory detected (${Math.round(memory)}MB)`);
      recommendations.push('Use smaller models or close other applications');
      suggestedStrategy = 'low-memory';
    } else if (memory < 2048) {
      issues.push(`Limited device memory (${Math.round(memory)}MB)`);
      recommendations.push('Consider using smaller models for better performance');
      if (suggestedStrategy === 'standard') {
        suggestedStrategy = 'low-memory';
      }
    }
  }
  
  // Check WebGPU (optional but helpful)
  if (!webGPU) {
    issues.push('WebGPU is not available');
    recommendations.push('GPU acceleration unavailable - will use CPU only');
    if (suggestedStrategy === 'standard') {
      suggestedStrategy = 'cpu-only';
    }
  }
  
  // Mobile-specific considerations
  if (deviceType === 'mobile' && memory !== null && memory < 3072) {
    issues.push('Mobile device with limited memory');
    recommendations.push('AI models may be slow or unavailable on this device');
    if (suggestedStrategy === 'standard') {
      suggestedStrategy = 'low-memory';
    }
  }
  
  // Determine if AI can be used
  if (!wasm) {
    canUseAI = false;
    suggestedStrategy = 'unavailable';
  } else if (!sharedArrayBuffer && !crossOriginIsolated) {
    // Can still try single-threaded mode
    canUseAI = true;
    suggestedStrategy = 'single-threaded';
  }
  
  const isCompatible = wasm && (sharedArrayBuffer || crossOriginIsolated);
  
  return {
    sharedArrayBuffer,
    crossOriginIsolated,
    webGPU,
    wasm,
    estimatedMemory: memory,
    deviceType: deviceType as CompatibilityReport['deviceType'],
    browser,
    os,
    isCompatible,
    issues,
    recommendations,
    canUseAI,
    suggestedStrategy
  };
}

/**
 * Run comprehensive browser compatibility check
 * @returns CompatibilityReport with detailed diagnostics
 */
export function checkBrowserCompatibility(): CompatibilityReport {
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

/**
 * Get a user-friendly summary of compatibility status
 */
export function getCompatibilitySummary(report: CompatibilityReport): string {
  if (!report.canUseAI) {
    return 'AI models unavailable - browser compatibility issue';
  }
  
  if (report.suggestedStrategy === 'unavailable') {
    return 'AI models unavailable - WebAssembly not supported';
  }
  
  if (report.suggestedStrategy === 'single-threaded') {
    return 'AI models available (single-threaded mode) - enable COOP/COEP headers for better performance';
  }
  
  if (report.suggestedStrategy === 'low-memory') {
    return 'AI models available (low-memory mode) - may be slower';
  }
  
  if (report.suggestedStrategy === 'cpu-only') {
    return 'AI models available (CPU-only mode) - GPU acceleration unavailable';
  }
  
  return 'AI models available - all features supported';
}

