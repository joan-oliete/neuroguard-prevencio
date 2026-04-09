
export interface StoryChapter {
    id: number;
    title: string;
    content: string;
    levelRequired: number;
    image?: string; // Placeholder for future DALL-E images
}

export const NEURO_STORY: StoryChapter[] = [
    {
        id: 1,
        title: "El Despertar",
        content: "Has sentit la crida. En un món saturat de soroll digital i ansietat, la teva ment ha començat a despertar-se. Ets un NeuroGuard, un protector de la teva pròpia pau mental. Aquest és el primer pas: reconèixer que tens el poder de canviar la teva arquitectura cerebral.",
        levelRequired: 1
    },
    {
        id: 2,
        title: "La Boira de Cortisol",
        content: "L'enemic no és fora, és dins. El 'Burnout' és una boira espessa feta de cortisol. Has après a utilitzar les teves primeres armes: la respiració i l'atenció plena. La boira comença a dissipar-se, revelant un camí cap a la claredat.",
        levelRequired: 2
    },
    {
        id: 3,
        title: "Els Arquitectes de la Calma",
        content: "No estàs sol. Els antics mestres de la serenitat van deixar mapes: els teus manuals d'addicció i protocols. Ara comences a entendre'ls no com a normes, sinó com a eines de construcció. Estàs reescrivint el codi de la teva ment.",
        levelRequired: 3
    },
    {
        id: 4,
        title: "La Fortalesa de Dopamina",
        content: "Has descobert el secret de la recompensa sana. Ja no busques el 'clic' ràpid, sinó la satisfacció de l'esforç. Has construït la teva primera fortalesa mental. Els impulsos xoquen contra els teus murs i es trenquen.",
        levelRequired: 5
    },
    {
        id: 5,
        title: "Mestre del Flux",
        content: "La teva ment ja no és un camp de batalla, és un jardí zen. Pots entrar en estat de 'Flow' a voluntat. La tecnologia ja no et domina; tu la domines a ella. Ets un veritable NeuroGuard.",
        levelRequired: 10
    }
];
