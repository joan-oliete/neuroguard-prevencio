

import React, { useState, useEffect, useRef } from 'react';
import { streamTherapistChat, ChatMessage } from '../../../services/geminiService';
import { Wind, Send, User, Bot, Loader2 } from 'lucide-react';

interface UrgeSurfingModalProps {
    onClose: () => void;
}

interface Message extends ChatMessage {
    id: string;
}

export const UrgeSurfingModal: React.FC<UrgeSurfingModalProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Use a ref to store the chat session so it persists across renders
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize chat on mount
    useEffect(() => {
        setMessages([
            { id: 'init-1', role: 'model', text: "Hola. Sento que estiguis passant per un moment difícil. Estic aquí amb tu. Respira. Com et sents ara mateix? Puc ajudar-te a gestionar-ho pas a pas." }
        ]);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
        const newMessages = [...messages, userMsg];

        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            // Pass the full history to the stateless service
            const result = await streamTherapistChat(newMessages, {
                pageContext: 'urge-surfing',
                currentFeeling: 'Crisis/Craving',
                userProfile: { name: 'User' }
            });

            // Create a placeholder message for the AI response
            const aiMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '' }]);

            let fullText = '';
            for await (const chunk of result) {
                const chunkText = chunk.text;
                fullText += chunkText;
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText } : m));
            }
        } catch (error: any) {
            console.error("Chat error", error);
            const errorMsg = error.message || error.toString();
            setMessages(prev => [...prev, { id: 'err', role: 'model', text: `Error de connexió (${errorMsg}). Si us plau, verifica la teva clau API o els permisos.` }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-50 rounded-3xl w-full max-w-2xl h-[80vh] shadow-2xl relative overflow-hidden flex flex-col animate-fadeIn border border-slate-200">

                {/* Header */}
                <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Wind className="text-blue-600 w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Coach de Crisi (IA)</h2>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-xs text-slate-500">En línia • Resposta immediata</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all">
                        ✕
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mt-1 shrink-0 shadow-md">
                                    <Bot className="text-white w-4 h-4" />
                                </div>
                            )}
                            <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white text-slate-700 rounded-tl-none border border-slate-200'
                                }`}>
                                {msg.text || <span className="animate-pulse">...</span>}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mt-1 shrink-0">
                                    <User className="text-slate-500 w-4 h-4" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mt-1 shrink-0 shadow-md">
                                <Bot className="text-white w-4 h-4" />
                            </div>
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                <span className="text-xs text-slate-400 font-medium">Escrivint...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <div className="relative flex items-center gap-2">
                        <input
                            id="chat-input"
                            name="chat-user-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escriu com et sents..."
                            className="w-full pl-5 pr-12 py-4 rounded-full bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-700 font-medium"
                            autoComplete="off"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full transition-all shadow-lg shadow-blue-200"
                        >
                            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-400 mt-2">
                        La IA pot cometre errors. Utilitza el telèfon d'emergències (112) en cas de risc.
                    </p>
                </div>

            </div>
        </div>
    );
};
