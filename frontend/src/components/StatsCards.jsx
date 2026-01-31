import React from 'react';
import { Users, Bed, Clock, AlertCircle, TrendingUp, Activity, ShieldCheck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsCards({ beds = [], queue = [] }) {
    // Ensure we are working with arrays to prevent .filter crashes
    const safeBeds = Array.isArray(beds) ? beds : [];
    const safeQueue = Array.isArray(queue) ? queue : [];

    const totalBeds = safeBeds.length || 0;
    const occupied = safeBeds.filter(b => b.status === 'Occupied').length;
    const available = safeBeds.filter(b => b.status === 'Available').length;
    const cleaning = safeBeds.filter(b => b.status === 'Cleaning').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto lg:h-[320px] mb-8">
            {/* Primary Stat: Occupancy (Double Wide) */}
            <div className="md:col-span-2 row-span-2 bento-card p-8 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity size={120} className="text-indigo-600" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Facility Load</span>
                    </div>
                    <h3 className="text-6xl font-bold text-slate-900 tracking-tighter mb-2">{occupancyRate}%</h3>
                    <p className="text-lg font-bold text-slate-500">Resource Occupancy Rate</p>
                </div>
                <div className="flex items-end justify-between pt-8 border-t border-slate-100">
                    <div className="flex gap-4">
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{occupied}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{totalBeds}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold ring-1 ring-indigo-100">
                        <TrendingUp size={14} />
                        <span>High Efficiency</span>
                    </div>
                </div>
            </div>

            {/* Available Stat */}
            <div className="bento-card p-6 flex flex-col justify-between bg-indigo-600 border-none shadow-xl shadow-indigo-100">
                <div className="p-3 bg-white/20 rounded-xl w-fit text-white backdrop-blur-md">
                    <Bed size={20} />
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-white tracking-tight">{available}</h3>
                    <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mt-1">Available Units</p>
                </div>
            </div>

            {/* Queue Count */}
            <div className="bento-card p-6 flex flex-col justify-between hover:border-indigo-200">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-slate-50 rounded-xl w-fit text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <Users size={20} />
                    </div>
                    {queue.length > 5 && (
                        <div className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100 uppercase tracking-tighter">Action Required</div>
                    )}
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{queue.length}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Waiting Admission</p>
                </div>
            </div>

            {/* Maintenance/Cleaning */}
            <div className="md:col-span-2 bento-card p-6 flex items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-slate-800">{cleaning}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Sanitation</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-slate-800">100%</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Health</p>
                    </div>
                </div>
                <div className="hidden lg:block">
                    <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                        View Log
                    </button>
                </div>
            </div>
        </div>
    );
}
