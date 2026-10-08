import React, { useState } from 'react';
import { Play, Copy, Check, ArrowRight, X, Users, Loader2 } from 'lucide-react';
import { GameState } from '../types/game';
import { copyToClipboard } from '../utils/clipboard';
import { getShareableRoomUrl } from '../utils/share';
import { sound } from '../utils/audio';

interface ActiveRoomBannerProps {
  gameState: GameState;
  onReturnToRoom: () => void;
  onLeaveRoom: () => void;
}

export const ActiveRoomBanner: React.FC<ActiveRoomBannerProps> = ({
  gameState,
  onReturnToRoom,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);

  const isGuestConnected = !!gameState.guest;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSelect();
    const url = getShareableRoomUrl(gameState.roomCode);
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      aria-label="Active Game Session"
      className={`w-full border-b transition-colors ${
      isGuestConnected
        ? 'bg-[#59D8AD]/10 border-[#59D8AD]/30 text-white'
        : 'bg-[#111116] border-[#927CFF]/20 text-white'
    }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Text */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isGuestConnected ? 'bg-[#59D8AD]' : 'bg-[#927CFF]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isGuestConnected ? 'bg-[#59D8AD]' : 'bg-[#927CFF]'
              }`}
            />
          </span>

          <span className="font-mono font-bold tracking-wider uppercase text-[11px]">
            Room {gameState.roomCode}
          </span>
          <span className="text-white/30 hidden sm:inline">·</span>

          <span className="text-white/80 font-medium">
            {gameState.started ? (
              <span>Game in Progress (Round {gameState.round} of 25)</span>
            ) : isGuestConnected ? (
              <span className="text-[#59D8AD] font-bold">
                {gameState.guest?.name} is ready!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-white/70">
                <Loader2 className="w-3 h-3 animate-spin text-[#927CFF]" />
                Waiting for partner to join...
              </span>
            )}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {!gameState.started && !isGuestConnected && (
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors flex items-center gap-1 font-mono text-[11px] cursor-pointer"
              title="Copy invite link"
            >
              {copied ? <Check className="w-3 h-3 text-[#59D8AD]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playSelect();
              onReturnToRoom();
            }}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm text-xs ${
              isGuestConnected
                ? 'bg-[#59D8AD] text-[#09090C] hover:bg-[#48c79c]'
                : 'bg-[#927CFF] text-[#09090C] hover:bg-[#8168fc]'
            }`}
          >
            <span>{gameState.started ? 'Return to Game' : isGuestConnected ? 'Start Round 1' : 'Return to Room'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={onLeaveRoom}
            className="p-1 text-white/40 hover:text-[#FF7B84] transition-colors rounded cursor-pointer"
            title="Leave and close room"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
