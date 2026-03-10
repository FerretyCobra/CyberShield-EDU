import React, { useEffect, useState } from 'react';
import { ClockIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { persistenceService } from '../../services/persistence';

const HistoryPanel = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        setHistory(persistenceService.getHistory());
    }, []);

    const clearHistory = () => {
        persistenceService.clearHistory();
        setHistory([]);
    };

    if (history.length === 0) return null;

    return (
        <div className="mt-12 pt-8 border-t border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-indigo-400" />
                    Recent Scan History
                </h3>
                <button
                    onClick={clearHistory}
                    className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-all"
                >
                    <TrashIcon className="w-4 h-4" /> Clear
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-indigo-500/30 transition-all flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${item.prediction === 'scam' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.type}</p>
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-1">{item.summary}</p>
                            <p className="text-[10px] text-slate-600">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-xs font-bold ${item.prediction === 'scam' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {item.prediction.toUpperCase()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryPanel;
