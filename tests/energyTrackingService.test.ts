import { logTechniqueRepeat } from '../src/services/energyTrackingService';

describe('logTechniqueRepeat', () => {
  const originalError = console.error;
  let mockError: jest.Mock;

  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();

    // Mock console.error
    mockError = jest.fn();
    console.error = mockError;
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalError;

    // Clear all mocks
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should log technique repeat successfully', async () => {
    // Arrange
    const energyLevel = 'medium';
    const techniqueId = 'test-technique';
    const techniqueName = 'Test Technique';
    const repeatCount = 2;

    // Act
    await logTechniqueRepeat(energyLevel, techniqueId, techniqueName, repeatCount);

    // Assert
    // Check if session ID was created
    const sessionId = sessionStorage.getItem('energyCheckInSessionId');
    expect(sessionId).toBeTruthy();

    // Check if interaction was saved to the list
    const listJson = sessionStorage.getItem('energy_interactions_list');
    expect(listJson).toBeTruthy();

    const list = JSON.parse(listJson as string);
    expect(list.length).toBe(1);

    // Check if the specific interaction was saved
    const interactionJson = sessionStorage.getItem(`energy_interaction_${list[0]}`);
    expect(interactionJson).toBeTruthy();

    const interaction = JSON.parse(interactionJson as string);
    expect(interaction.type).toBe('energy_checkin');
    expect(interaction.sessionId).toBe(sessionId);

    // Verify metadata
    const metadata = JSON.parse(interaction.metadata);
    expect(metadata.action).toBe('technique_repeat');
    expect(metadata.energyLevel).toBe(energyLevel);
    expect(metadata.techniqueId).toBe(techniqueId);
    expect(metadata.techniqueName).toBe(techniqueName);
    expect(metadata.repeatCount).toBe(repeatCount);
  });

  it('should handle errors when saving fails', async () => {
    // Arrange
    const energyLevel = 'medium';
    const techniqueId = 'test-technique';
    const techniqueName = 'Test Technique';
    const repeatCount = 2;

    const testError = new Error('Mock Date error');

    // To hit the error path inside `logTechniqueRepeat` directly (before `saveInteraction`),
    // we mock `Date.prototype.toISOString` to throw an error since it's called inside the try block.
    // Note: `saveInteraction` catches errors from `sessionStorage.setItem` and logs a warning,
    // so mocking `sessionStorage.setItem` to throw will only hit `console.warn` inside `saveInteraction`,
    // and not the `console.error` inside the catch block of `logTechniqueRepeat`.
    const originalToISOString = Date.prototype.toISOString;
    jest.spyOn(Date.prototype, 'toISOString').mockImplementation(() => {
      throw testError;
    });

    try {
      // Act
      await logTechniqueRepeat(energyLevel, techniqueId, techniqueName, repeatCount);

      // Assert
      expect(mockError).toHaveBeenCalledTimes(1);
      expect(mockError).toHaveBeenCalledWith(
        '[EnergyTracking] Error logging technique repeat:',
        testError
      );
    } finally {
      // Clean up
      Date.prototype.toISOString = originalToISOString;
    }
  });
});
