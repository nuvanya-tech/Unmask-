import React, { useState, useEffect } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface ReactionParticle {
  id: number;
  emoji: string;
  left: number;
  scale: number;
}

interface ReactionBomberProps {
  onSendReaction: (emoji: string) => void;
  incomingReaction?: string | null;
}

const REACTIONS = ['🔥', '💀', '🌶️', '😈', '👀', '🚨', '❤️', '😱'];

export const ReactionBomber: React.FC<ReactionBomberProps> = ({
  onSendReaction,
  incomingReaction,
}) => {
  const [particles, setParticles] = useState<ReactionParticle[]>([]);

  const spawnParticle = (emoji: string) => {
    const newParticle: ReactionParticle = {
      id: Date.now() + Math.random(),
      emoji,
      left: 10 + Math.random() * 80, // % across screen
      scale: 0.8 + Math.random() * 0.6,
    };

    setParticles((prev) => [...prev.slice(-15), newParticle]);

    // Cleanup after 2 seconds
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 2000);
  };

  useEffect(() => {
    if (incomingReaction) {
      sound.playSelect();
      spawnParticle(incomingReaction);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  }, [incomingReaction]);

  const handleTap = (emoji: string) => {
    sound.playSelect();
    spawnParticle(emoji);
    onSendReaction(emoji);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  return (
    <>
      {/* Floating Animated Particles in Background */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-20 text-3xl sm:text-4xl animate-float-up select-none"
            style={{
              left: `${p.left}%`,
              transform: `scale(${p.scale})`,
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Floating Quick Reaction Toolbar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#17171D]/90 backdrop-blur-md border border-white/10 shadow-xl overflow-x-auto max-w-full">
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleTap(emoji)}
            className="p-1.5 px-2 rounded-full hover:bg-white/10 transition-transform active:scale-130 text-lg cursor-pointer"
            title={`Send ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};
