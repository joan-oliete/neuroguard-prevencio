export const TREATMENT_DATA = [
    { name: "Joc d'apostes", value: 75, fill: '#ea580c' },
    { name: 'Xarxes/Pantalles', value: 15, fill: '#3b82f6' },
    { name: 'Altres', value: 10, fill: '#94a3b8' },
];

export const RISK_DATA = [
    { name: 'Risc Elevat', value: 13.2, color: '#ef4444' },
    { name: 'Risc Moderat', value: 33.5, color: '#f59e0b' },
    { name: 'Sense Risc', value: 53.3, color: '#10b981' },
];

export const GENDER_COMPARISON_DATA = [
    { name: 'Pornografia', nois: 78.4, noies: 41.2 },
    { name: 'Joc Online', nois: 15.0, noies: 4.0 },
    { name: 'Ús Excessiu Xarxes', nois: 39.2, noies: 42.7 },
    { name: 'Malestar Emocional', nois: 24.7, noies: 53.0 },
];

export const MOOD_EVOLUTION_DATA = [
    { year: '2015', noies: 68.5, nois: 81.5 },
    { year: '2019', noies: 60.5, nois: 78.7 },
    { year: '2022', noies: 44.9, nois: 72.6 },
];

export const SEXTORTION_DATA = [
    { name: 'Noies (Contingut)', value: 35.6, fill: '#ec4899' },
    { name: 'Nois (Diners)', value: 26.5, fill: '#3b82f6' },
];

export const EVOLUTION_DATA = [
    { year: '2019', requests: 120 },
    { year: '2020', requests: 150 },
    { year: '2021', requests: 180 },
    { year: '2022', requests: 210 },
    { year: '2023', requests: 238 },
];

