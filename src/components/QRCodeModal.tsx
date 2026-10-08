import React, { useState } from 'react';
import { X, Copy, Check, QrCode, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { sound } from '../utils/audio';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  inviteUrl: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  inviteUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&bgcolor=111116&color=F7F5F2&data=${encodeURIComponent(
    inviteUrl
  )}`;

  const handleCopy = async () => {
    sound.playSelect();
    await copyToClipboard(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#111116] border border-white/[0.08] rounded-3xl p-6 shadow-2xl text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#59D8AD] bg-[#59D8AD]/10 px-2.5 py-0.5 rounded-full border border-[#59D8AD]/20 font-mono mb-2 uppercase">
            <ShieldCheck className="w-3 h-3" /> Encrypted P2P Invite
          </div>
          <h3 className="font-['Syne',sans-serif] text-xl font-bold text-white tracking-tight">
            Scan to Join Room
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Point your partner's phone camera at the screen to connect immediately.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-[#17171D] rounded-2xl border border-white/[0.06] flex flex-col items-center justify-center min-h-[260px] relative">
          <img
            src={qrImageUrl}
            alt={`QR Code for room ${roomCode}`}
            onLoad={() => setImgLoaded(true)}
            className={`w-52 h-52 rounded-xl transition-opacity duration-300 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!imgLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-white/40">
              <QrCode className="w-8 h-8 animate-pulse text-[#927CFF] mb-2" />
              <span>Generating Secure QR...</span>
            </div>
          )}
        </div>

        {/* Room Code Badge */}
        <div className="flex items-center justify-center gap-2 font-mono text-sm">
          <span className="text-white/40 uppercase text-xs">Room Code:</span>
          <span className="font-bold text-white tracking-widest text-base">{roomCode}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-3 bg-gradient-to-r from-[#927CFF] to-[#6E53ED] hover:from-[#8168fc] hover:to-[#5d40e8] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#6E53ED]/20 cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-white/[0.05] hover:bg-white/10 text-white/80 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
