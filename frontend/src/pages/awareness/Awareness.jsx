import React, { useEffect, useState } from 'react';
import {
    AcademicCapIcon,
    LightBulbIcon,
    ShieldCheckIcon,
    QuestionMarkCircleIcon,
    HeartIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import GlassCard from '../../components/common/GlassCard';
import { awarenessApi } from '../../services/api';
import { motion } from 'framer-motion';

const Awareness = () => {
    const [data, setData] = useState(null);
    const [activeQuiz, setActiveQuiz] = useState(false);
    const [quizScore, setQuizScore] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await awarenessApi.getContent();
                setData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    if (!data) return <div className="text-white">Loading Education Center...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <header className="text-center space-y-4 mb-12">
                <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Education & Wellness Center</h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">Empowering students with knowledge to stay safe in the digital world.</p>
            </header>

            {/* Hero Section: Scam of the Week */}
            {data.scam_of_the_week && (
                <div className="relative overflow-hidden p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md shadow-[0_0_40px_rgba(245,158,11,0.1)]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="relative z-10 flex items-start gap-6">
                        <div className="p-4 bg-amber-500/20 ring-1 ring-amber-500/40 rounded-2xl flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                            <ExclamationTriangleIcon className="w-10 h-10 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-amber-400 tracking-tight mb-2">Trending: {data.scam_of_the_week.title}</h2>
                            <p className="text-slate-300 text-lg mb-6 max-w-3xl leading-relaxed">{data.scam_of_the_week.description}</p>
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-300 font-semibold shadow-inner">
                                <ShieldCheckIcon className="w-6 h-6" />
                                <span>{data.scam_of_the_week.warning}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Quick Tips */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-yellow-500/20 ring-1 ring-yellow-500/30">
                            <LightBulbIcon className="w-6 h-6 text-yellow-400" />
                        </div>
                        Student Safety Guide
                    </h2>
                    <div className="space-y-4">
                        {data.quick_tips.map((tip) => (
                            <div key={tip.id} className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-700/50 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/10">
                                <h3 className="text-lg font-bold text-indigo-300 mb-2 group-hover:text-indigo-200 transition-colors">{tip.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{tip.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wellness & Support */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-rose-500/20 ring-1 ring-rose-500/30">
                            <HeartIcon className="w-6 h-6 text-rose-400" />
                        </div>
                        Wellness & Support
                    </h2>
                    <div className="relative overflow-hidden p-8 rounded-2xl bg-rose-950/20 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.05)]">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl"></div>
                        <p className="relative z-10 text-slate-300 text-lg italic mb-8 leading-relaxed border-l-4 border-rose-500/50 pl-4">"{data.wellness.message}"</p>

                        <div className="relative z-10 p-6 rounded-xl bg-slate-900/60 border border-slate-800">
                            <h4 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span>
                                Grounding Exercises
                            </h4>
                            <ul className="space-y-4">
                                {data.wellness.grounding_exercises.map((ex, i) => (
                                    <li key={i} className="flex gap-4 text-slate-300">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold text-sm shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="pt-0.5 leading-relaxed">{ex}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quiz Section */}
            <GlassCard
                title="Interactive Knowledge Check"
                description="Test your threat detection skills and see if you can spot the warning signs."
                icon={QuestionMarkCircleIcon}
                className="mt-8"
            >
                {!activeQuiz ? (
                    <div className="text-center py-16 px-4">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ring-1 ring-indigo-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                            <AcademicCapIcon className="w-12 h-12 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Ready to test your knowledge?</h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg hover:text-slate-300 transition-colors">Complete the scenario-based quiz to validate your cybersecurity readiness.</p>
                        <button
                            onClick={() => setActiveQuiz(true)}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all hover:-translate-y-1"
                        >
                            Start Assessment
                        </button>
                    </div>
                ) : (
                    <div className="space-y-10 mt-8">
                        {data.scam_quiz.map((q, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-slate-900/60 border border-slate-700/50 shadow-inner">
                                <div className="flex gap-4 items-start mb-6">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30 shrink-0">
                                        {idx + 1}
                                    </span>
                                    <p className="text-xl font-bold text-white leading-relaxed">{q.question}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, optIdx) => (
                                        <button
                                            key={optIdx}
                                            className="group text-left p-5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 hover:border-indigo-400 transition-all shadow-md hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center justify-between"
                                        >
                                            <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{opt}</span>
                                            <div className="w-4 h-4 rounded-full border border-slate-500 group-hover:border-indigo-400 transition-colors"></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="text-center pt-6 border-t border-slate-800">
                            <button
                                onClick={() => setActiveQuiz(false)}
                                className="px-6 py-3 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all font-semibold"
                            >
                                Cancel Assessment
                            </button>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default Awareness;
