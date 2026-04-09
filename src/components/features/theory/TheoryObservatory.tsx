import React, { useState } from 'react';
import { BarChart2, Activity } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { TREATMENT_DATA, RISK_DATA, GENDER_COMPARISON_DATA, MOOD_EVOLUTION_DATA, EVOLUTION_DATA } from '../../../data/theoryData';

const TheoryObservatory: React.FC = () => {
    const [observatoryTab, setObservatoryTab] = useState<'general' | 'joves' | 'genere' | 'evolucio'>('general');

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 gap-6">
                <h2 className="text-3xl font-bold text-slate-800">
                    Dades de l'Observatori
                </h2>
                <div className="flex gap-1 bg-slate-100 p-1.5 rounded-xl">
                    {['general', 'joves', 'genere', 'evolucio'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setObservatoryTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${observatoryTab === tab ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {observatoryTab === 'general' && (
                <div className="grid md:grid-cols-2 gap-8 animate-fadeIn">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-6 text-center text-lg">Motius de Tractament (Cat, 2023)</h3>
                        <div className="h-72 min-h-[300px]" style={{ minHeight: '300px', width: '100%', display: 'block' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={TREATMENT_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" name="%" radius={[0, 8, 8, 0]} barSize={32}>
                                        {TREATMENT_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl mt-4 text-center">
                            <p className="text-sm text-slate-600 font-medium">El <span className="text-orange-600 font-bold">75%</span> de les sol·licituds van ser per joc d'apostes.</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-8 rounded-3xl text-center shadow-xl flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl opacity-90 uppercase tracking-widest mb-2">Apostes Online</h3>
                            <p className="text-8xl font-extrabold my-6 tracking-tighter">43.2<span className="text-4xl">%</span></p>
                            <p className="text-lg opacity-90 max-w-xs mx-auto font-medium">dels pacients en tractament juguen habitualment a internet.</p>
                        </div>
                    </div>
                </div>
            )}

            {observatoryTab === 'joves' && (
                <div className="grid md:grid-cols-2 gap-8 animate-fadeIn">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-6 text-center text-lg">Risc d'addicció al mòbil</h3>
                        <div className="h-72 min-h-[300px]" style={{ minHeight: '300px', width: '100%', display: 'block' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={RISK_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {RISK_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-slate-500 font-medium mt-4">1 de cada 10 joves presenta un risc elevat.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="bg-blue-50 p-6 rounded-full mb-6">
                            <Activity className="w-12 h-12 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-2xl mb-4">Factor de Vulnerabilitat</h3>
                        <p className="text-slate-600 text-lg leading-relaxed max-w-xs">
                            L'addicció es presenta amb més freqüència i gravetat en contextos de <span className="font-bold text-blue-600">vulnerabilitat socioeconòmica</span>.
                        </p>
                    </div>
                </div>
            )}

            {observatoryTab === 'genere' && (
                <div className="grid lg:grid-cols-2 gap-8 animate-fadeIn">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-6 text-center text-lg">Bretxa de Gènere en Conductes de Risc</h3>
                        <div className="h-80 min-h-[320px]" style={{ minHeight: '320px', width: '100%', display: 'block' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={GENDER_COMPARISON_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="nois" name="Nois" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="noies" name="Noies" fill="#ec4899" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-center text-slate-500 mt-6 bg-slate-50 p-3 rounded-lg">
                            Els <strong className="text-blue-600">nois</strong> dominen en Joc i Pornografia; les <strong className="text-pink-600">noies</strong> pateixen més malestar emocional i ús de xarxes.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-6 text-center text-lg">Evolució Estat Ànim Positiu</h3>
                        <div className="h-80 min-h-[320px]" style={{ minHeight: '320px', width: '100%', display: 'block' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={MOOD_EVOLUTION_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line type="monotone" dataKey="nois" stroke="#3b82f6" strokeWidth={4} name="Nois" dot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="noies" stroke="#ec4899" strokeWidth={4} name="Noies" dot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-center text-slate-500 mt-6 bg-slate-50 p-3 rounded-lg">
                            La bretxa de benestar emocional s'eixampla dramàticament des de 2015.
                        </p>
                    </div>
                </div>
            )}

            {observatoryTab === 'evolucio' && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-fadeIn">
                    <h3 className="font-bold text-slate-700 mb-6 text-center text-lg">Evolució de Sol·licituds de Tractament</h3>
                    <div className="h-80 min-h-[320px]" style={{ minHeight: '320px', width: '100%', display: 'block' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={EVOLUTION_DATA} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <RechartsTooltip contentStyle={{ borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="requests" stroke="#f97316" strokeWidth={4} name="Sol·licituds" dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center font-bold text-slate-700 mt-6">Tendència a l'alça constant (+98% des de 2019)</p>
                </div>
            )}
        </div>
    );
};

export default TheoryObservatory;
