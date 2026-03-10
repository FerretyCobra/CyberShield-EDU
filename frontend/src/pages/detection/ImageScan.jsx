import React, { useState } from 'react';
import { PhotoIcon, ShieldExclamationIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import GlassCard from '../../components/common/GlassCard';
import FileUpload from '../../components/common/FileUpload';
import { detectionApi } from '../../services/api';
import { persistenceService } from '../../services/persistence';
import { downloadReport } from '../../utils/downloader';
import { motion, AnimatePresence } from 'framer-motion';
import HistoryPanel from '../../components/common/HistoryPanel';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const ImageScan = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleScan = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await detectionApi.analyzeImage(formData);
            setResult(res.data);
            persistenceService.saveScan('IMAGE', res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <GlassCard
                title="Screenshot OCR Scrutiny"
                description="Analyze screenshots of messages from WhatsApp, Telegram, or SMS using AI-powered OCR."
                icon={PhotoIcon}
            >
                <div className="space-y-6">
                    <FileUpload onFileSelect={setFile} type="image" />

                    <button
                        onClick={handleScan}
                        disabled={loading || !file}
                        className={`btn-primary w-full flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ WebkitMaskPosition: ["0% 0%", "200% 0%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="font-bold tracking-widest text-indigo-200"
                                >
                                    PERFORMING OPTICAL RECOGNITION...
                                </motion.div>
                                <div className="flex gap-1">
                                    <motion.div animate={{ height: [10, 20, 10] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} className="w-1 bg-white rounded-full" />
                                    <motion.div animate={{ height: [10, 24, 10] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }} className="w-1 bg-white rounded-full" />
                                    <motion.div animate={{ height: [10, 16, 10] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }} className="w-1 bg-white rounded-full" />
                                </div>
                            </div>
                        ) : 'Scan Screenshot'}
                    </button>
                </div>
            </GlassCard>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mt-10"
                    >
                        <div className={`relative overflow-hidden p-7 rounded-2xl border ${result.prediction === 'scam'
                            ? 'bg-rose-950/30 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
                            : 'bg-emerald-950/30 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                            }`}>

                            {/* Decorative background glow */}
                            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none ${result.prediction === 'scam' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

                            <div className="flex items-start gap-5 mb-6 relative z-10">
                                {result.prediction === 'scam' ? (
                                    <div className="p-3 bg-rose-500/20 ring-1 ring-rose-500/40 rounded-2xl flex-shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                        <ShieldExclamationIcon className="w-8 h-8 text-rose-400" />
                                    </div>
                                ) : (
                                    <div className="p-3 bg-emerald-500/20 ring-1 ring-emerald-500/40 rounded-2xl flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                        <CheckCircleIcon className="w-8 h-8 text-emerald-400" />
                                    </div>
                                )}
                                <div className="flex items-start justify-between w-full">
                                    <div>
                                        <h3 className={`text-2xl font-bold tracking-tight ${result.prediction === 'scam' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {result.prediction === 'scam' ? 'Potential Scam Detected' : 'Verified as Low Risk'}
                                        </h3>

                                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-700/50">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Context</span>
                                            <span className="text-sm font-semibold text-slate-300">{result.platform || 'General Message'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => downloadReport('IMAGE', result)}
                                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 ring-1 ring-white/10 transition-all hover:ring-white/20 hover:text-white"
                                        title="Download Evidence Report"
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {result.reasoning && (
                                <div className="mt-8 pt-6 border-t border-slate-700/50 relative z-10">
                                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4" /> Vision Intelligence Report
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {result.reasoning.map((r, i) => (
                                            <div key={i} className="flex item-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                                                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${result.prediction === 'scam' ? 'bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]'}`} />
                                                <span className="text-slate-300 text-[15px] leading-relaxed">
                                                    {r}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.findings?.qr_code && (
                                <div className="mt-4 p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 relative z-10 flex flex-col items-start">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                        </span>
                                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Embedded QR Data Found</p>
                                    </div>
                                    <code className="text-[15px] font-mono p-3 rounded-lg bg-slate-900/80 text-indigo-200 border border-slate-700/50 break-all w-full shadow-inner">{result.findings.qr_code}</code>
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

export default ImageScan;
