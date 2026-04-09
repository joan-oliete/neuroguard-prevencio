
import { useState } from 'react';
import { getGenerativeModel } from "firebase/vertexai";
import { DetectiveCard } from '../data/detectiveData';
import { vertexAI } from '../services/firebase';

interface AIAnalysis {
    id: string;
    match: boolean;
    reasoning?: string;
}

export const useGenAI = () => {
    // Firebase is theoretically always available if configured, 
    // but in reality we might want to check if config is valid. 
    // For now, true.
    const [isAvailable] = useState(true);
    const [loading, setLoading] = useState(false);

    const analyzeQuestion = async (question: string, cards: DetectiveCard[]): Promise<AIAnalysis[]> => {
        setLoading(true);
        try {
            const cardContext = cards.map(c =>
                `- ID: ${c.id}, Name: ${c.name}, Desc: ${c.description}, Attributes: [${Object.values(c.attributes).join(', ')}]`
            ).join('\n');

            const prompt = `
            Task: Analyze the User Question against the provided Mental States (Context).
            Role: Logic Engine. Output strictly JSON.

            Context:
            ${cardContext}

            User Question: "${question}"

            Instructions:
            1. For EACH item in Context, determine if it matches the User Question.
            2. Match = true if the card's attributes or description align with the intent.
            3. Return ONLY a JSON array: [{ "id": "string", "match": boolean }]
            `;

            // Using generateContent from Firebase SDK
            const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            console.log("Vertex AI Raw Output:", text);

            // Clean up code blocks if present
            const cleanResult = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanResult);
            return parsed;

        } catch (error) {
            console.error("Vertex AI Analysis Failed:", error);
            // Fallback for safety or auth errors
            const lowerQ = question.toLowerCase();
            return cards.map(c => ({
                id: c.id,
                match: c.attributes.valence.toLowerCase().includes(lowerQ) ||
                    c.attributes.energy.toLowerCase().includes(lowerQ),
                reasoning: "Fallback (Error)"
            }));
        } finally {
            setLoading(false);
        }
    };

    return { isAvailable, analyzeQuestion, loading };
};
