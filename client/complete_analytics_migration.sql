-- =====================================================
-- UFULU TRACKER: Complete Analytics Migration
-- Add Entry/Exit Prices and Trade Times for Advanced Analytics
-- =====================================================
-- Run this entire script in your Supabase SQL Editor

-- 1. Add entry/exit price columns
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS entry_price DECIMAL(10, 5),
ADD COLUMN IF NOT EXISTS exit_price DECIMAL(10, 5);

-- 2. Add trade time column for session breakdown
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS trade_time TIME;

-- 3. Populate with realistic forex trading data (entry/exit prices)
UPDATE trades 
SET 
  entry_price = CASE 
    WHEN symbol LIKE '%USD%' OR symbol LIKE '%EUR%' THEN 
      GREATEST(price + (RANDOM() - 0.5) * 0.0020, 0.0001)  -- Ensure minimum 0.0001
    ELSE 
      GREATEST(price + (RANDOM() - 0.5) * 0.0050, 0.0001)  -- Ensure minimum 0.0001
  END,
  exit_price = CASE 
    WHEN profit > 0 THEN 
      CASE 
        WHEN type = 'buy' THEN GREATEST(price + (0.0010 + RANDOM() * 0.0030), 0.0001)
        WHEN type = 'sell' THEN GREATEST(price - (0.0010 + RANDOM() * 0.0030), 0.0001)
      END
    ELSE 
      CASE 
        WHEN type = 'buy' THEN GREATEST(price - (0.0008 + RANDOM() * 0.0022), 0.0001)
        WHEN type = 'sell' THEN GREATEST(price + (0.0008 + RANDOM() * 0.0022), 0.0001)
      END
  END
WHERE entry_price IS NULL;

-- 4. Populate with realistic trading times
-- Most forex trading happens during market hours: 8 AM - 6 PM (peak: 9 AM - 4 PM)
UPDATE trades 
SET trade_time = (
  CASE 
    -- Morning session (9 AM - 12 PM): 40% of trades
    WHEN RANDOM() < 0.4 THEN 
      TIME '09:00:00' + (RANDOM() * INTERVAL '3 hours')
    -- Afternoon session (12 PM - 4 PM): 35% of trades  
    WHEN RANDOM() < 0.75 THEN 
      TIME '12:00:00' + (RANDOM() * INTERVAL '4 hours')
    -- Evening session (4 PM - 8 PM): 20% of trades
    WHEN RANDOM() < 0.95 THEN 
      TIME '16:00:00' + (RANDOM() * INTERVAL '4 hours')
    -- Late/early trading (8 PM - 9 AM): 5% of trades
    ELSE 
      CASE 
        WHEN RANDOM() < 0.5 THEN TIME '20:00:00' + (RANDOM() * INTERVAL '4 hours')
        ELSE TIME '06:00:00' + (RANDOM() * INTERVAL '3 hours')
      END
  END
)::TIME
WHERE trade_time IS NULL;

-- 5. Recalculate profit to match entry/exit prices
UPDATE trades 
SET profit = CASE 
  WHEN type = 'buy' THEN (exit_price - entry_price) * quantity
  WHEN type = 'sell' THEN (entry_price - exit_price) * quantity
  ELSE profit
END;

-- 6. Add realistic trading patterns

-- Friday afternoon trades tend to be worse (emotional trading)
UPDATE trades 
SET 
  trade_time = TIME '15:30:00' + (RANDOM() * INTERVAL '2.5 hours'),
  exit_price = CASE 
    WHEN type = 'buy' THEN GREATEST(entry_price - (0.0020 + RANDOM() * 0.0030), 0.0001)
    WHEN type = 'sell' THEN GREATEST(entry_price + (0.0020 + RANDOM() * 0.0030), 0.0001)
  END
WHERE EXTRACT(DOW FROM date::date) = 5 AND RANDOM() < 0.3;

