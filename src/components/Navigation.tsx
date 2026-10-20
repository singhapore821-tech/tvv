import React from 'react';
import { User } from '../types';
import { Flame, Home, History, User as UserIcon, ShieldAlert, Smartphone, Globe, Share2 } from 'lucide-react';

interface NavigationProps {
  user: User;
  currentTab: 'home' | 'history' | 'profile' | 'admin';
  onChangeTab: (tab: 'home' | 'history' | 'profile' | 'admin') => void;
  onOpenAndroidCode: () => void;
  onOpenShare?: () => void;
}

export const TopNavigation: React.FC<NavigationProps> = ({
  user,
  currentTab,
  onChangeTab,
  onOpenAndroidCode,
  onOpenShare
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080a]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => onChangeTab('home')}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff2a5f] to-[#e11d48] flex items-center justify-center text-white shadow-md shadow-[#ff2a5f]/30">
            <Flame className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-lg font-black tracking-tight text-white font-display">
            VIBE <span className="text-[#ff2a5f]">TV</span>
          </span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onChangeTab('home')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'home' ? 'text-[#ff2a5f]' : 'hover:text-white'
            }`}
          >
            Match Radar
          </button>
          <button
            onClick={() => onChangeTab('history')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'history' ? 'text-[#ff2a5f]' : 'hover:text-white'
            }`}
          >
            History & Records
          </button>
          <button
            onClick={() => onChangeTab('profile')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'profile' ? 'text-[#ff2a5f]' : 'hover:text-white'
            }`}
          >
            Profile & Settings
          </button>
          {user.role === 'admin' && (
            <button
              onClick={() => onChangeTab('admin')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentTab === 'admin' ? 'text-[#ff2a5f]' : 'hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              title="Public link for other devices"
            >
              <Share2 className="w-3.5 h-3.5 text-[#ff2a5f]" />
              <span className="hidden sm:inline">Share Public Link</span>
              <span className="sm:hidden">Share</span>
            </button>
          )}

          <button
            onClick={onOpenAndroidCode}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff2a5f] to-[#e11d48] hover:opacity-95 text-white text-xs font-bold transition-all shadow-md shadow-[#ff2a5f]/20 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android Studio Blueprint</span>
            <span className="sm:hidden">Android Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export const BottomTabBar: React.FC<NavigationProps> = ({
  user,
  currentTab,
  onChangeTab
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c12]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around">
      <button
        onClick={() => onChangeTab('home')}
        className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[54px] transition-colors ${
          currentTab === 'home' ? 'text-[#ff2a5f]' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-tight">Radar</span>
      </button>

      <button
        onClick={() => onChangeTab('history')}
        className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[54px] transition-colors ${
          currentTab === 'history' ? 'text-[#ff2a5f]' : 'text-slate-400 hover:text-white'
        }`}
      >
        <History className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-tight">History</span>
      </button>

      <button
        onClick={() => onChangeTab('profile')}
        className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[54px] transition-colors ${
          currentTab === 'profile' ? 'text-[#ff2a5f]' : 'text-slate-400 hover:text-white'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-tight">Profile</span>
      </button>

      {user.role === 'admin' && (
        <button
          onClick={() => onChangeTab('admin')}
          className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[54px] transition-colors ${
            currentTab === 'admin' ? 'text-[#ff2a5f]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight">Admin</span>
        </button>
      )}
    </nav>
  );
};
