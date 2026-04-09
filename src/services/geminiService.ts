import { GoogleGenAI, Type } from "@google/genai";
import { getGenerativeModel } from "firebase/vertexai";
import { vertexAI } from "./firebase";
import { RoleplayScenario } from "../types";

// Note: For Veo (Video), we need to ensure the API key is passed dynamically if possible,
// but standard initialization uses process.env.API_KEY.
// The UI will handle the specific API key selection for Veo if needed via window.aistudio.
declare global {
  interface Window {
    aistudio?: {
      openSelectKey: () => Promise<void>;
      hasSelectedApiKey: () => Promise<boolean>;
    };
  }
}

// IMPORTANT: We create a function to get the AI client to allow refreshing the key
const getAiClient = () => {
  // 1. Check Local Storage (User override)
  const localKey = localStorage.getItem('neuro_ai_key');
  if (localKey) return new GoogleGenAI({ apiKey: localKey });

  // 2. Check Environment Variables
  const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    console.warn("API Key is missing. AI features may not work.");
    // Return client with dummy key to allow UI to handle the specific error later if needed, 
    // or we could throw here. For now, let's allow it to fail gracefully at the call site.
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key-missing' });
}

const SYSTEM_INSTRUCTION = `
Actua com a 'Copilot Estratègic' de NeuroGuard.
NO ets un metge, ni un pare, ni un col·lega gamer.
ETS: Una intel·ligència objectiva, col·laborativa i basada en dades.
TONO: Empàtic però analític. Directe. Professional però proper.
OBJECTIU: Ajudar l'usuari a optimitzar la seva "Bateria de Vitalitat" (benestar digital).

EXEMPLES DE RESPOSTA:
Incorrecte: "Hauries de deixar de jugar, és dolent per a tu."
Correcte: "Detecto que la teva bateria està al 20%. Les dades suggereixen que una pausa de 10 minuts augmentaria el teu rendiment cognitiu un 15%. Iniciem protocol de recàrrega?"
`;

