import { hasAgreedToTerms, TERMS_VERSION } from '../src/services/settings';

describe('Settings Service - hasAgreedToTerms', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('returns false when no agreement exists', () => {
    expect(hasAgreedToTerms()).toBe(false);
  });

  it('returns true when a valid agreement exists', () => {
    const validAgreement = {
      agreed: true,
      version: TERMS_VERSION,
      agreedAt: new Date().toISOString()
    };
    window.localStorage.setItem('acminds_terms_agreement', JSON.stringify(validAgreement));
    expect(hasAgreedToTerms()).toBe(true);
  });

  it('returns false when agreed is false', () => {
    const invalidAgreement = {
      agreed: false,
      version: TERMS_VERSION
    };
    window.localStorage.setItem('acminds_terms_agreement', JSON.stringify(invalidAgreement));
    expect(hasAgreedToTerms()).toBe(false);
  });

  it('returns false when version does not match', () => {
    const invalidAgreement = {
      agreed: true,
      version: '0.9.0' // Old version
    };
    window.localStorage.setItem('acminds_terms_agreement', JSON.stringify(invalidAgreement));
    expect(hasAgreedToTerms()).toBe(false);
  });

  it('returns false when stored value is invalid JSON', () => {
    window.localStorage.setItem('acminds_terms_agreement', 'not-valid-json');
    expect(hasAgreedToTerms()).toBe(false);
  });
});
