import React from 'react';

const Awareness = () => {
    const scams = [
        { title: "Fake Internships", sign: "Request for 'Registration' or 'Training' fees before starting.", color: "indigo" },
        { title: "Scholarship Scams", sign: "Guaranteed results or 'Processing fees' for free scholarships.", color: "pink" },
        { title: "Phishing Links", sign: "URLs like 'amazon-update-now.xyz' or 'google-verify.bit.ly'.", color: "blue" },
        { title: "Payment Requests", sign: "Asking for money via QR codes or unknown UPI IDs immediately.", color: "yellow" },
    ];

    return (
        <div className="space-y-8 animate-fade-in p-2">
            <h2 className="text-3xl font-bold gradient-text">Cyber Safety Guide</h2>

            <div className="grid md:grid-cols-2 gap-4">
                {scams.map((scam, i) => (
                    <div key={i} className="p-6 bg-[#0f172a]/50 border border-[#334155] rounded-2xl hover:border-indigo-500/30 transition-all group">
                        <h4 className="text-xl font-bold mb-2 group-hover:text-white">{scam.title}</h4>
                        <p className="text-sm text-[#94a3b8]">{scam.sign}</p>
                    </div>
                ))}
            </div>

            <div className="glass p-8 space-y-4 border-l-4 border-indigo-500">
                <h3 className="text-xl font-bold">What to do if you're scammed?</h3>
                <ol className="space-y-3 text-[#94a3b8]">
                    <li className="flex gap-4">
                        <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                        <span>Immediately stop all communication with the scammer.</span>
                    </li>
                    <li className="flex gap-4">
                        <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                        <span>Report the incident on <a href="https://cybercrime.gov.in" target="_blank" className="text-indigo-400 hover:underline">cybercrime.gov.in</a>.</span>
                    </li>
                    <li className="flex gap-4">
                        <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                        <span>Keep all screenshots and payment records as evidence.</span>
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default Awareness;
