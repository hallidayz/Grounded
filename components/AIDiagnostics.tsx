import React from 'react';
import { CompatibilityReport, getCompatibilitySummary } from '../services/ai/browserCompatibility';
import { getModelStatus, getCompatibilityReport } from '../services/ai/models';

interface AIDiagnosticsProps {
  className?: string;
}

const AIDiagnostics: React.FC<AIDiagnosticsProps> = ({ className = '' }) => {
  const modelStatus = getModelStatus();
  const compatibility = modelStatus.compatibility || getCompatibilityReport();

  if (!compatibility) {
    return null;
  }

  const getStatusColor = () => {
    if (modelStatus.loaded) return 'text-green-600 dark:text-green-400';
    if (modelStatus.loading) return 'text-yellow-600 dark:text-yellow-400';
    if (!compatibility.canUseAI) return 'text-red-600 dark:text-red-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getStatusIcon = () => {
    if (modelStatus.loaded) return '✅';
    if (modelStatus.loading) return '⏳';
    if (!compatibility.canUseAI) return '❌';
    return '⚠️';
  };

  const getErrorCategoryMessage = () => {
    switch (modelStatus.errorCategory) {
      case 'coop-coep':
        return 'Server configuration required: Enable COOP/COEP headers (see SERVER_CONFIG.md)';
      case 'memory':
        return 'Insufficient device memory: Close other applications or use a device with more RAM';
      case 'webgpu':
        return 'GPU acceleration unavailable: Using CPU-only mode (slower but functional)';
      case 'network':
        return 'Network error: Check your internet connection and try again';
      case 'wasm':
        return 'WebAssembly not supported: Use a modern browser';
      case 'unknown':
        return 'Unknown error: Browser compatibility issue detected';
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4 border border-border-soft dark:border-dark-border">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">{getStatusIcon()}</span>
          <div className="flex-1">
            <h3 className="text-sm font-black text-text-primary dark:text-white mb-1">
              AI Engine Status
            </h3>
            <p className={`text-xs font-bold ${getStatusColor()}`}>
              {getCompatibilitySummary(compatibility)}
            </p>
          </div>
        </div>

        {modelStatus.errorCategory && (
          <div className="mt-3 pt-3 border-t border-border-soft dark:border-dark-border">
            <p className="text-xs text-text-secondary dark:text-text-secondary">
              {getErrorCategoryMessage()}
            </p>
          </div>
        )}
      </div>

      <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4 border border-border-soft dark:border-dark-border space-y-3">
        <h4 className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest">
          Browser Capabilities
        </h4>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={compatibility.sharedArrayBuffer ? 'text-green-600' : 'text-red-600'}>
              {compatibility.sharedArrayBuffer ? '✓' : '✗'}
            </span>
            <span className="text-text-secondary dark:text-text-secondary">SharedArrayBuffer</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={compatibility.crossOriginIsolated ? 'text-green-600' : 'text-red-600'}>
              {compatibility.crossOriginIsolated ? '✓' : '✗'}
            </span>
            <span className="text-text-secondary dark:text-text-secondary">Cross-Origin Isolation</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={compatibility.webGPU ? 'text-green-600' : 'text-yellow-600'}>
              {compatibility.webGPU ? '✓' : '⚠'}
            </span>
            <span className="text-text-secondary dark:text-text-secondary">WebGPU</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={compatibility.wasm ? 'text-green-600' : 'text-red-600'}>
              {compatibility.wasm ? '✓' : '✗'}
            </span>
            <span className="text-text-secondary dark:text-text-secondary">WebAssembly</span>
          </div>
        </div>

        {compatibility.estimatedMemory && (
          <div className="pt-2 border-t border-border-soft dark:border-dark-border">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary dark:text-text-secondary">Estimated Memory</span>
              <span className="font-bold text-text-primary dark:text-white">
                {Math.round(compatibility.estimatedMemory)} MB
              </span>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border-soft dark:border-dark-border">
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary dark:text-text-secondary">Device</span>
            <span className="font-bold text-text-primary dark:text-white capitalize">
              {compatibility.deviceType}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-text-secondary dark:text-text-secondary">Browser</span>
            <span className="font-bold text-text-primary dark:text-white">
              {compatibility.browser} on {compatibility.os}
            </span>
          </div>
        </div>
      </div>

      {compatibility.issues.length > 0 && (
        <div className="bg-yellow-warm/10 dark:bg-yellow-warm/20 rounded-xl p-4 border border-yellow-warm/30 dark:border-yellow-warm/50">
          <h4 className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">
            Issues Detected
          </h4>
          <ul className="space-y-1">
            {compatibility.issues.map((issue, index) => (
              <li key={index} className="text-xs text-text-secondary dark:text-text-secondary flex items-start gap-2">
                <span className="text-yellow-warm mt-0.5">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {compatibility.recommendations.length > 0 && (
        <div className="bg-navy-primary/10 dark:bg-navy-primary/20 rounded-xl p-4 border border-navy-primary/30 dark:border-navy-primary/50">
          <h4 className="text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">
            Recommendations
          </h4>
          <ul className="space-y-1">
            {compatibility.recommendations.map((rec, index) => (
              <li key={index} className="text-xs text-text-secondary dark:text-text-secondary flex items-start gap-2">
                <span className="text-navy-primary dark:text-yellow-warm mt-0.5">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {modelStatus.loaded && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span className="font-bold text-green-700 dark:text-green-300">
              AI models loaded successfully
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={modelStatus.moodTracker ? 'text-green-600' : 'text-red-600'}>
                {modelStatus.moodTracker ? '✓' : '✗'}
              </span>
              <span className="text-text-secondary dark:text-text-secondary">Mood Tracker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={modelStatus.counselingCoach ? 'text-green-600' : 'text-red-600'}>
                {modelStatus.counselingCoach ? '✓' : '✗'}
              </span>
              <span className="text-text-secondary dark:text-text-secondary">Counseling Coach</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDiagnostics;

