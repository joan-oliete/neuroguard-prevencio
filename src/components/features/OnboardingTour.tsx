import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, Map, Battery, Shield, Gamepad2 } from 'lucide-react';
import { doc, updateDoc, db } from '../../services/firebase';

interface OnboardingTourProps {
    userId: string;
    onComplete: () => void;
}

const STEPS = [
    {
        key: 'welcome',
        icon: <Map className="w-12 h-12 text-teal-500" />,
        title: 'Benvingut a NeuroGuard',
        desc: 'El teu espai segur per entrenar la ment i prevenir recaigudes. Farem un tour ràpid.',
        highlight: null
    },
    {
        key: 'battery',
        icon: <Battery className="w-12 h-12 text-green-500" />,
        title: 'Bateria de Vitalitat',
        desc: 'Representa la teva energia. Mantingues la ratxa alta entrant cada dia!',
        highlight: '#vitality-battery' // ID we will add to the element
    },
    {
        key: 'emergency',
        icon: <Shield className="w-12 h-12 text-rose-500" />,
        title: 'Botó SOS',
        desc: 'Accés ràpid al teu Pla de Crisi o contactes d\'emergència quan ho necessitis.',
        highlight: '#sos-button'
    },
    {
        key: 'gym',
        icon: <Gamepad2 className="w-12 h-12 text-indigo-500" />,
        title: 'Arcade & Gimnàs',
        desc: 'Entrena les teves funcions executives i guanya XP jugant.',
        highlight: '#quick-access-loot' // Or general game area
    }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ userId, onComplete }) => {
    const { t } = useTranslation(); // Ideally use t keys, hardcoded for now as per "Creating lightweight component"
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = async () => {
        try {
            await updateDoc(doc(db, 'users', userId), { hasCompletedTutorial: true });
            onComplete();
        } catch (error) {
            console.error("Error completing tutorial:", error);
            onComplete(); // Close anyway
        }
    };

    const step = STEPS[currentStep];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-100 w-full">
                        <div
                            className="h-full bg-teal-500 transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>

                    <div className="p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center shadow-inner">
                                {step.icon}
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-800 mb-3 font-serif">
                            {step.title}
                        </h3>

                        <p className="text-slate-500 leading-relaxed mb-8">
                            {step.desc}
                        </p>

                        <button
                            onClick={handleNext}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {currentStep === STEPS.length - 1 ? (
                                <>Començar <Check className="w-5 h-5" /></>
                            ) : (
                                <>Següent <ChevronRight className="w-5 h-5" /></>
                            )}
                        </button>

                        <button
                            onClick={handleClose}
                            className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
                        >
                            Saltar Tutorial
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
