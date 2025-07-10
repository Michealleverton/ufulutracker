/*
  # Ensure profiles table has proper foreign key constraint

  This migration ensures that the profiles table has a proper foreign key
  constraint to auth.users with ON DELETE CASCADE, so that when a user
  is deleted from auth.users, their profile is automatically deleted.
*/

-- Check if the foreign key constraint exists and add it if missing
DO $$
DECLARE
    constraint_exists boolean;
BEGIN
    -- Check if foreign key constraint exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'profiles'
        AND kcu.column_name = 'id'
        AND kcu.referenced_table_name = 'users'
        AND kcu.referenced_table_schema = 'auth'
    ) INTO constraint_exists;
    
    -- Add the constraint if it doesn't exist
    IF NOT constraint_exists THEN
        RAISE NOTICE 'Adding foreign key constraint to profiles table';
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists on profiles table';
    END IF;
END
$$;

-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: We don't add a DELETE policy for profiles because
-- profile deletion should only happen through account deletion
-- which uses the SECURITY DEFINER function
