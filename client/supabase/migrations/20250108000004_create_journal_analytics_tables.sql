/*
  # Create journal and analytics tables

  1. New Tables
    - `journal_entries` for trading journal
    - `analytics_snapshots` for storing analytics data

  2. Security
    - Enable RLS on both tables
    - Users can only see/modify their own data

  3. Relationships
    - Both tables link to user_id and strategy_id
*/

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id uuid NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  date date NOT NULL,
  title text,
  content text,
  mood text CHECK (mood IN ('great', 'good', 'neutral', 'bad', 'terrible')),
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analytics_snapshots table (for caching analytics data)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id uuid NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  total_profit_loss numeric(12,2),
  total_trades integer,
  winning_trades integer,
  losing_trades integer,
  win_rate numeric(5,2),
  best_trade numeric(12,2),
  worst_trade numeric(12,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX journal_entries_user_id_idx ON journal_entries (user_id);
CREATE INDEX journal_entries_strategy_id_idx ON journal_entries (strategy_id);
CREATE INDEX journal_entries_date_idx ON journal_entries (date);
CREATE INDEX journal_entries_user_strategy_idx ON journal_entries (user_id, strategy_id);

CREATE INDEX analytics_snapshots_user_id_idx ON analytics_snapshots (user_id);
CREATE INDEX analytics_snapshots_strategy_id_idx ON analytics_snapshots (strategy_id);
CREATE INDEX analytics_snapshots_date_idx ON analytics_snapshots (snapshot_date);
CREATE INDEX analytics_snapshots_user_strategy_idx ON analytics_snapshots (user_id, strategy_id);

-- RLS Policies for journal_entries
CREATE POLICY "Users can view own journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for analytics_snapshots
CREATE POLICY "Users can view own analytics snapshots"
  ON analytics_snapshots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics snapshots"
  ON analytics_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics snapshots"
  ON analytics_snapshots
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analytics snapshots"
  ON analytics_snapshots
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_snapshots_updated_at
  BEFORE UPDATE ON analytics_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
