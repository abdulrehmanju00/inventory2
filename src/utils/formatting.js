// Currency, number, and date formatting utilities

import {
  getValidTimezone,
  getLocalDateKey as utilGetLocalDateKey,
  getLocalTime as utilGetLocalTime,
  formatDate as utilFormatDate,
  formatDateTime as utilFormatDateTime
} from './dateUtils';

export { getValidTimezone };

let formattingConfig = {
  currency: 'PKR',
  dateFormat: 'DD MMM YYYY',
  recipeCostPrecision: '2 decimals',
  timezone: 'Asia/Karachi'
};

export function setFormattingConfig(config) {
  if (config && typeof config === 'object') {
    formattingConfig = {
      ...formattingConfig,
      currency: config.currency || formattingConfig.currency,
      dateFormat: config.dateFormat || formattingConfig.dateFormat,
      recipeCostPrecision: config.recipeCostPrecision || formattingConfig.recipeCostPrecision,
      timezone: getValidTimezone(config.timezone)
    };
  }
}

export function getFormattingConfig() {
  return formattingConfig;
}

export function getLocalDateKey(date = new Date(), timezone = formattingConfig.timezone) {
  return utilGetLocalDateKey(date, timezone || formattingConfig.timezone);
}

export function getLocalTime(date = new Date(), timezone = formattingConfig.timezone) {
  return utilGetLocalTime(date, timezone || formattingConfig.timezone);
}

export function formatDate(dateString, formatStr = formattingConfig.dateFormat, timezone = formattingConfig.timezone) {
  return utilFormatDate(dateString, formatStr || formattingConfig.dateFormat, timezone || formattingConfig.timezone);
}

export function formatDateTime(dateString, timezone = formattingConfig.timezone) {
  return utilFormatDateTime(dateString, timezone || formattingConfig.timezone);
}

export function formatCurrency(amount, currency = formattingConfig.currency) {
  if (amount === null || amount === undefined || isNaN(amount)) return `${currency} 0`;
  const formatted = Math.round(Number(amount)).toLocaleString('en-US');
  return `${currency} ${formatted}`;
}

export function formatRecipeCost(amount, precision = formattingConfig.recipeCostPrecision, currency = formattingConfig.currency) {
  let decimals = 2;
  if (typeof precision === 'number') decimals = precision;
  else if (String(precision).includes('3')) decimals = 3;
  else if (String(precision).includes('4')) decimals = 4;
  else if (String(precision).includes('2')) decimals = 2;

  const num = Number(amount);
  if (amount === null || amount === undefined || isNaN(num)) return `${currency} ${(0).toFixed(decimals)}`;
  return `${currency} ${num.toFixed(decimals)}`;
}

export function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  if (decimals === 0) {
    return Math.round(Number(val)).toLocaleString('en-US');
  }
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatUnit(amount, unit) {
  return `${amount} ${unit}`;
}
