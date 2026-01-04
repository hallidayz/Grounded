// src/utils/haptics.ts

/**
 * Triggers a haptic feedback vibration on supported devices.
 * This function safely checks for the Vibration API before attempting to use it,
 * preventing errors in unsupported environments like desktop browsers.
 *
 * @param style The intensity of the vibration ('light', 'medium', 'heavy').
 *              Defaults to 'light'.
 */
export const triggerHapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'light'): void => {
  // Ensure code only runs in the browser and the Vibration API is available
  if (typeof window !== 'undefined' && 'vibrate' in window.navigator) {
    try {
      // Use different vibration patterns for different styles
      switch (style) {
        case 'heavy':
          window.navigator.vibrate(100); // A single, strong vibration
          break;
        case 'medium':
          window.navigator.vibrate(40); // A medium vibration
          break;
        case 'light':
        default:
          window.navigator.vibrate(10); // A short, light vibration
          break;
      }
    } catch (error) {
      // Log errors silently if vibration fails for any reason
      console.warn("Haptic feedback failed:", error);
    }
  }
};

