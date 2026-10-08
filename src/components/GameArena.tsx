import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  PenTool,
  ShieldAlert,
  Send,
  CheckCircle2,
  Bookmark,
  Clock,
  Shuffle,
  Flame,
  ChevronRight,
  ArrowRight,
  Zap,
  Mic,
  Camera,
  Skull,
  Radio,
  Eye,
  Volume2,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';
import {
  GameState,
  QuestionItem,
  RatingData,
  Stage,
  QuestionType,
  ChaosModifier,
  ForfeitItem,
} from '../types/game';
import { STAGE_CONFIG, QUESTION_DECK, CHAOS_MODIFIERS, FORFEIT_PENALTIES } from '../data/questions';
import { Avatar } from './Avatar';
import { VoiceRecorder } from './VoiceRecorder';
import { ForfeitRoulette } from './ForfeitRoulette';
import { ReactionBomber } from './ReactionBomber';
import { sound } from '../utils/audio';

interface GameArenaProps {
  gameState: GameState;
  isHost: boolean;
  onAskQuestion: (question: QuestionItem) => void;
  onSubmitAnswer: (answer: string, isTooPersonal: boolean, audioUrl?: string, photoUrl?: string, forfeit?: ForfeitItem) => void;
  onLockRating: (rating: RatingData) => void;
  onNextRound: () => void;
  onSaveMoment: (question: string, answer: string, score: number, isDare: boolean, stage: Stage, reaction?: string) => void;
  onTriggerChaos?: (mod: ChaosModifier) => void;
  onSendReaction?: (emoji: string) => void;
  incomingReaction?: string | null;
  isDemo?: boolean;
}

