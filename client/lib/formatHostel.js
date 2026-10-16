/**
 * Universal formatter for hostel & location names.
 * Ensures 'Yourspace' (institutional lab / college bay) is cleanly rendered
 * without awkward 'Hostel ' prefix, and replaces legacy 'Institutional Lab Bay 1'.
 */
export function formatHostel(hostel) {
  if (!hostel) return '';
  const clean = hostel.replace(/^Hostel\s+/i, '').trim();
  if (clean === 'Yourspace' || clean.toLowerCase().includes('institutional lab') || clean.toLowerCase().includes('yourspace')) {
    return 'Yourspace';
  }
  return `Hostel ${clean}`;
}

export function formatLocation(location, hostel) {
  if (!location) {
    return formatHostel(hostel) || 'Campus';
  }
  let sanitized = location
    .replace(/Hostel\s+Institutional\s+Lab\s+Bay\s+1/gi, 'Yourspace')
    .replace(/Institutional\s+Lab\s+Bay\s+1/gi, 'Yourspace')
    .replace(/Hostel\s+Yourspace/gi, 'Yourspace');

  if (sanitized.toLowerCase().includes('yourspace') && sanitized.toLowerCase().startsWith('hostel ')) {
    sanitized = sanitized.replace(/^Hostel\s+/i, '');
  }
  return sanitized;
}
