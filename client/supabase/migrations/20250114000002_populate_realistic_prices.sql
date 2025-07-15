/*
  # Populate trades with realistic forex entry/exit price scenarios

  This script creates more realistic trading scenarios by:
  1. Setting proper entry/exit prices for different trade types
  2. Creating realistic pip movements for forex pairs
  3. Ensuring R:R ratios make sense for real trading
  4. Adding variety in trade outcomes
*/

-- First, let's create some realistic forex trading scenarios
-- We'll update trades in batches to create different trading patterns

-- Pattern 1: Scalping trades (small pip movements, quick profits/losses)
UPDATE trades 
SET 
  entry_price = CASE 
    WHEN symbol LIKE '%USD%' OR symbol LIKE '%EUR%' THEN 
      price + (RANDOM() - 0.5) * 0.0020  -- +/- 20 pips variation
    ELSE 
      price + (RANDOM() - 0.5) * 0.0050  -- +/- 50 pips for other pairs
  END,
  exit_price = CASE 
    WHEN profit > 0 THEN 
      -- Winning scalp: 5-15 pip profit
      CASE 
        WHEN type = 'buy' THEN entry_price + (0.0005 + RANDOM() * 0.0010)
        WHEN type = 'sell' THEN entry_price - (0.0005 + RANDOM() * 0.0010)
      END
    ELSE 
      -- Losing scalp: 8-20 pip loss
      CASE 
        WHEN type = 'buy' THEN entry_price - (0.0008 + RANDOM() * 0.0012)
        WHEN type = 'sell' THEN entry_price + (0.0008 + RANDOM() * 0.0012)
      END
  END
WHERE RANDOM() < 0.3; -- Apply to 30% of trades

-- Pattern 2: Swing trades (larger pip movements, better R:R ratios)
UPDATE trades 
SET 
  entry_price = price + (RANDOM() - 0.5) * 0.0030,
  exit_price = CASE 
    WHEN profit > 0 THEN 
      -- Winning swing: 30-80 pip profit
      CASE 
        WHEN type = 'buy' THEN entry_price + (0.0030 + RANDOM() * 0.0050)
        WHEN type = 'sell' THEN entry_price - (0.0030 + RANDOM() * 0.0050)
      END
    ELSE 
      -- Losing swing: 20-40 pip loss (good R:R management)
      CASE 
        WHEN type = 'buy' THEN entry_price - (0.0020 + RANDOM() * 0.0020)
        WHEN type = 'sell' THEN entry_price + (0.0020 + RANDOM() * 0.0020)
      END
  END
WHERE entry_price IS NULL; -- Apply to remaining trades

-- Now let's recalculate profit to match our entry/exit prices
-- This ensures consistency between price movement and profit
UPDATE trades 
SET profit = CASE 
  WHEN type = 'buy' THEN (exit_price - entry_price) * quantity
  WHEN type = 'sell' THEN (entry_price - exit_price) * quantity
  ELSE profit
END
WHERE entry_price IS NOT NULL AND exit_price IS NOT NULL;

-- Add some realistic Friday afternoon emotional trading (typically worse performance)
UPDATE trades 
SET 
  exit_price = CASE 
    WHEN type = 'buy' THEN entry_price - (0.0015 + RANDOM() * 0.0025) -- Bigger losses
    WHEN type = 'sell' THEN entry_price + (0.0015 + RANDOM() * 0.0025)
  END,
  profit = CASE 
    WHEN type = 'buy' THEN (exit_price - entry_price) * quantity
    WHEN type = 'sell' THEN (entry_price - exit_price) * quantity
  END,
  notes = COALESCE(notes, '') || ' [Emotional trade]'
WHERE EXTRACT(DOW FROM date::date) = 5  -- Friday
  AND RANDOM() < 0.4; -- 40% of Friday trades

-- Create some breakout trades (higher volatility)
UPDATE trades 
SET 
  entry_price = price,
  exit_price = CASE 
    WHEN profit > 0 THEN 
      -- Successful breakout: 50-120 pip moves
      CASE 
        WHEN type = 'buy' THEN price + (0.0050 + RANDOM() * 0.0070)
        WHEN type = 'sell' THEN price - (0.0050 + RANDOM() * 0.0070)
      END
    ELSE 
      -- Failed breakout: quick reversal, 15-30 pip loss
      CASE 
        WHEN type = 'buy' THEN price - (0.0015 + RANDOM() * 0.0015)
        WHEN type = 'sell' THEN price + (0.0015 + RANDOM() * 0.0015)
      END
  END
WHERE symbol IN ('EUR/USD', 'GBP/USD', 'USD/JPY') 
  AND RANDOM() < 0.2; -- 20% breakout trades

-- Recalculate profit one final time to ensure consistency
UPDATE trades 
SET profit = CASE 
  WHEN type = 'buy' THEN (exit_price - entry_price) * quantity
  WHEN type = 'sell' THEN (entry_price - exit_price) * quantity
  ELSE profit
END;

-- Add some trade notes based on performance
UPDATE trades 
SET notes = CASE 
  WHEN profit > 0 AND ABS((exit_price - entry_price) / entry_price) > 0.01 THEN 
    'Strong trend follow - excellent R:R'
  WHEN profit > 0 AND ABS((exit_price - entry_price) / entry_price) < 0.002 THEN 
    'Quick scalp - took profit early'
  WHEN profit < 0 AND ABS((exit_price - entry_price) / entry_price) > 0.005 THEN 
    'Stop loss hit - respected risk management'
  WHEN profit < 0 AND ABS((exit_price - entry_price) / entry_price) < 0.002 THEN 
    'Small loss - good discipline'
  ELSE COALESCE(notes, 'Standard trade')
END
WHERE notes IS NULL OR notes = '' OR notes = 'Bought Forex';
