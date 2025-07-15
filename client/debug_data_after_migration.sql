-- Debug: Check the current state of trades data after migration
-- Run this to see what happened to your data

-- 1. Basic data check
SELECT 
  'BASIC DATA CHECK' as check_type,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN profit IS NOT NULL THEN 1 END) as has_profit,
  COUNT(CASE WHEN entry_price IS NOT NULL THEN 1 END) as has_entry_price,
  COUNT(CASE WHEN exit_price IS NOT NULL THEN 1 END) as has_exit_price,
  COUNT(CASE WHEN trade_time IS NOT NULL THEN 1 END) as has_trade_time
FROM trades;

-- 2. Profit distribution check
SELECT 
  'PROFIT DISTRIBUTION' as check_type,
  MIN(profit) as min_profit,
  MAX(profit) as max_profit,
  AVG(profit) as avg_profit,
  SUM(profit) as total_profit,
  COUNT(CASE WHEN profit > 0 THEN 1 END) as winning_trades,
  COUNT(CASE WHEN profit < 0 THEN 1 END) as losing_trades
FROM trades;

-- 3. Check if profits are too small (might be causing display issues)
SELECT 
  'PROFIT SCALE CHECK' as check_type,
  COUNT(CASE WHEN ABS(profit) < 0.01 THEN 1 END) as very_small_profits,
  COUNT(CASE WHEN ABS(profit) >= 0.01 AND ABS(profit) < 1 THEN 1 END) as small_profits,
  COUNT(CASE WHEN ABS(profit) >= 1 THEN 1 END) as normal_profits
FROM trades;

-- 4. Sample of recent data
SELECT 
  'SAMPLE DATA' as check_type,
  date, symbol, type, profit, entry_price, exit_price, trade_time
FROM trades 
ORDER BY date DESC 
LIMIT 10;
