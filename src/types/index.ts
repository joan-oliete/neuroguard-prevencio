
export type UserProfileType = 'adolescent' | 'adult' | 'elderly';

export interface UserProfile {
  id: string; // UID
  email: string;
  name: string;
  surname: string;
  phone: string;
  activeManualId: string;
  lastConsumptionDate: string | null; // YYYY-MM-DD
  createdAt: any; // Firestore Timestamp

  // Gamification & Profile Types
  type: UserProfileType;
  streak: number;
  currency: number;
  level: number;
  avatar?: {
    skinTone: string;
    bodyType: 'masculine' | 'feminine' | 'neutral';
    clothing: string;
    accessories: string[];
    currentXp: number;
    nextLevelXp: number;
  };
  hasCompletedTutorial?: boolean;
}

// --- ESTRUCTURA DEL MANUAL DE PREVENCIÓ (ACENCAS MODEL) ---

export interface RelapseManual {
  id?: string;
  createdAt: any;
  motivations: MotivationItem[];
  values: {
    selected: string[];
    details: Record<string, ValueDetail>;
  };
  triggers: Trigger[];
  trapThoughts: TrapThought[];
  selfCarePlan: Record<string, string>; // Key: "Physical-Monday", etc.
  supportNetwork: SupportPerson[];
  crisisPlan: CrisisPlan;
  weeklyReview: string;
  gratitudeJournal: GratitudeItem[];
}

export interface MotivationItem {
  id: number;
  text: string;
}

export interface ValueDetail {
  definition: string;
  importance: number;
  alignment: number;
}

export interface Trigger {
  id: number;
  external: string;
  internal: string;
  physical: string;
}

export interface TrapThought {
  id: number;
  thought: string;
  reframe: string;
}

export interface SupportPerson {
  id: number;
  name: string;
  contact: string;
  role: string;
}

export interface CrisisPlan {
  signal: string;
  action: string;
  contact: string;
  value: string;
  reminder?: string;
}

export interface GratitudeItem {
  id: number;
  entry: string;
}

// --- DIARY ---

export interface DiaryEntry {
  id: string;
  text: string;
  createdAt: any;
  linkedActivity?: { date: string; area: string; };
}

// --- GAMIFICATION / EXTRAS (NeuroGuard Legacy) ---

export interface RoleplayOption {
  text: string;
  feedback: string;
  score_impact: number;
}

export interface RoleplayScenario {
  id: string;
  context: string;
  npc_dialogue: string;
  options: RoleplayOption[];
  backgroundId?: string; // New: 'bg_bar', 'bg_park', etc.
  characterId?: string; // New: 'friend', 'dealer', etc.
  emotion?: 'neutral' | 'angry' | 'happy' | 'suspicious'; // New: NPC emotion state
}

// --- NEW TYPES FOR COMPONENTS ---

export interface DailyStat {
  day: string;
  anxiety: number;
  screentime?: number;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  imageColor: string;
  icon: string;
  completed: boolean;
  points: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  avatar: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface Memory {
  id: number;
  note: string;
  date: string;
  type: string;
  imageUrl?: string;
}
