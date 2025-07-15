import { supabase } from "../../../lib/supabase"; // Import Supabase client

// Helper to get base query with user and strategy filters
const getBaseQuery = (userId: string, strategyId: string) => {
  return supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .eq("strategy_id", strategyId);
};

export const getStartOfWeek = () => {
  const now = new Date();
  const first = now.getDate() - now.getDay();
  const firstDay = new Date(now.setDate(first));
  firstDay.setHours(0, 0, 0, 0);
  return firstDay.toISOString();
};

export const getEndOfWeek = () => {
  const now = new Date();
  const last = now.getDate() - now.getDay() + 6;
  const lastDay = new Date(now.setDate(last));
  lastDay.setHours(23, 59, 59, 999);
  return lastDay.toISOString();
};

export const fetchWeeklyData = async (
  setWeeklyData: Function, 
  calculateTotalWeeklyProfit: Function, 
  userId: string, 
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId)
    .gte("date", getStartOfWeek())
    .lte("date", getEndOfWeek());

  if (error) {
    console.error("Error fetching weekly data:", error);
  } else {
    setWeeklyData(data);
    calculateTotalWeeklyProfit(data);
  }
};

export const fetchTotalProfitLoss = async (
  updateTotalProfitLossCard: (total: number) => void, 
  userId: string, 
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId);

  if (error) {
    console.error("Error fetching total profit/loss data:", error);
  } else {
    const total = data.reduce((acc, trade) => acc + trade.profit, 0);
    updateTotalProfitLossCard(total);
  }
};

export const fetchWinRate = async (
  updateWinRateCard: (winRate: number) => void, 
  userId: string, 
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId);

  if (error) {
    console.error("Error fetching win rate data:", error);
  } else {
    const totalTrades = data.length;
    const winningTrades = data.filter((trade) => trade.profit > 0).length;
    const winRate = (winningTrades / totalTrades) * 100;
    updateWinRateCard(winRate);
  }
};

export const fetchBestTrade = async (
  updateBestTradeCard: (profit: number) => void, 
  userId: string, 
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId);

  if (error) {
    console.error("Error fetching best trade data:", error);
  } else if (data && data.length > 0) {
    const bestTrade = data.reduce((max, trade) => (trade.profit > max.profit ? trade : max), data[0]);
    updateBestTradeCard(bestTrade.profit);
  } else {
    updateBestTradeCard(0);
  }
};

export const fetchWorstTrade = async (
  updateWorstTradeCard: (profit: number) => void, 
  userId: string, 
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId);

  if (error) {
    console.error("Error fetching worst trade data:", error);
  } else if (data && data.length > 0) {
    const worstTrade = data.reduce((min, trade) => (trade.profit < min.profit ? trade : min), data[0]);
    updateWorstTradeCard(worstTrade.profit);
  } else {
    updateWorstTradeCard(0);
  }
};

export const fetchEquityCurveData = async (
  setEquityCurveData: Function, 
  userId: string, 
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId).order("date", { ascending: true });

  if (error) {
    console.error("Error fetching equity curve data:", error);
  } else {
    let cumulativeProfit = 0;
    const equityCurve = data.map((trade) => {
      cumulativeProfit += trade.profit;
      return { date: trade.date, equity: cumulativeProfit };
    });
    setEquityCurveData(equityCurve);
  }
};

export const fetchMonthlyProfitLossData = async (
  setMonthlyProfitLossData: Function, 
  userId: string, 
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId);
  
    if (error) {
      console.error("Error fetching monthly profit/loss data:", error);
    } else {
      const monthlyData = data.reduce((acc, trade) => {
        const month = new Date(trade.date).toLocaleString("default", { month: "short" });
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += trade.profit;
        return acc;
      }, {} as { [key: string]: number });
  
      const formattedMonthlyData = Object.keys(monthlyData).map((month) => ({
        month,
        profit: monthlyData[month],
      }));
  
      // Sort the data by month order
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      formattedMonthlyData.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
  
      setMonthlyProfitLossData(formattedMonthlyData);
    }
  };

export const fetchBestMonth = async (
  updateBestMonthCard: (profit: number) => void,
  userId: string,
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId);

  if (error) {
    console.error("Error fetching best month data:", error);
  } else {
    const monthlyData = data.reduce((acc, trade) => {
      const monthYear = new Date(trade.date).toLocaleString("default", { 
        month: "short", 
        year: "numeric" 
      });
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += trade.profit;
      return acc;
    }, {} as { [key: string]: number });

    const monthlyValues = Object.values(monthlyData) as number[];
    const bestMonth = monthlyValues.length > 0 ? Math.max(...monthlyValues) : 0;
    updateBestMonthCard(bestMonth);
  }
};

export const fetchWorstMonth = async (
  updateWorstMonthCard: (profit: number) => void,
  userId: string,
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId);

  if (error) {
    console.error("Error fetching worst month data:", error);
  } else {
    const monthlyData = data.reduce((acc, trade) => {
      const monthYear = new Date(trade.date).toLocaleString("default", { 
        month: "short", 
        year: "numeric" 
      });
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += trade.profit;
      return acc;
    }, {} as { [key: string]: number });

    const monthlyValues = Object.values(monthlyData) as number[];
    const worstMonth = monthlyValues.length > 0 ? Math.min(...monthlyValues) : 0;
    updateWorstMonthCard(worstMonth);
  }
};

