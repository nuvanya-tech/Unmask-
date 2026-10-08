import React, { useState } from 'react';
import {
  X,
  Lock,
  Sparkles,
  Copy,
  Check,
  Users,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Share2,
  QrCode,
  Compass,
  Key,
} from 'lucide-react';
import { RoomVibe } from '../types/game';
import { AVATAR_OPTIONS } from '../data/questions';
import { Avatar } from './Avatar';
import { sound } from '../utils/audio';
import { copyToClipboard } from '../utils/clipboard';
import { getShareableRoomUrl } from '../utils/share';
import { QRCodeModal } from './QRCodeModal';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  playerAvatar: string;
  onStartRoom: (config: {
    roomCode: string;
    vibe: RoomVibe;
    hasPassword: boolean;
    password?: string;
    hostId?: string;
    isDemo?: boolean;
    isPassAndPlay?: boolean;
  }) => void;
  onExploreApp?: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  playerName,
  playerAvatar,
  onStartRoom,
  onExploreApp,
}) => {
  const [vibe, setVibe] = useState<RoomVibe>('WILDEST');
  const [accessType, setAccessType] = useState<'link' | 'password'>('link');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Shareable Link Generated State
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);
    sound.playSelect();

    let assignedCode = '';
    let hostId: string | undefined;

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: playerName,
          hostAvatar: playerAvatar,
          password: accessType === 'password' ? password.trim() : undefined,
          vibe,
        }),
      });

      const data = await res.json();
      if (data.success && data.roomCode) {
        assignedCode = data.roomCode;
        hostId = data.hostId;
      } else {
        assignedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      }
    } catch {
      assignedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    } finally {
      setIsLoading(false);
    }

    // Initialize game room state in background
    onStartRoom({
      roomCode: assignedCode,
      vibe,
      hasPassword: accessType === 'password' && !!password.trim(),
      password: accessType === 'password' ? password.trim() : undefined,
      hostId,
    });

    // Move to Step 2: Shareable link presentation
    setCreatedRoomCode(assignedCode);
    sound.playAchievement();
  };

  const inviteUrl = createdRoomCode ? getShareableRoomUrl(createdRoomCode) : '';

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    sound.playSelect();
    await copyToClipboard(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = async () => {
    if (!createdRoomCode) return;
    sound.playSelect();
    await copyToClipboard(createdRoomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleWhatsAppShare = () => {
    sound.playSelect();
    const msg = encodeURIComponent(
      `Hey! Join my private UNMASK conversation session: ${inviteUrl} (Room code: ${createdRoomCode})`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    sound.playSelect();
    if (typeof navigator !== 'undefined' && navigator.share && createdRoomCode) {
      try {
        await navigator.share({
          title: 'UNMASK: Private Truth & Dare',
          text: `Join my private encrypted UNMASK session (Room code: ${createdRoomCode}):`,
          url: inviteUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleEnterWaitingRoom = () => {
    sound.playSelect();
    onClose();
  };

  const handleExploreApp = () => {
    sound.playSelect();
    onClose();
    if (onExploreApp) {
      onExploreApp();
    }
  };

  const vibes: { id: RoomVibe; name: string; desc: string; color: string; badge?: string }[] = [
    {
      id: 'WILDEST',
      name: '🔥 Wildest (18+)',
      desc: 'No-filter confessions, scandal, high-stakes dares & adrenaline',
      color: '#FF7B84',
      badge: 'POPULAR',
    },
    { id: 'REAL', name: 'Real', desc: 'Authentic life perspectives, habits, and vulnerability', color: '#59D8AD' },
    { id: 'FUNNY', name: 'Playful', desc: 'Quirky habits, roast dares, and bantering chemistry', color: '#EFC65D' },
    { id: 'DEEP', name: 'Deep', desc: 'Emotions, unspoken fears, and core growth', color: '#927CFF' },
    { id: 'DARK', name: 'Dark', desc: 'Regrets, difficult choices, and raw secrets', color: '#F05D9F' },
    { id: 'CHAOS', name: 'Chaos', desc: 'Random modifiers, blitz timers, and forfeit penalties', color: '#38BDF8' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-lg bg-[#111116] border border-white/[0.08] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[92vh]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* STEP 2: ROOM READY & SHAREABLE LINK GENERATED */}
          {createdRoomCode ? (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#59D8AD]/10 border border-[#59D8AD]/20 text-[#59D8AD] text-xs font-bold font-mono uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Room Active & Encrypted
                </div>
                <h2 className="font-['Syne',sans-serif] text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Share With Your Partner
                </h2>
                <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                  Send this 1-click invite link to your partner. When they open it, they will choose their persona mask and join your P2P encrypted session.
                </p>
              </div>

              {/* Room Code Display */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Room Code</div>
                  <div className="font-['Syne',sans-serif] text-3xl font-extrabold text-white tracking-widest mt-0.5">
                    {createdRoomCode}
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#59D8AD]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Shareable Link Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#927CFF]/10 to-transparent border border-[#927CFF]/20 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#927CFF]" />
                    <span>Shareable Partner Link</span>
                  </span>
                  <span className="text-[10px] text-[#59D8AD] font-mono font-bold">1-Click Join</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full px-3.5 py-3 bg-[#17171D] border border-white/10 rounded-xl text-xs text-white/90 font-mono select-all focus:outline-none focus:border-[#927CFF]"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-3 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 text-xs font-bold cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                {/* Instant Share Channels */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={handleWhatsAppShare}
                    className="py-2.5 px-3 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleNativeShare}
                    className="py-2.5 px-3 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share...</span>
                  </button>

                  <button
                    onClick={() => setShowQrModal(true)}
                    className="py-2.5 px-3 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/90 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#927CFF]" />
                    <span>QR Code</span>
                  </button>
                </div>
              </div>

              {/* P2P Encryption Callout */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#59D8AD]/5 border border-[#59D8AD]/20 text-[11px] text-white/80">
                <ShieldCheck className="w-4 h-4 text-[#59D8AD] shrink-0" />
                <span>
                  Direct browser-to-browser P2P WebRTC DataChannel. Encrypted client-side with AES-256. Zero transcripts stored on servers.
                </span>
              </div>

              {/* Navigation Options: Enter Waiting Room or Look Around App */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleEnterWaitingRoom}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#6E53ED]/25 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Enter Waiting Room</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleExploreApp}
                  className="w-full py-3 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white rounded-xl text-xs font-semibold border border-white/[0.08] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#927CFF]" />
                  <span>Look Around App While Waiting (Room Stays Active)</span>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 1: CONFIGURE ROOM & VIBE */
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#59D8AD]/10 border border-[#59D8AD]/20 text-[#59D8AD] text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">
                  <ShieldCheck className="w-3 h-3" /> P2P Private Session
                </div>
                <h2 className="font-['Syne',sans-serif] text-2xl font-bold text-white tracking-tight">
                  Create Private Room
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Start light, progress deeper. Generates a direct shareable partner link.
                </p>
              </div>

              {/* Host Identity Preview */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] mb-5">
                <Avatar avatarId={playerAvatar} size="md" isHost />
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider font-mono">Hosting as</div>
                  <div className="text-sm font-bold text-white">{playerName}</div>
                </div>
              </div>

              {/* Vibe selection */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 font-mono">
                  Choose Conversation Vibe
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {vibes.map((v) => {
                    const isSelected = vibe === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          sound.playSelect();
                          setVibe(v.id);
                        }}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-white/[0.08] border-[#927CFF] shadow-sm shadow-[#927CFF]/20 ring-1 ring-[#927CFF]'
                            : 'bg-[#17171D] border-white/[0.04] hover:border-white/20'
                        }`}
                      >
                        {v.badge && (
                          <span className="absolute top-2 right-2 text-[8px] font-extrabold uppercase bg-[#FF7B84] text-[#09090C] px-1.5 py-0.2 rounded-full font-mono">
                            {v.badge}
                          </span>
                        )}
                        <div className="flex items-center justify-between mb-1 pr-6">
                          <span className="text-xs font-bold text-white">{v.name}</span>
                        </div>
                        <p className="text-[10px] text-white/45 line-clamp-2 leading-tight">{v.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Access type */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 font-mono">
                  Room Privacy
                </label>
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => setAccessType('link')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      accessType === 'link'
                        ? 'bg-white/[0.08] border-[#927CFF] text-white ring-1 ring-[#927CFF]'
                        : 'bg-[#17171D] border-white/[0.04] text-white/50 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">Invite Link Only</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Direct 1-click shareable URL</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessType('password')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      accessType === 'password'
                        ? 'bg-white/[0.08] border-[#927CFF] text-white ring-1 ring-[#927CFF]'
                        : 'bg-[#17171D] border-white/[0.04] text-white/50 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-[#EFC65D]" /> Password Protected
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5">Secret pass phrase required</div>
                  </button>
                </div>

                {accessType === 'password' && (
                  <div className="animate-fade-in">
                    <input
                      type="password"
                      placeholder="Enter secret room password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#17171D] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#927CFF]"
                    />
                  </div>
                )}
              </div>

              {/* P2P Security Tag */}
              <div className="flex items-center gap-2.5 p-3 mb-5 rounded-2xl bg-[#59D8AD]/5 border border-[#59D8AD]/20 text-xs text-white/80">
                <ShieldCheck className="w-4 h-4 text-[#59D8AD] shrink-0" />
                <span>
                  Direct P2P WebRTC connection with AES-256 encryption. Zero conversation transcripts saved on servers.
                </span>
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-xl bg-[#FF7B84]/10 border border-[#FF7B84]/20 text-xs text-[#FF7B84]">
                  {error}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleCreate}
                  disabled={isLoading || (accessType === 'password' && !password.trim())}
                  className="w-full py-4 px-4 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#6E53ED]/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Generating Shareable Room...</span>
                  ) : (
                    <>
                      <span>Generate Room & Share Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playSelect();
                    onStartRoom({
                      roomCode: 'LOCAL',
                      vibe,
                      hasPassword: false,
                      isPassAndPlay: true,
                    });
                  }}
                  className="w-full py-2 text-xs text-white/40 hover:text-white/80 transition-colors cursor-pointer text-center"
                >
                  Pass & Play on Same Device instead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal for Camera Scanning */}
      {createdRoomCode && (
        <QRCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          roomCode={createdRoomCode}
          inviteUrl={inviteUrl}
        />
      )}
    </>
  );
};
