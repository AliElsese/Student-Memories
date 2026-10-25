// Super Admin Credentials
const SUPER_ADMIN_EMAIL = 'ali.elsese104@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Ali10496';

const ADMIN_STORAGE_KEY = 'super_admin_authenticated';

/**
 * Validates super admin credentials and sets session
 */
export const loginAdmin = (email, password) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() && cleanPass === SUPER_ADMIN_PASSWORD) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({
        authenticated: true,
        email: SUPER_ADMIN_EMAIL,
        timestamp: Date.now(),
      }));
    }
    return true;
  }

  return false;
};

/**
 * Checks if current user is logged in as Super Admin
 */
export const isAdminAuthenticated = () => {
  try {
    if (typeof localStorage === 'undefined') return false;
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return Boolean(session && session.authenticated);
  } catch {
    return false;
  }
};

/**
 * Clears super admin session
 */
export const logoutAdmin = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
};
