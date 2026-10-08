import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, RotateCcw, Check, Skull, Flame } from 'lucide-react';
import { ForfeitItem } from '../types/game';
import { FORFEIT_PENALTIES } from '../data/questions';
import { sound } from '../utils/audio';

interface ForfeitRouletteProps {
  onPenaltySelected: (penalty: ForfeitItem) => void;
  onClose?: () => void;
  partnerName?: string;
}

export const ForfeitRoulette: React.FC<ForfeitRouletteProps> = ({
  onPenaltySelected,
  onClose,
  partnerName = 'Partner',
}) => {
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [chosenForfeit, setChosenForfeit] = useState<ForfeitItem | null>(null);

  const startSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setChosenForfeit(null);
    sound.playWildSiren();

    let count = 0;
    const totalSpins = 24 + Math.floor(Math.random() * 8);
    let speed = 60;

    const spinInterval = () => {
      sound.playRouletteClick();
      setSelectedIndex((prev) => (prev + 1) % FORFEIT_PENALTIES.length);
      count++;

      if (count < totalSpins) {
        speed += 12; // slow down gradually
        setTimeout(spinInterval, speed);
      } else {
        const finalPenalty = FORFEIT_PENALTIES[(selectedIndex + 1) % FORFEIT_PENALTIES.length];
        setChosenForfeit(finalPenalty);
        setSpinning(false);
        sound.playSubmit();
        onPenaltySelected(finalPenalty);
      }
    };

    setTimeout(spinInterval, speed);
  };

  useEffect(() => {
    // Auto-spin once on mount
    startSpin();
  }, []);

  return (
    <div className="p-6 rounded-3xl bg-[#111116] border border-[#FF7B84]/30 shadow-2xl space-y-6 text-center animate-fade-in relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FF7B84]/15 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7B84]/15 border border-[#FF7B84]/30 text-[#FF7B84] text-xs font-bold uppercase tracking-wider mb-2 font-mono">
          <Skull className="w-3.5 h-3.5" /> Chicken-Out Forfeit Wheel
        </div>
        <h3 className="font-['Syne',sans-serif] text-2xl font-extrabold text-white">
          The Penalty Roulette
        </h3>
        <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
          You stepped back from the truth. Face the wheel to redeem your honor!
        </p>
      </div>

      {/* Roulette Carousel / Spotlight */}
      <div className="py-2">
        <div className="p-5 rounded-2xl bg-[#17171D] border border-white/10 shadow-inner flex flex-col items-center gap-3">
          <div className="text-4xl sm:text-5xl transform transition-transform duration-100 scale-110">
            {FORFEIT_PENALTIES[selectedIndex].icon}
          </div>

          <div className="font-['Syne',sans-serif] text-lg sm:text-xl font-bold text-white">
            {FORFEIT_PENALTIES[selectedIndex].title}
          </div>

          <p className="text-xs text-white/70 max-w-xs leading-relaxed min-h-[38px]">
            {FORFEIT_PENALTIES[selectedIndex].description.replace('your partner', partnerName)}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        {!spinning && (
          <button
            type="button"
            onClick={startSpin}
            className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/10 text-white/80 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-Spin</span>
          </button>
        )}

        {chosenForfeit && !spinning && (
          <button
            type="button"
            onClick={() => onPenaltySelected(chosenForfeit)}
            className="px-6 py-2.5 bg-gradient-to-r from-[#F05D9F] to-[#FF7B84] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#FF7B84]/25 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Accept Penalty & Continue</span>
          </button>
        )}
      </div>
    </div>
  );
};
