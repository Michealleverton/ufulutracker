import React from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';

interface TimeOfDayPerformanceProps {
  data: { date: string; profit: number; trade_time?: string }[];
}

const TimeOfDayPerformance: React.FC<TimeOfDayPerformanceProps> = ({ data }) => {
  // Group trades by session using trade_time if available, fallback to date extraction
  const getTradeHour = (trade: { date: string; trade_time?: string }): number => {
    if (trade.trade_time) {
      // Parse time string like "14:30:00" and return hour
      const timeParts = trade.trade_time.split(':');
      return parseInt(timeParts[0], 10);
    } else {
      // Fallback to date extraction for compatibility
      return new Date(trade.date).getHours();
    }
  };

  // Group trades by session instead of individual hours for clearer visualization
  const sessions = [
    { name: 'Morning', label: 'Morning (6-12)', hours: [6, 7, 8, 9, 10, 11] },
    { name: 'Afternoon', label: 'Afternoon (12-17)', hours: [12, 13, 14, 15, 16] },
    { name: 'Evening', label: 'Evening (17-20)', hours: [17, 18, 19] },
    { name: 'Night', label: 'Night (20-6)', hours: [20, 21, 22, 23, 0, 1, 2, 3, 4, 5] }
  ];

  const sessionData = sessions.map(session => {
    const sessionTrades = data.filter(trade => {
      const tradeHour = getTradeHour(trade);
      return session.hours.includes(tradeHour);
    });
    
    const totalProfit = sessionTrades.reduce((sum, trade) => sum + trade.profit, 0);
    const tradeCount = sessionTrades.length;
    const avgProfit = tradeCount > 0 ? totalProfit / tradeCount : 0;
    
    return {
      session: session.name,
      label: session.label,
      avgProfit: avgProfit,
      totalProfit: totalProfit,
      tradeCount: tradeCount,
      profitPerTrade: avgProfit
    };
  });

  // Find the best and worst performing sessions
  const bestSession = sessionData.reduce((best, current) => 
    current.avgProfit > best.avgProfit ? current : best
  );
  const worstSession = sessionData.reduce((worst, current) => 
    current.avgProfit < worst.avgProfit ? current : worst
  );

  // Normalize data for radar chart (scale to 0-100)
  const maxAbsProfit = Math.max(...sessionData.map(s => Math.abs(s.avgProfit)), 1);
  const radarData = sessionData.map(session => ({
    ...session,
    performance: maxAbsProfit > 0 ? ((session.avgProfit / maxAbsProfit) * 50) + 50 : 50 // Scale to 0-100
  }));

  const formatSession = (sessionName: string): string => {
    switch (sessionName) {
      case 'Morning': return '🌅 Morning';
      case 'Afternoon': return '☀️ Afternoon';
      case 'Evening': return '🌇 Evening';
      case 'Night': return '🌙 Night';
      default: return sessionName;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        🕐 Session Breakdown
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart - Takes 2/3 of space */}
        <div className="lg:col-span-2 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis 
                dataKey="session" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={formatSession}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#6B7280', fontSize: 10 }}
                tickCount={3}
              />
              <Radar
                name="Performance"
                dataKey="performance"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics - Takes 1/3 of space */}
        <div className="space-y-4">
          {/* Best/Worst Sessions */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Peak Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-400 text-sm">🚀 Best Session:</span>
                <span className="text-white font-medium">
                  {formatSession(bestSession.session)} (+${bestSession.avgProfit.toFixed(2)}/trade)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 text-sm">📉 Worst Session:</span>
                <span className="text-white font-medium">
                  {formatSession(worstSession.session)} (${worstSession.avgProfit.toFixed(2)}/trade)
                </span>
              </div>
            </div>
          </div>

          {/* Session Performance Details */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Session Details</h4>
            <div className="space-y-2">
              {sessionData.map(session => (
                <div key={session.session} className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">{session.label}:</span>
                  <span className={`text-sm font-medium ${session.avgProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${session.avgProfit.toFixed(2)}/trade ({session.tradeCount} trades)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Tips */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-700/50">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Optimization Tip</h4>
            <p className="text-xs text-gray-300">
              {bestSession.tradeCount > 5 
                ? `Focus your highest-conviction trades during ${bestSession.session.toLowerCase()} sessions when you perform ${bestSession.avgProfit > 0 && worstSession.avgProfit < 0 ? Math.abs(((bestSession.avgProfit - worstSession.avgProfit) / Math.abs(worstSession.avgProfit)) * 100).toFixed(0) : '0'}% better than your worst session.`
                : "Collect more data to identify your optimal trading sessions. Try tracking your mood and market conditions during different times."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeOfDayPerformance;
