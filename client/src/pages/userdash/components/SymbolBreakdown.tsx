import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SymbolBreakdownProps {
  data: { symbol: string; profit: number; trade_count?: number }[];
}

const SymbolBreakdown: React.FC<SymbolBreakdownProps> = ({ data }) => {
  // Aggregate data by symbol
  const symbolData = data.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = {
        symbol: trade.symbol,
        totalProfit: 0,
        tradeCount: 0,
        avgProfit: 0
      };
    }
    acc[trade.symbol].totalProfit += trade.profit;
    acc[trade.symbol].tradeCount += 1;
    return acc;
  }, {} as Record<string, { symbol: string; totalProfit: number; tradeCount: number; avgProfit: number }>);

  // Convert to array and calculate averages
  const chartData = Object.values(symbolData).map(item => ({
    ...item,
    avgProfit: item.totalProfit / item.tradeCount,
    absProfit: Math.abs(item.totalProfit) // For pie chart sizing
  })).sort((a, b) => b.totalProfit - a.totalProfit);

  // Color palette for different symbols
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  // Get top performers
  const topPerformer = chartData[0];
  const worstPerformer = chartData[chartData.length - 1];
  const totalProfit = chartData.reduce((sum, item) => sum + item.totalProfit, 0);
  const totalTrades = chartData.reduce((sum, item) => sum + item.tradeCount, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalProfit !== 0 ? ((data.totalProfit / totalProfit) * 100) : 0;
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white text-sm font-medium">{data.symbol}</p>
          <p className={`text-sm ${data.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Total P&L: ${data.totalProfit >= 0 ? '+' : ''}${data.totalProfit.toFixed(2)}
          </p>
          <p className="text-blue-300 text-sm">
            Avg per trade: ${data.avgProfit.toFixed(2)}
          </p>
          <p className="text-gray-300 text-sm">
            Trades: {data.tradeCount}
          </p>
          <p className="text-yellow-300 text-sm">
            {percentage.toFixed(1)}% of total P&L
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        📈 Performance by Symbol
        <span className="text-sm text-gray-400 font-normal">({chartData.length} symbols, {totalTrades} trades)</span>
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart - Takes 2/3 of space */}
        <div className="lg:col-span-2 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="absProfit"
                label={({ symbol, totalProfit }) => totalProfit !== 0 ? `${symbol}` : ''}
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics and Rankings - Takes 1/3 of space */}
        <div className="space-y-4">
          {/* Top/Bottom Performers */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Top Performers</h4>
            {topPerformer && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-green-400 text-sm">🏆 Best Symbol:</span>
                  <span className="text-white font-medium text-sm">
                    {topPerformer.symbol} (+${topPerformer.totalProfit.toFixed(2)})
                  </span>
                </div>
                {worstPerformer && worstPerformer.totalProfit < 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 text-sm">📉 Worst Symbol:</span>
                    <span className="text-white font-medium text-sm">
                      {worstPerformer.symbol} (${worstPerformer.totalProfit.toFixed(2)})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Symbol Rankings */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Rankings</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {chartData.slice(0, 8).map((symbol, index) => (
                <div key={symbol.symbol} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">#{index + 1}</span>
                    <span className="text-white text-sm font-medium">{symbol.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${symbol.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${symbol.totalProfit >= 0 ? '+' : ''}${symbol.totalProfit.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {symbol.tradeCount} trades
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-700/50">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Strategy Insight</h4>
            <p className="text-xs text-gray-300">
              {topPerformer && topPerformer.tradeCount >= 5 
                ? `You show strong performance with ${topPerformer.symbol}. Consider increasing allocation to your most profitable symbols while reducing exposure to consistently losing ones.`
                : "Build larger sample sizes per symbol to identify your true edge. Focus on symbols where you have the most experience and confidence."
              }
            </p>
          </div>

          {/* Portfolio Concentration */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Portfolio Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Total Symbols:</span>
                <span className="text-white text-sm font-medium">{chartData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Avg per Symbol:</span>
                <span className={`text-sm font-medium ${(totalProfit / chartData.length) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(totalProfit / chartData.length).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Profitable Symbols:</span>
                <span className="text-green-400 text-sm font-medium">
                  {chartData.filter(s => s.totalProfit > 0).length} / {chartData.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymbolBreakdown;
