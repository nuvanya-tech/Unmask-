import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, Check, Lock, User, ArrowRight, EyeOff } from 'lucide-react';
import { UserProfile } from '../types/game';
import { AVATAR_OPTIONS } from '../data/questions';
import { Avatar } from './Avatar';
import { saveStoredProfile } from '../utils/storage';
import { sound } from '../utils/audio';

interface AccountSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onProfileSaved: (profile: UserProfile) => void;
  title?: string;
  subtitle?: string;
}

export const AccountSetupModal: React.FC<AccountSetupModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileSaved,
  title = 'Setup Your Persona & Encryption',
  subtitle = 'Choose your mask and privacy settings before entering the room.',
}) => {
  const [name, setName] = useState(currentProfile.name || 'Seeker');
  const [avatar, setAvatar] = useState(currentProfile.avatar || 'phantom');
  const [ephemeralMode, setEphemeralMode] = useState(true);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSelect();

    const updated: UserProfile = {
      ...currentProfile,
      name: name.trim() || 'Seeker',
      avatar,
    };

    saveStoredProfile(updated);
    onProfileSaved(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#111116] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#59D8AD]/10 border border-[#59D8AD]/20 text-[#59D8AD] text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">
            <ShieldCheck className="w-3 h-3" /> P2P Identity Profile
          </div>
          <h2 className="font-['Syne',sans-serif] text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-white/50 mt-1">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Persona Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2.5">
              Select Your Mask Aura
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    sound.playSelect();
                    setAvatar(av.id);
                  }}
                  className={`p-1 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    avatar === av.id
                      ? 'bg-white/10 ring-2 ring-[#927CFF] scale-105'
                      : 'opacity-50 hover:opacity-100 hover:bg-white/5'
                  }`}
                >
                  <Avatar avatarId={av.id} size="sm" showBorder={false} />
                  <span className="text-[9px] text-white/60 truncate w-full text-center">
                    {av.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Your Display Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter what your partner calls you..."
                className="w-full pl-10 pr-4 py-3 bg-[#17171D] border border-white/10 rounded-xl text-sm font-semibold text-white placeholder-white/30 focus:outline-none focus:border-[#927CFF]"
              />
              <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Privacy & Cryptographic Preferences */}
          <div className="p-3.5 rounded-2xl bg-[#17171D] border border-white/[0.05] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#59D8AD]" />
                <span className="text-xs font-bold text-white">End-to-End P2P Encryption</span>
              </div>
              <span className="text-[10px] font-mono text-[#59D8AD] bg-[#59D8AD]/10 px-2 py-0.5 rounded font-bold">
                AES-256 ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Questions and answers travel directly between your browser and your partner via WebRTC DataChannel. Zero transcripts stored on servers.
            </p>

            <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <EyeOff className="w-3.5 h-3.5 text-[#927CFF]" />
                <span>Ephemeral Memory (No local trace)</span>
              </div>
              <button
                type="button"
                onClick={() => setEphemeralMode(!ephemeralMode)}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  ephemeralMode ? 'bg-[#927CFF]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    ephemeralMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#6E53ED]/25 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Confirm & Proceed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
