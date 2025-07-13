import { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "../lib/supabase";
import CustomToolbar from "./CustomToolbar";
import "../css/JournalCalendar.css";
import "../css/Loader.css";
import { useStrategyContext } from "../Context/StrategyContext";

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

const JournalCalendar: React.FC = () => {
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
    const borderColor = profit > 0 ? "green" : profit < 0 ? "red" : "gray";
    const style = {
      border: `2px solid ${borderColor}`,
      backgroundColor: "transparent",
      color: "black",
      borderRadius: "3px",
      padding: "2px",
      paddingLeft: "5px",
      fontSize: "0.9em",
    };
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
    let style = {};
    let className = "";
    if (dayTrades.length > 0) {
      style = {
        backgroundColor: totalProfit > 0 ? "#90EE90" : "#FFB6C1",
        border: "1px solid black",
      };
      className = "has-trades";
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
      <div className="flex flex-col items-center justify-center h-96 text-white">
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
    <div className="px-10">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Trading Calendar - {activeStrategy.name}</h1>
        {/* <p className="text-gray-400">View and manage your trades for this strategy</p> */}
        <p className="text-gray-400">Click the day you want to add a new trade. </p>
        <p className="text-gray-400">Click on a trade to update it</p>
      </div>
      <Calendar
        localizer={localizer}
        events={entries.map((entry) => ({
          title: `${entry.profit}`, // Show price as event title
          start: new Date(entry.date),
          end: new Date(entry.date),
          allDay: true,
          resource: entry,
        }))}
        startAccessor="start"
        endAccessor="end"
        selectable={false}
        style={{ height: 700, color: "white", padding: 20, borderRadius: 10 }}
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

      {/* Modal for adding new trade entry */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-gradient-border">
            <div className="modal-content modal-flex">
              <h2 className="modal-title">
                {editingTradeId ? "Edit Trade" : "Add Trade"} for {modalDate?.toLocaleDateString()}
              </h2>
              <form
                className="modal-form"
                onSubmit={e => {
                  e.preventDefault();
                  handleSaveNewEntry();
                }}
                autoComplete="off"
              >
                <div className="modal-col">
                  <label>
                    <span className="modal-label">Symbol</span>
                    <input
                      className="modal-input"
                      type="text"
                      value={symbol}
                      onChange={e => setSymbol(e.target.value)}
                      autoFocus
                      required
                      maxLength={10}
                    />
                  </label>
                  <label>
                    <span className="modal-label">Type</span>
                    <select
                      className="modal-input"
                      value={type}
                      onChange={e => setType(e.target.value)}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                  </label>
                  <label>
                    <span className="modal-label">Quantity</span>
                    <input
                      className="modal-input"
                      type="number"
                      value={quantity || ''}
                      onChange={e => {
                        const value = e.target.value;
                        // Allow empty string or valid numbers
                        if (value === '' || !isNaN(Number(value))) {
                          setQuantity(value === '' ? 0 : Number(value));
                        }
                      }}
                      min={0}
                      step="any"
                      placeholder="0"
                      required
                    />
                  </label>
                </div>
                <div className="modal-col">
                  <label>
                    <span className="modal-label">Price</span>
                    <input
                      className="modal-input"
                      type="number"
                      value={priceInput}
                      onChange={e => {
                        const value = e.target.value;
                        setPriceInput(value);
                        // Update the numeric price state
                        if (value === '') {
                          setPrice(0);
                        } else {
                          const numValue = Number(value);
                          if (!isNaN(numValue)) {
                            setPrice(numValue);
                          }
                        }
                      }}
                      min={0}
                      step="any"
                      placeholder="0.00000"
                      required
                    />
                  </label>
                  <label>
                    <span className="modal-label">Profit</span>
                    <input
                      className="modal-input"
                      type="number"
                      value={profit || ''}
                      onChange={e => {
                        const value = e.target.value;
                        // Allow empty string or valid numbers (including negative for losses)
                        if (value === '' || !isNaN(Number(value))) {
                          setProfit(value === '' ? 0 : Number(value));
                        }
                      }}
                      step="any"
                      placeholder="0.00"
                      required
                    />
                  </label>
                  <label>
                    <span className="modal-label">Notes</span>
                    <textarea
                      className="modal-input"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      maxLength={200}
                      placeholder="Add notes (optional)"
                    />
                  </label>
                </div>
                <div className="modal-actions">
                  <button className="modal-btn modal-btn-primary" type="submit">
                    Save
                  </button>
                  <button
                    className="modal-btn modal-btn-secondary"
                    type="button"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
          <style>{`
            .modal-overlay {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(30, 41, 59, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .modal-gradient-border {
              padding: 3px;
              border-radius: 18px;
              background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.2) 100%);
              display: inline-block;
            }
            .modal-content {
              background: #181f2a;
              color: #f3f4f6;
              border-radius: 14px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.25);
              padding: 2rem 2.5rem 1.5rem 2.5rem;
              min-width: 340px;
              max-width: 540px;
              width: 95vw;
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
            }
            .modal-title {
              font-size: 1.3rem;
              font-weight: 600;
              margin-bottom: 1.2rem;
              letter-spacing: 0.02em;
              color: #60a5fa;
              text-align: center;
            }
            .modal-form {
              display: flex;
              flex-direction: row;
              gap: 2rem;
              flex-wrap: wrap;
            }
            .modal-col {
              flex: 1 1 0;
              min-width: 140px;
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
            .modal-label {
              font-size: 0.98em;
              font-weight: 500;
              margin-bottom: 0.2em;
              color: #cbd5e1;
              display: block;
            }
            .modal-input {
              width: 100%;
              padding: 0.5em 0.7em;
              border-radius: 6px;
              border: 1.5px solid #334155;
              background: #232b3b;
              color: #f3f4f6;
              font-size: 1em;
              transition: border 0.2s;
              outline: none;
              resize: none;
            }
            .modal-input:focus {
              border-color: #60a5fa;
              background: #1e293b;
            }
            .modal-actions {
              display: flex;
              justify-content: flex-end;
              gap: 1rem;
              width: 100%;
              margin-top: 1.5rem;
              grid-column: 1 / span 2;
            }
            .modal-btn {
              padding: 0.55em 1.5em;
              border-radius: 6px;
              border: none;
              font-size: 1em;
              font-weight: 500;
              cursor: pointer;
              transition: background 0.18s, color 0.18s;
            }
            .modal-btn-primary {
              background: #2563eb;
              color: #fff;
            }
            .modal-btn-primary:hover {
              background: #1d4ed8;
            }
            .modal-btn-secondary {
              background: #334155;
              color: #cbd5e1;
            }
            .modal-btn-secondary:hover {
              background: #475569;
              color: #fff;
            }
            @media (max-width: 600px) {
              .modal-content {
                padding: 1.2rem 0.5rem;
                min-width: 90vw;
                max-width: 98vw;
              }
              .modal-form {
                flex-direction: column;
                gap: 0.5rem;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default JournalCalendar;