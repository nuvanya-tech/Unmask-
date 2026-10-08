import React, { useState } from 'react';
import { Users, Star, Clock, Trophy } from 'lucide-react';
import { PersonRecord } from '../types/game';
import { getStoredPeople } from '../utils/storage';
import { Avatar } from './Avatar';

interface PeopleViewProps {
  onInvitePerson: (name: string) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({ onInvitePerson }) => {
  const [people] = useState<PersonRecord[]>(getStoredPeople());

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Syne',sans-serif] text-2xl sm:text-3xl font-extrabold text-white">
            People
          </h1>
          <p className="text-sm text-white/50 mt-1">
            People you have crossed paths with in UNMASK sessions.
          </p>
        </div>
        <div className="text-xs font-mono text-white/40">
          {people.length} {people.length === 1 ? 'PERSON' : 'PEOPLE'}
        </div>
      </div>

      {people.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#111116] border border-white/[0.06] space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/30">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">No one here yet</h3>
          <p className="text-xs text-white/40 max-w-sm mx-auto">
            Your recent conversation partners and shared scores will automatically be remembered here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-[#111116] border border-white/[0.06] hover:border-white/10 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center gap-3">
                <Avatar avatarId={p.avatar} size="md" />
                <div>
                  <h4 className="font-bold text-white text-sm">{p.name}</h4>
                  <div className="text-[11px] text-white/40 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Last played {p.lastPlayed}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.04]">
                <div className="p-2.5 rounded-xl bg-[#17171D]">
                  <div className="text-[10px] text-white/40 uppercase font-mono">Sessions</div>
                  <div className="text-sm font-bold text-white mt-0.5">{p.gamesTogether}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#17171D]">
                  <div className="text-[10px] text-white/40 uppercase font-mono">Avg Score</div>
                  <div className="text-sm font-bold text-[#927CFF] mt-0.5 flex items-center gap-1">
                    <span>{p.averageScore.toFixed(1)}</span>
                    <Star className="w-3 h-3 fill-[#927CFF]" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onInvitePerson(p.name)}
                className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Play Again
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
