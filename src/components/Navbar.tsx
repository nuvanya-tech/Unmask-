import React from 'react';
import { Volume2, VolumeX, Plus, ArrowRight, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onCreateRoom: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  inGame?: boolean;
  roomCode?: string;
  isDemo?: boolean;
  onReturnToRoom?: () => void;
  onLeaveRoom?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onCreateRoom,
  soundMuted,
  onToggleSound,
  inGame,
  roomCode,
  isDemo,
  onReturnToRoom,
  onLeaveRoom,
}) => {
  const isDirectlyInRoomOrGame = currentTab === 'waiting' || currentTab === 'game';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#09090C]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
        >
          <span className="font-['Syne',sans-serif] font-extrabold text-xl tracking-tight text-white group-hover:text-[#927CFF] transition-colors">
            UNMASK
          </span>
          {roomCode && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/50 pl-2.5 border-l border-white/10 font-mono">
              {isDemo ? (
                <span className="text-[#EFC65D] font-bold">DEMO</span>
              ) : (
                <span className="text-[#927CFF] font-semibold">{roomCode}</span>
              )}
            </span>
          )}
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-white/70">
          <button
            onClick={() => onSelectTab('home')}
            className={`transition-colors hover:text-white cursor-pointer ${
              currentTab === 'home' ? 'text-[#927CFF] font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab('journey')}
            className={`transition-colors hover:text-white cursor-pointer ${
              currentTab === 'journey' ? 'text-[#927CFF] font-semibold' : ''
            }`}
          >
            The Journey
          </button>
          <button
            onClick={() => onSelectTab('moments')}
            className={`transition-colors hover:text-white cursor-pointer ${
              currentTab === 'moments' ? 'text-[#927CFF] font-semibold' : ''
            }`}
          >
            Moments
          </button>
          <button
            onClick={() => onSelectTab('people')}
            className={`transition-colors hover:text-white cursor-pointer ${
              currentTab === 'people' ? 'text-[#927CFF] font-semibold' : ''
            }`}
          >
            People
          </button>
          <button
            onClick={() => onSelectTab('profile')}
            className={`transition-colors hover:text-white cursor-pointer ${
              currentTab === 'profile' ? 'text-[#927CFF] font-semibold' : ''
            }`}
          >
            Profile
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSound}
            aria-label={soundMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus-visible:ring-1 focus-visible:ring-[#927CFF] cursor-pointer"
            title={soundMuted ? 'Sound muted' : 'Sound active'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* If room exists and user is looking around app */}
          {roomCode && !isDirectlyInRoomOrGame && onReturnToRoom && (
            <button
              onClick={() => {
                sound.playSelect();
                onReturnToRoom();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#09090C] bg-[#59D8AD] hover:bg-[#48c79c] rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <span>Back to Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Inside waiting or active game */}
          {isDirectlyInRoomOrGame && onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              className="px-3 py-1.5 text-xs text-white/60 hover:text-[#FF7B84] hover:bg-white/5 rounded-lg transition-colors border border-white/10 cursor-pointer"
            >
              Leave Room
            </button>
          )}

          {/* If no room active, show Create Room button */}
          {!roomCode && (
            <button
              onClick={() => {
                sound.playSelect();
                onCreateRoom();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] rounded-xl shadow-lg shadow-[#6E53ED]/25 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Room</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
