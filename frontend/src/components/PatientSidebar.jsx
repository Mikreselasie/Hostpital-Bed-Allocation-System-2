import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, User, AlertTriangle, MousePointerClick, Plus, Trash2, Clock, ArrowUpDown, UserPlus } from 'lucide-react';
import AssignmentModal from './AssignmentModal';
import AddPatientModal from './AddPatientModal';
import clsx from 'clsx';

export default function PatientSidebar({ queue, beds, onAssign, onManualAssign, onAddPatient, onRemovePatient, userRole }) {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('priority'); // 'priority', 'name', 'severity'

    const isDoctor = userRole === 'Doctor';
    const isNurse = userRole === 'Nurse';

    // Sort queue based on selected criteria
    const sortedQueue = useMemo(() => {
        const queueCopy = [...queue];

        if (sortBy === 'name') {
            return queueCopy.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'severity') {
            return queueCopy.sort((a, b) => a.triageLevel - b.triageLevel);
        } else {
            // Default: priority (already sorted by backend)
            return queueCopy;
        }
    }, [queue, sortBy]);

    const handleManualClick = (patient) => {
        if (!isDoctor) {
            alert("Only Doctors can authorize bed assignments.");
            return;
        }
        setSelectedPatient(patient);
        setIsAssignmentModalOpen(true);
    };

    const handleSmartClick = (patient) => {
        if (!isDoctor) {
            alert("Only Doctors can authorize bed assignments.");
            return;
        }
        onAssign(patient);
    };

    const handleAssignConfirm = (patient, bedId) => {
        onManualAssign(patient, bedId);
    };

    return (
        <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col h-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-bold text-slate-800 text-lg">ER Queue</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admissions Manager</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-red-100">{queue.length}</span>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                        title="Add Patient to Queue"
                    >
                        <UserPlus size={18} />
                    </button>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                <ArrowUpDown size={14} className="text-slate-400" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sort:</span>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                    <option value="priority">Priority Logic</option>
                    <option value="name">Patient Name</option>
                    <option value="severity">Triage Severity</option>
                </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                <AnimatePresence>
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
                {queue.length === 0 && (
                    <div className="text-center py-16 text-slate-300 flex flex-col items-center gap-4">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <User size={32} className="opacity-10" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest italic">No Patients Pending</p>
                    </div>
                )}
            </div>

            {/* Status Footer */}
            <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Live System Active
                </div>
            </div>

            <AssignmentModal
                isOpen={isAssignmentModalOpen}
                onClose={() => setIsAssignmentModalOpen(false)}
                patient={selectedPatient}
                beds={beds}
                onAssign={handleAssignConfirm}
            />

            <AddPatientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={onAddPatient}
            />
        </div>
    );
}

function PatientCard({ patient, onAssign, onManualAssign, onRemove, isDoctor }) {
    const [waitTime, setWaitTime] = useState(calculateWaitTime(patient.joinedAt));

    useEffect(() => {
        const interval = setInterval(() => {
            setWaitTime(calculateWaitTime(patient.joinedAt));
        }, 60000);
        return () => clearInterval(interval);
    }, [patient.joinedAt]);

    function calculateWaitTime(joinedAt) {
        if (!joinedAt) return '0m';
        const diff = Date.now() - new Date(joinedAt).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        if (hrs > 0) return `${hrs}h ${mins % 60}m`;
        return `${mins}m`;
    }

    const getBadgeStyle = (level) => {
        if (level === 1) return "bg-red-50 text-red-600 border-red-100";
        if (level <= 3) return "bg-orange-50 text-orange-600 border-orange-100";
        return "bg-blue-50 text-blue-600 border-blue-100";
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={clsx("w-1 h-8 rounded-full",
                        patient.triageLevel === 1 ? "bg-red-500" : patient.triageLevel <= 3 ? "bg-orange-400" : "bg-blue-400"
                    )} />
                    <div>
                        <span className="font-bold text-slate-800 block text-sm">{patient.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock size={10} className="text-slate-400" />
                            <span className="text-[10px] text-slate-400 font-bold tracking-tight">{waitTime} waiting</span>
                        </div>
                    </div>
                </div>

                <div className={clsx("px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider", getBadgeStyle(patient.triageLevel))}>
                    L{patient.triageLevel}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                    onClick={onAssign}
                    className={clsx(
                        "py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5",
                        isDoctor
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            : "bg-slate-50 text-slate-300 cursor-not-allowed"
                    )}
                >
                    <ArrowLeftRight size={12} />
                    Auto
                </button>
                <button
                    onClick={onManualAssign}
                    className={clsx(
                        "py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5",
                        isDoctor
                            ? "bg-slate-800 text-white hover:bg-slate-900"
                            : "bg-slate-50 text-slate-300 cursor-not-allowed"
                    )}
                >
                    <MousePointerClick size={12} />
                    Assign
                </button>
            </div>

            {isDoctor && (
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Remove from Queue"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </motion.div>
    );
}
