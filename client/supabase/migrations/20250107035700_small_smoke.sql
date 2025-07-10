/*
  # Update profiles table to use username

  1. Changes
    - Add temporary username column
    - Update existing rows with unique usernames
    - Make username required and unique
    - Remove name column
    - Create index for username lookups

  2. Security
    - Maintain existing RLS policies
    - Add unique constraint on username
*/

-- Add username column without constraints first
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username text;

-- Update existing rows with unique usernames based on their ID
UPDATE profiles 
SET username = 'user_' || substr(id::text, 1, 8)
WHERE username IS NULL OR username = '';

-- Now add the constraints
ALTER TABLE profiles
ALTER COLUMN username SET NOT NULL,
ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);

-- Remove the name column (safely, only if it exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE profiles DROP COLUMN name;
  END IF;
END $$;
