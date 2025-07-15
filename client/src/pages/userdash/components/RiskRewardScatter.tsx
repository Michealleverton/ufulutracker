import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RiskRewardScatterProps {
  data: { date: string; profit: number; entry_price: number; exit_price: number; quantity: number; type: string }[];
}

const RiskRewardScatter: React.FC<RiskRewardScatterProps> = ({ data }) => {
  // Calculate risk and reward for each trade using actual entry/exit prices
  const scatterData = data.map((trade, index) => {
    // Calculate actual risk and reward from entry/exit prices
    const priceMovement = Math.abs(trade.exit_price - trade.entry_price);
    const risk = priceMovement * Math.abs(trade.quantity); // Risk based on stop distance
    const reward = Math.abs(trade.profit); // Actual profit/loss
    
    // Calculate R:R ratio: reward per unit of risk
    const riskRewardRatio = risk > 0 ? reward / risk : 0;
    
    return {
      id: index,
      risk: risk,
      reward: reward,
      ratio: riskRewardRatio,
      profit: trade.profit,
      date: trade.date,
      isWin: trade.profit > 0,
      size: Math.min(Math.max(Math.abs(trade.profit) / 10, 20), 100), // Bubble size based on profit magnitude
      type: trade.type,
      entryPrice: trade.entry_price,
      exitPrice: trade.exit_price
    };
  }).filter(trade => trade.risk > 0); // Filter out invalid data

  // Calculate statistics
  const winningTrades = scatterData.filter(trade => trade.isWin);
  const losingTrades = scatterData.filter(trade => !trade.isWin);
  
  // Calculate average R:R for all trades (including losses)
  const avgRiskReward = scatterData.length > 0 
    ? scatterData.reduce((sum, trade) => sum + trade.ratio, 0) / scatterData.length 
    : 0;
  
  const idealZone = scatterData.filter(trade => trade.ratio >= 2 && trade.isWin);
  const dangerZone = scatterData.filter(trade => trade.ratio < 1);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white text-sm font-medium">
            Date: {new Date(data.date).toLocaleDateString()}
          </p>
          <p className="text-cyan-300 text-sm">
            Entry: ${data.entryPrice.toFixed(5)}
          </p>
          <p className="text-purple-300 text-sm">
            Exit: ${data.exitPrice.toFixed(5)}
          </p>
          <p className="text-blue-300 text-sm">
            Risk: ${data.risk.toFixed(2)}
          </p>
          <p className="text-green-300 text-sm">
            Reward: ${data.reward.toFixed(2)}
          </p>
          <p className="text-yellow-300 text-sm">
            R:R Ratio: {data.ratio.toFixed(2)}:1
          </p>
          <p className={`text-sm ${data.isWin ? 'text-green-400' : 'text-red-400'}`}>
            P&L: ${data.profit >= 0 ? '+' : ''}${data.profit.toFixed(2)}
          </p>
          <p className="text-gray-400 text-xs">
            {data.type.toUpperCase()} trade
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
            📊 Risk vs Reward Analysis
            <span className="text-sm text-gray-400 font-normal">({scatterData.length} trades)</span>
          </h3>
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-200 font-medium mb-1">📖 How to read this chart:</p>
            <p className="text-xs text-gray-300">
              Each dot represents a trade. Green dots = winning trades, Red dots = losing trades. 
              The closer dots are to the top-right, the better your risk-to-reward ratio. 
              Aim for trades above the diagonal line (2:1 ratio or better).
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scatter Chart */}
        <div className="lg:col-span-2 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={scatterData}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis 
                dataKey="risk" 
                name="Risk ($)"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                label={{ value: 'Risk ($)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
              />
              <YAxis 
                dataKey="reward" 
                name="Reward ($)"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                label={{ value: 'Reward ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Winning trades */}
              <Scatter name="Winning Trades" data={winningTrades}>
                {winningTrades.map((_, index) => (
                  <Cell key={`win-${index}`} fill="#10B981" fillOpacity={0.7} />
                ))}
              </Scatter>
              
              {/* Losing trades */}
              <Scatter name="Losing Trades" data={losingTrades}>
                {losingTrades.map((_, index) => (
                  <Cell key={`loss-${index}`} fill="#EF4444" fillOpacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics Panel */}
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Key Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Avg R:R Ratio:</span>
                <span className={`text-sm font-medium ${avgRiskReward >= 2 ? 'text-green-400' : avgRiskReward >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {avgRiskReward.toFixed(2)}:1
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Total Trades:</span>
                <span className="text-white text-sm font-medium">{scatterData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-400 text-sm">Winning:</span>
                <span className="text-green-400 text-sm font-medium">{winningTrades.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 text-sm">Losing:</span>
                <span className="text-red-400 text-sm font-medium">{losingTrades.length}</span>
              </div>
            </div>
          </div>

          {/* Zone Analysis */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Zone Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-400 text-sm">🎯 Ideal Zone (2:1+):</span>
                <span className="text-green-400 text-sm font-medium">{idealZone.length} trades</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 text-sm">⚠️ Danger Zone (&lt;1:1):</span>
                <span className="text-red-400 text-sm font-medium">{dangerZone.length} trades</span>
              </div>
              <div className="pt-2">
                <div className="text-xs text-gray-400">
                  Ideal Zone %: {scatterData.length > 0 ? ((idealZone.length / scatterData.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insight */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-700/50">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Strategy Insight</h4>
            <p className="text-xs text-gray-300 mb-2">
              {avgRiskReward >= 2 
                ? "Excellent risk management! Your average R:R ratio gives you a mathematical edge."
                : avgRiskReward >= 1.5
                ? "Good risk discipline. Try to push your average R:R above 2:1 for even better results."
                : "Focus on improving your risk-reward ratio. Aim for minimum 2:1 setups to increase profitability."
              }
            </p>
            <p className="text-xs text-gray-400">
              💡 <strong>Note:</strong> Risk calculated from actual entry/exit price difference. R:R ratios now reflect real trading performance!
            </p>
          </div>

          {/* Legend */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-300">Winning Trades</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-300">Losing Trades</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskRewardScatter;
