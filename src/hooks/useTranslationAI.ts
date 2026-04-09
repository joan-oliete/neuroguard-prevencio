import { useState, useCallback } from 'react';
import { getGenerativeModel } from "firebase/vertexai";
import { vertexAI } from '../services/firebase';

interface TranslationResult {
    translatedText: string | null;
    loading: boolean;
    error: string | null;
    translate: (text: string, targetLang?: string) => Promise<void>;
}

export const useTranslationAI = (): TranslationResult => {
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const translate = useCallback(async (text: string, targetLang: string = 'en') => { // Default to English for testing, or could be 'es'
        if (!text) return;

        setLoading(true);
        setError(null);
        setTranslatedText(null);

        try {
            const model = getGenerativeModel(vertexAI, {
                model: "gemini-1.5-flash",
                systemInstruction: "You are a professional translator. Translate the following text accurately to the target language. Do not add explanations. Return ONLY the translated text."
            });

            const prompt = `Translate this to ${targetLang}: "${text}"`;
            const result = await model.generateContent(prompt);
            const response = result.response;
            const textOutput = response.text();

            setTranslatedText(textOutput);
        } catch (err: any) {
            console.error("Translation Error:", err);
            setError(err.message || 'Failed to translate');
        } finally {
            setLoading(false);
        }
    }, []);

    return { translatedText, loading, error, translate };
};
