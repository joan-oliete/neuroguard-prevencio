export const COGNITIVE_CHALLENGES = [
    {
        distortion: "Si no jugo avui, perdona la ratxa i soc un fracassat.",
        type: "Pensament Polaritzat (Tot o Res)",
        correct_reframing: "La meva vàlua no depèn d'una ratxa. Descansar és part de l'èxit.",
        options: [
            "És veritat, he de jugar sigui com sigui.",
            "La meva vàlua no depèn d'una ratxa. Descansar és part de l'èxit.",
            "Potser puc jugar només una mica per no perdre-la."
        ],
        correctIndex: 1
    },
    {
        distortion: "Segur que tothom s'ho està passant bé menys jo.",
        type: "Lectura de Pensament / Sobregeneralització",
        correct_reframing: "Les xarxes mostren només el millor. Tothom té moments avorrits.",
        options: [
            "Sí, la meva vida és avorrida.",
            "Les xarxes mostren només el millor. Tothom té moments avorrits.",
            "Hauria de sortir més encara que no en tingui ganes."
        ],
        correctIndex: 1
    },
    {
        distortion: "M'he gastat 50€. Ara he de recuperar-los com sigui.",
        type: "Fal·làcia del Cost Enfonsat",
        correct_reframing: "Els diners ja s'han perdut. Jugar més només augmentarà la pèrdua.",
        options: [
            "Tinc un sistema per recuperar-ho.",
            "Els diners ja s'han perdut. Jugar més només augmentarà la pèrdua.",
            "Demana un préstec ràpid."
        ],
        correctIndex: 1
    }
];

export const VALUES_SCENARIOS = [
    {
        context: "Et conviden a una festa on saps que hi haurà consum.",
        dilemma: "El teu valor principal és la SALUT.",
        options: [
            { text: "Hi vaig però prometo no consumir.", alignment: "low" },
            { text: "Proposo un pla alternatiu d'esport als amics.", alignment: "high" },
            { text: "Em quedo a casa jugant a la consola.", alignment: "neutral" }
        ],
        feedback_high: "Perfecte! Has liderat amb el teu valor i creat una alternativa saludable."
    },
    {
        context: "Has rebut uns diners inesperats.",
        dilemma: "El teu valor principal és la SEGURETAT (Estalvi).",
        options: [
            { text: "Els poso directament al compte d'estalvi.", alignment: "high" },
            { text: "Em compro aquell joc que volia.", alignment: "low" },
            { text: "Convido als amics a sopar.", alignment: "neutral" }
        ],
        feedback_high: "Excel·lent. Prioritzar la seguretat futura et dona pau mental."
    }
];

export const ASSOCIATION_PAIRS = [
    { trigger: "Estrès Laboral", coping: "Pausa de 5 minuts" },
    { trigger: "Avorriment", coping: "Llegir un llibre" },
    { trigger: "Discussió", coping: "Trucar a un amic" },
    { trigger: "Solitud", coping: "Anar al parc" }
];

export const EMOTIONAL_SCENARIOS = [
    {
        text: "Sents una pressió al pit i les mans et suen abans de parlar en públic.",
        emotion: "Ansietat",
        options: ["Tristesa", "Ansietat", "Enuig", "Alegria"],
        feedback: "Correcte. Els símptomes físics indiquen una resposta d'alerta."
    },
    {
        text: "Et sents pesat, sense energia i res et motiva, ni tan sols el que abans t'agradava.",
        emotion: "Apatia/Tristesa",
        options: ["Apatia/Tristesa", "Por", "Calma", "Ràbia"],
        feedback: "Exacte. L'anhedonia (falta de plaer) és clau aquí."
    }
];
