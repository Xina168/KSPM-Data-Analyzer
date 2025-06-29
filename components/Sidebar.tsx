import React, { useRef } from 'react';
import { ChartType, DataRow } from '../types';
import { UploadIcon, MenuIcon, ChartIcon, DownloadIcon } from './icons';

interface SidebarProps {
  fileName: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  headers: string[];
  labelColumn: string | null;
  setLabelColumn: (value: string) => void;
  dataColumn: string | null;
  setDataColumn: (value: string) => void;
  itemCount: number;
  setItemCount: (value: number) => void;
  chartType: ChartType;
  setChartType: (value: ChartType) => void;
  onExportChart: () => void;
  onExportData: () => void;
  isDataLoaded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  fileName,
  onFileChange,
  headers,
  labelColumn,
  setLabelColumn,
  dataColumn,
  setDataColumn,
  itemCount,
  setItemCount,
  chartType,
  setChartType,
  onExportChart,
  onExportData,
  isDataLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <aside className="w-80 bg-white p-6 flex flex-col gap-6 h-screen shadow-lg sticky top-0">
      <div className="flex items-center gap-3">
        <MenuIcon className="text-gray-600" />
        <h1 className="text-lg font-bold text-gray-800">Koh Santepheap Data Analyzer</h1>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <UploadIcon className="text-blue-600" />
          Upload Excel File
        </h2>
        <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".xlsx, .xls" />
        <button onClick={handleChooseFile} className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
          Choose File
        </button>
        {fileName && <p className="text-xs text-gray-500 mt-2 truncate">File: {fileName}</p>}
        <p className="text-xs text-gray-400 mt-2">Accepted: .xlsx, .xls. Ensure column headers.</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg shadow-inner flex-grow">
        <h2 className="font-semibold text-gray-700 mb-3">Data Configuration</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="item-count" className="text-sm font-medium text-gray-600">Show Items</label>
            <select
              id="item-count"
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              disabled={!isDataLoaded}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="-1">All</option>
            </select>
          </div>
          <div>
            <label htmlFor="label-column" className="text-sm font-medium text-gray-600">Select Label Column</label>
            <select
              id="label-column"
              value={labelColumn ?? ''}
              onChange={(e) => setLabelColumn(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              disabled={!isDataLoaded}
            >
              <option value="" disabled>Select a column</option>
              {headers
                .filter(h => !h.toLowerCase().includes('payment') && !h.toLowerCase().includes('total amount') && !h.toLowerCase().includes('price') && !h.toLowerCase().includes('tax') && !h.toLowerCase().includes('date'))
                .map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="data-column" className="text-sm font-medium text-gray-600">Analyze Data Column</label>
            <select
              id="data-column"
              value={dataColumn ?? ''}
              onChange={(e) => setDataColumn(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              disabled={!isDataLoaded}
            >
              <option value="" disabled>Select a column</option>
              <option value="COUNT_OF_LABELS">Total Cooperated</option>
              {headers
                .filter(h => h.toLowerCase().includes('total amount'))
                .map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <h2 className="font-semibold text-gray-700 mt-6 mb-3">Select Chart Type</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType(ChartType.Bar)}
            disabled={!isDataLoaded}
            className={`flex-1 py-2 text-sm rounded-md transition-all ${chartType === ChartType.Bar ? 'bg-blue-500 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType(ChartType.Doughnut)}
            disabled={!isDataLoaded}
            className={`flex-1 py-2 text-sm rounded-md transition-all ${chartType === ChartType.Doughnut ? 'bg-blue-500 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Doughnut
          </button>
        </div>

        <h2 className="font-semibold text-gray-700 mt-6 mb-3">Export Data</h2>
        <div className="flex space-x-2">
          <button onClick={onExportChart} disabled={!isDataLoaded} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2">
            <ChartIcon className="w-4 h-4" />
            Chart
          </button>
          <button onClick={onExportData} disabled={!isDataLoaded} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2">
            <DownloadIcon className="w-4 h-4" />
            Top
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;