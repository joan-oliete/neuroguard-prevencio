
import React, { useState } from 'react';
import { UserProfile, Course } from '../../types';
import { Play, CheckCircle, HelpCircle, Trophy, ArrowRight, X, Clock, Award, BookOpen, AlertCircle, Lock, Download, FileText, Share2, Star, Video, Loader } from 'lucide-react';
import { generateEducationalVideo } from '../../services/geminiService';

// --- TYPES EXTENDED FOR THIS COMPONENT ---

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface CourseResource {
  title: string;
  type: 'pdf' | 'audio' | 'link';
  size?: string;
}

interface CourseModule {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
  content: string;
  videoUrl?: string; // New field for generated video
}

interface ExtendedCourse extends Course {
  description: string;
  difficulty: 'Principiant' | 'Intermedi' | 'Avançat';
  modules: CourseModule[];
  quiz: QuizQuestion[];
  resources: CourseResource[];
  minLevelReq?: number; // Level required to unlock
}

// --- DATA ---

const INITIAL_COURSES_DATA: ExtendedCourse[] = [
  {
    id: 'c1',
    title: 'Neurociència de l\'Addicció',
    category: 'Ciència',
    duration: '15 min',
    imageColor: 'from-purple-600 to-indigo-800',
    icon: '🧠',
    completed: false,
    points: 500,
    difficulty: 'Intermedi',
    description: "Entén com la dopamina i el circuit de recompensa del cervell es veuen alterats per les pantalles i el joc, i com la neuroplasticitat et permet recuperar-te.",
    modules: [
      {
        id: 1,
        title: "El circuit de recompensa",
        duration: "5:00",
        thumbnail: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800",
        content: "El nostre cervell està dissenyat per buscar recompenses. Quan fem alguna cosa que ens agrada, alliberem dopamina. Les addiccions segresten aquest sistema, generant pics artificials que fan que les activitats quotidianes semblin avorrides."
      },
      {
        id: 2,
        title: "Tolerància i Abstinència",
        duration: "4:30",
        thumbnail: "https://images.unsplash.com/photo-1527610267748-263346986318?auto=format&fit=crop&q=80&w=800",
        content: "Amb el temps, el cervell s'adapta a l'excés de dopamina reduint els receptors (downregulation). Això provoca que necessitis més estimulació per sentir el mateix (tolerància) i et sentis malament sense ella (abstinència)."
      }
    ],
    resources: [
        { title: "Esquema del Cervell Addicte (PDF)", type: "pdf", size: "1.2 MB" },
        { title: "Podcast: Entrevista a Neurocientífic", type: "audio", size: "15 min" }
    ],
    quiz: [
      {
        id: 1,
        question: "Quina substància química és la principal responsable de la sensació de plaer i motivació?",
        options: ["Adrenalina", "Dopamina", "Cortisol", "Melatonina"],
        correctAnswer: 1,
        explanation: "La dopamina és el neurotransmissor clau en el circuit de recompensa que ens motiva a repetir conductes."
      },
      {
        id: 2,
        question: "Què és la 'neuroplasticitat' en el context de la recuperació?",
        options: ["La capacitat del cervell de canviar i curar-se", "Un tipus de medicament", "La mort de neurones", "Un implant cerebral"],
        correctAnswer: 0,
        explanation: "La neuroplasticitat és la capacitat del cervell per formar noves connexions sinàptiques, permetent aprendre nous hàbits i recuperar-se de l'addicció."
      }
    ]
  },
  {
    id: 'c2',
    title: 'Focus i Deep Work',
    category: 'Productivitat',
    duration: '10 min',
    imageColor: 'from-blue-500 to-cyan-600',
    icon: '⚡',
    completed: true,
    points: 300,
    difficulty: 'Principiant',
    description: "Aprèn a recuperar la teva capacitat de concentració en un món ple de distraccions digitals. Tècniques pràctiques per a l'estudi i la feina.",
    modules: [
      {
        id: 1,
        title: "Els lladres d'atenció",
        duration: "3:00",
        thumbnail: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&q=80&w=800",
        content: "Les notificacions, el multitasking i el 'fear of missing out' (FOMO) fragmenten la teva atenció. Cada cop que canvies de tasca, el teu cervell triga uns 20 minuts a tornar a enfocar-se al 100%."
      }
    ],
    resources: [
        { title: "Plantilla d'Horari de Blocatge (PDF)", type: "pdf", size: "0.5 MB" }
    ],
    quiz: [
        {
            id: 1,
            question: "Quina és la millor estratègia per treballar profundament?",
            options: ["Tenir el correu obert sempre", "Multitasking", "Blocs de temps sense distraccions", "Treballar 10 hores sense parar"],
            correctAnswer: 2,
            explanation: "El treball profund (Deep Work) requereix períodes ininterromputs de concentració, eliminant qualsevol distracció externa."
        }
    ]
  },
  {
    id: 'c3',
    title: 'Higiene del Son Digital',
    category: 'Benestar',
    duration: '12 min',
    imageColor: 'from-indigo-900 to-slate-800',
    icon: '🌙',
    completed: false,
    points: 450,
    difficulty: 'Principiant',
    description: "Descobreix com la llum blava de les pantalles afecta els teus cicles circadians i aprèn rutines per descansar millor.",
    modules: [
        {
            id: 1,
            title: "Llum blava i Melatonina",
            duration: "6:00",
            thumbnail: "https://images.unsplash.com/photo-1541781777631-fa182f807330?auto=format&fit=crop&q=80&w=800",
            content: "La llum blava emesa pels dispositius enganya el teu cervell fent-li creure que és de dia, suprimint la producció de melatonina, l'hormona necessària per dormir."
        }
    ],
    resources: [],
    quiz: [
        {
            id: 1,
            question: "Quant temps abans de dormir hauries de deixar les pantalles?",
            options: ["5 minuts", "Almenys 1 hora", "Només si tinc son", "No afecta"],
            correctAnswer: 1,
            explanation: "Els experts recomanen deixar les pantalles almenys una hora abans per permetre que la melatonina pugi naturalment."
        }
    ]
  },
  {
    id: 'c4',
    title: 'Gestió Financera Anti-Joc',
    category: 'Seguretat',
    duration: '20 min',
    imageColor: 'from-emerald-600 to-green-800',
    icon: '🛡️',
    completed: false,
    points: 800,
    difficulty: 'Avançat',
    minLevelReq: 5,
    description: "Eines per protegir els teus diners. Com funcionen les probabilitats reals del joc i com establir barreres d'accés als fons.",
    modules: [
        {
            id: 1,
            title: "La fal·làcia del jugador",
            duration: "8:00",
            thumbnail: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800",
            content: "Creure que si ha sortit 'vermell' 10 vegades, ara toca 'negre' és fals. Les probabilitats no tenen memòria. La casa sempre té un avantatge matemàtic."
        }
    ],
    resources: [
        { title: "Full de Càlcul de Pressupost (Link)", type: "link" }
    ],
    quiz: [
        {
            id: 1,
            question: "Què és l'avantatge de la casa?",
            options: ["Que el casino fa trampes", "El marge matemàtic que assegura que el casino guanyi a llarg termini", "La sort del principiant", "Res, el joc és 50/50"],
            correctAnswer: 1,
            explanation: "L'avantatge de la casa és el percentatge matemàtic que garanteix beneficis al casino independentment de la sort individual."
        }
    ]
  },
  {
    id: 'c5',
    title: 'Gestió de l\'Estrès i Ansietat',
    category: 'Salut Mental',
    duration: '18 min',
    imageColor: 'from-teal-500 to-emerald-600',
    icon: '🍃',
    completed: false,
    points: 600,
    difficulty: 'Intermedi',
    description: "Tècniques pràctiques per reduir l'ansietat sense recórrer a comportaments addictius. Respiració, grounding i gestió emocional.",
    modules: [
        {
            id: 1,
            title: "El cicle de l'ansietat",
            duration: "6:00",
            thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800",
            content: "L'ansietat és una resposta natural de supervivència, però quan es dispara sense perill real, pot portar a conductes d'evitació (com jugar o mirar el mòbil). Entendre el cicle és el primer pas per trencar-lo."
        },
        {
            id: 2,
            title: "Tècniques de Grounding",
            duration: "5:00",
            thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
            content: "Connectar amb el present a través dels sentits (tocar una textura, olorar alguna cosa) ajuda a baixar la intensitat emocional en moments de crisi."
        }
    ],
    resources: [
        { title: "Audio: Meditació Guiada (MP3)", type: "audio", size: "10 min" }
    ],
    quiz: [
        {
            id: 1,
            question: "Què és el 'grounding'?",
            options: ["Una tècnica per volar", "Connectar amb el moment present per reduir l'ansietat", "Dormir al terra", "Ignorar els problemes"],
            correctAnswer: 1,
            explanation: "El grounding o arrelament utilitza els sentits físics per treure l'atenció dels pensaments ansiosos i portar-la a la realitat immediata."
        }
    ]
  },
  {
    id: 'c6',
    title: 'Mindfulness i Autocontrol',
    category: 'Salut Mental',
    duration: '25 min',
    imageColor: 'from-amber-500 to-orange-600',
    icon: '🧘',
    completed: false,
    points: 700,
    difficulty: 'Intermedi',
    description: "Aprèn a observar els teus impulsos sense actuar. Tècniques de consciència plena basades en l'evidència per prevenir recaigudes i enfortir la resistència mental.",
    modules: [
        {
            id: 1,
            title: "Urge Surfing (Surfejar l'Impuls)",
            duration: "8:00",
            thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
            content: "Els impulsos són com onades: pugen, arriben al cim i acaben trencant i desapareixent. 'Surfejar' vol dir observar l'onada emocional sense lluitar contra ella ni deixar-te arrossegar, sabent que passarà."
        },
        {
            id: 2,
            title: "El buit existencial",
            duration: "7:00",
            thumbnail: "https://images.unsplash.com/photo-1517409282362-e64e9a8f4c3f?auto=format&fit=crop&q=80&w=800",
            content: "Moltes vegades s'utilitza una conducta addictiva per tapar el buit, l'avorriment o la soledat. El mindfulness t'ajuda a estar present amb incomoditat de manera segura, cultivant la pau interior."
        }
    ],
    resources: [
        { title: "Diari de Mindfulness (PDF)", type: "pdf", size: "2.1 MB" },
        { title: "Vídeo: Què és el Mindfulness", type: "link" }
    ],
    quiz: [
        {
            id: 1,
            question: "Aplicant l'estratègia 'Urge Surfing', què fas quan sents l'impuls?",
            options: ["Lluitar fortament per no pensar-hi", "Cedeixes ràpid per acabar amb l'ansietat", "L'observes com una onada que passarà sense actuar", "T'enfades amb tu mateix"],
            correctAnswer: 2,
            explanation: "Urge Surfing consisteix a acceptar i observar l'impuls sense resistència directa, sabent que té un inici i un final natural."
        }
    ]
  },
  {
    id: 'c7',
    title: 'FOMO i Desconnexió Digital',
    category: 'Benestar',
    duration: '20 min',
    imageColor: 'from-pink-500 to-rose-600',
    icon: '📵',
    completed: false,
    points: 500,
    difficulty: 'Principiant',
    description: "Aprèn a gestionar la por a perdre't coses (FOMO), la necessitat de connexió constant i el Phubbing, per establir límits digitals saludables en el teu dia a dia.",
    modules: [
        {
            id: 1,
            title: "Què és el FOMO i la Nomofòbia?",
            duration: "6:00",
            thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
            content: "FOMO ('Fear Of Missing Out') és l'ansietat que neix de pensar que altres viuen experiències positives sense nosaltres. Això, sumat a la 'Nomofòbia' (por a no tenir mòbil), fa que el reflex constant de comprovar les notificacions mantingui el problema. L'alleujament és curt, però l'hàbit arruïna el nostre benestar a llarg termini."
        },
        {
            id: 2,
            title: "Phubbing i l'art d'estar present",
            duration: "7:00",
            thumbnail: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=800&auto=format&fit=crop",
            content: "El 'Phubbing' (Phone + Snubbing) és ignorar la persona que tenim al davant per prestar atenció al mòbil. Té un fort impacte en l'autoestima dels qui l'experimenten i minva la qualitat emocional de les nostres relacions properes."
        },
        {
            id: 3,
            title: "Estratègies per un Detox Suau",
            duration: "7:00",
            thumbnail: "https://images.unsplash.com/photo-1496302662116-25d14f2f1e17?q=80&w=800&auto=format&fit=crop",
            content: "Prova el 'Detox de 4 setmanes': Setmana 1: Llegeix el teu ús (audita hores). Setmana 2: Crea espais lliures de pantalles (habitació, àpats). Setmana 3: Canvia l'scroll per activitats enriquidores (llegir, esport). Setmana 4: Gaudeix de les noves rutines consolidades!"
        }
    ],
    resources: [
        { title: "Diari d'Hàbits de Connexió (PDF)", type: "pdf", size: "1.5 MB" }
    ],
    quiz: [
        {
            id: 1,
            question: "Què descriu adequadament el fenomen de 'Phubbing'?",
            options: ["Publicar fotos constantment a les xarxes socials", "Ignorar a algú en una interacció social per estar pendent del mòbil", "Buscar informació de salut a internet de forma compulsiva", "Jugar a videojocs online amb amics"],
            correctAnswer: 1,
            explanation: "El Phubbing és la pràctica d'ignorar les persones presents a favor de prestar atenció als dispositius mòbils."
        }
    ]
  },
  {
    id: 'c8',
    title: 'Habilitats de Comunicació',
    category: 'Relacions',
    duration: '22 min',
    imageColor: 'from-blue-600 to-indigo-500',
    icon: '🗣️',
    completed: false,
    points: 600,
    difficulty: 'Intermedi',
    description: "Comunica't millor per millorar les teves relacions. Tècniques pràctiques per dir 'no', escolta activa (OARS) i reduir la impulsivitat.",
    modules: [
        {
            id: 1,
            title: "Assertivitat: Com dir 'no' sense culpa (Model DESO)",
            duration: "8:00",
            thumbnail: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop",
            content: "Utilitza el Model DESO per posar límits des del respecte i l'empatia: (D)escriu la situació, (E)xpressa com et sents, demana una (S)olució clara, i recorda l'(O)utcome positiu. Exemple: 'Quan m'escrius a la nit, em poso ansiós. Preferiria que m'enviis els missatges pel matí. Així dormirem millor els dos.'"
        },
        {
            id: 2,
            title: "Escolta Activa (Mètode OARS)",
            duration: "8:00",
            thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
            content: "OARS són eines pel diàleg: O (Preguntes Obertes: 'Com t'has sentit?'), A (Afirmacions: 'Valoro que hagis compartit això'), R (Reflexions: 'Així que sents pressió quan...'), i S (Sumari: 'Resumint, busquem X per millorar'). Ajuden a minimitzar els conflictes."
        },
        {
            id: 3,
            title: "Entendre les Bandes Roges (Red Flags)",
            duration: "6:00",
            thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop",
            content: "Si detectes en mi o en l'altre: mentides sobre temps utilitzat, irritabilitat en demanar-li deixar el mòbil, aïllament o desinterès pel voltant. És important obrir converses honestes abans que les 'red flags' generin una bretxa insalvable."
        }
    ],
    resources: [
        { title: "Plantilles per missatges assertius (Link)", type: "link" }
    ],
    quiz: [
        {
            id: 1,
            question: "Dins del mètode DESO d'assertivitat, quina és la finalitat de l'Objectiu ('O' d'Outcome)?",
            options: ["Dir a la persona l'error comès", "Aclarir els beneficis que suposarà aquest nou funcionament a la relació", "Ignorar completament a l'interlocutor", "Buscar com castigar-lo"],
            correctAnswer: 1,
            explanation: "L'Outcome s'enfoca als aspectes i beneficis positius si es resol la situació; l'objectiu no és imposar, sinó protegir la relació."
        }
    ]
  }
];