export const GameArena: React.FC<GameArenaProps> = ({
  gameState,
  isHost,
  onAskQuestion,
  onSubmitAnswer,
  onLockRating,
  onNextRound,
  onSaveMoment,
  onTriggerChaos,
  onSendReaction,
  incomingReaction,
  isDemo,
}) => {
  const currentRole = isHost ? 'host' : 'guest';
  const isMyTurnToAsk = gameState.turn === currentRole || gameState.isPassAndPlay;
  const isMyTurnToAnswer = gameState.turn !== currentRole || gameState.isPassAndPlay;

  const currentStageConfig = STAGE_CONFIG[gameState.currentStage];

  // Question creation state
  const [questionMode, setQuestionMode] = useState<'suggest' | 'browse' | 'custom'>('suggest');
  const [selectedType, setSelectedType] = useState<QuestionType>('TRUTH');
  const [suggestedQuestion, setSuggestedQuestion] = useState<QuestionItem | null>(null);
  const [customText, setCustomText] = useState('');
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [isChaosDrawerOpen, setIsChaosDrawerOpen] = useState(false);

  // Modifiers & Wild switches
  const [selectedModifier, setSelectedModifier] = useState<ChaosModifier | null>(gameState.activeModifier);
  const [isBlindDuoSelected, setIsBlindDuoSelected] = useState(false);

  // Answer submission modes
  const [answerType, setAnswerType] = useState<'text' | 'voice' | 'photo'>('text');
  const [answerText, setAnswerText] = useState('');
  const [recordedAudio, setRecordedAudio] = useState<{ url: string; duration: number } | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);

  // Forfeit Roulette trigger state
  const [showForfeitRoulette, setShowForfeitRoulette] = useState(false);
  const [chosenForfeit, setChosenForfeit] = useState<ForfeitItem | null>(null);

  // Rating state
  const [honesty, setHonesty] = useState(5);
  const [depth, setDepth] = useState(5);
  const [impact, setImpact] = useState(5);
  const [selectedReaction, setSelectedReaction] = useState<string>('🔥');

  // Moment saved feedback
  const [momentSaved, setMomentSaved] = useState(false);

  // File input ref for camera capture
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pick an initial suggestion when stage changes or question reset
  useEffect(() => {
    if (!gameState.activeQuestion) {
      const candidates = QUESTION_DECK.filter(
        (q) => (gameState.vibe === 'WILDEST' ? q.vibe === 'WILDEST' || q.stage === gameState.currentStage : q.stage === gameState.currentStage) && q.type === selectedType
      );
      if (candidates.length > 0) {
        setSuggestedQuestion(candidates[Math.floor(Math.random() * candidates.length)]);
      }
      // Reset answer states
      setAnswerText('');
      setRecordedAudio(null);
      setPhotoDataUrl(null);
      setShowForfeitRoulette(false);
      setChosenForfeit(null);
    }
  }, [gameState.currentStage, selectedType, gameState.activeQuestion, gameState.vibe]);

  // Handle speed run ticking bomb countdown if active
  useEffect(() => {
    if (gameState.activeModifier === 'SPEED_RUN' && gameState.activeQuestion && !gameState.isAnswerSubmitted) {
      setTimerSeconds(20);
      const interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            sound.playWildSiren();
            return 0;
          }
          sound.playTick();
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimerSeconds(null);
    }
  }, [gameState.activeModifier, gameState.activeQuestion, gameState.isAnswerSubmitted]);

  // Cycle suggestion
  const handleShuffleSuggestion = () => {
    sound.playSelect();
    const candidates = QUESTION_DECK.filter(
      (q) => (gameState.vibe === 'WILDEST' ? q.vibe === 'WILDEST' || q.stage === gameState.currentStage : q.stage === gameState.currentStage) && q.type === selectedType
    );
    if (candidates.length > 1) {
      const next = candidates.filter((c) => c.id !== suggestedQuestion?.id);
      setSuggestedQuestion(next[Math.floor(Math.random() * next.length)]);
    }
  };

  // Submit Question
  const handleConfirmQuestion = () => {
    let q: QuestionItem;

    if (questionMode === 'custom') {
      if (!customText.trim()) return;
      q = {
        id: 'c_' + Date.now(),
        text: customText.trim(),
        type: selectedType,
        stage: gameState.currentStage,
        vibe: gameState.vibe,
        isCustom: true,
        authorId: isHost ? gameState.host.id : gameState.guest?.id,
        isBlindDuo: isBlindDuoSelected,
      };
      setCustomText('');
    } else if (suggestedQuestion) {
      q = {
        ...suggestedQuestion,
        isBlindDuo: isBlindDuoSelected,
      };
    } else {
      return;
    }

    if (selectedModifier && onTriggerChaos) {
      onTriggerChaos(selectedModifier);
    }

    sound.playSelect();
    onAskQuestion(q);
  };

  // Handle Photo Capture
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
        sound.playSubmit();
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Answer
  const handleSendAnswer = () => {
    if (!answerText.trim() && !recordedAudio && !photoDataUrl && gameState.activeQuestion?.type === 'TRUTH') {
      return;
    }

    sound.playSubmit();
    const finalAnswer = recordedAudio
      ? `🎙️ Voice Note Confession (${recordedAudio.duration}s)`
      : photoDataUrl
      ? '📸 Photo Proof Challenge Completed'
      : answerText.trim();

    onSubmitAnswer(
      finalAnswer,
      false,
      recordedAudio?.url,
      photoDataUrl || undefined,
      chosenForfeit || undefined
    );
  };

  // Skip or Chicken Out -> Triggers Forfeit Roulette!
  const handleTriggerForfeitWheel = () => {
    sound.playWildSiren();
    setShowForfeitRoulette(true);
  };

  // When penalty is accepted from roulette
  const handlePenaltyAccepted = (penalty: ForfeitItem) => {
    setChosenForfeit(penalty);
    sound.playScore();
    setShowForfeitRoulette(false);
    onSubmitAnswer(
      `💀 Forfeit Accepted: ${penalty.icon} ${penalty.title}`,
      true,
      undefined,
      undefined,
      penalty
    );
  };

  // Lock Rating
  const handleLockRating = () => {
    const avgScore = Number(((honesty + depth + impact) / 3).toFixed(2));
    let points = Math.round(avgScore * 10) + 15;
    if (gameState.activeQuestion?.isCustom) points += 25;
    if (gameState.activeModifier === 'DOUBLE_XP') points *= 2;
    if (gameState.activeAudioUrl) points += 20; // Voice truth bonus
    if (gameState.activePhotoUrl) points += 25; // Photo proof dare bonus

    sound.playScore();
    onLockRating({
      honesty,
      depth,
      impact,
      score: avgScore,
      reaction: selectedReaction,
      points,
    });
  };

  const handleSaveCurrentMoment = () => {
    if (!gameState.activeQuestion) return;
    sound.playAchievement();
    onSaveMoment(
      gameState.activeQuestion.text,
      gameState.activeAnswer || (gameState.isTooPersonal ? 'Forfeit Completed' : 'Completed'),
      gameState.activeRating?.score || 4.8,
      gameState.activeQuestion.type === 'DARE',
      gameState.currentStage,
      gameState.activeRating?.reaction
    );
    setMomentSaved(true);
    setTimeout(() => setMomentSaved(false), 3000);
  };

  const questionerPlayer = gameState.turn === 'host' ? gameState.host : gameState.guest;
  const answererPlayer = gameState.turn === 'host' ? gameState.guest : gameState.host;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-5 animate-fade-in pb-16">
      {/* 1. STAGE PROGRESSION & P2P E2EE HEADER */}
      <div className="bg-[#111116] border border-white/[0.06] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-white/50 text-[11px] uppercase tracking-wider">
              Round {gameState.round} of 25
            </span>
            <span className="text-white/20">·</span>
            <span
              className="font-bold tracking-wide uppercase text-[11px] font-mono"
              style={{ color: currentStageConfig.accentColor }}
            >
              Stage: {currentStageConfig.name}
            </span>

            {/* P2P End-to-End Encryption Badge */}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#59D8AD] bg-[#59D8AD]/10 px-2 py-0.5 rounded-full border border-[#59D8AD]/20 font-mono">
              <ShieldCheck className="w-3 h-3" /> P2P E2EE
            </span>

            {gameState.vibe === 'WILDEST' && (
              <span className="bg-[#FF7B84]/20 text-[#FF7B84] border border-[#FF7B84]/40 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse font-mono">
                🔥 WILDEST
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-white/60">
            <span className="flex items-center gap-1.5">
              <span className="text-white/40">XP:</span>
              <span className="text-white font-semibold">
                {isHost ? gameState.xp.host : gameState.xp.guest}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#F05D9F]" />
              <span className="text-white font-semibold">{gameState.streak}</span>
            </span>
          </div>
        </div>

        {/* 5-Step Visual Progression */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {(['life', 'personal', 'deep', 'dark', 'abyss'] as Stage[]).map((stageKey) => {
            const config = STAGE_CONFIG[stageKey];
            const isCurrent = gameState.currentStage === stageKey;
            const isPassed = gameState.round > config.maxRound;

            return (
              <div key={stageKey} className="group relative">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isCurrent
                      ? 'shadow-md scale-y-125'
                      : isPassed
                      ? 'opacity-80'
                      : 'opacity-20 bg-white/10'
                  }`}
                  style={{
                    backgroundColor: isCurrent || isPassed ? config.accentColor : undefined,
                    boxShadow: isCurrent ? `0 0 12px ${config.accentColor}88` : undefined,
                  }}
                />
                <div className="hidden sm:flex items-center justify-between mt-1 text-[10px] text-white/40">
                  <span className={`font-semibold ${isCurrent ? 'text-white' : ''}`}>
                    {config.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PLAYER CHIPS & LIVE ACTIVE MODIFIERS */}
      <div className="flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-3">
          <Avatar avatarId={questionerPlayer?.avatar || 'phantom'} size="sm" isHost={gameState.turn === 'host'} />
          <div>
            <div className="text-[10px] text-white/40 uppercase font-mono tracking-wider">
              Questioner ({questionerPlayer?.name})
            </div>
            <div className="font-semibold text-white">
              {gameState.turn === currentRole ? 'Your Turn to Ask' : `${questionerPlayer?.name}'s Turn`}
            </div>
          </div>
        </div>

        {/* Chaos Badge */}
        {gameState.activeModifier && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F05D9F]/15 border border-[#F05D9F]/30 rounded-full text-xs font-bold text-[#F05D9F] animate-pulse">
            <Zap className="w-3.5 h-3.5" />
            <span>{CHAOS_MODIFIERS.find((m) => m.id === gameState.activeModifier)?.badge}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-[10px] text-white/40 uppercase font-mono tracking-wider">
              Hot Seat ({answererPlayer?.name})
            </div>
            <div className="font-semibold text-white">
              {gameState.turn !== currentRole ? 'You are in the Hot Seat' : `${answererPlayer?.name} is Answering`}
            </div>
          </div>
          <Avatar avatarId={answererPlayer?.avatar || 'ember'} size="sm" isHost={gameState.turn === 'guest'} />
        </div>
      </div>

      {/* 3. MAIN ARENA CARD */}
      <div className="bg-[#111116] border border-white/[0.08] rounded-3xl p-6 sm:p-9 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
        {/* Stage Glow Flare */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: currentStageConfig.accentColor }}
        />

        {/* ----------------- STATE A: QUESTION SELECTION (Questioner Turn) ----------------- */}
        {!gameState.activeQuestion && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider text-white/50">
                  Select Intensity
                </span>
                <span className="text-white/20">/</span>
                <span className="text-xs font-bold font-mono" style={{ color: currentStageConfig.accentColor }}>
                  {currentStageConfig.name}
                </span>
              </div>

              {/* Truth vs Dare Switcher */}
              <div className="flex items-center p-1 bg-[#17171D] border border-white/[0.06] rounded-xl text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    sound.playSelect();
                    setSelectedType('TRUTH');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedType === 'TRUTH'
                      ? 'bg-gradient-to-r from-[#927CFF] to-[#6E53ED] text-white shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  TRUTH
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playSelect();
                    setSelectedType('DARE');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedType === 'DARE'
                      ? 'bg-gradient-to-r from-[#F05D9F] to-[#FF7B84] text-white shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  DARE 🔥
                </button>
              </div>
            </div>

            {/* Three Actions: Suggest | Browse | Ask Mine | Chaos Cards */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.04] pb-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  sound.playSelect();
                  setQuestionMode('suggest');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  questionMode === 'suggest'
                    ? 'bg-white/[0.08] text-white font-semibold'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#927CFF]" />
                <span>Suggest</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playSelect();
                  setQuestionMode('browse');
                  setIsBrowseOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  questionMode === 'browse'
                    ? 'bg-white/[0.08] text-white font-semibold'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#59D8AD]" />
                <span>Browse Deck</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playSelect();
                  setQuestionMode('custom');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  questionMode === 'custom'
                    ? 'bg-white/[0.08] text-white font-semibold'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5 text-[#EFC65D]" />
                <span>Author Mine (+25 XP)</span>
              </button>

              {/* Chaos Modifiers Drawer Trigger */}
              <button
                type="button"
                onClick={() => {
                  sound.playSelect();
                  setIsChaosDrawerOpen(true);
                }}
                className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F05D9F]/10 hover:bg-[#F05D9F]/20 text-[#F05D9F] border border-[#F05D9F]/30 font-bold transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{selectedModifier ? CHAOS_MODIFIERS.find(m => m.id === selectedModifier)?.badge : 'Draw Twist Card'}</span>
              </button>
            </div>

            {/* Mode Content: Suggest */}
            {questionMode === 'suggest' && suggestedQuestion && (
              <div className="space-y-4 py-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className="font-mono">
                    {suggestedQuestion.vibe === 'WILDEST' ? '🔥 Wildest Confession' : `Suggested for ${currentStageConfig.name}`}
                  </span>
                  <button
                    type="button"
                    onClick={handleShuffleSuggestion}
                    className="flex items-center gap-1 text-[#927CFF] hover:underline cursor-pointer font-semibold"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Shuffle Next</span>
                  </button>
                </div>

                <div className="p-6 sm:p-8 rounded-2xl bg-[#17171D] border border-white/[0.06] shadow-inner">
                  <p className="font-['Syne',sans-serif] text-xl sm:text-2xl md:text-3xl font-bold text-white leading-relaxed">
                    "{suggestedQuestion.text}"
                  </p>
                </div>
              </div>
            )}

            {/* Mode Content: Custom */}
            {questionMode === 'custom' && (
              <div className="space-y-3 py-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>Write your rawest, unfiltered {selectedType.toLowerCase()}</span>
                  <span className="text-[#EFC65D] font-mono font-bold">+25 Bonus XP</span>
                </div>
                <textarea
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={`Type an original, shocking, or deeply vulnerable ${selectedType.toLowerCase()} here...`}
                  className="w-full p-4 bg-[#17171D] border border-white/10 rounded-2xl text-base text-white placeholder-white/20 focus:outline-none focus:border-[#927CFF] resize-none"
                  autoFocus
                />
              </div>
            )}

            {/* Question Confirm */}
            {isMyTurnToAsk ? (
              <button
                type="button"
                onClick={handleConfirmQuestion}
                disabled={questionMode === 'custom' && !customText.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white font-bold text-base rounded-2xl shadow-xl shadow-[#6E53ED]/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Issue Challenge Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-white/[0.03] text-center text-xs text-white/50">
                Waiting for {questionerPlayer?.name} to select and send a question...
              </div>
            )}
          </div>
        )}

        {/* ----------------- STATE B: HOT SEAT ANSWERING ----------------- */}
        {gameState.activeQuestion && !gameState.isAnswerSubmitted && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span
                  className="font-bold uppercase tracking-wider text-[11px]"
                  style={{ color: currentStageConfig.accentColor }}
                >
                  {gameState.activeQuestion.type}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-white/50">{currentStageConfig.name}</span>
                {gameState.activeQuestion.isCustom && (
                  <span className="text-[#EFC65D] bg-[#EFC65D]/10 px-2 py-0.5 rounded text-[10px] font-bold">
                    ORIGINAL
                  </span>
                )}
              </div>

              {/* 20s Ticking Bomb Timer */}
              {timerSeconds !== null && (
                <div
                  className={`flex items-center gap-1.5 font-mono font-bold text-xs px-3 py-1.5 rounded-xl transition-colors ${
                    timerSeconds <= 5
                      ? 'bg-[#FF7B84]/20 text-[#FF7B84] animate-pulse border border-[#FF7B84]/40'
                      : 'bg-white/5 text-white/80 border border-white/10'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-[#FF7B84]" />
                  <span>{timerSeconds}s Remaining</span>
                </div>
              )}
            </div>

            {/* Huge Question Display */}
            <div className="py-2 sm:py-4">
              <h2 className="font-['Syne',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
                {gameState.activeQuestion.text}
              </h2>
            </div>

            {/* Answer Input Controls */}
            {isMyTurnToAnswer ? (
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                {/* Answer Mode Tabs: Text | Voice Note | Photo Proof */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAnswerType('text')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      answerType === 'text'
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Type Text
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnswerType('voice')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      answerType === 'voice'
                        ? 'bg-[#F05D9F]/20 text-[#F05D9F] border border-[#F05D9F]/30'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-[#F05D9F]" />
                    <span>Voice Note Truth (+20 XP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAnswerType('photo');
                      fileInputRef.current?.click();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      answerType === 'photo'
                        ? 'bg-[#59D8AD]/20 text-[#59D8AD] border border-[#59D8AD]/30'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-[#59D8AD]" />
                    <span>Photo Proof (+25 XP)</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                </div>

                {/* Textarea */}
                {answerType === 'text' && (
                  <textarea
                    rows={3}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Speak your truth with zero filter..."
                    className="w-full p-4 bg-[#17171D] border border-white/10 rounded-2xl text-sm sm:text-base text-white placeholder-white/20 focus:outline-none focus:border-[#927CFF] resize-none"
                    autoFocus
                  />
                )}

                {/* Voice Recorder */}
                {answerType === 'voice' && (
                  <VoiceRecorder
                    onAudioRecorded={(base64, duration) => {
                      setRecordedAudio({ url: base64, duration });
                    }}
                    onClearAudio={() => setRecordedAudio(null)}
                  />
                )}

                {/* Photo Preview */}
                {photoDataUrl && (
                  <div className="p-3 rounded-2xl bg-[#17171D] border border-white/10 flex items-center gap-3">
                    <img src={photoDataUrl} alt="Photo proof" className="w-16 h-16 object-cover rounded-xl" />
                    <div>
                      <div className="text-xs font-bold text-white">Photo Proof Captured</div>
                      <div className="text-[10px] text-white/50">Ready to transmit directly over P2P</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSendAnswer}
                    disabled={!answerText.trim() && !recordedAudio && !photoDataUrl && gameState.activeQuestion.type === 'TRUTH'}
                    className="flex-1 py-4 px-5 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#6E53ED]/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Submit & Reveal</span>
                    <Send className="w-4 h-4" />
                  </button>

                  {/* Forfeit / Chicken Out Trigger */}
                  <button
                    type="button"
                    onClick={handleTriggerForfeitWheel}
                    className="py-4 px-4 bg-[#FF7B84]/15 hover:bg-[#FF7B84]/25 text-[#FF7B84] rounded-xl border border-[#FF7B84]/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                    title="Chicken out and face the Forfeit Penalty Wheel"
                  >
                    <Skull className="w-4 h-4" />
                    <span>Chicken Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center space-y-2">
                <div className="text-sm font-semibold text-white/80">
                  {answererPlayer?.name} is sweating on the Hot Seat...
                </div>
                <div className="text-xs text-white/40">
                  Bombard them with reactions while they formulate their truth!
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- STATE C: RATING & REVELATION ----------------- */}
        {gameState.activeQuestion && gameState.isAnswerSubmitted && (
          <div className="space-y-6 animate-fade-in">
            {/* Question & Answer Reveal Card */}
            <div className="space-y-3 border-b border-white/[0.06] pb-5">
              <div className="text-xs text-white/40 uppercase tracking-wider font-mono">
                {gameState.activeQuestion.type} · {currentStageConfig.name}
              </div>
              <p className="text-lg font-bold text-white/90">
                "{gameState.activeQuestion.text}"
              </p>

              {/* Answer Content */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#17171D] border border-white/[0.05] space-y-3">
                <div className="text-xs text-white/40 font-semibold font-mono">
                  {answererPlayer?.name}'s Unfiltered Response:
                </div>

                {gameState.activeAudioUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <audio controls src={gameState.activeAudioUrl} className="w-full max-w-md h-10" />
                  </div>
                ) : gameState.activePhotoUrl ? (
                  <div className="space-y-2">
                    <img src={gameState.activePhotoUrl} alt="Photo proof" className="max-h-60 rounded-xl object-contain border border-white/10" />
                    <p className="text-xs text-white/70 italic">Photo proof submitted</p>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-white leading-relaxed">
                    {gameState.isTooPersonal ? (
                      <span className="text-[#FF7B84] font-medium flex items-center gap-1.5">
                        <Skull className="w-4 h-4" />
                        {gameState.activeAnswer || 'Chicken Out: Took Forfeit'}
                      </span>
                    ) : (
                      gameState.activeAnswer || 'Dare Completed'
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Rating Controls (Shown to Questioner if rating not locked yet) */}
            {!gameState.activeRating && isMyTurnToAsk && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                    Rate This Answer
                  </span>
                  <span className="text-xs font-mono text-[#927CFF]">
                    Connection Score: {((honesty + depth + impact) / 3).toFixed(1)} / 5.0
                  </span>
                </div>

                {/* 3 Rating Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Honesty */}
                  <div className="p-3.5 rounded-xl bg-[#17171D] border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">Honesty</span>
                      <span className="text-xs font-mono text-[#59D8AD]">{honesty}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            sound.playSelect();
                            setHonesty(val);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            honesty === val
                              ? 'bg-[#59D8AD] text-[#09090C]'
                              : 'bg-white/5 text-white/50 hover:text-white'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Depth */}
                  <div className="p-3.5 rounded-xl bg-[#17171D] border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">Depth</span>
                      <span className="text-xs font-mono text-[#927CFF]">{depth}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            sound.playSelect();
                            setDepth(val);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            depth === val
                              ? 'bg-[#927CFF] text-[#09090C]'
                              : 'bg-white/5 text-white/50 hover:text-white'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Impact */}
                  <div className="p-3.5 rounded-xl bg-[#17171D] border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">Impact</span>
                      <span className="text-xs font-mono text-[#F05D9F]">{impact}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            sound.playSelect();
                            setImpact(val);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            impact === val
                              ? 'bg-[#F05D9F] text-[#09090C]'
                              : 'bg-white/5 text-white/50 hover:text-white'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reaction Picker */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-white/60">Reaction Badge:</span>
                  <div className="flex gap-2">
                    {['🔥', '💀', '🌶️', '😈', '❤️', '🤯', '👀', '🫂'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          sound.playSelect();
                          setSelectedReaction(emoji);
                        }}
                        className={`text-xl p-1.5 rounded-xl transition-transform cursor-pointer ${
                          selectedReaction === emoji
                            ? 'bg-white/20 scale-125'
                            : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLockRating}
                  className="w-full py-4 px-4 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#6E53ED]/25 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Lock Rating & Award XP
                </button>
              </div>
            )}

            {/* Result Card when locked */}
            {gameState.activeRating && (
              <div className="space-y-5 animate-fade-in">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#927CFF]/15 to-[#F05D9F]/15 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/50 uppercase tracking-wider font-mono">
                      Connection Score
                    </div>
                    <div className="font-['Syne',sans-serif] text-3xl font-extrabold text-white mt-0.5 flex items-center gap-2">
                      <span>{gameState.activeRating.score.toFixed(1)}</span>
                      <span className="text-2xl">{gameState.activeRating.reaction}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-white/50 uppercase tracking-wider font-mono">
                      XP Awarded
                    </div>
                    <div className="text-2xl font-bold text-[#59D8AD]">
                      +{gameState.activeRating.points} XP
                    </div>
                  </div>
                </div>

                {/* Next Round & Save Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveCurrentMoment}
                    className={`p-3.5 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      momentSaved
                        ? 'bg-[#59D8AD]/20 border-[#59D8AD] text-[#59D8AD]'
                        : 'bg-[#17171D] border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>{momentSaved ? 'Saved to Memory Box!' : 'Save Moment'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playSelect();
                      onNextRound();
                    }}
                    className="flex-1 py-4 px-5 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#6E53ED]/25 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Advance to Round {gameState.round + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Quick Reaction Bombing Toolbar */}
        <div className="pt-4 flex items-center justify-center">
          <ReactionBomber
            onSendReaction={(emoji) => {
              if (onSendReaction) onSendReaction(emoji);
            }}
            incomingReaction={incomingReaction}
          />
        </div>
      </div>

      {/* 4. FORFEIT ROULETTE MODAL IF TRIGGERED */}
      {showForfeitRoulette && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg">
            <ForfeitRoulette
              onPenaltySelected={handlePenaltyAccepted}
              onClose={() => setShowForfeitRoulette(false)}
              partnerName={questionerPlayer?.name}
            />
          </div>
        </div>
      )}

      {/* 5. CHAOS MODIFIERS SELECTION DRAWER */}
      {isChaosDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#111116] border border-[#F05D9F]/30 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="font-['Syne',sans-serif] text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#F05D9F]" />
                  <span>Chaos & Twist Deck</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Attach an unhinged modifier card to your challenge.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChaosDrawerOpen(false)}
                className="text-white/40 hover:text-white text-xs p-1"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {CHAOS_MODIFIERS.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => {
                    sound.playSelect();
                    setSelectedModifier(mod.id);
                    setIsChaosDrawerOpen(false);
                  }}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    selectedModifier === mod.id
                      ? 'bg-[#F05D9F]/15 border-[#F05D9F] text-white ring-1 ring-[#F05D9F]'
                      : 'bg-[#17171D] border-white/[0.05] hover:border-white/20 text-white/80'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{mod.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
                        {mod.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/50 mt-0.5">{mod.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. QUESTION BROWSE MODAL */}
      {isBrowseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#111116] border border-white/[0.08] rounded-3xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div>
                <h3 className="font-['Syne',sans-serif] text-xl font-bold text-white">
                  Browse {currentStageConfig.name} Library
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  Pick any prompt matching your curiosity.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBrowseOpen(false)}
                className="text-white/40 hover:text-white text-xs p-1 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-2.5 flex-1 pr-1">
              {QUESTION_DECK.filter(
                (q) => (gameState.vibe === 'WILDEST' ? true : q.stage === gameState.currentStage) && q.type === selectedType
              ).map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    sound.playSelect();
                    setSuggestedQuestion(q);
                    setIsBrowseOpen(false);
                    setQuestionMode('suggest');
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-[#17171D] hover:bg-white/[0.06] border border-white/[0.04] hover:border-[#927CFF]/50 transition-all cursor-pointer group"
                >
                  <p className="text-sm text-white/90 group-hover:text-white font-medium">
                    "{q.text}"
                  </p>
                  <span className="text-[10px] text-white/40 mt-1 block uppercase font-mono">
                    {q.type} · {q.vibe}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
