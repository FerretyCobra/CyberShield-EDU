import React, { useState } from 'react';
import {
  ChatBubbleLeftRightIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

import GlassCard from '../../components/common/GlassCard';
import { detectionApi } from '../../services/api';
import { persistenceService } from '../../services/persistence';
import { downloadReport } from '../../utils/downloader';
import HistoryPanel from '../../components/common/HistoryPanel';

import { motion, AnimatePresence } from 'framer-motion';

const TextScan = () => {

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    if (!text.trim()) return;

    setLoading(true);

    try {
      const res = await detectionApi.analyzeText(text);
      setResult(res.data);
      persistenceService.saveScan('TEXT', res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <GlassCard
        title="Text Scam Analysis"
        description="Paste suspicious messages from WhatsApp, SMS, or email to analyze potential scam indicators."
        icon={ChatBubbleLeftRightIcon}
      >

        <div className="space-y-6">

          {/* Text Input */}
          <textarea
            className="w-full h-44 p-4 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
            placeholder="Paste the suspicious message here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Analyze Button */}
          <button
            onClick={handleScan}
            disabled={loading || !text.trim()}
            className="btn-primary w-full flex items-center justify-center"
          >

            {loading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  Analyzing message
                </motion.span>
              </span>
            ) : (
              'Run AI Analysis'
            )}

          </button>

        </div>

      </GlassCard>

      {/* Result Panel */}

      <AnimatePresence>
        {result && (

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >

            <div className={`glass-card p-6 border
              ${result.prediction === 'scam'
                ? 'border-rose-500/30'
                : 'border-emerald-500/30'
              }`}>

              <div className="flex items-start justify-between">

                <div className="flex items-start gap-4">

                  {result.prediction === 'scam' ? (
                    <ShieldExclamationIcon className="w-7 h-7 text-rose-400" />
                  ) : (
                    <CheckCircleIcon className="w-7 h-7 text-emerald-400" />
                  )}

                  <div>

                    <h3 className={`text-xl font-semibold
                      ${result.prediction === 'scam'
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                      }`}>

                      {result.prediction === 'scam'
                        ? 'Potential Scam Detected'
                        : 'Message Appears Safe'}

                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      AI confidence score
                    </p>

                    {/* Confidence Bar */}

                    <div className="mt-3 flex items-center gap-3">

                      <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">

                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full
                            ${result.prediction === 'scam'
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                            }`}
                        />

                      </div>

                      <span className="text-sm text-slate-300">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>

                    </div>

                  </div>

                </div>

                {/* Download Report */}

                <button
                  onClick={() => downloadReport('TEXT', result)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition"
                  title="Download report"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>

              </div>

              {/* Reasoning */}

              {result.reasoning && (

                <div className="mt-6 pt-6 border-t border-slate-800">

                  <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                    AI Indicators
                  </h4>

                  <div className="space-y-2">

                    {result.reasoning.map((r, i) => (

                      <div
                        key={i}
                        className="text-sm text-slate-300 flex gap-2"
                      >

                        <span className={`mt-2 w-1.5 h-1.5 rounded-full
                          ${result.prediction === 'scam'
                            ? 'bg-rose-500'
                            : 'bg-emerald-500'
                          }`}
                        />

                        <span>{r}</span>

                      </div>

                    ))}

                  </div>

                </div>

              )}

            </div>

          </motion.div>

        )}
      </AnimatePresence>

      <HistoryPanel />

    </div>
  );
};

export default TextScan;
