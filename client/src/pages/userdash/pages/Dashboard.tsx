import { useState, useEffect, useRef } from "react";
import {
  Calendar1,
  ChartColumnStacked,
  BarChart2,
  Newspaper,
  History,
  ChevronLeft,
  ChevronRight,
  Settings,
  NotebookPen,
  DoorOpen,
  CircleX,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Brain,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import useScrollToTop from "../../hooks/useScrollToTop";
import { useTheme } from "../../../Context/ThemeContext";
import { useStrategyContext } from "../../../Context/StrategyContext";
import { GoogleGenAI } from "@google/genai";

const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [content, setContent] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showCreateStrategy, setShowCreateStrategy] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState("");
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [editingStrategyName, setEditingStrategyName] = useState("");
  const chatBox = useRef<HTMLDivElement>(null)
  const strategyMenuRef = useRef<HTMLDivElement>(null)

  const { theme } = useTheme();
  const {
    strategies,
    user,
    loading: strategiesLoading,
    error: strategiesError,
    createStrategy,
    setActiveStrategyById,
    deleteStrategy,
    updateStrategy,
    clearError,
    refetch
  } = useStrategyContext();

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  useScrollToTop();

  useEffect(() => {
    getProfile();
    
    // Check if we need to refresh strategies after subscription update
    const needsRefresh = localStorage.getItem('needsStrategiesRefresh');
    if (needsRefresh === 'true') {
      console.log("Dashboard detected subscription update, triggering strategies refresh");
      localStorage.removeItem('needsStrategiesRefresh');
      // Trigger a refresh after a short delay
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [refetch]);

  useEffect(() => {
    if (chatBox.current) {
      chatBox.current.scrollTop = chatBox.current.scrollHeight;
    }
  }, [content]);

  useEffect(() => {
    if (strategiesError) {
      toast.error(strategiesError);
      clearError();
    }
  }, [strategiesError, clearError]);

  // Handle click outside strategy menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (strategyMenuRef.current && !strategyMenuRef.current.contains(event.target as Node)) {
        setIsStrategyOpen(false);
      }
    };

    if (isStrategyOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStrategyOpen]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setContent(""); // Clear previous content
    const response = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: newMessage
    });
    
    setNewMessage(""); // Clear input immediately
    
    for await (const chunk of response) {
      setContent((prevText) => (prevText ?? "") + (chunk.text ?? ""));
    }
  };

  const getProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, plan, avatar_url") // fetch avatar_url too
        .eq("id", user.id)
        .single();

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url || null);
        
        // Update localStorage with the current plan from database
        if (data.plan) {
          localStorage.setItem("selectedPlan", data.plan);
        }
      }
      if (error) toast.error("Error loading profile");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    localStorage.setItem("Loggedin", "false");
    localStorage.removeItem("tradeStrategies"); // Clear plan on logout
  };

  const handleCreateStrategy = async () => {
    if (!newStrategyName.trim()) {
      toast.error('Please enter a strategy name');
      return;
    }

    try {
      await createStrategy(newStrategyName.trim());
      setNewStrategyName('');
      setShowCreateStrategy(false);
      toast.success('Strategy created successfully');
    } catch (error) {
      // Error is already handled by the context and shown via toast
      console.error('Failed to create strategy:', error);
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    try {
      await deleteStrategy(strategyId);
      toast.success('Strategy deleted successfully');
    } catch (error) {
      // Error is already handled by the context and shown via toast
      console.error('Failed to delete strategy:', error);
    }
  };

  const handleSetActiveStrategy = async (strategyId: string) => {
    try {
      await setActiveStrategyById(strategyId);
      toast.success('Active strategy updated');
      setIsStrategyOpen(false);
    } catch (error) {
      // Error is already handled by the context and shown via toast
      console.error('Failed to set active strategy:', error);
    }
  };

  const startEditingStrategy = (strategyId: string, currentName: string) => {
    setEditingStrategyId(strategyId);
    setEditingStrategyName(currentName);
  };

  const cancelEditingStrategy = () => {
    setEditingStrategyId(null);
    setEditingStrategyName("");
  };

  const saveStrategyName = async (strategyId: string) => {
    if (!editingStrategyName.trim()) {
      toast.error('Please enter a strategy name');
      return;
    }

    try {
      await updateStrategy(strategyId, { name: editingStrategyName.trim() });
      setEditingStrategyId(null);
      setEditingStrategyName("");
      toast.success('Strategy name updated');
    } catch (error) {
      console.error('Failed to update strategy name:', error);
      toast.error('Failed to update strategy name');
    }
  };

  const menuItems = [
    // Always show Strategies for authenticated users (they'll get a default strategy)
    ...(user
      ? [
          {
            icon: BarChart2,
            label: "Strategies",
            path: "#",
            hasSubmenu: true,
          },
        ]
      : []),
    { icon: ChartColumnStacked, label: "Charts", path: "/dashboard/charts" },
    { icon: BarChart2, label: "Analytics", path: "/dashboard/analytics" },
    { icon: Brain, label: "AI Insights", path: "/dashboard/ai-insights" },
    { icon: History, label: "Trades", path: "/dashboard/trades" },
    { icon: Calendar1, label: "Calendar", path: "/dashboard/journal" },
    {
      icon: NotebookPen,
      label: "Trading Plan",
      path: "/dashboard/tradingplan",
    },
    { icon: Newspaper, label: "News", path: "/dashboard/news" },
    { icon: Settings, label: "Profile", path: "/dashboard/settings" },
  ];

  const toggleStrategyMenu = () => {
    setIsStrategyOpen(!isStrategyOpen);
  };

  const toggleChatWindow = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${isCollapsed ? "w-16" : "w-52"} ${
          theme === "dark"
            ? "text-white border-gray-800 bg-gradient-to-t from-gray-800 to-gray"
            : "text-white border-gray-700 bg-gradient-to-t from-gray-700 to-gray"
        } border-r-[0.05rem] transition-all duration-300`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <h2 className="text-xl font-bold">
              <Link to="/">Ufulu Tracker</Link>
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-700"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        <div className="p-4 border-b border-gray-700">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border-2 border-indigo-400 object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-green-400 font-semibold truncate">
                {username}
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border-2 border-indigo-400 object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="mt-4 relative">
          {menuItems.map((item) => (
            <div key={item.label} className="relative" ref={item.label === "Strategies" ? strategyMenuRef : undefined}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white ${
                  isCollapsed ? "justify-center" : "justify-start"
                }`}
                title={isCollapsed ? item.label : ""}
                onClick={
                  item.label === "Strategies" ? toggleStrategyMenu : undefined
                }
              >
                <item.icon size={20} className="text-indigo-300" />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Link>
              {item.label === "Strategies" && (
                <div
                  className={`absolute top-0 left-full bg-gray-800 text-white rounded-lg shadow-lg p-4 w-80 transition-opacity duration-300 ${
                    isStrategyOpen
                      ? "opacity-100 pointer-events-auto z-10 border-[0.05rem] border-indigo-300"
                      : "opacity-0 pointer-events-none z-10 border border-indigo-300"
                  }`}
                >
                  <h3 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center justify-between">
                    Your Strategies
                    <span className="text-xs text-gray-400 font-normal">
                      {strategies.length}/{user?.max_strategies || 1}
                    </span>
                  </h3>
                  
                  {strategiesLoading ? (
                    <div className="text-gray-400 text-sm">Loading strategies...</div>
                  ) : strategiesError ? (
                    <div className="text-red-400 text-sm">
                      <p className="mb-2">{strategiesError}</p>
                      <p className="text-xs">Please set up the database first.</p>
                    </div>
                  ) : strategies.length === 0 ? (
                    <div className="text-gray-400 text-sm">
                      <p className="mb-2">No strategies found.</p>
                      <p className="text-xs">The database may not be set up yet.</p>
                    </div>
                  ) : (
                    <>
                      {strategies.map((strategy) => (
                        <div
                          key={strategy.id}
                          className={`flex items-center justify-between mb-2 p-2 rounded ${
                            strategy.is_active ? 'bg-indigo-900 border border-indigo-400' : 'hover:bg-gray-700'
                          }`}
                        >
                          {editingStrategyId === strategy.id ? (
                            // Edit mode
                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                type="text"
                                value={editingStrategyName}
                                onChange={(e) => setEditingStrategyName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveStrategyName(strategy.id);
                                  } else if (e.key === 'Escape') {
                                    cancelEditingStrategy();
                                  }
                                }}
                                className="flex-1 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-indigo-400"
                                autoFocus
                              />
                              <button
                                onClick={() => saveStrategyName(strategy.id)}
                                className="text-green-400 hover:text-green-300 p-1"
                                title="Save"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={cancelEditingStrategy}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            // Display mode
                            <>
                              <button
                                onClick={() => handleSetActiveStrategy(strategy.id)}
                                className={`flex-1 text-left text-sm ${
                                  strategy.is_active ? 'text-indigo-300 font-semibold' : 'text-gray-300 hover:text-white'
                                }`}
                              >
                                {strategy.name}
                                {strategy.is_active && (
                                  <span className="ml-2 text-xs bg-indigo-600 px-2 py-1 rounded">Active</span>
                                )}
                              </button>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => startEditingStrategy(strategy.id, strategy.name)}
                                  className="text-yellow-400 hover:text-yellow-300 p-1"
                                  title="Edit strategy name"
                                >
                                  <Edit size={14} />
                                </button>
                                {strategies.length > 1 && (
                                  <button
                                    onClick={() => handleDeleteStrategy(strategy.id)}
                                    className="text-red-400 hover:text-red-300 p-1"
                                    title="Delete strategy"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      
                      {user && (user.plan === 'premium' || user.plan === 'pro') && strategies.length < user.max_strategies && (
                        <div className="mt-4 pt-3 border-t border-gray-600">
                          {showCreateStrategy ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Strategy name"
                                value={newStrategyName}
                                onChange={(e) => setNewStrategyName(e.target.value)}
                                className="w-full p-2 text-sm bg-gray-700 border border-gray-600 rounded text-white"
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateStrategy()}
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleCreateStrategy}
                                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded"
                                >
                                  Create
                                </button>
                                <button
                                  onClick={() => {
                                    setShowCreateStrategy(false);
                                    setNewStrategyName('');
                                  }}
                                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowCreateStrategy(true)}
                              className="flex items-center justify-center w-full text-indigo-400 hover:text-indigo-300 text-sm py-2 border border-indigo-400 hover:border-indigo-300 rounded"
                            >
                              <Plus size={14} className="mr-1" />
                              Add Strategy
                            </button>
                          )}
                        </div>
                      )}
                      
                      {user && user.plan === 'free' && (
                        <div className="mt-4 pt-3 border-t border-gray-600">
                          <p className="text-xs text-gray-400 mb-2">Want multiple strategies?</p>
                          <Link
                            to="/dashboard/settings"
                            className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded transition-colors"
                          >
                            Upgrade Plan
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          <Link
            to="/"
            className={`flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white ${
              isCollapsed ? "justify-center" : "justify-start"
            }`}
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : ""}
          >
            <DoorOpen
              size={20}
              className="text-indigo-300 hover:text-red-500"
            />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-900">
        <Outlet />
      </div>

      {/* AI Assistant Button */}
      {/* <button
        className="fixed bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg z-50 transition-all duration-200 transform hover:scale-105"
        onClick={toggleChatWindow}
      >
        AI Assistant
      </button> */}

      {/* Chat Window */}

      {isChatOpen && (
        <div
          className={`fixed z-50 bottom-16 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-2xl border-[1px] border-indigo-300 w-80 h-[30rem] flex flex-col transition-transform duration-1000 ${
            isChatOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Trading AI Assistant
            </h2>
            <button onClick={toggleChatWindow} className="text-gray-400 hover:text-red-400 transition-colors">
              <CircleX className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 bg-gray-700 rounded-lg mb-2" ref={chatBox}>
            {content ? (
              <div className="text-sm text-white whitespace-pre-wrap">{content}</div>
            ) : (
              <div className="text-sm text-gray-400 text-center py-8">
                Ask me anything about trading, strategies, or how to use this platform!
              </div>
            )}
          </div>

          <div className="mt-2">
            <input
              type="text"
              placeholder="Ask about trading strategies, analysis, or platform features..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
            />

            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded transition-colors"
            >
              Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
