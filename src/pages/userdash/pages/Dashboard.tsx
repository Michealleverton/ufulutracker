import { useState, useEffect } from "react";
import { Calendar1, ChartColumnStacked, BarChart2, Newspaper, History, ChevronLeft, ChevronRight, Settings, NotebookPen, DoorOpen, CircleX } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import useScrollToTop from '../../hooks/useScrollToTop';
import { useTheme } from "../../../Context/ThemeContext";

const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ message: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userPlan, setUserPlan] = useState(''); // Store the user's plan

    const { theme } = useTheme();

  useScrollToTop();

  useEffect(() => {
    getProfile();
    createChatTable();
    fetchMessages();
  }, []);

  const createChatTable = async () => {
    await supabase.rpc('create_chat_table');
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ message: newMessage }]);
    if (data) {
      setMessages((prevMessages) => [...prevMessages, ...data]);
      setNewMessage('');
      fetchMessages(); // Fetch messages again to refresh the chat history
    }
    if (error) {
      console.error('Error sending message:', error);
    }
  };

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, plan') // Fetch the plan along with the username
        .eq('id', user.id)
        .single();
  
      if (data) {
        setUsername(data.username);
        setUserPlan(data.plan); // Set the user's plan
      }
      if (error) toast.error('Error loading profile');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    localStorage.setItem("Loggedin", "false");
  };

  const menuItems = [
    ...(userPlan === 'pro' || userPlan === 'premium' ? [
      {
        icon: BarChart2,
        label: 'Strategy',
        path: '#',
        submenu: [
          { label: 'Strategy 1', path: '/dashboard/analytics/strategy1' },
          { label: 'Strategy 2', path: '/dashboard/analytics/strategy2' },
          { label: 'Strategy 3', path: '/dashboard/analytics/strategy3' },
          ...(userPlan === 'premium' ? [
            { label: 'AddStrategy', path: '/dashboard/analytics/addstrategy' }
          ] : []), // Only include "Add Strategy" for premium users
        ]
      }
    ] : []),
    { icon: ChartColumnStacked, label: 'Charts', path: '/dashboard/charts' },
    { icon: BarChart2, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: History, label: 'Trades', path: '/dashboard/trades' },
    { icon: Calendar1, label: 'Calender', path: '/dashboard/journal' },
    { icon: NotebookPen, label: 'Trading Plan', path: '/dashboard/tradingplan' },
    { icon: Newspaper, label: 'News', path: '/dashboard/news' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
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
      <div className={`${isCollapsed ? 'w-16' : 'w-52' } ${theme === "dark" ? "text-white border-gray-800 bg-gradient-to-t from-gray-800 to-gray" : "text-white border-gray-700 bg-gradient-to-t from-gray-700 to-gray"} border-r-[0.05rem] transition-all duration-300`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && <h2 className="text-xl font-bold"><Link to='/'>Ufulu Tracker</Link></h2>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-700"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          {!isCollapsed ? (
            <div className="text-sm flex-row">
              <p className="text-green-400 font-semibold truncate">Welcome, {username}</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        <nav className="mt-4 relative">
          {menuItems.map((item) => (
            <div key={item.label} className="relative">
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                title={isCollapsed ? item.label : ''}
                onClick={item.label === 'Strategy' ? toggleStrategyMenu : undefined}
              >
                <item.icon size={20} className="text-indigo-300" />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Link>
              {item.label === 'Strategy' && (
                <div
                  className={`absolute top-0 left-full bg-gray-800 text-white rounded-lg shadow-lg p-4 w-64 transition-opacity duration-300 ${
                    isStrategyOpen ? 'opacity-100 pointer-events-auto z-10 border-[0.05rem] border-indigo-300' : 'opacity-0 pointer-events-none z-10 border border-indigo-300'
                  }`}
                >
                  {item.submenu && item.submenu.map((subItem) => (
                    <Link
                      key={subItem.label}
                      to={subItem.path}
                      className="block text-gray-400 hover:text-indigo-400 mb-2"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/" className={`flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white ${isCollapsed ? 'justify-center' : 'justify-start'}`} onClick={handleLogout} title={isCollapsed ? 'Logout' : ''}>
            <DoorOpen size={20} className='text-indigo-300 hover:text-red-500'  />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`${theme === "dark" ? "" : "bg-white"} flex-1 overflow-auto p-4`}>
        <Outlet />
      </div>

      {/* Talk Bubble */}
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-50"
        onClick={toggleChatWindow}
      >
        AI Assist
      </button>

      {/* Chat Window */}

      {isChatOpen && (
     <div className={`fixed z-50 bottom-16 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-2xl border-[1px] border-indigo-300 w-80 h-[30rem] flex flex-col transition-transform duration-1000 ${isChatOpen ? 'translate-y-0' : 'translate-y-full'}`}>
       <div className="flex justify-between items-center mb-2">
         <h2 className="text-lg font-bold">AI Chat</h2>
         <button onClick={toggleChatWindow} className="text-red-500">
           <CircleX className="h-6 w-6 text-indigo-300 size-32" />
         </button>
       </div>
       <div className="flex-1 overflow-auto">
         {messages.map((msg, index) => (
           <p key={index} className="mb-2">{msg.message}</p>
         ))}
       </div>
       <div className="mt-2">
         <input
           type="text"
           placeholder="Type your message..."
           value={newMessage}
           onChange={(e) => setNewMessage(e.target.value)}
           className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
         />
         <button onClick={sendMessage} className="mt-2 w-full bg-blue-500 text-white p-2 rounded">Send</button>
       </div>
     </div>
     
   )}
    </div>
  );
};

export default Dashboard;