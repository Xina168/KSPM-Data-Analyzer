export type DataRow = { [key: string]: string | number };

export enum ChartType {
  Bar = 'Bar',
  Doughnut = 'Doughnut',
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface DetailedChartDataPoint extends ChartDataPoint {
  details: DataRow[];
}

export interface SummaryStats {
  totalVouchers: number;
  totalCustomers: number;
  totalPaid: number;
}
