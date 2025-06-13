import React from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {React.isValidElement(children) ? children : <div />}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
