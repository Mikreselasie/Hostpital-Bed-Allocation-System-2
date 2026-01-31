import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowLeftRight, User, AlertTriangle, MousePointerClick, Plus, Trash2, Clock, ArrowUpDown, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import AssignmentModal from './AssignmentModal';
import AddPatientModal from './AddPatientModal';
import clsx from 'clsx';

export default function PatientSidebar({ queue, beds, onAssign, onManualAssign, onAddPatient, onRemovePatient, userRole }) {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('priority');

    const isDoctor = userRole === 'Doctor';

    const sortedQueue = useMemo(() => {
        const safeQueue = Array.isArray(queue) ? queue : [];
        const queueCopy = [...safeQueue];
        if (sortBy === 'name') return queueCopy.sort((a, b) => a.name.localeCompare(b.name));
        if (sortBy === 'severity') return queueCopy.sort((a, b) => a.triageLevel - b.triageLevel);
        return queueCopy;
    }, [queue, sortBy]);

    const handleManualClick = (patient) => {
        if (!isDoctor) return alert("Only Doctors can authorize bed assignments.");
        setSelectedPatient(patient);
        setIsAssignmentModalOpen(true);
    };

    const handleSmartClick = (patient) => {
        if (!isDoctor) return alert("Only Doctors can authorize bed assignments.");
        onAssign(patient);
    };

    return (
        <div className="w-[340px] bg-white border-l border-slate-200 p-8 flex flex-col h-full shadow-2xl relative z-10">
            {/* Header: SaaS 2.0 Style */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={14} className="text-green-500" />
                        <h2 className="font-bold text-slate-900 text-lg tracking-tight">ER Admissions</h2>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Triage Registry</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-green-600 text-white p-2.5 rounded-2xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-90"
                        title="Quick Registration"
                    >
                        <UserPlus size={20} />
                    </button>
                </div>
            </div>

            {/* Live Queue Counter */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-600 p-2 rounded-xl">
                        <User size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue Density</p>
                        <p className="text-sm font-bold text-slate-800">{queue.length} Patients Waiting</p>
                    </div>
                </div>
                <div className={clsx("w-2 h-2 rounded-full", queue.length > 5 ? "bg-rose-500 animate-pulse" : "bg-emerald-500")} />
            </div>

            {/* Sort Controls: Clean & Discrete */}
            <div className="mb-6 flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-100" />
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full">
                    <ArrowUpDown size={12} className="text-slate-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-transparent outline-none cursor-pointer"
                    >
                        <option value="priority">Priority</option>
                        <option value="name">A-Z Name</option>
                        <option value="severity">Severity</option>
                    </select>
                </div>
                <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Scrollable Queue Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 -mr-1 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                    {sortedQueue.map((patient) => (
                        <PatientCard
                            key={patient.id}
                            patient={patient}
                            onAssign={() => handleSmartClick(patient)}
                            onManualAssign={() => handleManualClick(patient)}
                            onRemove={() => onRemovePatient(patient.id)}
                            isDoctor={isDoctor}
                        />
                    ))}
                </AnimatePresence>

                {/* Premium Empty State */}
                {queue.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 px-4 flex flex-col items-center gap-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-50 rounded-full blur-2xl scale-150 opacity-50" />
                            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl relative z-10">
                                <CheckCircle2 size={48} className="text-emerald-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">All caught up!</h3>
                            <p className="text-xs font-medium text-slate-400 mt-2 leading-relaxed max-w-[180px] mx-auto italic">
                                The emergency queue is currently empty. Great job, team!
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="mt-4 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-2xl hover:border-green-200 hover:text-green-600 transition-all active:scale-95 shadow-subtle"
                        >
                            Register New Patient
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Sticky Footer Action */}
            <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] text-center mb-4">Registry Integrity Ver 1.4</p>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest italic">Encrypted Bio-Sync Active</span>
                </div>
            </div>

            <AssignmentModal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} patient={selectedPatient} beds={beds} onAssign={onManualAssign} />
            <AddPatientModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={onAddPatient} />
        </div>
    );
}

function PatientCard({ patient, onAssign, onManualAssign, onRemove, isDoctor }) {
    const [waitTime, setWaitTime] = useState(calculateWaitTime(patient.joinedAt));

    useEffect(() => {
        const interval = setInterval(() => setWaitTime(calculateWaitTime(patient.joinedAt)), 60000);
        return () => clearInterval(interval);
    }, [patient.joinedAt]);

    function calculateWaitTime(joinedAt) {
        if (!joinedAt) return '0m';
        const diff = Date.now() - new Date(joinedAt).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
    }

    const triageStyles = {
        1: "bg-rose-50 text-rose-600 border-rose-100",
        2: "bg-amber-50 text-amber-600 border-amber-100",
        3: "bg-green-50 text-green-600 border-green-100",
        4: "bg-slate-50 text-slate-600 border-slate-100",
        5: "bg-slate-50 text-slate-400 border-slate-50"
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="p-5 rounded-3xl border border-slate-100 bg-white hover:border-green-200 transition-all shadow-subtle hover:shadow-xl hover:shadow-indigo-50/50 group relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className={clsx("w-1.5 h-10 rounded-full",
                        patient.triageLevel === 1 ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" :
                            patient.triageLevel <= 3 ? "bg-amber-400" : "bg-indigo-400"
                    )} />
                    <div>
                        <span className="font-bold text-slate-900 block text-sm tracking-tight">{patient.name}</span>
                        {patient.diagnosis && (
                            <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                                <Activity size={10} strokeWidth={3} /> {patient.diagnosis}
                            </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock size={12} className="text-slate-300" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{waitTime} in queue</span>
                        </div>
                    </div>
                </div>

                <div className={clsx("px-2.5 py-1 rounded-xl text-[10px] font-bold border uppercase tracking-wider", triageStyles[patient.triageLevel])}>
                    L{patient.triageLevel}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6">
                <button
                    onClick={onAssign}
                    className={clsx(
                        "py-3 rounded-2xl text-[10px] font-bold transition-all flex items-center justify-center gap-2",
                        isDoctor
                            ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                            : "bg-slate-50 text-slate-300 cursor-not-allowed"
                    )}
                >
                    <Activity size={12} />
                    Auto-Assign
                </button>
                <button
                    onClick={onManualAssign}
                    className={clsx(
                        "py-3 rounded-2xl text-[10px] font-bold transition-all flex items-center justify-center gap-2",
                        isDoctor
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : "bg-slate-50 text-slate-300 cursor-not-allowed"
                    )}
                >
                    <MousePointerClick size={12} />
                    Manual
                </button>
            </div>

            {isDoctor && (
                <button
                    onClick={onRemove}
                    className="absolute top-3 right-3 p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Remove from Queue"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </motion.div>
    );
}
