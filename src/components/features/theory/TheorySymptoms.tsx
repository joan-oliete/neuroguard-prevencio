import React from 'react';
import { User as UserIcon, ZapOff, Heart, Smartphone, Briefcase, Lock } from 'lucide-react';

const TheorySymptoms: React.FC = () => {
    const symptoms = [
        { t: "Aïllament Social", d: "Preferència pel món digital sobre el presencial. Pèrdua de contacte amb amics.", i: <UserIcon /> },
        { t: "Irritabilitat", d: "Malestar intens, canvis d'humor o agressivitat quan no es pot connectar (Abstinència).", i: <ZapOff /> },
        { t: "Pèrdua d'interès", d: "Abandonament d'aficions prèvies (esport, lectura) que abans eren importants.", i: <Heart /> },
        { t: "Alteració del son", d: "Ús nocturn que afecta la qualitat del descans i el rendiment diürn.", i: <Smartphone /> },
        { t: "Baix rendiment", d: "Problemes escolars o laborals deguts a la manca d'atenció o cansament.", i: <Briefcase /> },
        { t: "Mentides", d: "Ocultació del temps real d'ús o de la despesa econòmica a familiars.", i: <Lock /> }
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">Senyals d'Alerta</h2>
            <p className="text-slate-500 text-lg mb-6">Indicadors comuns que suggereixen la presència d'una addicció comportamental.</p>
            <div className="grid md:grid-cols-2 gap-6">
                {symptoms.map((s, i) => (
                    <div key={i} className="flex gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                        <div className="bg-orange-50 p-4 rounded-full h-fit text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            {s.i}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg mb-1">{s.t}</h4>
                            <p className="text-slate-500 leading-relaxed">{s.d}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TheorySymptoms;
