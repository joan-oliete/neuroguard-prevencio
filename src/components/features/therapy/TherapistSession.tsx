
import React, { useEffect, useRef, useState } from 'react';
import { useVirtualTherapist } from '../../../context/VirtualTherapistContext';
import { Send, User, Bot, Mic, MicOff, X, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { SessionSummary } from '../../../services/geminiService';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../../hooks/useSpeechSynthesis';

interface rsProps {
    onBack: () => void;
}

export const TherapistSession: React.FC<rsProps> = ({ onBack }) => {
    const { chatHistory, sendMessage, isTyping, setSessionActive, endSession, suggestedReplies, saveSummaryToDiary } = useVirtualTherapist();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [summary, setSummary] = useState<SessionSummary | null>(null);
    const [isEnding, setIsEnding] = useState(false);

    // Voice Hooks
    const { isListening, transcript, startListening, stopListening, resetTranscript, hasRecognitionSupport } = useSpeechRecognition();
    const { speak, stop, isSpeaking, hasSynthesisSupport, isMuted, toggleMute } = useSpeechSynthesis();

    const handleEndSession = async () => {
        setIsEnding(true);
        stop(); // Stop speaking
        const result = await endSession();
        setSummary(result);
        setIsEnding(false);
    };

    const handleSaveAndExit = async () => {
        if (summary) {
            await saveSummaryToDiary(summary); // Save to diary!
        }
        stop(); // Stop speaking
        setSummary(null);
        onBack();
    };

    // Update input with voice transcript
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    // Handle Mic Toggle
    const handleMicToggle = () => {
        if (isListening) {
            stopListening();
        } else {
            resetTranscript();
            startListening();
        }
    };

    // Auto-Speak AI Messages
    useEffect(() => {
        if (!isMuted && chatHistory.length > 0) {
            const lastMsg = chatHistory[chatHistory.length - 1];
            if (lastMsg.role === 'model') {
                speak(lastMsg.text);
            }
        }
    }, [chatHistory, isMuted, speak]);

    // Stop speaking when user starts typing or listening
    useEffect(() => {
        if (isListening || input.length > 0) {
            stop();
        }
    }, [isListening, input, stop]);


    // Set immersive mode active
    useEffect(() => {
        setSessionActive(true);
        return () => {
            setSessionActive(false);
            stop(); // Cleanup voice
        };
    }, [setSessionActive, stop]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        const text = input;
        setInput('');
        resetTranscript();
        stop(); // Stop AI speech if interrupted
        await sendMessage(text, "therapy-session");
    };



    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center relative overflow-hidden">
            {/* Background Ambient Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            </div>

            {/* Header - Fixed to top */}
            <header className="fixed top-0 left-0 right-0 w-full p-6 z-50 flex justify-between items-center bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent">
                <button
                    onClick={handleEndSession}
                    disabled={isEnding || chatHistory.length < 2}
                    className="p-3 bg-white/10 hover:bg-rose-500/20 hover:text-rose-200 rounded-full transition-all flex items-center gap-2 text-sm font-medium backdrop-blur-md border border-white/10 shadow-lg"
                >
                    {isEnding ? <span className="animate-pulse">Generant Resum...</span> : <><X size={18} /> Tancar Sessió</>}
                </button>
                <div className="flex flex-col items-end pointer-events-none">
                    <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">Espai Segur</span>
                    <span className="text-xs text-slate-400 uppercase tracking-widest">Connectat amb NeuroGuard AI</span>
                </div>
            </header>

            {/* Central Avatar / Visualization */}
            <div className={`mt-24 mb-4 relative z-10 transition-all duration-700 ${isTyping || isSpeaking ? 'scale-110' : 'scale-100'}`}>
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-brand-400 to-teal-400 p-1 shadow-[0_0_40px_rgba(45,212,191,0.3)] flex items-center justify-center animate-float">
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center relative overflow-hidden">
                        {/* Abstract Eye / Core */}
                        <div className={`w-16 h-16 bg-white rounded-full transition-all duration-300 ${(isTyping || isSpeaking) ? 'animate-pulse shadow-[0_0_20px_white]' : 'opacity-80'}`}></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/30 to-transparent"></div>
                    </div>
                </div>


                {/* Voice waves simulation */}
                {(isTyping || isSpeaking) && (
                    <div className="absolute inset-0 -z-10 flex items-center justify-center">
                        <span className="absolute w-full h-full border border-brand-500/30 rounded-full animate-ping"></span>
                        <span className="absolute w-[120%] h-[120%] border border-brand-500/20 rounded-full animate-ping delay-200"></span>
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 w-full max-w-3xl z-10 overflow-y-auto px-4 pb-32 sm:pb-40 space-y-6 custom-scrollbar mask-gradient-top pt-4">
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-10 h-10 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 shrink-0 mt-2">
                                <Bot size={20} />
                            </div>
                        )}

                        <div className={`max-w-[75%] p-6 rounded-3xl text-lg leading-relaxed shadow-lg backdrop-blur-sm ${msg.role === 'user'
                            ? 'bg-slate-800/80 text-white rounded-tr-none border border-slate-700'
                            : 'bg-white/10 text-slate-100 rounded-tl-none border border-white/5'
                            }`}>
                            {msg.text}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-2">
                                <User size={20} />
                            </div>
                        )}
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 shrink-0">
                            <Bot size={20} />
                        </div>
                        <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none flex gap-2 items-center">
                            <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 z-40 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent flex flex-col items-center">
                <div className="w-full max-w-3xl flex flex-col gap-4">
                    {/* Quick Replies */}
                    {!isTyping && suggestedReplies.length > 0 && !isListening && (
                        <div className="flex flex-wrap gap-2 justify-center animate-fadeIn">
                            {suggestedReplies.map((reply, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(reply, "therapy-session")}
                                    className="bg-white/5 hover:bg-brand-500/20 hover:border-brand-400 border border-white/10 text-slate-300 hover:text-white px-4 py-2 rounded-full text-sm transition-all backdrop-blur-sm"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className={`relative bg-slate-800/80 backdrop-blur-xl rounded-full p-2 flex items-center border shadow-2xl transition-colors ${isListening ? 'border-brand-500 shadow-brand-500/20' : 'border-slate-700'}`}>
                        {/* Mute Toggle */}
                        {hasSynthesisSupport && (
                            <button
                                onClick={toggleMute}
                                className={`p-3 transition-all rounded-full ${isMuted ? 'text-slate-400 hover:text-white' : 'bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/50'}`}
                                title={isMuted ? "Activar veu" : "Silenciar veu"}
                            >
                                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                            </button>
                        )}

                        {/* Microphone Button */}
                        <button
                            onClick={handleMicToggle}
                            className={`p-3 transition-all rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-white'}`}
                            disabled={!hasRecognitionSupport}
                            title={hasRecognitionSupport ? "Parlar" : "Navegador no compatible"}
                        >
                            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isListening ? "Escoltant..." : "Parla o escriu..."}
                            className="flex-1 bg-transparent text-white px-4 py-2 text-lg focus:outline-none placeholder:text-slate-500"
                            disabled={isTyping}
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="p-3 bg-brand-500 hover:bg-brand-400 text-white rounded-full transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            <Send size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Modal */}
            {summary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fadeIn">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-teal-400"></div>

                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
                                <CheckCircle size={32} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-center mb-2">Resum de la Sessió</h2>
                        <p className="text-slate-400 text-center text-sm mb-6">Aquí tens els punts clau del teu progrés avui.</p>

                        <div className="space-y-4 mb-8">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Canvi Emocional</span>
                                <p className="text-white font-medium mt-1">{summary.moodShift}</p>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Insights Clau</span>
                                <ul className="list-disc list-inside mt-2 text-slate-300 text-sm space-y-1">
                                    {summary.keyInsights.map((insight, i) => (
                                        <li key={i}>{insight}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                <span className="text-xs text-brand-400 uppercase font-bold tracking-wider">Acció Recomanada</span>
                                <p className="text-white font-medium mt-1">{summary.actionableStep}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveAndExit}
                            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-900/20"
                        >
                            Guardar i Sortir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
