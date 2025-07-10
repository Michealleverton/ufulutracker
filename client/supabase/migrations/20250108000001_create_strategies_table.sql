/*
  # Create strategies table for multi-strategy support

  1. New Tables
    - `strategies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, strategy name)
      - `description` (text, optional)
      - `is_active` (boolean, one active strategy per user)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on strategies table
    - Users can only see/modify their own strategies

  3. Constraints
    - One active strategy per user (partial unique index)
    - Strategy name must be unique per user
*/

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

-- Create unique constraint for strategy name per user
ALTER TABLE strategies ADD CONSTRAINT strategies_name_user_unique UNIQUE (user_id, name);

-- Create partial unique index to ensure only one active strategy per user
CREATE UNIQUE INDEX strategies_user_active_unique 
ON strategies (user_id) 
WHERE is_active = true;

-- Create index for faster queries
CREATE INDEX strategies_user_id_idx ON strategies (user_id);
CREATE INDEX strategies_active_idx ON strategies (is_active);

-- RLS Policies
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

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
