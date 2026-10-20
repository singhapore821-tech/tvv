import React from 'react';
import { User } from '../types';
import { Flame, Video, Users, Sparkles, Shield, Compass, Smartphone, ArrowRight, X } from 'lucide-react';

interface MainScreenProps {
  user: User;
  onlineCount: number;
  queueCount: number;
  isSearching: boolean;
  onStartMatch: () => void;
  onCancelMatch: () => void;
  onOpenAndroidCode: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  user,
  onlineCount,
  queueCount,
  isSearching,
  onStartMatch,
  onCancelMatch,
  onOpenAndroidCode
}) => {
  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-between p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] bg-gradient-to-tr from-[#ff2a5f]/15 to-[#ec4899]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Status Bar */}
      <div className="w-full flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">
            {onlineCount} {onlineCount === 1 ? 'Real User Online' : 'Real Users Online'}
          </span>
          {queueCount > 0 && (
            <span className="text-xs text-[#ff2a5f] font-mono border-l border-white/10 pl-2">
              ({queueCount} in queue)
            </span>
          )}
        </div>

        <button
          onClick={onOpenAndroidCode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff2a5f]/15 border border-[#ff2a5f]/30 text-xs font-medium text-[#ff7597] hover:bg-[#ff2a5f]/25 transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android Studio Code & Zip</span>
        </button>
      </div>

      {/* Central Interactive Radar & Matching Area */}
      <div className="my-auto flex flex-col items-center text-center z-10 py-8">
        {!isSearching ? (
          /* IDLE STATE */
          <div className="flex flex-col items-center">
            {/* Animated Radar Pulse Rings */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-56 h-56 rounded-full border border-pink-500/20 animate-radar-1 pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full border border-[#ff2a5f]/30 animate-radar-2 pointer-events-none" />
              <div className="absolute w-32 h-32 rounded-full border border-[#ff2a5f]/40 animate-radar-3 pointer-events-none" />

              {/* Big Central Start Button */}
              <button
                onClick={onStartMatch}
                className="relative group w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-[#ff2a5f] via-[#e11d48] to-[#ec4899] p-1 shadow-2xl shadow-[#ff2a5f]/40 active:scale-95 transition-transform"
              >
                <div className="w-full h-full rounded-full bg-[#111116] flex flex-col items-center justify-center gap-2 group-hover:bg-[#15151c] transition-colors border border-white/20">
                  <Video className="w-10 h-10 text-[#ff2a5f] group-hover:scale-110 transition-transform" />
                  <span className="text-base sm:text-lg font-extrabold tracking-wider text-white font-display uppercase">
                    START
                  </span>
                </div>
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Ready to Match, <span className="text-[#ff2a5f]">{user.fullName.split(' ')[0]}</span>?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md">
              Tap <span className="text-white font-semibold">Start</span> to connect with another real user via live WebRTC video & audio. No bots, ever.
            </p>
          </div>
        ) : (
          /* SEARCHING STATE */
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center mb-8">
              {/* Active Radar Waves */}
              <div className="absolute w-64 h-64 rounded-full border-2 border-[#ff2a5f]/40 animate-radar-1 pointer-events-none" />
              <div className="absolute w-48 h-48 rounded-full border border-[#ec4899]/50 animate-radar-2 pointer-events-none" />
              <div className="absolute w-32 h-32 rounded-full border border-pink-400/60 animate-radar-3 pointer-events-none" />

              <div className="w-28 h-28 rounded-full bg-[#16161f] border-2 border-[#ff2a5f] flex flex-col items-center justify-center shadow-xl shadow-[#ff2a5f]/30">
                <Compass className="w-10 h-10 text-[#ff2a5f] animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Searching for real users...
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm">
              Waiting for another real person to tap Start. Never artificial bots or fake opponents.
            </p>

            {/* Test prompt for user */}
            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl text-left text-xs text-slate-300 max-w-sm">
              <span className="font-semibold text-[#ff7597] block mb-1">Testing Tip (2 Devices):</span>
              Open this app URL in an Incognito window or on a second phone, register another account, and tap Start to connect instantly!
            </div>

            <button
              onClick={onCancelMatch}
              className="mt-6 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors flex items-center gap-2 border border-white/10"
            >
              <X className="w-3.5 h-3.5" />
              Cancel Search
            </button>
          </div>
        )}
      </div>

      {/* Bottom Features Banner */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 z-10 pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-[#ff2a5f] shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">100% Real Users</h4>
            <p className="text-[11px] text-slate-400">Strictly no bots or demo video simulations.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-[#ff2a5f] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Live WebRTC Audio/Video</h4>
            <p className="text-[11px] text-slate-400">P2P encrypted video, low latency STUN.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-[#ec4899] shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Swipe to Skip</h4>
            <p className="text-[11px] text-slate-400">Horizontal swipe to immediately match next.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
