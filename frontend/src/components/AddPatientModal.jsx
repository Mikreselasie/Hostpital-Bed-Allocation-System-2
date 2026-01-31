import React, { useState } from 'react';
import { X, UserPlus, Check, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function AddPatientModal({ isOpen, onClose, onAdd }) {
    const [name, setName] = useState('');
    const [triage, setTriage] = useState(3);
    const [diagnosis, setDiagnosis] = useState('Stable / Observation');

    const DIAGNOSES = [
        'Stable / Observation',
        'Cardiac Arrest',
        'Sepsis / Septic Shock',
        'Stroke (CVA)',
        'Respiratory Failure',
        'Myocardial Infarction',
        'Multi-System Trauma',
        'Acute Renal Failure',
        'Diabetic Ketoacidosis',
        'Gastrointestinal Bleed'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ name, triageLevel: triage, diagnosis });
        setName('');
        setTriage(3);
        setDiagnosis('Stable / Observation');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden relative z-10 border border-slate-100"
            >
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-green-600">
                        <UserPlus size={120} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em] mb-2">Subject Registration</p>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">New Admission</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">Initiating care record for emergency queue.</p>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all relative z-10">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Full Name</label>
                            <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1"><Sparkles size={10} /> Identity Verified</span>
                        </div>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter legal name..."
                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-slate-900 text-xl outline-none focus:ring-4 focus:ring-green-600/10 focus:bg-white focus:border-green-600 transition-all placeholder:text-slate-200"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Admitting Diagnosis</label>
                        <div className="relative group">
                            <select
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 appearance-none outline-none focus:ring-4 focus:ring-green-600/10 focus:bg-white focus:border-green-600 transition-all cursor-pointer"
                            >
                                {DIAGNOSES.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-green-600 transition-colors">
                                <Activity size={18} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Triage Severity Matrix</label>
                        <div className="grid grid-cols-5 gap-3">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setTriage(level)}
                                    className={clsx(
                                        "py-6 rounded-3xl font-black transition-all flex flex-col items-center gap-3 border-2 active:scale-90",
                                        triage === level
                                            ? getTriageActiveClasses(level)
                                            : "border-slate-50 bg-slate-50 text-slate-300 hover:border-green-200 hover:bg-white hover:text-green-400"
                                    )}
                                >
                                    <span className="text-2xl tracking-tighter">L{level}</span>
                                    <span className="text-[9px] uppercase tracking-widest leading-none text-center px-1">{getTriageLabel(level)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full py-6 bg-green-600 text-white font-black rounded-3xl hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-green-100 text-sm uppercase tracking-[0.2em] active:scale-95 group"
                        >
                            <Activity size={20} className="group-hover:animate-pulse" /> Finalize Registration
                        </button>
                        <p className="mt-6 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                            <ShieldCheck size={12} /> Encrypted at Rest
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function getTriageActiveClasses(level) {
    if (level === 1) return "border-rose-600 bg-rose-600 text-white shadow-xl shadow-rose-100";
    if (level === 2) return "border-amber-500 bg-amber-500 text-white shadow-xl shadow-amber-100";
    if (level === 3) return "border-green-600 bg-green-600 text-white shadow-xl shadow-green-100";
    if (level === 4) return "border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200";
    return "border-slate-400 bg-slate-400 text-white shadow-xl shadow-slate-100";
}

function getTriageLabel(level) {
    const labels = ["Critical", "Urgent", "Stable", "Routine", "Minor"];
    return labels[level - 1];
}
