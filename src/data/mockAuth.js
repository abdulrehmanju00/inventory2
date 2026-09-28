// Frontend-only prototype authentication & demo user profiles
// WARNING: Prototype credentials for UI simulation only. Not a backend security service.

export const SESSION_STORAGE_KEY = 'restaurant_platform_session_v1';

export const DEMO_USERS = [
  {
    id: 'usr-001',
    email: 'admin@platform.test',
    password: 'admin123',
    name: 'Platform Admin',
    role: 'Platform Super Admin',
    accountType: 'platform_admin',
    restaurantId: null,
    restaurantName: null,
    branchId: null,
    branchName: null,
    initials: 'PA'
  },
  {
    id: 'usr-002',
    email: 'owner@restaurant.test',
    password: 'owner123',
    name: 'Ahmed Raza',
    role: 'Restaurant Owner',
    accountType: 'restaurant_user',
    restaurantId: 'rest-001',
    restaurantName: 'Demo Restaurant',
    branchId: 'branch-001',
    branchName: 'Main Branch',
    initials: 'AR'
  },
  {
    id: 'usr-003',
    email: 'operations@restaurant.test',
    password: 'operations123',
    name: 'Ahmed Raza',
    role: 'Operations Lead',
    accountType: 'restaurant_user',
    restaurantId: 'rest-001',
    restaurantName: 'Demo Restaurant',
    branchId: 'branch-001',
    branchName: 'Main Branch',
    initials: 'AR'
  }
];

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.email && session.accountType) {
      return session;
    }
  } catch (err) {
    console.warn('[Prototype Auth] Could not read session from localStorage', err);
  }
  return null;
}

export function saveStoredSession(session) {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[Prototype Auth] Could not write session to localStorage', err);
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('[Prototype Auth] Could not clear session from localStorage', err);
  }
}
