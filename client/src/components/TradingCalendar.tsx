import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useStrategyContext } from "../Context/StrategyContext";
import type { Trade } from "../types/index";

export interface TradingCalendarRef {
  openNewTradeModal: (date: Date) => void;
}

interface DayData {
  date: Date;
  trades: Trade[];
  totalPL: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const TradingCalendar = forwardRef<TradingCalendarRef>((_, ref) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeStrategy, user } = useStrategyContext();

  // Modal state and form fields
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);

  // Add modal state for viewing all trades for a day
  const [showDayTradesModal, setShowDayTradesModal] = useState(false);
  const [modalTrades, setModalTrades] = useState<Trade[]>([]);

  // Expose the openNewTradeModal method via ref
  useImperativeHandle(ref, () => ({
    openNewTradeModal: (date: Date) => {
      openNewTradeModal(date);
    }
  }));

  useEffect(() => {
    if (activeStrategy && user) {
      fetchEntries();
    }
  }, [activeStrategy, user, currentDate]);

  const fetchEntries = async () => {
    if (!activeStrategy || !user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("strategy_id", activeStrategy.id)
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching trades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar logic
  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get first day of the month and calculate grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  // Get previous month's trailing days
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  const trailingDays = firstDayOfWeek;

  // Calculate total cells needed (35 for 5x7 grid)
  const totalCells = 35;
  const leadingDays = totalCells - trailingDays - daysInMonth;

  // Build calendar days array
  const calendarDays: DayData[] = [];

  // Previous month trailing days
  for (let i = trailingDays - 1; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i);
    calendarDays.push({
      date,
      trades: getTradesForDate(date),
      totalPL: getTotalPLForDate(date),
      isCurrentMonth: false,
      isToday: isSameDay(date, today)
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    calendarDays.push({
      date,
      trades: getTradesForDate(date),
      totalPL: getTotalPLForDate(date),
      isCurrentMonth: true,
      isToday: isSameDay(date, today)
    });
  }

  // Next month leading days
  for (let day = 1; day <= leadingDays; day++) {
    const date = new Date(currentYear, currentMonth + 1, day);
    calendarDays.push({
      date,
      trades: getTradesForDate(date),
      totalPL: getTotalPLForDate(date),
      isCurrentMonth: false,
      isToday: isSameDay(date, today)
    });
  }

  // Helper functions
  function getTradesForDate(date: Date): Trade[] {
    const dateStr = date.toISOString().split('T')[0];
    return entries.filter(entry => entry.date === dateStr);
  }

  function getTotalPLForDate(date: Date): number {
    const trades = getTradesForDate(date);
    return trades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  }

  function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Modal functions
  const openNewTradeModal = (date: Date) => {
    setModalDate(date);
    setEditingTradeId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditTradeModal = (trade: Trade) => {
    setModalDate(new Date(trade.date));
    setEditingTradeId(trade.id);
    setSymbol(trade.symbol);
    setType(trade.type);
    setQuantity(trade.quantity || 0);
    setPrice(trade.entry_price || trade.price || 0);
    setPriceInput((trade.entry_price || trade.price || 0).toString());
    setProfit(trade.profit || 0);
    setNotes(trade.notes || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalDate(null);
    setEditingTradeId(null);
    resetForm();
  };

  const resetForm = () => {
    setSymbol("");
    setType("");
    setQuantity(0);
    setPrice(0);
    setPriceInput("");
    setProfit(0);
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDate || !activeStrategy || !user) return;

    const tradeData = {
      date: modalDate.toISOString().split('T')[0],
      symbol: symbol.toUpperCase(),
      type,
      quantity: Number(quantity),
      price: Number(price), // Keep this for compatibility
      entry_price: Number(price), // Add proper entry_price field
      profit: Number(profit),
      notes,
      strategy_id: activeStrategy.id,
      user_id: user.id,
    };

    try {
      if (editingTradeId) {
        const { error } = await supabase
          .from("trades")
          .update(tradeData)
          .eq("id", editingTradeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("trades")
          .insert([tradeData]);
        if (error) throw error;
      }

      await fetchEntries();
      closeModal();
    } catch (error) {
      console.error("Error saving trade:", error);
    }
  };

  const handleShowDayTradesModal = (date: Date, trades: Trade[]) => {
    setModalDate(date);
    setModalTrades(trades);
    setShowDayTradesModal(true);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="h-10 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayData, index) => (
            <CalendarDay
              key={index}
              dayData={dayData}
              onDayClick={openNewTradeModal}
              onTradeClick={openEditTradeModal}
              onShowDayTradesModal={handleShowDayTradesModal}
            />
          ))}
        </div>
      </div>

      {/* Trade Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white mb-1">
                {editingTradeId ? "Edit Trade" : "Add New Trade"}
              </h2>
              <p className="text-gray-400 text-sm">
                {modalDate?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Symbol and Type */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={e => setSymbol(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., EURUSD"
                    required
                  />
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trade Type
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>

                {/* Quantity and Price */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity || ""}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    step="any"
                    required
                  />
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Entry Price
                  </label>
                  <input
                    type="text"
                    value={priceInput}
                    onChange={e => {
                      const value = e.target.value;
                      setPriceInput(value);
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        setPrice(numValue);
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Profit/Loss */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profit/Loss ($)
                  </label>
                  <input
                    type="number"
                    value={profit || ""}
                    onChange={e => setProfit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="any"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Add trade notes (optional)"
                    rows={3}
                    maxLength={200}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border border-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingTradeId ? "Update Trade" : "Save Trade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for all trades for a day */}
      {showDayTradesModal && modalDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Trades for {modalDate.toLocaleDateString()}</h3>
            <div className="space-y-2 mb-4">
              {modalTrades.map(trade => (
                <div
                  key={trade.id}
                  className={`p-3 rounded cursor-pointer flex justify-between items-center transition-colors ${
                    (trade.profit || 0) >= 0 ? 'bg-green-900/40 hover:bg-green-800/60' : 'bg-red-900/40 hover:bg-red-800/60'
                  }`}
                  onClick={() => {
                    setShowDayTradesModal(false);
                    openEditTradeModal(trade);
                  }}
                  title={`Edit trade: ${trade.symbol}`}
                >
                  <span className="font-bold text-blue-300">{trade.symbol}</span>
                  <span className="text-xs text-gray-300">{trade.type}</span>
                  <span className={`font-medium ${
                    (trade.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>{trade.profit}</span>
                </div>
              ))}
            </div>
            <button
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              onClick={() => setShowDayTradesModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// Calendar Day Component
interface CalendarDayProps {
  dayData: DayData;
  onDayClick: (date: Date) => void;
  onTradeClick: (trade: Trade) => void;
  onShowDayTradesModal: (date: Date, trades: Trade[]) => void;
}

const CalendarDay = ({ dayData, onDayClick, onTradeClick, onShowDayTradesModal }: CalendarDayProps) => {
  const { date, trades, totalPL, isCurrentMonth, isToday } = dayData;
  const dayNumber = date.getDate();
  const hasProfit = totalPL > 0;
  const hasLoss = totalPL < 0;
  const hasTrades = trades.length > 0;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  return (
    <div
      className={`
        relative h-32 border border-gray-700 rounded-lg cursor-pointer transition-all duration-200
        ${isCurrentMonth 
          ? 'bg-gray-800 hover:bg-gray-750' 
          : 'bg-gray-900/50 hover:bg-gray-800/50'
        }
        ${isToday ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${hasProfit ? 'bg-gradient-to-br from-green-900/20 to-gray-800' : ''}
        ${hasLoss ? 'bg-gradient-to-br from-red-900/20 to-gray-800' : ''}
        hover:border-gray-600 group
      `}
      onClick={() => onDayClick(date)}
    >
      {/* Day Number */}
      <div className="absolute top-2 right-2 z-10">
        <span
          className={`
            inline-flex items-center justify-center w-6 h-6 text-sm font-semibold rounded-full
            ${isToday 
              ? 'bg-blue-600 text-white' 
              : isCurrentMonth 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-600'
            }
            transition-all duration-200
          `}
        >
          {dayNumber}
        </span>
      </div>

      {/* P&L Display */}
      {hasTrades && (
        <div className="absolute top-2 left-2 z-10">
          <div className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
            ${hasProfit ? 'bg-green-900/80 text-green-300' : 'bg-red-900/80 text-red-300'}
          `}>
            {hasProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {formatCurrency(totalPL)}
          </div>
        </div>
      )}

      {/* Trade Badges and +N More (always below P&L, top-left aligned) */}
      <div className="absolute left-2 top-10 right-2 flex flex-col items-start gap-1 z-10">
        {trades.length > 0 && (
          trades.length <= 2
            ? trades.map((trade) => (
                <div
                  key={trade.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTradeClick(trade);
                  }}
                  className={`
                    px-2 py-1 rounded text-xs font-medium cursor-pointer truncate flex items-center justify-between gap-2
                    ${(trade.profit || 0) >= 0 
                      ? 'bg-green-900/60 text-green-300 hover:bg-green-800/60' 
                      : 'bg-red-900/60 text-red-300 hover:bg-red-800/60'
                    }
                    transition-colors duration-150
                  `}
                >
                  <span>{trade.symbol}</span>
                  <span className={`font-semibold ${(trade.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trade.profit}</span>
                </div>
              ))
            : (
                <>
                  <div
                    key={trades[0].id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTradeClick(trades[0]);
                    }}
                    className={`
                      px-2 py-1 rounded text-xs font-medium cursor-pointer truncate flex items-center justify-between gap-2
                      ${(trades[0].profit || 0) >= 0 
                        ? 'bg-green-900/60 text-green-300 hover:bg-green-800/60' 
                        : 'bg-red-900/60 text-red-300 hover:bg-red-800/60'
                      }
                      transition-colors duration-150
                    `}
                  >
                    <span>{trades[0].symbol}</span>
                    <span className={`font-semibold ${(trades[0].profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trades[0].profit}</span>
                  </div>
                  <button
                    className="px-2 py-1 text-xs text-blue-400 text-center rounded bg-gray-700/60 hover:bg-blue-700/60 cursor-pointer w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowDayTradesModal(date, trades);
                    }}
                    title={`View all ${trades.length} trades for this day`}
                  >
                    +{trades.length - 1} more
                  </button>
                </>
              )
        )}
      </div>

      {/* Add Trade Button (on hover) */}
      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDayClick(date);
          }}
          className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

TradingCalendar.displayName = 'TradingCalendar';

export default TradingCalendar;
