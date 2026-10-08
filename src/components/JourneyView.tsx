import React from 'react';
import { STAGE_CONFIG } from '../data/questions';
import { ArrowDown, Sparkles, Shield, HeartHandshake } from 'lucide-react';
import { Stage } from '../types/game';

export const JourneyView: React.FC = () => {
  const stages: Stage[] = ['life', 'personal', 'deep', 'dark', 'abyss'];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h1 className="font-['Syne',sans-serif] text-3xl sm:text-4xl font-extrabold text-white">
          The Emotional Journey
        </h1>
        <p className="text-sm text-white/60 leading-relaxed">
          UNMASK is deliberately paced. You never plunge into discomfort abruptly. Each stage creates safety and genuine curiosity for the next.
        </p>
      </div>

      <div className="space-y-4">
        {stages.map((stgKey, idx) => {
          const cfg = STAGE_CONFIG[stgKey];
          return (
            <div
              key={stgKey}
              className="p-6 rounded-3xl bg-[#111116] border border-white/[0.06] shadow-xl relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold text-[#09090C]"
                    style={{ backgroundColor: cfg.accentColor }}
                  >
                    0{idx + 1}
                  </span>
                  <h3 className="font-['Syne',sans-serif] text-xl font-bold text-white">
                    {cfg.name}
                  </h3>
                </div>

                <div className="text-xs font-mono text-white/40">
                  {cfg.range}
                </div>
              </div>

              <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
                {cfg.description}
              </p>

              {idx < stages.length - 1 && (
                <div className="hidden sm:flex items-center justify-center -mb-9 mt-4 text-white/20">
                  <ArrowDown className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Safety & Consent Pillars */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#17171D] to-[#111116] border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Shield className="w-4 h-4 text-[#59D8AD]" />
            <span>Safe Skipping</span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            "Too Personal" is a first-class action. Skipping is treated with complete respect and zero shame.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Sparkles className="w-4 h-4 text-[#927CFF]" />
            <span>Player Autonomy</span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            System questions are suggestions only. The questioner always curates what to ask or authors their own.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <HeartHandshake className="w-4 h-4 text-[#F05D9F]" />
            <span>Private Dialogue</span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            There are no public leaderboards or shared feeds. Every exchange remains strictly between the two of you.
          </p>
        </div>
      </div>
    </div>
  );
};
