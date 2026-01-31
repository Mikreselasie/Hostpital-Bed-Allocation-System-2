import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ArrowRight, HeartPulse, ClipboardCheck, LayoutGrid, MapPin, Activity } from 'lucide-react';
import clsx from 'clsx';
import TransferModal from './TransferModal';
import PatientSelectModal from './PatientSelectModal';

const STATUS_CONFIG = {
    'Available': { color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    'Occupied': { color: 'bg-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', pulse: true },
    'Cleaning': { color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', pulse: true },
    'Reserved': { color: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' },
    'Unknown': { color: 'bg-slate-300', bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-100' }
};

const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG['Unknown'];

const WARD_FILTERS = ['All', 'ICU', 'Cardiology', 'General', 'Pediatrics'];
const STATUS_FILTERS = ['All', 'Available', 'Occupied', 'Cleaning'];

export default function BedGrid({ beds, queue, onAssign, onTransfer, userRole }) {
    const [selectedWard, setSelectedWard] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [search, setSearch] = useState('');
    const [activeBed, setActiveBed] = useState(null);

    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    const safeBeds = Array.isArray(beds) ? beds : [];
    const filteredBeds = safeBeds.filter(bed => {
        const matchesWard = selectedWard === 'All' || bed.ward === selectedWard;
        const matchesStatus = selectedStatus === 'All' || bed.status === selectedStatus;
        const matchesSearch = bed.id.toLowerCase().includes(search.toLowerCase());
        return matchesWard && matchesStatus && matchesSearch;
    });

    const isDoctor = userRole === 'Doctor';
    const isNurse = userRole === 'Nurse';

    const handleTransferClick = () => {
        if (!isDoctor) return alert("Only Doctors can authorize patient transfers.");
        if (activeBed?.status === 'Occupied') setIsTransferOpen(true);
    };

    const handleAssignClick = () => {
        if (!isDoctor) return alert("Only Doctors can authorize assignments.");
        if (activeBed?.status === 'Available') setIsAssignOpen(true);
    };

    const handlePatientSelect = (patient) => {
        if (activeBed) {
            onAssign(patient, activeBed.id);
            setIsAssignOpen(false);
            setActiveBed(null);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 w-full flex-1 shadow-subtle min-h-[600px] flex flex-col">
            {/* Header: Improved SaaS Look */}
            <div className="flex flex-col space-y-6 mb-10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <LayoutGrid size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Facility Resource Map</h2>
                            <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Real-time Ward Capacity • {beds.length} Total Units
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Locate Bed ID..."
                                className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 w-64 transition-all shadow-inner placeholder:text-slate-300"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters: Indigo Accentuated */}
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
                        {WARD_FILTERS.map(ward => (
                            <button
                                key={ward}
                                onClick={() => setSelectedWard(ward)}
                                className={clsx(
                                    "px-5 py-2 text-xs font-bold rounded-xl transition-all",
                                    selectedWard === ward
                                        ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {ward}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {STATUS_FILTERS.map(status => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={clsx(
                                    "px-4 py-2 text-[11px] font-bold rounded-xl border transition-all flex items-center gap-2 uppercase tracking-wider",
                                    selectedStatus === status
                                        ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                )}
                            >
                                {status !== 'All' && <div className={clsx("w-1.5 h-1.5 rounded-full", getStatusConfig(status).color)} />}
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid of Pill-Shaped Beds */}
            <div className="flex grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                <AnimatePresence>
                    {filteredBeds.map((bed) => (
                        <BedPill key={bed.id} bed={bed} onClick={() => setActiveBed(bed)} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Detail Drawer - SaaS 2.0 Polish */}
            <AnimatePresence>
                {activeBed && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[4px]"
                        onClick={() => setActiveBed(null)}
                    >
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            className="w-[450px] bg-white h-full shadow-2xl p-10 flex flex-col border-l border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg", getStatusConfig(activeBed.status).color)}>
                                        {activeBed.id.slice(-2)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{activeBed.id}</h3>
                                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider mt-0.5">
                                            <MapPin size={12} className="text-indigo-500" />
                                            {activeBed.ward} • Level 4
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveBed(null)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-95 group">
                                    <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</p>
                                        <span className={clsx("px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", getStatusConfig(activeBed.status).bg, getStatusConfig(activeBed.status).text, getStatusConfig(activeBed.status).border)}>
                                            {activeBed.status}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Type</p>
                                        <p className="text-sm font-bold text-slate-700">Medical/Surgical</p>
                                    </div>
                                </div>

                                {activeBed.status === 'Occupied' && (
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 relative overflow-hidden group">
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />
                                        <div className="flex items-center gap-3 mb-6 relative z-10">
                                            <div className="bg-indigo-600 p-2 rounded-xl text-white">
                                                <HeartPulse size={18} />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Admitted Patient</span>
                                        </div>
                                        <p className="text-3xl font-bold text-slate-900 tracking-tight relative z-10">
                                            {activeBed.patient?.name || 'Authorized Subject'}
                                        </p>
                                        <div className="mt-6 flex gap-4 relative z-10">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Admission ID</p>
                                                <p className="text-sm font-mono font-bold text-slate-600">REQ-{(activeBed.patient?.id || '000').toUpperCase()}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Time at Bed</p>
                                                <p className="text-sm font-bold text-slate-600">2h 45m</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 border-t border-slate-100 space-y-3">
                                {activeBed.status === 'Occupied' ? (
                                    <>
                                        {isNurse && (
                                            <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-95">
                                                <ClipboardCheck size={20} /> Force Vitals Update
                                            </button>
                                        )}
                                        {isDoctor && (
                                            <button onClick={handleTransferClick} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95">
                                                <ArrowRight size={20} /> Authorize Transfer
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={handleAssignClick}
                                        disabled={activeBed.status !== 'Available' || !isDoctor}
                                        className={clsx(
                                            "w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl disabled:shadow-none",
                                            activeBed.status === 'Available' && isDoctor
                                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        )}
                                    >
                                        <Activity size={20} />
                                        {activeBed.status === 'Available' ? 'Direct Assignment' : 'Unit Offline'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} sourceBed={activeBed} beds={beds} onTransfer={onTransfer} />
            <PatientSelectModal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} queue={queue} onSelect={handlePatientSelect} />
        </div>
    );
}

function BedPill({ bed, onClick }) {
    const config = getStatusConfig(bed.status);

    return (
        <motion.div
            layoutComponent
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2, scale: 1.02 }}
            onClick={onClick}
            className={clsx(
                "h-12 flex items-center px-4 rounded-full cursor-pointer transition-all border group relative",
                config.bg, config.border,
                config.pulse && "pulse-soft"
            )}
        >
            <div className={clsx("w-2 h-2 rounded-full mr-3", config.color)} />
            <span className={clsx("text-[11px] font-bold tracking-tight truncate flex-1", config.text)}>
                {bed.id}
            </span>
            {bed.status === 'Occupied' && (
                <div className="ml-2 flex gap-0.5">
                    <div className="w-0.5 h-3 bg-indigo-300 rounded-full" />
                    <div className="w-0.5 h-3 bg-indigo-300/40 rounded-full" />
                </div>
            )}

            {/* Hover Tooltip/Detail Utility */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-20">
                {bed.status} • {bed.ward}
            </div>
        </motion.div>
    );
}
