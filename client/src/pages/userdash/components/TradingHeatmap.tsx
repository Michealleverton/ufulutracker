import React from 'react';

interface TradingHeatmapProps {
  data: { date: string; profit: number }[];
}

const TradingHeatmap: React.FC<TradingHeatmapProps> = ({ data }) => {
  // Get the current date and calculate the range for the heatmap (last 12 weeks)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (7 * 12)); // 12 weeks ago

  // Create array of all dates in the range
  const dateRange: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= today) {
    dateRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Create a map of date strings to profit values
  const profitMap = new Map();
  data.forEach(item => {
    const dateKey = new Date(item.date).toDateString();
    profitMap.set(dateKey, (profitMap.get(dateKey) || 0) + item.profit);
  });

  // Calculate the max absolute value for color scaling
  const maxAbsProfit = Math.max(...Array.from(profitMap.values()).map(Math.abs), 100);

  const getColor = (profit: number): string => {
    if (profit === 0) return 'bg-gray-700 border-gray-600';
    
    const intensity = Math.min(Math.abs(profit) / maxAbsProfit, 1);
    
    if (profit > 0) {
      if (intensity > 0.8) return 'bg-green-500 border-green-400';
      if (intensity > 0.6) return 'bg-green-500/80 border-green-400/80';
      if (intensity > 0.4) return 'bg-green-500/60 border-green-400/60';
      if (intensity > 0.2) return 'bg-green-500/40 border-green-400/40';
      return 'bg-green-500/20 border-green-400/20';
    } else {
      if (intensity > 0.8) return 'bg-red-500 border-red-400';
      if (intensity > 0.6) return 'bg-red-500/80 border-red-400/80';
      if (intensity > 0.4) return 'bg-red-500/60 border-red-400/60';
      if (intensity > 0.2) return 'bg-red-500/40 border-red-400/40';
      return 'bg-red-500/20 border-red-400/20';
    }
  };

  const getDayOfWeek = (date: Date): number => {
    return (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  };

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  dateRange.forEach((date) => {
    if (getDayOfWeek(date) === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate some stats for display
  const totalProfit = Array.from(profitMap.values()).reduce((sum, profit) => sum + profit, 0);
  const tradingDays = Array.from(profitMap.values()).filter(profit => profit !== 0).length;
  const bestDay = Math.max(...Array.from(profitMap.values()));

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        🔥 Trading Activity Heatmap
        <span className="text-sm text-gray-400 font-normal">(Last 12 weeks)</span>
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Chart - Takes 2/3 of space */}
        <div className="lg:col-span-2 h-80 flex flex-col justify-center">
          <div className="flex gap-6 overflow-x-auto pb-4 justify-center">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pt-8 flex-shrink-0">
              {dayLabels.map((day, index) => (
                <div key={day} className="h-4 flex items-center text-xs text-gray-400 w-10">
                  {index % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="flex flex-col flex-shrink-0">
              {/* Month labels */}
              <div className="flex gap-1 mb-3 h-6">
                {weeks.map((week, weekIndex) => {
                  const firstDay = week[0];
                  const showMonth = weekIndex === 0 || firstDay.getDate() <= 7;
                  return (
                    <div key={weekIndex} className="w-4 text-xs text-gray-400 text-center">
                      {showMonth ? monthLabels[firstDay.getMonth()].slice(0, 3) : ''}
                    </div>
                  );
                })}
              </div>

              {/* Weeks grid */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const date = week.find(d => getDayOfWeek(d) === dayIndex);
                      if (!date) {
                        return <div key={dayIndex} className="w-4 h-4" />;
                      }
                      
                      const dateKey = date.toDateString();
                      const profit = profitMap.get(dateKey) || 0;
                      const isToday = date.toDateString() === today.toDateString();
                      
                      return (
                        <div
                          key={dayIndex}
                          className={`w-4 h-4 rounded border hover:border-white hover:scale-110 transition-all cursor-pointer relative group ${getColor(profit)} ${
                            isToday ? 'ring-2 ring-blue-400' : ''
                          }`}
                          title={`${date.toLocaleDateString()}: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`}
                        >
                          {/* Enhanced Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-gray-600 shadow-lg">
                            <div className="font-medium">{date.toLocaleDateString()}</div>
                            <div className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                            </div>
                            {isToday && <div className="text-blue-400 text-xs">Today</div>}
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center pt-4 border-t border-gray-700">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-700 rounded border border-gray-600"></div>
                <div className="w-3 h-3 bg-green-500/20 rounded border border-green-400/20"></div>
                <div className="w-3 h-3 bg-green-500/40 rounded border border-green-400/40"></div>
                <div className="w-3 h-3 bg-green-500/60 rounded border border-green-400/60"></div>
                <div className="w-3 h-3 bg-green-500/80 rounded border border-green-400/80"></div>
                <div className="w-3 h-3 bg-green-500 rounded border border-green-400"></div>
              </div>
              <span className="text-sm text-gray-400">More</span>
            </div>
          </div>
        </div>

        {/* Info Panel - Takes 1/3 of space */}
        <div className="space-y-4">
          {/* How to Read */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">📖 How to read this heatmap</h4>
            <p className="text-xs text-gray-300 mb-2">
              Like GitHub's activity tracker! Each square represents one trading day.
            </p>
            <div className="space-y-1 text-xs text-gray-300">
              <div>• <span className="text-green-400">Green squares</span> = profitable days</div>
              <div>• <span className="text-red-400">Red squares</span> = losing days</div>
              <div>• <span className="text-gray-400">Gray squares</span> = no trading</div>
              <div>• Darker colors = bigger profits/losses</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">📊 Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Total P&L:</span>
                <span className={`font-semibold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${totalProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Active Days:</span>
                <span className="text-white font-semibold">{tradingDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Best Day:</span>
                <span className="text-green-400 font-semibold">+${bestDay.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Trading Tips */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-700/50">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 Pattern Analysis</h4>
            <p className="text-xs text-gray-300">
              Look for patterns: Are you more profitable on certain days? Do you overtrade on Fridays? 
              Consistency is more important than big wins. Hover over squares for detailed daily P&L.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingHeatmap;
