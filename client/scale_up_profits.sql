-- SCALE UP PROFITS: Realistic $1-3K wins with proportional losses
-- NO ZERO PROFITS - Every trade must be either a win or loss

-- 1. Check current profit distribution
SELECT 
  'CURRENT PROFITS' as status,
  COUNT(*) as total_trades,
  MIN(profit) as min_profit,
  MAX(profit) as max_profit,
  ROUND(AVG(profit), 2) as avg_profit,
  COUNT(CASE WHEN profit = 0 THEN 1 END) as zero_profits,
  COUNT(CASE WHEN profit > 0 THEN 1 END) as winning_trades,
  COUNT(CASE WHEN profit < 0 THEN 1 END) as losing_trades
FROM trades;

-- 2. First, eliminate ALL zero profits
UPDATE trades 
SET profit = CASE 
  WHEN profit = 0 THEN 
    CASE 
      WHEN RANDOM() < 0.65 THEN 800 + (RANDOM() * 1200)  -- 65% become $800-2000 wins
      ELSE -50 - (RANDOM() * 100)                        -- 35% become $50-150 losses
    END
  ELSE profit
END;

-- 3. Scale all profits to $1-3K wins with small losses
UPDATE trades 
SET profit = 
  CASE 
    -- For wins: $1,000 - $3,000 range
    WHEN profit > 0 THEN 
      1000 + (RANDOM() * 2000)  -- $1,000 to $3,000 wins
    
    -- For losses: Much smaller, $50-300 range (2-5% of wins)
    WHEN profit < 0 THEN 
      -50 - (RANDOM() * 250)    -- $50 to $300 losses
    
    ELSE profit
  END;

-- 4. Ensure proper win/loss ratio: 65% wins, 35% losses
UPDATE trades 
SET profit = -75 - (RANDOM() * 175)  -- Convert to $75-250 loss
WHERE profit > 0 AND RANDOM() < 0.35;

-- 5. Add some variation - bigger wins occasionally
UPDATE trades 
SET profit = profit * (1.2 + RANDOM() * 0.8)  -- Scale wins 1.2x to 2x
WHERE profit > 0 AND RANDOM() < 0.15;  -- 15% get bigger wins ($1,200-6,000)

-- 6. Create some breakout trades (rare big wins)
UPDATE trades 
SET profit = 3500 + (RANDOM() * 2500)  -- $3,500-6,000 wins
WHERE profit > 0 AND RANDOM() < 0.05;  -- 5% breakout wins

-- 7. Create some disaster trades (rare bigger losses)
UPDATE trades 
SET profit = -400 - (RANDOM() * 600)   -- $400-1,000 losses
WHERE profit < 0 AND RANDOM() < 0.03;  -- 3% disaster trades

-- 8. Round to realistic cents
UPDATE trades 
SET profit = ROUND(profit, 2);

-- 9. Verify the new profit distribution (should have NO zeros)
SELECT 
  'SCALED PROFITS' as status,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN profit = 0 THEN 1 END) as zero_profits,
  COUNT(CASE WHEN profit > 0 THEN 1 END) as winning_trades,
  COUNT(CASE WHEN profit < 0 THEN 1 END) as losing_trades,
  ROUND((COUNT(CASE WHEN profit > 0 THEN 1 END) * 100.0 / COUNT(*)), 1) as win_rate_percent,
  ROUND(MIN(profit), 2) as min_profit,
  ROUND(MAX(profit), 2) as max_profit,
  ROUND(AVG(CASE WHEN profit > 0 THEN profit END), 2) as avg_win,
  ROUND(AVG(CASE WHEN profit < 0 THEN profit END), 2) as avg_loss,
  ROUND(SUM(profit), 2) as total_profit
FROM trades;

-- 10. Show sample of realistic profits (best and worst)
SELECT 
  'TOP WINNERS' as check_type,
  date, symbol, type, profit
FROM trades 
WHERE profit > 0
ORDER BY profit DESC 
LIMIT 5;

-- 11. Show biggest losses
SELECT 
  'BIGGEST LOSSES' as check_type,
  date, symbol, type, profit
FROM trades 
WHERE profit < 0
ORDER BY profit ASC 
LIMIT 5;

-- 12. Show typical trades
SELECT 
  'TYPICAL TRADES' as check_type,
  date, symbol, type, profit
FROM trades 
WHERE date >= '2025-07-10'
ORDER BY date DESC 
LIMIT 10;
