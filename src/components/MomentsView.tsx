import React, { useState } from 'react';
import { Bookmark, Star, Trash2, Calendar, Sparkles } from 'lucide-react';
import { SavedMoment } from '../types/game';
import { getStoredMoments, removeStoredMoment } from '../utils/storage';
import { Avatar } from './Avatar';
import { sound } from '../utils/audio';

export const MomentsView: React.FC = () => {
  const [moments, setMoments] = useState<SavedMoment[]>(getStoredMoments());

  const handleDelete = (id: string) => {
    sound.playSelect();
    const updated = removeStoredMoment(id);
    setMoments(updated);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Syne',sans-serif] text-2xl sm:text-3xl font-extrabold text-white">
            Memory Box
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Private repository of raw answers, profound truths, and heartfelt moments.
          </p>
        </div>
        <div className="text-xs font-mono text-white/40">
          {moments.length} {moments.length === 1 ? 'MOMENT' : 'MOMENTS'}
        </div>
      </div>

      {moments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#111116] border border-white/[0.06] space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/30">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Your memory box is empty</h3>
          <p className="text-xs text-white/40 max-w-sm mx-auto">
            During any game round, tap "Save Moment" after rating to safely preserve meaningful answers here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moments.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-[#111116] border border-white/[0.06] hover:border-white/10 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar avatarId={m.partnerAvatar || 'ember'} size="sm" />
                    <span className="font-semibold text-white/90">{m.partnerName}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/40 font-mono text-[10px] uppercase">
                      {m.stage}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold text-[#927CFF]">
                    <span>{m.score.toFixed(1)}</span>
                    <Star className="w-3.5 h-3.5 fill-[#927CFF]" />
                    {m.reaction && <span className="ml-1 text-sm">{m.reaction}</span>}
                  </div>
                </div>

                <p className="text-sm font-bold text-white mb-2">
                  "{m.question}"
                </p>

                <p className="text-xs text-white/70 italic bg-[#17171D] p-3 rounded-xl border border-white/[0.04]">
                  "{m.answer}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px] text-white/30 font-mono">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{m.date}</span>
                </div>

                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1 hover:text-[#FF7B84] transition-colors"
                  title="Remove from memory box"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
