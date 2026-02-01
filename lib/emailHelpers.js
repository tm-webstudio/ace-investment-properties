/**
 * Email Helper Functions
 * Utility functions for formatting data in email templates
 */

/**
 * Format a date for email display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string (e.g., "Monday, 15 January 2026")
 */
export function formatDate(date) {
  if (!date) return '';

  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a time for email display
 * @param {string} time - Time string in HH:mm format
 * @returns {string} Formatted time string (e.g., "02:00 PM")
 */
export function formatTime(time) {
  if (!time) return '';

  // Handle both "HH:mm" and "HH:mm:ss" formats
  const timeParts = time.split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = timeParts[1];

  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes} ${period}`;
}

/**
 * Format document type for display
 * @param {string} type - Document type slug
 * @returns {string} Human-readable document type
 */
export function formatDocType(type) {
  const types = {
    'gas_safety': 'Gas Safety Certificate',
    'gas_safety_certificate': 'Gas Safety Certificate',
    'epc': 'EPC Certificate',
    'epc_certificate': 'EPC Certificate',
    'electrical_safety': 'Electrical Safety Certificate',
    'electrical_safety_certificate': 'Electrical Safety Certificate',
    'insurance_policy': 'Insurance Policy',
    'insurance': 'Insurance Policy',
    'hmo_license': 'HMO Licence',
    'hmo_licence': 'HMO Licence',
    'landlord_insurance': 'Landlord Insurance',
    'building_insurance': 'Building Insurance'
  };

  return types[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Calculate days until a date
 * @param {string|Date} date - Future date
 * @returns {number} Days until date (negative if in past)
 */
export function calculateDaysUntil(date) {
  if (!date) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get user's display name from profile
 * @param {object} user - User object with first_name, last_name, or full_name
 * @returns {string} Display name
 */
export function getUserDisplayName(user) {
  if (!user) return 'User';

  if (user.full_name) return user.full_name;
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
  if (user.first_name) return user.first_name;
  if (user.name) return user.name;

  return 'User';
}

/**
 * Format property address for email
 * @param {object} property - Property object with address fields
 * @returns {string} Formatted address
 */
export function formatPropertyAddress(property) {
  if (!property) return '';

  // If there's a full address field, use it
  if (property.address) return property.address;

  // Otherwise, build from components
  const parts = [
    property.street_address,
    property.city,
    property.postcode
  ].filter(Boolean);

  return parts.join(', ');
}
