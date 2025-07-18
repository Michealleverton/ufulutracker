import { useState } from "react";
import { useTheme } from "../../../Context/ThemeContext";
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Clock, 
  PenTool,
  Calculator,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  X,
  Plus,
  History
} from "lucide-react";

const TradingPlan = () => {
  const { theme } = useTheme();

  const [purpose, setPurpose] = useState(
    localStorage.getItem("purpose") ||
      "Example : I am trading to have a retirement nest egg and quit my 9 to 5, so I can work for myself. Making me money not someone else. I want to replace my job income, so I can have the freedom of my own hours and spending as much time with my family as possible."
  );
  const [isEditingPurpose, setIsEditingPurpose] = useState(false);
  const [isEditingExpenses, setIsEditingExpenses] = useState(false);
  const [name, setName] = useState(
    localStorage.getItem("name") || "Put name here"
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [livingExpenses, setLivingExpenses] = useState(
    localStorage.getItem("livingExpenses") || "$4,000"
  );

  const [monthlyLivingExpenses, setMonthlyLivingExpenses] = useState(
    localStorage.getItem("monthlyLivingExpenses") || "$7,500"
  );
  const [isEditingMonthlyExpenses, setIsEditingMonthlyExpenses] =
    useState(false);

  const [percentage, setPercentage] = useState(
    localStorage.getItem("percentage") || "20%"
  );
  const [isEditingPercentage, setIsEditingPercentage] = useState(false);

  // Risk Management States
  const [riskPerTrade, setRiskPerTrade] = useState(
    localStorage.getItem("riskPerTrade") || "5%"
  );
  const [isEditingRiskPerTrade, setIsEditingRiskPerTrade] = useState(false);
  
  const [maxLossPerDay, setMaxLossPerDay] = useState(
    localStorage.getItem("maxLossPerDay") || "5%"
  );
  const [isEditingMaxLossPerDay, setIsEditingMaxLossPerDay] = useState(false);
  
  const [riskReward, setRiskReward] = useState(
    localStorage.getItem("riskReward") || "1:5"
  );
  const [isEditingRiskReward, setIsEditingRiskReward] = useState(false);
  
  const [winRate, setWinRate] = useState(
    localStorage.getItem("winRate") || "80%"
  );
  const [isEditingWinRate, setIsEditingWinRate] = useState(false);
  
  const [monthlyTarget, setMonthlyTarget] = useState(
    localStorage.getItem("monthlyTarget") || "100%"
  );
  const [isEditingMonthlyTarget, setIsEditingMonthlyTarget] = useState(false);
  
  const [maxTradesPerDay, setMaxTradesPerDay] = useState(
    localStorage.getItem("maxTradesPerDay") || "2"
  );
  const [isEditingMaxTradesPerDay, setIsEditingMaxTradesPerDay] = useState(false);

  // Trading Instruments States
  const [tradingInstruments, setTradingInstruments] = useState(
    JSON.parse(localStorage.getItem("tradingInstruments") || '["USD/CAD", "GOLD", "SILVER", "BITCOIN"]')
  );
  const [isEditingInstruments, setIsEditingInstruments] = useState(false);
  const [newInstrument, setNewInstrument] = useState("");

  // Trading Hours States
  const [tradingHours, setTradingHours] = useState(
    localStorage.getItem("tradingHours") || "9:00 AM - 5:00 PM"
  );
  const [isEditingTradingHours, setIsEditingTradingHours] = useState(false);

  const updatePurpose = () => {
    localStorage.setItem("purpose", purpose);
  };

  const updateLivingExpenses = () => {
    localStorage.setItem("livingExpenses", livingExpenses);
  };
  const updateMonthlyLivingExpenses = () => {
    localStorage.setItem("monthlyLivingExpenses", monthlyLivingExpenses);
  };

  const updatePercentage = () => {
    localStorage.setItem("percentage", percentage);
  };

  const updateName = () => {
    localStorage.setItem("name", name);
  };

  // Risk Management Update Functions
  const updateRiskPerTrade = () => {
    localStorage.setItem("riskPerTrade", riskPerTrade);
  };

  const updateMaxLossPerDay = () => {
    localStorage.setItem("maxLossPerDay", maxLossPerDay);
  };

  const updateRiskReward = () => {
    localStorage.setItem("riskReward", riskReward);
  };

  const updateWinRate = () => {
    localStorage.setItem("winRate", winRate);
  };

  const updateMonthlyTarget = () => {
    localStorage.setItem("monthlyTarget", monthlyTarget);
  };

  const updateMaxTradesPerDay = () => {
    localStorage.setItem("maxTradesPerDay", maxTradesPerDay);
  };

  // Trading Instruments Update Functions
  const addTradingInstrument = () => {
    if (newInstrument.trim() && !tradingInstruments.includes(newInstrument.trim().toUpperCase())) {
      const updated = [...tradingInstruments, newInstrument.trim().toUpperCase()];
      setTradingInstruments(updated);
      localStorage.setItem("tradingInstruments", JSON.stringify(updated));
      setNewInstrument("");
    }
  };

  const removeTradingInstrument = (instrument: string) => {
    const updated = tradingInstruments.filter((item: string) => item !== instrument);
    setTradingInstruments(updated);
    localStorage.setItem("tradingInstruments", JSON.stringify(updated));
  };

  const updateTradingHours = () => {
    localStorage.setItem("tradingHours", tradingHours);
  };

  const tradingAccountForExpenses = `$${(
    parseFloat(livingExpenses.replace(/[^0-9.-]+/g, "")) /
    (parseFloat(percentage.replace(/[^0-9.-]+/g, "")) / 100)
  ).toLocaleString()}`;

  const tradingAccountForIncome = `$${(
    parseFloat(monthlyLivingExpenses.replace(/[^0-9.-]+/g, "")) /
    (parseFloat(percentage.replace(/[^0-9.-]+/g, "")) / 100)
  ).toLocaleString()}`;

  return (
    <div
      className={`${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      } min-h-screen p-8`}
    >
      {/* Header */}
      <div className="text-white mb-8">
        <div className="flex items-center gap-3 mb-4">
          <History className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {/* <Target size={36} /> */}
            My Trading Plan
          </h1>
        </div>
          <p className="text-gray-900 dark:text-white text-lg">Your roadmap to trading success</p>
      </div>

      <div className="max-w-6xl space-y-6">
        
        {/* Purpose Section */}
        <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="text-blue-600" size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              My Purpose
            </h2>
          </div>
          
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-4 text-sm`}>
            Define your "why" - the deeper reason that will keep you motivated during tough times. Be specific about your goals and what trading success means to you.
          </p>
          
          {isEditingPurpose ? (
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              onBlur={() => {
                setIsEditingPurpose(false);
                updatePurpose();
              }}
              className={`w-full h-32 ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-900 border-gray-300"} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsEditingPurpose(true)}
              className={`${theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-50"} p-4 rounded-lg border-2 border-dashed border-gray-400 cursor-pointer transition-colors`}
            >
              {purpose}
            </div>
          )}
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Monthly Expenses Card */}
          <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="text-red-600" size={24} />
              </div>
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Monthly Expenses
              </h3>
            </div>
            
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-4`}>
              Your current monthly living expenses - this helps calculate the minimum account size needed to cover your costs.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}>
                  Living Expenses (LE)
                </label>
                {isEditingExpenses ? (
                  <input
                    type="text"
                    value={livingExpenses}
                    onChange={(e) => setLivingExpenses(e.target.value)}
                    onBlur={() => {
                      setIsEditingExpenses(false);
                      updateLivingExpenses();
                    }}
                    className={`w-full ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-900 border-gray-300"} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingExpenses(true)}
                    className={`${theme === "dark" ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-50 text-gray-900 hover:bg-gray-100"} p-3 rounded-lg cursor-pointer transition-colors border-2 border-transparent hover:border-indigo-300`}
                  >
                    <span className="text-2xl font-bold text-red-500">{livingExpenses}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Income Card */}
          <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Monthly Income
              </h3>
            </div>
            
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-4`}>
              Your target monthly income from trading - the amount you want to replace your job income with.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}>
                  Average Monthly Income (MI)
                </label>
                {isEditingMonthlyExpenses ? (
                  <input
                    type="text"
                    value={monthlyLivingExpenses}
                    onChange={(e) => setMonthlyLivingExpenses(e.target.value)}
                    onBlur={() => {
                      setIsEditingMonthlyExpenses(false);
                      updateMonthlyLivingExpenses();
                    }}
                    className={`w-full ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-900 border-gray-300"} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingMonthlyExpenses(true)}
                    className={`${theme === "dark" ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-50 text-gray-900 hover:bg-gray-100"} p-3 rounded-lg cursor-pointer transition-colors border-2 border-transparent hover:border-indigo-300`}
                  >
                    <span className="text-2xl font-bold text-green-500">{monthlyLivingExpenses}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Money Plan & Calculations */}
        <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calculator className="text-purple-600" size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Trading Account Requirements
            </h2>
          </div>

          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-6`}>
            Based on your expenses and income goals, these calculations show how much capital you need to achieve your targets with your expected monthly return rate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Monthly Return Rate */}
            <div className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}>
                Expected Monthly Return
              </label>
              <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"} mb-2`}>
                Your realistic monthly profit target as a percentage
              </p>
              {isEditingPercentage ? (
                <input
                  type="text"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  onBlur={() => {
                    setIsEditingPercentage(false);
                    updatePercentage();
                  }}
                  className={`w-full ${theme === "dark" ? "bg-gray-600 text-white border-gray-500" : "bg-white text-gray-900 border-gray-300"} border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => setIsEditingPercentage(true)}
                  className={`${theme === "dark" ? "text-white hover:bg-gray-600" : "text-gray-900 hover:bg-gray-100"} cursor-pointer p-2 rounded transition-colors`}
                >
                  <span className="text-2xl font-bold text-indigo-500">{percentage}</span>
                </div>
              )}
            </div>

            {/* Account for Expenses */}
            <div className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}>
                Account Size for Expenses
              </label>
              <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"} mb-2`}>
                Minimum account size to cover living expenses
              </p>
              <div className="text-2xl font-bold text-orange-500">{tradingAccountForExpenses}</div>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-1`}>
                {livingExpenses} ÷ {percentage} = {tradingAccountForExpenses}
              </p>
            </div>

            {/* Account for Income Replacement */}
            <div className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}>
                Account Size for Income Replacement
              </label>
              <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"} mb-2`}>
                Target account size to fully replace your job income
              </p>
              <div className="text-2xl font-bold text-green-500">{tradingAccountForIncome}</div>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-1`}>
                {monthlyLivingExpenses} ÷ {percentage} = {tradingAccountForIncome}
              </p>
            </div>
            
          </div>
        </div>

        {/* Risk Management */}
        <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Shield className="text-yellow-600" size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Risk Management Targets
            </h2>
          </div>

          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-6`}>
            Your risk parameters and trading rules - these are your guardrails to protect your capital and ensure consistent performance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className={`${theme === "dark" ? "bg-red-900/20 border-red-500/30" : "bg-red-50 border-red-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-500" size={20} />
                <h4 className={`font-semibold ${theme === "dark" ? "text-red-400" : "text-red-700"}`}>Risk per Trade</h4>
              </div>
              <p className={`text-xs ${theme === "dark" ? "text-red-300" : "text-red-600"} mb-2`}>
                Maximum % of account to risk on each trade
              </p>
              {isEditingRiskPerTrade ? (
                <input
                  type="text"
                  value={riskPerTrade}
                  onChange={(e) => setRiskPerTrade(e.target.value)}
                  onBlur={() => {
                    setIsEditingRiskPerTrade(false);
                    updateRiskPerTrade();
                  }}
                  className={`w-full ${theme === "dark" ? "bg-red-800 text-white border-red-600" : "bg-red-100 text-red-900 border-red-300"} border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 text-lg font-bold`}
                  autoFocus
                />
              ) : (
                <p 
                  onClick={() => setIsEditingRiskPerTrade(true)}
                  className={`text-2xl font-bold ${theme === "dark" ? "text-red-300 hover:text-red-200" : "text-red-600 hover:text-red-700"} cursor-pointer transition-colors`}
                >
                  {riskPerTrade}
                </p>
              )}
            </div>

            <div className={`${theme === "dark" ? "bg-orange-900/20 border-orange-500/30" : "bg-orange-50 border-orange-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-orange-500" size={20} />
                <h4 className={`font-semibold ${theme === "dark" ? "text-orange-400" : "text-orange-700"}`}>Max Loss per Day</h4>
              </div>
              <p className={`text-xs ${theme === "dark" ? "text-orange-300" : "text-orange-600"} mb-2`}>
                Daily loss limit to prevent emotional revenge trading
              </p>
              {isEditingMaxLossPerDay ? (
                <input
                  type="text"
                  value={maxLossPerDay}
                  onChange={(e) => setMaxLossPerDay(e.target.value)}
                  onBlur={() => {
                    setIsEditingMaxLossPerDay(false);
                    updateMaxLossPerDay();
                  }}
                  className={`w-full ${theme === "dark" ? "bg-orange-800 text-white border-orange-600" : "bg-orange-100 text-orange-900 border-orange-300"} border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg font-bold`}
                  autoFocus
                />
              ) : (
                <p 
                  onClick={() => setIsEditingMaxLossPerDay(true)}
                  className={`text-2xl font-bold ${theme === "dark" ? "text-orange-300 hover:text-orange-200" : "text-orange-600 hover:text-orange-700"} cursor-pointer transition-colors`}
                >
                  {maxLossPerDay}
                </p>
              )}
            </div>

            <div className={`${theme === "dark" ? "bg-green-900/20 border-green-500/30" : "bg-green-50 border-green-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-500" size={20} />
                <h4 className={`font-semibold ${theme === "dark" ? "text-green-400" : "text-green-700"}`}>Risk:Reward</h4>
              </div>
              <p className={`text-xs ${theme === "dark" ? "text-green-300" : "text-green-600"} mb-2`}>
                Minimum profit target relative to risk taken
              </p>
              {isEditingRiskReward ? (
                <input
                  type="text"
                  value={riskReward}
                  onChange={(e) => setRiskReward(e.target.value)}
                  onBlur={() => {
                    setIsEditingRiskReward(false);
                    updateRiskReward();
                  }}
                  className={`w-full ${theme === "dark" ? "bg-green-800 text-white border-green-600" : "bg-green-100 text-green-900 border-green-300"} border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-bold`}
                  autoFocus
                />
              ) : (
                <p 
                  onClick={() => setIsEditingRiskReward(true)}
                  className={`text-2xl font-bold ${theme === "dark" ? "text-green-300 hover:text-green-200" : "text-green-600 hover:text-green-700"} cursor-pointer transition-colors`}
                >
                  {riskReward}
                </p>
              )}
            </div>

            <div className={`${theme === "dark" ? "bg-blue-900/20 border-blue-500/30" : "bg-blue-50 border-blue-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-blue-500" size={20} />
                <h4 className={`font-semibold ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}>Win Rate</h4>
              </div>
              <p className={`text-xs ${theme === "dark" ? "text-blue-300" : "text-blue-600"} mb-2`}>
                Target percentage of winning trades
              </p>
              {isEditingWinRate ? (
                <input
                  type="text"
                  value={winRate}
                  onChange={(e) => setWinRate(e.target.value)}
                  onBlur={() => {
                    setIsEditingWinRate(false);
                    updateWinRate();
                  }}
                  className={`w-full ${theme === "dark" ? "bg-blue-800 text-white border-blue-600" : "bg-blue-100 text-blue-900 border-blue-300"} border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold`}
                  autoFocus
                />
              ) : (
                <p 
                  onClick={() => setIsEditingWinRate(true)}
                  className={`text-2xl font-bold ${theme === "dark" ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700"} cursor-pointer transition-colors`}
                >
                  {winRate}
                </p>
              )}
            </div>

            <div className={`${theme === "dark" ? "bg-purple-900/20 border-purple-500/30" : "bg-purple-50 border-purple-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-purple-500" size={20} />
                <h4 className={`font-semibold ${theme === "dark" ? "text-purple-400" : "text-purple-700"}`}>Monthly Target</h4>
              </div>
              <p className={`text-xs ${theme === "dark" ? "text-purple-300" : "text-purple-600"} mb-2`}>
                Monthly profit goal as % of account balance
              </p>
              {isEditingMonthlyTarget ? (
                <input
                  type="text"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(e.target.value)}
                  onBlur={() => {
                    setIsEditingMonthlyTarget(false);
                    updateMonthlyTarget();
                  }}
                  className={`w-full ${theme === "dark" ? "bg-purple-800 text-white border-purple-600" : "bg-purple-100 text-purple-900 border-purple-300"} border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-bold`}
                  autoFocus
                />
              ) : (
                <p 
                  onClick={() => setIsEditingMonthlyTarget(true)}
                  className={`text-2xl font-bold ${theme === "dark" ? "text-purple-300 hover:text-purple-200" : "text-purple-600 hover:text-purple-700"} cursor-pointer transition-colors`}
                >
                  {monthlyTarget}
                </p>
              )}
            </div>

            <div className={`${theme === "dark" ? "bg-indigo-900/20 border-indigo-500/30" : "bg-indigo-50 border-indigo-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-indigo-500" size={20} />
                <h4 className={`font-semibold ${theme === "dark" ? "text-indigo-400" : "text-indigo-700"}`}>Max Trades/Day</h4>
              </div>
              <p className={`text-xs ${theme === "dark" ? "text-indigo-300" : "text-indigo-600"} mb-2`}>
                Daily trade limit to maintain quality over quantity
              </p>
              {isEditingMaxTradesPerDay ? (
                <input
                  type="text"
                  value={maxTradesPerDay}
                  onChange={(e) => setMaxTradesPerDay(e.target.value)}
                  onBlur={() => {
                    setIsEditingMaxTradesPerDay(false);
                    updateMaxTradesPerDay();
                  }}
                  className={`w-full ${theme === "dark" ? "bg-indigo-800 text-white border-indigo-600" : "bg-indigo-100 text-indigo-900 border-indigo-300"} border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold`}
                  autoFocus
                />
              ) : (
                <p 
                  onClick={() => setIsEditingMaxTradesPerDay(true)}
                  className={`text-2xl font-bold ${theme === "dark" ? "text-indigo-300 hover:text-indigo-200" : "text-indigo-600 hover:text-indigo-700"} cursor-pointer transition-colors`}
                >
                  {maxTradesPerDay}
                </p>
              )}
            </div>

          </div>

          <div className={`mt-6 ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
            <h4 className={`font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-3`}>Trading Rules</h4>
            <ul className={`space-y-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                Max {maxTradesPerDay} trades per day (only if first trade wins)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                If balance falls below 50%, reduce risk to 2%
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                If balance increases by 600%, increase risk per trade to 10%
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                Trading hours: {tradingHours}
              </li>
            </ul>
          </div>
        </div>

        {/* Trading Symbols */}
        <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Trading Instruments
            </h2>
          </div>

          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-6`}>
            The specific markets and instruments you'll focus on. Limiting your scope helps you become an expert in fewer markets.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tradingInstruments.map((symbol: string) => (
              <div
                key={symbol}
                className={`${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"} rounded-lg p-4 text-center transition-colors relative group`}
              >
                <div className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {symbol}
                </div>
                <button
                  onClick={() => removeTradingInstrument(symbol)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {/* Add New Instrument */}
            <div className={`${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"} border-2 border-dashed rounded-lg p-4 text-center`}>
              {isEditingInstruments ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newInstrument}
                    onChange={(e) => setNewInstrument(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTradingInstrument();
                        setIsEditingInstruments(false);
                      }
                    }}
                    onBlur={() => {
                      if (newInstrument.trim()) {
                        addTradingInstrument();
                      }
                      setIsEditingInstruments(false);
                    }}
                    className={`w-full ${theme === "dark" ? "bg-gray-600 text-white border-gray-500" : "bg-white text-gray-900 border-gray-300"} border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm`}
                    placeholder="e.g., EUR/USD"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingInstruments(true)}
                  className={`flex items-center justify-center gap-2 text-sm ${theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"} transition-colors`}
                >
                  <Plus size={16} />
                  Add Instrument
                </button>
              )}
            </div>
          </div>

          <div className={`mt-6 ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-blue-500" size={20} />
              <h4 className={`font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Trading Hours</h4>
            </div>
            {isEditingTradingHours ? (
              <input
                type="text"
                value={tradingHours}
                onChange={(e) => setTradingHours(e.target.value)}
                onBlur={() => {
                  setIsEditingTradingHours(false);
                  updateTradingHours();
                }}
                className={`w-full ${theme === "dark" ? "bg-gray-600 text-white border-gray-500" : "bg-white text-gray-900 border-gray-300"} border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg`}
                autoFocus
              />
            ) : (
              <p 
                onClick={() => setIsEditingTradingHours(true)}
                className={`text-lg ${theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"} cursor-pointer transition-colors`}
              >
                {tradingHours}
              </p>
            )}
          </div>
        </div>

        {/* Commitment */}
        <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl border border-gray-300 dark:border-gray-700 shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 ${theme === "dark" ? "bg-indigo-700" : "bg-indigo-100"} rounded-lg`}>
              <PenTool className={`${theme === "dark" ? "text-indigo-300" : "text-indigo-600"}`} size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              My Commitment
            </h2>
          </div>
          
          <p className={`text-sm ${theme === "dark" ? "text-indigo-200" : "text-gray-600"} mb-6`}>
            Your personal commitment to following this plan. This signature represents your dedication to disciplined trading.
          </p>
          
          <div className={`${theme === "dark" ? "bg-indigo-900/30" : "bg-white/50"} rounded-lg p-6 mb-6`}>
            <p className={`text-lg ${theme === "dark" ? "text-indigo-100" : "text-gray-700"} leading-relaxed`}>
              I commit to following this plan strictly. It is my full responsibility to manage my risk and execute on my trading system flawlessly, without being influenced by emotions.
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-indigo-200" : "text-gray-600"} mb-2`}>
              Digital Signature
            </label>
            {isEditingName ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  setIsEditingName(false);
                  updateName();
                }}
                className={`w-full md:w-96 ${theme === "dark" ? "bg-indigo-700 text-white border-indigo-500" : "bg-white text-gray-900 border-indigo-300"} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg`}
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className={`${theme === "dark" ? "bg-indigo-700 text-white hover:bg-indigo-600 border-indigo-500" : "bg-white text-gray-900 hover:bg-gray-50 border-indigo-300"} border-2 border-dashed cursor-pointer p-4 rounded-lg transition-colors w-full md:w-96`}
              >
                <span className="text-lg font-semibold">{name}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TradingPlan;
