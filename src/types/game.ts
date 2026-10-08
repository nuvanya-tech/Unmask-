export type Stage = 'life' | 'personal' | 'deep' | 'dark' | 'abyss';

export type QuestionType = 'TRUTH' | 'DARE';

export type RoomVibe = 'REAL' | 'FUNNY' | 'DEEP' | 'DARK' | 'CHAOS' | 'WILDEST';

export type GameIntensity = 'CHILL' | 'DEEP' | 'WILD' | 'UNHINGED';

export type TurnRole = 'host' | 'guest';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  role: TurnRole;
  isHost: boolean;
  isReady?: boolean;
}

export interface QuestionItem {
  id: string;
  text: string;
  type: QuestionType;
  stage: Stage;
  vibe: RoomVibe;
  intensity?: GameIntensity;
  isCustom?: boolean;
  authorId?: string;
  isVoiceMandate?: boolean;
  isPhotoMandate?: boolean;
  isBlindDuo?: boolean;
}

export interface RatingData {
  honesty: number; // 1-5
  depth: number;   // 1-5
  impact: number;  // 1-5
  score: number;   // average (Honesty + Depth + Impact) / 3
  reaction?: string; // ❤️ 😂 😮 👀 🤯 🫂 🔥 💀 🌶️ 😈
  points: number;  // XP earned this round
}

export type ChaosModifier =
  | 'DOUBLE_XP'
  | 'SPEED_RUN'
  | 'CUSTOM_ONLY'
  | 'REVERSE'
  | 'ONE_WORD'
  | 'RANDOM_DARE'
  | 'VOICE_MANDATE'
  | 'PHOTO_DARE'
  | 'BLIND_DUO'
  | 'FORFEIT_ROULETTE';

export interface ForfeitItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  severity: 'mild' | 'spicy' | 'unhinged';
}

export interface RoundRecord {
  round: number;
  stage: Stage;
  questioner: TurnRole;
  answerer: TurnRole;
  question: QuestionItem;
  answer: string;
  audioUrl?: string;
  photoUrl?: string;
  isTooPersonal: boolean;
  forfeit?: ForfeitItem;
  rating?: RatingData;
  timestamp: number;
}

export interface GameState {
  roomCode: string;
  isDemo: boolean;
  isPassAndPlay?: boolean;
  vibe: RoomVibe;
  intensity: GameIntensity;
  passwordProtected: boolean;
  started: boolean;
  completed: boolean;
  round: number; // 1 to 25
  currentStage: Stage;
  turn: TurnRole; // who is questioner this round
  activeQuestion: QuestionItem | null;
  activeAnswer: string | null;
  activeAudioUrl?: string | null;
  activePhotoUrl?: string | null;
  isAnswerSubmitted: boolean;
  isTooPersonal: boolean;
  activeForfeit?: ForfeitItem | null;
  activeRating: RatingData | null;
  activeModifier: ChaosModifier | null;
  // Blind Duo Mode
  isBlindDuoActive?: boolean;
  blindHostAnswer?: string | null;
  blindGuestAnswer?: string | null;
  blindHostDone?: boolean;
  blindGuestDone?: boolean;
  roundHistory: RoundRecord[];
  xp: {
    host: number;
    guest: number;
  };
  streak: number;
  host: Player;
  guest: Player | null;
}

export interface SavedMoment {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  question: string;
  answer: string;
  isDare: boolean;
  stage: Stage;
  score: number;
  reaction?: string;
  date: string;
}

export interface PersonRecord {
  id: string;
  name: string;
  avatar: string;
  gamesTogether: number;
  averageScore: number;
  lastPlayed: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  title: string;
  totalXp: number;
  streak: number;
  gamesCompleted: number;
  questionsAsked: number;
  questionsAnswered: number;
  daresDone: number;
  customQuestionsCount: number;
  highestRound: number;
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}
