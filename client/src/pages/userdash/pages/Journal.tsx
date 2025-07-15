import TradingCalendar, { TradingCalendarRef } from '../../../components/TradingCalendar';
import { Calendar, BookOpen, Plus, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useStrategyContext } from '../../../Context/StrategyContext';
import { useRef, useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const Journal = () => {
  const { activeStrategy, user } = useStrategyContext();
  const calendarRef = useRef<TradingCalendarRef>(null);
  const [monthlyStats, setMonthlyStats] = useState({
    totalTrades: 0,
    totalProfit: 0,
    winRate: 0,
    bestDay: 0,
    worstDay: 0,
  });

  useEffect(() => {
    if (activeStrategy && user) {
      fetchMonthlyStats();
    }
  }, [activeStrategy, user]);

  const fetchMonthlyStats = async () => {
    if (!activeStrategy || !user) return;

    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    try {
      const { data, error } = await supabase
        .from("trades")
        .select("profit, date")
        .eq("user_id", user.id)
        .eq("strategy_id", activeStrategy.id)
        .gte("date", firstDay.toISOString().split('T')[0])
        .lte("date", lastDay.toISOString().split('T')[0]);

      if (error) {
        console.error("Error fetching monthly stats:", error);
        return;
      }

      if (data && data.length > 0) {
        const totalTrades = data.length;
        const totalProfit = data.reduce((sum, trade) => sum + (trade.profit || 0), 0);
        const winningTrades = data.filter(trade => trade.profit > 0).length;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

        // Calculate daily P&L
        const dailyPnL = data.reduce((acc, trade) => {
          const date = trade.date;
          acc[date] = (acc[date] || 0) + (trade.profit || 0);
          return acc;
        }, {} as Record<string, number>);

        const dailyValues = Object.values(dailyPnL);
        const bestDay = dailyValues.length > 0 ? Math.max(...dailyValues) : 0;
        const worstDay = dailyValues.length > 0 ? Math.min(...dailyValues) : 0;

        setMonthlyStats({
          totalTrades,
          totalProfit,
          winRate,
          bestDay,
          worstDay,
        });
      }
    } catch (err) {
      console.error("Error fetching monthly stats:", err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const handleAddTodaysTrade = () => {
    calendarRef.current?.openNewTradeModal(new Date());
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-4 px-2 sm:px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Trading Journal Calendar</h1>
              <p className="text-gray-400">
                {activeStrategy ? `Track trades for ${activeStrategy.name}` : 'Select a strategy to view trades'}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Instructions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-white">How to Use</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Click any day to add a new trade entry</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Green days indicate profitable trading sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Red days show loss-making sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>Click existing trades to edit them</span>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Plus className="h-5 w-5 text-green-400" />
              <h3 className="font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button 
                onClick={handleAddTodaysTrade}
                className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Today's Trade
              </button>
              <div className="text-sm text-gray-400">
                Or click any calendar day to add a trade for that date
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-white">This Month</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Trades</span>
                <span className="font-medium text-white">{monthlyStats.totalTrades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total P&L</span>
                <span className={`font-medium ${monthlyStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(monthlyStats.totalProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Win Rate</span>
                <span className="font-medium text-white">{monthlyStats.winRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Best Day
                </span>
                <span className="font-medium text-green-400">{formatCurrency(monthlyStats.bestDay)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Worst Day
                </span>
                <span className="font-medium text-red-400">{formatCurrency(monthlyStats.worstDay)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <TradingCalendar ref={calendarRef} />
        </div>
      </div>
    </div>
  );
};

export default Journal