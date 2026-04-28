
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, User, Bot, ShieldAlert, X, Phone, HeartHandshake } from 'lucide-react';
import { vertexAI } from '../../services/firebase';
import { getGenerativeModel } from "firebase/vertexai";

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    isSafetyAlert?: boolean;
}

export const CrisisChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    // Reset chat on open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: '1',
                role: 'model',
                text: t('crisis.chat.welcome'),
                isSafetyAlert: true
            }]);
        }
    }, [isOpen, t]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [chatSession, setChatSession] = useState<any>(null);

    // Initialize Chat Session with Dedicated System Prompt
    useEffect(() => {
        if (!chatSession && isOpen) {
            const currentLang = i18n.language === 'en' ? 'English' : i18n.language === 'es' ? 'Español' : 'Català';
            const crisisModel = getGenerativeModel(vertexAI, {
                model: "gemini-1.5-flash",
                systemInstruction: `Ets un Assistent de Suport en Crisi per a NeuroGuard. RESPON SEMPRE EN ${currentLang.toUpperCase()}. Els teus ÚNICS objectius són: 1) Validar sentiments. 2) Desescalar l'ansietat/ira. 3) Garantir la seguretat. 4) Guiar l'usuari cap a les seves estratègies predefinides. Si l'usuari menciona el suïcidi, l'autolesió o un perill immediat, has de dir-li explícitament que truqui al 112 o vagi a urgències immediatament. Sigues concís, calmat i directiu només quan sigui necessari per la seguretat. No facis diagnòstics.`
            });

            const session = crisisModel.startChat({
                history: [],
            });
            setChatSession(session);
        }
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chatSession) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const result = await chatSession.sendMessageStream(input);

            let aiText = "";
            const botMsgId = (Date.now() + 1).toString();

            setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: "" }]);

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                aiText += chunkText;

                // Real-time keyword check for safety overlay (simplified)
                const isSafety = aiText.toLowerCase().includes("112") || aiText.toLowerCase().includes("emergència");

                setMessages(prev => prev.map(msg =>
                    msg.id === botMsgId ? { ...msg, text: aiText, isSafetyAlert: isSafety } : msg
                ));
            }

        } catch (error) {
            console.error("Crisis Chat Error:", error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: t('crisis.chat.error') }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] border-2 border-teal-500">

                {/* Header */}
                <div className="bg-teal-600 p-4 flex justify-between items-center text-white shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full animate-pulse-slow">
                            <HeartHandshake size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{t('crisis.chat.title')}</h3>
                            <p className="text-teal-100 text-xs flex items-center gap-1"><ShieldAlert size={10} /> {t('crisis.chat.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Emergency Banner */}
                <div className="bg-rose-50 border-b border-rose-100 p-2 flex justify-center gap-4 text-xs font-bold text-rose-700">
                    <button onClick={() => window.open('tel:112', '_system')} className="flex items-center gap-1 hover:underline"><Phone size={12} /> 112 Emergències</button>
                    <button onClick={() => window.open('tel:061', '_system')} className="flex items-center gap-1 hover:underline"><Phone size={12} /> 061 Salut Respon</button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-teal-100 text-teal-700'}`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-slate-700 text-white rounded-tr-none'
                                : (msg.isSafetyAlert ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-white border border-slate-200 text-slate-700') + ' rounded-tl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                                <span className="text-xs text-slate-400 font-medium mr-2">{t('crisis.chat.typing')}</span>
                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={t('crisis.chat.placeholder')}
                            className="w-full pl-4 pr-12 py-4 bg-slate-100 border-transparent focus:bg-white focus:border-teal-500 rounded-xl focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
