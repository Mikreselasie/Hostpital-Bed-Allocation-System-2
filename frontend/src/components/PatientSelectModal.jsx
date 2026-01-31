import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, User, AlertTriangle, ChevronRight, Activity, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function PatientSelectModal({ isOpen, onClose, queue, onSelect }) {
    const [selectedPatient, setSelectedPatient] = useState(null);

    const handleConfirm = () => {
        if (selectedPatient) {
            onSelect(selectedPatient);
            onClose();
            setSelectedPatient(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] border border-slate-100"
            >
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-indigo-600">
                        <Activity size={120} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2">Queue Selection</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Candidate Registry</h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">Select priority subject for ward allocation.</p>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all relative z-10"><X size={24} /></button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30 space-y-3 scrollbar-thin">
                    <AnimatePresence mode="popLayout">
                        {queue.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-20 px-10 flex flex-col items-center gap-6"
                            >
                                <div className="bg-white p-8 rounded-full border border-slate-100 shadow-sm">
                                    <Clock size={48} className="text-slate-200" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-400 tracking-tight">Registry Synchronized</p>
                                    <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-1">Emergency Queue is currently empty</p>
                                </div>
                            </motion.div>
                        ) : (
                            queue.map(patient => (
                                <motion.div
                                    layout
                                    key={patient.id}
                                    onClick={() => setSelectedPatient(patient)}
                                    className={clsx(
                                        "p-6 rounded-[32px] border-2 flex justify-between items-center cursor-pointer transition-all active:scale-[0.98] group bg-white",
                                        selectedPatient?.id === patient.id
                                            ? "border-indigo-600 shadow-xl shadow-indigo-100/50"
                                            : "border-transparent hover:border-indigo-100 shadow-sm hover:shadow-md"
                                    )}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-inner",
                                            patient.triageLevel === 1
                                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                                : "bg-slate-50 text-slate-400"
                                        )}>
                                            {patient.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-lg tracking-tight">{patient.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={clsx("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border",
                                                    patient.triageLevel === 1 ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-indigo-50 text-indigo-500 border-indigo-100"
                                                )}>
                                                    Priority L{patient.triageLevel}
                                                </span>
                                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">ID: {patient.id.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={clsx("p-3 rounded-full transition-all", selectedPatient?.id === patient.id ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-200 group-hover:text-indigo-400 group-hover:bg-indigo-50")}>
                                        <Check size={20} className={clsx("transition-transform", selectedPatient?.id === patient.id ? "rotate-0" : "-rotate-90 opacity-0 group-hover:opacity-100 group-hover:rotate-0")} />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-10 border-t border-slate-100 bg-white flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] italic">Authorized Selection Only</p>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-all">Cancel</button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedPatient}
                            className="px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl text-[11px] uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-20 disabled:cursor-not-allowed shadow-2xl shadow-indigo-100 transition-all active:scale-95 flex items-center gap-3"
                        >
                            Select Candidate
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
