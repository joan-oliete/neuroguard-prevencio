
import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisHook {
    speak: (text: string) => void;
    stop: () => void;
    isSpeaking: boolean;
    hasSynthesisSupport: boolean;
    isMuted: boolean;
    toggleMute: () => void;
}

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const synth = window.speechSynthesis;
            setSynthesis(synth);

            const updateVoices = () => {
                const voices = synth.getVoices();
                // Try to find a Catalan voice, fallback to Spanish, then English
                const preferredVoice = voices.find(v => v.lang.includes('ca')) ||
                    voices.find(v => v.lang.includes('es')) ||
                    voices.find(v => v.lang.includes('en'));
                setVoice(preferredVoice || null);
            };

            updateVoices();
            if (synth.onvoiceschanged !== undefined) {
                synth.onvoiceschanged = updateVoices;
            }
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!synthesis || isMuted) return;

        // Cancel any current speaking
        synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) {
            utterance.voice = voice;
        }
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthesis.speak(utterance);
    }, [synthesis, voice, isMuted]);

    const stop = useCallback(() => {
        if (synthesis) {
            synthesis.cancel();
            setIsSpeaking(false);
        }
    }, [synthesis]);

    const toggleMute = useCallback(() => {
        stop();
        setIsMuted(prev => !prev);
    }, [stop]);

    return {
        speak,
        stop,
        isSpeaking,
        hasSynthesisSupport: !!synthesis,
        isMuted,
        toggleMute
    };
};
