// Pure date and time utilities supporting IANA timezones and restaurant-local operations

export function getValidTimezone(tz) {
  if (!tz || typeof tz !== 'string') return 'Asia/Karachi';
  const clean = tz.includes('(') ? tz.split('(')[0].trim() : tz.trim();
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: clean });
    return clean;
  } catch {
    return 'Asia/Karachi';
  }
}

export function getLocalDateKey(date = new Date(), timezone = 'Asia/Karachi') {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const tz = getValidTimezone(timezone);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(d);
  } catch {
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

export function getLocalTime(date = new Date(), timezone = 'Asia/Karachi') {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const tz = getValidTimezone(timezone);
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(d);
    const hour = parts.find(p => p.type === 'hour')?.value.padStart(2, '0') || '00';
    const minute = parts.find(p => p.type === 'minute')?.value.padStart(2, '0') || '00';
    return `${hour}:${minute}`;
  } catch {
    const d = date instanceof Date ? date : new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

export function formatDate(dateString, formatStr = 'DD MMM YYYY', timezone = 'Asia/Karachi') {
  if (!dateString) return '';
  let d = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(d.getTime())) {
    if (typeof dateString === 'string' && dateString.toLowerCase().startsWith('today')) {
      d = new Date();
    } else {
      return dateString;
    }
  }

  const tz = getValidTimezone(timezone);
  const targetFormat = formatStr || 'DD MMM YYYY';

  try {
    if (targetFormat === 'MM/DD/YYYY') {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }).format(d);
    }
    if (targetFormat === 'YYYY-MM-DD') {
      return getLocalDateKey(d, tz);
    }
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}

export function formatDateTime(dateString, timezone = 'Asia/Karachi') {
  if (!dateString) return '';
  const d = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const tz = getValidTimezone(timezone);

  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
