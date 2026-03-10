import React, { useState } from 'react';

const TextDetection = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleScan = async () => {
        if (!text) return;
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/text/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Scan failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="relative group">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-48 bg-[#0f172a]/50 border-2 border-[#334155] rounded-2xl p-6 text-white text-lg focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none shadow-inner"
                    placeholder="Paste email, SMS, or WhatsApp message here..."
                ></textarea>
                <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <button
                onClick={handleScan}
                disabled={loading || !text}
                className="btn-primary w-full py-4 text-lg flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <span>🚀</span>
                        <span>Analyze Content</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </>
                )}
            </button>

            {result && (
                <div className={`mt-8 p-6 rounded-2xl border-2 transition-all ${result.is_suspicious
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-green-500/10 border-green-500/30'
                    }`}>
                    <h3 className={`text-xl font-bold mb-2 ${result.is_suspicious ? 'text-red-400' : 'text-green-400'}`}>
                        {result.is_suspicious ? '⚠️ Potential Scam Detected' : '✅ Looks Safe So Far'}
                    </h3>
                    <p className="text-lg opacity-90">{result.recommendation}</p>
                    <div className="mt-4 text-sm text-[#94a3b8] flex items-center gap-2">
                        <div className="w-full bg-[#334155] h-2 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${result.is_suspicious ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${result.confidence * 100}%` }}
                            ></div>
                        </div>
                        <span className="whitespace-nowrap">{(result.confidence * 100).toFixed(1)}% confidence</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextDetection;
