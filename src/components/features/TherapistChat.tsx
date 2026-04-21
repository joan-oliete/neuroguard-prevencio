import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, X, MapPin } from 'lucide-react';
import { useVirtualTherapist } from '../../context/VirtualTherapistContext';
import { useMapData } from '../../context/MapContext';
import { useAuth } from '../../context/AuthContext';
import { updateDoc, doc, db } from '../../services/firebase';

export const TherapistChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user, userProfile } = useAuth();
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
            const locRegex = /\[ADD_LOCATION:\s*(\{.*\})\]/;
            const eventRegex = /\[ADD_EVENT:\s*(\{.*\})\]/;

            const locMatch = text.match(locRegex);
            if (locMatch) {
                try {
                    const locationData = JSON.parse(locMatch[1]);
                    addLocation(locationData);
                    console.log("AI Added Location:", locationData);
                } catch (e) {
                    console.error("Failed to parse AI Location tag:", e);
                }
            }

            const eventMatch = text.match(eventRegex);
            if (eventMatch) {
                try {
                    const eventData = JSON.parse(eventMatch[1]);
                    if (user && userProfile?.activeManualId) {
                         const dateKey = `${eventData.area}-${eventData.date}`;
                         updateDoc(doc(db, `users/${user.uid}/manuals`, userProfile.activeManualId), {
                             [`selfCarePlan.${dateKey}`]: eventData.text
                         }).then(() => console.log("AI Added Event:", eventData))
                           .catch(console.error);
                           
                         // Generate ICS Calendar Download
                         const startDate = eventData.date.replace(/-/g, '') + 'T090000';
                         const endDate = eventData.date.replace(/-/g, '') + 'T100000';
                         const icsContent = [
                           'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
                           `DTSTART:${startDate}`, `DTEND:${endDate}`,
                           `SUMMARY:NeuroGuard: ${eventData.title || eventData.area}`,
                           `DESCRIPTION:${eventData.text}`,
                           'END:VEVENT', 'END:VCALENDAR'
                         ].join('\n');
                         const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                         const url = window.URL.createObjectURL(blob);
                         const link = document.createElement('a');
                         link.href = url;
                         link.setAttribute('download', `neuroguard-${eventData.date}.ics`);
                         document.body.appendChild(link);
                         link.click();
                         document.body.removeChild(link);
                    }
                } catch (e) {
                    console.error("Failed to parse AI Event tag:", e);
                }
            }

            if (locMatch || eventMatch) {
               setLastProcessedLength(chatHistory.length);
            }

        } else if (lastMsg.role === 'user') {
            if (chatHistory.length !== lastProcessedLength) setLastProcessedLength(chatHistory.length);
        }

    }, [chatHistory, addLocation, lastProcessedLength, user, userProfile]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        const text = input;
        setInput('');
        await sendMessage(text, window.location.pathname);
    };

    // Helper to clean text for display (hides the raw tag)
    const cleanDisplay = (text: string) => {
        let clean = text.replace(/\[ADD_LOCATION:\s*\{.*\}\]/g, '📍 *He afegit un nou lloc al teu mapa social!*');
        clean = clean.replace(/\[ADD_EVENT:\s*\{.*\}\]/g, "📅 *Aquest pla s'ha agendat al teu planificador i s'ha descarregat al teu calendari!*");
        return clean;
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
                                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-300"></span>
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
