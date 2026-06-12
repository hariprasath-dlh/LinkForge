// Password validation utility for LinkForge
// Rules: min 8 chars, 1 uppercase, 1 number, 1 special character

export const PASSWORD_RULES = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

export const PASSWORD_ERRORS = {
  required: 'Password is required.',
  minLength: 'Password must be at least 8 characters.',
  hasUppercase: 'Password must contain at least one uppercase letter.',
  hasNumber: 'Password must contain at least one number.',
  hasSpecialChar: 'Password must contain at least one special character.',
};

// Returns null if password is valid
// Returns error message string if password is invalid
export function validatePassword(password: string): string | null {
  if (!password || password.trim() === '') {
    return PASSWORD_ERRORS.required;
  }
  if (password.length < PASSWORD_RULES.minLength) {
    return PASSWORD_ERRORS.minLength;
  }
  if (!PASSWORD_RULES.hasUppercase.test(password)) {
    return PASSWORD_ERRORS.hasUppercase;
  }
  if (!PASSWORD_RULES.hasNumber.test(password)) {
    return PASSWORD_ERRORS.hasNumber;
  }
  if (!PASSWORD_RULES.hasSpecialChar.test(password)) {
    return PASSWORD_ERRORS.hasSpecialChar;
  }
  return null;
}

// Returns object of all failing rules for live indicator display
export function getPasswordStrength(password: string) {
  return {
    minLength: password.length >= PASSWORD_RULES.minLength,
    hasUppercase: PASSWORD_RULES.hasUppercase.test(password),
    hasNumber: PASSWORD_RULES.hasNumber.test(password),
    hasSpecialChar: PASSWORD_RULES.hasSpecialChar.test(password),
  };
}

// Returns strength label based on rules passed
// 0-1 rules = Weak, 2-3 rules = Medium, 4 rules = Strong
export function getPasswordStrengthLabel(password: string): { label: 'Weak' | 'Medium' | 'Strong'; color: 'red' | 'orange' | 'green' } {
  const strength = getPasswordStrength(password);
  const passed = Object.values(strength).filter(Boolean).length;
  if (passed <= 1) return { label: 'Weak', color: 'red' };
  if (passed <= 3) return { label: 'Medium', color: 'orange' };
  return { label: 'Strong', color: 'green' };
}
