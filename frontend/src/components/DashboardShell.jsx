import React from 'react';
import { LayoutDashboard, BedDouble, Users, Activity, LogOut, Shield } from 'lucide-react';
import clsx from 'clsx';

export default function DashboardShell({ children, currentView, onViewChange, user, onLogout }) {
    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="flex h-screen bg-medical-50 overflow-hidden flex-row flex-1">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 transition-all">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-md shadow-blue-100">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl text-slate-800 tracking-tight">MedBed<span className="text-blue-600">OS</span></span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={currentView === 'dashboard'}
                        onClick={() => onViewChange && onViewChange('dashboard')}
                    />
                    <NavItem
                        icon={<BedDouble size={20} />}
                        label="Ward Management"
                        active={currentView === 'ward'}
                        onClick={() => onViewChange && onViewChange('ward')}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="Patient Queue"
                        active={currentView === 'directory'}
                        onClick={() => onViewChange && onViewChange('directory')}
                    />
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-3">
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {getInitials(user?.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{user?.role}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-bold group"
                    >
                        <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        <span>Sign Out</span>
                    </button>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Shield size={10} className="text-green-600" /> Secure Mode
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-[11px] text-slate-700 font-bold">Encrypted Session</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative w-full">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm w-full">
                    <h1 className="text-xl font-bold text-slate-800">
                        {currentView === 'dashboard' ? 'ICU / General Ward Overview' :
                            currentView === 'ward' ? 'Ward Management Console' :
                                'Patient Directory'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user?.role}</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
                            {getInitials(user?.name)}
                        </div>
                    </div>
                </header>

                {/* Scrollable Canvas */}
                <div className="flex-1 overflow-auto p-8 relative">
                    {children}
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-bold",
                active
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}>
            <div className={clsx("transition-transform group-hover:scale-110", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")}>
                {icon}
            </div>
            <span>{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />}
        </button>
    );
}
