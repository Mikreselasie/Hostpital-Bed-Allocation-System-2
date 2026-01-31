import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, User, Activity, Clock, ArrowUpRight, ShieldCheck, HeartPulse } from 'lucide-react';
import clsx from 'clsx';

export default function PatientDirectory({ userRole }) {
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('triage'); // 'triage', 'name', 'time'
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Waiting', 'Admitted'

    const fetchDirectory = () => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:5000/api/patients/directory', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (res.status === 401) return; // Silent fail for simplicity or redirect
                return res.json();
            })
            .then(data => {
                if (data) setPatients(data);
            })
            .catch(err => console.error("PatientDirectory: Fetch failed", err));
    };

    // Fetch Directory Data
    useEffect(() => {
        fetchDirectory();
        // Poll for updates every 10s
        const interval = setInterval(fetchDirectory, 10000);
        return () => clearInterval(interval);
    }, []);

    // Derived Data
    const filteredPatients = useMemo(() => {
        let result = [...patients];

        // Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(p => p.status === statusFilter);
        }

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.id.toLowerCase().includes(query)
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'triage') {
                return a.triageLevel - b.triageLevel;
            } else if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'time') {
                return new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0);
            }
            return 0;
        });

        return result;
    }, [patients, searchQuery, sortBy, statusFilter]);

    // Calculate stats
    const waitingCount = patients.filter(p => p.status === 'Waiting').length;
    const admittedCount = patients.filter(p => p.status === 'Admitted').length;

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header Controls */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Patient Directory</h2>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <ShieldCheck size={14} className="text-green-500" />
                        Master Registry • Authoritative Patient Records
                    </p>
                </div>

                <div className="flex gap-3">
                    <StatCard label="Total" value={patients.length} color="slate" />
                    <StatCard label="Waiting" value={waitingCount} color="amber" />
                    <StatCard label="Admitted" value={admittedCount} color="green" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex gap-4 items-center">
                        {/* Status Filter Chips */}
                        <div className="flex p-1 bg-slate-100 rounded-xl">
                            {['All', 'Waiting', 'Admitted'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={clsx(
                                        "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                                        statusFilter === filter
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-slate-200"></div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-white border border-slate-200 text-xs font-bold py-2 px-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                            >
                                <option value="triage">Priority (Triage)</option>
                                <option value="name">Patient Name</option>
                                <option value="time">Admission Time</option>
                            </select>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find Patient or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72 shadow-sm transition-all focus:w-80"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Patient Identity</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Triage Profile</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Facility Location</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredPatients.map(p => (
                                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                {p.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                                                <p className="text-[10px] font-mono text-slate-400 font-medium">#{p.id.toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge status={p.status} />
                                    </td>
                                    <td className="px-8 py-6">
                                        <TriageBadge level={p.triageLevel} />
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{p.location}</span>
                                            {p.ward && <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">{p.ward} Unit</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                            <ArrowUpRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredPatients.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-50 rounded-full">
                                                <Search size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-medium italic">No registry matches found.</p>
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

function StatCard({ label, value, color }) {
    const colors = {
        slate: "text-slate-800",
        amber: "text-amber-600",
        green: "text-green-600"
    };
    return (
        <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center min-w-[100px]">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-tight">{label}</p>
            <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
        </div>
    );
}

function StatusBadge({ status }) {
    if (status === 'Admitted') {
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wider">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            Admitted
        </span>
    }
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
        <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
        Waiting
    </span>
}

function TriageBadge({ level }) {
    const styles = {
        1: "bg-red-50 text-red-700 border-red-100",
        2: "bg-orange-50 text-orange-700 border-orange-100",
        3: "bg-yellow-50 text-yellow-700 border-yellow-100",
        4: "bg-blue-50 text-blue-700 border-blue-100",
        5: "bg-slate-50 text-slate-700 border-slate-100"
    };

    return (
        <div className="flex items-center gap-2">
            <span className={clsx("px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider", styles[level] || styles[5])}>
                Priority L{level}
            </span>
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={clsx("w-1 h-3 rounded-full", i <= (6 - level) ? "bg-slate-300" : "bg-slate-100")} />
                ))}
            </div>
        </div>
    );
}
