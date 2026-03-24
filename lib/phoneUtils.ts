/**
 * Normalise a UK phone number to E.164 format (+44...).
 * Handles: +447..., 07..., 447..., and already-prefixed numbers.
 */
export function normalizePhoneToE164(phone: string): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('44')) return `+${digits}`
  if (digits.startsWith('0')) return `+44${digits.slice(1)}`
  if (phone.startsWith('+')) return phone
  return phone
}
