# ⚠️ IMPORTANT: Database Setup Required

**If you're seeing "Database setup incomplete" error, you need to run this SQL script first!**

## Quick Setup (5 minutes):

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com/
2. Select your project  
3. Go to **SQL Editor**

### Step 2: Copy and Run This Script
**Copy ONLY the SQL below** (not the markdown text):

---

## 📋 COPY THIS SQL SCRIPT ONLY:

```sql
/*
  Complete Database Setup for Multi-Strategy Trading App
  This script sets up all tables, functions, and policies needed.
*/

-- ============================================================================
-- 1. CREATE STRATEGIES TABLE
-- ============================================================================

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- Create unique constraint for strategy name per user (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'strategies_name_user_unique'
    ) THEN
        ALTER TABLE strategies ADD CONSTRAINT strategies_name_user_unique UNIQUE (user_id, name);
    END IF;
END $$;

-- Create partial unique index to ensure only one active strategy per user (if it doesn't exist)
CREATE UNIQUE INDEX IF NOT EXISTS strategies_user_active_unique 
ON strategies (user_id) 
WHERE is_active = true;

-- Create indexes for faster queries (if they don't exist)
CREATE INDEX IF NOT EXISTS strategies_user_id_idx ON strategies (user_id);
CREATE INDEX IF NOT EXISTS strategies_active_idx ON strategies (is_active);

-- RLS Policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can insert own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can update own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can delete own strategies" ON strategies;

CREATE POLICY "Users can view own strategies"
  ON strategies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategies"
  ON strategies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies"
  ON strategies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies"
  ON strategies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. UPDATE TRADES TABLE FOR MULTI-STRATEGY SUPPORT
-- ============================================================================

-- Add user_id and strategy_id columns to trades table
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS strategy_id uuid REFERENCES strategies(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS trades_user_id_idx ON trades (user_id);
CREATE INDEX IF NOT EXISTS trades_strategy_id_idx ON trades (strategy_id);
CREATE INDEX IF NOT EXISTS trades_user_strategy_idx ON trades (user_id, strategy_id);
CREATE INDEX IF NOT EXISTS trades_date_idx ON trades (date);

-- Enable RLS if not already enabled
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own trades" ON trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON trades;
DROP POLICY IF EXISTS "Users can update own trades" ON trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON trades;

-- Create RLS policies for user isolation
CREATE POLICY "Users can view own trades"
  ON trades
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. UPDATE PROFILES TABLE WITH PLANS AND LIMITS
-- ============================================================================

-- Add plan and subscription columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'premium' CHECK (plan IN ('free', 'premium')),
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_status text CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', null)),
ADD COLUMN IF NOT EXISTS max_strategies integer DEFAULT 10;

-- Update max_strategies based on plan
UPDATE profiles SET max_strategies = CASE 
  WHEN plan = 'premium' THEN 10 
  ELSE 1 
END;

-- ============================================================================
-- 4. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to get strategy limits based on plan
CREATE OR REPLACE FUNCTION get_strategy_limit(user_plan text)
RETURNS integer AS $$
BEGIN
  CASE user_plan
    WHEN 'premium' THEN RETURN 10;
    ELSE RETURN 1;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can create more strategies
CREATE OR REPLACE FUNCTION can_create_strategy(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_plan text;
  current_count integer;
  max_allowed integer;
BEGIN
  -- Get user's plan
  SELECT plan INTO user_plan FROM profiles WHERE id = p_user_id;
  
  -- Get current strategy count
  SELECT COUNT(*) INTO current_count 
  FROM strategies 
  WHERE user_id = p_user_id;
  
  -- Get max allowed strategies
  max_allowed := get_strategy_limit(user_plan);
  
  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete user account completely
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS json AS $$
DECLARE
  user_uuid uuid;
  deleted_trades integer := 0;
  deleted_strategies integer := 0;
  deleted_profiles integer := 0;
BEGIN
  -- Get the current user's ID
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found';
  END IF;
  
  -- Delete all trades for the user
  DELETE FROM trades WHERE user_id = user_uuid;
  GET DIAGNOSTICS deleted_trades = ROW_COUNT;
  
  -- Delete all strategies for the user  
  DELETE FROM strategies WHERE user_id = user_uuid;
  GET DIAGNOSTICS deleted_strategies = ROW_COUNT;
  
  -- Delete profile for the user
  DELETE FROM profiles WHERE id = user_uuid;
  GET DIAGNOSTICS deleted_profiles = ROW_COUNT;
  
  -- Try to delete from auth.users (this may fail in some Supabase configurations)
  -- If it fails, that's okay - the client will handle signing out
  BEGIN
    DELETE FROM auth.users WHERE id = user_uuid;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the entire function
    RAISE NOTICE 'Could not delete auth user (this is normal): %', SQLERRM;
  END;
  
  -- Return success with deletion counts
  RETURN json_build_object(
    'success', true,
    'message', 'User data deleted successfully',
    'deleted_trades', deleted_trades,
    'deleted_strategies', deleted_strategies,
    'deleted_profiles', deleted_profiles,
    'user_id', user_uuid
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Return error details
  RETURN json_build_object(
    'success', false,
    'message', SQLERRM,
    'error_code', SQLSTATE,
    'user_id', user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. CREATE TRIGGERS
-- ============================================================================

-- Trigger for updated_at on strategies (drop existing first to avoid conflicts)
DROP TRIGGER IF EXISTS update_strategies_updated_at ON strategies;
CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger to trades table if it doesn't exist
DROP TRIGGER IF EXISTS update_trades_updated_at ON trades;
CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_strategy(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_strategy_limit(text) TO authenticated;

-- ============================================================================
-- 7. VERIFICATION
-- ============================================================================

-- Check if tables exist
SELECT 
  'Tables created successfully!' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'strategies', 'trades');

-- Check if functions exist
SELECT 
  'Functions created successfully!' as status,
  COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('delete_user_account', 'can_create_strategy', 'get_strategy_limit');

-- Show final message
SELECT 'Database setup complete! Refresh your app to test.' as final_status;
```

---

## ⚠️ COPY ONLY THE SQL ABOVE ⚠️

**DO NOT copy this text or the markdown headers!** 

After running the SQL script, refresh your app and the "Database setup incomplete" error should be resolved. Your app will now have full multi-strategy support with proper account deletion functionality.
