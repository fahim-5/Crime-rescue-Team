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
  // Bangladesh mobile number format: 01xxxxxxxxx
  const regex = /^01[3-9]\d{8}$/;
  return regex.test(phone);
};

/**
 * Validates an address in the District-Thana format
 * @param {string} address - The address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateAddress = (address) => {
  // Format: District-Thana (e.g., Dhaka-Mirpur)
  const regex = /^[a-zA-Z\s]+-[a-zA-Z\s]+$/;
  return regex.test(address);
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
  if (!validateName(userData.fullName)) {
    return "Full name must be at least 2 characters";
  }

  if (!validateEmail(userData.email)) {
    return "Please enter a valid email address";
  }

  if (!validatePhone(userData.phone)) {
    return "Please enter a valid Bangladesh mobile number (e.g., 01712345678)";
  }

  if (!validateAddress(userData.address)) {
    return "Address must be in format: District-Thana (e.g., Dhaka-Mirpur)";
  }

  return null;
};
