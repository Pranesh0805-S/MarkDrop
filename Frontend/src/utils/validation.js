export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email) {
  if (!email) return 'Email is required'
  if (!EMAIL_REGEX.test(email)) return 'Enter a valid email address (e.g. name@example.com)'
  return ''
}

export const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { key: 'number', label: 'One number', test: (v) => /[0-9]/.test(v) },
  { key: 'special', label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

export function passwordFailures(password) {
  return PASSWORD_RULES.filter((rule) => !rule.test(password || ''))
}

export function isPasswordValid(password) {
  return passwordFailures(password).length === 0
}
