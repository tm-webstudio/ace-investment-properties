-- ==================================================
-- COMPLETE DATABASE SETUP FOR ACE INVESTMENT PROPERTIES
-- ==================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/bzibjaodstcyodsfndoh/editor

-- 1. Create user type enum
CREATE TYPE IF NOT EXISTS user_type_enum AS ENUM ('investor', 'landlord', 'admin');

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    user_type user_type_enum NOT NULL DEFAULT 'investor',
    profile_complete BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_user_type_idx ON profiles(user_type);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);

-- 4. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON profiles;

-- 6. Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can view public profiles" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- 7. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, user_type)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'first_name', ''),
        COALESCE(new.raw_user_meta_data->>'last_name', ''),
        COALESCE((new.raw_user_meta_data->>'user_type')::user_type_enum, 'investor')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create trigger to auto-create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- 11. Create profile for existing user (tolu1998@hotmail.co.uk)
-- First, let's try to get the user ID and create the profile
DO $$ 
DECLARE
    user_record RECORD;
BEGIN
    -- Try to find the existing user and create their profile
    FOR user_record IN 
        SELECT id, email, raw_user_meta_data 
        FROM auth.users 
        WHERE email = 'tolu1998@hotmail.co.uk'
    LOOP
        -- Insert profile if it doesn't exist
        INSERT INTO public.profiles (id, email, first_name, last_name, user_type, profile_complete)
        VALUES (
            user_record.id,
            user_record.email,
            COALESCE(user_record.raw_user_meta_data->>'first_name', ''),
            COALESCE(user_record.raw_user_meta_data->>'last_name', ''),
            COALESCE((user_record.raw_user_meta_data->>'user_type')::user_type_enum, 'investor'),
            false
        ) ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Profile created/updated for user: %', user_record.email;
    END LOOP;
END $$;

-- 12. Verify setup
SELECT 
    'Setup Complete!' as message,
    COUNT(*) as profile_count
FROM profiles;

-- 13. Show existing profiles
SELECT 
    id,
    email,
    first_name,
    last_name,
    user_type,
    profile_complete,
    created_at
FROM profiles
ORDER BY created_at DESC;