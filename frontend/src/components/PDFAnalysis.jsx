import React, { useState } from 'react';

const PDFAnalysis = () => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/v1/pdf/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('PDF analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div
                className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-indigo-500 bg-indigo-500/10' : 'border-[#334155] hover:border-indigo-500/50 hover:bg-[#1e293b]/50'
                    }`}
            >
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="pdf-upload"
                    accept=".pdf"
                />
                <label htmlFor="pdf-upload" className="flex flex-col items-center gap-2 cursor-pointer w-full h-full justify-center">
                    <span className="text-4xl">{file ? '📂' : '📤'}</span>
                    <span className="text-[#94a3b8]">
                        {file ? file.name : 'Upload Offer Letter (PDF)'}
                    </span>
                </label>
            </div>

            <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="btn-primary w-full py-4 text-lg"
            >
                {loading ? 'Analyzing AI-driven Fraud...' : 'Scan PDF for Fraud Patterns'}
            </button>

            {result && (
                <div className={`mt-8 p-6 rounded-2xl border-2 ${result.is_suspicious ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
                    }`}>
                    <h3 className={`text-xl font-bold mb-4 ${result.is_suspicious ? 'text-red-400' : 'text-green-400'}`}>
                        {result.is_suspicious ? '⚠️ Suspicious Document' : '✔️ Document Structure Normal'}
                    </h3>

                    {result.findings && result.findings.length > 0 && (
                        <div className="mb-4">
                            <span className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">Key Findings:</span>
                            <ul className="space-y-2 mt-2">
                                {result.findings.map((f, i) => <li key={i} className="text-red-300 flex gap-2"><span>🚩</span> {f}</li>)}
                            </ul>
                        </div>
                    )}

                    <p className="opacity-90">{result.recommendation}</p>
                </div>
            )}
        </div>
    );
};

export default PDFAnalysis;
