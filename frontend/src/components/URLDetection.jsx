import React, { useState } from 'react';

const URLDetection = () => {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        if (!url) return;
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/url/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('URL check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="relative group">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full h-16 bg-[#0f172a]/50 border-2 border-[#334155] rounded-2xl px-6 text-white text-lg focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner"
                    placeholder="Enter URL to check (e.g., bit.ly/student-offer)..."
                />
            </div>

            <button
                onClick={handleCheck}
                disabled={loading || !url}
                className="btn-primary w-full py-4 text-lg flex justify-center items-center gap-2 group disabled:opacity-50"
            >
                {loading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <span>🔗</span>
                        <span>Verify Link Safety</span>
                    </>
                )}
            </button>

            {result && (
                <div className={`mt-8 p-6 rounded-2xl border-2 ${result.is_suspicious ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
                    }`}>
                    <h3 className={`text-xl font-bold mb-4 ${result.is_suspicious ? 'text-red-400' : 'text-green-400'}`}>
                        {result.is_suspicious ? '🚫 Dangerous Link Detected' : '✔️ Website Appears Safe'}
                    </h3>

                    {result.reasons && result.reasons.length > 0 && (
                        <ul className="space-y-2 mb-4">
                            {result.reasons.map((reason, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-[#94a3b8]">
                                    <span className="text-red-500">•</span>
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="text-lg opacity-90">{result.recommendation}</p>
                </div>
            )}
        </div>
    );
};

export default URLDetection;
