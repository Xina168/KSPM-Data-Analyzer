import React, { useState, useMemo, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { ChartType, DataRow, ChartDataPoint, SummaryStats, DetailedChartDataPoint } from './types';

// Make sure to declare XLSX before use, as it's loaded from a script tag.
declare var XLSX: any;
declare var htmlToImage: any;

const COUNT_SPECIAL_VALUE = 'COUNT_OF_LABELS';

const App: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [labelColumn, setLabelColumn] = useState<string | null>(null);
  const [dataColumn, setDataColumn] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>(ChartType.Bar);
  const [itemCount, setItemCount] = useState<number>(10);
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setNotification('Processing your Excel file...');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: DataRow[] = XLSX.utils.sheet_to_json(worksheet);

          if (json.length > 0) {
            const newHeaders = Object.keys(json[0]);
            setRawData(json);
            setHeaders(newHeaders);
            setFileName(file.name);
            
            // Auto-select columns based on user feedback
            const labelHeaders = newHeaders.filter(h => !h.toLowerCase().includes('payment') && !h.toLowerCase().includes('total amount') && !h.toLowerCase().includes('price') && !h.toLowerCase().includes('tax') && !h.toLowerCase().includes('date'));
            const customerHeader = labelHeaders.find(h => h.toLowerCase().includes('customer') || h.toLowerCase().includes('supplier'));
            const pvCodeHeader = labelHeaders.find(h => h.toLowerCase().includes('pv code'));
            const dataColumnHeader = newHeaders.find(h => h.toLowerCase().includes('total amount'));
    
            // Prioritize Customer/Supplier for labels.
            setLabelColumn(customerHeader || pvCodeHeader || labelHeaders[0] || null);
            setDataColumn(dataColumnHeader || (newHeaders.length > 1 ? newHeaders[1] : null));
    
            setNotification(`File "${file.name}" loaded. Defaulting to Top Customers view.`);
          } else {
            setNotification('The selected Excel file is empty or has an unsupported format.');
          }
        } catch (error) {
          console.error("Error processing file:", error);
          setNotification('An error occurred while processing the file. Please ensure it is a valid Excel file.');
        } finally {
          setIsLoading(false);
          event.target.value = ''; // Reset file input
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const { chartData, summaryStats } = useMemo<{ chartData: ChartDataPoint[]; summaryStats: SummaryStats }>(() => {
    if (!rawData.length || !labelColumn || !dataColumn) {
      return { chartData: [], summaryStats: { totalVouchers: 0, totalCustomers: 0, totalPaid: 0 } };
    }

    const paymentStatusColumn = headers.find(h => h.toLowerCase().includes('payment'));
    const paidData = paymentStatusColumn
      ? rawData.filter(row => String(row[paymentStatusColumn]).toLowerCase().trim() === 'paid')
      : rawData;

    // --- Aggregation for Chart ---
    const valueMap = new Map<string, number>();
    const isCountMode = dataColumn === COUNT_SPECIAL_VALUE;

    paidData.forEach(row => {
      const label = row[labelColumn];
      if (label) {
        if (isCountMode) {
          const currentCount = valueMap.get(String(label)) || 0;
          valueMap.set(String(label), currentCount + 1);
        } else {
          const value = parseFloat(String(row[dataColumn]).replace(/[^0-9.-]+/g,""));
          if (!isNaN(value) && value > 0) {
            const currentTotal = valueMap.get(String(label)) || 0;
            valueMap.set(String(label), currentTotal + value);
          }
        }
      }
    });

    const sortedData = Array.from(valueMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const newChartData = itemCount === -1 ? sortedData : sortedData.slice(0, itemCount);

    if (newChartData.length > 0) {
      const analysisType = isCountMode ? 'Total Cooperated' : dataColumn;
      const paidStatus = paymentStatusColumn ? ' (Paid items only)' : '';
      const displayCount = itemCount === -1 ? 'All' : `Top ${itemCount}`;
      setNotification(`Chart updated: ${displayCount} ${labelColumn} by ${analysisType}${paidStatus}.`);
    }

    // --- Summary Stats Calculation ---
    const totalPaidColumn = headers.find(h => h.toLowerCase().includes('total amount')) || headers.find(h => h.toLowerCase().includes('total paid'));
    const totalPaid = totalPaidColumn ? paidData.reduce((sum, row) => {
        const value = parseFloat(String(row[totalPaidColumn]).replace(/[^0-9.-]+/g,""));
        return sum + (isNaN(value) ? 0 : value);
    }, 0) : 0;

    const customerColumn = headers.find(h => h.toLowerCase().includes('supplier') || h.toLowerCase().includes('customer'));
    const customerSet = new Set<string>();
    if (customerColumn) {
        paidData.forEach(row => {
            if(row[customerColumn]) {
                customerSet.add(String(row[customerColumn]));
            }
        });
    }

    const totalVouchers = paidData.length;
    const totalCustomers = customerSet.size;

    return { 
        chartData: newChartData, 
        summaryStats: { totalVouchers, totalCustomers, totalPaid }
    };
  }, [rawData, labelColumn, dataColumn, itemCount, headers]);
  
  const detailedChartData: DetailedChartDataPoint[] = useMemo(() => {
    if (!chartData.length || !labelColumn || !rawData.length) {
      return [];
    }

    const paymentStatusColumn = headers.find(h => h.toLowerCase().includes('payment'));
    const paidData = paymentStatusColumn
      ? rawData.filter(row => String(row[paymentStatusColumn]).toLowerCase().trim() === 'paid')
      : rawData;

    const groupedData = new Map<string, DataRow[]>();
    for (const row of paidData) {
      const key = String(row[labelColumn]);
      if (!groupedData.has(key)) {
        groupedData.set(key, []);
      }
      groupedData.get(key)!.push(row);
    }
    
    return chartData.map(chartItem => {
      const details = groupedData.get(chartItem.name) || [];
      const dataCol = dataColumn || '';
      
      details.sort((a, b) => {
        const valA = parseFloat(String(a[dataCol]).replace(/[^0-9.-]+/g,"")) || 0;
        const valB = parseFloat(String(b[dataCol]).replace(/[^0-9.-]+/g,"")) || 0;
        return valB - valA;
      });

      return {
        ...chartItem,
        details,
      };
    });
  }, [chartData, rawData, labelColumn, dataColumn, headers]);

  const topItemsTitle = useMemo(() => {
    if (!labelColumn || !dataColumn) return "Top Items";
    const paymentStatusColumn = headers.find(h => h.toLowerCase().includes('payment'));
    const paidOnlySuffix = paymentStatusColumn ? ' (Paid Only)' : '';
    const analysisName = dataColumn === COUNT_SPECIAL_VALUE ? 'Total Cooperated' : dataColumn;
    const displayCount = itemCount === -1 ? 'All' : `Top ${itemCount}`;
    return `${displayCount} ${labelColumn} by ${analysisName}${paidOnlySuffix}`;
  }, [itemCount, labelColumn, dataColumn, headers]);


  const handleExportChart = useCallback(() => {
    if (chartRef.current) {
      setNotification('Generating chart image...');
      htmlToImage.toPng(chartRef.current, { cacheBust: true, backgroundColor: '#ffffff', quality: 0.95 })
        .then((dataUrl: string) => {
          const link = document.createElement('a');
          link.download = `${fileName?.split('.')[0]}_chart.png`;
          link.href = dataUrl;
          link.click();
          setNotification('Chart exported successfully.');
        })
        .catch((err: any) => {
          console.error('oops, something went wrong!', err);
          setNotification('Failed to export chart.');
        });
    }
  }, [fileName]);

  const handleExportData = useCallback(() => {
    if (chartData.length > 0) {
      setNotification('Generating data export...');
      const exportableData = detailedChartData.flatMap(item => item.details.length > 0 ? item.details : [{ name: item.name, value: item.value }]);
      const worksheet = XLSX.utils.json_to_sheet(exportableData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Top Data Details');
      const displayCount = itemCount === -1 ? 'all' : `top_${itemCount}`;
      XLSX.writeFile(workbook, `${fileName?.split('.')[0]}_${displayCount}_details.xlsx`);
      setNotification('Top data exported successfully.');
    } else {
        setNotification('No data available to export.');
    }
  }, [detailedChartData, itemCount, fileName]);


  return (
    <div className="flex bg-gray-100 min-h-screen font-sans">
      <Sidebar
        fileName={fileName}
        onFileChange={handleFileChange}
        headers={headers}
        labelColumn={labelColumn}
        setLabelColumn={setLabelColumn}
        dataColumn={dataColumn}
        setDataColumn={setDataColumn}
        itemCount={itemCount}
        setItemCount={setItemCount}
        chartType={chartType}
        setChartType={setChartType}
        onExportChart={handleExportChart}
        onExportData={handleExportData}
        isDataLoaded={rawData.length > 0}
      />
      <Dashboard
        stats={summaryStats}
        chartData={chartData}
        detailedChartData={detailedChartData}
        chartType={chartType}
        labelColumn={labelColumn}
        dataColumn={dataColumn}
        notification={notification}
        chartRef={chartRef}
        topItemsTitle={topItemsTitle}
      />
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-xl text-center">
                <p className="font-semibold">Loading Data...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mt-2"></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;