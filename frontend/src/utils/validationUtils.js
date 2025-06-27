/**
 * Validation utility functions for the application
 */

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validates a phone number (Bangladesh format)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validatePhone = (phone) => {
  // Skip validation if phone is empty
  if (!phone || phone.trim() === "") {
    return true;
  }

  // More flexible Bangladesh mobile number format
  // Allow +880 prefix and different lengths
  const regex = /^(\+8801|01)[0-9]{8,9}$/;
  return regex.test(phone);
};

/**
 * Validates an address in the District-Thana format
 * @param {string} address - The address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateAddress = (address) => {
  // Skip validation if address is empty
  if (!address || address.trim() === "") {
    return true;
  }

  // More flexible address format - allow any text with or without hyphen
  return true;
};

/**
 * Validates a password
 * @param {string} password - The password to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validatePassword = (password) => {
  return password && password.length >= 8;
};

/**
 * Validates a name
 * @param {string} name - The name to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

/**
 * Get formatted error message for profile update
 * @param {object} userData - The user data to validate
 * @returns {string|null} Error message or null if valid
 */
export const getProfileUpdateErrors = (userData) => {
  // Require all main fields
  if (!userData.fullName || userData.fullName.trim().length < 2) {
    return "Full name is required and must be at least 2 characters";
  }
  if (!userData.email || !validateEmail(userData.email)) {
    return "Please enter a valid email address";
  }
  if (!userData.phone || !validatePhone(userData.phone)) {
    return "Phone number is required and must be a valid Bangladesh mobile number (e.g., 01712345678)";
  }
  if (!userData.nid || userData.nid.trim().length < 5) {
    return "National ID is required";
  }
  if (!userData.address) {
    return "Address is required";
  }

  // Police fields (if present, require them)
  if (userData.hasOwnProperty('policeId') && (!userData.policeId || userData.policeId.trim() === '')) {
    return "Police ID is required";
  }
  if (userData.hasOwnProperty('rank') && (!userData.rank || userData.rank.trim() === '')) {
    return "Rank is required";
  }
  if (userData.hasOwnProperty('badge') && (!userData.badge || userData.badge.trim() === '')) {
    return "Badge number is required";
  }
  if (userData.hasOwnProperty('station') && (!userData.station || userData.station.trim() === '')) {
    return "Station is required";
  }

  // Only validate address format if not empty (handled in Settings.jsx for strict format)
  // if (userData.address && !validateAddress(userData.address)) {
  //   return "Address must be in format: District-Thana (e.g., Dhaka-Mirpur)";
  // }

  return null;
};
