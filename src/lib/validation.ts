export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateEndorsement(data: {
  schoolId?: string;
  parentName?: string;
  phone?: string;
  message?: string;
  consent?: boolean;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.schoolId) {
    errors.school = 'Please select a school';
  }

  if (!data.parentName || !data.parentName.trim()) {
    errors.name = 'Name is required';
  } else if (data.parentName.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (data.parentName.trim().length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\+?[0-9]{10,15}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Invalid phone number format';
  }

  if (data.message && data.message.length > 500) {
    errors.message = 'Message must be less than 500 characters';
  }

  if (!data.consent) {
    errors.consent = 'Consent is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateOTP(otp: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!otp || !otp.trim()) {
    errors.otp = 'OTP is required';
  } else if (!/^\d{6}$/.test(otp)) {
    errors.otp = 'OTP must be 6 digits';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 500);
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').slice(0, 15);
}
