
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'red';
}

const colorClasses = {
  blue: 'border-blue-400',
  orange: 'border-orange-400',
  red: 'border-red-400',
};

const iconBgClasses = {
  blue: 'bg-blue-100 text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md flex justify-between items-center border-b-4 ${colorClasses[color]}`}>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${iconBgClasses[color]}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
