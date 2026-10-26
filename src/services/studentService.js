import { supabase, isSupabaseConfigured } from './supabaseClient.js';

// Local mock storage key
const MOCK_STUDENTS_STORAGE_KEY = 'mock_students_data';

// Helper to get mock students (with self-healing quota protection)
const getMockStudents = () => {
  const data = localStorage.getItem(MOCK_STUDENTS_STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        let needsCleanup = false;
        const sanitized = parsed.map((s) => {
          // If a student photo is an oversized uncompressed base64 string (>50KB) from previous tests,
          // replace it with a lightweight avatar to immediately free up localStorage quota
          if (s.photo_url && s.photo_url.length > 50000 && s.photo_url.startsWith('data:image')) {
            needsCleanup = true;
            return {
              ...s,
              photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                s.full_name || 'Student'
              )}&background=4f46e5&color=fff&size=256`,
            };
          }
          return s;
        });

        if (needsCleanup) {
          try {
            localStorage.setItem(MOCK_STUDENTS_STORAGE_KEY, JSON.stringify(sanitized));
          } catch {
            // ignore
          }
        }
        return sanitized;
      }
    } catch {
      // fallback
    }
  }
  return [];
};

/**
 * Downscales and compresses an image file to a lightweight data URL (~25KB)
 * to ensure offline mock storage never exceeds the browser's 5MB localStorage limit.
 */
const compressImageForMockStorage = (file, maxDimension = 320, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG ~20-30 KB instead of raw 3-10 MB
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

const saveMockStudents = (students) => {
  try {
    localStorage.setItem(MOCK_STUDENTS_STORAGE_KEY, JSON.stringify(students));
  } catch (err) {
    console.warn('LocalStorage quota exceeded. Optimizing stored mock students...', err);
    try {
      // Attempt 1: Keep newest 20 students
      const trimmed = students.slice(-20);
      localStorage.setItem(MOCK_STUDENTS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Attempt 2: If older uncompressed raw photos exist, replace large strings with avatar URLs
      try {
        const lightened = students.slice(-15).map((s) => ({
          ...s,
          photo_url:
            (s.photo_url || '').length > 2000
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  s.full_name
                )}&background=4f46e5&color=fff&size=256`
              : s.photo_url,
        }));
        localStorage.setItem(MOCK_STUDENTS_STORAGE_KEY, JSON.stringify(lightened));
      } catch (finalErr) {
        console.error('Could not save mock students to localStorage:', finalErr);
      }
    }
  }
};

/**
 * Upload student photo to Supabase storage or produce compressed thumbnail in mock mode
 */
