import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, BedDouble, MapPin, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function AssignmentModal({ isOpen, onClose, patient, beds, onAssign }) {
    const [selectedBed, setSelectedBed] = useState(null);
    const [availableBeds, setAvailableBeds] = useState([]);
    const [filterWard, setFilterWard] = useState('All');

    useEffect(() => {
        if (isOpen && beds) {
            setAvailableBeds(beds.filter(b => b.status === 'Available'));
        }
    }, [isOpen, beds]);

    const handleConfirm = () => {
        if (selectedBed) {
            onAssign(patient, selectedBed.id);
            onClose();
        }
    };

    const filteredBeds = availableBeds.filter(b => filterWard === 'All' || b.ward === filterWard);

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
                className="bg-white rounded-[20px] shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col max-h-[80vh] border border-slate-100"
            >
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em] mb-2">Operational Directive</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Unit Allocation</h3>
                        <p className="text-sm text-slate-400 font-medium mt-1 italic">Assigning subject <span className="text-slate-900 font-black not-italic">{patient?.name}</span> to active resource.</p>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all active:scale-90"><X size={24} /></button>
                </div>

                {/* Ward Filter: Modern Horizontal Scroller */}
                <div className="px-10 py-4 bg-slate-50/50 border-b border-slate-100 flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar">
                    {['All', 'ICU', 'Cardiology', 'General', 'Pediatrics'].map(ward => (
                        <button
                            key={ward}
                            onClick={() => setFilterWard(ward)}
                            className={clsx(
                                "px-5 py-2 text-[10px] font-black rounded-xl transition-all whitespace-nowrap border uppercase tracking-widest flex-shrink-0",
                                filterWard === ward
                                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200"
                                    : "bg-white text-slate-400 border-slate-200 hover:border-green-200 hover:text-green-600"
                            )}
                        >
                            {ward}
                        </button>
                    ))}
                </div>

                <div className="p-8 overflow-y-auto flex-1 bg-white scrollbar-thin max-h-[450px]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                        {filteredBeds.map(bed => (
                            <button
                                key={bed.id}
                                onClick={() => setSelectedBed(bed)}
                                onDoubleClick={() => { setSelectedBed(bed); handleConfirm(); }}
                                className={clsx(
                                    "px-4 py-6 rounded-[20px] border-2 text-left transition-all relative overflow-hidden group active:scale-95",
                                    selectedBed?.id === bed.id
                                        ? "border-green-600 bg-green-50/30"
                                        : "border-slate-50 bg-slate-50/50 hover:border-green-200 hover:bg-white hover:shadow-xl hover:shadow-green-50/50"
                                )}
                            >
                                <div className="flex justify-between items-start mb-5">
                                    <div className={clsx("p-2 rounded-xl transition-colors", selectedBed?.id === bed.id ? "bg-green-600 text-white" : "bg-white text-slate-300 group-hover:text-green-600")}>
                                        <MapPin size={14} />
                                    </div>
                                    {selectedBed?.id === bed.id && <Check size={18} className="text-green-600" />}
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{bed.ward} Unit</span>
                                <span className={clsx("text-xl font-black block tracking-tighter", selectedBed?.id === bed.id ? "text-green-600" : "text-slate-900")}>{bed.id}</span>
                            </button>
                        ))}
                        {filteredBeds.length === 0 && (
                            <div className="col-span-full py-20 text-center flex flex-col items-center gap-6">
                                <div className="bg-slate-50 p-8 rounded-full">
                                    <BedDouble size={48} className="opacity-10" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-400 tracking-tight">Ward Capacity Exhausted</p>
                                    <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-1">No available units in {filterWard}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-10 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {selectedBed ? (
                            <div className="bg-white px-6 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Target: {selectedBed.id}</span>
                            </div>
                        ) : (
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic animate-pulse">Awaiting Selection...</p>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-8 py-3 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-all">Cancel</button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedBed}
                            className="px-10 py-3 bg-green-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-green-100 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Activity size={16} />
                            Deploy Assignment
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
