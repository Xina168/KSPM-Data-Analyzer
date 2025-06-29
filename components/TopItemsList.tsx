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

const formatCurrency = (value: any) => {
    const num = parseFloat(String(value).replace(/[^0-9.-]+/g,""));
    if (isNaN(num)) return '$0.00';
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const getGrade = (rank: number) => {
    if (rank <= 10) return { grade: 'A', color: 'bg-green-100 text-green-800' };
    if (rank <= 20) return { grade: 'B', color: 'bg-yellow-100 text-yellow-800' };
    if (rank <= 30) return { grade: 'C', color: 'bg-orange-100 text-orange-800' };
    return { grade: 'D', color: 'bg-red-100 text-red-800' };
};

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
          const { grade, color } = getGrade(index + 1);
          return (
            <li key={item.name} className="py-4">
              <div className="flex items-start justify-between cursor-pointer" onClick={() => toggleExpand(item.name)}>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center text-sm">{index + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
                        GRADE {grade}
                      </span>
                    </div>
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
                    const date = findValueByKey(detail, 'date') || findValueByKey(detail, 'create date');
                    const expireDate = findValueByKey(detail, 'expire date') || findValueByKey(detail, 'paid date');
                    const purpose = findValueByKey(detail, 'purpose');
                    const transactionValue = getTransactionValue(detail);

                    return (
                        <div key={detailIndex} className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-300">
                           <div className="flex justify-between items-center">
                                <p className="font-semibold text-gray-800">{String(pvCode || `Transaction #${detailIndex + 1}`)}</p>
                                <p className="font-semibold text-gray-700">{formatCurrency(transactionValue)}</p>
                           </div>
                           <div className="text-xs text-gray-500 mt-2 space-y-1">
                                <p><span className="font-medium">Date:</span> {formatDate(date)}</p>
                                <p><span className="font-medium">Expire Date:</span> {formatDate(expireDate)}</p>
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