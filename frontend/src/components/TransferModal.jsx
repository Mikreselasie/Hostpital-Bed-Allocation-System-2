import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, AlertTriangle, MapPin, Activity, User } from 'lucide-react';
import clsx from 'clsx';

export default function TransferModal({ isOpen, onClose, sourceBed, beds, onTransfer }) {
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [availableBeds, setAvailableBeds] = useState([]);

    useEffect(() => {
        if (isOpen && beds) {
            setAvailableBeds(beds.filter(b => b.status === 'Available'));
        }
    }, [isOpen, beds]);

    const handleTransfer = () => {
        if (selectedTarget) {
            onTransfer(sourceBed, selectedTarget);
            onClose();
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
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden border border-slate-100"
            >
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2">Internal Logistics</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Subject Transfer</h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">Re-allocating clinical resources for better care.</p>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all"><X size={24} /></button>
                </div>

                <div className="p-10 space-y-8">
                    {/* Transfer Visual: High-Fidelity Path */}
                    <div className="flex items-center justify-between gap-6 px-10 py-10 bg-slate-50 rounded-[48px] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-indigo-50 to-indigo-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -translate-x-full group-hover:translate-x-full transition-transform" />

                        <div className="text-center relative z-10 flex-1">
                            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200">
                                <User className="text-slate-400" size={24} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Origin</p>
                            <p className="font-black text-slate-900 text-xl tracking-tighter">{sourceBed?.id}</p>
                            <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider block mt-2 w-fit mx-auto border border-indigo-200">
                                {sourceBed?.ward}
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-2 relative z-10 w-24">
                            <div className="w-12 h-px bg-slate-200 relative overflow-hidden">
                                <motion.div
                                    animate={{ left: ['0%', '100%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                    className="absolute top-0 w-4 h-full bg-indigo-500 blur-sm"
                                />
                            </div>
                            <div className="bg-indigo-600 text-white p-3 rounded-full shadow-xl shadow-indigo-100 active:scale-90 transition-all">
                                <ArrowRight size={20} />
                            </div>
                            <div className="w-12 h-px bg-slate-200" />
                        </div>

                        <div className="text-center relative z-10 flex-1">
                            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-500", selectedTarget ? "bg-indigo-600 shadow-xl shadow-indigo-100 scale-110" : "bg-slate-100 border-2 border-dashed border-slate-200")}>
                                {selectedTarget ? <MapPin className="text-white" size={24} /> : <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />}
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                            <p className={clsx("font-black text-xl tracking-tighter transition-colors", selectedTarget ? "text-slate-900" : "text-slate-200")}>
                                {selectedTarget ? selectedTarget.id : "PENDING"}
                            </p>
                            <span className={clsx("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider block mt-2 w-fit mx-auto border transition-colors",
                                selectedTarget ? "bg-emerald-100 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-300 border-slate-100")}>
                                {selectedTarget ? selectedTarget.ward : "UNSET"}
                            </span>
                        </div>
                    </div>

                    {/* Bed Selection: High-Density Pill Grid */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Allocation ({availableBeds.length})</label>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1 group cursor-pointer hover:underline">View Ward Map <Activity size={10} /></span>
                        </div>
                        <div className="border border-slate-100 rounded-3xl bg-slate-50/30 p-4 max-h-64 overflow-y-auto grid grid-cols-4 gap-3 scrollbar-thin">
                            {availableBeds.map(bed => (
                                <button
                                    key={bed.id}
                                    onClick={() => setSelectedTarget(bed)}
                                    className={clsx(
                                        "p-3 rounded-2xl border-2 text-xs font-black transition-all active:scale-95 flex flex-col items-center gap-1",
                                        selectedTarget?.id === bed.id
                                            ? "border-indigo-600 bg-white text-indigo-600 shadow-xl shadow-indigo-50"
                                            : "border-transparent bg-white text-slate-400 hover:border-indigo-200 hover:text-indigo-400"
                                    )}
                                >
                                    {bed.id}
                                    <span className="text-[8px] font-bold uppercase tracking-tighter text-slate-300 group-hover:text-indigo-300">{bed.ward}</span>
                                </button>
                            ))}
                            {availableBeds.length === 0 && (
                                <div className="col-span-4 py-10 text-center flex flex-col items-center gap-4 text-slate-300">
                                    <AlertTriangle size={32} className="opacity-10" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest italic">Facility Full • No Path Found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-10 border-t border-slate-100 bg-white flex justify-end gap-4">
                    <button onClick={onClose} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-all">Abort Path</button>
                    <button
                        onClick={handleTransfer}
                        disabled={!selectedTarget}
                        className="px-10 py-5 bg-slate-900 text-white font-black rounded-3xl text-[11px] uppercase tracking-widest hover:bg-black disabled:opacity-20 disabled:cursor-not-allowed shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-3 group"
                    >
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        Execute Transfer
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
