import { lazy, Suspense, useState, useEffect } from "react";
// import axios from "axios";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  ChevronDown,
  Calendar,
  Clock,
} from "lucide-react";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { StatCardModal } from "../components/StatCardModal";
import {
  fetchWeeklyData,
  fetchTotalProfitLoss,
  fetchWinRate,
  fetchBestTrade,
  fetchWorstTrade,
  fetchEquityCurveData,
  fetchMonthlyProfitLossData,
  fetchBestMonth,
  fetchWorstMonth,
  fetchAvgTradesPerDay,
  fetchRiskRewardRatio,
  fetchMaxDrawdown,
  fetchProfitFactor,
  fetchConsecutiveStreaks,
  fetchTradingHeatmapData,
  fetchTimeOfDayPerformanceData,
  fetchRiskRewardScatterData,
  fetchSymbolBreakdownData,
} from "../helpers/analyticsHelpers";
import "../../../styles.css";
import { supabase } from "../../../lib/supabase";
import { useStrategyContext } from "../../../Context/StrategyContext";
import TradingHeatmap from "../components/TradingHeatmap";
import TimeOfDayPerformance from "../components/TimeOfDayPerformance";
import RiskRewardScatter from "../components/RiskRewardScatter";
import SymbolBreakdown from "../components/SymbolBreakdown";
import MonthlyProfitLoss from "../components/MonthlyProfitLoss";

const GrossDailyPLGraph = lazy(() => import("../components/GrossDailyPLGraph"));

// Replace with your actual Alpha Vantage API key
// const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_VANTAGE_API_KEY;

