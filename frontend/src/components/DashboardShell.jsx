import React from 'react';
import { LayoutDashboard, BedDouble, Users, Activity, LogOut, Shield, Settings, Bell } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function DashboardShell({ children, currentView, onViewChange, user, onLogout }) {
    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const NAV_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'ward', label: 'Ward Management', icon: BedDouble },
        { id: 'directory', label: 'Patient Directory', icon: Users },
    ];

    return (
        <div className="flex-1 w-full h-screen bg-green-50 overflow-hidden font-sans flex">
            {/* Sidebar Navigation - Dark SaaS Theme */}
            <aside className="w-64 bg-slate-900 flex flex-col relative z-20">
                {/* Logo Section */}
                <div className="p-8 flex items-center gap-3">
                    <div className="bg-green-600 p-2 rounded-xl shadow-lg shadow-green-900/40">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl text-white tracking-tight">MedBed<span className="text-green-400">OS</span></span>
                </div>

                {/* Primary Nav */}
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {NAV_ITEMS.map((item) => (
                        <NavItem
                            key={item.id}
                            icon={<item.icon size={20} />}
                            label={item.label}
                            active={currentView === item.id}
                            onClick={() => onViewChange && onViewChange(item.id)}
                        />
                    ))}
                </nav>

                {/* Sidebar Footer / User Profile */}
                <div className="p-4 mt-auto">
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-inner">
                                {getInitials(user?.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                                <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all text-sm font-bold group border border-slate-700"
                        >
                            <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform text-green-400" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative w-full">
                {/* Header with Search and Alerts */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-slate-900 capitalize tracking-tight">
                            {NAV_ITEMS.find(i => i.id === currentView)?.label || 'Overview'}
                        </h1>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                            LIVE SYSTEM
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            </button>
                            <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                                <Settings size={20} />
                            </button>
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-green-100 ring-4 ring-slate-50">
                                {getInitials(user?.name)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 w-full overflow-auto bg-slate-50/50">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 w-full"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                active
                    ? "bg-green-600 text-white shadow-lg shadow-green-900/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            )}>
            <div className={clsx("transition-transform duration-300 z-10", active ? "scale-110" : "group-hover:scale-110")}>
                {icon}
            </div>
            <span className="text-sm font-bold z-10">{label}</span>
            {active && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-green-600 z-0"
                />
            )}
        </button>
    );
}
