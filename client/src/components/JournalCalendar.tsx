import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { supabase } from "../lib/supabase";
import CustomToolbar from "./CustomToolbar";
import "../css/Loader.css";
import { useStrategyContext } from "../Context/StrategyContext";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../css/JournalCalendar.css"; // Load our CSS AFTER react-big-calendar CSS

const localizer = momentLocalizer(moment);

interface TradeEntry {
  id: string;
  date: string;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  profit: number;
  notes: string;
}

export interface JournalCalendarRef {
  openNewTradeModal: (date: Date) => void;
}

const JournalCalendar = forwardRef<JournalCalendarRef>((_, ref) => {
  const [entries, setEntries] = useState<TradeEntry[]>([]);
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
  
  // String states to preserve input during typing
  const [priceInput, setPriceInput] = useState("");

  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);

  useEffect(() => {
    if (activeStrategy && user) {
      fetchEntries();
    }
  }, [activeStrategy, user]);

  const fetchEntries = async () => {
    if (!activeStrategy || !user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .select("id, date, symbol, type, quantity, price, profit, notes")
      .eq("user_id", user.id)
      .eq("strategy_id", activeStrategy.id);
    if (error) {
      console.error("Error fetching entries:", error);
    } else {
      const formattedData = data.map((trade: any) => ({
        id: trade.id,
        date: moment(trade.date).toISOString(),
        symbol: trade.symbol || "",
        type: trade.type || "",
        quantity: trade.quantity || 0,
        price: trade.price || 0,
        profit: trade.profit || 0,
        notes: trade.notes || "",
      }));
      setEntries(formattedData);
      setIsLoading(false);
    }
  };

  // Custom date header for month view
  const CustomDateHeader = ({ label, date, children }: { label: string; date: Date; children?: React.ReactNode }) => {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <button
          className={`rbc-date-header-btn${isToday ? " today" : ""}`}

          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            openNewTradeModal(date);
          }}
          tabIndex={0}
          type="button"
        >
          {label}
        </button>
        {/* Render the rest of the cell content */}
        {/* <div style={{ visibility: "hidden" }}>{label}</div> */}
        {children}
      </div>
    );
  };

  // When user clicks an event, open modal with trade data
  const handleSelectEvent = (event: any) => {
    const trade = event.resource as TradeEntry;
    setEditingTradeId(trade.id);
    setModalDate(new Date(trade.date));
    setSymbol(trade.symbol);
    setType(trade.type);
    setQuantity(trade.quantity);
    setPrice(trade.price);
    setPriceInput(trade.price.toString());
    setProfit(trade.profit);
    setNotes(trade.notes);
    setModalOpen(true);
  };

  // Save new or edited trade entry
  const handleSaveNewEntry = async () => {
    if (!modalDate || !activeStrategy || !user) return;
    
    const entry = {
      date: modalDate.toISOString(),
      symbol,
      type,
      quantity,
      price,
      profit,
      notes,
      user_id: user.id,
      strategy_id: activeStrategy.id,
    };

    if (editingTradeId) {
      // Update existing trade
      const { data, error } = await supabase
        .from("trades")
        .update(entry)
        .eq("id", editingTradeId)
        .select();
      if (error) {
        console.error("Error updating entry:", error);
      } else if (data && data.length > 0) {
        setEntries(
          entries.map((e) =>
            e.id === editingTradeId ? { ...entry, id: editingTradeId } : e
          )
        );
        closeModal();
      }
    } else {
      // Insert new trade
      const { data, error } = await supabase.from("trades").insert([entry]).select();
      if (error) {
        console.error("Error saving entry:", error);
      } else if (data && data.length > 0) {
        setEntries([...entries, { ...entry, id: data[0].id } as TradeEntry]);
        closeModal();
      }
    }
  };

  // When opening modal for new trade, reset editingTradeId
  const openNewTradeModal = (date: Date) => {
    setEditingTradeId(null);
    setModalDate(date);
    resetForm();
    setModalOpen(true);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openNewTradeModal
  }));

  // Helper function to format currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Helper function to reset form fields
  const resetForm = () => {
    setSymbol("");
    setType("");
    setQuantity(0);
    setPrice(0);
    setPriceInput("");
    setProfit(0);
    setNotes("");
  };

  // Helper function to close modal and reset form
  const closeModal = () => {
    setModalOpen(false);
    setEditingTradeId(null);
    resetForm();
  };

  const eventStyleGetter = (event: any) => {
    const profit = event.resource.profit;
    let style;
    
    if (profit > 0) {
      style = {
        backgroundColor: '#10b98120',
        border: '1px solid #10b981',
        color: '#f3f4f6', // Light gray/white text instead of green
        borderRadius: '6px',
        padding: '2px 6px',
        fontSize: '0.75rem',
        fontWeight: '500',
      };
    } else if (profit < 0) {
      style = {
        backgroundColor: '#ef444420',
        border: '1px solid #ef4444',
        color: '#f3f4f6', // Light gray/white text instead of red
        borderRadius: '6px',
        padding: '2px 6px',
        fontSize: '0.75rem',
        fontWeight: '500',
      };
    } else {
      style = {
        backgroundColor: '#374151',
        border: '1px solid #4b5563',
        color: '#f3f4f6', // Light gray/white text
        borderRadius: '6px',
        padding: '2px 6px',
        fontSize: '0.75rem',
        fontWeight: '500',
      };
    }
    
    return { style };
  };

  const dayPropGetter = (date: Date) => {
    const dayTrades = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() === date.getFullYear() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getDate() === date.getDate()
      );
    });
    
    const totalProfit = dayTrades.reduce((sum, trade) => sum + trade.profit, 0);
    
    // FORCE ALL DAYS TO HAVE DARK BACKGROUND
    let style: any = {
      backgroundColor: '#111827',
      background: '#111827',
    };
    let className = "";
    
    // Only add border styling for profitable or loss days
    if (dayTrades.length > 0 && totalProfit > 0) {
      style = {
        backgroundColor: '#111827',
        background: '#111827',
        border: '2px solid #10b981',
        borderRadius: '8px',
      };
      className = "has-trades profit-day";
    } else if (dayTrades.length > 0 && totalProfit < 0) {
      style = {
        backgroundColor: '#111827',
        background: '#111827',
        border: '2px solid #ef4444',
        borderRadius: '8px',
      };
      className = "has-trades loss-day";
    }
    
    return { style, className };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className='loader'>
          <div className="loader-item"></div>
          <div className="loader-item"></div>
          <div className="loader-item"></div>
        </div>
      </div>
    );
  }

  // Show loading or no strategy message
  if (!user || !activeStrategy) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {!user ? "Please log in to view calendar" : "No active strategy selected"}
          </h2>
          <p className="text-gray-400">
            {!user 
              ? "You need to be logged in to access your trading calendar."
              : "Please select an active strategy from the sidebar to view your trades calendar."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      {/* Calendar Wrapper */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <Calendar
          localizer={localizer}
          events={entries.map((entry) => ({
            title: `${entry.symbol}: ${formatCurrency(entry.profit)}`, // Show symbol and profit
            start: new Date(entry.date),
            end: new Date(entry.date),
            allDay: true,
            resource: entry,
          }))}
          startAccessor="start"
          endAccessor="end"
          selectable={false}
          style={{ height: 650, color: "white" }}
          components={{
            toolbar: CustomToolbar,
            month: {
              dateHeader: (props) => <CustomDateHeader {...props} />,
            },
          }}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          popup={true}
          showMultiDayTimes={true}
          onSelectEvent={handleSelectEvent} // Handle event selection
        />
      </div>

      {/* Modern Modal for adding/editing trades */}
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

            {/* Modal Content */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSaveNewEntry();
              }}
              className="p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Symbol *
                    </label>
                    <input
                      type="text"
                      value={symbol}
                      onChange={e => setSymbol(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., AAPL, EURUSD"
                      maxLength={10}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Trade Type *
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

                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={quantity || ''}
                      onChange={e => {
                        const value = e.target.value;
                        if (value === '' || !isNaN(Number(value))) {
                          setQuantity(value === '' ? 0 : Number(value));
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min={0}
                      step="any"
                      required
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      value={priceInput}
                      onChange={e => {
                        const value = e.target.value;
                        setPriceInput(value);
                        if (value === '') {
                          setPrice(0);
                        } else {
                          const numValue = Number(value);
                          if (!isNaN(numValue)) {
                            setPrice(numValue);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      min={0}
                      step="any"
                      required
                    />
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profit/Loss *
                    </label>
                    <input
                      type="number"
                      value={profit || ''}
                      onChange={e => {
                        const value = e.target.value;
                        if (value === '' || !isNaN(Number(value))) {
                          setProfit(value === '' ? 0 : Number(value));
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="any"
                      required
                    />
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
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
    </div>
  );
});

JournalCalendar.displayName = 'JournalCalendar';

export default JournalCalendar;