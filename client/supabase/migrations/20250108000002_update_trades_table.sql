/*
  # Update trades table for multi-user, multi-strategy support

  1. Changes to trades table
    - Add user_id column (references auth.users)
    - Add strategy_id column (references strategies)
    - Update existing records to have proper user/strategy references
    - Add RLS policies for user isolation

  2. Security
    - Enable RLS on trades table
    - Users can only see/modify their own trades
    - Trades are filtered by strategy

  3. Indexes
    - Add indexes for performance
*/

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

-- Add updated_at trigger to trades table if it doesn't exist
CREATE TRIGGER IF NOT EXISTS update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
