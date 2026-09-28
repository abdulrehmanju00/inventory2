// Form validation helper utilities

export function validateRequired(value, fieldName = 'This field') {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} is required.`;
  }
  return null;
}

export function validatePositiveNumber(value, fieldName = 'Amount') {
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    return `${fieldName} must be a non-negative number.`;
  }
  return null;
}

export function validateGreaterThanZero(value, fieldName = 'Quantity') {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be greater than zero.`;
  }
  return null;
}

export function validateEmail(email) {
  if (!email) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? null : 'Please enter a valid email address.';
}

export function validatePhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s\-+()]/g, '');
  return cleaned.length >= 7 ? null : 'Please enter a valid phone number.';
}
