import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, X, MapPin } from 'lucide-react';
import { useVirtualTherapist } from '../../context/VirtualTherapistContext';
import { useMapData } from '../../context/MapContext';

export const TherapistChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { chatHistory, isTyping, sendMessage } = useVirtualTherapist();
    const { addLocation } = useMapData();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [lastProcessedLength, setLastProcessedLength] = useState(0);

    // Auto-scroll
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, isOpen]);

    // Action Parser Effect
    useEffect(() => {
        if (chatHistory.length === 0) return;

        const lastMsg = chatHistory[chatHistory.length - 1];

        // Only check AI messages that are new or updated
        if (lastMsg.role === 'model' && chatHistory.length > lastProcessedLength) {
            const text = lastMsg.text;
            const tagRegex = /\[ADD_LOCATION:\s*(\{.*\})\]/;
            const match = text.match(tagRegex);

            if (match) {
                try {
                    const jsonStr = match[1];
                    const locationData = JSON.parse(jsonStr);

                    // Execute Action
                    addLocation(locationData);
                    console.log("AI Added Location:", locationData);

                    // Optional: You could clean the message here, but handling streams clean-up dynamically is tricky.
                    // For now, let's just let it be or maybe visually hide it with CSS if we rendered markdown.
                    // A better approach is to have the VirtualTherapistContext strip it before adding to history, 
                    // but for this MVP, checking it here works.

                    // We mark this history length as processed to avoid duplicate Adds
                    setLastProcessedLength(chatHistory.length);

                } catch (e) {
                    console.error("Failed to parse AI Location tag:", e);
                }
            }
        } else if (lastMsg.role === 'user') {
            // Reset parser check when user types
            if (chatHistory.length !== lastProcessedLength) setLastProcessedLength(chatHistory.length);
        }

    }, [chatHistory, addLocation, lastProcessedLength]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        const text = input;
        setInput('');
        await sendMessage(text, window.location.pathname);
    };

    // Helper to clean text for display (hides the raw tag)
    const cleanDisplay = (text: string) => {
        return text.replace(/\[ADD_LOCATION:\s*\{.*\}\]/g, '📍 *He afegit un nou lloc al teu mapa!*');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-50 flex flex-col items-end animate-fadeIn">
            {/* Chat Window */}
            <div className="w-full md:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">NeuroGuard AI</h3>
                            <p className="text-brand-100 text-xs">Terapeuta Virtual</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-brand-100 text-brand-600'}`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-slate-800 text-white rounded-tr-none'
                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                                }`}>
                                {cleanDisplay(msg.text) || <span className="animate-pulse">...</span>}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center h-10">
                                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escriu aquí..."
                            className="w-full pl-4 pr-12 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-brand-500 rounded-xl focus:ring-2 focus:ring-brand-200 transition-all text-sm outline-none"
                            disabled={isTyping}
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
