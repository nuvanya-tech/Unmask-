import React, { useState } from 'react';
import { UserProfile } from '../types/game';
import { ACHIEVEMENTS_LIST, AVATAR_OPTIONS } from '../data/questions';
import { Avatar } from './Avatar';
import { saveStoredProfile } from '../utils/storage';
import { Trophy, Flame, Star, Edit3, Check, Award, Shield } from 'lucide-react';
import { sound } from '../utils/audio';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  const handleSave = () => {
    sound.playSelect();
    const updated = {
      ...profile,
      name: name.trim() || 'Seeker',
      avatar: selectedAvatar,
    };
    saveStoredProfile(updated);
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-6">
      <div className="bg-[#111116] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-white/[0.06]">
          <Avatar avatarId={selectedAvatar} size="xl" />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={name}
                      maxLength={20}
                      onChange={(e) => setName(e.target.value)}
                      className="px-3 py-1.5 bg-[#17171D] border border-white/20 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-[#927CFF]"
                    />
                    <button
                      onClick={handleSave}
                      className="p-2 bg-[#927CFF] text-[#09090C] rounded-xl font-bold cursor-pointer hover:bg-[#8168fc]"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <h2 className="font-['Syne',sans-serif] text-2xl font-bold text-white">
                      {profile.name}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="text-xs font-semibold text-[#927CFF] uppercase tracking-wider mt-1">
                  Title: {profile.title}
                </div>
              </div>

              {/* XP Pill */}
              <div className="flex items-center justify-center sm:justify-end gap-3 text-sm font-mono">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white">
                  <span className="text-white/40 text-xs mr-1">TOTAL XP:</span>
                  <span className="font-bold text-[#59D8AD]">{profile.totalXp}</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#F05D9F]" />
                  <span className="font-bold">{profile.streak} Day</span>
                </div>
              </div>
            </div>

            {/* Avatar Switcher when editing */}
            {isEditing && (
              <div className="pt-3 animate-fade-in">
                <div className="text-xs text-white/50 mb-2 font-semibold">Choose Your Mask:</div>
                <div className="flex gap-3 justify-center sm:justify-start">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => {
                        sound.playSelect();
                        setSelectedAvatar(av.id);
                      }}
                      className={`p-1 rounded-full transition-transform cursor-pointer ${
                        selectedAvatar === av.id ? 'ring-2 ring-[#927CFF] scale-110' : 'opacity-60'
                      }`}
                    >
                      <Avatar avatarId={av.id} size="sm" showBorder={false} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="p-4 rounded-2xl bg-[#17171D] border border-white/[0.04]">
            <div className="text-[10px] text-white/40 uppercase font-mono">Games Completed</div>
            <div className="text-xl font-bold text-white mt-1">{profile.gamesCompleted}</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#17171D] border border-white/[0.04]">
            <div className="text-[10px] text-white/40 uppercase font-mono">Questions Asked</div>
            <div className="text-xl font-bold text-white mt-1">{profile.questionsAsked}</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#17171D] border border-white/[0.04]">
            <div className="text-[10px] text-white/40 uppercase font-mono">Truths Answered</div>
            <div className="text-xl font-bold text-white mt-1">{profile.questionsAnswered}</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#17171D] border border-white/[0.04]">
            <div className="text-[10px] text-white/40 uppercase font-mono">Original Authored</div>
            <div className="text-xl font-bold text-[#EFC65D] mt-1">{profile.customQuestionsCount}</div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-[#111116] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-['Syne',sans-serif] text-xl font-bold text-white">
              Unlocked Badges
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Milestones achieved on the path toward deep honesty.
            </p>
          </div>
          <div className="text-xs font-mono text-white/40">
            {profile.unlockedAchievements.length} / {ACHIEVEMENTS_LIST.length}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = profile.unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  isUnlocked
                    ? 'bg-[#17171D] border-white/[0.08]'
                    : 'bg-white/[0.02] border-white/[0.03] opacity-40'
                }`}
              >
                <div className="text-2xl p-2 rounded-xl bg-white/[0.04] shrink-0">
                  {ach.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{ach.title}</span>
                    {isUnlocked && (
                      <span className="text-[9px] font-mono text-[#59D8AD] uppercase">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/40 mt-0.5">{ach.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
