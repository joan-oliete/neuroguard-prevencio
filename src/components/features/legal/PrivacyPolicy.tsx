import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <button
                    onClick={onBack}
                    className="mb-8 flex items-center text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Tornar
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-indigo-100 p-3 rounded-xl">
                        <Shield className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Política de Privacitat i Avís Legal</h1>
                </div>

                <div className="prose prose-slate max-w-none space-y-8">

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
                        <h3 className="text-amber-900 text-lg font-bold mb-2">⚠️ Avís Important: No és un Dispositiu Mèdic</h3>
                        <p className="text-amber-800">
                            NeuroGuard és una eina de suport i autogestió, però <strong>NO substitueix el criteri, diagnòstic ni tractament d'un professional sanitari</strong>.
                            Si creus que estàs en una situació d'emergència, truca immediatament al 112 o acudeix al teu centre de salut més proper.
                            L'ús d'aquesta aplicació és responsabilitat exclusiva de l'usuari.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">1. Responsable del Tractament</h2>
                        <p className="text-slate-600">
                            Les dades personals recollides a través de l'aplicació seran tractades de conformitat amb el Reglament (UE) 2016/679 (RGPD) i la Llei Orgànica 3/2018 (LOPD-GDD).
                            <br />
                            <strong>Identitat:</strong> NeuroGuard (Projecte en Desenvolupament)<br />
                            <strong>Finalitat:</strong> Gestió del registre d'usuari i emmagatzematge de dades d'autogestió emocional.<br />
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">2. Dades que Recollim</h2>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600">
                            <li><strong>Dades d'Identificació:</strong> Correu electrònic (necessari per al registre i accés).</li>
                            <li><strong>Dades de Salut (Categoria Especial):</strong> Registres de l'estat d' ànim, diari personal ("Moment Real"), plans de crisi i nivells d'ansietat/consum. Aquestes dades són introduïdes voluntàriament per l'usuari amb la finalitat exclusiva del seu propi seguiment.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">3. Finalitat i Legitimació</h2>
                        <p className="text-slate-600">
                            Tractem les teves dades per oferir-te les funcionalitats de l'app: registre d'activitat, visualització de gràfiques i accés al teu pla de prevenció.
                            La base legal és el teu <strong>Consentiment Exprés</strong> en registrar-te i acceptar aquesta política (Article 9.2.a RGPD per a dades de salut).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">4. Seguretat i Emmagatzematge</h2>
                        <p className="text-slate-600">
                            Les teves dades s'emmagatzemen de forma segura utilitzant els serveis de Google Firebase (servidors a la UE o amb Escut de Privacitat adequat). S'apliquen mesures tècniques com l'encriptació en trànsit (SSL/TLS).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">5. Ús d'Intel·ligència Artificial</h2>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm mb-2">
                            <p className="font-bold text-slate-700 mb-1">Tecnologia utilitzada: Google Vertex AI / Gemini</p>
                            <p>NeuroGuard utilitza tecnologia d'IA per oferir funcionalitats com el "Terapeuta Virtual" o la generació de contingut personalitzat.</p>
                        </div>
                        <p className="text-slate-600">
                            En utilitzar aquestes funcions, entens que:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                            <li>Les interaccions amb la IA són automatitzades i <strong>no supervisades per humans</strong> en temps real.</li>
                            <li>La IA pot cometre errors ("al·lucinacions"). Verifica sempre la informació important.</li>
                            <li>Dades compartides amb la IA: Es comparteix únicament el text que introdueixes en el context de la conversa. Es recomana no introduir noms reals ni dades identificatives (DNI, adreça) dins els xats amb la IA.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">5. Els teus Drets</h2>
                        <p className="text-slate-600">
                            Pots exercir els teus drets d'accés, rectificació, supressió, limitació i portabilitat. Per eliminar el teu compte i totes les teves dades de forma permanent, pots fer-ho des de la secció "Perfil" de l'aplicació o contactant amb el suport tècnic enviant un correu a <strong>joanolietegu7@gmail.com</strong>.
                        </p>
                    </section>

                </div>
            </div >
        </div >
    );
};

export default PrivacyPolicy;
