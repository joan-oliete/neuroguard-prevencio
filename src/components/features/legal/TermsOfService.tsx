
import React from 'react';
import { ChevronLeft, ScrollText, AlertTriangle, UserX, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface TermsOfServiceProps {
    onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full bg-white max-w-4xl mx-auto shadow-2xl overflow-hidden md:rounded-xl md:my-8"
        >
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
                            <ScrollText className="text-teal-400" />
                            Termes de Servei
                        </h1>
                        <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">EULA - Acord de Llicència</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50 text-slate-700 leading-relaxed font-sans">

                <div className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50 pr-4">
                    <p className="text-sm font-medium text-amber-800 flex items-start gap-2">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                        Aquest document constitueix un acord legal vinculant entre vostè (l'Usuari) i NeuroGuard (l'Aplicació).
                    </p>
                </div>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Shield className="text-teal-600" size={20} />
                        1. Descàrrec de Responsabilitat Mèdica
                    </h2>
                    <p className="text-slate-600 mb-4">
                        NeuroGuard és una eina de <strong>suport i prevenció</strong>, NO un dispositiu mèdic.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600">
                        <li>L'aplicació no diagnostica, tracta ni cura cap malaltia o trastorn mental.</li>
                        <li>Els consells, gràfics i interaccions amb la IA són merament informatius.</li>
                        <li><strong>En cas d'emergència o crisi real, contacti immediatament amb els serveis d'emergències mèdiques (112) o acudeixi a l'hospital més proper.</strong></li>
                        <li>L'ús d'aquesta aplicació no substitueix en cap cas la teràpia professional ni el consell mèdic qualificat.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <UserX className="text-rose-600" size={20} />
                        2. Contingut Generat per l'Usuari (UGC)
                    </h2>
                    <p className="text-slate-600 mb-2">
                        Per garantir un entorn segur per a la recuperació, apliquem una política de <strong>Tolerància Zero</strong> davant continguts inadequats.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <p className="font-bold text-slate-700 mb-2">Està estrictament prohibit publicar o compartir:</p>
                        <ul className="list-disc pl-5 space-y-1 text-slate-600">
                            <li>Contingut que promogui o inciti a l'autolesió o al suïcidi.</li>
                            <li>Discursos d'odi, assetjament, bullying o discriminació.</li>
                            <li>Material pornogràfic o sexualment explícit.</li>
                            <li>Informació falsa o enganyosa relacionada amb la salut.</li>
                            <li>Promoció de substàncies il·legals.</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">3. Terminació i Bloqueig</h2>
                    <p className="text-slate-600">
                        NeuroGuard es reserva el dret, a la seva discreció, de <strong>suspendre o eliminar el compte</strong> de qualsevol usuari que incompleixi aquests termes o que representi un risc per a la comunitat, sense necessitat de preavís.
                        <br /><br />
                        Els usuaris poden denunciar comportaments inadequats a través de les eines de report de l'aplicació o contactant a <code>suport@neuroguard.app</code>. Investigarem i actuarem sobre els informes en un termini de 24 hores.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">4. Propietat Intel·lectual</h2>
                    <p className="text-slate-600">
                        Tot el contingut de l'aplicació (codi, dissenys, textos terapèutics, logotips) és propietat exclusiva de NeuroGuard. No està permès copiar, modificar o distribuir aquest contingut sense autorització.
                        <br />
                        Vostè manté la propietat sobre les dades personals que introdueix (diari, registres), d'acord amb la nostra Política de Privacitat.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">5. Subscripcions i Pagaments</h2>
                    <p className="text-slate-600">
                        NeuroGuard pot oferir funcionalitats bàsiques gratuïtes i funcionalitats "Prèmium" sota subscripció. Els pagaments es processen a través de les botigues d'aplicacions (Apple App Store / Google Play Store) i estan subjectes a les seves condicions de facturació i reemborsament.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">6. Modificacions</h2>
                    <p className="text-slate-600">
                        Ens reservem el dret a modificar aquests termes en qualsevol moment. Les modificacions rellevants seran notificades a través de l'aplicació. Continuar utilitzant l'aplicació implica l'acceptació dels nous termes.
                    </p>
                </section>

                <div className="pt-8 text-center text-xs text-slate-400">
                    Última actualització: Desembre 2025
                </div>

            </div>
        </motion.div>
    );
};

export default TermsOfService;
