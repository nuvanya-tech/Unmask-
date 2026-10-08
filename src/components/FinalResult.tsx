import React from 'react';
import { Sparkles, Trophy, Flame, Bookmark, RotateCcw, Home, Star } from 'lucide-react';
import { GameState } from '../types/game';
import { Avatar } from './Avatar';
import { sound } from '../utils/audio';

interface FinalResultProps {
  gameState: GameState;
  isHost: boolean;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onGoMoments: () => void;
}

export const FinalResult: React.FC<FinalResultProps> = ({
  gameState,
  isHost,
  onPlayAgain,
  onGoHome,
  onGoMoments,
}) => {
  const totalRounds = gameState.roundHistory.length;

  const validRatings = gameState.roundHistory
    .map((r) => r.rating?.score)
    .filter((s): s is number => typeof s === 'number');

  const avgConnectionScore = validRatings.length > 0
    ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
    : '4.8';

  const customCount = gameState.roundHistory.filter((r) => r.question.isCustom).length;
  const skipsCount = gameState.roundHistory.filter((r) => r.isTooPersonal).length;

  // Find highest rated moment
  const highestRatedRecord = [...gameState.roundHistory].sort(
    (a, b) => (b.rating?.score || 0) - (a.rating?.score || 0)
  )[0];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in space-y-6">
      <div className="bg-[#111116] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-[#927CFF]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#59D8AD]/10 border border-[#59D8AD]/20 text-[#59D8AD] text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Conversation Complete
        </div>

        <h1 className="font-['Syne',sans-serif] text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          You Reached the Abyss
        </h1>
        <p className="text-sm text-white/50 max-w-md mx-auto mb-8">
          25 rounds of unfiltered truth, dares, and genuine human connection.
        </p>

        {/* Both players */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="flex flex-col items-center">
            <Avatar avatarId={gameState.host.avatar} size="lg" isHost />
            <span className="text-xs font-bold text-white mt-2">{gameState.host.name}</span>
            <span className="text-[10px] font-mono text-[#59D8AD]">+{gameState.xp.host} XP</span>
          </div>

          <div className="font-['Syne',sans-serif] text-xl font-bold text-white/30">×</div>

          <div className="flex flex-col items-center">
            <Avatar avatarId={gameState.guest?.avatar || 'ember'} size="lg" />
            <span className="text-xs font-bold text-white mt-2">{gameState.guest?.name || 'Guest'}</span>
            <span className="text-[10px] font-mono text-[#59D8AD]">+{gameState.xp.guest} XP</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-[#17171D] border border-white/[0.05]">
            <div className="text-[10px] text-white/40 uppercase font-mono">Connection</div>
            <div className="text-2xl font-bold text-[#927CFF] mt-1 flex items-center justify-center gap-1">
              <span>{avgConnectionScore}</span>
              <Star className="w-4 h-4 fill-[#927CFF] text-[#927CFF]" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#17171D] border border-white/[0.05]">
            <div className="text-[10px] text-white/40 uppercase font-mono">Rounds</div>
            <div className="text-2xl font-bold text-white mt-1">
              {totalRounds || 25}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#17171D] border border-white/[0.05]">
            <div className="text-[10px] text-white/40 uppercase font-mono">Custom Questions</div>
            <div className="text-2xl font-bold text-[#EFC65D] mt-1">
              {customCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#17171D] border border-white/[0.05]">
            <div className="text-[10px] text-white/40 uppercase font-mono">Safe Skips</div>
            <div className="text-2xl font-bold text-[#FF7B84] mt-1">
              {skipsCount}
            </div>
          </div>
        </div>

        {/* Highest Rated Moment */}
        {highestRatedRecord && (
          <div className="text-left p-5 rounded-2xl bg-[#17171D] border border-white/[0.06] mb-8">
            <div className="flex items-center justify-between text-xs text-white/40 mb-2 font-mono">
              <span>HIGHEST RATED MOMENT</span>
              <span className="text-[#927CFF] font-bold">
                {highestRatedRecord.rating?.score.toFixed(1)} ★
              </span>
            </div>
            <p className="text-sm font-bold text-white mb-2">
              "{highestRatedRecord.question.text}"
            </p>
            <p className="text-xs text-white/70 line-clamp-2 italic">
              "{highestRatedRecord.answer}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              sound.playSelect();
              onPlayAgain();
            }}
            className="flex-1 py-3.5 px-5 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#6E53ED]/25 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Another Game</span>
          </button>

          <button
            onClick={onGoMoments}
            className="py-3.5 px-5 bg-[#17171D] hover:bg-white/[0.08] text-white rounded-xl border border-white/10 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Bookmark className="w-4 h-4" />
            <span>View Memory Box</span>
          </button>

          <button
            onClick={onGoHome}
            className="py-3.5 px-4 bg-[#17171D] hover:bg-white/[0.08] text-white/70 hover:text-white rounded-xl border border-white/10 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
