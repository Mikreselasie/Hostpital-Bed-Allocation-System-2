import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Activity, ShieldCheck, ArrowRight, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onLogin(data.token, data.user);
            } else {
                setError(data.error || 'Invalid credentials. Please contact administration.');
            }
        } catch (err) {
            setError('System unreachable. Please check your network connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex overflow-hidden">
            {/* Left Side: Form */}
            <div className="w-full lg:w-[450px] flex flex-col p-8 md:p-12 xl:p-16">
                <div className="flex items-center gap-3 mb-16">
                    <div className="bg-green-600 p-2 rounded-xl shadow-lg shadow-green-100">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl text-slate-900 tracking-tight">MedBed<span className="text-green-600">OS</span></span>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Welcome back</h2>
                        <p className="text-slate-500 font-medium mb-10">Care providers secure authentication portal.</p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3"
                            >
                                <div className="p-1 bg-rose-100 rounded-full"><ShieldCheck size={14} /></div>
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Staff ID</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                        placeholder="e.g. nurse_01"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Access Token</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Checking registry...
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>

                <div className="mt-auto pt-8 flex flex-col gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800">Secure Environment</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active Encryption Enabled</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center">
                        Health Systems Governance Ver 2.4
                    </p>
                </div>
            </div>

            {/* Right Side: Visual Accent */}
            <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-600/40 to-slate-900 z-10" />

                {/* Abstract Pattern Backdrop */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 z-0" />

                {/* Animated Medical Element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.15, scale: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    className="absolute -right-20 -bottom-20 w-[600px] h-[600px] bg-green-500 rounded-full blur-[120px] z-10"
                />

                <div className="relative z-20 flex flex-col justify-end p-20 w-full max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                            <HeartPulse size={48} className="text-green-400 mb-6" />
                            <h3 className="text-3xl font-bold text-white mb-4 leading-tight">Empowering Clinical Efficiency with SaaS 2.0.</h3>
                            <p className="text-green-200 text-lg font-medium leading-relaxed">
                                Join our network of health centers optimizing patient outcomes through intelligent bed management and real-time care coordination.
                            </p>
                        </div>
                        <div className="mt-12 flex gap-8">
                            <div>
                                <p className="text-2xl font-bold text-white">4.9k+</p>
                                <p className="text-sm text-green-300 font-bold uppercase tracking-wider">Patients Assigned</p>
                            </div>
                            <div className="w-px h-12 bg-white/20"></div>
                            <div>
                                <p className="text-2xl font-bold text-white">12%</p>
                                <p className="text-sm text-green-300 font-bold uppercase tracking-wider">Efficiency Gain</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
