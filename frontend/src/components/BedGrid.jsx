import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ArrowRight, HeartPulse, ClipboardCheck } from 'lucide-react';
import clsx from 'clsx';
import TransferModal from './TransferModal';
import PatientSelectModal from './PatientSelectModal';

const STATUS_COLORS = {
    'Available': 'bg-status-available',
    'Occupied': 'bg-status-occupied',
    'Cleaning': 'bg-status-cleaning',
    'Reserved': 'bg-status-reserved'
};

const WARD_FILTERS = ['All', 'ICU', 'Cardiology', 'General', 'Pediatrics'];
const STATUS_FILTERS = ['All', 'Available', 'Occupied', 'Cleaning'];

export default function BedGrid({ beds, queue, onAssign, onTransfer, userRole }) {
    const [selectedWard, setSelectedWard] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [search, setSearch] = useState('');
    const [activeBed, setActiveBed] = useState(null);

    // Transfer & Assign Logic State
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    const filteredBeds = beds.filter(bed => {
        const matchesWard = selectedWard === 'All' || bed.ward === selectedWard;
        const matchesStatus = selectedStatus === 'All' || bed.status === selectedStatus;
        const matchesSearch = bed.id.toLowerCase().includes(search.toLowerCase());
        return matchesWard && matchesStatus && matchesSearch;
    });

    const isDoctor = userRole === 'Doctor';
    const isNurse = userRole === 'Nurse';

    const handleTransferClick = () => {
        if (!isDoctor) {
            alert("Only Doctors can authorize patient transfers.");
            return;
        }
        if (activeBed && activeBed.status === 'Occupied') {
            setIsTransferOpen(true);
        } else {
            alert("Only Occupied beds can transfer patients.");
        }
    };

    const handleAssignClick = () => {
        if (!isDoctor) {
            alert("Only Doctors can authorize new bed assignments.");
            return;
        }
        if (activeBed && activeBed.status === 'Available') {
            setIsAssignOpen(true);
        }
    };

    const handleUpdateVitals = () => {
        alert(`Vitals update triggered for Patient in ${activeBed.id}. Nurse ${userRole} is monitoring.`);
    };

    const handlePatientSelect = (patient) => {
        if (activeBed) {
            onAssign(patient, activeBed.id);
            setIsAssignOpen(false);
            setActiveBed(null);
        }
    };

    const executeTransfer = async (source, target) => {
        const success = await onTransfer(source.id, target.id);
        if (success) {
            setActiveBed(null);
            setIsTransferOpen(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full flex-1 shadow-sm min-h-[500px]">
            {/* Header & Controls */}
            <div className="flex flex-col space-y-4 mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-800">Live Ward Map</h2>
                        {isNurse && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-100 italic">
                                Monitoring View
                            </span>
                        )}
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Bed ID..."
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Ward Filter Pills */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {WARD_FILTERS.map(ward => (
                            <button
                                key={ward}
                                onClick={() => setSelectedWard(ward)}
                                className={clsx(
                                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                                    selectedWard === ward ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {ward}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-2"></div>

                    {/* Status Filter Chips */}
                    <div className="flex gap-2">
                        {STATUS_FILTERS.map(status => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={clsx(
                                    "px-3 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center gap-2",
                                    selectedStatus === status
                                        ? "bg-slate-800 text-white border-slate-800"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                )}
                            >
                                {status !== 'All' && <div className={clsx("w-2 h-2 rounded-full", STATUS_COLORS[status])} />}
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <AnimatePresence>
                    {filteredBeds.map((bed) => (
                        <BedCard key={bed.id} bed={bed} onClick={() => setActiveBed(bed)} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Detail Drawer */}
            <AnimatePresence>
                {activeBed && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm"
                        onClick={() => setActiveBed(null)}
                    >
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            className="w-96 bg-white h-full shadow-2xl p-8 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-800">{activeBed.id}</h3>
                                <button onClick={() => setActiveBed(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status</label>
                                    <div className={clsx("mt-1.5 px-3 py-1 rounded-lg text-white text-xs font-bold inline-block", STATUS_COLORS[activeBed.status])}>
                                        {activeBed.status}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ward Location</label>
                                    <p className="text-lg font-bold text-slate-700">{activeBed.ward}</p>
                                </div>

                                {activeBed.status === 'Occupied' && (
                                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                                        <div className="flex items-center gap-3 mb-3 text-blue-600">
                                            <HeartPulse size={18} />
                                            <label className="text-[10px] font-bold uppercase tracking-widest">Patient Details</label>
                                        </div>
                                        <p className="text-xl font-bold text-slate-800">
                                            {activeBed.patient ? activeBed.patient.name : 'Unknown'}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium mt-1">
                                            {activeBed.patient && activeBed.patient.joinedAt
                                                ? `Admitted: ${new Date(activeBed.patient.joinedAt).toLocaleTimeString()}`
                                                : 'No admission time'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions Component Based on Role */}
                            <div className="pt-6 border-t border-slate-100 space-y-3">
                                {activeBed.status === 'Occupied' ? (
                                    <>
                                        {isNurse && (
                                            <button
                                                onClick={handleUpdateVitals}
                                                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                                            >
                                                <ClipboardCheck size={18} /> Update Vitals
                                            </button>
                                        )}
                                        {isDoctor && (
                                            <button
                                                onClick={handleTransferClick}
                                                className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                                            >
                                                <ArrowRight size={18} /> Transfer Patient
                                            </button>
                                        )}
                                        {!isDoctor && !isNurse && (
                                            <p className="text-center text-xs text-slate-400 italic">No authorized actions</p>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={handleAssignClick}
                                        disabled={activeBed.status !== 'Available' || !isDoctor}
                                        className={clsx(
                                            "w-full py-3.5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2",
                                            activeBed.status === 'Available'
                                                ? isDoctor
                                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                : "bg-slate-50 text-slate-300 cursor-not-allowed"
                                        )}
                                    >
                                        {activeBed.status === 'Available'
                                            ? isDoctor ? 'Assign Patient' : 'Assign (Doctor Only)'
                                            : 'Bed Not Available'
                                        }
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transfer Modal */}
            <TransferModal
                isOpen={isTransferOpen}
                onClose={() => setIsTransferOpen(false)}
                sourceBed={activeBed}
                beds={beds}
                onTransfer={executeTransfer}
            />

            {/* Patient Select Modal */}
            <PatientSelectModal
                isOpen={isAssignOpen}
                onClose={() => setIsAssignOpen(false)}
                queue={queue}
                onSelect={handlePatientSelect}
            />
        </div>
    );
}

function BedCard({ bed, onClick }) {
    // Small helper for initials
    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -4, shadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
            onClick={onClick}
            className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer relative overflow-hidden group min-h-[100px]"
        >
            <div className={clsx("absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full transition-colors duration-300", STATUS_COLORS[bed.status])} />

            <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-bold text-slate-400">{bed.id}</span>
                <div className={clsx("w-2 h-2 rounded-full", STATUS_COLORS[bed.status])} />
            </div>

            <div className="mb-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{bed.ward}</p>
                <div className="mt-1 h-6">
                    {bed.status === 'Occupied' ? (
                        <span className="font-bold text-slate-800">
                            {bed.patient ? getInitials(bed.patient.name) : '??'}
                        </span>
                    ) : (
                        <span className="text-xs text-slate-300 italic">Empty</span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
