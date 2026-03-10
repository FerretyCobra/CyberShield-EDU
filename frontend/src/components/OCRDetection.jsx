import React, { useState } from 'react';

const OCRDetection = () => {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleOCR = async () => {
        if (!image) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', image);

        try {
            const response = await fetch('http://localhost:8000/api/v1/ocr/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('OCR scan failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                <span className="text-xl">💡</span>
                <p className="text-sm text-yellow-200/80">
                    Use this tool for screenshots of suspect WhatsApp messages, Instagram DMs, or Telegram groups.
                </p>
            </div>

            <div
                className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${image ? 'border-indigo-500 bg-indigo-500/10' : 'border-[#334155] hover:border-indigo-500/50 hover:bg-[#1e293b]/50'
                    }`}
            >
                <input
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="hidden"
                    id="ocr-upload"
                    accept="image/*"
                />
                <label htmlFor="ocr-upload" className="flex flex-col items-center gap-2 cursor-pointer w-full h-full justify-center">
                    <span className="text-5xl">{image ? '🖼️' : '📸'}</span>
                    <span className="text-[#94a3b8]">
                        {image ? image.name : 'Upload Chat Screenshot'}
                    </span>
                </label>
            </div>

            <button
                onClick={handleOCR}
                disabled={loading || !image}
                className="btn-primary w-full py-4 text-lg"
            >
                {loading ? 'Running OCR Engine...' : 'Scan Screenshot for Scams'}
            </button>

            {result && (
                <div className={`mt-8 p-6 rounded-2xl border-2 ${result.is_suspicious ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
                    }`}>
                    <h3 className={`text-xl font-bold mb-4 ${result.is_suspicious ? 'text-red-400' : 'text-green-400'}`}>
                        {result.is_suspicious ? '🚨 Scam Patterns Identified' : '✅ Image Content Normal'}
                    </h3>

                    {result.findings && result.findings.length > 0 && (
                        <ul className="space-y-2 mb-4">
                            {result.findings.map((f, i) => <li key={i} className="text-red-300">🚩 {f}</li>)}
                        </ul>
                    )}

                    <p className="opacity-90">{result.recommendation}</p>

                    {result.extracted_text && (
                        <details className="mt-4">
                            <summary className="cursor-pointer text-sm text-[#64748b]">View Extracted Text</summary>
                            <div className="mt-2 p-3 bg-[#0f172a] rounded-lg text-xs opacity-70 whitespace-pre-wrap">
                                {result.extracted_text}
                            </div>
                        </details>
                    )}
                </div>
            )}
        </div>
    );
};

export default OCRDetection;