export const fetchAvgTradesPerDay = async (
  updateAvgTradesPerDayCard: (avg: number) => void,
  userId: string,
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId);

  if (error) {
    console.error("Error fetching average trades per day data:", error);
  } else {
    if (data.length === 0) {
      updateAvgTradesPerDayCard(0);
      return;
    }

    // Group trades by date
    const dailyTrades = data.reduce((acc, trade) => {
      const date = new Date(trade.date).toDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += 1;
      return acc;
    }, {} as { [key: string]: number });

    const totalTradingDays = Object.keys(dailyTrades).length;
    const totalTrades = data.length;
    const avgTradesPerDay = totalTrades / totalTradingDays;
    
    updateAvgTradesPerDayCard(avgTradesPerDay);
  }
};

export const fetchRiskRewardRatio = async (
  updateRiskRewardRatioCard: (ratio: number) => void,
  userId: string,
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId);

  if (error) {
    console.error("Error fetching risk-reward ratio data:", error);
  } else {
    const winningTrades = data.filter(trade => trade.profit > 0);
    const losingTrades = data.filter(trade => trade.profit < 0);

    if (winningTrades.length === 0 || losingTrades.length === 0) {
      updateRiskRewardRatioCard(0);
      return;
    }

    // Calculate average win and average loss
    const avgWin = winningTrades.reduce((sum, trade) => sum + trade.profit, 0) / winningTrades.length;
    const avgLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profit, 0) / losingTrades.length);

    // Risk-Reward Ratio = Average Win / Average Loss
    const riskRewardRatio = avgWin / avgLoss;
    updateRiskRewardRatioCard(riskRewardRatio);
  }
};

export const fetchMaxDrawdown = async (
  updateMaxDrawdownCard: (drawdown: number, percentage: number) => void,
  userId: string,
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId).order("date", { ascending: true });

  if (error) {
    console.error("Error fetching max drawdown data:", error);
  } else if (data && data.length > 0) {
    let cumulativeProfit = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownPercentage = 0;

    data.forEach((trade) => {
      cumulativeProfit += trade.profit;
      
      // Update peak if we hit a new high
      if (cumulativeProfit > peak) {
        peak = cumulativeProfit;
      }
      
      // Calculate current drawdown
      const currentDrawdown = peak - cumulativeProfit;
      const currentDrawdownPercentage = peak > 0 ? (currentDrawdown / peak) * 100 : 0;
      
      // Update max drawdown if current is worse
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
        maxDrawdownPercentage = currentDrawdownPercentage;
      }
    });

    updateMaxDrawdownCard(maxDrawdown, maxDrawdownPercentage);
  } else {
    updateMaxDrawdownCard(0, 0);
  }
};

export const fetchProfitFactor = async (
  updateProfitFactorCard: (factor: number) => void,
  userId: string,
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId);

  if (error) {
    console.error("Error fetching profit factor data:", error);
  } else if (data && data.length > 0) {
    const totalWins = data.filter(trade => trade.profit > 0).reduce((sum, trade) => sum + trade.profit, 0);
    const totalLosses = Math.abs(data.filter(trade => trade.profit < 0).reduce((sum, trade) => sum + trade.profit, 0));

    // Profit Factor = Total Wins / Total Losses
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;
    updateProfitFactorCard(profitFactor);
  } else {
    updateProfitFactorCard(0);
  }
};

export const fetchConsecutiveStreaks = async (
  updateConsecutiveStreaksCard: (maxWinStreak: number, maxLossStreak: number) => void,
  userId: string,
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId).order("date", { ascending: true });

  if (error) {
    console.error("Error fetching consecutive streaks data:", error);
  } else if (data && data.length > 0) {
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    data.forEach((trade) => {
      if (trade.profit > 0) {
        // Winning trade
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else if (trade.profit < 0) {
        // Losing trade
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      }
      // If profit is exactly 0, we don't change streaks (breakeven trade)
    });

    updateConsecutiveStreaksCard(maxWinStreak, maxLossStreak);
  } else {
    updateConsecutiveStreaksCard(0, 0);
  }
};

// New helper functions for advanced charts
export const fetchTradingHeatmapData = async (
  setHeatmapData: Function,
  userId: string,
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId).order("date", { ascending: true });

  if (error) {
    console.error("Error fetching trading heatmap data:", error);
  } else {
    const heatmapData = data.map((trade) => ({
      date: trade.date,
      profit: trade.profit
    }));
    setHeatmapData(heatmapData);
  }
};

export const fetchTimeOfDayPerformanceData = async (
  setTimePerformanceData: Function,
  userId: string,
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId)
    .select("date, profit, trade_time")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching time of day performance data:", error);
  } else {
    const timeData = data.map((trade) => ({
      date: trade.date,
      profit: trade.profit,
      trade_time: trade.trade_time
    }));
    setTimePerformanceData(timeData);
  }
};

export const fetchRiskRewardScatterData = async (
  setRiskRewardData: Function,
  userId: string,
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId)
    .select("date, profit, entry_price, exit_price, quantity, type")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching risk-reward scatter data:", error);
  } else {
    const scatterData = data.map((trade) => ({
      date: trade.date,
      profit: trade.profit,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      quantity: trade.quantity,
      type: trade.type
    }));
    setRiskRewardData(scatterData);
  }
};

export const fetchSymbolBreakdownData = async (
  setSymbolData: Function,
  userId: string,
  strategyId: string
) => {
  const { data, error } = await getBaseQuery(userId, strategyId)
    .select("symbol, profit")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching symbol breakdown data:", error);
  } else {
    const symbolData = data.map((trade) => ({
      symbol: trade.symbol,
      profit: trade.profit
    }));
    setSymbolData(symbolData);
  }
};