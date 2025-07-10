import { lazy, Suspense, useState, useEffect } from "react";
// import axios from "axios";
import {
  BarChart,
  Bar,
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
  GripVertical,
} from "lucide-react";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { StatCardModal } from "../components/StatCardModal";
import { IconButton, Menu, MenuItem } from "@mui/material";
import {
  fetchWeeklyData,
  fetchTotalProfitLoss,
  fetchWinRate,
  fetchBestTrade,
  fetchWorstTrade,
  fetchEquityCurveData,
  fetchMonthlyProfitLossData,
} from "../helpers/analyticsHelpers";
import "../../../styles.css";
import { supabase } from "../../../lib/supabase";
import { useTheme } from "../../../Context/ThemeContext";
import { useStrategyContext } from "../../../Context/StrategyContext";
import { Ticker } from "../components/Ticker";
import { ForexTicker } from "../components/ForexTicker";

const GrossDailyPLGraph = lazy(() => import("../components/GrossDailyPLGraph"));

// Replace with your actual Alpha Vantage API key
// const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_VANTAGE_API_KEY;

const Analytics = () => {
  const { theme } = useTheme();
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
      value: "+$3,200",
      icon: ArrowUpRight,
      valueColor: "text-green-400",
      iconColor: "text-green-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "worstMonth",
      title: "Worst Month",
      value: "-$800",
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
      value: "2.46",
      icon: ArrowDownRight,
      valueColor: "text-indigo-400",
      iconColor: "text-indigo-400",
      visible: true,
      dragHandleProps: {},
    },
    {
      id: "R2RRatio",
      title: "R:R Ratio",
      value: "2.21",
      icon: ArrowDownRight,
      valueColor: "text-indigo-400",
      iconColor: "text-indigo-400",
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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
  // const [marketData, setMarketData] = useState<string>("");
  const [dailyPLData, setDailyPLData] = useState<
    { date: string; profit: number }[]
  >([]);

  useEffect(() => {
    if (activeStrategy && user) {
      fetchWeeklyData(setWeeklyData, calculateTotalWeeklyProfit, user.id, activeStrategy.id);
      fetchWinRate(updateWinRateCard, user.id, activeStrategy.id);
      fetchBestTrade(updateBestTradeCard, user.id, activeStrategy.id);
      fetchWorstTrade(updateWorstTradeCard, user.id, activeStrategy.id);
      fetchEquityCurveData(setEquityCurveData, user.id, activeStrategy.id);
      fetchMonthlyProfitLossData(setMonthlyProfitLossData, user.id, activeStrategy.id);
      calculateCurrentBalance(); // Calculate current balance
      // fetchMarketData(); // Fetch market data
      fetchDailyPLData();
    }
  }, [startingBalance, totalWeeklyProfit, activeStrategy, user]); // Recalculate when strategy/user changes

  // Update Total Profit/Loss card when current balance changes
  useEffect(() => {
    updateTotalProfitLossCard();
  }, [currentBalance, startingBalance]);

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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCustomizeClick = () => {
    setIsModalOpen(true);
    handleMenuClose();
  };

  const resetVisibility = () => {
    setStatCards((prevCards) =>
      prevCards.map((card) => ({ ...card, visible: true }))
    );
  };

  const handleResetClick = () => {
    resetVisibility();
    handleMenuClose();
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
      <div>
        <ForexTicker />
      </div>
      <div>
        <Ticker />
      </div>

      {/* <div className="ticker-container rounded-md">
        <div className="ticker-content">{marketData}</div>
      </div> */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 px-2 py-2 bg-gray-800 rounded-md mt-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <p className="text-[1.25rem] text-white ml-2">Starting Balance:</p>
          <input
            type="text"
            value={formatCurrency(startingBalance)}
            onChange={(e) =>
              setStartingBalance(
                Number(e.target.value.replace(/[^0-9.-]+/g, ""))
              )
            }
            onFocus={(e) => e.target.select()}
            className="bg-transparent text-[1.25rem] text-green-500 pl-2 rounded-lg focus:bg-gray-800 w-full max-w-[160px]"
            style={{ width: `${formatCurrency(startingBalance).length}ch` }}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <p className="text-[1.25rem] text-white">Current Balance:</p>
          <p className="text-[1.25rem] text-white">
            <span className="text-[1.25rem] text-green-500">
              {formatCurrency(currentBalance)}
            </span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <p className="text-[1.25rem] text-white">This Weeks P&L:</p>
          <p className="text-[1.25rem] text-whit mr-2">
            <span
              className={`text-[1.25rem] ${
                totalWeeklyProfit >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {formatCurrency(totalWeeklyProfit)}
            </span>
          </p>
        </div>
      </div>
      <p
        className={`${
          theme === "dark" ? "text-black" : "text-white"
        } text-2xl ml-2 sm:ml-4 mt-8 mb-4`}
      >
        {new Date().toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        })}
      </p>

      <div className="flex flex-col md:flex-row mb-4 gap-4 md:gap-6">
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
          return (
            <p
              key={day}
              className={`bg-gray-800 flex-1 w-full flex flex-col p-4 rounded-lg relative text-gray-200 ${
                dayData.length ? "border-[1.5px] border-indigo-400" : ""
              }`}
            >
              <span className="text-[1.5rem] font-bold mb-[0.7rem]">
                {day} {dayOfMonth}
              </span>
              <span
                className={`text-[1.25rem] ${
                  dayProfit >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {dayData.length ? `$${dayProfit.toFixed(2)}` : "$0.00"}
              </span>
              {dayData.length ? `${dayData.length} Trades` : "0 Trades"}
            </p>
          );
        })}
      </div>

      <div className="mb-4 mt-10 overflow-x-auto">
        <ChartCard title="Equity Curve">
          <div className="w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={equityCurveData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" tick={{ fill: "#1f2937" }} />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#333",
                    borderRadius: "6px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#fff" }}
                  wrapperStyle={{ backgroundColor: "transparent" }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="flex justify-start mb-4 font-white">
        <IconButton onClick={handleMenuClick} sx={{ color: "gray" }}>
          <GripVertical className="rotate-90" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "#1f2937",
              color: "white",
            },
            "& .MuiMenuItem-root": {
              "&:hover": {
                backgroundColor: "#374151",
              },
            },
          }}
        >
          <MenuItem onClick={handleCustomizeClick}>Customize</MenuItem>
          <MenuItem onClick={handleResetClick}>Reset</MenuItem>
        </Menu>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <ChartCard title="Gross Monthly P&L">
          <div className="overflow-x-auto min-w-[350px] md:min-w-[500px]">
            <BarChart width={500} height={300} data={monthlyProfitLossData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#fff" }}
                padding={{ left: 10, right: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#333",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Bar dataKey="profit" fill="#8884d8" />
            </BarChart>
          </div>
        </ChartCard>

        <Suspense
          fallback={
            <div className="text-white">Loading Gross Daily P&L...</div>
          }
        >
          <GrossDailyPLGraph data={dailyPLData} />
        </Suspense>
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
