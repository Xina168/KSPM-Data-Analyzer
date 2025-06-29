import React from 'react';
import StatCard from './StatCard';
import ChartContainer from './ChartContainer';
import TopItemsList from './TopItemsList';
import { DocumentIcon, PeopleIcon, MoneyBagIcon } from './icons';
import { ChartDataPoint, ChartType, SummaryStats, DetailedChartDataPoint } from '../types';

interface DashboardProps {
  stats: SummaryStats;
  chartData: ChartDataPoint[];
  detailedChartData: DetailedChartDataPoint[];
  chartType: ChartType;
  labelColumn: string | null;
  dataColumn: string | null;
  notification: string | null;
  chartRef: React.RefObject<HTMLDivElement>;
  topItemsTitle: string;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, chartData, detailedChartData, chartType, labelColumn, dataColumn, notification, chartRef, topItemsTitle }) => {
  return (
    <main className="flex-1 p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Payment Voucher" value={stats.totalVouchers.toLocaleString()} icon={<DocumentIcon />} color="blue" />
        <StatCard title="Total Customer" value={stats.totalCustomers.toLocaleString()} icon={<PeopleIcon />} color="orange" />
        <StatCard title="Total Paid" value={`$${stats.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<MoneyBagIcon />} color="red" />
      </div>

      {notification && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow" role="alert">
          <p>{notification}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md" style={{ height: '600px' }} ref={chartRef}>
        <ChartContainer data={chartData} chartType={chartType} labelColumn={labelColumn} dataColumn={dataColumn} />
      </div>

      <TopItemsList items={detailedChartData} title={topItemsTitle} dataColumn={dataColumn} />
    </main>
  );
};

export default Dashboard;