import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, User, Activity, Clock, ArrowUpRight, ShieldCheck, HeartPulse, Sparkles, ChevronRight, UserCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function PatientDirectory({ userRole }) {
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('triage');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchDirectory = () => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:5000/api/patients/directory', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPatients(data);
                } else if (data && data.error) {
                    console.error("PatientDirectory API Error:", data.error);
                }
            })
            .catch(err => console.error("PatientDirectory: Fetch failed", err));
    };

    useEffect(() => {
        fetchDirectory();
        const interval = setInterval(fetchDirectory, 30000); // Polling every 30s for directory
        return () => clearInterval(interval);
    }, []);

    const filteredPatients = useMemo(() => {
        let result = [...patients];
        if (statusFilter !== 'All') result = result.filter(p => p.status === statusFilter);
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query));
        }
        result.sort((a, b) => {
            if (sortBy === 'triage') return a.triageLevel - b.triageLevel;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'time') return new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0);
            return 0;
        });
        return result;
    }, [patients, searchQuery, sortBy, statusFilter]);

    const handleDeletePatient = async (patient) => {
        if (userRole !== 'Doctor') return alert("Only Doctors can authorize record termination.");

        // Critical ID presence check
        if (!patient || !patient.id) {
            console.error("[FRONTEND] Malformed patient object (missing ID):", patient);
            return alert("Error: Could not identify patient record. ID is missing.");
        }

        if (!confirm(`CRITICAL: Permanently purge records for ${patient.name}? This cannot be undone.`)) return;

        const url = `http://localhost:5000/api/patients/${patient.id}`;
        console.log(`[FRONTEND] Initializing purge for: ${patient.id} (Name: ${patient.name}) at ${url}`);
        console.dir(patient);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication token missing. Please log in again.");
            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            console.log(`[FRONTEND] Response received. Status: ${res.status}`);

            // Safely parse JSON or handle plain text errors
            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                data = { error: text || res.statusText };
            }

            if (res.ok) {
                console.log("[FRONTEND] Purge successful:", data);
                alert(`SUCCESS: Resident record for ${patient.name} (${patient.id}) terminated.`);
                fetchDirectory(); // Refresh list
            } else {
                console.error("[FRONTEND] Purge rejected by server:", data);
                const errorDetail = data.error || data.message || JSON.stringify(data);
                alert(`PURGE FAILED\nStatus: ${res.status} (${res.statusText})\nRemote Error: ${errorDetail}`);
            }
        } catch (err) {
            console.error("[FRONTEND] Critical network/data failure:", err);
            alert(`CRITICAL LOCAL ERROR\nMessage: ${err.message}\nAction: Check if backend is running on port 5000`);
        }
    };

    const handleSystemAudit = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/system/audit', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                console.log("[AUDIT] Full System Trace:", data);
                alert(`SYSTEM AUDIT COMPLETED\n-------------------\nTotal Active Records: ${data.totalActive}\nIn Queue: ${data.queue.length}\nAdmitted: ${data.beds.length}\n\nCheck console for detailed ID trace.`);
            } else {
                alert(`Audit Failed: ${data.error || 'Unknown Error'}`);
            }
        } catch (err) {
            console.error("[AUDIT] Failure:", err);
            alert("Critical failure during security audit.");
        }
    };

    const waitingCount = patients.filter(p => p.status === 'Waiting').length;
    const admittedCount = patients.filter(p => p.status === 'Admitted').length;

    return (
        <div className="flex flex-col h-full space-y-8 animate-fade-in">
            {/* SaaS Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        Patient Directory
                        {/* <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-lg uppercase tracking-[0.2em] shadow-lg shadow-rose-200 animate-pulse">
                            v2.4 Nuclear Purge
                        </span> */}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100">
                            <UserCheck size={14} /> Global Registry
                        </span>
                        <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest leading-none border-l border-slate-200 pl-3">
                            Facility Records • {patients.length} Registered Subjects
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* {userRole === 'Doctor' && (
                        <button
                            onClick={handleSystemAudit}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                        >
                            <ShieldCheck size={14} className="text-rose-400" />
                            Run System Audit
                        </button>
                    )} */}
                    <div className="flex gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 min-w-[120px] shadow-subtle">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">In Queue</p>
                            <p className="text-2xl font-black text-amber-500">{waitingCount}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 min-w-[120px] shadow-subtle">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Admitted</p>
                            <p className="text-2xl font-black text-indigo-600">{admittedCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registry Table Container */}
            <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-subtle flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-6">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                            {['All', 'Waiting', 'Admitted'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={clsx(
                                        "px-5 py-2 text-xs font-bold rounded-xl transition-all",
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

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-xs font-black text-slate-900 outline-none cursor-pointer uppercase tracking-tighter"
                            >
                                <option value="triage">Priority Metric</option>
                                <option value="name">Alpha A-Z</option>
                                <option value="time">Admission Chronology</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Master Records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 w-80 shadow-sm transition-all focus:w-96 placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white sticky top-0 z-10">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Patient Identifier</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Admission Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Admitting Diagnosis</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Care Severity</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Target Assignment</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            <AnimatePresence mode="popLayout">
                                {filteredPatients.map(p => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={p.id}
                                        className="hover:bg-indigo-50/30 cursor-pointer transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                                    {p.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm tracking-tight">{p.name}</p>
                                                    <p className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest mt-0.5">ID: {p.id.toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-tight flex items-center gap-1.5">
                                                <Activity size={12} className="text-green-500" /> {p.diagnosis || 'Unspecified'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <TriageIndicator level={p.triageLevel} />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{p.location}</span>
                                                {p.ward && <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1 flex items-center gap-1"><Sparkles size={10} /> {p.ward} Complex</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {userRole === 'Doctor' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeletePatient(p); }}
                                                        className="p-2.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                                                        title="Purge Record"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                                <button className="p-2.5 text-slate-300 group-hover:text-indigo-600 group-hover:bg-white rounded-xl shadow-none group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredPatients.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-slate-100 rounded-full blur-2xl scale-150 opacity-50" />
                                                <Activity size={64} className="text-slate-200 relative z-10" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-slate-400 tracking-tight">No Patient Records</p>
                                                <p className="text-xs text-slate-300 mt-1 italic uppercase tracking-widest font-bold">Try adjusting your filters or search query</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const isAdmitted = status === 'Admitted';
    return (
        <span className={clsx(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-widest shadow-sm",
            isAdmitted
                ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                : "bg-amber-50 text-amber-700 border-amber-100"
        )}>
            <div className={clsx("w-1.5 h-1.5 rounded-full", isAdmitted ? "bg-indigo-600 animate-pulse" : "bg-amber-500")} />
            {status}
        </span>
    );
}

function TriageIndicator({ level }) {
    const levels = {
        1: { color: "bg-rose-500", text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", label: "Critical" },
        2: { color: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", label: "Urgent" },
        3: { color: "bg-indigo-500", text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", label: "Stable" },
        4: { color: "bg-slate-500", text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", label: "Routine" },
        5: { color: "bg-slate-300", text: "text-slate-400", bg: "bg-slate-50", border: "border-slate-50", label: "Minor" }
    };
    const cfg = levels[level] || levels[5];

    return (
        <div className="flex items-center gap-3">
            <span className={clsx("px-3 py-1 rounded-xl text-[10px] font-bold border uppercase tracking-widest", cfg.bg, cfg.text, cfg.border)}>
                {cfg.label}
            </span>
            <div className="flex gap-0.5">
                {[5, 4, 3, 2, 1].map(i => (
                    <div key={i} className={clsx("w-1 h-3 rounded-full transition-colors", i >= level ? cfg.color : "bg-slate-100")} />
                ))}
            </div>
        </div>
    );
}
