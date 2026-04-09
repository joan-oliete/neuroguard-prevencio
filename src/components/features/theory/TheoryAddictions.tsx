import React from 'react';
import { ArrowRight } from 'lucide-react';

interface TheoryAddictionsProps {
    onSelect: (id: string) => void;
}

const TheoryAddictions: React.FC<TheoryAddictionsProps> = ({ onSelect }) => {
    const items = [
        { id: 'gambling', title: "Joc d'Atzar", icon: "🎲", desc: "Apostes esportives, casino, pòquer.", color: "text-orange-600" },
        { id: 'screens', title: "Pantalles", icon: "📱", desc: "Xarxes socials i validació externa.", color: "text-blue-600" },
        { id: 'gaming', title: "Videojocs", icon: "🎮", desc: "Immersió i sistemes de recompensa.", color: "text-purple-600" },
        { id: 'shopping', title: "Compres", icon: "🛍️", desc: "Oniomania i impulsivitat digital.", color: "text-pink-600" },
        { id: 'porn', title: "Pornografia", icon: "🔞", desc: "Distorsió sexual i riscos legals.", color: "text-red-600" },
        { id: 'emotional', title: "Dependència", icon: "❤️‍🔥", desc: "Relacions tòxiques i cibersexe.", color: "text-rose-600" },
        { id: 'work', title: "Workaholism", icon: "💼", desc: "Connexió laboral permanent.", color: "text-slate-600" },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">Principals Addiccions Socials</h2>
            <p className="text-slate-500 mb-6 text-lg">Explora els mecanismes, riscos i pensaments trampa de cada conducta.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer" onClick={() => onSelect(item.id)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-4xl bg-slate-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
                            <div className="bg-slate-100 rounded-full p-2 group-hover:bg-slate-200 transition-colors">
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                            </div>
                        </div>
                        <h3 className={`font-bold text-xl mb-2 ${item.color}`}>{item.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TheoryAddictions;
