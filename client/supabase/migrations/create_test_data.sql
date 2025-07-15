-- Create test data for AI analysis development
-- This script creates realistic trading data for testing the AI features

-- First, let's create the test user (replace with your actual dummy user ID)
-- You'll need to get the actual user_id from your auth.users table after creating the dummy user

-- Variables (you'll need to replace these with actual IDs)
-- DUMMY_USER_ID: Get this from auth.users after creating your dummy user account
-- STRATEGY_IDS: Get these from strategies table after creating strategies for the dummy user

-- Sample strategies to create first (run these after getting the user_id):
/*
INSERT INTO strategies (user_id, name, description, is_active) VALUES 
('DUMMY_USER_ID_HERE', 'EUR/USD Scalping', 'Quick scalp trades on EURUSD with tight stops', false),
('DUMMY_USER_ID_HERE', 'GBP/USD Swing Trading', 'Medium-term swing trades on cable', false),
('DUMMY_USER_ID_HERE', 'News Trading Strategy', 'Trading major news events across multiple pairs', true);
*/

-- Generate 100 random trades across 3 strategies
-- Replace 'DUMMY_USER_ID' and strategy IDs with actual values

WITH trade_data AS (
  SELECT 
    '3ef865e6-fe24-4790-82b9-43849900b549'::uuid as user_id,
    -- Rotate between 3 strategies
    CASE 
      WHEN (row_number() OVER ()) % 3 = 1 THEN '4d7872cc-1ed5-4e5f-af02-d60124179964'::uuid  -- EUR/USD Scalping
      WHEN (row_number() OVER ()) % 3 = 2 THEN '6fb2dc98-e070-4e40-8a26-d2bd35fd15fe'::uuid  -- GBP/USD Swing Trading  
      ELSE '58234a30-61fe-488b-b25e-3b546e2bef9e'::uuid  -- News Trading
    END as strategy_id,
    
    -- Generate dates over the last 90 days (avoiding weekends)
    (CURRENT_DATE - INTERVAL '90 days' + 
     (row_number() OVER ()) * INTERVAL '1 day' + 
     (random() * INTERVAL '12 hours')
    )::date + 
    (CASE 
      WHEN EXTRACT(dow FROM (CURRENT_DATE - INTERVAL '90 days' + (row_number() OVER ()) * INTERVAL '1 day')) IN (0,6) 
      THEN INTERVAL '2 days'  -- Skip weekends
      ELSE INTERVAL '0 days'
    END) as date,
    
    -- Currency pairs based on strategy
    CASE 
      WHEN (row_number() OVER ()) % 3 = 1 THEN 
        (ARRAY['EURUSD', 'EURUSD', 'EURUSD', 'GBPUSD'])[(random() * 3 + 1)::int] -- Mostly EURUSD for scalping
      WHEN (row_number() OVER ()) % 3 = 2 THEN 
        (ARRAY['GBPUSD', 'GBPUSD', 'EURGBP'])[(random() * 2 + 1)::int] -- Mostly GBPUSD for swing
      ELSE 
        (ARRAY['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCHF'])[(random() * 4 + 1)::int] -- Various for news
    END as symbol,
    
    -- Random buy/sell
    (ARRAY['buy', 'sell'])[(random() * 1 + 1)::int] as type,
    
    -- Quantity based on strategy (scalping = smaller, swing = larger)
    CASE 
      WHEN (row_number() OVER ()) % 3 = 1 THEN (random() * 0.5 + 0.1)::numeric(10,2) -- Scalping: 0.1-0.6 lots
      WHEN (row_number() OVER ()) % 3 = 2 THEN (random() * 1.5 + 0.5)::numeric(10,2) -- Swing: 0.5-2.0 lots  
      ELSE (random() * 1.0 + 0.2)::numeric(10,2) -- News: 0.2-1.2 lots
    END as quantity,
    
    -- Realistic prices for each pair (simplified approach)
    CASE 
      WHEN (row_number() OVER ()) % 3 = 1 THEN (random() * 0.05 + 1.05)::numeric(10,5) -- Scalping: mostly EURUSD prices 1.05-1.10
      WHEN (row_number() OVER ()) % 3 = 2 THEN (random() * 0.08 + 1.25)::numeric(10,5) -- Swing: mostly GBPUSD prices 1.25-1.33
      ELSE (random() * 0.10 + 1.00)::numeric(10,5) -- News: mixed pairs, general forex range 1.00-1.10
    END as price,
    
    -- Profit/Loss with realistic win rate (~60% winners, varying by strategy)
    CASE 
      WHEN (row_number() OVER ()) % 3 = 1 THEN -- Scalping: smaller profits/losses, higher win rate
        CASE 
          WHEN random() < 0.65 THEN (random() * 50 + 10)::numeric(10,2) -- 65% win rate, $10-60 profit
          ELSE -(random() * 40 + 15)::numeric(10,2) -- $15-55 loss
        END
      WHEN (row_number() OVER ()) % 3 = 2 THEN -- Swing: larger profits/losses, moderate win rate  
        CASE 
          WHEN random() < 0.55 THEN (random() * 200 + 50)::numeric(10,2) -- 55% win rate, $50-250 profit
          ELSE -(random() * 150 + 40)::numeric(10,2) -- $40-190 loss
        END
      ELSE -- News: very volatile, lower win rate but bigger winners
        CASE 
          WHEN random() < 0.45 THEN (random() * 400 + 100)::numeric(10,2) -- 45% win rate, $100-500 profit
          ELSE -(random() * 200 + 50)::numeric(10,2) -- $50-250 loss
        END
    END as profit,
    
    -- Random notes based on trade type
    CASE 
      WHEN (row_number() OVER ()) % 10 = 0 THEN 
        (ARRAY[
          'Perfect entry at support level',
          'Broke resistance, held for continuation', 
          'News spike, quick scalp',
          'Stopped out at resistance',
          'Overtraded, emotional decision',
          'Great R:R setup',
          'Market turned against me',
          'Patience paid off',
          'Should have held longer',
          'Quick profit on news'
        ])[(random() * 9 + 1)::int]
      ELSE ''
    END as notes,
    
    row_number() OVER () as rn
  FROM generate_series(1, 100) as t(i)
)

INSERT INTO trades (user_id, strategy_id, date, symbol, type, quantity, price, profit, notes)
SELECT 
  user_id,
  strategy_id, 
  date,
  symbol,
  type,
  quantity,
  price,
  profit,
  notes
FROM trade_data
WHERE date <= CURRENT_DATE  -- Only include dates up to today
ORDER BY date;

-- Create some additional realistic patterns
-- Add some Friday afternoon losing trades (emotional trading pattern)
INSERT INTO trades (user_id, strategy_id, date, symbol, type, quantity, price, profit, notes)
SELECT 
  '3ef865e6-fe24-4790-82b9-43849900b549',
  '4d7872cc-1ed5-4e5f-af02-d60124179964', -- Scalping strategy  
  generate_friday_dates.friday_date,
  'EURUSD',
  'buy',
  0.2,
  1.0650,
  -(random() * 30 + 20)::numeric(10,2), -- Guaranteed losses $20-50
  'Late Friday trade - should have stopped earlier'
FROM (
  SELECT (CURRENT_DATE - INTERVAL '8 weeks' + (week * INTERVAL '1 week') + INTERVAL '4 days')::date as friday_date
  FROM generate_series(0, 7) as week
) generate_friday_dates
WHERE EXTRACT(dow FROM generate_friday_dates.friday_date) = 5; -- Ensure it's Friday

-- Update created_at and updated_at to match trade dates for realism
UPDATE trades 
SET 
  created_at = date + (random() * INTERVAL '4 hours')::interval,
  updated_at = date + (random() * INTERVAL '4 hours')::interval
WHERE user_id = '3ef865e6-fe24-4790-82b9-43849900b549';
