-- =====================================================================
-- STUDENT MEMORIES & ANONYMOUS MESSAGES PLATFORM
-- Supabase PostgreSQL Database Schema & Security Policies (Idempotent)
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    group_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookup by uppercase group_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_group_code ON public.groups (UPPER(group_code));

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    nickname TEXT,
    photo_url TEXT NOT NULL,
    personality_emoji TEXT NOT NULL DEFAULT '🎓',
    course_start_date DATE NOT NULL,
    course_end_date DATE NOT NULL,
    pin_code VARCHAR(6) NOT NULL CHECK (pin_code ~ '^[0-9]{6}$'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT course_dates_check CHECK (course_end_date >= course_start_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_group_id ON public.students(group_id);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON public.students(created_at DESC);

-- 4. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL CHECK (char_length(trim(message_text)) > 0 AND char_length(message_text) <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for fast query of recipient inbox
CREATE INDEX IF NOT EXISTS idx_messages_recipient_student ON public.messages(recipient_student_id, created_at DESC);

-- 5. SECURE PUBLIC VIEW FOR STUDENTS (Does NOT expose pin_code)
CREATE OR REPLACE VIEW public.public_students AS
SELECT
    id,
    group_id,
    full_name,
    nickname,
    photo_url,
    personality_emoji,
    course_start_date,
    course_end_date,
    created_at
FROM public.students;

-- 6. RPC: VERIFY STUDENT PIN SECURELY
CREATE OR REPLACE FUNCTION public.verify_student_pin(
    p_student_id UUID,
    p_pin TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.students
        WHERE id = p_student_id
          AND pin_code = trim(p_pin)
    );
END;
$$;

-- 7. RPC: GET VERIFIED MESSAGES FOR A STUDENT
CREATE OR REPLACE FUNCTION public.get_verified_messages(
    p_student_id UUID,
    p_pin TEXT
)
RETURNS TABLE (
    id UUID,
    recipient_student_id UUID,
    message_text TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.students
        WHERE students.id = p_student_id AND students.pin_code = trim(p_pin)
    ) THEN
        RAISE EXCEPTION 'Invalid verification PIN' USING ERRCODE = '28000';
    END IF;

    RETURN QUERY
    SELECT 
        m.id,
        m.recipient_student_id,
        m.message_text,
        m.created_at
    FROM public.messages m
    WHERE m.recipient_student_id = p_student_id
    ORDER BY m.created_at DESC;
END;
$$;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- GROUPS POLICIES:
DROP POLICY IF EXISTS "Allow public read access to groups" ON public.groups;
CREATE POLICY "Allow public read access to groups"
    ON public.groups FOR SELECT
    TO anon, authenticated
    USING (true);

-- STUDENTS POLICIES:
DROP POLICY IF EXISTS "Allow public read access to students" ON public.students;
CREATE POLICY "Allow public read access to students"
    ON public.students FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert of students" ON public.students;
CREATE POLICY "Allow public insert of students"
    ON public.students FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete of students" ON public.students;
CREATE POLICY "Allow public delete of students"
    ON public.students FOR DELETE
    TO anon, authenticated
    USING (true);

-- MESSAGES POLICIES:
DROP POLICY IF EXISTS "Allow public insert of messages" ON public.messages;
CREATE POLICY "Allow public insert of messages"
    ON public.messages FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read messages for recipient" ON public.messages;
CREATE POLICY "Allow read messages for recipient"
    ON public.messages FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public delete of messages" ON public.messages;
CREATE POLICY "Allow public delete of messages"
    ON public.messages FOR DELETE
    TO anon, authenticated
    USING (true);

-- RPC FOR CLEAN ADMIN CASCADE DELETION
CREATE OR REPLACE FUNCTION public.delete_student_admin(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.messages WHERE recipient_student_id = p_student_id;
    DELETE FROM public.students WHERE id = p_student_id;
    RETURN true;
END;
$$;

-- 9. STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-photos',
    'student-photos',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- STORAGE POLICIES:
DROP POLICY IF EXISTS "Public Access To Student Photos" ON storage.objects;
CREATE POLICY "Public Access To Student Photos"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'student-photos');

DROP POLICY IF EXISTS "Public Upload To Student Photos" ON storage.objects;
CREATE POLICY "Public Upload To Student Photos"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'student-photos');

-- 10. INITIAL SAMPLE SEED DATA
INSERT INTO public.groups (name, group_code)
VALUES 
    ('Front-End Development Cohort 469', 'FRONT-469'),
    ('Front-End Development Cohort 468', 'FRONT-468')
ON CONFLICT (group_code) DO NOTHING;
