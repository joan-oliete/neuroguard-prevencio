export interface Location {
    id: string; // Changed from number to string for Firestore compatibility
    name: string;
    type: 'risk' | 'safe';
    category: string;
    lat: number;
    lng: number;
    description: string;
}

export const MOCK_LOCATIONS: Location[] = [
    // Riscos (Red)
    { id: '1', name: "Sala de Bingo 'La Sort'", type: 'risk', category: 'Apostes', lat: 41.3851, lng: 2.1734, description: "Zona d'alt risc. Evita passar per aquí." },
    { id: '2', name: "Bar 'El Dau'", type: 'risk', category: 'Alcohol', lat: 41.3870, lng: 2.1680, description: "Ambient molt carregat d'alcohol." },
    { id: '3', name: "Casino City", type: 'risk', category: 'Apostes', lat: 41.3900, lng: 2.1800, description: "Perill extrem. Casino gran." },

    // Recursos (Green)
    { id: '4', name: "Biblioteca Central", type: 'safe', category: 'Cultura', lat: 41.3825, lng: 2.1700, description: "Espai tranquil per llegir i relaxar-se." },
    { id: '5', name: "Gimnàs Municipal", type: 'safe', category: 'Esport', lat: 41.3880, lng: 2.1600, description: "Bon lloc per cremar ansietat fent esport." },
    { id: '6', name: "CAP Gòtic", type: 'safe', category: 'Salut', lat: 41.3840, lng: 2.1750, description: "Centre d'Atenció Primària." },
    { id: '7', name: "Parc de la Ciutadella", type: 'safe', category: 'Natura', lat: 41.3885, lng: 2.1870, description: "Natura i aire lliure. Ideal per passejar." },
    { id: '8', name: "CAS Baluard", type: 'safe', category: 'Salut', lat: 41.3750, lng: 2.1790, description: "Centre d'Atenció i Seguiment." },
];
