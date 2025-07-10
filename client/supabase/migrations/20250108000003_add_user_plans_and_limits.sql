/*
  # Add user plan and strategy limits

  1. Updates to profiles table
    - Add plan column (free, premium, etc.)
    - Add subscription_id for Stripe integration
    - Add subscription_status

  2. Strategy limits function
    - Function to check if user can create more strategies
    - Trigger to enforce strategy limits based on plan

  3. Default strategy creation
    - Function to create default strategy when user signs up
*/

-- Add plan and subscription columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS customer_id text,
ADD COLUMN IF NOT EXISTS subscription_status text CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', null)),
ADD COLUMN IF NOT EXISTS max_strategies integer DEFAULT 1;

-- Update max_strategies based on plan
UPDATE profiles SET max_strategies = CASE 
  WHEN plan = 'premium' THEN 10 
  WHEN plan = 'pro' THEN 3
  ELSE 1 
END;

-- Function to get strategy limits based on plan
CREATE OR REPLACE FUNCTION get_strategy_limit(user_plan text)
RETURNS integer AS $$
BEGIN
  CASE user_plan
    WHEN 'premium' THEN RETURN 10;
    WHEN 'pro' THEN RETURN 3;
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

-- Function to create default strategy for new users
CREATE OR REPLACE FUNCTION create_default_strategy()
RETURNS trigger AS $$
BEGIN
  INSERT INTO strategies (user_id, name, description, is_active)
  VALUES (NEW.id, 'Default Strategy', 'Your main trading strategy', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default strategy when user profile is created
DROP TRIGGER IF EXISTS create_default_strategy_trigger ON profiles;
CREATE TRIGGER create_default_strategy_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_strategy();

-- Function to enforce strategy limits
CREATE OR REPLACE FUNCTION enforce_strategy_limits()
RETURNS trigger AS $$
DECLARE
  can_create boolean;
BEGIN
  -- Check if user can create this strategy
  SELECT can_create_strategy(NEW.user_id) INTO can_create;
  
  IF NOT can_create THEN
    RAISE EXCEPTION 'Strategy limit exceeded for your plan. Please upgrade to create more strategies.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to enforce strategy limits on insert
DROP TRIGGER IF EXISTS enforce_strategy_limits_trigger ON strategies;
CREATE TRIGGER enforce_strategy_limits_trigger
  BEFORE INSERT ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION enforce_strategy_limits();
