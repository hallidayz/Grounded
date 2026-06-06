import { expect, test, describe } from "bun:test";
import { logEnergySelection } from "../src/services/energyTrackingService";

// We need to mock sessionStorage for bun test
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
});

describe("Security ID Generation", () => {
  test("energyTrackingService should generate unique and secure-looking IDs", async () => {
    await logEnergySelection('high');

    const listKey = 'energy_interactions_list';
    const existing = sessionStorage.getItem(listKey);
    const list = existing ? JSON.parse(existing) : [];

    expect(list.length).toBeGreaterThan(0);

    const id = list[0];
    console.log("Generated ID:", id);

    // Check if it follows the new format: energy_<uuid>
    // UUID v4 format is 8-4-4-4-12 hex chars
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const parts = id.split('_');
    expect(parts[0]).toBe('energy');

    // In bun test environment, crypto.randomUUID should be available if polyfilled or native
    // If it used the fallback, it would be different, but let's see what it produced
    if (parts.length === 2) {
        expect(parts[1]).toMatch(uuidRegex);
    } else {
        // Fallback format: energy_<timestamp>_<rand>_<rand>
        expect(parts.length).toBe(4);
    }
  });

  test("IDs should be unique across multiple generations", async () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
        await logEnergySelection('low');
    }

    const listKey = 'energy_interactions_list';
    const list = JSON.parse(sessionStorage.getItem(listKey) || "[]");

    for (const id of list) {
        ids.add(id);
    }

    expect(ids.size).toBe(list.length);
  });
});
