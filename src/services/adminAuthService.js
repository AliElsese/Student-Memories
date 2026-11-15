const SUPER_ADMIN_EMAIL = 'ali.elsese104@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Ali10496';

const ADMIN_STORAGE_KEY = 'super_admin_authenticated';

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

export const logoutAdmin = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  } catch {
  }
};
