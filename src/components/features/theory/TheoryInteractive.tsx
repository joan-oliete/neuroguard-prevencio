import React, { useState } from 'react';
import { Compass } from 'lucide-react';

const TheoryInteractive: React.FC = () => {
    const [marlattStep, setMarlattStep] = useState<number | null>(null);

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">El Model de Recaiguda (Marlatt)</h2>

            <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-orange-400 to-green-400"></div>
                <h3 className="font-bold text-xl mb-4 text-center text-slate-700">Simulador Interactiu</h3>
                <p className="text-center text-slate-500 mb-10 text-sm max-w-md mx-auto">Fes clic als botons per veure com una decisió canvia el resultat final.</p>

                <div className="flex flex-col items-center max-w-3xl mx-auto relative">
                    {/* Step 1: Trigger */}
                    <button
                        onClick={() => setMarlattStep(1)}
                        className={`w-full max-w-md p-6 rounded-2xl text-center border-2 transition-all mb-12 relative group ${marlattStep === 1 ? 'bg-red-50 border-red-400 shadow-lg scale-105 z-30' : 'bg-white border-slate-200 hover:border-red-300 z-10'}`}
                    >
                        <span className="font-bold text-slate-800 block text-xl mb-1 group-hover:text-red-700 transition-colors">1. Situació d'Alt Risc (SAR)</span>
                        <span className="text-sm text-slate-500">Estrès, conflicte, pressió social...</span>
                        {marlattStep === 1 && (
                            <div className="absolute top-full left-0 w-full mt-4 p-4 bg-white rounded-xl border border-red-100 text-left text-sm text-slate-600 shadow-xl z-30 animate-fadeIn">
                                <strong className="block text-red-600 mb-1">El Desencadenant:</strong> És el moment crític. Pot ser extern (veure un anunci) o intern (sentir tristesa).
                            </div>
                        )}
                    </button>

                    <div className="grid grid-cols-2 gap-8 w-full relative z-10">
                        {/* Left Path: Coping */}
                        <div className="flex flex-col gap-6 items-center">
                            <button
                                onClick={() => setMarlattStep(2)}
                                className={`w-full p-5 rounded-2xl text-center border-2 transition-all ${marlattStep === 2 ? 'bg-green-50 border-green-500 shadow-lg ring-2 ring-green-200 z-20' : 'bg-white border-slate-100 hover:border-green-300 z-10'}`}
                            >
                                <span className="font-bold text-green-700 block mb-1">2A. Resposta Eficaç</span>
                                <span className="text-xs text-green-600">Utilitzar eines apreses</span>
                            </button>

                            {marlattStep === 2 && (
                                <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-green-800 animate-fadeIn shadow-inner w-full relative z-20">
                                    Augmenta la teva sensació de control (<strong>Autoeficàcia</strong>). El risc disminueix.
                                </div>
                            )}

                            <div className={`mt-auto px-6 py-3 rounded-full text-center text-sm font-bold transition-all relative z-10 ${marlattStep === 2 ? 'bg-green-600 text-white shadow-lg scale-110' : 'bg-slate-100 text-slate-400'}`}>
                                ÈXIT: RECUPERACIÓ
                            </div>
                        </div>

                        {/* Right Path: No Coping */}
                        <div className="flex flex-col gap-6 items-center">
                            <button
                                onClick={() => setMarlattStep(3)}
                                className={`w-full p-5 rounded-2xl text-center border-2 transition-all ${marlattStep === 3 ? 'bg-orange-50 border-orange-400 shadow-lg z-20' : 'bg-white border-slate-100 hover:border-orange-300 z-10'}`}
                            >
                                <span className="font-bold text-orange-700 block mb-1">2B. Resposta Ineficaç</span>
                                <span className="text-xs text-orange-600">No usar eines</span>
                            </button>

                            {marlattStep === 3 && (
                                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-sm text-orange-800 animate-fadeIn shadow-inner w-full relative z-20">
                                    Disminueix l'autoeficàcia. Apareixen les expectatives positives del consum ("em relaxarà").
                                </div>
                            )}

                            <button
                                onClick={() => setMarlattStep(4)}
                                className={`w-full p-5 rounded-2xl text-center border-2 transition-all ${marlattStep === 4 ? 'bg-red-50 border-red-600 shadow-lg ring-2 ring-red-200 z-20' : 'bg-white border-slate-100 hover:border-red-300 z-10'}`}
                            >
                                <span className="font-bold text-red-700 block mb-1">3. Efecte Violació Abstinència</span>
                                <span className="text-xs text-red-600">Culpa i pèrdua de control</span>
                            </button>

                            {marlattStep === 4 && (
                                <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-sm text-red-800 animate-fadeIn shadow-inner w-full relative z-20">
                                    Després de la primera caiguda (Lapse), apareix la culpa intensa i el pensament "total, ja l'he liat". Això porta a la recaiguda total.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ACT Section */}
            <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-xl">
                <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 !text-white" style={{ color: 'white' }}>
                    <Compass className="w-8 h-8 text-purple-400" /> Teràpia d'Acceptació i Compromís (ACT)
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white/10 p-6 rounded-2xl hover:bg-white/20 transition-colors cursor-default border border-white/5">
                        <h4 className="font-bold mb-3 text-lg !text-purple-300" style={{ color: '#d8b4fe' }}>Acceptació</h4>
                        <p className="text-sm opacity-80 leading-relaxed text-white">Obrir-se al malestar (ansietat, craving) sense lluitar contra ell ni evitar-lo. "Fer espai" a l'emoció.</p>
                    </div>
                    <div className="bg-white/10 p-6 rounded-2xl hover:bg-white/20 transition-colors cursor-default border border-white/5">
                        <h4 className="font-bold mb-3 text-lg !text-purple-300" style={{ color: '#d8b4fe' }}>Defusió</h4>
                        <p className="text-sm opacity-80 leading-relaxed text-white">Veure els pensaments com el que són (paraules i sons), no com a veritats absolutes o ordres que cal obeir.</p>
                    </div>
                    <div className="bg-white/10 p-6 rounded-2xl hover:bg-white/20 transition-colors cursor-default border border-white/5">
                        <h4 className="font-bold mb-3 text-lg !text-purple-300" style={{ color: '#d8b4fe' }}>Acció Compromesa</h4>
                        <p className="text-sm opacity-80 leading-relaxed text-white">Actuar segons els teus valors profunds, fins i tot quan és difícil o incòmode fer-ho.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TheoryInteractive;
