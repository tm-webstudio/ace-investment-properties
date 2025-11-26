/**
 * Facebook Pixel Event Tracking
 * Standard events for Ace Investment Properties
 */

// Extend the Window interface to include fbq
declare global {
  interface Window {
    fbq: (action: string, event: string, params?: Record<string, any>) => void;
  }
}

/**
 * Track when a user views a property listing
 */
export const trackViewContent = (propertyId: string, propertyTitle: string, value?: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: propertyTitle,
      content_ids: [propertyId],
      content_type: 'product',
      value: value || 0,
      currency: 'GBP',
    });
  }
};

/**
 * Track when a user searches for properties
 */
export const trackSearch = (searchQuery: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchQuery,
    });
  }
};

/**
 * Track when a user completes registration
 */
export const trackCompleteRegistration = (userType: 'Landlord' | 'Investor') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: `${userType} Registration`,
      status: true,
    });
  }
};

/**
 * Track when a user submits a viewing request (Lead event)
 */
export const trackViewingRequest = (propertyId: string, propertyTitle: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: `Viewing Request - ${propertyTitle}`,
      content_category: 'Viewing Request',
      content_ids: [propertyId],
    });
  }
};

/**
 * Track when a user schedules a confirmed viewing
 */
export const trackSchedule = (propertyId: string, propertyTitle: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Schedule', {
      content_name: `Viewing Scheduled - ${propertyTitle}`,
      content_ids: [propertyId],
    });
  }
};

/**
 * Track when a user initiates contact (phone click, email click)
 */
export const trackContact = (contactType: 'phone' | 'email' | 'message') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Contact', {
      content_name: `Contact via ${contactType}`,
    });
  }
};

/**
 * Track when a landlord submits a property listing
 */
export const trackSubmitApplication = (propertyTitle: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'SubmitApplication', {
      content_name: `Property Listing - ${propertyTitle}`,
      application_type: 'Property Listing',
    });
  }
};

/**
 * Track when a user adds a property to favorites/watchlist
 */
export const trackAddToWishlist = (propertyId: string, propertyTitle: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToWishlist', {
      content_name: propertyTitle,
      content_ids: [propertyId],
      content_type: 'product',
    });
  }
};

/**
 * Track when a user starts the property listing process
 */
export const trackInitiateCheckout = (listingType: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: `Start ${listingType} Listing`,
      content_category: 'Property Listing',
    });
  }
};

/**
 * Track custom events specific to your platform
 */
export const trackCustomEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
};

/**
 * Custom events for Ace Investment Properties
 */
export const customEvents = {
  /**
   * Track when viewing is approved by landlord
   */
  viewingApproved: (propertyId: string, propertyTitle: string) => {
    trackCustomEvent('ViewingApproved', {
      content_name: propertyTitle,
      content_ids: [propertyId],
    });
  },

  /**
   * Track when viewing is rejected
   */
  viewingRejected: (propertyId: string, propertyTitle: string) => {
    trackCustomEvent('ViewingRejected', {
      content_name: propertyTitle,
      content_ids: [propertyId],
    });
  },

  /**
   * Track when property gets matched to investor
   */
  propertyMatched: (propertyId: string, matchScore: number) => {
    trackCustomEvent('PropertyMatched', {
      content_ids: [propertyId],
      match_score: matchScore,
    });
  },

  /**
   * Track when property listing is approved
   */
  propertyApproved: (propertyId: string, propertyTitle: string) => {
    trackCustomEvent('PropertyApproved', {
      content_name: propertyTitle,
      content_ids: [propertyId],
    });
  },

  /**
   * Track when document expires
   */
  documentExpiring: (documentType: string, daysUntilExpiry: number) => {
    trackCustomEvent('DocumentExpiring', {
      document_type: documentType,
      days_until_expiry: daysUntilExpiry,
    });
  },
};

/**
 * Example usage in your components:
 *
 * import { trackViewContent, trackViewingRequest, customEvents } from '@/lib/facebook-pixel';
 *
 * // When viewing a property page
 * trackViewContent('prop-123', 'Modern 2 Bed Apartment', 1200);
 *
 * // When submitting a viewing request
 * trackViewingRequest('prop-123', 'Modern 2 Bed Apartment');
 *
 * // When registering
 * trackCompleteRegistration('Investor');
 *
 * // Custom events
 * customEvents.viewingApproved('prop-123', 'Modern 2 Bed Apartment');
 */