export const ADDICTION_DETAILS: Record<string, any> = {
    gambling: {
        title: "Joc d'Atzar en Línia",
        icon: "🎲",
        color: "bg-indigo-50 border-indigo-200 text-indigo-800",
        gradient: "from-indigo-500 to-blue-500",
        description: "La ludopatia digital elimina les barreres físiques del joc tradicional. El joc esdevé un espai de construcció de 'masculinitat de risc'.",
        mechanisms: [
            { title: "Immediatesa", desc: "La reducció del temps entre l'aposta i el resultat augmenta la capacitat addictiva." },
            { title: "Pagament Invisible", desc: "L'ús de targetes de crèdit o moneders virtuals redueix la percepció de pèrdua de diners reals." },
            { title: "Publicitat Agressiva", desc: "Bonificacions i anuncis personalitzats que exploten la vulnerabilitat cognitiva." }
        ],
        risks: ["Deutes econòmics greus", "Mentides i manipulació familiar", "Activitats delictives per finançar el joc", "Construcció de masculinitat tòxica"],
        traps: ["Tinc un sistema infal·lible", "He de recuperar el que he perdut", "Avui és el meu dia de sort"]
    },
    screens: {
        title: "Pantalles i Xarxes Socials",
        icon: "📱",
        color: "bg-blue-50 border-blue-200 text-blue-800",
        gradient: "from-blue-400 to-indigo-500",
        description: "Una dependència caracteritzada per la necessitat de validació. Afecta desproporcionadament les noies a través de la pressió estètica.",
        mechanisms: [
            { title: "Reforç Intermitent", desc: "El 'scroll infinit' i les notificacions funcionen com una màquina escurabutxaques cerebral." },
            { title: "Paradoxa de Connexió", desc: "Més ús de xarxes per buscar vincle sovint resulta en més aïllament i pressió." },
            { title: "Validació Quantificable", desc: "L'autoestima es lliga al nombre de 'likes' i seguidors." }
        ],
        risks: ["Aïllament social real", "Trastorns alimentaris (pressió estètica)", "Cyberbullying i assetjament", "Dismòrfia corporal"],
        traps: ["Només cinc minuts més", "Si no ho penjo, no ha passat", "Tothom ho està fent"]
    },
    gaming: {
        title: "Videojocs",
        icon: "🎮",
        color: "bg-purple-50 border-purple-200 text-purple-800",
        gradient: "from-purple-500 to-violet-600",
        description: "L'ús excessiu de videojocs que interfereix en la vida diària. Els MMORPGs i MOBA són els més addictius per la seva naturalesa social i competitiva.",
        mechanisms: [
            { title: "Sistemes de Loot Boxes", desc: "Mecàniques d'atzar integrades (caixes de botí) que imiten el joc d'apostes." },
            { title: "Immersió i Flux", desc: "Estats d'alta concentració que fan perdre la noció del temps i les necessitats físiques." },
            { title: "Identitat Virtual", desc: "Preferència per l'avatar online sobre el 'jo' real a causa de l'èxit assolit al joc." }
        ],
        risks: ["Abandonament escolar", "Sedentarisme extrem", "Agressivitat per abstinència", "Despesa econòmica en microtransaccions"],
        traps: ["No puc deixar la partida a mitges", "Això millora les meves habilitats", "És la meva única forma de socialitzar"]
    },
    shopping: {
        title: "Compres (Oniomania)",
        icon: "🛍️",
        color: "bg-pink-50 border-pink-200 text-pink-800",
        gradient: "from-pink-400 to-rose-500",
        description: "Compra repetitiva utilitzada com a regulador emocional. La tecnologia facilita la impulsivitat amb botigues obertes 24/7.",
        mechanisms: [
            { title: "Facilitat d'Accés", desc: "Pagaments en un clic i enviaments ràpids eliminen la reflexió." },
            { title: "Il·lusió d'Estalvi", desc: "Ofertes flash i descomptes que creen urgència artificial." },
            { title: "Dopamina de l'Anticipació", desc: "El plaer resideix en la cerca i l'espera del paquet, no en l'ús del producte." }
        ],
        risks: ["Acumulació d'objectes innecessaris", "Problemes financers greus", "Sentiment de culpa post-compra"],
        traps: ["M'ho mereixo", "Està d'oferta, estalvio diners", "Això em farà sentir millor"]
    },
    porn: {
        title: "Pornografia i CSAM",
        icon: "🔞",
        color: "bg-red-50 border-red-200 text-red-800",
        gradient: "from-red-500 to-rose-700",
        description: "Consum compulsiu que distorsiona la sexualitat. Cal distingir entre pornografia legal i CSAM (Material d'Abús Sexual Infantil).",
        mechanisms: [
            { title: "Efecte Coolidge", desc: "La novetat constant de contingut manté l'excitació dopaminèrgica artificialment alta." },
            { title: "Escalada", desc: "Necessitat de contingut més extrem o violent per aconseguir la mateixa excitació (tolerància)." },
            { title: "Anonimat Dissociatiu", desc: "\"El que faig aquí no soc jo\". Separació de la identitat real de la digital." }
        ],
        risks: ["Disfuncions sexuals", "Normalització de la violència", "Consum accidental o buscat de CSAM (delicte)", "Cosificació"],
        traps: ["És natural, tothom ho mira", "Només és una fantasia", "Això m'ensenya com funciona el sexe"]
    },
    emotional: {
        title: "Dependència Emocional i Cibersexe",
        icon: "❤️‍🔥",
        color: "bg-rose-50 border-rose-200 text-rose-800",
        gradient: "from-rose-400 to-pink-600",
        description: "Necessitat patològica de validació a través de vincles digitals, sovint tòxics o basats en el 'sexting'.",
        mechanisms: [
            { title: "Reforç Intermitent", desc: "L'atenció impredictible (ara et contesto, ara t'ignoro) genera una addicció molt potent." },
            { title: "Idealització", desc: "Omplir els buits d'informació digital amb fantasies sobre l'altra persona." },
            { title: "Por a la Soledat", desc: "Ús de relacions virtuals com a ansiolític per evitar estar amb un mateix." }
        ],
        risks: ["Relacions tòxiques", "Sextorsió (xantatge amb imatges)", "Pèrdua d'identitat", "Ansietat severa"],
        traps: ["Sense ell/a no soc res", "Si envio aquesta foto m'estimarà més", "Només necessito que em contesti"]
    },
    work: {
        title: "Addicció al Treball (Workaholism)",
        icon: "💼",
        color: "bg-slate-50 border-slate-200 text-slate-800",
        gradient: "from-slate-500 to-gray-700",
        description: "Obsessió pel treball afavorida per la tecnologia que permet la connexió laboral permanent.",
        mechanisms: [
            { title: "Èxit com a vàlua", desc: "Confondre el rendiment professional amb el valor com a persona." },
            { title: "Por al buit", desc: "Utilitzar la feina per evitar problemes personals o emocionals." },
            { title: "Ubiquitat Digital", desc: "Portar l'oficina a la butxaca fa impossible la desconnexió real." }
        ],
        risks: ["Burnout (Síndrome del cremat)", "Deteriorament familiar i social", "Problemes cardiovasculars", "Estrès crònic"],
        traps: ["Soc imprescindible", "Només contesto aquest mail i plego", "Descansar és perdre el temps"]
    }
};