const Analytics = () => {
  const { activeStrategy, user } = useStrategyContext();
  const defaultStatCards = [
    {
      id: "total",
      title: "Total Profit/Loss",
      value: "$0",
      icon: DollarSign,
      valueColor: "text-green-400",
      iconColor: "text-green-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "winRate",
      title: "Win Rate",
      value: "0%",
      icon: TrendingUp,
      valueColor: "text-indigo-400",
      iconColor: "text-indigo-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "bestMonth",
      title: "Best Month",
      value: "+$0.00",
      icon: ArrowUpRight,
      valueColor: "text-green-400",
      iconColor: "text-green-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "worstMonth",
      title: "Worst Month",
      value: "-$0.00",
      icon: ArrowDownRight,
      valueColor: "text-red-400",
      iconColor: "text-red-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "bestTrade",
      title: "Best Trade",
      value: "+$0",
      icon: ArrowUpRight,
      valueColor: "text-green-400",
      iconColor: "text-green-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "worstTrade",
      title: "Worst Trade",
      value: "-$0",
      icon: ArrowDownRight,
      valueColor: "text-red-400",
      iconColor: "text-red-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "avgTradesPerDay",
      title: "Avg. Trades Per Day",
      value: "0.00",
      icon: ArrowDownRight,
      valueColor: "text-indigo-400",
      iconColor: "text-indigo-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "R2RRatio",
      title: "R:R Ratio",
      value: "0.00",
      icon: ArrowDownRight,
      valueColor: "text-indigo-400",
      iconColor: "text-indigo-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "maxDrawdown",
      title: "Max Drawdown",
      value: "-$0.00 (0%)",
      icon: ArrowDownRight,
      valueColor: "text-red-400",
      iconColor: "text-red-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "profitFactor",
      title: "Profit Factor",
      value: "0.00",
      icon: TrendingUp,
      valueColor: "text-green-400",
      iconColor: "text-green-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "winStreak",
      title: "Max Win Streak",
      value: "0 trades",
      icon: ArrowUpRight,
      valueColor: "text-green-400",
      iconColor: "text-green-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "lossStreak",
      title: "Max Loss Streak",
      value: "0 trades",
      icon: ArrowDownRight,
      valueColor: "text-red-400",
      iconColor: "text-red-400",
      visible: true,
      dragHandleProps: {},
    },
  ];

  const [statCards, setStatCards] = useState(() => {
    const saved = localStorage.getItem("statCardsVisibility");
    if (saved) {
      // Merge visibility from saved state into default cards
      const savedVisibility = JSON.parse(saved);
      return defaultStatCards.map((card) => ({
        ...card,
        visible:
          savedVisibility[card.id] !== undefined
            ? savedVisibility[card.id]
            : card.visible,
      }));
    }
    return defaultStatCards;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weeklyData, setWeeklyData] = useState<
    { date: string; profit: number }[]
  >([]);
  const [totalWeeklyProfit, setTotalWeeklyProfit] = useState(0);
  const [equityCurveData, setEquityCurveData] = useState<
    { date: string; equity: number }[]
  >([]);
  const [monthlyProfitLossData, setMonthlyProfitLossData] = useState<
    { month: string; profit: number }[]
  >([]);
  const [startingBalance, setStartingBalance] = useState(10000); // Placeholder starting balance
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  // const [marketData, setMarketData] = useState<string>("");
  const [dailyPLData, setDailyPLData] = useState<
    { date: string; profit: number }[]
  >([]);
  
  // New state for advanced charts
  const [heatmapData, setHeatmapData] = useState<
    { date: string; profit: number }[]
  >([]);
  const [timePerformanceData, setTimePerformanceData] = useState<
    { date: string; profit: number; trade_time?: string }[]
  >([]);
  const [riskRewardData, setRiskRewardData] = useState<
    { date: string; profit: number; entry_price: number; exit_price: number; quantity: number; type: string }[]
  >([]);
  const [symbolData, setSymbolData] = useState<
    { symbol: string; profit: number }[]
  >([]);

  // Dashboard preset configurations
  const dashboardPresets = {
    "Pro Trader Complete": {
      name: "Pro Trader Complete",
      description: "All available metrics for comprehensive analysis",
      visibleCards: ["total", "winRate", "bestMonth", "worstMonth", "bestTrade", "worstTrade", "avgTradesPerDay", "R2RRatio", "maxDrawdown", "profitFactor", "winStreak", "lossStreak"]
    },
    "Risk Management Focus": {
      name: "Risk Management Focus",
      description: "Focus on drawdowns, risk-reward ratios, and loss streaks",
      visibleCards: ["total", "winRate", "R2RRatio", "maxDrawdown", "lossStreak", "worstTrade"]
    },
    "Psychology Focus": {
      name: "Psychology Focus", 
      description: "Track win/loss streaks and emotional trading patterns",
      visibleCards: ["total", "winRate", "winStreak", "lossStreak", "bestTrade", "worstTrade"]
    },
    "Performance Tracker": {
      name: "Performance Tracker",
      description: "Monitor profit, win rates, and trading frequency",
      visibleCards: ["total", "winRate", "bestMonth", "worstMonth", "avgTradesPerDay", "profitFactor"]
    },
    "Beginner Essentials": {
      name: "Beginner Essentials",
      description: "Essential metrics for new traders",
      visibleCards: ["total", "winRate", "bestTrade", "worstTrade"]
    }
  };

  const [selectedDashboard, setSelectedDashboard] = useState<string>("Pro Trader Complete");
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);

  useEffect(() => {
    if (activeStrategy && user) {
      fetchWeeklyData(setWeeklyData, calculateTotalWeeklyProfit, user.id, activeStrategy.id);
      fetchWinRate(updateWinRateCard, user.id, activeStrategy.id);
      fetchBestTrade(updateBestTradeCard, user.id, activeStrategy.id);
      fetchWorstTrade(updateWorstTradeCard, user.id, activeStrategy.id);
      fetchBestMonth(updateBestMonthCard, user.id, activeStrategy.id);
      fetchWorstMonth(updateWorstMonthCard, user.id, activeStrategy.id);
      fetchAvgTradesPerDay(updateAvgTradesPerDayCard, user.id, activeStrategy.id);
      fetchRiskRewardRatio(updateRiskRewardRatioCard, user.id, activeStrategy.id);
      fetchMaxDrawdown(updateMaxDrawdownCard, user.id, activeStrategy.id);
      fetchProfitFactor(updateProfitFactorCard, user.id, activeStrategy.id);
      fetchConsecutiveStreaks(updateConsecutiveStreaksCard, user.id, activeStrategy.id);
      fetchEquityCurveData(setEquityCurveData, user.id, activeStrategy.id);
      fetchMonthlyProfitLossData(setMonthlyProfitLossData, user.id, activeStrategy.id);
      fetchDailyPLData();
      
      // Fetch data for new advanced charts
      fetchTradingHeatmapData(setHeatmapData, user.id, activeStrategy.id);
      fetchTimeOfDayPerformanceData(setTimePerformanceData, user.id, activeStrategy.id);
      fetchRiskRewardScatterData(setRiskRewardData, user.id, activeStrategy.id);
      fetchSymbolBreakdownData(setSymbolData, user.id, activeStrategy.id);
      
      calculateCurrentBalance(); // Calculate current balance
      // fetchMarketData(); // Fetch market data
    }
  }, [startingBalance, totalWeeklyProfit, activeStrategy, user]); // Recalculate when strategy/user changes

  // Update Total Profit/Loss card when current balance changes
  useEffect(() => {
    updateTotalProfitLossCard();
  }, [currentBalance, startingBalance]);

  // Close dashboard dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isDashboardDropdownOpen && !target.closest('.dashboard-dropdown')) {
        setIsDashboardDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDashboardDropdownOpen]);

  useEffect(() => {
    // Save only the visibility state to keep storage small
    const visibility: Record<string, boolean> = {};
    statCards.forEach((card) => {
      visibility[card.id] = card.visible;
    });
    localStorage.setItem("statCardsVisibility", JSON.stringify(visibility));
  }, [statCards]);

  interface Trade {
    date: string;
    profit: number;
  }

  const updateTotalProfitLossCard = () => {
    const totalProfitLoss = currentBalance - startingBalance;
    setStatCards((prevCards) =>
      prevCards.map((card) =>
        card.id === "total" ? { ...card, value: `$${totalProfitLoss.toFixed(2)}` } : card
      )
    );
  };

  const updateWinRateCard = (winRate: number) => {
    setStatCards((prevCards) =>
      prevCards.map((card) =>
        card.id === "winRate"
          ? { ...card, value: `${winRate.toFixed(2)}%` }
          : card
      )
    );
  };

  const updateBestTradeCard = (profit: number) => {
    setStatCards((prevCards) =>
      prevCards.map((card) =>
        card.id === "bestTrade"
          ? { ...card, value: `+$${profit.toFixed(2)}` }
          : card
      )
    );
  };

  const updateWorstTradeCard = (profit: number) => {
    setStatCards((prevCards) =>
      prevCards.map((card) =>
        card.id === "worstTrade"
          ? { ...card, value: `-$${Math.abs(profit).toFixed(2)}` }
          : card
      )
    );
  };

  const updateBestMonthCard = (profit: number) => {
    setStatCards((prevCards) =>
      prevCards.map((card) =>
        card.id === "bestMonth"
          ? { ...card, value: `+$${profit.toFixed(2)}` }
          : card
      )
    );
  };

  const updateWorstMonthCard = (profit: number) => {
    setStatCards((prevCards) =>
      prevCards.map((card) =>
        card.id === "worstMonth"
          ? { ...card, value: `-$${Math.abs(profit).toFixed(2)}` }
          : card
      )
    );
  };

  const updateAvgTradesPerDayCard = (avg: number) => {
    setStatCards((prevCards) =>
      prevCards.map((card) =>
        card.id === "avgTradesPerDay"
          ? { ...card, value: avg.toFixed(2) }
          : card
      )
    );
  };

  const updateRiskRewardRatioCard = (ratio: number) => {
    setStatCards((prevCards) =>
      prevCards.map((card) =>
        card.id === "R2RRatio"
          ? { ...card, value: ratio.toFixed(2) }
          : card
      )
    );
  };

  const updateMaxDrawdownCard = (drawdown: number, percentage: number) => {
    setStatCards((prevCards) =>
      prevCards.map((card) =>
        card.id === "maxDrawdown"
          ? { ...card, value: `-$${drawdown.toFixed(2)} (${percentage.toFixed(1)}%)` }
          : card
      )
    );
  };

  const updateProfitFactorCard = (factor: number) => {
    setStatCards((prevCards) =>
      prevCards.map((card) =>
        card.id === "profitFactor"
          ? { ...card, value: factor.toFixed(2) }
          : card
      )
    );
  };

  const updateConsecutiveStreaksCard = (maxWinStreak: number, maxLossStreak: number) => {
    setStatCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id === "winStreak") {
          return { ...card, value: `${maxWinStreak} trades` };
        } else if (card.id === "lossStreak") {
          return { ...card, value: `${maxLossStreak} trades` };
        }
        return card;
      })
    );
  };

  const calculateTotalWeeklyProfit = (data: Trade[]) => {
    const total = data.reduce((acc, trade) => acc + trade.profit, 0);
    setTotalWeeklyProfit(total);
  };

  const calculateCurrentBalance = async () => {
    if (!activeStrategy || !user) return;
    
    let totalProfitFromAllTrades = 0;
    await fetchTotalProfitLoss((total: number) => {
      totalProfitFromAllTrades = total;
    }, user.id, activeStrategy.id);
    
    // Only use totalProfitFromAllTrades since weekly profit is already included in it
    const newCurrentBalance = startingBalance + totalProfitFromAllTrades;
    setCurrentBalance(newCurrentBalance);
  };

  // const fetchMarketData = async () => {
  //   try {
  //     const symbols = ["AAPL", "TSLA", "AMZN", "NFLX", "GOOGL", "USDCAD"];
  //     const marketInfoArray = await Promise.all(
  //       symbols.map(async (symbol) => {
  //         const response = await axios.get(
  //           `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${ALPHA_VANTAGE_API_KEY}`
  //         );
  //         const timeSeries = response.data["Time Series (1min)"];
  //         if (timeSeries) {
  //           const latestTime = Object.keys(timeSeries)[0];
  //           const latestData = timeSeries[latestTime];
  //           return `${symbol} $${parseFloat(latestData["1. close"]).toFixed(2)}`;
  //         } else {
  //           console.error(`No data found for ${symbol}`);
  //           return `${symbol} N/A`;
  //         }
  //       })
  //     );
  //     setMarketData(marketInfoArray.join("    --|--    "));
  //   } catch (error) {
  //     console.error("Error fetching market data:", error);
  //   }
  // };

  const toggleVisibility = (id: string) => {
    setStatCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, visible: !card.visible } : card
      )
    );
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const fetchDailyPLData = async () => {
    if (!activeStrategy || !user) return;
    
    const { data, error } = await supabase
      .from("trades") // Replace "trades" with your actual table name
      .select("date, profit")
      .eq("user_id", user.id)
      .eq("strategy_id", activeStrategy.id);

    if (error) {
      console.error("Error fetching trades data:", error);
      return;
    }

    if (data) {
      // Aggregate profit/loss by date
      const aggregatedData = data.reduce(
        (
          acc: { [key: string]: number },
          trade: { date: string; profit: number }
        ) => {
          const date = new Date(trade.date).toISOString().split("T")[0]; // Format date as YYYY-MM-DD
          acc[date] = (acc[date] || 0) + trade.profit;
          return acc;
        },
        {}
      );

      // Convert aggregated data to an array
      const formattedData = Object.entries(aggregatedData).map(
        ([date, profit]) => ({
          date,
          profit,
        })
      );

      setDailyPLData(formattedData);
    }
  };

  // Show loading or no strategy message
  if (!user || !activeStrategy) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {!user ? "The system is loading your strategies" : "The system is loading trade analytics"}
          </h2>
          <p className="text-gray-400">
            {!user 
              ? "The system is currently loading all your strategies for display."
              : "The system is analyzing your trades to generate comprehensive analytics."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-4 px-2 sm:px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{activeStrategy.name}</h1>
        <p className="text-gray-400">Track your trading performance for this strategy</p>
      </div>

      {/* Account Balances */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Starting Balance */}
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400 font-medium">Starting Balance</label>
              {isEditingBalance ? (
                <input
                  type="text"
                  value={formatCurrency(startingBalance)}
                  onChange={(e) =>
                    setStartingBalance(
                      Number(e.target.value.replace(/[^0-9.-]+/g, ""))
                    )
                  }
                  onFocus={(e) => e.target.select()}
                  onBlur={() => setIsEditingBalance(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingBalance(false);
                    }
                  }}
                  className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              ) : (
                <div 
                  onClick={() => setIsEditingBalance(true)}
                  className="text-lg font-semibold text-white cursor-pointer hover:text-blue-400 transition-colors"
                  title="Click to edit"
                >
                  {formatCurrency(startingBalance)}
                </div>
              )}
            </div>
          </div>

          {/* Current Balance */}
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400 font-medium">Current Balance</label>
              <div className="text-lg font-semibold text-green-400">
                {formatCurrency(currentBalance)}
              </div>
            </div>
          </div>

          {/* Weekly P&L */}
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400 font-medium">This Week's P&L</label>
              <div className={`text-lg font-semibold ${
                totalWeeklyProfit >= 0 ? "text-green-400" : "text-red-400"
              }`}>
                {formatCurrency(totalWeeklyProfit)}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Weekly Trading Overview */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-1">Weekly Performance</h3>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => {
            const dayData = weeklyData.filter(
              (trade) => new Date(trade.date).getDay() === (index + 6) % 7
            );
            const dayProfit = dayData.reduce(
              (acc, trade) => acc + trade.profit,
              0
            );
            const currentDate = new Date();
            const firstDayOfWeek = currentDate.getDate() - currentDate.getDay();
            const dayOfMonth = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              firstDayOfWeek + index
            ).getDate();
            
            const hasActivity = dayData.length > 0;
            
            return (
              <div
                key={day}
                className={`bg-gray-700/50 rounded-lg p-4 border transition-all duration-200 ${
                  hasActivity 
                    ? "border-blue-500 shadow-lg shadow-blue-500/20" 
                    : "border-gray-600"
                }`}
              >
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">{day}</div>
                  <div className="text-lg font-bold text-white mb-2">{dayOfMonth}</div>
                  <div className={`text-lg font-semibold mb-1 ${
                    dayProfit >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {hasActivity ? formatCurrency(dayProfit) : "$0.00"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {hasActivity ? `${dayData.length} trade${dayData.length > 1 ? 's' : ''}` : "No trades"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trading Insights Overview */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-xl p-6 mb-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">📊 Trading Overview</h2>
            <p className="text-gray-400">Your performance snapshot and account growth</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Return</div>
            <div className={`text-2xl font-bold ${
              currentBalance - startingBalance >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {((currentBalance - startingBalance) / startingBalance * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Trades</div>
                <div className="text-lg font-bold text-white">{weeklyData.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Account Growth</div>
                <div className={`text-lg font-bold ${
                  currentBalance - startingBalance >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(currentBalance - startingBalance)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">This Week</div>
                <div className={`text-lg font-bold ${
                  totalWeeklyProfit >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(totalWeeklyProfit)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Days Active</div>
                <div className="text-lg font-bold text-white">
                  {weeklyData.filter(day => day.profit !== 0).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 mt-10 overflow-x-auto">
        <ChartCard title="🚀 Enhanced Equity Curve">
          <div className="w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={equityCurveData}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#6B7280" }}
                />
                <YAxis 
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#6B7280" }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                  labelStyle={{ color: "#D1D5DB" }}
                  formatter={(value: number) => [
                    `$${value.toFixed(2)}`,
                    "Account Equity"
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    stroke: "#3B82F6", 
                    strokeWidth: 2, 
                    fill: "#1F2937" 
                  }}
                  fill="url(#equityGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="flex justify-start mb-4 font-white">
        {/* Dashboard Selector Dropdown */}
        <div className="relative dashboard-dropdown mt-8 mb-4">
          <button
            onClick={() => setIsDashboardDropdownOpen(!isDashboardDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium">{selectedDashboard}</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isDashboardDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {isDashboardDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              {Object.entries(dashboardPresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedDashboard(key);
                    setIsDashboardDropdownOpen(false);
                    // Apply dashboard preset
                    setStatCards(prevCards => 
                      prevCards.map(card => ({
                        ...card,
                        visible: preset.visibleCards.includes(card.id)
                      }))
                    );
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 ${
                    selectedDashboard === key ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="font-medium text-white">{preset.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{preset.description}</div>
                </button>
              ))}
              
              {/* Customize option at the bottom */}
              <button
                onClick={() => {
                  setSelectedDashboard("Custom");
                  setIsDashboardDropdownOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-t border-gray-600"
              >
                <div className="font-medium text-white">Custom Dashboard</div>
                <div className="text-sm text-gray-400 mt-1">Manually select which cards to display</div>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map(
          (card) =>
            card.visible && (
              <div key={card.id} className="mb-4">
                <StatCard {...card} />
              </div>
            )
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <MonthlyProfitLoss data={monthlyProfitLossData} />
        
        <Suspense
          fallback={
            <div className="text-white">Loading Gross Daily P&L...</div>
          }
        >
          <GrossDailyPLGraph data={dailyPLData} />
        </Suspense>
      </div>

      {/* Advanced Analytics Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          🚀 Advanced Analytics
          <span className="text-sm text-gray-400 font-normal">Deep insights into your trading patterns</span>
        </h2>
        <p className="text-gray-400 mb-6">
          Discover hidden patterns, optimize your performance, and gain a competitive edge with these advanced visualizations.
        </p>
      </div>

      {/* Trading Heatmap */}
      <div className="mb-8">
        <TradingHeatmap data={heatmapData} />
      </div>

      {/* Advanced Charts Grid */}
      <div className="space-y-8 mb-8">
        <TimeOfDayPerformance data={timePerformanceData} />
        <RiskRewardScatter data={riskRewardData} />
      </div>

      {/* Symbol Breakdown */}
      <div className="mb-8">
        <SymbolBreakdown data={symbolData} />
      </div>

      {isModalOpen && (
        <StatCardModal
          isOpen={isModalOpen}
          statCards={statCards}
          toggleVisibility={toggleVisibility}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Analytics;
