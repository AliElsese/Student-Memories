import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export const ALLOWED_GROUP_CODES = ['FRONT-469', 'FRONT-468', 'FRONT-475'];

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
  {
    id: 'grp-front-475',
    name: 'Front-End Development Cohort 475',
    group_code: 'FRONT-475',
    created_at: '2026-02-01T00:00:00Z',
  },
];

const getStoredMockGroups = () => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('mock_groups');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let updated = false;
          DEFAULT_MOCK_GROUPS.forEach((dg) => {
            if (!parsed.some((g) => g.group_code?.toUpperCase() === dg.group_code.toUpperCase())) {
              parsed.push(dg);
              updated = true;
            }
          });
          if (updated) {
            localStorage.setItem('mock_groups', JSON.stringify(parsed));
          }
          return parsed;
        }
      } catch {
      }
    }
    try {
      localStorage.setItem('mock_groups', JSON.stringify(DEFAULT_MOCK_GROUPS));
    } catch {}
  }
  return DEFAULT_MOCK_GROUPS;
};

export const getGroupByCode = async (code) => {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();

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
    if (data) {
      return data;
    }

    const defaultGroup = DEFAULT_MOCK_GROUPS.find(
      (g) => g.group_code.toUpperCase() === cleanCode
    );
    if (defaultGroup) {
      try {
        const { data: insertedGroup, error: insertError } = await supabase
          .from('groups')
          .insert([{ name: defaultGroup.name, group_code: defaultGroup.group_code }])
          .select('*')
          .single();

        if (!insertError && insertedGroup) {
          return insertedGroup;
        }
      } catch {
      }
    }

    return null;
  }

  const groups = getStoredMockGroups();
  const found = groups.find((g) => g.group_code.toUpperCase() === cleanCode);
  return found || null;
};

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

  const groups = getStoredMockGroups();
  return groups.find((g) => g.id === groupId) || null;
};
