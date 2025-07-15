import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  valueColor: string;
  iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  valueColor,
  iconColor,
}) => {
  // Determine card style based on value color
  const getCardStyle = () => {
    if (valueColor.includes('green')) {
      return 'bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700 hover:border-green-500/50 hover:shadow-green-500/20';
    } else if (valueColor.includes('red')) {
      return 'bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700 hover:border-red-500/50 hover:shadow-red-500/20';
    } else if (valueColor.includes('indigo') || valueColor.includes('blue')) {
      return 'bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700 hover:border-blue-500/50 hover:shadow-blue-500/20';
    }
    return 'bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700 hover:border-gray-600 hover:shadow-gray-500/20';
  };

  const getIconBackground = () => {
    if (iconColor.includes('green')) {
      return 'bg-green-500/10 border border-green-500/20';
    } else if (iconColor.includes('red')) {
      return 'bg-red-500/10 border border-red-500/20';
    } else if (iconColor.includes('indigo') || iconColor.includes('blue')) {
      return 'bg-blue-500/10 border border-blue-500/20';
    }
    return 'bg-gray-500/10 border border-gray-500/20';
  };

  return (
    <div 
      className={`${getCardStyle()} p-4 rounded-lg relative overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group cursor-pointer`}
    >
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
              {title}
            </p>
          </div>
          <div className={`p-2 rounded-md ${getIconBackground()} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <p className={`text-xl font-bold ${valueColor} group-hover:scale-105 transition-transform duration-300`}>
              {value}
            </p>
            {/* Optional trend indicator */}
            <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                {valueColor.includes('green') && '📈 Positive'}
                {valueColor.includes('red') && '📉 Negative'}
                {(valueColor.includes('indigo') || valueColor.includes('blue')) && '📊 Metric'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom border animation */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
    </div>
  );
};
