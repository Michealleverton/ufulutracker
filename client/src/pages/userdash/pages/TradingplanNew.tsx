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
  BarChart3
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
        theme === "light" ? "bg-gray-900" : "bg-gray-50"
      } min-h-screen`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Target size={36} />
            My Trading Plan
          </h1>
          <p className="text-indigo-100 text-lg">Your roadmap to trading success</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Purpose Section */}
        <div className={`${theme === "light" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="text-blue-600" size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === "light" ? "text-white" : "text-gray-900"}`}>
              My Purpose
            </h2>
          </div>
          
          <p className={`${theme === "light" ? "text-gray-400" : "text-gray-600"} mb-4 text-sm`}>
            Why are you trading? What drives you? What do you want to achieve?
          </p>
          
          {isEditingPurpose ? (
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              onBlur={() => {
                setIsEditingPurpose(false);
                updatePurpose();
              }}
              className={`w-full h-32 ${theme === "light" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-900 border-gray-300"} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsEditingPurpose(true)}
              className={`${theme === "light" ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-50"} p-4 rounded-lg border-2 border-dashed border-gray-400 cursor-pointer transition-colors`}
            >
              {purpose}
            </div>
          )}
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Monthly Expenses Card */}
          <div className={`${theme === "light" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="text-red-600" size={24} />
              </div>
              <h3 className={`text-xl font-bold ${theme === "light" ? "text-white" : "text-gray-900"}`}>
                Monthly Expenses
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme === "light" ? "text-gray-400" : "text-gray-600"} mb-2`}>
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
                    className={`w-full ${theme === "light" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-900 border-gray-300"} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingExpenses(true)}
                    className={`${theme === "light" ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-50 text-gray-900 hover:bg-gray-100"} p-3 rounded-lg cursor-pointer transition-colors border-2 border-transparent hover:border-indigo-300`}
                  >
                    <span className="text-2xl font-bold text-red-500">{livingExpenses}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Income Card */}
          <div className={`${theme === "light" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <h3 className={`text-xl font-bold ${theme === "light" ? "text-white" : "text-gray-900"}`}>
                Monthly Income
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme === "light" ? "text-gray-400" : "text-gray-600"} mb-2`}>
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
                    className={`w-full ${theme === "light" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 text-gray-900 border-gray-300"} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingMonthlyExpenses(true)}
                    className={`${theme === "light" ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-50 text-gray-900 hover:bg-gray-100"} p-3 rounded-lg cursor-pointer transition-colors border-2 border-transparent hover:border-indigo-300`}
                  >
                    <span className="text-2xl font-bold text-green-500">{monthlyLivingExpenses}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Money Plan & Calculations */}
        <div className={`${theme === "light" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calculator className="text-purple-600" size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === "light" ? "text-white" : "text-gray-900"}`}>
              Trading Account Requirements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Monthly Return Rate */}
            <div className={`${theme === "light" ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
              <label className={`block text-sm font-medium ${theme === "light" ? "text-gray-400" : "text-gray-600"} mb-2`}>
                Expected Monthly Return
              </label>
              {isEditingPercentage ? (
                <input
                  type="text"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  onBlur={() => {
                    setIsEditingPercentage(false);
                    updatePercentage();
                  }}
                  className={`w-full ${theme === "light" ? "bg-gray-600 text-white border-gray-500" : "bg-white text-gray-900 border-gray-300"} border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => setIsEditingPercentage(true)}
                  className={`${theme === "light" ? "text-white hover:bg-gray-600" : "text-gray-900 hover:bg-gray-100"} cursor-pointer p-2 rounded transition-colors`}
                >
                  <span className="text-2xl font-bold text-indigo-500">{percentage}</span>
                </div>
              )}
            </div>

            {/* Account for Expenses */}
            <div className={`${theme === "light" ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
              <label className={`block text-sm font-medium ${theme === "light" ? "text-gray-400" : "text-gray-600"} mb-2`}>
                Account Size for Expenses
              </label>
              <div className="text-2xl font-bold text-orange-500">{tradingAccountForExpenses}</div>
              <p className={`text-xs ${theme === "light" ? "text-gray-400" : "text-gray-600"} mt-1`}>
                {livingExpenses} ÷ {percentage} = {tradingAccountForExpenses}
              </p>
            </div>

            {/* Account for Income Replacement */}
            <div className={`${theme === "light" ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
              <label className={`block text-sm font-medium ${theme === "light" ? "text-gray-400" : "text-gray-600"} mb-2`}>
                Account Size for Income Replacement
              </label>
              <div className="text-2xl font-bold text-green-500">{tradingAccountForIncome}</div>
              <p className={`text-xs ${theme === "light" ? "text-gray-400" : "text-gray-600"} mt-1`}>
                {monthlyLivingExpenses} ÷ {percentage} = {tradingAccountForIncome}
              </p>
            </div>
            
          </div>
        </div>

        {/* Risk Management */}
        <div className={`${theme === "light" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Shield className="text-yellow-600" size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === "light" ? "text-white" : "text-gray-900"}`}>
              Risk Management Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className={`${theme === "light" ? "bg-red-900/20 border-red-500/30" : "bg-red-50 border-red-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-500" size={20} />
                <h4 className={`font-semibold ${theme === "light" ? "text-red-400" : "text-red-700"}`}>Risk per Trade</h4>
              </div>
              <p className={`text-2xl font-bold ${theme === "light" ? "text-red-300" : "text-red-600"}`}>5%</p>
            </div>

            <div className={`${theme === "light" ? "bg-orange-900/20 border-orange-500/30" : "bg-orange-50 border-orange-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-orange-500" size={20} />
                <h4 className={`font-semibold ${theme === "light" ? "text-orange-400" : "text-orange-700"}`}>Max Loss per Day</h4>
              </div>
              <p className={`text-2xl font-bold ${theme === "light" ? "text-orange-300" : "text-orange-600"}`}>5%</p>
            </div>

            <div className={`${theme === "light" ? "bg-green-900/20 border-green-500/30" : "bg-green-50 border-green-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-500" size={20} />
                <h4 className={`font-semibold ${theme === "light" ? "text-green-400" : "text-green-700"}`}>Risk:Reward</h4>
              </div>
              <p className={`text-2xl font-bold ${theme === "light" ? "text-green-300" : "text-green-600"}`}>1:5</p>
            </div>

            <div className={`${theme === "light" ? "bg-blue-900/20 border-blue-500/30" : "bg-blue-50 border-blue-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-blue-500" size={20} />
                <h4 className={`font-semibold ${theme === "light" ? "text-blue-400" : "text-blue-700"}`}>Win Rate</h4>
              </div>
              <p className={`text-2xl font-bold ${theme === "light" ? "text-blue-300" : "text-blue-600"}`}>80%</p>
            </div>

            <div className={`${theme === "light" ? "bg-purple-900/20 border-purple-500/30" : "bg-purple-50 border-purple-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-purple-500" size={20} />
                <h4 className={`font-semibold ${theme === "light" ? "text-purple-400" : "text-purple-700"}`}>Monthly Target</h4>
              </div>
              <p className={`text-2xl font-bold ${theme === "light" ? "text-purple-300" : "text-purple-600"}`}>100%</p>
            </div>

            <div className={`${theme === "light" ? "bg-indigo-900/20 border-indigo-500/30" : "bg-indigo-50 border-indigo-200"} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-indigo-500" size={20} />
                <h4 className={`font-semibold ${theme === "light" ? "text-indigo-400" : "text-indigo-700"}`}>Max Trades/Day</h4>
              </div>
              <p className={`text-2xl font-bold ${theme === "light" ? "text-indigo-300" : "text-indigo-600"}`}>2</p>
            </div>

          </div>

          <div className={`mt-6 ${theme === "light" ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
            <h4 className={`font-semibold ${theme === "light" ? "text-gray-300" : "text-gray-700"} mb-3`}>Trading Rules</h4>
            <ul className={`space-y-2 ${theme === "light" ? "text-gray-400" : "text-gray-600"}`}>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                Max 2 trades per day (only if first trade wins)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                If balance falls below 50%, reduce risk to 2%
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                If balance increases by 600%, increase risk to 10%
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                Trading hours: 9am - 5pm
              </li>
            </ul>
          </div>
        </div>

        {/* Trading Symbols */}
        <div className={`${theme === "light" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === "light" ? "text-white" : "text-gray-900"}`}>
              Trading Instruments
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['USD/CAD', 'GOLD', 'SILVER', 'BITCOIN'].map((symbol) => (
              <div
                key={symbol}
                className={`${theme === "light" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"} rounded-lg p-4 text-center transition-colors`}
              >
                <div className={`text-lg font-bold ${theme === "light" ? "text-white" : "text-gray-900"}`}>
                  {symbol}
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-6 ${theme === "light" ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-blue-500" size={20} />
              <h4 className={`font-semibold ${theme === "light" ? "text-gray-300" : "text-gray-700"}`}>Trading Hours</h4>
            </div>
            <p className={`text-lg ${theme === "light" ? "text-gray-400" : "text-gray-600"}`}>9:00 AM - 5:00 PM</p>
          </div>
        </div>

        {/* Commitment */}
        <div className={`${theme === "light" ? "bg-gradient-to-r from-indigo-800 to-purple-800 border-indigo-600" : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200"} border rounded-xl shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 ${theme === "light" ? "bg-indigo-700" : "bg-indigo-100"} rounded-lg`}>
              <PenTool className={`${theme === "light" ? "text-indigo-300" : "text-indigo-600"}`} size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === "light" ? "text-white" : "text-gray-900"}`}>
              My Commitment
            </h2>
          </div>
          
          <div className={`${theme === "light" ? "bg-indigo-900/30" : "bg-white/50"} rounded-lg p-6 mb-6`}>
            <p className={`text-lg ${theme === "light" ? "text-indigo-100" : "text-gray-700"} leading-relaxed`}>
              I commit to following this plan strictly. It is my full responsibility to manage my risk and execute on my trading system flawlessly, without being influenced by emotions.
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme === "light" ? "text-indigo-200" : "text-gray-600"} mb-2`}>
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
                className={`w-full md:w-96 ${theme === "light" ? "bg-indigo-700 text-white border-indigo-500" : "bg-white text-gray-900 border-indigo-300"} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg`}
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className={`${theme === "light" ? "bg-indigo-700 text-white hover:bg-indigo-600 border-indigo-500" : "bg-white text-gray-900 hover:bg-gray-50 border-indigo-300"} border-2 border-dashed cursor-pointer p-4 rounded-lg transition-colors w-full md:w-96`}
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
