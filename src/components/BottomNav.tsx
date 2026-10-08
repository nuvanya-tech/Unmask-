import React from 'react';
import { Home, Users, Play, User, Bookmark, Radio } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onQuickPlay: () => void;
  hasActiveRoom?: boolean;
  isGuestConnected?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onQuickPlay,
  hasActiveRoom,
  isGuestConnected,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090C]/95 backdrop-blur-lg border-t border-white/[0.08] px-3 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
            currentTab === 'home' ? 'text-[#927CFF]' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide">HOME</span>
        </button>

        <button
          onClick={() => onSelectTab('people')}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
            currentTab === 'people' ? 'text-[#927CFF]' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide">PEOPLE</span>
        </button>

        {/* Highlighted dominant PLAY / ROOM button */}
        <button
          onClick={onQuickPlay}
          className="relative -top-3 flex flex-col items-center group cursor-pointer focus:outline-none"
        >
          <div
            className={`w-13 h-13 rounded-full p-0.5 shadow-xl transition-transform group-active:scale-95 flex items-center justify-center ${
              hasActiveRoom
                ? isGuestConnected
                  ? 'bg-gradient-to-tr from-[#59D8AD] to-[#38BDF8] shadow-[#59D8AD]/30 animate-pulse'
                  : 'bg-gradient-to-tr from-[#927CFF] to-[#6E53ED] shadow-[#927CFF]/30'
                : 'bg-gradient-to-tr from-[#6E53ED] via-[#927CFF] to-[#F05D9F] shadow-[#6E53ED]/30'
            }`}
          >
            <div className="w-full h-full rounded-full bg-[#111116] flex items-center justify-center group-hover:bg-[#111116]/80 transition-colors">
              {hasActiveRoom ? (
                <Radio className={`w-5 h-5 ${isGuestConnected ? 'text-[#59D8AD]' : 'text-[#927CFF]'}`} />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </div>
          </div>
          <span
            className={`text-[10px] font-bold tracking-wider mt-0.5 ${
              hasActiveRoom ? (isGuestConnected ? 'text-[#59D8AD]' : 'text-[#927CFF]') : 'text-white'
            }`}
          >
            {hasActiveRoom ? 'ROOM' : 'PLAY'}
          </span>
        </button>

        <button
          onClick={() => onSelectTab('moments')}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
            currentTab === 'moments' ? 'text-[#927CFF]' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide">MOMENTS</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
            currentTab === 'profile' ? 'text-[#927CFF]' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide">ME</span>
        </button>
      </div>
    </nav>
  );
};
