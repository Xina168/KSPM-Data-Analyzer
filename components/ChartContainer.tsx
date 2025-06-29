import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { ChartDataPoint, ChartType } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#8dd1e1'];
const COUNT_SPECIAL_VALUE = 'COUNT_OF_LABELS';

interface ChartContainerProps {
  data: ChartDataPoint[];
  chartType: ChartType;
  labelColumn: string | null;
  dataColumn: string | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="label font-bold">{`${label}`}</p>
        <p className="intro text-blue-600">{`Value : ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};


const ChartContainer: React.FC<ChartContainerProps> = ({ data, chartType, labelColumn, dataColumn }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Please upload a file and configure the data to see the chart.</p>
      </div>
    );
  }
  
  const isCountMode = dataColumn === COUNT_SPECIAL_VALUE;
  const yAxisLabel = isCountMode ? 'Total Cooperated' : (dataColumn || '');
  const barName = isCountMode ? 'Total Cooperated' : (dataColumn || 'Value');

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === ChartType.Bar ? (
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 40, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 10 }}
            label={{ value: labelColumn || '', position: 'insideBottom', offset: 60, dy: 20, style: { textAnchor: 'middle' } }}
          />
          <YAxis 
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: -20, style: { textAnchor: 'middle' } }}
            tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(230, 230, 230, 0.5)' }} />
          <Legend verticalAlign="top" align="right" />
          <Bar dataKey="value" name={barName} fill="#60a5fa" />
        </BarChart>
      ) : (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      )}
    </ResponsiveContainer>
  );
};

export default ChartContainer;