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
  return (
    <div className="bg-gray-800 p-4 rounded-lg relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className={`text-xl ${valueColor}`}>{value}</p>
        </div>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </div>
  );
};
