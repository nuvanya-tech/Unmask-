import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface VoiceRecorderProps {
  onAudioRecorded: (audioDataUrl: string, durationSec: number) => void;
  onClearAudio?: () => void;
  maxSeconds?: number;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioRecorded,
  onClearAudio,
  maxSeconds = 25,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicError('Audio recording not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      sound.playSelect();

      // Check supported MIME types
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          onAudioRecorded(base64Data, recordTime || 1);
        };

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= maxSeconds) {
            stopRecording();
            return maxSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access denied:', err);
      setMicError('Microphone permission denied. You can type your answer instead.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      sound.playSubmit();
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleClear = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordTime(0);
    if (onClearAudio) onClearAudio();
  };

  return (
    <div className="p-4 rounded-2xl bg-[#17171D] border border-white/[0.08] space-y-3">
      {micError && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FF7B84]/10 border border-[#FF7B84]/20 text-xs text-[#FF7B84]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {!audioUrl ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3.5 rounded-2xl font-bold flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isRecording
                  ? 'bg-[#FF7B84] text-white animate-pulse ring-4 ring-[#FF7B84]/30'
                  : 'bg-gradient-to-r from-[#F05D9F] to-[#FF7B84] text-white hover:opacity-95'
              }`}
            >
              {isRecording ? <Square className="w-5 h-5 fill-white" /> : <Mic className="w-5 h-5" />}
            </button>

            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{isRecording ? 'Recording Voice Truth...' : 'Record Voice Note Truth'}</span>
                {isRecording && (
                  <span className="w-2 h-2 rounded-full bg-[#FF7B84] animate-ping" />
                )}
              </div>
              <div className="text-[11px] text-white/40 mt-0.5 font-mono">
                {isRecording ? `${recordTime}s / ${maxSeconds}s` : 'Tap to start speaking your truth'}
              </div>
            </div>
          </div>

          {/* Animated Audio Waveform Bars while recording */}
          {isRecording && (
            <div className="flex items-center gap-1 h-6">
              {[12, 24, 18, 30, 16, 26, 14, 28].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#FF7B84] rounded-full animate-bounce"
                  style={{
                    height: `${h}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Audio Recorded Playback Bar */
        <div className="flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={togglePlayback}
              className="p-3 bg-[#59D8AD] hover:bg-[#48c79c] text-[#09090C] rounded-xl font-bold transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-[#09090C]" /> : <Play className="w-4 h-4 fill-[#09090C] ml-0.5" />}
            </button>

            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#59D8AD]" />
                <span>Voice Truth Captured</span>
              </div>
              <div className="text-[10px] text-white/50 font-mono">
                Duration: {recordTime}s · Ready to send
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-white/40 hover:text-[#FF7B84] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            title="Delete & re-record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
