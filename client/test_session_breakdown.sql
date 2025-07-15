-- Quick test query to verify session breakdown after migration
-- Run this AFTER running the complete_analytics_migration.sql

SELECT 
  'SESSION BREAKDOWN TEST' as test_name,
  CASE 
    WHEN trade_time >= '06:00:00' AND trade_time < '12:00:00' THEN 'Morning (6-12)'
    WHEN trade_time >= '12:00:00' AND trade_time < '17:00:00' THEN 'Afternoon (12-17)' 
    WHEN trade_time >= '17:00:00' AND trade_time < '20:00:00' THEN 'Evening (17-20)'
    ELSE 'Night (20-6)'
  END as session,
  COUNT(*) as trade_count,
  ROUND(SUM(profit), 2) as total_profit,
  ROUND(AVG(profit), 2) as avg_profit_per_trade
FROM trades 
WHERE trade_time IS NOT NULL
GROUP BY 
  CASE 
    WHEN trade_time >= '06:00:00' AND trade_time < '12:00:00' THEN 'Morning (6-12)'
    WHEN trade_time >= '12:00:00' AND trade_time < '17:00:00' THEN 'Afternoon (12-17)' 
    WHEN trade_time >= '17:00:00' AND trade_time < '20:00:00' THEN 'Evening (17-20)'
    ELSE 'Night (20-6)'
  END
ORDER BY avg_profit_per_trade DESC;

-- This should show realistic session data instead of all zeros
