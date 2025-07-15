import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface GrossDailyPLGraphProps {
  data: { date: string; profit: number }[];
}

const GrossDailyPLGraph: React.FC<GrossDailyPLGraphProps> = ({ data }) => {
  const [days, setDays] = useState(30); // Default to 30 days

  // Helper function to map dates to days of the week
  const getDayOfWeek = (dateString: string) => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = new Date(dateString);
    return daysOfWeek[date.getDay()];
  };

  // Transform data to include days of the week and format dates
  const transformedData = data.map((item) => ({
    ...item,
    dayOfWeek: getDayOfWeek(item.date),
    shortDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: new Date(item.date).toLocaleDateString(),
  }));

  // Filter data based on the selected time range
  const filteredData = transformedData.slice(-days);

  // Calculate statistics
  const totalProfit = filteredData.reduce((sum, item) => sum + item.profit, 0);
  const winningDays = filteredData.filter(item => item.profit > 0).length;
  const losingDays = filteredData.filter(item => item.profit < 0).length;
  const winRate = filteredData.length > 0 ? (winningDays / filteredData.length) * 100 : 0;
  const bestDay = Math.max(...filteredData.map(item => item.profit));
  const worstDay = Math.min(...filteredData.map(item => item.profit));
  const avgDailyPL = filteredData.length > 0 ? totalProfit / filteredData.length : 0;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm font-medium">{data.fullDate}</p>
          <p className="text-gray-300 text-xs mb-1">{data.dayOfWeek}</p>
          <p className={`font-semibold ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.profit >= 0 ? '+' : ''}${data.profit.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            📊 Daily P&L Performance
            <span className="text-sm text-gray-400 font-normal">({filteredData.length} days)</span>
          </h3>
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-200 font-medium mb-1">📈 Track your daily consistency</p>
            <p className="text-xs text-gray-300">
              Each bar represents your daily P&L. Green bars show profitable days, red bars show losses. 
              Look for patterns and maintain consistent daily performance.
            </p>
          </div>
        </div>
      </div>

      {/* Time Range Buttons */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-700 rounded-lg p-1 flex">
          {[
            { value: 30, label: '30 Days' },
            { value: 60, label: '60 Days' },
            { value: 90, label: '90 Days' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDays(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                days === option.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes 2/3 of space */}
        <div className="lg:col-span-2 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis 
                dataKey="shortDate" 
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                interval="preserveStartEnd"
                axisLine={{ stroke: '#4B5563' }}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#4B5563' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" radius={[2, 2, 0, 0]}>
                {filteredData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.profit >= 0 ? '#10B981' : '#EF4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics Panel - Takes 1/3 of space */}
        <div className="space-y-4">
          {/* Performance Summary */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">📊 Performance Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Total P&L:</span>
                <span className={`font-semibold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Win Rate:</span>
                <span className="text-white font-semibold">{winRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Avg Daily:</span>
                <span className={`font-semibold ${avgDailyPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {avgDailyPL >= 0 ? '+' : ''}${avgDailyPL.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Stats */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">📈 Daily Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Winning Days:</span>
                <span className="text-green-400 font-semibold">{winningDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Losing Days:</span>
                <span className="text-red-400 font-semibold">{losingDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Best Day:</span>
                <span className="text-green-400 font-semibold">+${bestDay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Worst Day:</span>
                <span className="text-red-400 font-semibold">${worstDay.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-700/50">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 Consistency Tips</h4>
            <p className="text-xs text-gray-300">
              Aim for consistent daily performance. A {winRate >= 60 ? 'great' : winRate >= 50 ? 'good' : 'challenging'} win rate like yours {winRate >= 50 ? 'shows discipline' : 'needs improvement'}. 
              Focus on risk management over big wins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrossDailyPLGraph;