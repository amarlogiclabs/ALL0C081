/**
 * Auth validation utilities for sign-in and sign-up forms
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns Error message if invalid, undefined if valid
 */
export function validateEmail(email: string): string | undefined {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return undefined;
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Error message if invalid, undefined if valid
 */
export function validatePassword(password: string): string | undefined {
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  return undefined;
}

/**
 * Validates username
 * @param username - Username to validate
 * @returns Error message if invalid, undefined if valid
 */
export function validateUsername(username: string): string | undefined {
  if (!username || username.length < 3) {
    return "Username must be at least 3 characters";
  }
  return undefined;
}

/**
 * Validates sign-in credentials
 * @param email - Email address
 * @param password - Password
 * @returns Error message if any field is invalid, undefined if all valid
 */
export function validateSignIn(email: string, password: string): string | undefined {
  const emailError = validateEmail(email);
  if (emailError) return emailError;

  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;

  return undefined;
}

/**
 * Validates sign-up credentials
 * @param email - Email address
 * @param password - Password
 * @param username - Username
 * @returns Error message if any field is invalid, undefined if all valid
 */
export function validateSignUp(email: string, password: string, username: string): string | undefined {
  const emailError = validateEmail(email);
  if (emailError) return emailError;

  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;

  const usernameError = validateUsername(username);
  if (usernameError) return usernameError;

  return undefined;
}
