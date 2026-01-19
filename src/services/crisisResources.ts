/**
 * Crisis Resources Data
 * 
 * Region-specific crisis resources with functional tel: and sms: links.
 * Supports US, UK, Canada, Australia, and International/Default.
 */

export type Region = 'US' | 'UK' | 'CA' | 'AU' | 'INTL';

export interface CrisisResource {
  name: string;
  displayName: string;
  callAction?: string; // tel: URI
  textAction?: string; // sms: URI
  textBody?: string; // Body text for SMS
  buttonLabel: string;
  subtext: string;
  url?: string;
}

export interface RegionResources {
  primary: CrisisResource;
  secondary?: CrisisResource;
  lgbtq?: CrisisResource;
  domesticViolence?: CrisisResource;
}

/**
 * United States Crisis Resources
 */
const US_RESOURCES: RegionResources = {
  primary: {
    name: '988',
    displayName: '988 Suicide & Crisis Lifeline',
    callAction: 'tel:988',
    textAction: 'sms:988',
    buttonLabel: 'Call or Text 988',
    subtext: 'Confidential support for people in distress. Available 24/7.',
    url: 'https://988lifeline.org/',
  },
  secondary: {
    name: 'CrisisTextLine',
    displayName: 'Crisis Text Line',
    textAction: 'sms:741741',
    textBody: 'HOME',
    buttonLabel: 'Text HOME to 741741',
    subtext: 'Free, 24/7 crisis support via text message.',
    url: 'https://www.crisistextline.org/',
  },
  lgbtq: {
    name: 'TrevorProject',
    displayName: 'The Trevor Project',
    textAction: 'sms:678678',
    textBody: 'START',
    buttonLabel: 'Text START to 678-678',
    subtext: 'LGBTQ+ specific crisis support. Available 24/7.',
    url: 'https://www.thetrevorproject.org/',
  },
  domesticViolence: {
    name: 'NDVH',
    displayName: 'National Domestic Violence Hotline',
    callAction: 'tel:18007997233',
    textAction: 'sms:88788',
    textBody: 'START',
    buttonLabel: 'Call 1-800-799-SAFE (7233)',
    subtext: '24/7 support for domestic violence.',
    url: 'https://www.thehotline.org/',
  },
};

/**
 * United Kingdom Crisis Resources
 */
const UK_RESOURCES: RegionResources = {
  primary: {
    name: 'Samaritans',
    displayName: 'Samaritans UK',
    callAction: 'tel:116123',
    buttonLabel: 'Call 116 123',
    subtext: 'Available 24 hours a day, 365 days a year.',
    url: 'https://www.samaritans.org/',
  },
  secondary: {
    name: 'Shout',
    displayName: 'Shout',
    textAction: 'sms:85258',
    textBody: 'SHOUT',
    buttonLabel: 'Text SHOUT to 85258',
    subtext: 'Free, confidential, 24/7 text support.',
    url: 'https://giveusashout.org/',
  },
  domesticViolence: {
    name: 'Refuge',
    displayName: 'Refuge National Domestic Abuse Helpline',
    callAction: 'tel:08082000247',
    buttonLabel: 'Call 0808 2000 247',
    subtext: '24/7 support for domestic abuse.',
    url: 'https://www.nationaldahelpline.org.uk/',
  },
};

/**
 * Canada Crisis Resources
 */
const CA_RESOURCES: RegionResources = {
  primary: {
    name: '988',
    displayName: 'Suicide Crisis Helpline',
    callAction: 'tel:988',
    textAction: 'sms:988',
    buttonLabel: 'Call or Text 988',
    subtext: 'Available 24/7 for suicide prevention and crisis support.',
    url: 'https://www.crisisservicescanada.ca/',
  },
  secondary: {
    name: 'KidsHelpPhone',
    displayName: 'Kids Help Phone (Youth)',
    textAction: 'sms:686868',
    textBody: 'CONNECT',
    buttonLabel: 'Text CONNECT to 686868',
    subtext: 'Free, confidential support for youth. Available 24/7.',
    url: 'https://kidshelpphone.ca/',
  },
};

/**
 * Australia Crisis Resources
 */
const AU_RESOURCES: RegionResources = {
  primary: {
    name: 'Lifeline',
    displayName: 'Lifeline',
    callAction: 'tel:131114',
    buttonLabel: 'Call 13 11 14',
    subtext: 'Available 24/7 for crisis support and suicide prevention.',
    url: 'https://www.lifeline.org.au/',
  },
  secondary: {
    name: 'BeyondBlue',
    displayName: 'Beyond Blue',
    callAction: 'tel:1300224636',
    buttonLabel: 'Call 1300 22 4636',
    subtext: '24/7 support for anxiety, depression, and suicide prevention.',
    url: 'https://www.beyondblue.org.au/',
  },
};

/**
 * International/Default Crisis Resources
 */
const INTL_RESOURCES: RegionResources = {
  primary: {
    name: 'Befrienders',
    displayName: 'Befrienders Worldwide',
    buttonLabel: 'Visit befrienders.org',
    subtext: 'Global directory of crisis support centers.',
    url: 'https://www.befrienders.org/',
  },
  secondary: {
    name: 'IASP',
    displayName: 'IASP Resources',
    buttonLabel: 'Visit iasp.info',
    subtext: 'International Association for Suicide Prevention resources.',
    url: 'https://www.iasp.info/resources/Crisis_Centres',
  },
};

/**
 * Get region-specific crisis resources
 */
export function getCrisisResources(region: Region = 'US'): RegionResources {
  switch (region) {
    case 'US':
      return US_RESOURCES;
    case 'UK':
      return UK_RESOURCES;
    case 'CA':
      return CA_RESOURCES;
    case 'AU':
      return AU_RESOURCES;
    case 'INTL':
    default:
      return INTL_RESOURCES;
  }
}

/**
 * Detect user's region from browser locale
 */
export function detectRegion(): Region {
  if (typeof window === 'undefined') {
    return 'US'; // Default
  }
  
  const locale = navigator.language || navigator.languages?.[0] || 'en-US';
  const country = locale.split('-')[1]?.toUpperCase();
  
  switch (country) {
    case 'US':
      return 'US';
    case 'GB':
      return 'UK';
    case 'CA':
      return 'CA';
    case 'AU':
      return 'AU';
    default:
      return 'INTL';
  }
}

/**
 * Build SMS URI with body text
 */
export function buildSMSUri(number: string, body?: string): string {
  // iOS uses & for body, Android uses ?
  const separator = /iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?';
  const bodyParam = body ? `${separator}body=${encodeURIComponent(body)}` : '';
  return `sms:${number}${bodyParam}`;
}
