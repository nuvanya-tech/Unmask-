import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Share2,
  Lock,
  Play,
  Loader2,
  Compass,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Shield,
  Key,
  QrCode,
} from 'lucide-react';
import { Player, RoomVibe } from '../types/game';
import { Avatar } from './Avatar';
import { sound } from '../utils/audio';
import { copyToClipboard } from '../utils/clipboard';
import { getShareableRoomUrl } from '../utils/share';
import { generateSecurityFingerprint, SecurityFingerprint } from '../utils/crypto';
import { QRCodeModal } from './QRCodeModal';

interface WaitingRoomProps {
  roomCode: string;
  host: Player;
  guest: Player | null;
  isHost: boolean;
  vibe: RoomVibe;
  passwordProtected: boolean;
  onStartGame: () => void;
  onLeave: () => void;
  onStartDemoInstead: () => void;
  onExploreApp: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  roomCode,
  host,
  guest,
  isHost,
  vibe,
  passwordProtected,
  onStartGame,
  onLeave,
  onStartDemoInstead,
  onExploreApp,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<SecurityFingerprint | null>(null);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Reliable shareable invite URL
  const inviteUrl = getShareableRoomUrl(roomCode);

  useEffect(() => {
    generateSecurityFingerprint(roomCode).then((fp) => {
      setFingerprint(fp);
    });
  }, [roomCode]);

  const handleCopyLink = async () => {
    sound.playSelect();
    const success = await copyToClipboard(inviteUrl);
    setCopiedLink(true);
    setCopyFeedback(success ? 'Link copied! Send it to your partner.' : 'Link selected! Press copy.');
    setTimeout(() => {
      setCopiedLink(false);
      setCopyFeedback(null);
    }, 3200);
  };

  const handleCopyCode = async () => {
    sound.playSelect();
    const success = await copyToClipboard(roomCode);
    setCopiedCode(true);
    setCopyFeedback(success ? `Room code "${roomCode}" copied!` : 'Selected! Press copy.');
    setTimeout(() => {
      setCopiedCode(false);
      setCopyFeedback(null);
    }, 3200);
  };

