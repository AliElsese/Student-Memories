import { supabase, isSupabaseConfigured } from './supabaseClient.js';

// Strictly allowed group codes
export const ALLOWED_GROUP_CODES = ['FRONT-469', 'FRONT-468'];

// Default mock groups for offline/local testing
const DEFAULT_MOCK_GROUPS = [
  {
    id: 'grp-front-469',
    name: 'Front-End Development Cohort 469',
    group_code: 'FRONT-469',
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'grp-front-468',
    name: 'Front-End Development Cohort 468',
    group_code: 'FRONT-468',
    created_at: '2026-01-15T00:00:00Z',
  },
];

const getStoredMockGroups = () => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('mock_groups');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure FRONT-468 and FRONT-469 exist
        const hasAllowed = parsed.some(g => ALLOWED_GROUP_CODES.includes(g.group_code?.toUpperCase()));
        if (hasAllowed) return parsed;
      } catch {
        // fallback
      }
    }
    try {
      localStorage.setItem('mock_groups', JSON.stringify(DEFAULT_MOCK_GROUPS));
    } catch {}
  }
  return DEFAULT_MOCK_GROUPS;
};

/**
 * Find group by code (case-insensitive)
 */
export const getGroupByCode = async (code) => {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();

  // Strictly allow only FRONT-469 or FRONT-468
  if (!ALLOWED_GROUP_CODES.includes(cleanCode)) {
    return null;
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .ilike('group_code', cleanCode)
      .maybeSingle();

    if (error) {
      console.error('Error fetching group by code:', error);
      throw error;
    }
    return data;
  }

  // Mock implementation
  const groups = getStoredMockGroups();
  const found = groups.find((g) => g.group_code.toUpperCase() === cleanCode);
  return found || null;
};

/**
 * Find group by ID
 */
export const getGroupById = async (groupId) => {
  if (!groupId) return null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching group by id:', error);
      throw error;
    }
    return data;
  }

  // Mock implementation
  const groups = getStoredMockGroups();
  return groups.find((g) => g.id === groupId) || null;
};
