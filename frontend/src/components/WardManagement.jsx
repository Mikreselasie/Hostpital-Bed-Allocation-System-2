import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowLeftRight, UserMinus, User, Activity, Clock, MoreHorizontal, X, Plus, Trash2, ClipboardCheck, HeartPulse, ShieldCheck, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import TransferModal from './TransferModal';

const WARDS = ['ICU', 'Cardiology', 'General', 'Pediatrics'];

const STATUS_CONFIG = {
    'Available': { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    'Occupied': { dot: 'bg-indigo-600', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    'Cleaning': { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-100' },
    'Maintenance': { dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-100' },
    'Damaged': { dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-100' },
    'Unknown': { dot: 'bg-slate-300', badge: 'bg-slate-50 text-slate-400 border-slate-100' }
};

const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG['Unknown'];

export default function WardManagement({ beds, userRole }) {
    const [selectedWard, setSelectedWard] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBed, setSelectedBed] = useState(null);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [transferSourceBed, setTransferSourceBed] = useState(null);
    const [isAddBedOpen, setIsAddBedOpen] = useState(false);

    const isDoctor = userRole === 'Doctor';
    const isNurse = userRole === 'Nurse';

    const wardRows = useMemo(() => {
        const safeBeds = Array.isArray(beds) ? beds : [];
        let filtered = safeBeds;
        if (selectedWard !== 'All') filtered = filtered.filter(b => b.ward === selectedWard);
        if (statusFilter !== 'All') filtered = filtered.filter(b => b.status === statusFilter);
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(b =>
                b.id.toLowerCase().includes(query) ||
                (b.status === 'Occupied' && b.patient?.name.toLowerCase().includes(query))
            );
        }
        return filtered;
    }, [beds, selectedWard, statusFilter, searchQuery]);

    const handleDischarge = async (bed) => {
        if (!isDoctor) return alert("Only Doctors can authorize discharge.");
        if (!confirm(`Discharge patient from ${bed.id}?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/beds/${bed.id}/discharge`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                alert(`Patient discharged. Bed ${bed.id} is now cleaning.`);
                setSelectedBed(null);
            }
        } catch (err) { alert("Error discharging patient"); }
    };

    const handleStatusUpdate = async (bedId, newStatus) => {
        if (!isDoctor) return alert("Only Doctors can authorize status changes.");
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/beds/${bedId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (res.ok) {
                // The bed will update via socket.io, but we can update local selectedBed state
                if (selectedBed && selectedBed.id === bedId) {
                    setSelectedBed({ ...selectedBed, status: newStatus });
                }
            } else {
                alert(`Update Failed: ${data.error}`);
            }
        } catch (err) { alert("Error updating status"); }
    };

    const handleDeleteBed = async (bedId) => {
        if (!isDoctor) return alert("Only Doctors can authorize resource termination.");
        if (!confirm(`CRITICAL: Permanently terminate resource ${bedId}? This cannot be undone.`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/beds/${bedId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Resource ${bedId} terminated.`);
                setSelectedBed(null);
            } else {
                alert(`Termination Failed: ${data.error}`);
            }
        } catch (err) { alert("Error deleting bed"); }
    };

    const handleAddBed = async (ward) => {
        if (!isDoctor) return alert("Only Doctors can add beds.");
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/beds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ward })
            });
            const data = await res.json();
            if (data.success) alert(`New bed added to ${ward}: ${data.bed.id}`);
        } catch (err) { alert("Error adding bed"); }
    };

    const occupancyRate = useMemo(() => {
        if (beds.length === 0) return 0;
        const occupied = beds.filter(b => b.status === 'Occupied').length;
        return Math.round((occupied / beds.length) * 100);
    }, [beds]);

    return (
        <div className="flex flex-col h-full space-y-8 animate-fade-in">
            {/* SaaS Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ward Management</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100">
                            <ShieldCheck size={14} /> System Verified
                        </span>
                        <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest leading-none border-l border-slate-200 pl-3">
                            Facility Registry • {beds.length} Total Resources
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 min-w-[120px] shadow-subtle">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Load Factor</p>
                            <p className="text-2xl font-black text-slate-900">{occupancyRate}%</p>
                        </div>
                    </div>
                    {isDoctor && (
                        <div className="relative">
                            <button
                                onClick={() => setIsAddBedOpen(!isAddBedOpen)}
                                className="flex items-center gap-3 bg-green-600 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                <Plus size={20} /> Register Unit
                            </button>
                            {isAddBedOpen && (
                                <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 z-50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-3 border-b border-slate-50 mb-2">Target Ward</p>
                                    {WARDS.map(w => (
                                        <button
                                            key={w}
                                            onClick={() => { handleAddBed(w); setIsAddBedOpen(false); }}
                                            className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between group"
                                        >
                                            {w}
                                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* High-Density Registry Table */}
            <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-subtle flex flex-col overflow-hidden relative">
                {/* Registry Toolbar */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-6">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto scrollbar-hide max-w-xl">
                            {['All', 'Occupied', 'Available', 'Cleaning', 'Maintenance', 'Damaged'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={clsx(
                                        "px-4 py-2 text-[10px] font-bold rounded-xl transition-all whitespace-nowrap uppercase tracking-widest",
                                        statusFilter === filter
                                            ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-slate-200"></div>

                        <select
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                        >
                            <option value="All">All Facilities</option>
                            {WARDS.map(w => <option key={w} value={w}>{w} Unit</option>)}
                        </select>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find Patient or Resource..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 w-80 shadow-sm transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* High-Density Content */}
                <div className="flex-1 overflow-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white sticky top-0 z-10">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 italic">Reference</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Subject Identity</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Resource Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Care Priority</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Allocation</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {wardRows.map((bed) => (
                                <tr
                                    key={bed.id}
                                    onClick={() => setSelectedBed(bed)}
                                    className="hover:bg-indigo-50/30 cursor-pointer transition-all group"
                                >
                                    <td className="px-8 py-5 font-mono text-xs font-black text-indigo-400 uppercase tracking-tighter">{bed.id}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx("w-1.5 h-1.5 rounded-full shadow-sm", getStatusConfig(bed.status).dot)} />
                                            <span className="text-sm font-bold text-slate-800 tracking-tight">
                                                {bed.status === 'Occupied' ? (bed.patient?.name || 'Authorized Patient') : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={clsx("px-3 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-wider", getStatusConfig(bed.status).badge)}>
                                            {bed.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        {bed.status === 'Occupied' && bed.type === 'Critical' ? (
                                            <span className="text-rose-600 flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter">
                                                <Activity size={14} className="animate-pulse" /> Critical Path
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs font-bold uppercase tracking-tighter">— Standard —</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-500">{bed.ward}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2.5 text-slate-300 group-hover:text-indigo-600 group-hover:bg-white rounded-xl shadow-none group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {wardRows.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-300">
                                            <Activity size={48} className="opacity-10" />
                                            <p className="text-sm font-bold uppercase tracking-widest italic">Registry Empty Under Current Filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Detail Management Drawer */}
            <AnimatePresence>
                {selectedBed && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setSelectedBed(null)}
                    >
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            className="w-[500px] bg-white h-full shadow-2xl p-12 flex flex-col border-l border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Resource Summary</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedBed.id} Management Console</p>
                                </div>
                                <button onClick={() => setSelectedBed(null)} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-10 overflow-y-auto pr-2 scrollbar-thin">
                                <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx("w-3 h-3 rounded-full", getStatusConfig(selectedBed.status).dot)} />
                                        <span className="text-lg font-bold text-slate-800 tracking-tight">{selectedBed.status} Mode</span>
                                    </div>
                                    <span className="text-[10px] font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-400 uppercase tracking-widest">Global Status</span>
                                </div>

                                {selectedBed.status === 'Occupied' && (
                                    <div className="space-y-6">
                                        <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-100">
                                            <div className="flex items-center gap-3 mb-4 text-indigo-100">
                                                <User size={18} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Active Patient Profile</span>
                                            </div>
                                            <p className="text-3xl font-black tracking-tight">{selectedBed.patient?.name || 'Subject'}</p>
                                            <div className="mt-8 flex gap-6 border-t border-white/10 pt-6">
                                                <div>
                                                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Observation</p>
                                                    <p className="text-sm font-bold">Stable Monitoring</p>
                                                </div>
                                                <div className="w-px h-8 bg-white/10" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Allocated Unit</p>
                                                    <p className="text-sm font-bold font-mono">{selectedBed.ward}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bento-card p-6 border-slate-100 bg-white">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-black">Pulse Oximetry</p>
                                                <div className="flex items-end gap-2 text-rose-500 transition-all hover:scale-105 origin-left cursor-default">
                                                    <p className="text-3xl font-black leading-none">98</p>
                                                    <p className="text-[11px] font-bold mb-1 uppercase tracking-tighter font-black">% SpO2</p>
                                                </div>
                                            </div>
                                            <div className="bento-card p-6 border-slate-100 bg-white">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-black">Cardiac Rhythm</p>
                                                <div className="flex items-end gap-2 text-indigo-600 transition-all hover:scale-105 origin-left cursor-default">
                                                    <p className="text-3xl font-black leading-none">74</p>
                                                    <p className="text-[11px] font-bold mb-1 uppercase tracking-tighter font-black">BPM</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] px-2 mb-4">Lifecycle Directives</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Available', 'Cleaning', 'Maintenance', 'Damaged'].map(st => (
                                            <button
                                                key={st}
                                                disabled={!isDoctor || selectedBed.status === 'Occupied'}
                                                onClick={() => handleStatusUpdate(selectedBed.id, st)}
                                                className={clsx(
                                                    "p-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.1em] border transition-all active:scale-95",
                                                    selectedBed.status === st
                                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                                                        : "bg-white text-slate-600 border-slate-100 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                                )}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-slate-100 bg-white space-y-4 mt-8">
                                {selectedBed.status === 'Occupied' ? (
                                    <>
                                        {isNurse && (
                                            <button className="w-full py-5 bg-indigo-600 text-white font-bold rounded-3xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 active:scale-95">
                                                <ClipboardCheck size={22} /> Push Telemetry Update
                                            </button>
                                        )}
                                        {isDoctor && (
                                            <>
                                                <button onClick={() => handleDischarge(selectedBed)} className="w-full py-5 bg-slate-900 text-white font-bold rounded-3xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95">
                                                    <UserMinus size={22} /> Finalize Discharge
                                                </button>
                                                <button className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-all underline underline-offset-8">
                                                    Escalate Care Plan
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    isDoctor && (
                                        <button
                                            onClick={() => handleDeleteBed(selectedBed.id)}
                                            className="w-full py-5 border-2 border-rose-50 text-rose-500 font-bold rounded-3xl hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                                        >
                                            <Trash2 size={22} /> Terminate Resource ID
                                        </button>
                                    )
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} sourceBed={transferSourceBed} beds={beds} onTransfer={alert} />
        </div>
    );
}
