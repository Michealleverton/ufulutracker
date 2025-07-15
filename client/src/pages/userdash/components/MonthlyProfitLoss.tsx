import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MonthlyProfitLossProps {
  data: { month: string; profit: number }[];
}

const MonthlyProfitLoss: React.FC<MonthlyProfitLossProps> = ({ data }) => {
  // Calculate statistics
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
  const winningMonths = data.filter(item => item.profit > 0).length;
  const losingMonths = data.filter(item => item.profit < 0).length;
  const winRate = data.length > 0 ? (winningMonths / data.length) * 100 : 0;
  const bestMonth = Math.max(...data.map(item => item.profit));
  const worstMonth = Math.min(...data.map(item => item.profit));
  const avgMonthlyPL = data.length > 0 ? totalProfit / data.length : 0;

  // Find best and worst performing months
  const bestMonthData = data.find(item => item.profit === bestMonth);
  const worstMonthData = data.find(item => item.profit === worstMonth);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const profit = payload[0].value;
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm font-medium">{label}</p>
          <p className={`font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
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
            📅 Monthly P&L Overview
            <span className="text-sm text-gray-400 font-normal">({data.length} months)</span>
          </h3>
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-200 font-medium mb-1">📈 Monthly performance trends</p>
            <p className="text-xs text-gray-300">
              Track your monthly P&L to identify seasonal patterns and long-term growth. 
              Green bars = profitable months, red bars = losing months.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes 2/3 of space */}
        <div className="lg:col-span-2 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#4B5563' }}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#4B5563' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
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
                <span className="text-gray-300 text-sm">Avg Monthly:</span>
                <span className={`font-semibold ${avgMonthlyPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {avgMonthlyPL >= 0 ? '+' : ''}${avgMonthlyPL.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">📈 Monthly Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Profitable:</span>
                <span className="text-green-400 font-semibold">{winningMonths} months</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Losing:</span>
                <span className="text-red-400 font-semibold">{losingMonths} months</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Best Month:</span>
                <span className="text-green-400 font-semibold">+${bestMonth.toFixed(2)}</span>
              </div>
              {bestMonthData && (
                <div className="text-xs text-gray-400 -mt-1 ml-16">
                  {bestMonthData.month}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Worst Month:</span>
                <span className="text-red-400 font-semibold">${worstMonth.toFixed(2)}</span>
              </div>
              {worstMonthData && (
                <div className="text-xs text-gray-400 -mt-1 ml-16">
                  {worstMonthData.month}
                </div>
              )}
            </div>
          </div>

          {/* Performance Tips */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-700/50">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 Growth Insights</h4>
            <p className="text-xs text-gray-300">
              {winRate >= 60 
                ? 'Excellent monthly consistency! Your strategy is working well.' 
                : winRate >= 50 
                ? 'Good monthly performance. Focus on maximizing winning months.' 
                : 'Room for improvement. Review your strategy and risk management.'
              } Track trends across quarters for better insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyProfitLoss;