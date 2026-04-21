import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from '../services/firebase';
import { streamTherapistChat, ChatMessage, generateSessionSummary, SessionSummary } from '../services/geminiService';
import { UserProfile } from '../types';

interface VirtualTherapistContextType {
    chatHistory: ChatMessage[];
    isTyping: boolean;
    sendMessage: (text: string, pageContext?: string) => Promise<void>;
    clearHistory: () => void;
    isSessionActive: boolean;
    setSessionActive: (active: boolean) => void;
    currentFeeling: string | null;
    setCurrentFeeling: (feeling: string) => void;
    // New features
    endSession: () => Promise<SessionSummary | null>;
    suggestedReplies: string[];
    saveSummaryToDiary: (summary: SessionSummary) => Promise<void>;
}

const VirtualTherapistContext = createContext<VirtualTherapistContextType | undefined>(undefined);

export const VirtualTherapistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, userProfile } = useAuth();
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isSessionActive, setSessionActive] = useState(false);
    const [currentFeeling, setCurrentFeeling] = useState<string | null>(null);
    const [suggestedReplies, setSuggestedReplies] = useState<string[]>([
        "Necessito desfogar-me",
        "Tinc ansietat ara mateix",
        "Vull consells per mantenir la calma"
    ]);

    // Update suggestions based on context (Basic implementation)
    useEffect(() => {
        if (currentFeeling === 'sad') {
            setSuggestedReplies(["Em sento sol", "No tinc energia", "Res em motiva"]);
        } else if (currentFeeling === 'anxious') {
            setSuggestedReplies(["Tinc por de recaure", "El cor em va molt ràpid", "Necessito distreure'm"]);
        }
    }, [currentFeeling]);

    // Load History from Firestore
    useEffect(() => {
        if (!user) {
            setChatHistory([]);
            return;
        }

        const q = query(
            collection(db, `users/${user.uid}/therapist_messages`),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return { role: data.role, text: data.text } as ChatMessage;
            });

            if (loadedMessages.length === 0 && userProfile) {
                setChatHistory([{
                    role: 'model',
                    text: `Hola ${userProfile.name}, soc el teu assistent personal de NeuroGuard. Com et sents avui?`
                }]);
            } else {
                setChatHistory(loadedMessages);
            }
        });

        return () => unsubscribe();
    }, [user, userProfile]);

    const sendMessage = async (text: string, pageContext: string = 'dashboard') => {
        // Optimistic update
        const newHistory = [...chatHistory, { role: 'user', text } as ChatMessage];
        setChatHistory(newHistory);
        setIsTyping(true);

        if (user) {
            try {
                await addDoc(collection(db, `users/${user.uid}/therapist_messages`), {
                    role: 'user',
                    text: text,
                    createdAt: serverTimestamp()
                });
            } catch (err) {
                console.error("Failed to save user message:", err);
            }
        }

        try {
            // Prepare context
            // Fetch aggregated stats
            let statsContext;
            if (userProfile) {
                try {
                    const { getUserContext } = await import('../services/contextAggregator');
                    statsContext = await getUserContext(userProfile);
                } catch (err) {
                    console.warn("Failed to fetch user context for AI:", err);
                }
            }

            const contextData = {
                userProfile: userProfile || undefined,
                pageContext,
                currentFeeling: currentFeeling || undefined,
                stats: statsContext
            };

            const stream = await streamTherapistChat(newHistory, contextData);

            // Temporary variable to accumulate response
            let fullResponse = "";

            // Add placeholder for model response
            const responseIndex = newHistory.length;
            const updatedHistoryWithPlaceholder = [...newHistory, { role: 'model', text: '' } as ChatMessage];
            setChatHistory(updatedHistoryWithPlaceholder);

            for await (const chunk of stream) {
                const chunkText = typeof chunk.text === 'function' ? chunk.text() : (chunk.text as string);
                fullResponse += chunkText;

                // Live update of the last message
                setChatHistory(prev => {
                    const newH = [...prev];
                    if (newH[responseIndex]) {
                        newH[responseIndex] = { ...newH[responseIndex], text: fullResponse };
                    }
                    return newH;
                });
            }

            if (user && fullResponse) {
                try {
                    await addDoc(collection(db, `users/${user.uid}/therapist_messages`), {
                        role: 'model',
                        text: fullResponse,
                        createdAt: serverTimestamp()
                    });
                } catch (err) {
                    console.error("Failed to save model message:", err);
                }
            }

        } catch (error) {
            console.error("Error sending message to Therapist:", error);
            setChatHistory(prev => [...prev, { role: 'model', text: "Em sap greu, estic tenint problemes de connexió. Podem tornar-ho a provar en uns moments?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    const clearHistory = () => {
        setChatHistory([]);
    };

    const endSession = async (): Promise<SessionSummary | null> => {
        setSessionActive(false);
        if (chatHistory.length > 2) {
            return await generateSessionSummary(chatHistory);
        }
        return null;
    }

    const saveSummaryToDiary = async (summary: SessionSummary) => {
        if (!user) return;

        const text = `📝 *Resum de Sessió amb NeuroGuard AI*\n\n` +
            `**Canvi Emocional:** ${summary.moodShift}\n` +
            `**Insights Clau:**\n${summary.keyInsights.map(i => `- ${i}`).join('\n')}\n\n` +
            `**Acció Recomanada:** ${summary.actionableStep}`;

        try {
            await addDoc(collection(db, `users/${user.uid}/diaryEntries`), {
                text: text,
                createdAt: serverTimestamp(),
                category: 'therapy_session'
            });
        } catch (error) {
            console.error("Error saving summary to diary:", error);
        }
    };

    return (
        <VirtualTherapistContext.Provider value={{
            chatHistory,
            isTyping,
            sendMessage,
            clearHistory,
            isSessionActive,
            setSessionActive,
            currentFeeling,
            setCurrentFeeling,
            endSession,
            suggestedReplies,
            saveSummaryToDiary
        }}>
            {children}
        </VirtualTherapistContext.Provider>
    );
};

export const useVirtualTherapist = () => {
    const context = useContext(VirtualTherapistContext);
    if (context === undefined) {
        throw new Error('useVirtualTherapist must be used within a VirtualTherapistProvider');
    }
    return context;
};