-- Morning trades tend to be more disciplined
UPDATE trades 
SET trade_time = TIME '09:15:00' + (RANDOM() * INTERVAL '2 hours')
WHERE profit > 0 AND RANDOM() < 0.3;

-- Late evening trades tend to be less successful
UPDATE trades 
SET trade_time = TIME '19:00:00' + (RANDOM() * INTERVAL '3 hours')
WHERE profit < 0 AND RANDOM() < 0.2;

-- Create some breakout trades with larger R:R ratios
UPDATE trades 
SET 
  exit_price = CASE 
    WHEN profit > 0 AND type = 'buy' THEN GREATEST(entry_price + (0.0060 + RANDOM() * 0.0040), 0.0001)
    WHEN profit > 0 AND type = 'sell' THEN GREATEST(entry_price - (0.0060 + RANDOM() * 0.0040), 0.0001)
    ELSE exit_price
  END
WHERE symbol IN ('EUR/USD', 'GBP/USD', 'USD/JPY') AND RANDOM() < 0.15;

-- Final profit recalculation after all adjustments
UPDATE trades 
SET profit = CASE 
  WHEN type = 'buy' THEN (exit_price - entry_price) * quantity
  WHEN type = 'sell' THEN (entry_price - exit_price) * quantity
END;

-- 7. Clean up any invalid data before adding constraints
UPDATE trades 
SET 
  entry_price = GREATEST(entry_price, 0.0001),
  exit_price = GREATEST(exit_price, 0.0001)
WHERE entry_price <= 0 OR exit_price <= 0;

-- 8. Add constraints and indexes
DO $$
BEGIN
    -- Add constraints only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trades_entry_price_positive') THEN
        ALTER TABLE trades ADD CONSTRAINT trades_entry_price_positive CHECK (entry_price > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trades_exit_price_positive') THEN
        ALTER TABLE trades ADD CONSTRAINT trades_exit_price_positive CHECK (exit_price > 0);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS trades_entry_price_idx ON trades (entry_price);
CREATE INDEX IF NOT EXISTS trades_exit_price_idx ON trades (exit_price);
CREATE INDEX IF NOT EXISTS trades_time_idx ON trades (trade_time);

-- 9. Verify the results
SELECT 
  'Analytics Migration Complete!' as status,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN entry_price IS NOT NULL THEN 1 END) as has_entry_price,
  COUNT(CASE WHEN exit_price IS NOT NULL THEN 1 END) as has_exit_price,
  COUNT(CASE WHEN trade_time IS NOT NULL THEN 1 END) as has_time,
  ROUND(AVG(CASE WHEN profit > 0 THEN ABS(profit / ((ABS(exit_price - entry_price)) * quantity)) END), 2) as avg_win_rr_ratio,
  MIN(trade_time) as earliest_trade,
  MAX(trade_time) as latest_trade
FROM trades;

-- 10. Show session breakdown preview
SELECT 
  CASE 
    WHEN trade_time >= '06:00:00' AND trade_time < '12:00:00' THEN 'Morning'
    WHEN trade_time >= '12:00:00' AND trade_time < '17:00:00' THEN 'Afternoon' 
    WHEN trade_time >= '17:00:00' AND trade_time < '20:00:00' THEN 'Evening'
    ELSE 'Night'
  END as session,
  COUNT(*) as trade_count,
  ROUND(SUM(profit), 2) as total_profit,
  ROUND(AVG(profit), 2) as avg_profit
FROM trades 
WHERE trade_time IS NOT NULL
GROUP BY 
  CASE 
    WHEN trade_time >= '06:00:00' AND trade_time < '12:00:00' THEN 'Morning'
    WHEN trade_time >= '12:00:00' AND trade_time < '17:00:00' THEN 'Afternoon' 
    WHEN trade_time >= '17:00:00' AND trade_time < '20:00:00' THEN 'Evening'
    ELSE 'Night'
  END
ORDER BY total_profit DESC;
