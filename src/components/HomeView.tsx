import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Users,
  Lock,
  Play,
  RotateCcw,
  Zap,
  Shield,
  Star,
} from 'lucide-react';
import { UserProfile, PersonRecord } from '../types/game';
import { STAGE_CONFIG } from '../data/questions';
import { Avatar } from './Avatar';
import { sound } from '../utils/audio';

interface HomeViewProps {
  profile: UserProfile;
  recentPeople: PersonRecord[];
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onStartDemo: () => void;
  onStartPassAndPlay: () => void;
  onSelectTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  recentPeople,
  onCreateRoom,
  onJoinRoom,
  onStartDemo,
  onStartPassAndPlay,
  onSelectTab,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-12 animate-fade-in">
      {/* 1. HERO SECTION */}
      <section className="text-center max-w-2xl mx-auto space-y-6 pt-4">
        {/* Subtle tagline badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white/70">
          <span className="w-2 h-2 rounded-full bg-[#927CFF] animate-pulse" />
          <span>A Private Two-Player Conversation Game</span>
        </div>

        <h1 className="font-['Syne',sans-serif] text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
          UNMASK
        </h1>

        <p className="text-base sm:text-lg text-white/60 font-medium max-w-lg mx-auto leading-relaxed">
          Start light. Gradually go deeper. The two of you control the questions, the pace, and the intensity.
        </p>

        {/* Primary & Secondary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              sound.playSelect();
              onCreateRoom();
            }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-[#6E53ED]/25 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
          >
            <span>Create Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              onJoinRoom();
            }}
            className="w-full sm:w-auto px-7 py-4 bg-[#17171D] hover:bg-white/[0.08] text-white font-semibold text-sm sm:text-base rounded-2xl border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Join with Code</span>
          </button>
        </div>

        {/* Instant Solo Demo & Pass-and-Play */}
        <div className="flex items-center justify-center gap-4 text-xs text-white/40 pt-1">
          <button
            onClick={() => {
              sound.playSelect();
              onStartDemo();
            }}
            className="hover:text-[#EFC65D] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EFC65D]" />
            <span>Test with Demo Companion</span>
          </button>
          <span>·</span>
          <button
            onClick={() => {
              sound.playSelect();
              onStartPassAndPlay();
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            <span>Pass & Play (Same Device)</span>
          </button>
        </div>
      </section>

      {/* 2. STATS OVERVIEW */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#111116] border border-white/[0.06] text-center">
          <div className="text-[11px] font-mono text-white/40 uppercase">Total XP</div>
          <div className="text-2xl font-bold text-[#59D8AD] mt-1">{profile.totalXp}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111116] border border-white/[0.06] text-center">
          <div className="text-[11px] font-mono text-white/40 uppercase">Streak</div>
          <div className="text-2xl font-bold text-[#F05D9F] mt-1 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5" />
            <span>{profile.streak}d</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111116] border border-white/[0.06] text-center">
          <div className="text-[11px] font-mono text-white/40 uppercase">Sessions</div>
          <div className="text-2xl font-bold text-white mt-1">{profile.gamesCompleted}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111116] border border-white/[0.06] text-center">
          <div className="text-[11px] font-mono text-white/40 uppercase">Current Title</div>
          <div className="text-base font-bold text-[#927CFF] mt-2 truncate">{profile.title}</div>
        </div>
      </section>

      {/* WILDEST MODE & P2P SECURITY SPOTLIGHT */}
      <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#FF7B84]/15 via-[#927CFF]/15 to-[#111116] border border-[#FF7B84]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl">
        <div className="space-y-1.5 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF7B84]/20 border border-[#FF7B84]/30 text-[#FF7B84] text-[10px] font-bold uppercase font-mono">
            <Flame className="w-3 h-3" /> Wildest Unfiltered Edition
          </div>
          <h3 className="font-['Syne',sans-serif] text-xl sm:text-2xl font-bold text-white tracking-tight">
            Craving Adrenaline & No-Filter Honesty?
          </h3>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
            Spicy chemistry truths, taboo secrets, roulette forfeits for anyone who chickens out, and direct browser-to-browser P2P encryption with zero transcripts stored.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playSelect();
            onCreateRoom();
          }}
          className="px-6 py-3.5 bg-gradient-to-r from-[#FF7B84] to-[#F05D9F] hover:from-[#ff6b76] hover:to-[#e04c8e] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#FF7B84]/25 transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-2"
        >
          <span>Create Wildest Session</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 3. THE 5-STAGE PROGRESSION TEASER */}
      <section className="bg-[#111116] border border-white/[0.06] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-['Syne',sans-serif] text-xl font-bold text-white">
              The 25-Round Journey
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Natural escalation from everyday anecdotes into the deep abyss.
            </p>
          </div>

          <button
            onClick={() => onSelectTab('journey')}
            className="text-xs text-[#927CFF] hover:underline font-semibold text-left sm:text-right"
          >
            Learn about each stage →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {(['life', 'personal', 'deep', 'dark', 'abyss'] as const).map((key, i) => {
            const config = STAGE_CONFIG[key];
            return (
              <div
                key={key}
                className="p-4 rounded-2xl bg-[#17171D] border border-white/[0.04] space-y-2 relative overflow-hidden group hover:border-white/15 transition-all"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white/40">0{i + 1}</span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.accentColor }}
                  />
                </div>
                <div className="font-bold text-sm text-white">{config.name}</div>
                <div className="text-[10px] text-white/40 font-mono">{config.range}</div>
                <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                  {config.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. RECENT PARTNERS TEASER */}
      {recentPeople.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Syne',sans-serif] text-lg font-bold text-white">
              Recent Partners
            </h3>
            <button
              onClick={() => onSelectTab('people')}
              className="text-xs text-white/50 hover:text-white"
            >
              View all ({recentPeople.length}) →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentPeople.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#111116] border border-white/[0.06] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar avatarId={p.avatar} size="sm" />
                  <div>
                    <div className="text-xs font-bold text-white">{p.name}</div>
                    <div className="text-[10px] text-white/40">Played {p.lastPlayed}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#927CFF]">
                  <span>{p.averageScore.toFixed(1)}</span>
                  <Star className="w-3 h-3 fill-[#927CFF]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