// --- COMPONENT: CERTIFICATE ---

const Certificate = ({ courseName, userName, onClose }: { courseName: string, userName: string, onClose: () => void }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-white p-8 rounded-xl max-w-2xl w-full border-8 border-double border-indigo-100 shadow-2xl text-center relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X size={24} />
            </button>
            
            <div className="mb-6 flex justify-center">
                <div className="bg-indigo-100 p-4 rounded-full">
                    <Award size={64} className="text-indigo-600" />
                </div>
            </div>
            
            <h2 className="text-4xl font-serif text-slate-800 mb-2 font-bold uppercase tracking-widest">Certificat</h2>
            <p className="text-indigo-500 font-medium uppercase tracking-wide mb-8">de Finalització</p>
            
            <p className="text-slate-500 mb-2">Es concedeix a</p>
            <h3 className="text-3xl font-script text-indigo-900 mb-6 font-bold italic">{userName}</h3>
            
            <p className="text-slate-500 mb-2">Per haver completat amb èxit el curs</p>
            <h4 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-200 pb-4 inline-block px-8">{courseName}</h4>
            
            <div className="flex justify-between items-end text-xs text-slate-400 mt-8">
                <div className="text-left">
                    <p>ACENCAS Prevenció Activa</p>
                    <p>NeuroGuard Academy</p>
                </div>
                <div className="text-right">
                    <p>Data: {new Date().toLocaleDateString()}</p>
                    <p>ID: NG-{Math.floor(Math.random()*10000)}</p>
                </div>
            </div>

            <div className="mt-8 flex gap-3 justify-center">
                <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Download size={16} /> Descarregar
                </button>
                <button className="flex items-center gap-2 px-6 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                    <Share2 size={16} /> Compartir
                </button>
            </div>
        </div>
    </div>
);

