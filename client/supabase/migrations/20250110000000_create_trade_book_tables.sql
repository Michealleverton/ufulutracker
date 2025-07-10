-- Create trade book strategies table
CREATE TABLE IF NOT EXISTS trade_book_strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trade book steps table
CREATE TABLE IF NOT EXISTS trade_book_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID NOT NULL REFERENCES trade_book_strategies(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  position_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trade_book_strategies_user_id ON trade_book_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_book_strategies_position ON trade_book_strategies(user_id, position_order);
CREATE INDEX IF NOT EXISTS idx_trade_book_steps_strategy_id ON trade_book_steps(strategy_id);
CREATE INDEX IF NOT EXISTS idx_trade_book_steps_position ON trade_book_steps(strategy_id, position_order);

-- Enable Row Level Security
ALTER TABLE trade_book_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_book_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trade_book_strategies
CREATE POLICY "Users can view own trade book strategies"
  ON trade_book_strategies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trade book strategies"
  ON trade_book_strategies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trade book strategies"
  ON trade_book_strategies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trade book strategies"
  ON trade_book_strategies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for trade_book_steps
CREATE POLICY "Users can view own trade book steps"
  ON trade_book_steps
  FOR SELECT
  TO authenticated
  USING (
    strategy_id IN (
      SELECT id FROM trade_book_strategies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own trade book steps"
  ON trade_book_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    strategy_id IN (
      SELECT id FROM trade_book_strategies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own trade book steps"
  ON trade_book_steps
  FOR UPDATE
  TO authenticated
  USING (
    strategy_id IN (
      SELECT id FROM trade_book_strategies WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    strategy_id IN (
      SELECT id FROM trade_book_strategies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own trade book steps"
  ON trade_book_steps
  FOR DELETE
  TO authenticated
  USING (
    strategy_id IN (
      SELECT id FROM trade_book_strategies WHERE user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_trade_book_strategies_updated_at
    BEFORE UPDATE ON trade_book_strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trade_book_steps_updated_at
    BEFORE UPDATE ON trade_book_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
