import React, { useState } from 'react';
import { DetailedChartDataPoint, DataRow } from '../types';
import { ChevronDownIcon, ChevronUpIcon } from './icons';

interface TopItemsListProps {
  items: DetailedChartDataPoint[];
  title: string;
  dataColumn: string | null;
}

const COUNT_SPECIAL_VALUE = 'COUNT_OF_LABELS';

const findValueByKey = (obj: DataRow, keyPart: string): string | number | undefined => {
    const key = Object.keys(obj).find(k => k.toLowerCase().trim().replace(/\s+/g, '') === keyPart.toLowerCase().replace(/\s+/g, ''));
    return key ? obj[key] : undefined;
};

const formatDate = (dateValue: string | number | undefined | Date) => {
    if (!dateValue) return 'N/A';
    try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        }
    } catch (e) { /* Fallthrough */ }
    return String(dateValue); 
}

/**
 * Parses a date value that can be a Date object, or a string in various formats.
 * It prioritizes DD/MM/YYYY format for strings to handle regional differences.
 * @param dateValue The date value to parse.
 * @returns A Date object at UTC midnight, or null if parsing fails.
 */
const parseDate = (dateValue: any): Date | null => {
    if (!dateValue) {
        return null;
    }
    // Case 1: Already a valid Date object. Convert to UTC midnight.
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return new Date(Date.UTC(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate()));
    }

    const dateStr = String(dateValue).trim();
    
    // Case 2: String in DD/MM/YYYY, DD.MM.YYYY, or DD-MM-YYYY format
    const dmyParts = dateStr.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (dmyParts) {
        const day = parseInt(dmyParts[1], 10);
        const month = parseInt(dmyParts[2], 10);
        const year = parseInt(dmyParts[3], 10);

        if (year > 1000 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            const d = new Date(Date.UTC(year, month - 1, day));
            // Check for invalid dates like 31/02/2025
            if (d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day) {
                return d;
            }
        }
    }

    // Case 3: Fallback to native string parsing, then convert to UTC midnight.
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    
    return null;
};


const calculateDaysProcessing = (startDate: any, endDate: any): number | null => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) {
        return null;
    }

    // Calculate difference in milliseconds, then convert to days.
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));

    return dayDiff >= 0 ? dayDiff : null;
};


const formatCurrency = (value: any) => {
    const num = parseFloat(String(value).replace(/[^0-9.-]+/g,""));
    if (isNaN(num)) return '$0.00';
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const TopItemsList: React.FC<TopItemsListProps> = ({ items, title, dataColumn }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  if (items.length === 0) {
    return null;
  }
  
  const toggleExpand = (name: string) => {
    setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(name)) {
            newSet.delete(name);
        } else {
            newSet.add(name);
        }
        return newSet;
    });
  };

  const getTransactionValue = (detail: DataRow) => {
      return findValueByKey(detail, 'total amount') || findValueByKey(detail, 'total paid') || 0;
  }
  
  const isCountMode = dataColumn === COUNT_SPECIAL_VALUE;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <ul className="divide-y divide-gray-200">
        {items.map((item, index) => {
          const isExpanded = expandedItems.has(item.name);
          return (
            <li key={item.name} className="py-4">
              <div className="flex items-start justify-between cursor-pointer" onClick={() => toggleExpand(item.name)}>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center text-sm">{index + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                     {item.details.length > 1 && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mt-1">
                          {item.details.length} transactions
                        </span>
                     )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                    <p className="font-bold text-lg text-blue-600 flex-shrink-0 pl-4">
                        {isCountMode ? item.value.toLocaleString() : formatCurrency(item.value)}
                    </p>
                    {item.details.length > 1 ? (
                        isExpanded ? <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    ) : <div className="w-5 h-5" /> }
                </div>
              </div>
              
              {isExpanded && item.details.length > 1 && (
                <div className="pl-12 mt-4 space-y-3">
                  {item.details.map((detail, detailIndex) => {
                    const pvCode = findValueByKey(detail, 'pv code');
                    const invoiceNo = findValueByKey(detail, 'invoice no');
                    const customerName = findValueByKey(detail, 'customer') || findValueByKey(detail, 'supplier');
                    const date = findValueByKey(detail, 'date') || findValueByKey(detail, 'create date');
                    const expireDate = findValueByKey(detail, 'expire date') || findValueByKey(detail, 'paid date');
                    const purpose = findValueByKey(detail, 'purpose');
                    const transactionValue = getTransactionValue(detail);
                    const processingDays = calculateDaysProcessing(date, expireDate);

                    return (
                        <div key={detailIndex} className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-300">
                           <div className="flex justify-between items-center">
                                <p className="font-semibold text-gray-800">{String(pvCode || `Transaction #${detailIndex + 1}`)}</p>
                                <p className="font-semibold text-gray-700">{formatCurrency(transactionValue)}</p>
                           </div>
                           <div className="text-xs text-gray-500 mt-2 space-y-1">
                                {customerName && <p><span className="font-medium">Customer:</span> {String(customerName)}</p>}
                                {invoiceNo && <p><span className="font-medium">Invoice No:</span> {String(invoiceNo)}</p>}
                                <p><span className="font-medium">Date:</span> {formatDate(date)}</p>
                                <p><span className="font-medium">Expire Date:</span> {formatDate(expireDate)}</p>
                                {processingDays !== null && <p><span className="font-medium">Total Processing:</span> {processingDays} days</p>}
                                {purpose && <p><span className="font-medium">Purpose:</span> {String(purpose)}</p>}
                            </div>
                        </div>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TopItemsList;