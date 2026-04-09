import React from 'react';
import { Gavel, Lock, EyeOff, Scale, CheckCircle, Briefcase } from 'lucide-react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip as RechartsTooltip, Bar, Cell } from 'recharts';
import { SEXTORTION_DATA } from '../../../data/theoryData';

const TheoryForense: React.FC = () => {
    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">Anàlisi Forense i Legal</h2>

            <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
                <div className="flex items-start gap-6 mb-8 relative z-10">
                    <div className="bg-white/10 p-4 rounded-2xl">
                        <Gavel className="w-10 h-10 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">CSAM vs Pornografia</h3>
                        <p className="opacity-80 mt-2 max-w-2xl leading-relaxed">És crític distingir entre pornografia legal (adults, consentida) i CSAM (Material d'Abús Sexual Infantil). El CSAM no és pornografia, és l'evidència documental d'un delicte.</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                        <h4 className="font-bold text-red-400 mb-3 text-lg flex items-center gap-2"><Lock className="w-5 h-5" /> CSAM (Delicte)</h4>
                        <p className="text-sm opacity-80 leading-relaxed">
                            La tinença, distribució o producció és un delicte greu segons el Codi Penal. Genera una revictimització permanent per a la víctima.
                        </p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                        <h4 className="font-bold text-blue-400 mb-3 text-lg flex items-center gap-2"><EyeOff className="w-5 h-5" /> Grooming</h4>
                        <p className="text-sm opacity-80 leading-relaxed">
                            Procés de manipulació: Selecció de la víctima, "Love Bombing" (afecte desmesurat), Aïllament de l'entorn, Desensibilització i Abús.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-xl"><Scale className="w-6 h-6 text-slate-600" /> Marc Legal (LOPIVI)</h3>
                    <ul className="space-y-4">
                        {['Violència digital com a violència infantil.', 'Obligació de canals de denúncia.', 'Prescripció ampliada de delictes.'].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-sm font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-xl"><Briefcase className="w-6 h-6 text-slate-600" /> Sextorsió per Gènere</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={SEXTORTION_DATA} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" barSize={24} radius={[0, 6, 6, 0]}>
                                    {SEXTORTION_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-center text-slate-400 mt-4 italic bg-slate-50 p-2 rounded">Diferència clau: Objectiu sexual (noies) vs econòmic (nois).</p>
                </div>
            </div>
        </div>
    );
};

export default TheoryForense;
