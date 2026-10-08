import React, { useState, useEffect } from 'react';
import { X, Lock, ArrowRight, AlertCircle, ShieldCheck, User, Sparkles } from 'lucide-react';
import { Avatar } from './Avatar';
import { sound } from '../utils/audio';
import { AVATAR_OPTIONS } from '../data/questions';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  playerAvatar: string;
  initialCode?: string;
  onJoinSuccess: (roomCode: string, password?: string, updatedProfile?: { name: string; avatar: string }) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  playerName,
  playerAvatar,
  initialCode = '',
  onJoinSuccess,
}) => {
  const [code, setCode] = useState(initialCode);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New user account / mask setup
  const [guestName, setGuestName] = useState(playerName || 'Partner');
  const [guestAvatar, setGuestAvatar] = useState(playerAvatar || 'ember');
  const [isCustomizing, setIsCustomizing] = useState(false);

  const [roomDetails, setRoomDetails] = useState<{
    hostName?: string;
    hostAvatar?: string;
    vibe?: string;
  } | null>(null);

  useEffect(() => {
    if (initialCode) {
      const cleanCode = initialCode.toUpperCase();
      setCode(cleanCode);

      // Auto-fetch room details so invited partner instantly sees host name & vibe
      fetch('/api/rooms/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: cleanCode }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.exists) {
            setRoomDetails({
              hostName: data.hostName,
              hostAvatar: data.hostAvatar,
              vibe: data.vibe,
            });
            if (data.hasPassword) {
              setRequiresPassword(true);
            }
          }
        })
        .catch(() => {});
    }
  }, [initialCode]);

  if (!isOpen) return null;

  const handleCheckOrJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter a 6-character room code.');
      return;
    }

    setError(null);
    setChecking(true);
    sound.playSelect();

    try {
      // Step 1: Check room with server
      const res = await fetch('/api/rooms/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: cleanCode }),
      });

      const data = await res.json();

      if (!data.exists) {
        setError("That room doesn't exist anymore.");
        setChecking(false);
        return;
      }

      if (data.isFull) {
        setError('This room already has two players.');
        setChecking(false);
        return;
      }

      setRoomDetails({
        hostName: data.hostName,
        hostAvatar: data.hostAvatar,
        vibe: data.vibe,
      });

      // Flow check: Password required?
      if (data.hasPassword && !requiresPassword) {
        setRequiresPassword(true);
        setChecking(false);
        return;
      }

      // If password was required and entered, or no password required:
      onJoinSuccess(
        cleanCode,
        requiresPassword ? password.trim() : undefined,
        { name: guestName.trim() || 'Partner', avatar: guestAvatar }
      );
    } catch {
      // Offline fallback: connect directly
      onJoinSuccess(
        cleanCode,
        password.trim(),
        { name: guestName.trim() || 'Partner', avatar: guestAvatar }
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#111116] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#59D8AD]/10 border border-[#59D8AD]/20 text-[#59D8AD] text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">
            <ShieldCheck className="w-3 h-3" /> P2P Encrypted Session
          </div>
          <h2 className="font-['Syne',sans-serif] text-2xl font-bold text-white tracking-tight">
            {roomDetails ? `${roomDetails.hostName || 'Partner'} Invited You` : 'Join Conversation'}
          </h2>
          <p className="text-xs text-white/50 mt-1">
            {roomDetails
              ? 'Choose your secret mask persona to enter this private session.'
              : 'Setup your mask persona and connect directly to your partner.'}
          </p>
        </div>

        {/* Room Preview if found */}
        {roomDetails && (
          <div className="p-3 mb-5 rounded-2xl bg-gradient-to-r from-[#927CFF]/15 to-transparent border border-[#927CFF]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar avatarId={roomDetails.hostAvatar || 'phantom'} size="sm" isHost />
              <div>
                <div className="text-[10px] text-white/50 uppercase font-mono">Room Host</div>
                <div className="text-xs font-bold text-white">{roomDetails.hostName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/50 uppercase font-mono">Vibe</div>
              <div className="text-xs font-bold text-[#927CFF]">{roomDetails.vibe}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleCheckOrJoin} className="space-y-4">
          {/* Room Code */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 font-mono">
              6-Digit Room Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
                setRequiresPassword(false);
              }}
              placeholder="e.g. ABC123"
              className="w-full px-4 py-3 bg-[#17171D] border border-white/10 rounded-2xl text-center text-2xl font-mono font-bold tracking-widest text-white uppercase placeholder-white/20 focus:outline-none focus:border-[#927CFF]"
              autoFocus={!initialCode}
            />
          </div>

          {/* New User Account / Mask Setup Section */}
          <div className="p-3.5 rounded-2xl bg-[#17171D] border border-white/[0.05] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#927CFF]" />
                <span>Your Partner Identity</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="text-[11px] text-[#927CFF] hover:underline font-semibold cursor-pointer"
              >
                {isCustomizing ? 'Done' : 'Change Mask'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Avatar avatarId={guestAvatar} size="md" />
              <div className="flex-1">
                <input
                  type="text"
                  maxLength={18}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your Name..."
                  className="w-full px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-semibold text-white placeholder-white/30 focus:outline-none focus:border-[#927CFF]"
                />
              </div>
            </div>

            {/* Avatar Switcher if expanded */}
            {isCustomizing && (
              <div className="pt-2 border-t border-white/[0.05] grid grid-cols-6 gap-1 animate-fade-in">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sound.playSelect();
                      setGuestAvatar(av.id);
                    }}
                    className={`p-1 rounded-xl flex items-center justify-center cursor-pointer transition-transform ${
                      guestAvatar === av.id ? 'bg-white/15 scale-110 ring-1 ring-[#927CFF]' : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    <Avatar avatarId={av.id} size="sm" showBorder={false} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Password Input if room is protected */}
          {requiresPassword && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-[#EFC65D] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                <Lock className="w-3.5 h-3.5" /> Room Secret Password Required
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter secret room password..."
                className="w-full px-4 py-3 bg-[#17171D] border border-[#EFC65D]/30 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#EFC65D]"
                autoFocus
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FF7B84]/10 border border-[#FF7B84]/20 text-xs text-[#FF7B84]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={checking || !code.trim() || (requiresPassword && !password.trim())}
            className="w-full py-4 px-4 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#6E53ED]/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {checking ? (
              <span>Connecting P2P...</span>
            ) : requiresPassword ? (
              <>
                <span>Unlock & Join P2P</span>
                <Lock className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Connect & Enter Room</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