// --- COMPONENT: COURSE PLAYER ---

interface CoursePlayerProps {
    course: ExtendedCourse;
    onClose: () => void;
    onComplete: () => void;
    onUpdateVideo: (courseId: string, moduleId: number, videoUrl: string) => void;
    userName: string;
}

const CoursePlayer = ({ course, onClose, onComplete, onUpdateVideo, userName }: CoursePlayerProps) => {
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [mode, setMode] = useState<'learn' | 'quiz' | 'resources'>('learn');
  const [quizAnswers, setQuizAnswers] = useState<number[]>(new Array(course.quiz.length).fill(-1));
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [showCert, setShowCert] = useState(false);

  const currentModule = course.modules[currentModuleIdx];
  const isLastModule = currentModuleIdx === course.modules.length - 1;

  const handleNext = () => {
    if (isLastModule) {
      setMode('quiz');
    } else {
      setCurrentModuleIdx(prev => prev + 1);
    }
  };

  const handleQuizAnswer = (qIdx: number, optionIdx: number) => {
    if (quizAnswers[qIdx] !== -1) return; // Prevent changing answer
    
    const newAnswers = [...quizAnswers];
    newAnswers[qIdx] = optionIdx;
    setQuizAnswers(newAnswers);
    setShowExplanation(true); // Show feedback immediately

    if (optionIdx === course.quiz[qIdx].correctAnswer) {
        setScore(s => s + 1);
    }
  };

  const handleFinishQuiz = () => {
    onComplete();
    setShowCert(true);
  };

  if (showCert) {
      return <Certificate courseName={course.title} userName={userName} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gradient-to-br ${course.imageColor} text-white`}>
                {course.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 leading-tight">{course.title}</h3>
              <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded text-white ${mode === 'learn' ? 'bg-blue-500' : mode === 'quiz' ? 'bg-purple-500' : 'bg-orange-500'}`}>
                    {mode === 'learn' ? 'APRENENTATGE' : mode === 'quiz' ? 'AVALUACIÓ' : 'MATERIALS'}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {mode === 'learn' ? `Mòdul ${currentModuleIdx + 1}/${course.modules.length}` : ''}
                  </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
            
            {/* CONTENT AREA */}
            <div className="flex-1 p-6 lg:p-10 bg-white">
                {mode === 'learn' ? (
                    <div className="max-w-3xl mx-auto animate-fadeIn">
                        {/* Video Player */}
                        <div className="aspect-video bg-black rounded-2xl mb-8 relative group overflow-hidden shadow-lg border border-slate-200">
                            <video 
                                src={`/videos/${course.id}_m${currentModule.id}.mp4`} 
                                controls 
                                className="w-full h-full object-cover bg-slate-900" 
                                poster={currentModule.thumbnail}
                            />
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-3xl font-bold text-slate-800">{currentModule.title}</h2>
                            <button 
                                onClick={() => setMode('resources')}
                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Download size={16}/> Materials
                            </button>
                        </div>
                        
                        <div className="prose prose-slate max-w-none text-lg text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
                            <p>{currentModule.content}</p>
                        </div>
                    </div>
                ) : mode === 'resources' ? (
                    <div className="max-w-2xl mx-auto animate-fadeIn py-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <FileText className="text-orange-500"/> Recursos del Curs
                        </h2>
                        {course.resources.length > 0 ? (
                            <div className="space-y-4">
                                {course.resources.map((res, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:shadow-md transition-all group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 group-hover:text-indigo-600 group-hover:border-indigo-200">
                                                {res.type === 'pdf' ? <FileText size={20}/> : res.type === 'audio' ? <Play size={20}/> : <Share2 size={20}/>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 group-hover:text-indigo-700">{res.title}</h4>
                                                {res.size && <p className="text-xs text-slate-400">{res.size} • {res.type.toUpperCase()}</p>}
                                            </div>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:text-indigo-600">
                                            <Download size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic text-center py-10">Aquest curs no té recursos addicionals.</p>
                        )}
                        <button onClick={() => setMode('learn')} className="mt-8 text-slate-500 hover:text-slate-800 underline block mx-auto">
                            Tornar a la lliçó
                        </button>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto animate-fadeIn py-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">Test de Coneixements</h2>
                        <p className="text-center text-slate-500 mb-10">Demostra el que has après per guanyar els punts.</p>

                        <div className="space-y-12">
                            {course.quiz.map((q, qIdx) => {
                                const isAnswered = quizAnswers[qIdx] !== -1;
                                const isCorrect = quizAnswers[qIdx] === q.correctAnswer;
                                const selected = quizAnswers[qIdx];

                                return (
                                    <div key={q.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                        <h4 className="font-bold text-lg mb-4 flex gap-3">
                                            <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm">{qIdx + 1}</span>
                                            {q.question}
                                        </h4>
                                        <div className="space-y-2 ml-11">
                                            {q.options.map((opt, optIdx) => {
                                                let btnClass = "w-full text-left p-4 rounded-xl border transition-all font-medium ";
                                                if (!isAnswered) {
                                                    btnClass += "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600";
                                                } else {
                                                    if (optIdx === q.correctAnswer) {
                                                        btnClass += "bg-green-100 border-green-500 text-green-800 ring-1 ring-green-500"; // Correct answer always green
                                                    } else if (optIdx === selected && optIdx !== q.correctAnswer) {
                                                        btnClass += "bg-red-50 border-red-300 text-red-700"; // Wrong selection red
                                                    } else {
                                                        btnClass += "bg-white border-slate-100 text-slate-400 opacity-50"; // Others dimmed
                                                    }
                                                }

                                                return (
                                                    <button 
                                                        key={optIdx}
                                                        disabled={isAnswered}
                                                        onClick={() => handleQuizAnswer(qIdx, optIdx)}
                                                        className={btnClass}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span>{opt}</span>
                                                            {isAnswered && optIdx === q.correctAnswer && <CheckCircle className="w-5 h-5 text-green-600" />}
                                                            {isAnswered && optIdx === selected && optIdx !== q.correctAnswer && <X className="w-5 h-5 text-red-500" />}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        {isAnswered && (
                                            <div className={`mt-4 ml-11 p-4 rounded-xl text-sm ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'} animate-fadeIn`}>
                                                <strong>{isCorrect ? 'Molt bé!' : 'Atenció:'}</strong> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* SIDEBAR / FOOTER NAV */}
            <div className="bg-slate-50 border-t lg:border-t-0 lg:border-l lg:w-80 p-6 flex flex-col shrink-0">
                <div className="hidden lg:block mb-8">
                    <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-4">Contingut del Curs</h4>
                    <div className="space-y-4">
                        {course.modules.map((m, idx) => (
                            <button 
                                key={m.id} 
                                onClick={() => { setMode('learn'); setCurrentModuleIdx(idx); }}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${currentModuleIdx === idx && mode === 'learn' ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-slate-100'}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx < currentModuleIdx || mode === 'quiz' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {idx < currentModuleIdx || mode === 'quiz' ? <CheckCircle size={14}/> : idx + 1}
                                </div>
                                <div className={`text-sm font-medium leading-tight ${currentModuleIdx === idx && mode === 'learn' ? 'text-slate-800' : 'text-slate-500'}`}>{m.title}</div>
                            </button>
                        ))}
                        <button 
                            onClick={() => setMode('quiz')}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${mode === 'quiz' ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-slate-100'}`}
                        >
                             <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs">
                                <HelpCircle size={14} />
                             </div>
                             <div className={`text-sm font-medium ${mode === 'quiz' ? 'text-slate-800' : 'text-slate-500'}`}>Qüestionari</div>
                        </button>
                    </div>
                </div>

                <div className="mt-auto">
                    {mode !== 'quiz' ? (
                        <button 
                            onClick={handleNext}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            {isLastModule ? 'Fer el Test' : 'Següent Lliçó'} <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="space-y-4 text-center">
                            <div className="text-sm text-slate-500">
                                Puntuació: <span className="font-bold text-slate-800">{score}/{course.quiz.length}</span>
                            </div>
                            <button 
                                onClick={handleFinishQuiz}
                                disabled={quizAnswers.includes(-1)}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Trophy className="w-5 h-5" /> Finalitzar Curs
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface CorporateLearningHubProps {
  user: UserProfile;
}

const CorporateLearningHub: React.FC<CorporateLearningHubProps> = ({ user }) => {
  const [coursesData, setCoursesData] = useState<ExtendedCourse[]>(INITIAL_COURSES_DATA);
  const [activeCourse, setActiveCourse] = useState<ExtendedCourse | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [filter, setFilter] = useState<'all' | 'progress' | 'completed'>('all');

  const handleStartCourse = (course: ExtendedCourse) => {
    if (course.minLevelReq && user.level < course.minLevelReq) {
        alert(`Necessites ser nivell ${course.minLevelReq} per accedir a aquest contingut.`);
        return;
    }
    setActiveCourse(course);
  };

  const handleCompleteCourse = () => {
    setActiveCourse(null);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  // Function to update the video URL for a module in state
  const handleUpdateVideo = (courseId: string, moduleId: number, videoUrl: string) => {
      const updatedCourses = coursesData.map(c => {
          if (c.id === courseId) {
              const updatedModules = c.modules.map(m => 
                  m.id === moduleId ? { ...m, videoUrl } : m
              );
              return { ...c, modules: updatedModules };
          }
          return c;
      });
      setCoursesData(updatedCourses);
      
      // Also update active course if open
      if (activeCourse && activeCourse.id === courseId) {
          const updatedModules = activeCourse.modules.map(m => 
              m.id === moduleId ? { ...m, videoUrl } : m
          );
          setActiveCourse({ ...activeCourse, modules: updatedModules });
      }
  };

  const filteredCourses = coursesData.filter(c => {
      if (filter === 'progress') return !c.completed; 
      if (filter === 'completed') return c.completed;
      return true;
  });

  if (activeCourse) {
      return (
          <CoursePlayer 
              course={activeCourse} 
              onClose={() => setActiveCourse(null)} 
              onComplete={handleCompleteCourse}
              userName={user.name}
              onUpdateVideo={handleUpdateVideo}
          />
      );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn max-w-7xl mx-auto">
      
      {/* LEFT COLUMN: COURSES */}
      <div className="flex-1">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white mb-8 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Hub de Formació</span>
                <span className="flex items-center gap-1 text-xs font-medium text-yellow-300"><Award size={14} /> Nivell {user.level}</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Hola, {user.name}</h2>
            <p className="opacity-90 mb-8 max-w-lg text-lg leading-relaxed">
              La recuperació és un procés d'aprenentatge continu. Aquí tens eines per entendre com funciona la teva ment i reforçar la teva voluntat.
            </p>
            
            <div className="flex gap-6">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold">{user.currency}</span>
                    <span className="text-xs opacity-60 uppercase font-bold">Punts XP</span>
                </div>
                <div className="w-px bg-white/20"></div>
                <div className="flex flex-col">
                    <span className="text-3xl font-bold">3</span>
                    <span className="text-xs opacity-60 uppercase font-bold">Cursos Pendents</span>
                </div>
            </div>
          </div>
          
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/15 transition-colors duration-500"></div>
          <div className="absolute right-40 bottom-0 w-40 h-40 bg-purple-500/30 rounded-full blur-2xl"></div>
        </div>

        {/* Filters & Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" /> Catàleg de Cursos
            </h3>
            <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
                {(['all', 'progress', 'completed'] as const).map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {f === 'all' ? 'Tots' : f === 'progress' ? 'En Curs' : 'Fets'}
                    </button>
                ))}
            </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => {
              const isLocked = course.minLevelReq && user.level < course.minLevelReq;
              
              return (
              <div 
                key={course.id}
                onClick={() => handleStartCourse(course)}
                className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full relative ${isLocked ? 'grayscale opacity-80' : ''}`}
              >
                {/* Locked Overlay */}
                {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center">
                            <Lock className="w-8 h-8 text-slate-800 mb-2" />
                            <span className="font-bold text-slate-800 text-sm">Bloquejat</span>
                            <span className="text-xs text-slate-500">Nivell {course.minLevelReq} requerit</span>
                        </div>
                    </div>
                )}

                {/* Visual Header */}
                <div className={`h-36 bg-gradient-to-br ${course.imageColor} relative p-6 flex flex-col justify-between overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">{course.icon}</div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {course.category}
                    </span>
                    {course.completed && (
                        <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                            <CheckCircle size={12} /> FET
                        </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400 border-t border-slate-100 pt-4 mt-auto">
                    <span className="flex items-center gap-1"><Clock size={14}/> {course.duration}</span>
                    <span className="flex items-center gap-1"><Trophy size={14} className="text-yellow-500"/> {course.points} XP</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${course.difficulty === 'Principiant' ? 'bg-green-100 text-green-700' : course.difficulty === 'Intermedi' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {course.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            )})}
        </div>
      </div>

      {/* RIGHT COLUMN: PROGRESS & STATS */}
      <div className="w-full lg:w-80 space-y-8">
        
        {/* Daily Tip */}
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-yellow-200 rounded-full blur-xl"></div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
                <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                <h4 className="font-bold text-yellow-800 uppercase tracking-wider text-xs">Consell del Dia</h4>
            </div>
            <p className="text-sm text-yellow-900 font-medium leading-relaxed relative z-10">
                "La motivació és el que et fa començar. L'hàbit és el que et fa continuar. No trenquis la cadena avui."
            </p>
        </div>

        {/* Weekly Goal */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                Objectiu Setmanal
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">2/4 Lliçons</span>
            </h3>
            <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                <div className="bg-indigo-500 h-3 rounded-full" style={{width: '50%'}}></div>
            </div>
            <p className="text-xs text-slate-500 text-center">Continua així! Estàs a la meitat.</p>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4">Les teves Insígnies</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
                { i: '🚀', t: 'Inici', c: 'bg-blue-50 border-blue-200' },
                { i: '🧠', t: 'Savi', c: 'bg-purple-50 border-purple-200' },
                { i: '🔥', t: 'Ratxa', c: 'bg-orange-50 border-orange-200' },
                { i: '🔒', t: '?', c: 'bg-slate-50 border-slate-200 opacity-50 grayscale' },
                { i: '🔒', t: '?', c: 'bg-slate-50 border-slate-200 opacity-50 grayscale' },
                { i: '🔒', t: '?', c: 'bg-slate-50 border-slate-200 opacity-50 grayscale' },
            ].map((badge, idx) => (
                <div key={idx} className={`aspect-square rounded-xl border flex flex-col items-center justify-center ${badge.c} cursor-help`} title={badge.t}>
                    <span className="text-xl">{badge.i}</span>
                </div>
            ))}
          </div>
        </div>

        {/* Did you know card */}
        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex gap-3 mb-2">
                <AlertCircle className="text-indigo-600 w-5 h-5 flex-shrink-0" />
                <h4 className="font-bold text-indigo-900 text-sm">Sabies que...</h4>
            </div>
            <p className="text-sm text-indigo-800 leading-relaxed">
                Estudis demostren que aprendre noves habilitats augmenta la densitat de la matèria blanca al cervell, ajudant a reparar els danys causats per l'addicció.
            </p>
        </div>

      </div>

      {/* CONFETTI OVERLAY */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[100] bg-black/20">
            <div className="text-center animate-bounce">
                <div className="text-8xl mb-4">🏆</div>
                <h2 className="text-4xl font-bold text-white drop-shadow-lg">Felicitats!</h2>
                <p className="text-white text-xl font-medium drop-shadow-md">Has completat el curs.</p>
            </div>
        </div>
      )}

    </div>
  );
};

export default CorporateLearningHub;
