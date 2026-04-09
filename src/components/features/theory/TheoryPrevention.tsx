import React from 'react';
import { CheckCircle } from 'lucide-react';

const TheoryPrevention: React.FC = () => {
    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">Estratègies de Prevenció</h2>

            {/* Risk Traffic Light */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-xl mb-6 text-center text-slate-700">Semàfor d'Autoavaluació</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center hover:shadow-md transition-shadow cursor-default group">
                        <div className="w-10 h-10 bg-green-500 rounded-full mx-auto mb-4 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform"></div>
                        <h4 className="font-bold text-green-800 mb-2 text-lg">Ús Saludable</h4>
                        <p className="text-sm text-green-700 leading-relaxed">L'ús és una eina o diversió, no una necessitat. Pots parar quan vols sense malestar.</p>
                    </div>
                    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl text-center hover:shadow-md transition-shadow cursor-default group">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full mx-auto mb-4 shadow-lg shadow-yellow-200 group-hover:scale-110 transition-transform"></div>
                        <h4 className="font-bold text-yellow-800 mb-2 text-lg">Ús de Risc</h4>
                        <p className="text-sm text-yellow-700 leading-relaxed">Comences a postergar tasques. Et sents molest si t'interrompen. Menteixes sobre el temps d'ús.</p>
                    </div>
                    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center hover:shadow-md transition-shadow cursor-default group">
                        <div className="w-10 h-10 bg-red-500 rounded-full mx-auto mb-4 shadow-lg shadow-red-200 animate-pulse"></div>
                        <h4 className="font-bold text-red-800 mb-2 text-lg">Addicció</h4>
                        <p className="text-sm text-red-700 leading-relaxed">Pèrdua total de control. Afectació greu de la vida personal, laboral o acadèmica. Necessitat d'ajuda professional.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                    <h3 className="font-bold text-blue-800 text-xl mb-6 flex items-center gap-3">
                        <CheckCircle className="w-6 h-6" /> Consells Pràctics de Prevenció
                    </h3>
                    <ul className="grid md:grid-cols-2 gap-6">
                        <li className="bg-white p-5 rounded-2xl text-blue-900 border border-blue-100 shadow-sm flex items-start gap-3">
                            <span className="font-bold text-2xl text-blue-300">1</span>
                            <div>
                                <strong className="block mb-1">Desconnexió Digital</strong>
                                <span className="text-sm opacity-80">Estableix zones lliures de pantalles (dormitori, taula de menjar).</span>
                            </div>
                        </li>
                        <li className="bg-white p-5 rounded-2xl text-blue-900 border border-blue-100 shadow-sm flex items-start gap-3">
                            <span className="font-bold text-2xl text-blue-300">2</span>
                            <div>
                                <strong className="block mb-1">Alternativa Saludable</strong>
                                <span className="text-sm opacity-80">Substitueix el temps de pantalla per esport o lectura física.</span>
                            </div>
                        </li>
                        <li className="bg-white p-5 rounded-2xl text-blue-900 border border-blue-100 shadow-sm flex items-start gap-3">
                            <span className="font-bold text-2xl text-blue-300">3</span>
                            <div>
                                <strong className="block mb-1">Control Econòmic</strong>
                                <span className="text-sm opacity-80">No guardis targetes de crèdit al navegador o apps de jocs.</span>
                            </div>
                        </li>
                        <li className="bg-white p-5 rounded-2xl text-blue-900 border border-blue-100 shadow-sm flex items-start gap-3">
                            <span className="font-bold text-2xl text-blue-300">4</span>
                            <div>
                                <strong className="block mb-1">Higiene del Son</strong>
                                <span className="text-sm opacity-80">Deixa les pantalles 1 hora abans d'anar a dormir.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TheoryPrevention;
