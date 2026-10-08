import React from 'react';
import { AVATAR_OPTIONS } from '../data/questions';

interface AvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
  className?: string;
  isHost?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  avatarId,
  size = 'md',
  showBorder = true,
  className = '',
  isHost,
}) => {
  const avatarConfig = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28,
    xl: 42,
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <div
        className={`rounded-full bg-gradient-to-br ${avatarConfig.gradient} flex items-center justify-center shadow-lg transition-transform ${sizeClasses[size]}`}
        style={{
          boxShadow: showBorder ? `0 0 0 2px #111116, 0 0 0 3.5px ${avatarConfig.border}66` : undefined,
        }}
      >
        {/* Render minimalist graphic mask / icon */}
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white drop-shadow-sm"
        >
          {avatarConfig.icon === 'mask' && (
            <>
              <path d="M2 12c1.5 5 4.5 8 10 8s8.5-3 10-8c-1.5-5-4.5-8-10-8S3.5 7 2 12Z" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="16" cy="12" r="2" />
              <path d="M12 15a1 1 0 0 0 0-2" />
            </>
          )}
          {avatarConfig.icon === 'flame' && (
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
          )}
          {avatarConfig.icon === 'eye' && (
            <>
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
          {avatarConfig.icon === 'sparkle' && (
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
          )}
          {avatarConfig.icon === 'moon' && (
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          )}
          {avatarConfig.icon === 'sun' && (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </>
          )}
        </svg>
      </div>

      {isHost && (
        <span
          title="Room Host"
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#927CFF] text-[#09090C] rounded-full flex items-center justify-center text-[10px] font-bold shadow-md ring-2 ring-[#111116]"
        >
          ★
        </span>
      )}
    </div>
  );
};
