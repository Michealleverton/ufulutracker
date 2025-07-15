-- =====================================================
-- UFULU TRACKER: Add Entry/Exit Prices to Trades Table
-- =====================================================
-- Run this entire script in your Supabase SQL Editor

-- 1. Add new columns
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS entry_price DECIMAL(10, 5),
ADD COLUMN IF NOT EXISTS exit_price DECIMAL(10, 5);

-- 2. Populate with realistic forex trading data
UPDATE trades 
SET 
  entry_price = CASE 
    WHEN symbol LIKE '%USD%' OR symbol LIKE '%EUR%' THEN 
      price + (RANDOM() - 0.5) * 0.0020  -- +/- 20 pips
    ELSE 
      price + (RANDOM() - 0.5) * 0.0050  -- +/- 50 pips
  END,
  exit_price = CASE 
    WHEN profit > 0 THEN 
      CASE 
        WHEN type = 'buy' THEN price + (0.0010 + RANDOM() * 0.0030)  -- 10-40 pip profit
        WHEN type = 'sell' THEN price - (0.0010 + RANDOM() * 0.0030)
      END
    ELSE 
      CASE 
        WHEN type = 'buy' THEN price - (0.0008 + RANDOM() * 0.0022)  -- 8-30 pip loss
        WHEN type = 'sell' THEN price + (0.0008 + RANDOM() * 0.0022)
      END
  END
WHERE entry_price IS NULL;

-- 3. Recalculate profit to match entry/exit prices
UPDATE trades 
SET profit = CASE 
  WHEN type = 'buy' THEN (exit_price - entry_price) * quantity
  WHEN type = 'sell' THEN (entry_price - exit_price) * quantity
  ELSE profit
END;

-- 4. Add some realistic trading patterns

-- Friday emotional trading (worse performance)
UPDATE trades 
SET 
  exit_price = CASE 
    WHEN type = 'buy' THEN entry_price - (0.0020 + RANDOM() * 0.0030)
    WHEN type = 'sell' THEN entry_price + (0.0020 + RANDOM() * 0.0030)
  END
WHERE EXTRACT(DOW FROM date::date) = 5 AND RANDOM() < 0.3;

-- Create some breakout trades
UPDATE trades 
SET 
  exit_price = CASE 
    WHEN profit > 0 AND type = 'buy' THEN entry_price + (0.0060 + RANDOM() * 0.0040)
    WHEN profit > 0 AND type = 'sell' THEN entry_price - (0.0060 + RANDOM() * 0.0040)
    ELSE exit_price
  END
WHERE symbol IN ('EUR/USD', 'GBP/USD', 'USD/JPY') AND RANDOM() < 0.15;

-- Final profit recalculation
UPDATE trades 
SET profit = CASE 
  WHEN type = 'buy' THEN (exit_price - entry_price) * quantity
  WHEN type = 'sell' THEN (entry_price - exit_price) * quantity
END;

-- 5. Add constraints and indexes
ALTER TABLE trades 
ADD CONSTRAINT IF NOT EXISTS trades_entry_price_positive CHECK (entry_price > 0),
ADD CONSTRAINT IF NOT EXISTS trades_exit_price_positive CHECK (exit_price > 0);

CREATE INDEX IF NOT EXISTS trades_entry_price_idx ON trades (entry_price);
CREATE INDEX IF NOT EXISTS trades_exit_price_idx ON trades (exit_price);

-- 6. Verify the results
SELECT 
  'Migration Complete!' as status,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN entry_price IS NOT NULL THEN 1 END) as has_entry_price,
  COUNT(CASE WHEN exit_price IS NOT NULL THEN 1 END) as has_exit_price,
  ROUND(AVG(CASE WHEN profit > 0 THEN ABS(profit / ((ABS(exit_price - entry_price)) * quantity)) END), 2) as avg_win_rr_ratio
FROM trades;
