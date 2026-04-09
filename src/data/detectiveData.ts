
import { Brain, CloudRain, Zap, Heart, Frown, Smile, AlertTriangle, Shield, Clock, Battery, Users } from 'lucide-react';

export interface DetectiveCard {
    id: string;
    name: string; // e.g., "Ansietat"
    type: 'Emotion' | 'Distortion';
    description: string;
    imageColor: string;
    icon: any;
    attributes: {
        valence: 'Positive' | 'Negative' | 'Neutral';
        time: 'Future' | 'Past' | 'Present';
        energy: 'High' | 'Low';
        source: 'Internal' | 'External';
    };
}

export const DETECTIVE_CARDS: DetectiveCard[] = [
    // --- EMOTIONS ---
    {
        id: 'anxiety',
        name: 'Ansietat',
        type: 'Emotion',
        description: 'Por o inquietud davant d\'una amenaça futura incerta.',
        imageColor: 'bg-amber-500',
        icon: Zap,
        attributes: {
            valence: 'Negative',
            time: 'Future',
            energy: 'High',
            source: 'Internal'
        }
    },
    {
        id: 'sadness',
        name: 'Tristesa',
        type: 'Emotion',
        description: 'Dolor emocional per una pèrdua o decepció.',
        imageColor: 'bg-blue-500',
        icon: CloudRain,
        attributes: {
            valence: 'Negative',
            time: 'Past',
            energy: 'Low',
            source: 'Internal'
        }
    },
    {
        id: 'anger',
        name: 'Ira',
        type: 'Emotion',
        description: 'Resposta intensa davant d\'una injustícia o bloqueig.',
        imageColor: 'bg-red-500',
        icon: AlertTriangle,
        attributes: {
            valence: 'Negative',
            time: 'Present',
            energy: 'High',
            source: 'External'
        }
    },
    {
        id: 'joy',
        name: 'Alegria',
        type: 'Emotion',
        description: 'Sensació de benestar i satisfacció.',
        imageColor: 'bg-yellow-400',
        icon: Smile,
        attributes: {
            valence: 'Positive',
            time: 'Present',
            energy: 'High',
            source: 'Internal'
        }
    },
    {
        id: 'guilt',
        name: 'Culpa',
        type: 'Emotion',
        description: 'Remordiment per haver fet alguna cosa malament.',
        imageColor: 'bg-slate-500',
        icon: Frown,
        attributes: {
            valence: 'Negative',
            time: 'Past',
            energy: 'Low',
            source: 'Internal'
        }
    },
    {
        id: 'calm',
        name: 'Calma',
        type: 'Emotion',
        description: 'Estat de pau i absència d\'agitació.',
        imageColor: 'bg-emerald-500',
        icon: Shield,
        attributes: {
            valence: 'Positive',
            time: 'Present',
            energy: 'Low',
            source: 'Internal'
        }
    },

    // --- DISTORTIONS ---
    {
        id: 'catastrophizing',
        name: 'Catastrofisme',
        type: 'Distortion',
        description: 'Esperar sempre el pitjor escenari possible.',
        imageColor: 'bg-purple-600',
        icon: CloudRain,
        attributes: {
            valence: 'Negative',
            time: 'Future',
            energy: 'High',
            source: 'Internal'
        }
    },
    {
        id: 'black_white',
        name: 'Tot o Res',
        type: 'Distortion',
        description: 'Veure les coses en extrems, sense matisos.',
        imageColor: 'bg-slate-900',
        icon: Brain,
        attributes: {
            valence: 'Negative',
            time: 'Present',
            energy: 'Low',
            source: 'Internal'
        }
    }
];

export const QUESTION_CATEGORIES = [
    {
        label: 'Temps',
        key: 'time',
        options: [
            { label: 'Es preocupa pel Futur?', value: 'Future' },
            { label: 'Està ancorat al Passat?', value: 'Past' },
            { label: 'Succeeix en el Present?', value: 'Present' }
        ]
    },
    {
        label: 'Energia',
        key: 'energy',
        options: [
            { label: 'Té Energia Alta (Agitació)?', value: 'High' },
            { label: 'Té Energia Baixa (Fatiga)?', value: 'Low' }
        ]
    },
    {
        label: 'València',
        key: 'valence',
        options: [
            { label: 'És una sensació Positiva?', value: 'Positive' },
            { label: 'És una sensació Negativa?', value: 'Negative' }
        ]
    }
];