export const uploadStudentPhoto = async (file) => {
  if (!file) throw new Error('No photo file provided');

  if (isSupabaseConfigured && supabase) {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `avatars/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('student-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Photo upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('student-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Mock implementation: downscale & compress image to lightweight ~25KB JPEG
  // so browser localStorage quota (5MB) is never exceeded!
  return compressImageForMockStorage(file);
};

/**
 * Register a new student
 */
export const registerStudent = async (studentPayload) => {
  const {
    groupId,
    fullName,
    nickname,
    photoUrl,
    personalityEmoji,
    courseStartDate,
    courseEndDate,
    pinCode,
  } = studentPayload;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          group_id: groupId,
          full_name: fullName.trim(),
          nickname: nickname ? nickname.trim() : null,
          photo_url: photoUrl,
          personality_emoji: personalityEmoji || '🎓',
          course_start_date: courseStartDate,
          course_end_date: courseEndDate,
          pin_code: pinCode.trim(),
        },
      ])
      .select('id, group_id, full_name, nickname, photo_url, personality_emoji, course_start_date, course_end_date, created_at')
      .single();

    if (error) {
      console.error('Error inserting student:', error);
      throw error;
    }
    return data;
  }

  // Mock implementation
  const mockStudents = getMockStudents();
  const newStudent = {
    id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    group_id: groupId,
    full_name: fullName.trim(),
    nickname: nickname ? nickname.trim() : null,
    photo_url: photoUrl,
    personality_emoji: personalityEmoji || '🎓',
    course_start_date: courseStartDate,
    course_end_date: courseEndDate,
    pin_code: pinCode.trim(),
    created_at: new Date().toISOString(),
  };

  mockStudents.push(newStudent);
  saveMockStudents(mockStudents);

  // Return public representation (without pin_code)
  const { pin_code, ...publicData } = newStudent;
  return publicData;
};

/**
 * Fetch a single student by ID (public fields only, no PIN exposed)
 */
export const getStudentById = async (studentId) => {
  if (!studentId) return null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .select('id, group_id, full_name, nickname, photo_url, personality_emoji, course_start_date, course_end_date, created_at')
      .eq('id', studentId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
    return data;
  }

  // Mock implementation
  const mockStudents = getMockStudents();
  const student = mockStudents.find((s) => s.id === studentId);
  if (!student) return null;

  const { pin_code, ...publicData } = student;
  return publicData;
};

/**
 * Fetch all students belonging to a group (public fields only)
 */
export const getStudentsByGroupId = async (groupId) => {
  if (!groupId) return [];

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .select('id, group_id, full_name, nickname, photo_url, personality_emoji, course_start_date, course_end_date, created_at')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching students by group:', error);
      throw error;
    }
    return data || [];
  }

  // Mock implementation
  const mockStudents = getMockStudents();
  return mockStudents
    .filter((s) => s.group_id === groupId)
    .map(({ pin_code, ...publicData }) => publicData);
};

/**
 * Verify 6-digit PIN securely via Supabase RPC function (or mock store)
 */
export const verifyStudentPin = async (studentId, pin) => {
  if (!studentId || !pin) return false;
  const cleanPin = pin.trim();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.rpc('verify_student_pin', {
      p_student_id: studentId,
      p_pin: cleanPin,
    });

    if (error) {
      console.error('Error calling verify_student_pin RPC:', error);
      // Fallback direct check if RPC isn't deployed yet
      const { data: directCheck } = await supabase
        .from('students')
        .select('id')
        .eq('id', studentId)
        .eq('pin_code', cleanPin)
        .maybeSingle();

      return Boolean(directCheck);
    }
    return Boolean(data);
  }

  // Mock implementation
  const mockStudents = getMockStudents();
  const student = mockStudents.find((s) => s.id === studentId);
  return Boolean(student && student.pin_code === cleanPin);
};

/**
 * Browser verification helpers
 */
export const isStudentVerifiedInBrowser = (studentId) => {
  if (!studentId) return false;
  try {
    const item = localStorage.getItem(`verified_student_${studentId}`);
    return item === 'true';
  } catch {
    return false;
  }
};

export const saveStudentVerificationInBrowser = (studentId) => {
  if (!studentId) return;
  try {
    localStorage.setItem(`verified_student_${studentId}`, 'true');
  } catch (err) {
    console.error('Could not save browser verification state:', err);
  }
};

export const clearStudentVerificationInBrowser = (studentId) => {
  if (!studentId) return;
  try {
    localStorage.removeItem(`verified_student_${studentId}`);
  } catch (err) {
    console.error('Could not clear browser verification state:', err);
  }
};

/**
 * Super Admin: Fetch all registered students with full details, PIN codes, group data, and message counts
 */
export const getAllStudentsAdmin = async () => {
  if (isSupabaseConfigured && supabase) {
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        id,
        group_id,
        full_name,
        nickname,
        photo_url,
        personality_emoji,
        course_start_date,
        course_end_date,
        pin_code,
        created_at,
        groups (
          id,
          name,
          group_code
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin students:', error);
      throw error;
    }

    // Also fetch message counts for each student
    const { data: messages } = await supabase
      .from('messages')
      .select('recipient_student_id');

    const messageCountMap = (messages || []).reduce((acc, msg) => {
      acc[msg.recipient_student_id] = (acc[msg.recipient_student_id] || 0) + 1;
      return acc;
    }, {});

    return (students || []).map((s) => ({
      ...s,
      group_name: s.groups?.name || 'Unknown Group',
      group_code: s.groups?.group_code || '',
      messages_count: messageCountMap[s.id] || 0,
    }));
  }

  // Mock implementation
  const mockStudents = getMockStudents();
  let mockGroups = [];
  let mockMessages = [];

  try {
    const groupsRaw = localStorage.getItem('mock_groups');
    if (groupsRaw) mockGroups = JSON.parse(groupsRaw);
  } catch {}

  try {
    const messagesRaw = localStorage.getItem('mock_messages_data');
    if (messagesRaw) mockMessages = JSON.parse(messagesRaw);
  } catch {}

  const groupMap = (mockGroups || []).reduce((acc, g) => {
    acc[g.id] = g;
    return acc;
  }, {});

  const messageCountMap = (mockMessages || []).reduce((acc, m) => {
    acc[m.recipient_student_id] = (acc[m.recipient_student_id] || 0) + 1;
    return acc;
  }, {});

  return mockStudents
    .map((s) => {
      const g = groupMap[s.group_id] || {};
      return {
        ...s,
        group_name: g.name || 'Default Batch',
        group_code: g.group_code || 'REACT2026',
        messages_count: messageCountMap[s.id] || 0,
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

/**
 * Super Admin: Delete a student record
 */
export const deleteStudentAdmin = async (studentId) => {
  if (!studentId) return false;

  if (isSupabaseConfigured && supabase) {
    // 1. Try atomic RPC if created
    try {
      const { data: rpcSuccess, error: rpcError } = await supabase.rpc('delete_student_admin', {
        p_student_id: studentId,
      });
      if (!rpcError && rpcSuccess) {
        return true;
      }
    } catch {
      // fallback to direct delete
    }

    // 2. Delete related messages first
    try {
      await supabase
        .from('messages')
        .delete()
        .eq('recipient_student_id', studentId);
    } catch {
      // ignore
    }

    // 3. Delete student record
    const { error, count } = await supabase
      .from('students')
      .delete({ count: 'exact' })
      .eq('id', studentId);

    if (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
    return count > 0;
  }

  // Mock implementation
  const mockStudents = getMockStudents();
  const filtered = mockStudents.filter((s) => s.id !== studentId);
  saveMockStudents(filtered);
  return true;
};
