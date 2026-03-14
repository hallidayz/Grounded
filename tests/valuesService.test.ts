import { createSelection } from '../src/services/valuesService';

describe('valuesService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('createSelection', () => {
    it('creates a selection with the given value and category', () => {
      const selection = createSelection('Courage', 'Action');

      expect(selection).toEqual({
        value: 'Courage',
        category: 'Action',
        selectedAt: '2023-01-01T00:00:00.000Z',
      });
    });

    it('handles empty strings for value and category', () => {
      const selection = createSelection('', '');

      expect(selection).toEqual({
        value: '',
        category: '',
        selectedAt: '2023-01-01T00:00:00.000Z',
      });
    });
  });
});
