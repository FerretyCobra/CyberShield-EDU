import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, title, description, icon: Icon, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`glass-card p-8 ${className}`}
        >
            <div className="flex items-start gap-4 mb-8">
                {Icon && (
                    <div className="p-2.5 mt-0.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ring-1 ring-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <Icon className="w-6 h-6" />
                    </div>
                )}
                <div>
                    <h2 className="text-3xl tracking-tight font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{title}</h2>
                    {description && <p className="text-slate-400 text-[15px] mt-2 leading-relaxed max-w-2xl">{description}</p>}
                </div>
            </div>
            {children}
        </motion.div>
    );
};

export default GlassCard;
