import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const MOCK_MESSAGES_STORAGE_KEY = 'mock_messages_data';

const getMockMessages = () => {
  const data = localStorage.getItem(MOCK_MESSAGES_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  return [];
};

const saveMockMessages = (messages) => {
  localStorage.setItem(MOCK_MESSAGES_STORAGE_KEY, JSON.stringify(messages));
};

/**
 * Send an anonymous message to a student
 * Strictly does not record any sender identity or IP
 */
export const sendAnonymousMessage = async ({ recipientStudentId, messageText }) => {
  if (!recipientStudentId) throw new Error('Recipient student ID is required');
  const cleanText = (messageText || '').trim();

  if (!cleanText) {
    throw new Error('Message content cannot be empty');
  }

  if (cleanText.length > 1000) {
    throw new Error('Message exceeds 1000 character limit');
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          recipient_student_id: recipientStudentId,
          message_text: cleanText,
        },
      ])
      .select('id, recipient_student_id, created_at')
      .single();

    if (error) {
      console.error('Error inserting anonymous message:', error);
      throw error;
    }
    return data;
  }

  // Mock implementation
  const mockMessages = getMockMessages();
  const newMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipient_student_id: recipientStudentId,
    message_text: cleanText,
    created_at: new Date().toISOString(),
  };

  mockMessages.unshift(newMessage);
  saveMockMessages(mockMessages);
  return newMessage;
};

/**
 * Retrieve messages for a recipient student, ordered newest first
 */
export const getMessagesForStudent = async (studentId, pinCode = '') => {
  if (!studentId) return [];

  if (isSupabaseConfigured && supabase) {
    // If PIN is provided, try RPC get_verified_messages first
    if (pinCode) {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_verified_messages', {
          p_student_id: studentId,
          p_pin: pinCode.trim(),
        });

        if (!rpcError && rpcData) {
          return rpcData;
        }
      } catch {
        // Fall back to standard query if RPC was not created
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .select('id, recipient_student_id, message_text, created_at')
      .eq('recipient_student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
    return data || [];
  }

  // Mock implementation
  const mockMessages = getMockMessages();
  return mockMessages
    .filter((m) => m.recipient_student_id === studentId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};
