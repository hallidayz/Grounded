import { scaleBalanceAnimation } from '../src/utils/animations';

describe('scaleBalanceAnimation', () => {
  test('returns correct rotation for positive balance within bounds', () => {
    const result = scaleBalanceAnimation(2);
    expect(result.rotate).toBe(6);
  });

  test('returns correct rotation for negative balance within bounds', () => {
    const result = scaleBalanceAnimation(-2);
    expect(result.rotate).toBe(-6);
  });

  test('returns zero rotation for zero balance', () => {
    const result = scaleBalanceAnimation(0);
    expect(result.rotate).toBe(0);
  });

  test('caps positive rotation at 15 degrees', () => {
    const result = scaleBalanceAnimation(10);
    expect(result.rotate).toBe(15);
  });

  test('caps negative rotation at -15 degrees', () => {
    const result = scaleBalanceAnimation(-10);
    expect(result.rotate).toBe(-15);
  });

  test('returns correct animation properties', () => {
    const result = scaleBalanceAnimation(1);
    expect(result.type).toBe('spring');
    expect(result.stiffness).toBe(100);
    expect(result.damping).toBe(10);
  });
});
