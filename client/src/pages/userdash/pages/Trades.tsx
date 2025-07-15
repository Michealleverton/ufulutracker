import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import type { Trade } from "../../../types/index";
import { useStrategyContext } from "../../../Context/StrategyContext";
import { v4 as uuidv4 } from "uuid";
import "../../../css/Loader.css";
import toast from "react-hot-toast";
import { 
  Plus, 
  Trash2, 
  Search, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  Edit3,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  ArrowUpDown
} from "lucide-react";

const Trades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "buy" | "sell">("all");
  const [sortField, setSortField] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingTrade, setEditingTrade] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    symbol: true,
    type: true,
    price: false, // Hidden by default since we have entry/exit prices
    quantity: true,
    profit: true,
    entry_price: true,
    exit_price: false, // Hide on smaller screens to save space
    trade_time: false, // Hide time by default to save space
    notes: true
  });

  // Modal state for creating new trades
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTradeForm, setNewTradeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    symbol: "",
    type: "buy" as "buy" | "sell",
    entry_price: "",
    exit_price: "",
    quantity: "",
    profit: "",
    notes: "",
    trade_time: new Date().toLocaleTimeString("en-US", { hour12: false }).slice(0, 5) // HH:MM format
  });

  const { activeStrategy, user } = useStrategyContext();

  useEffect(() => {
    if (activeStrategy && user) {
      fetchTrades();
    }
  }, [activeStrategy, user]);

  // Filter and sort trades when data or filters change
  useEffect(() => {
    let filtered = [...trades];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(trade => 
        trade.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(trade => trade.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof Trade];
      let bValue = b[sortField as keyof Trade];

      // Handle different data types
      if (sortField === "date") {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredTrades(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [trades, searchTerm, filterType, sortField, sortOrder]);

  const fetchTrades = async () => {
    if (!activeStrategy || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .eq("strategy_id", activeStrategy.id)
        .order("date", { ascending: false });
      
      if (error) {
        console.error("Error fetching trades:", error);
        setError("Loading Error");
        toast.error("Failed to load trades");
      } else {
        setTrades(data || []);
      }
    } catch (err) {
      console.error("Error fetching trades:", err);
      setError("Loading Error");
      toast.error("Failed to load trades");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrade = () => {
    if (!activeStrategy || !user) {
      toast.error("No active strategy selected");
      return;
    }
    
    // Reset form and open modal
    setNewTradeForm({
      date: new Date().toISOString().split('T')[0],
      symbol: "",
      type: "buy",
      entry_price: "",
      exit_price: "",
      quantity: "",
      profit: "",
      notes: "",
      trade_time: new Date().toLocaleTimeString("en-US", { hour12: false }).slice(0, 5)
    });
    setShowCreateModal(true);
  };

  const handleSubmitNewTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeStrategy || !user) {
      toast.error("No active strategy selected");
      return;
    }

    // Validate required fields
    if (!newTradeForm.symbol.trim()) {
      toast.error("Symbol is required");
      return;
    }
    
    if (!newTradeForm.entry_price || parseFloat(newTradeForm.entry_price) <= 0) {
      toast.error("Entry price must be greater than 0");
      return;
    }
    
    if (!newTradeForm.quantity || parseInt(newTradeForm.quantity) <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    const newTrade: Trade = {
      id: uuidv4(),
      user_id: user.id,
      strategy_id: activeStrategy.id,
      date: newTradeForm.date,
      symbol: newTradeForm.symbol.trim().toUpperCase(),
      type: newTradeForm.type,
      price: parseFloat(newTradeForm.entry_price), // Use entry_price as main price
      quantity: parseInt(newTradeForm.quantity),
      profit: newTradeForm.profit ? parseFloat(newTradeForm.profit) : 0,
      notes: newTradeForm.notes.trim(),
      entry_price: parseFloat(newTradeForm.entry_price),
      exit_price: newTradeForm.exit_price ? parseFloat(newTradeForm.exit_price) : parseFloat(newTradeForm.entry_price),
      trade_time: newTradeForm.trade_time
    };
    
    try {
      const { data, error } = await supabase.from("trades").insert([newTrade]);
      if (error) {
        console.error("Error creating trade:", error);
        console.error("Trade data being inserted:", newTrade);
        toast.error(`Failed to create trade: ${error.message}`);
      } else {
        console.log("Trade created:", data);
        toast.success("Trade created successfully");
        setShowCreateModal(false);
        fetchTrades();
      }
    } catch (err) {
      console.error("Error creating trade:", err);
      toast.error("Failed to create trade");
    }
  };

  const handleUpdateTrade = async (updatedTrade: Trade) => {
    if (!activeStrategy || !user) {
      toast.error("No active strategy selected");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("trades")
        .update({
          ...updatedTrade,
          user_id: user.id,
          strategy_id: activeStrategy.id,
        })
        .eq("id", updatedTrade.id)
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error updating trade:", error);
        toast.error("Failed to update trade");
      } else {
        console.log("Trade updated:", data);
        toast.success("Trade updated successfully");
        fetchTrades();
        setEditingTrade(null);
      }
    } catch (err) {
      console.error("Error updating trade:", err);
      toast.error("Failed to update trade");
    }
  };

  const handleDeleteSelectedTrades = async () => {
    if (!user) {
      toast.error("No user authenticated");
      return;
    }

    if (selectedTrades.size === 0) {
      toast.error("No trades selected");
      return;
    }

    try {
      const { error } = await supabase
        .from("trades")
        .delete()
        .in("id", Array.from(selectedTrades))
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error deleting selected trades:", error);
        toast.error("Failed to delete trades");
      } else {
        console.log("Selected trades deleted");
        toast.success(`${selectedTrades.size} trade(s) deleted successfully`);
        setSelectedTrades(new Set());
        fetchTrades();
      }
    } catch (err) {
      console.error("Error deleting selected trades:", err);
      toast.error("Failed to delete trades");
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column as keyof typeof prev]
    }));
  };

  const toggleTradeSelection = (tradeId: string) => {
    const newSelected = new Set(selectedTrades);
    if (newSelected.has(tradeId)) {
      newSelected.delete(tradeId);
    } else {
      newSelected.add(tradeId);
    }
    setSelectedTrades(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTrades.size === filteredTrades.length) {
      setSelectedTrades(new Set());
    } else {
      setSelectedTrades(new Set(filteredTrades.map(trade => trade.id)));
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return "—";
    try {
      const time = new Date(`1970-01-01T${timeStr}`);
      return time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Parse the date string directly without timezone conversion
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString();
  };

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrades = filteredTrades.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Show loading or no strategy message
  if (!user || !activeStrategy) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {!user ? "Please log in to view trades" : "No active strategy selected"}
          </h2>
          <p className="text-gray-400">
            {!user 
              ? "You need to be logged in to access your trades."
              : "Please select an active strategy from the sidebar to view and manage your trades."
            }
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <div className="loader">
          <div className="loader-item"></div>
          <div className="loader-item"></div>
          <div className="loader-item"></div>
        </div>
        <p className="text-white mt-4">Loading trades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Error Loading Trades</h2>
          <p className="text-gray-400 mb-6">There was an error loading your trades. Please try again.</p>
          <button
            onClick={fetchTrades}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trading Journal - {activeStrategy.name}</h1>
        <p className="text-gray-400">
          Track and analyze your trades with detailed metrics and insights.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left side - Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by symbol, notes, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "buy" | "sell")}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="buy">Buy Orders</option>
              <option value="sell">Sell Orders</option>
            </select>

            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex gap-3">
            {/* Column visibility dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors">
                <Eye className="h-4 w-4" />
                Columns
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="p-2">
                  {Object.entries(visibleColumns).map(([column, visible]) => (
                    <label key={column} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => toggleColumnVisibility(column)}
                        className="rounded"
                      />
                      <span className="capitalize text-sm">{column.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {selectedTrades.size > 0 && (
              <button
                onClick={handleDeleteSelectedTrades}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedTrades.size})
              </button>
            )}

            <button
              onClick={handleCreateTrade}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Trade
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredTrades.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <DollarSign className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm || filterType !== "all" ? "No matching trades found" : "No trades yet"}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterType !== "all" 
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Create your first trade to start tracking your trading performance."
            }
          </p>
          {(!searchTerm && filterType === "all") && (
            <button
              onClick={handleCreateTrade}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Create Your First Trade
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead className="bg-gray-750">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTrades.size === currentTrades.length && currentTrades.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    {visibleColumns.date && (
                      <th 
                        className="p-4 text-left cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.trade_time && (
                      <th 
                        className="p-4 text-left cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort("trade_time")}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Time
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.symbol && (
                      <th 
                        className="p-4 text-left cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort("symbol")}
                      >
                        <div className="flex items-center gap-2">
                          Symbol
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.type && (
                      <th 
                        className="p-4 text-left cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center gap-2">
                          Type
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.entry_price && (
                      <th 
                        className="p-4 text-left cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort("entry_price")}
                      >
                        <div className="flex items-center gap-2">
                          Entry Price
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.exit_price && (
                      <th 
                        className="p-4 text-left cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort("exit_price")}
                      >
                        <div className="flex items-center gap-2">
                          Exit Price
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.quantity && (
                      <th 
                        className="p-4 text-left cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort("quantity")}
                      >
                        <div className="flex items-center gap-2">
                          Quantity
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.profit && (
                      <th 
                        className="p-4 text-left cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort("profit")}
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          P&L
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.notes && (
                      <th className="p-4 text-left">Notes</th>
                    )}
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {currentTrades.map((trade) => (
                    <tr key={trade.id} className="border-t border-gray-700 hover:bg-gray-750 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedTrades.has(trade.id)}
                          onChange={() => toggleTradeSelection(trade.id)}
                          className="rounded"
                        />
                      </td>
                      {visibleColumns.date && (
                        <td className="p-4">
                          {editingTrade === trade.id ? (
                            <input
                              type="date"
                              defaultValue={trade.date}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-full"
                              onBlur={(e) => handleUpdateTrade({...trade, date: e.target.value})}
                            />
                          ) : (
                            <span className="text-sm">{formatDate(trade.date)}</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.trade_time && (
                        <td className="p-4">
                          {editingTrade === trade.id ? (
                            <input
                              type="time"
                              defaultValue={trade.trade_time}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-full"
                              onBlur={(e) => handleUpdateTrade({...trade, trade_time: e.target.value})}
                            />
                          ) : (
                            <span className="text-sm">{formatTime(trade.trade_time)}</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.symbol && (
                        <td className="p-4">
                          {editingTrade === trade.id ? (
                            <input
                              type="text"
                              defaultValue={trade.symbol}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-full"
                              onBlur={(e) => handleUpdateTrade({...trade, symbol: e.target.value})}
                            />
                          ) : (
                            <span className="font-medium text-blue-400">{trade.symbol}</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.type && (
                        <td className="p-4">
                          {editingTrade === trade.id ? (
                            <select
                              defaultValue={trade.type}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-full"
                              onBlur={(e) => handleUpdateTrade({...trade, type: e.target.value as 'buy' | 'sell'})}
                            >
                              <option value="buy">Buy</option>
                              <option value="sell">Sell</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              trade.type === 'buy' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-red-900 text-red-300'
                            }`}>
                              {trade.type === 'buy' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {trade.type}
                            </span>
                          )}
                        </td>
                      )}
                      {visibleColumns.entry_price && (
                        <td className="p-4">
                          {editingTrade === trade.id ? (
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={trade.entry_price}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-full"
                              onBlur={(e) => handleUpdateTrade({...trade, entry_price: parseFloat(e.target.value)})}
                            />
                          ) : (
                            <span className="text-sm">{formatCurrency(trade.entry_price)}</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.exit_price && (
                        <td className="p-4">
                          {editingTrade === trade.id ? (
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={trade.exit_price}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-full"
                              onBlur={(e) => handleUpdateTrade({...trade, exit_price: parseFloat(e.target.value)})}
                            />
                          ) : (
                            <span className="text-sm">{formatCurrency(trade.exit_price)}</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.quantity && (
                        <td className="p-4">
                          {editingTrade === trade.id ? (
                            <input
                              type="number"
                              defaultValue={trade.quantity}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-full"
                              onBlur={(e) => handleUpdateTrade({...trade, quantity: parseInt(e.target.value)})}
                            />
                          ) : (
                            <span className="text-sm">{trade.quantity}</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.profit && (
                        <td className="p-4">
                          {editingTrade === trade.id ? (
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={trade.profit}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-full"
                              onBlur={(e) => handleUpdateTrade({...trade, profit: parseFloat(e.target.value)})}
                            />
                          ) : (
                            <span className={`font-medium ${
                              (trade.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(trade.profit)}
                            </span>
                          )}
                        </td>
                      )}
                      {visibleColumns.notes && (
                        <td className="p-4">
                          {editingTrade === trade.id ? (
                            <textarea
                              defaultValue={trade.notes}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-full resize-none"
                              rows={2}
                              onBlur={(e) => handleUpdateTrade({...trade, notes: e.target.value})}
                            />
                          ) : (
                            <span 
                              className="text-sm text-gray-300 block truncate max-w-[80px]" 
                              title={trade.notes || ''}
                            >
                              {trade.notes || '—'}
                            </span>
                          )}
                        </td>
                      )}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {editingTrade === trade.id ? (
                            <>
                              <button
                                onClick={() => setEditingTrade(null)}
                                className="text-green-400 hover:text-green-300 transition-colors"
                                title="Save changes"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingTrade(null)}
                                className="text-gray-400 hover:text-gray-300 transition-colors"
                                title="Cancel editing"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingTrade(trade.id)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Edit trade"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTrades(new Set([trade.id]));
                                  handleDeleteSelectedTrades();
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete trade"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTrades.length)} of {filteredTrades.length} trades
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else {
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(totalPages, start + 4);
                      pageNum = start + i;
                      if (pageNum > end) return null;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1 rounded transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Trade Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Trade</h3>
            
            <form onSubmit={handleSubmitNewTrade} className="space-y-4">
              {/* Date and Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newTradeForm.date}
                    onChange={(e) => setNewTradeForm({...newTradeForm, date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newTradeForm.trade_time}
                    onChange={(e) => setNewTradeForm({...newTradeForm, trade_time: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Symbol and Type Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., EURUSD"
                    value={newTradeForm.symbol}
                    onChange={(e) => setNewTradeForm({...newTradeForm, symbol: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newTradeForm.type}
                    onChange={(e) => setNewTradeForm({...newTradeForm, type: e.target.value as "buy" | "sell"})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
              </div>

              {/* Entry and Exit Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Entry Price *
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    placeholder="0.00000"
                    value={newTradeForm.entry_price}
                    onChange={(e) => setNewTradeForm({...newTradeForm, entry_price: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Exit Price
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    placeholder="0.00000"
                    value={newTradeForm.exit_price}
                    onChange={(e) => setNewTradeForm({...newTradeForm, exit_price: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quantity and Profit Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={newTradeForm.quantity}
                    onChange={(e) => setNewTradeForm({...newTradeForm, quantity: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Profit/Loss
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newTradeForm.profit}
                    onChange={(e) => setNewTradeForm({...newTradeForm, profit: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  placeholder="Trade notes or analysis..."
                  value={newTradeForm.notes}
                  onChange={(e) => setNewTradeForm({...newTradeForm, notes: e.target.value})}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trades;
