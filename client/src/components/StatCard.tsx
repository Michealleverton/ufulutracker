import React from 'react';

interface StatCardProps {
  content: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ content }) => {
  return (
    <div className="stat-card">
      {content}
    </div>
  );
};

export default StatCard;