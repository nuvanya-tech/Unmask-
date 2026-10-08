import React, { useState, useEffect, useRef } from 'react';
import {
  GameState,
  Player,
  QuestionItem,
  RatingData,
  RoomVibe,
  Stage,
  UserProfile,
  ChaosModifier,
  GameIntensity,
  ForfeitItem,
} from './types/game';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredPeople,
  recordPlayedPerson,
  addStoredMoment,
  checkAndIncrementStreak,
} from './utils/storage';
import { getStageForRound } from './data/questions';
import { network } from './services/network';
import { getDemoQuestion, getDemoAnswer, getDemoRating } from './services/demoBot';
import { sound } from './utils/audio';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ActiveRoomBanner } from './components/ActiveRoomBanner';
import { HomeView } from './components/HomeView';
import { JourneyView } from './components/JourneyView';
import { MomentsView } from './components/MomentsView';
import { PeopleView } from './components/PeopleView';
import { ProfileView } from './components/ProfileView';
import { CreateRoomModal } from './components/CreateRoomModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { AccountSetupModal } from './components/AccountSetupModal';
import { WaitingRoom } from './components/WaitingRoom';
import { GameArena } from './components/GameArena';
import { FinalResult } from './components/FinalResult';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [soundMuted, setSoundMuted] = useState<boolean>(sound.isMuted());

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isAccountSetupOpen, setIsAccountSetupOpen] = useState(false);
  const [inviteCodeFromUrl, setInviteCodeFromUrl] = useState<string>('');

  // Active Game State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isHost, setIsHost] = useState(true);

  // Partner joined toast notification & Reaction bombing
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [incomingReaction, setIncomingReaction] = useState<string | null>(null);

  // Bot thinking delay tracker
  const botTimeoutRef = useRef<any>(null);

  // 1. Initial URL param check for ?room=ABC123
  useEffect(() => {
    checkAndIncrementStreak();
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInviteCodeFromUrl(roomParam.trim().toUpperCase());
      setIsJoinOpen(true);
    }
  }, []);

  // 2. Network Event Listeners
  useEffect(() => {
    const unsubJoined = network.on('joined_room', (data) => {
      const { role, roomCode, vibe, host, guest } = data;
      const amHost = role === 'host';
      setIsHost(amHost);

      setGameState((prev) => {
        if (!prev) {
          return {
            roomCode,
            isDemo: false,
            vibe: vibe || 'REAL',
            intensity: vibe === 'WILDEST' ? 'UNHINGED' : 'WILD',
            passwordProtected: false,
            started: false,
            completed: false,
            round: 1,
            currentStage: 'life',
            turn: 'host',
            activeQuestion: null,
            activeAnswer: null,
            isAnswerSubmitted: false,
            isTooPersonal: false,
            activeRating: null,
            activeModifier: null,
            roundHistory: [],
            xp: { host: 0, guest: 0 },
            streak: profile.streak,
            host: host ? { ...host, role: 'host', isHost: true } : { id: 'h1', name: 'Host', avatar: 'phantom', role: 'host', isHost: true },
            guest: guest ? { ...guest, role: 'guest', isHost: false } : null,
          };
        }
        return {
          ...prev,
          host: host ? { ...host, role: 'host', isHost: true } : prev.host,
          guest: guest ? { ...guest, role: 'guest', isHost: false } : prev.guest,
        };
      });

      setCurrentTab('waiting');
    });

    const unsubPeerJoined = network.on('peer_joined', (data) => {
      const { player } = data;
      sound.playSubmit(); // Noticeable joyful chime
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          guest: { ...player, role: 'guest', isHost: false },
        };
      });

      // Show toast and auto-prompt
      setToastMessage(`${player.name || 'Your partner'} connected over P2P!`);
      setTimeout(() => setToastMessage(null), 5000);
    });

    const unsubPeerLeft = network.on('peer_left', () => {
      setToastMessage('Your conversation partner disconnected.');
      setTimeout(() => setToastMessage(null), 5000);
    });

    const unsubGameAction = network.on('game_action', (msg) => {
      const { actionType, payload } = msg;

      if (actionType === 'START_GAME') {
        sound.playSubmit();
        setGameState((prev) => (prev ? { ...prev, started: true } : prev));
        setCurrentTab('game');
      } else if (actionType === 'QUESTION_ASKED') {
        sound.playSelect();
        setGameState((prev) =>
          prev
            ? {
                ...prev,
                activeQuestion: payload.question,
                activeAnswer: null,
                activeAudioUrl: null,
                activePhotoUrl: null,
                activeForfeit: null,
                isAnswerSubmitted: false,
                isTooPersonal: false,
                activeRating: null,
              }
            : prev
        );
      } else if (actionType === 'ANSWER_SUBMITTED') {
        sound.playSubmit();
        setGameState((prev) =>
          prev
            ? {
                ...prev,
                activeAnswer: payload.answer,
                isTooPersonal: payload.isTooPersonal,
                activeAudioUrl: payload.audioUrl || null,
                activePhotoUrl: payload.photoUrl || null,
                activeForfeit: payload.forfeit || null,
                isAnswerSubmitted: true,
              }
            : prev
        );
      } else if (actionType === 'REACTION_SENT') {
        setIncomingReaction(payload.emoji);
      } else if (actionType === 'CHAOS_TRIGGERED') {
        sound.playWildSiren();
        setGameState((prev) => (prev ? { ...prev, activeModifier: payload.modifier } : prev));
      } else if (actionType === 'RATING_LOCKED') {
        sound.playScore();
        setGameState((prev) => {
          if (!prev) return prev;
          const { rating } = payload;
          return {
            ...prev,
            activeRating: rating,
            xp: {
              ...prev.xp,
              [prev.turn]: prev.xp[prev.turn] + rating.points,
            },
          };
        });
      } else if (actionType === 'NEXT_ROUND') {
        setGameState((prev) => {
          if (!prev) return prev;
          const nextRound = prev.round + 1;
          const nextStage = getStageForRound(nextRound);
          const nextTurn = prev.turn === 'host' ? 'guest' : 'host';

          if (nextRound > 25) {
            setCurrentTab('completed');
            return { ...prev, completed: true };
          }

          if (nextStage !== prev.currentStage) {
            sound.playStageShift();
          }

          return {
            ...prev,
            round: nextRound,
            currentStage: nextStage,
            turn: nextTurn,
            activeQuestion: null,
            activeAnswer: null,
            activeAudioUrl: null,
            activePhotoUrl: null,
            activeForfeit: null,
            isAnswerSubmitted: false,
            isTooPersonal: false,
            activeRating: null,
            activeModifier: null,
          };
        });
      }
    });

    return () => {
      unsubJoined();
      unsubPeerJoined();
      unsubPeerLeft();
      unsubGameAction();
    };
  }, [profile.streak]);

  // 3. Demo Bot Brain Loop
  useEffect(() => {
    if (!gameState || !gameState.isDemo || gameState.completed || !gameState.started) {
      return;
    }

    // Bot is Guest:
    // A. If it's Bot's turn to ask and no active question:
    if (gameState.turn === 'guest' && !gameState.activeQuestion) {
      clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = setTimeout(() => {
        const botQ = getDemoQuestion(gameState.currentStage, Math.random() > 0.3);
        sound.playSelect();
        setGameState((prev) => (prev ? { ...prev, activeQuestion: botQ } : prev));
      }, 1500);
    }

    // B. If user asked bot a question and bot needs to answer:
    if (gameState.turn === 'host' && gameState.activeQuestion && !gameState.isAnswerSubmitted) {
      clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = setTimeout(() => {
        const { answer, isTooPersonal } = getDemoAnswer(gameState.activeQuestion!);
        sound.playSubmit();
        setGameState((prev) =>
          prev
            ? {
                ...prev,
                activeAnswer: answer,
                isTooPersonal,
                isAnswerSubmitted: true,
              }
            : prev
        );
      }, 2200);
    }

    // C. If user answered bot's question and bot needs to rate:
    if (
      gameState.turn === 'guest' &&
      gameState.activeQuestion &&
      gameState.isAnswerSubmitted &&
      !gameState.activeRating
    ) {
      clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = setTimeout(() => {
        const botRating = getDemoRating(
          gameState.activeAnswer || '',
          gameState.isTooPersonal
        );
        sound.playScore();
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            activeRating: botRating,
            xp: {
              ...prev.xp,
              guest: prev.xp.guest + botRating.points,
            },
          };
        });
      }, 1800);
    }
  }, [
    gameState?.isDemo,
    gameState?.started,
    gameState?.turn,
    gameState?.activeQuestion,
    gameState?.isAnswerSubmitted,
    gameState?.activeRating,
    gameState?.round,
  ]);

  // Handle Starting a Room (Immediate state transition + background network pairing)
  const handleStartRoom = (config: {
    roomCode: string;
    vibe: RoomVibe;
    hasPassword: boolean;
    password?: string;
    hostId?: string;
    isDemo?: boolean;
    isPassAndPlay?: boolean;
  }) => {
    setIsCreateOpen(false);

    const me: Player = {
      id: config.hostId || ('host_' + Date.now()),
      name: profile.name,
      avatar: profile.avatar,
      role: 'host',
      isHost: true,
    };

    if (config.isPassAndPlay) {
      setIsHost(true);
      const guestPlayer: Player = {
        id: 'p_guest',
        name: 'Player 2',
        avatar: 'ember',
        role: 'guest',
        isHost: false,
      };

      setGameState({
        roomCode: 'LOCAL',
        isDemo: false,
        isPassAndPlay: true,
        vibe: config.vibe,
        intensity: config.vibe === 'WILDEST' ? 'UNHINGED' : 'WILD',
        passwordProtected: false,
        started: true,
        completed: false,
        round: 1,
        currentStage: 'life',
        turn: 'host',
        activeQuestion: null,
        activeAnswer: null,
        isAnswerSubmitted: false,
        isTooPersonal: false,
        activeRating: null,
        activeModifier: null,
        roundHistory: [],
        xp: { host: 0, guest: 0 },
        streak: profile.streak,
        host: me,
        guest: guestPlayer,
      });
      setCurrentTab('game');
      return;
    }

    // Set state IMMEDIATELY so user instantly sees room code, share link, and safety fingerprint
    setIsHost(true);
    setGameState({
      roomCode: config.roomCode,
      isDemo: false,
      vibe: config.vibe,
      intensity: config.vibe === 'WILDEST' ? 'UNHINGED' : 'WILD',
      passwordProtected: config.hasPassword,
      started: false,
      completed: false,
      round: 1,
      currentStage: 'life',
      turn: 'host',
      activeQuestion: null,
      activeAnswer: null,
      isAnswerSubmitted: false,
      isTooPersonal: false,
      activeRating: null,
      activeModifier: null,
      roundHistory: [],
      xp: { host: 0, guest: 0 },
      streak: profile.streak,
      host: me,
      guest: null,
    });
    setCurrentTab('waiting');

    // Connect WebSocket / WebRTC in background
    network.connect(config.roomCode, me, config.password).catch((err) => {
      console.warn('Background P2P network notice:', err);
    });
  };

  // Handle Joining a Room with Partner Account Setup
  const handleJoinSuccess = (
    code: string,
    pass?: string,
    updatedProfile?: { name: string; avatar: string }
  ) => {
    setIsJoinOpen(false);

    if (updatedProfile) {
      const p: UserProfile = {
        ...profile,
        name: updatedProfile.name,
        avatar: updatedProfile.avatar,
      };
      saveStoredProfile(p);
      setProfile(p);
    }

    const me: Player = {
      id: 'p_guest_' + Date.now(),
      name: updatedProfile?.name || profile.name,
      avatar: updatedProfile?.avatar || profile.avatar,
      role: 'guest',
      isHost: false,
    };

    setIsHost(false);
    setGameState({
      roomCode: code,
      isDemo: false,
      vibe: 'WILDEST',
      intensity: 'UNHINGED',
      passwordProtected: !!pass,
      started: false,
      completed: false,
      round: 1,
      currentStage: 'life',
      turn: 'host',
      activeQuestion: null,
      activeAnswer: null,
      isAnswerSubmitted: false,
      isTooPersonal: false,
      activeRating: null,
      activeModifier: null,
      roundHistory: [],
      xp: { host: 0, guest: 0 },
      streak: profile.streak,
      host: { id: 'host', name: 'Host', avatar: 'phantom', role: 'host', isHost: true },
      guest: me,
    });
    setCurrentTab('waiting');

    network.connect(code, me, pass);
  };

  // Launch Demo Mode
  const handleStartDemo = () => {
    const me: Player = {
      id: 'p_me',
      name: profile.name,
      avatar: profile.avatar,
      role: 'host',
      isHost: true,
    };

    const demoBot: Player = {
      id: 'p_demo',
      name: 'Echo (Companion)',
      avatar: 'velvet',
      role: 'guest',
      isHost: false,
    };

    setGameState({
      roomCode: 'DEMO',
      isDemo: true,
      vibe: 'WILDEST',
      intensity: 'UNHINGED',
      passwordProtected: false,
      started: true,
      completed: false,
      round: 1,
      currentStage: 'life',
      turn: 'host',
      activeQuestion: null,
      activeAnswer: null,
      isAnswerSubmitted: false,
      isTooPersonal: false,
      activeRating: null,
      activeModifier: null,
      roundHistory: [],
      xp: { host: 0, guest: 0 },
      streak: profile.streak,
      host: me,
      guest: demoBot,
    });
    setIsHost(true);
    setCurrentTab('game');
  };

  // User Actions during gameplay
  const handleAskQuestion = (question: QuestionItem) => {
    if (!gameState) return;

    const updated = {
      ...gameState,
      activeQuestion: question,
      activeAnswer: null,
      activeAudioUrl: null,
      activePhotoUrl: null,
      activeForfeit: null,
      isAnswerSubmitted: false,
      isTooPersonal: false,
      activeRating: null,
    };
    setGameState(updated);

    if (!gameState.isDemo && !gameState.isPassAndPlay) {
      network.sendAction('QUESTION_ASKED', { question });
    }

    // Award question authoring stats
    const p = { ...profile, questionsAsked: profile.questionsAsked + 1 };
    if (question.isCustom) {
      p.customQuestionsCount += 1;
      p.totalXp += 25;
    }
    saveStoredProfile(p);
    setProfile(p);
  };

  const handleSubmitAnswer = (
    answer: string,
    isTooPersonal: boolean,
    audioUrl?: string,
    photoUrl?: string,
    forfeit?: ForfeitItem
  ) => {
    if (!gameState) return;

    const updated = {
      ...gameState,
      activeAnswer: answer,
      isTooPersonal,
      activeAudioUrl: audioUrl || null,
      activePhotoUrl: photoUrl || null,
      activeForfeit: forfeit || null,
      isAnswerSubmitted: true,
    };
    setGameState(updated);

    if (!gameState.isDemo && !gameState.isPassAndPlay) {
      network.sendAction('ANSWER_SUBMITTED', {
        answer,
        isTooPersonal,
        audioUrl,
        photoUrl,
        forfeit,
      });
    }

    // Update profile stats
    const p = {
      ...profile,
      questionsAnswered: profile.questionsAnswered + 1,
      totalXp: profile.totalXp + (audioUrl ? 40 : photoUrl ? 45 : 20),
    };
    saveStoredProfile(p);
    setProfile(p);
  };

  const handleSendReaction = (emoji: string) => {
    if (!gameState?.isDemo && !gameState?.isPassAndPlay) {
      network.sendAction('REACTION_SENT', { emoji });
    }
  };

  const handleTriggerChaos = (mod: ChaosModifier) => {
    sound.playWildSiren();
    setGameState((prev) => (prev ? { ...prev, activeModifier: mod } : prev));
    if (!gameState?.isDemo && !gameState?.isPassAndPlay) {
      network.sendAction('CHAOS_TRIGGERED', { modifier: mod });
    }
  };

  const handleLockRating = (rating: RatingData) => {
    if (!gameState) return;

    const currentTurn = gameState.turn;
    const updated = {
      ...gameState,
      activeRating: rating,
      xp: {
        ...gameState.xp,
        [currentTurn]: gameState.xp[currentTurn] + rating.points,
      },
    };
    setGameState(updated);

    if (!gameState.isDemo && !gameState.isPassAndPlay) {
      network.sendAction('RATING_LOCKED', { rating });
    }

    // Record round into history
    if (gameState.activeQuestion) {
      updated.roundHistory.push({
        round: gameState.round,
        stage: gameState.currentStage,
        questioner: gameState.turn,
        answerer: gameState.turn === 'host' ? 'guest' : 'host',
        question: gameState.activeQuestion,
        answer: gameState.activeAnswer || '',
        audioUrl: gameState.activeAudioUrl || undefined,
        photoUrl: gameState.activePhotoUrl || undefined,
        isTooPersonal: gameState.isTooPersonal,
        forfeit: gameState.activeForfeit || undefined,
        rating,
        timestamp: Date.now(),
      });
    }

    // Reward profile XP
    const p = { ...profile, totalXp: profile.totalXp + rating.points };
    saveStoredProfile(p);
    setProfile(p);
  };

  const handleNextRound = () => {
    if (!gameState) return;

    const nextRound = gameState.round + 1;
    const nextStage = getStageForRound(nextRound);
    const nextTurn = gameState.turn === 'host' ? 'guest' : 'host';

    if (nextRound > 25) {
      handleCompleteGame();
      return;
    }

    if (nextStage !== gameState.currentStage) {
      sound.playStageShift();
    }

    const updated: GameState = {
      ...gameState,
      round: nextRound,
      currentStage: nextStage,
      turn: nextTurn,
      activeQuestion: null,
      activeAnswer: null,
      activeAudioUrl: null,
      activePhotoUrl: null,
      activeForfeit: null,
      isAnswerSubmitted: false,
      isTooPersonal: false,
      activeRating: null,
      activeModifier: null,
    };
    setGameState(updated);

    if (!gameState.isDemo && !gameState.isPassAndPlay) {
      network.sendAction('NEXT_ROUND', {});
    }
  };

  const handleCompleteGame = () => {
    if (!gameState) return;
    sound.playAchievement();
    const updated = { ...gameState, completed: true };
    setGameState(updated);
    setCurrentTab('completed');

    // Record person played with
    const partner = isHost ? gameState.guest : gameState.host;
    if (partner) {
      recordPlayedPerson(partner.name, partner.avatar, 4.8);
    }

    // Update profile
    const p = {
      ...profile,
      gamesCompleted: profile.gamesCompleted + 1,
      highestRound: 25,
      totalXp: profile.totalXp + 150, // game completion bonus
    };
    saveStoredProfile(p);
    setProfile(p);
  };

  const handleSaveMoment = (
    question: string,
    answer: string,
    score: number,
    isDare: boolean,
    stage: Stage,
    reaction?: string
  ) => {
    if (!gameState) return;
    const partner = isHost ? gameState.guest : gameState.host;
    addStoredMoment({
      id: 'm_' + Date.now(),
      partnerName: partner?.name || 'Partner',
      partnerAvatar: partner?.avatar || 'ember',
      question,
      answer,
      isDare,
      stage,
      score,
      reaction,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    });
  };

  const handleLeaveRoom = () => {
    network.disconnect();
    setGameState(null);
    setCurrentTab('home');
  };

  const handleReturnToRoom = () => {
    if (!gameState) return;
    setCurrentTab(gameState.started ? 'game' : 'waiting');
  };

  // Determine if viewing an outside tab while room is active
  const isBrowsingWithActiveRoom =
    !!gameState && currentTab !== 'waiting' && currentTab !== 'game' && currentTab !== 'completed';

  return (
    <div className="min-h-screen bg-[#09090C] text-[#F7F5F2] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#927CFF]/30 pb-20 md:pb-6">
      {/* Toast message if partner connects while looking around */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#17171D] border border-[#59D8AD]/40 text-white p-3.5 px-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#59D8AD] animate-ping" />
          <span>{toastMessage}</span>
          <button
            onClick={handleReturnToRoom}
            className="ml-2 px-2.5 py-1 bg-[#59D8AD] text-[#09090C] rounded-lg font-bold hover:bg-[#48c79c] transition-colors cursor-pointer"
          >
            Go to Room
          </button>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          sound.playSelect();
          setCurrentTab(tab);
        }}
        onCreateRoom={() => setIsCreateOpen(true)}
        soundMuted={soundMuted}
        onToggleSound={() => setSoundMuted(sound.toggleMute())}
        inGame={currentTab === 'game' || currentTab === 'waiting'}
        roomCode={gameState?.roomCode}
        isDemo={gameState?.isDemo}
        onReturnToRoom={handleReturnToRoom}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* Floating Active Room Banner if user is looking around the app */}
      {isBrowsingWithActiveRoom && (
        <ActiveRoomBanner
          gameState={gameState}
          onReturnToRoom={handleReturnToRoom}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'home' && (
          <HomeView
            profile={profile}
            recentPeople={getStoredPeople()}
            onCreateRoom={() => setIsCreateOpen(true)}
            onJoinRoom={() => setIsJoinOpen(true)}
            onStartDemo={handleStartDemo}
            onStartPassAndPlay={() =>
              handleStartRoom({
                roomCode: 'LOCAL',
                vibe: 'WILDEST',
                hasPassword: false,
                isPassAndPlay: true,
              })
            }
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'journey' && <JourneyView />}

        {currentTab === 'moments' && <MomentsView />}

        {currentTab === 'people' && (
          <PeopleView
            onInvitePerson={() => {
              setIsCreateOpen(true);
            }}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView profile={profile} onUpdateProfile={setProfile} />
        )}

        {currentTab === 'waiting' && gameState && (
          <WaitingRoom
            roomCode={gameState.roomCode}
            host={gameState.host}
            guest={gameState.guest}
            isHost={isHost}
            vibe={gameState.vibe}
            passwordProtected={gameState.passwordProtected}
            onStartGame={() => {
              network.sendAction('START_GAME', {});
              setGameState((prev) => (prev ? { ...prev, started: true } : prev));
              setCurrentTab('game');
            }}
            onLeave={handleLeaveRoom}
            onStartDemoInstead={handleStartDemo}
            onExploreApp={() => {
              setCurrentTab('journey');
              setToastMessage('Room active in background! We will alert you when your partner joins.');
              setTimeout(() => setToastMessage(null), 4500);
            }}
          />
        )}

        {currentTab === 'game' && gameState && (
          <GameArena
            gameState={gameState}
            isHost={isHost}
            onAskQuestion={handleAskQuestion}
            onSubmitAnswer={handleSubmitAnswer}
            onLockRating={handleLockRating}
            onNextRound={handleNextRound}
            onSaveMoment={handleSaveMoment}
            onTriggerChaos={handleTriggerChaos}
            onSendReaction={handleSendReaction}
            incomingReaction={incomingReaction}
            isDemo={gameState.isDemo}
          />
        )}

        {currentTab === 'completed' && gameState && (
          <FinalResult
            gameState={gameState}
            isHost={isHost}
            onPlayAgain={() => {
              setGameState(null);
              setIsCreateOpen(true);
            }}
            onGoHome={() => {
              setGameState(null);
              setCurrentTab('home');
            }}
            onGoMoments={() => {
              setCurrentTab('moments');
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (Always accessible unless inside full-screen active game) */}
      {currentTab !== 'game' && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => {
            sound.playSelect();
            setCurrentTab(tab);
          }}
          onQuickPlay={() => {
            sound.playSelect();
            if (gameState) {
              handleReturnToRoom();
            } else {
              setIsCreateOpen(true);
            }
          }}
          hasActiveRoom={!!gameState}
          isGuestConnected={!!gameState?.guest}
        />
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        playerName={profile.name}
        playerAvatar={profile.avatar}
        onStartRoom={handleStartRoom}
        onExploreApp={() => {
          setIsCreateOpen(false);
          setCurrentTab('journey');
          setToastMessage('Room active in background! We will alert you when your partner joins.');
          setTimeout(() => setToastMessage(null), 4500);
        }}
      />

      {/* Join Room Modal with Partner Account Setup */}
      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        playerName={profile.name}
        playerAvatar={profile.avatar}
        initialCode={inviteCodeFromUrl}
        onJoinSuccess={handleJoinSuccess}
      />

      {/* Account Setup Modal */}
      <AccountSetupModal
        isOpen={isAccountSetupOpen}
        onClose={() => setIsAccountSetupOpen(false)}
        currentProfile={profile}
        onProfileSaved={(updated) => setProfile(updated)}
      />
    </div>
  );
}
