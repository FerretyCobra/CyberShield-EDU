import React, { useEffect, useState } from 'react';
import {
    AdjustmentsHorizontalIcon,
    ChartBarIcon,
    KeyIcon,
    DocumentTextIcon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import GlassCard from '../../components/common/GlassCard';
import { adminApi } from '../../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [keywords, setKeywords] = useState([]);
    const [newKeyword, setNewKeyword] = useState('');
    const [loading, setLoading] = useState(true);

    // Mock data for charts
    const scanData = [
        { name: 'Mon', scans: 12 },
        { name: 'Tue', scans: 18 },
        { name: 'Wed', scans: 15 },
        { name: 'Thu', scans: 25 },
        { name: 'Fri', scans: 32 },
        { name: 'Sat', scans: 10 },
        { name: 'Sun', scans: 12 },
    ];

    const pieData = [
        { name: 'Safe', value: 70 },
        { name: 'Scam', value: 30 },
    ];

    const COLORS = ['#10b981', '#f43f5e'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await adminApi.getStats();
                const kwRes = await adminApi.getKeywords();
                setStats(statsRes.data);
                setKeywords(kwRes.data.keywords);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddKeyword = async () => {
        if (!newKeyword.trim()) return;
        const updated = [...keywords, newKeyword.trim()];
        try {
            await adminApi.updateKeywords(updated);
            setKeywords(updated);
            setNewKeyword('');
        } catch (err) {
            alert("Failed to update keywords");
        }
    };

    const handleRemoveKeyword = async (kw) => {
        const updated = keywords.filter(k => k !== kw);
        try {
            await adminApi.updateKeywords(updated);
            setKeywords(updated);
        } catch (err) {
            alert("Failed to update keywords");
        }
    };

    if (loading) return <div className="text-white">Loading Admin Panel...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">System Administration</h1>
                    <p className="text-slate-400 mt-2 text-lg">Manage real-time detection rules and monitor application health.</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/80 border border-slate-700/50 shadow-inner">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <span className="text-emerald-400 text-sm font-bold tracking-widest uppercase">System Live</span>
                </div>
            </header>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Scans', value: stats?.total_scans || 0, color: 'from-indigo-500 to-purple-500', shadow: 'shadow-indigo-500/20' },
                    { label: 'Scams Flagged', value: stats?.scams_detected || 0, color: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20' },
                    { label: 'Active Rules', value: stats?.active_rules || 0, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
                    { label: 'Health Score', value: '98%', color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
                ].map((stat, i) => (
                    <div key={i} className="relative overflow-hidden p-6 rounded-3xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-slate-600">
                        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-2xl`}></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{stat.label}</p>
                        <p className={`text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br ${stat.color} drop-shadow-sm`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <GlassCard
                    title="Scan Activity"
                    description="Weekly volume of scam detection requests."
                    icon={ChartBarIcon}
                    className="lg:col-span-2"
                >
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={scanData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Line type="monotone" dataKey="scans" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard
                    title="Threat Distribution"
                    description="Ratio of safe vs scam detections."
                    icon={ShieldCheckIcon}
                >
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Keyword Manager */}
                <GlassCard
                    title="Detection Rules"
                    description="Update global scam keywords used across all detection modules."
                    icon={KeyIcon}
                >
                    <div className="space-y-6">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                className="flex-1 p-4 rounded-xl bg-slate-900/80 border border-slate-700/50 text-white placeholder-slate-500 focus:ring-0 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                placeholder="Enter a new urgent keyword (e.g., 'crypto')"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                            />
                            <button
                                onClick={handleAddKeyword}
                                className="px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold tracking-wide shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all hover:scale-105"
                            >
                                ADD
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                            {keywords.map((kw, i) => (
                                <div key={i} className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-200 text-sm font-medium transition-all hover:bg-slate-700 hover:border-indigo-500/30">
                                    <span className="text-indigo-400 font-bold">#</span>
                                    {kw}
                                    <button
                                        onClick={() => handleRemoveKeyword(kw)}
                                        className="ml-1 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-rose-400 transition-all p-1 hover:bg-rose-500/10 rounded-lg"
                                        title="Remove Keyword"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                {/* Resource Editor Placeholder */}
                <GlassCard
                    title="Content Management"
                    description="Update educational materials and wellness tips."
                    icon={DocumentTextIcon}
                >
                    <div className="p-10 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-center">
                        <DocumentTextIcon className="w-12 h-12 text-slate-600 mb-4" />
                        <p className="text-slate-400">Educational Resources Editor is under development.</p>
                        <p className="text-xs text-slate-500 mt-2">Currently available via JSON direct edit.</p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default AdminDashboard;
