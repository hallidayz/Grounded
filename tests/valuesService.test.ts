import { getSelections } from '../src/services/valuesService';

describe('valuesService loadRaw error handling', () => {
  let getItemSpy: jest.SpyInstance;

  beforeEach(() => {
    getItemSpy = jest.spyOn(window.localStorage, 'getItem');
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    window.localStorage.clear();
  });

  test('should return default state when localStorage contains invalid JSON', () => {
    getItemSpy.mockReturnValue('{ invalid json');
    const result = getSelections();
    expect(result).toEqual({ userId: 'local', selections: [] });
  });

  test('should return default state when localStorage contains JSON but missing required fields', () => {
    getItemSpy.mockReturnValue(JSON.stringify({ wrongField: true }));
    const result = getSelections();
    expect(result).toEqual({ userId: 'local', selections: [] });
  });

  test('should return default state when localStorage contains JSON with incorrect types', () => {
    getItemSpy.mockReturnValue(JSON.stringify({ userId: 123, selections: {} }));
    const result = getSelections();
    expect(result).toEqual({ userId: 'local', selections: [] });
  });

  test('should return parsed data when localStorage contains valid data', () => {
    const validData = { userId: 'local', selections: [{ value: 'test', category: 'test', selectedAt: 'now' }] };
    getItemSpy.mockReturnValue(JSON.stringify(validData));
    const result = getSelections();
    expect(result).toEqual(validData);
  });

  test('should return default state when localStorage is empty', () => {
    getItemSpy.mockReturnValue(null);
    const result = getSelections();
    expect(result).toEqual({ userId: 'local', selections: [] });
  });

  test('should return default state and catch error when localStorage throws', () => {
    getItemSpy.mockImplementation(() => {
      throw new Error('Access Denied');
    });
    const result = getSelections();
    expect(result).toEqual({ userId: 'local', selections: [] });
  });
});
