-- Run this script in your Supabase SQL editor to add entry_price and exit_price columns

-- Step 1: Add the columns
\i 20250114000001_add_entry_exit_prices.sql

-- Step 2: Populate with realistic data
\i 20250114000002_populate_realistic_prices.sql

-- Verify the changes
SELECT 
  symbol,
  type,
  entry_price,
  exit_price,
  profit,
  CASE 
    WHEN type = 'buy' THEN (exit_price - entry_price) * quantity
    WHEN type = 'sell' THEN (entry_price - exit_price) * quantity
  END as calculated_profit
FROM trades 
LIMIT 10;

-- Check for any data inconsistencies
SELECT COUNT(*) as total_trades,
       COUNT(CASE WHEN entry_price IS NOT NULL THEN 1 END) as has_entry_price,
       COUNT(CASE WHEN exit_price IS NOT NULL THEN 1 END) as has_exit_price
FROM trades;
