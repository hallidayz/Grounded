import { expect, test, describe, beforeEach, afterEach, spyOn, mock } from "bun:test";
import { hasAgreedToTerms, TERMS_VERSION } from "../src/services/settings";

describe("hasAgreedToTerms", () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Save original if needed, though we will mock global.localStorage
    originalLocalStorage = global.localStorage;

    // Create a mock implementation
    global.localStorage = {
      getItem: mock(() => null),
      setItem: mock(),
      removeItem: mock(),
      clear: mock(),
      length: 0,
      key: mock(() => null)
    } as unknown as Storage;
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
  });

  test("returns false when no agreement exists", () => {
    (global.localStorage.getItem as any).mockReturnValue(null);
    expect(hasAgreedToTerms()).toBe(false);
  });

  test("returns true when valid agreement exists", () => {
    const validAgreement = JSON.stringify({
      agreed: true,
      version: TERMS_VERSION
    });
    (global.localStorage.getItem as any).mockReturnValue(validAgreement);
    expect(hasAgreedToTerms()).toBe(true);
  });

  test("returns false when agreement is invalid JSON", () => {
    (global.localStorage.getItem as any).mockReturnValue("{ invalid json");
    expect(hasAgreedToTerms()).toBe(false);
  });

  test("returns false when localStorage.getItem throws an error", () => {
    (global.localStorage.getItem as any).mockImplementation(() => {
      throw new Error("Access denied to localStorage");
    });
    expect(hasAgreedToTerms()).toBe(false);
  });
});
