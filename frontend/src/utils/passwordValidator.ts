export type PasswordStrength = 'low' | 'medium' | 'high';

export interface PasswordValidation {
  isValid: boolean;
  strength: PasswordStrength;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  message: string;
}

const COMMON_PATTERNS = [
  /^123/,
  /password/i,
  /qwerty/i,
  /abc/i,
  /111/,
  /000/,
  /admin/i,
];

export const validatePassword = (password: string): PasswordValidation => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const allRequirementsMet = Object.values(requirements).every(Boolean);

  if (!allRequirementsMet) {
    return {
      isValid: false,
      strength: 'low',
      requirements,
      message: 'Password does not meet minimum requirements',
    };
  }

  // Check for common patterns
  const hasCommonPattern = COMMON_PATTERNS.some(pattern => pattern.test(password));

  // Calculate entropy/strength
  let strength: PasswordStrength;

  if (hasCommonPattern) {
    strength = 'low';
  } else if (password.length >= 12) {
    // High strength: 12+ characters with all requirements
    strength = 'high';
  } else if (password.length >= 8) {
    // Medium strength: 8-11 characters with all requirements
    strength = 'medium';
  } else {
    strength = 'low';
  }

  // Only allow medium and high strength passwords
  const isValid = strength === 'medium' || strength === 'high';

  let message = '';
  if (!isValid) {
    if (hasCommonPattern) {
      message = 'Password contains common patterns. Please choose a stronger password.';
    } else {
      message = 'Password is too weak. Must be at least 8 characters with uppercase, lowercase, number, and special character.';
    }
  } else {
    message = strength === 'high' ? 'Strong password' : 'Good password';
  }

  return {
    isValid,
    strength,
    requirements,
    message,
  };
};

export const getPasswordStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'high':
      return '#4CAF50'; // Green
    case 'medium':
      return '#FF9800'; // Orange
    case 'low':
      return '#D32F2F'; // Red
  }
};

export const getPasswordStrengthProgress = (strength: PasswordStrength): number => {
  switch (strength) {
    case 'high':
      return 1;
    case 'medium':
      return 0.66;
    case 'low':
      return 0.33;
  }
};
