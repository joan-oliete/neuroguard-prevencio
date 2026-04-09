import { RoleplayScenario } from '../types';

export const STATIC_SCENARIOS: Record<string, RoleplayScenario[]> = {
    "Apostes Esportives": [
        {
            id: "gambling_01",
            context: "Estàs mirant el partit de futbol amb els amics al bar. El resultat està molt ajustat.",
            npc_dialogue: "Ei, va, posa-li 10€ que remunten segur! Et doblo la pasta si guanyen. No siguis cagat!",
            options: [
                {
                    text: "No, gràcies. Gaudeixo del partit sense perdre diners.",
                    feedback: "Molt bé! Has mantingut el límit i has separat l'esport de les apostes. Això reforça el teu autocontrol.",
                    score_impact: 15
                },
                {
                    text: "Vinga, va, però només 5€.",
                    feedback: "Compte. Acceptar, encara que sigui poc, reforça l'hàbit i la pressió social. La pròxima vegada serà més difícil dir que no.",
                    score_impact: -5
                },
                {
                    text: "Calla ja, pesat! Sempre igual!",
                    feedback: "Has dit que no, però amb agressivitat. Això pot generar conflicte. L'assertivitat busca el respecte mutu.",
                    score_impact: 5
                }
            ],
            backgroundId: 'bg_bar',
            characterId: 'char_friend',
            emotion: 'happy'
        },
        {
            id: "gambling_02",
            context: "Un influencer famós a TikTok està promocionant una nova casa d'apostes amb un 'bo de benviguda' increïble.",
            npc_dialogue: "(Vídeo) Xavals, real, he guanyat 500 pavos en 10 minuts. Registreu-vos amb el meu enllaç i us regalen 50€ gratis. A què espereu?",
            options: [
                {
                    text: "Denunciar el vídeo com a spam/perillós i fer scroll.",
                    feedback: "Excel·lent. Identifiques la manipulació del màrqueting i prens acció per protegir-te a tu i als altres.",
                    score_impact: 20
                },
                {
                    text: "Només miraré la web, per curiositat...",
                    feedback: "La curiositat és el primer pas cap a la recaiguda. Aquestes webs estan dissenyades per atrapar-te visualment.",
                    score_impact: -5
                },
                {
                    text: "Bah, segur que és mentida, però kina ràbia que guanyi tant.",
                    feedback: "És normal sentir enveja o ràbia, però recorda que ells cobren per dir això. La realitat és que la casa sempre guanya.",
                    score_impact: 10
                }
            ]
        },
        {
            id: "gambling_03",
            context: "Estàs avorrit a casa un diumenge a la tarda. No fan res a la tele i tens el mòbil a la mà.",
            npc_dialogue: "(Notificació al mòbil) 🔔 BONUS DE CAP DE SETMANA! Tens 5 girs gratuïts a la Ruleta de la Sort. Caduca en 1 hora!",
            options: [
                {
                    text: "Esborrar la notificació i bloquejar l'app.",
                    feedback: "Decisió ferma. Eliminar el detonant immediatament és la millor estratègia de prevenció.",
                    score_impact: 15
                },
                {
                    text: "Entraré només a gastar els girs gratis, i ja està.",
                    feedback: "Error clàssic. Els girs gratis són l'esquer. Un cop a dins, el teu cervell voldrà continuar jugant.",
                    score_impact: -10
                },
                {
                    text: "Trucaré a un amic per sortir a fer un tomb.",
                    feedback: "Fantàstic! Has substituït una activitat de risc per una de saludable i social (Conducta Alternativa).",
                    score_impact: 20
                }
            ]
        }
    ],
    "Pressió Alcohol": [
        {
            id: "alcohol_01",
            context: "És la festa major. Tothom porta gots grans. Tu tens la teva aigua o refresc.",
            npc_dialogue: "Però què fas amb això? Sembla que tinguis 12 anys! Tasta aquest cubata, va, que no passa res per un dia.",
            options: [
                {
                    text: "M'ho passo bé igual sense beure, gràcies.",
                    feedback: "Excel·lent. Has validat la teva elecció sense atacar l'altre. Això demostra una gran seguretat en tu mateix.",
                    score_impact: 15
                },
                {
                    text: "Bé, només un glop per provar...",
                    feedback: "Risc detectat. 'Només un glop' és la porta d'entrada més comuna a la recaiguda social. Fes servir la tècnica del disc ratllat.",
                    score_impact: -10
                },
                {
                    text: "No vull beure, deixa'm estar.",
                    feedback: "Bona negativa, clara i directa. Potser una mica seca, però efectiva per protegir-te.",
                    score_impact: 10
                }
            ],
            backgroundId: 'bg_park',
            characterId: 'char_friend',
            emotion: 'happy'
        },
        {
            id: "alcohol_02",
            context: "Sopar d'equip després de l'entrenament. Tothom demana cerveses.",
            npc_dialogue: "Va, no siguis l'únic 'soso' que demana Coca-Cola. Una canya per recuperar sals minerals!",
            options: [
                {
                    text: "Una Coca-Cola Zero per mi, gràcies.",
                    feedback: "Simple i efectiu. No cal donar explicacions si no vols. Mantenir la comanda ferma és clau.",
                    score_impact: 10
                },
                {
                    text: "L'alcohol deshidrata, de fet. Prefereixo estar a tope demà.",
                    feedback: "Molt bé! Utilitzar dades objectives (rendiment esportiu) és una gran excusa que sol ser respectada.",
                    score_impact: 15
                },
                {
                    text: "D'acord, porteu-me una clara.",
                    feedback: "Has cedit a la pressió de grup per no sentir-te exclòs. Això debilita la teva autoimatge.",
                    score_impact: -5
                }
            ],
            backgroundId: 'bg_bar',
            characterId: 'char_friend',
            emotion: 'happy'
        },
        {
            id: "alcohol_03",
            context: "Estàs a casa d'un amic abans de sortir (previa). Treuen una ampolla de xupitos.",
            npc_dialogue: "Brindis per l'amistat! Qui no begui és que no ens estima! Vaaaa, cul sec!",
            options: [
                {
                    text: "Aixecar el meu got (sense alcohol) i brindar igual.",
                    feedback: "Intel·ligent. Participes en el ritual social (el brindis) sense comprometre els teus valors de salut.",
                    score_impact: 15
                },
                {
                    text: "Si m'estimeu, respectareu que no vulgui beure.",
                    feedback: "Assertivitat d'alt nivell. Poses el límit en el respecte mutu, girant l'argument.",
                    score_impact: 20
                },
                {
                    text: "Vale, però només mig xupito.",
                    feedback: "Negociar amb la pressió sol acabar perdent. Mig xupito ja és consum.",
                    score_impact: -10
                }
            ],
            backgroundId: 'bg_gamer_room', // Using room as fallback for indoor house
            characterId: 'char_friend',
            emotion: 'happy'
        }
    ],
    "Consum Cànnabis": [
        {
            id: "cannabis_01",
            context: "Sortint de l'institut, aneu al parc de sempre. Algú encén un porro i te'l passa.",
            npc_dialogue: "Té, fes-li una calada. T'ajudarà a relaxar-te després de l'examen de mates.",
            options: [
                {
                    text: "No, passo. Tinc altres maneres de relaxar-me.",
                    feedback: "Perfecte. Has rebutjat l'oferta i alhora has reafirmat que tens els teus propis mecanismes de regulació.",
                    score_impact: 15
                },
                {
                    text: "No sé... potser després.",
                    feedback: "Dubtar et fa un blanc fàcil per a més pressió. Un 'No' rotund és més fàcil de respectar.",
                    score_impact: -5
                },
                {
                    text: "Dona'm, que estic molt estressat.",
                    feedback: "L'ús de substàncies per gestionar l'estès (automedicació) crea una dependència molt forta. Busca alternatives saludables.",
                    score_impact: -10
                }
            ],
            backgroundId: 'bg_park',
            characterId: 'char_friend',
            emotion: 'neutral'
        },
        {
            id: "cannabis_02",
            context: "Estàs jugant a la consola a casa d'un col·lega. Ell encén un porro.",
            npc_dialogue: "Tio, és natural, ve de la terra. No és com la química. Això no fa mal, al contrari, cura.",
            options: [
                {
                    text: "Natural no vol dir innocu. L'opi també és natural.",
                    feedback: "Bona rèplica lògica. Desmuntar mites és útil, tot i que no cal entrar en debat si no vols.",
                    score_impact: 10
                },
                {
                    text: "Respecto la teva opinió, però jo decideixo no fumar. Si fumes, obre la finestra, si us plau.",
                    feedback: "Molt bé. Poses límits al teu espai i salut sense jutjar l'altre excessivament.",
                    score_impact: 15
                },
                {
                    text: "Tens raó, passa-m'ho.",
                    feedback: "Has caigut en la 'Falsedat Naturalista'. Recorda que el cànnabis afecta el desenvolupament cerebral adolescent.",
                    score_impact: -10
                }
            ],
            backgroundId: 'bg_gamer_room',
            characterId: 'char_friend',
            emotion: 'neutral'
        },
        {
            id: "cannabis_03",
            context: "És divendres nit i no tens plans. Et sents sol i avorrit a l'habitació.",
            npc_dialogue: "(Pensament intern) Em podria pillar un gram... només per avui, per dormir millor i no pensar en res.",
            options: [
                {
                    text: "Reconec aquest pensament com una trampa. Em posaré una peli.",
                    feedback: "Això és 'Metacognició'! Detectar el pensament intrusiu i no fer-li cas és l'èxit definitiu.",
                    score_impact: 20
                },
                {
                    text: "Sortiré a córrer o caminar 20 minuts.",
                    feedback: "l'Exercici allibera endorfines naturals que combaten l'avorriment i l'ansietat millor que qualsevol substància.",
                    score_impact: 15
                },
                {
                    text: "Va, envio un WhatsApp al contacte.",
                    feedback: "Recaiguda iniciada. L'avorriment és un detonant comú, però la solució no és evadir-se, sinó ocupar-se.",
                    score_impact: -15
                }
            ],
            backgroundId: 'bg_gamer_room',
            characterId: 'char_dealer', // Represents the "Internal Dealer" or "Self" shadow
            emotion: 'suspicious'
        }
    ],
    "Loot Boxes / Gacha": [
        {
            id: "loot_01",
            context: "Estàs jugant al teu joc preferit. Ha sortit una skin llegendària per temps limitat.",
            npc_dialogue: "(Xat del joc) Bro, has vist la nova skin? Jo he tirat 20€ i m'ha tocat! Pilla-la que s'acaba avui!",
            options: [
                {
                    text: "Felicitats! Jo passo, no vull gastar en aleatorietat.",
                    feedback: "Molt madur. Reconeixes que és un joc d'atzar ('aleatorietat') camuflat i protegeixes la teva cartera.",
                    score_impact: 15
                },
                {
                    text: "Uff, és guapíssima... Va, poso 5€ a veure si hi ha sort.",
                    feedback: "Caure en el 'FOMO' (Fear Of Missing Out) és exactament el que volen els dissenyadors del joc. Has perdut el control.",
                    score_impact: -10
                },
                {
                    text: "AQUEST JOC ÉS UNA ESTAFA!",
                    feedback: "Tens raó, però enfadar-te al xat no t'ajuda. Millor ignorar la promoció amb calma.",
                    score_impact: 5
                }
            ],
            backgroundId: 'bg_gamer_room',
            characterId: 'char_friend',
            emotion: 'happy'
        },
        {
            id: "loot_02",
            context: "Has perdut 3 partides seguides. El joc et suggereix comprar un 'Pack d'avantatge' per millorar.",
            npc_dialogue: "Joc: 'Sembla que necessites una empenta. Compra el Pack Novell per 2.99€ i guanya més ràpid!'",
            options: [
                {
                    text: "Tancar el joc i respirar. Estic 'tiltat' (frustrat).",
                    feedback: "Brillant. Identificar la frustració i parar és el millor que pot fer un gamer professional.",
                    score_impact: 20
                },
                {
                    text: "És molt barat, només 3 euros... ho compro.",
                    feedback: "Això es diu 'Pay-to-Win' i és un pou sense fons. Avui són 3, demà seran 10 per mantenir el nivell.",
                    score_impact: -5
                },
                {
                    text: "Seguir jugant enfadat sense comprar.",
                    feedback: "Millor que comprar, però jugar frustrat sol portar a perdre més i augmentar les ganes de pagar.",
                    score_impact: 5
                }
            ],
            backgroundId: 'bg_gamer_room',
            characterId: 'char_dealer', // Represents the "Game System" temptation
            emotion: 'neutral'
        },
        {
            id: "loot_03",
            context: "Estàs veient un streamer obrint caixes (Crate Opening) en directe.",
            npc_dialogue: "Streamer: 'OMG!! M'ha tocat el ganivet daurat! Xavals, això val 500 euros! És el meu dia de sort!'",
            options: [
                {
                    text: "Canviar de canal/stream.",
                    feedback: "Evitar l'exposició a contingut que glorifica l'atzar és una estratègia de protecció molt eficaç.",
                    score_impact: 15
                },
                {
                    text: "Pensar: 'Ell n'ha obert 100 per guanyar-ne 1'.",
                    feedback: "Anàlisi crítica de la realitat. Veus el que hi ha darrere de l'espectacle: pèrdues massives.",
                    score_impact: 10
                },
                {
                    text: "Va, obriré jo una caixa a veure si em toca.",
                    feedback: "Has caigut en l'efecte imitació. El seu èxit (probablement patrocinat) no garanteix el teu.",
                    score_impact: -10
                }
            ],
            backgroundId: 'bg_gamer_room',
            characterId: 'char_friend',
            emotion: 'happy'
        }
    ]
};

export const getRandomScenario = (topic: string): RoleplayScenario => {
    const scenarios = STATIC_SCENARIOS[topic] || STATIC_SCENARIOS["Apostes Esportives"]; // Fallback
    return scenarios[Math.floor(Math.random() * scenarios.length)];
};