export const generateRoleplayScenario = async (topic: string): Promise<RoleplayScenario | null> => {
  try {
    const ai = getAiClient();
    const prompt = `
      Genera un escenari de rol (Roleplay) interactiu per a una app anomenada "NeuroGuard".
      El públic objectiu són adolescents espanyols (14-18 anys).
      Tema: ${topic} (ex: dir "NO" a les apostes online, loot boxes, pressió de grup).
      
      ${SYSTEM_INSTRUCTION}
      
      ESTIL I TO ADDICIONAL:
      - Llenguatge: Espanyol d'Espanya actual / Català col·loquial, usant argot juvenil natural.
      
      FORMAT DE SORTIDA (JSON):
      Retorna un objecte JSON amb aquesta estructura:
      {
        "id": "scenario_unique_id",
        "context": "Descripció breu de la situació",
        "npc_dialogue": "La frase que et diu l''amic' pressionant.",
        "options": [
           {
             "text": "Resposta Assertiva (correcta)",
             "feedback": "Anàlisi objectiva de l'impacte social positiu.",
             "score_impact": 10
           },
           {
             "text": "Resposta Passiva (cedir)",
             "feedback": "Anàlisi de la pèrdua d'autonomia.",
             "score_impact": -5
           },
           {
             "text": "Resposta Agressiva",
             "feedback": "Anàlisi de l'impacte relacional negatiu.",
             "score_impact": 0
           }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            context: { type: Type.STRING },
            npc_dialogue: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                  score_impact: { type: Type.INTEGER }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as RoleplayScenario;
    }
    return null;
  } catch (error) {
    console.error("Error generating scenario:", error);
    return {
      id: "fallback_01",
      context: "Estàs al pati de l'institut. El Marc t'ensenya el mòbil.",
      npc_dialogue: "Mira aquesta quota. Són diners gratis, posa-hi 5 €.",
      options: [
        { text: "Prefereixo gastar-m'ho en menjar.", feedback: "Bona estratègia de desviació.", score_impact: 10 },
        { text: "D'acord, pren.", feedback: "Pèrdua de control financer detectada.", score_impact: -5 },
        { text: "Deixa'm en pau!", feedback: "Reacció reactiva. Pot escalar el conflicte.", score_impact: 0 }
      ]
    };
  }
};

export const generateMemoryImage = async (memoryText: string): Promise<string | null> => {
  try {
    // Gemini does not support text-to-image in this SDK version yet.
    // We use Pollinations AI (free tier) for valid AI image generation in this demo.
    const encodedPrompt = encodeURIComponent(memoryText + ", soothing, aesthetic, minimal, watercolor style, 8k");
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

    // Simulate a short delay to feel like "generating"
    await new Promise(resolve => setTimeout(resolve, 1500));

    return imageUrl;
  } catch (error) {
    console.error("Error generating memory image:", error);
    return null;
  }
};

export const generateEducationalVideo = async (topic: string, description: string): Promise<string | null> => {
  let retryCount = 0;
  const maxRetries = 1;

  while (retryCount <= maxRetries) {
    try {
      // Check for API Key selection for Veo models (Mandatory)
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }

      // We initialize a new client here to ensure we pick up any potentially refreshed key
      // If window.aistudio selected a key, process.env.API_KEY is ideally updated in this env,
      // but if not, we rely on the user having set VITE_API_KEY correctly.
      const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;
      const veoAi = new GoogleGenAI({ apiKey: apiKey });

      const prompt = `Educational video about ${topic}. Visual style: minimal, modern motion graphics, calm colors. Content: ${description.substring(0, 200)}`;

      let operation = await veoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // Polling
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        operation = await veoAi.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        // We need to fetch the blob to display it, appending the key
        const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
        const blob = await videoResponse.blob();
        return URL.createObjectURL(blob);
      }

      return null;

    } catch (error: any) {
      console.error("Error generating video:", error);

      const errorMessage = error.toString();
      // If "Requested entity was not found" (404), it indicates a key/project issue.
      if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("404")) {
        if (retryCount < maxRetries && window.aistudio) {
          console.log("Veo entity not found. Prompting for API key selection and retrying...");
          try {
            await window.aistudio.openSelectKey();
            retryCount++;
            continue; // Retry the loop
          } catch (e) {
            console.error("Key selection failed", e);
            return null;
          }
        }
      }
      return null;
    }
  }
  return null;
  return null;
};

export const generateCrisisGuidance = async (feeling: string): Promise<{ text: string, step: string } | null> => {
  try {
    const ai = getAiClient();
    const prompt = `
            Actua com a terapeuta especialitzat en prevenció de recaigudes i gestió de crisi.
            L'usuari està sentint un impuls fort (craving) o ansietat.
            
            Sensació de l'usuari: "${feeling}"
            
            ${SYSTEM_INSTRUCTION}

            Genera una resposta molt breu i calmant (max 2 frases).
            IMPORTANT: El camp "step" ha de ser una INSTRUCCIÓ ÚNICA, IMPERATIVA i MOLT CURTA (màxim 6-8 paraules).
            Exemple step: "Fes 3 respiracions profundes ara." o "Beu un got d'aigua lentament."
            
            FORMAT JSON:
            {
                "text": "Frase empàtica de validació...",
                "step": "Acció concreta a fer ara mateix"
            }
        `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            step: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;

  } catch (error) {
    console.error("Error generating crisis guidance:", error);
    return {
      text: "Et sento. Està bé sentir-se així. Respira profundament.",
      step: "Inspira en 4 temps, aguanta 4, expira 4."
    };
  }
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}


import { UserContextData } from './contextAggregator';

export interface TherapistContext {
  userProfile?: any; // Avoiding deep type check for now, can import UserProfile
  pageContext: string;
  currentFeeling?: string;
  locations?: any[]; // Added for Map Context
  stats?: UserContextData;
}

export const streamTherapistChat = async (messages: ChatMessage[], context: TherapistContext) => {
  const ai = getAiClient();

  // Convert simple message format to SDK Content format
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  // Construct Dynamic System Prompt
  let dynamicPrompt = SYSTEM_INSTRUCTION + `
    \n\n--- CONTEXT DE L'USUARI ---
    PÀGINA ACTUAL: ${context.pageContext}
    `;

  if (context.userProfile) {
    dynamicPrompt += `
    NOM: ${context.userProfile.name}
    NIVELL: ${context.userProfile.level} (Usuari actiu)
    `;
  }

  // --- NEW AGGREGATED DATA ---
  if (context.stats) {
    if (context.stats.recentActivity.highScores) {
      const scores = Object.entries(context.stats.recentActivity.highScores)
        .map(([game, score]) => `- ${game}: ${score} pts`).join('\n');
      if (scores) {
        dynamicPrompt += `
             \n--- ASSOLIMENTS RECENTS (GAMIFICATION) ---
             L'usuari ha jugat recentment:
             ${scores}
             SI és una puntuació alta, FELICITA'L.
             `;
      }
    }

    if (context.stats.inferredState.anxietyLevel !== 'unknown') {
      dynamicPrompt += `
           \n--- ESTAT INFERIT ---
           Nivell d'Ansietat Estimat: ${context.stats.inferredState.anxietyLevel.toUpperCase()}
           Necessita ànims?: ${context.stats.inferredState.needsEncouragement ? 'SÍ' : 'NO'}
           `;
    }

    if (context.stats.recentActivity.lastDiaryDate) {
      dynamicPrompt += `
           L'última entrada al diari va ser: ${context.stats.recentActivity.lastDiaryDate.toLocaleDateString()}.
           `;
    }
  }

  if (context.currentFeeling) {
    dynamicPrompt += `
    ESTAT EMOCIONAL REPORTAT: "${context.currentFeeling}"
    `;
  }

  // --- MAP CONTEXT ---
  if (context.locations && context.locations.length > 0) {
    const safeLocs = context.locations.filter((l: any) => l.type === 'safe').map((l: any) => `- ${l.name} (${l.category}): ${l.description}`).join('\n');
    dynamicPrompt += `
      \n--- LLOCS SEGURS CONEGUTS ---
      L'usuari té aquests llocs al seu mapa:
      ${safeLocs}
      
      Si l'usuari pregunta per llocs per anar, RECOMANA aquests llocs.
      `;
  }

  dynamicPrompt += `
    \n\n--- INSTRUCCIONS ESPECÍFIQUES DE TERAPIA ---
    1. VALIDACIÓ: Sempre valida primer l'emoció de l'usuari.
    2. BREVETAT: No facis paràgrafs gegants. Sigues conversacional.
    3. LINKING: Si l'usuari està a la pàgina "${context.pageContext}", ofereix consells específics per aquesta eina.
    4. PERSONALITAT: Ets càlid, pacient i optimista. Utilitza metàfores visuals calmants. Ets conscient del progrés de l'usuari en els jocs.
    
    \n--- EINES DISPONIBLES (TOOLS) ---
    SI l'usuari et demana afegir un nou lloc al mapa o trobes un lloc rellevant a la conversa que l'usuari hauria de guardar:
    
    GENERA EL SEGÜENT TAG AL FINAL DE LA TEVA RESPOSTA:
    [ADD_LOCATION: {"name": "Nom del Lloc", "type": "safe", "category": "Categoria", "description": "Breu descripció", "lat": 41.3851, "lng": 2.1734}]
    
    NOTA: Inventa't coordenades properes a Barcelona (entre lat 41.38-41.40 i lng 2.15-2.20) si no tens dades exactes, però digues-li a l'usuari que després podrà moure el marcador si cal.
    Tipus pot ser 'safe' (Verd) o 'risk' (Vermell).
    `;

  // Use Firebase Vertex AI Model
  const model = getGenerativeModel(vertexAI, {
    model: "gemini-2.0-flash",
    systemInstruction: dynamicPrompt
  });

  try {
    // Validation: Vertex AI history MUST start with 'user'.
    // We filter out any initial 'model' messages (like the greeting).
    const validHistory = messages.slice(0, -1).filter((m, index, arr) => {
      // Keep if it's user, or if it's model but preceded by user (handled by natural flow, but start check is key)
      if (index === 0 && m.role === 'model') return false;
      return true;
    }).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Double check: if after filtering the first is still model (unlikely but possible if multiple model msgs start), remove it.
    while (validHistory.length > 0 && validHistory[0].role === 'model') {
      validHistory.shift();
    }

    const chat = model.startChat({
      history: validHistory
    });

    const lastMessage = messages[messages.length - 1].text;
    const result = await chat.sendMessageStream(lastMessage);
    return result.stream;

  } catch (error) {
    console.warn("Therapist model failed. Switching to EMERGENCY MOCK MODE.", error);

    // Mock Generator
    async function* mockGenerator() {
      const responses = [
        "T'escolto atentament. Com et fa sentir això?",
        "Sembla que estàs passant per un moment intens. Estic aquí.",
        "Podem explorar això junts. Què necessites ara mateix?",
        "La teva bateria sembla baixa. Què tal si descansem una mica?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const step = 20;
      for (let i = 0; i < randomResponse.length; i += step) {
        await new Promise(resolve => setTimeout(resolve, 50));
        yield { text: () => randomResponse.substring(i, i + step) };
      }
    }
    return mockGenerator();
  }
};

export interface SessionSummary {
  moodShift: string; // e.g., "Anxious -> Calm"
  keyInsights: string[];
  actionableStep: string;
}

export const generateSessionSummary = async (messages: ChatMessage[]): Promise<SessionSummary | null> => {
  try {
    const ai = getAiClient();
    const model = getGenerativeModel(vertexAI, {
      model: "gemini-2.0-flash",
      systemInstruction: "Ets un expert en psicologia clínica. Analitza la següent conversa i extreu-ne un resum estructurat."
    });

    // Filter only relevant messages content
    const conversationText = messages.map(m => `${m.role}: ${m.text}`).join('\n');

    const prompt = `
        Analitza aquesta sessió de teràpia breu i genera un resum JSON:
        CONVERSA:
        ${conversationText}

        FORMAT JSON REQUERIT:
        {
            "moodShift": "Descriu el canvi emocional (ex: 'De Aclaparat a Més Clar')",
            "keyInsights": ["Punt clau 1", "Punt clau 2 (màxim 3)"],
            "actionableStep": "Una acció concreta i petita que l'usuari ha acordat fer o que seria bona per ell."
        }
        
        Si la conversa és massa curta, inventa un resum plausible basat en el poc context.
        `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean markdown code blocks if present
    const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error generating session summary:", error);
    return {
      moodShift: "Estable",
      keyInsights: ["Sessió breu reflectiva", "Importància de l'autocura"],
      actionableStep: "Prendre un moment per respirar."
    };
  }
};