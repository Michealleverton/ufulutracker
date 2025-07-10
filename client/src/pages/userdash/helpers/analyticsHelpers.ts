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
  } else {
    const bestTrade = data.reduce((max, trade) => (trade.profit > max.profit ? trade : max), data[0]);
    updateBestTradeCard(bestTrade.profit);
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
  } else {
    const worstTrade = data.reduce((min, trade) => (trade.profit < min.profit ? trade : min), data[0]);
    updateWorstTradeCard(worstTrade.profit);
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