  const handleNativeShare = async () => {
    sound.playSelect();
    const shareData = {
      title: 'UNMASK: Private Truth & Dare',
      text: `Join my private encrypted UNMASK session (Room code: ${roomCode})! Start light, get real:`,
      url: inviteUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
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

  const handleWhatsAppShare = () => {
    sound.playSelect();
    const message = encodeURIComponent(
      `Hey! Join my private UNMASK conversation room: ${inviteUrl} (Room code: ${roomCode})`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const bothPresent = !!(host && guest);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8 animate-fade-in space-y-4">
      <div className="bg-[#111116] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#927CFF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Room Header & E2EE Status */}
        <div className="flex items-start justify-between border-b border-white/[0.06] pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-widest text-white/40 uppercase">
                Private Room
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#59D8AD] bg-[#59D8AD]/10 px-2 py-0.5 rounded-full border border-[#59D8AD]/20 font-mono">
                <ShieldCheck className="w-3 h-3" /> P2P E2EE
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="font-['Syne',sans-serif] text-3xl sm:text-4xl font-extrabold text-white tracking-widest">
                {roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                title="Copy Room Code Only"
              >
                {copiedCode ? <Check className="w-3 h-3 text-[#59D8AD]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {passwordProtected && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#EFC65D] bg-[#EFC65D]/10 px-2 py-0.5 rounded-md border border-[#EFC65D]/20">
                <Lock className="w-3 h-3" /> Password
              </span>
            )}
            <span className="text-[10px] font-bold text-[#927CFF] bg-[#927CFF]/10 px-2.5 py-0.5 rounded-md border border-[#927CFF]/20 uppercase font-mono">
              {vibe}
            </span>
          </div>
        </div>

        {/* Both Player Slots */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 my-6">
          {/* Host Card */}
          <div className="flex flex-col items-center p-4 sm:p-5 rounded-2xl bg-[#17171D] border border-white/[0.05] relative text-center">
            <Avatar avatarId={host.avatar} size="lg" isHost />
            <div className="mt-2.5 text-sm font-bold text-white truncate max-w-[120px]">
              {host.name}
            </div>
            <div className="text-[10px] text-white/40 tracking-wider uppercase font-mono mt-0.5">
              Host (You)
            </div>
          </div>

          {/* Guest Slot */}
          <div
            className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border text-center transition-all ${
              guest
                ? 'bg-[#17171D] border-[#59D8AD]/40 shadow-lg shadow-[#59D8AD]/10 animate-fade-in'
                : 'bg-white/[0.02] border-dashed border-white/10'
            }`}
          >
            {guest ? (
              <>
                <Avatar avatarId={guest.avatar} size="lg" />
                <div className="mt-2.5 text-sm font-bold text-white truncate max-w-[120px]">
                  {guest.name}
                </div>
                <div className="text-[10px] text-[#59D8AD] tracking-wider uppercase font-mono font-semibold mt-0.5 flex items-center gap-1 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#59D8AD] animate-pulse" />
                  <span>P2P Ready</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-1">
                <div className="w-14 h-14 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/20 mb-2.5">
                  <Loader2 className="w-6 h-6 animate-spin text-[#927CFF]" />
                </div>
                <div className="text-xs font-semibold text-white/80">Waiting for partner...</div>
                <div className="text-[10px] text-white/40 mt-0.5">Share the link below</div>
              </div>
            )}
          </div>
        </div>

        {/* Connection status banner */}
        {bothPresent ? (
          <div className="p-3.5 mb-6 rounded-2xl bg-[#59D8AD]/10 border border-[#59D8AD]/20 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#59D8AD] animate-ping shrink-0" />
            <div className="text-xs font-semibold text-[#59D8AD]">
              Your partner is connected via secure P2P DataChannel! Tap below to start.
            </div>
          </div>
        ) : (
          /* Share options bar */
          <div className="space-y-3 mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-white/80">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#927CFF]" />
                <span>Shareable Partner Link</span>
              </span>
              <span className="text-[10px] text-white/40 font-mono">1-Click Join</span>
            </div>

            {/* Direct Input & Main Copy Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full px-3.5 py-3 bg-[#17171D] border border-white/10 rounded-xl text-xs text-white/90 font-mono select-all focus:outline-none focus:border-[#927CFF]"
                title="Click to select invite URL"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white rounded-xl shadow-md shadow-[#6E53ED]/20 transition-all flex items-center gap-1.5 shrink-0 text-xs font-bold cursor-pointer active:scale-95 whitespace-nowrap"
              >
                {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Quick Share Buttons (WhatsApp, Web Share, QR Code, Copy Code) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
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

              <button
                onClick={handleCopyCode}
                className="py-2.5 px-3 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/80 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Copy room code only"
              >
                {copiedCode ? 'Code Copied!' : 'Code Only'}
              </button>
            </div>

            {copyFeedback && (
              <div className="text-center text-xs text-[#59D8AD] font-semibold py-1 animate-fade-in flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{copyFeedback}</span>
              </div>
            )}
          </div>
        )}

        {/* P2P & Cryptographic Safety Fingerprint Accordion */}
        {fingerprint && (
          <div className="p-3.5 mb-6 rounded-2xl bg-[#17171D] border border-white/[0.05] space-y-2">
            <button
              onClick={() => setShowSecurityDetails(!showSecurityDetails)}
              className="w-full flex items-center justify-between text-xs text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#59D8AD]" />
                <span className="font-bold text-white">E2EE Security Fingerprint</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#59D8AD]">
                <span>{fingerprint.emoji.join(' ')}</span>
                <span className="text-white/40 font-mono">[{fingerprint.hex}]</span>
              </div>
            </button>

            {showSecurityDetails && (
              <div className="pt-2 border-t border-white/[0.05] text-[11px] text-white/50 space-y-1.5 animate-fade-in">
                <p>
                  • Direct browser-to-browser WebRTC DataChannel tunnel.
                </p>
                <p>
                  • Messages encrypted client-side using <span className="text-white font-mono">{fingerprint.algorithm}</span>.
                </p>
                <p>
                  • Both you and your partner verify matching emojis to confirm zero eavesdropping.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Start Game Action */}
        <div className="space-y-3">
          {isHost ? (
            <button
              onClick={() => {
                sound.playSubmit();
                onStartGame();
              }}
              disabled={!bothPresent}
              className="w-full py-4 px-4 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#6E53ED]/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{bothPresent ? 'Begin UNMASK (Round 1)' : 'Waiting for Partner to Connect'}</span>
            </button>
          ) : (
            <div className="p-4 text-center rounded-2xl bg-white/[0.04] border border-white/[0.06] text-xs text-white/70 font-medium">
              {bothPresent
                ? 'Host will start Round 1 shortly...'
                : 'Connecting with host over P2P...'}
            </div>
          )}

          {/* Look Around the App Button */}
          <button
            onClick={() => {
              sound.playSelect();
              onExploreApp();
            }}
            className="w-full py-3 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white rounded-xl text-xs font-semibold border border-white/[0.06] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#927CFF]" />
            <span>Look Around App While Waiting (Room Stays Active)</span>
          </button>

          {/* Quick Demo fallback */}
          {!bothPresent && (
            <button
              onClick={() => {
                sound.playSelect();
                onStartDemoInstead();
              }}
              className="w-full py-2 text-xs text-white/40 hover:text-[#EFC65D] transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#EFC65D]" />
              <span>Test with Demo Companion right now instead</span>
            </button>
          )}

          <button
            onClick={onLeave}
            className="w-full py-2 text-xs text-white/30 hover:text-[#FF7B84] transition-colors cursor-pointer"
          >
            Leave & Close Room
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        roomCode={roomCode}
        inviteUrl={inviteUrl}
      />
    </div>
  );
};
