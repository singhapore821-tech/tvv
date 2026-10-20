import React, { useState, useEffect } from 'react';
import { MatchSession } from '../types';
import { api } from '../services/api';
import { Clock, Video, Bell, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HistoryScreenProps {
  userId: string;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ userId }) => {
  const [history, setHistory] = useState<MatchSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getHistory(userId);
        setHistory(res.history || []);
      } catch (e) {
        console.error('Failed to load history', e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Announcements & Notifications Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111116] border border-white/10 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-[#ff7597]">
          <Bell className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider font-display">System Notifications</h3>
        </div>

        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-white block">Community Shield Active</span>
              <p className="text-slate-400 mt-0.5 text-[11px]">
                Real-time matchmaking filters out blocked users and enforces zero tolerance on inappropriate streams.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#ff2a5f] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-white block">WebRTC P2P Direct Media</span>
              <p className="text-slate-400 mt-0.5 text-[11px]">
                Your video and audio streams are exchanged directly peer-to-peer using STUN/TURN traversal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Match Sessions Records */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-display">Session Activity Records</h3>
          <span className="text-xs text-slate-500">
            {history.length} {history.length === 1 ? 'call record' : 'call records'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading session records...
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#111116] border border-white/10 text-center">
            <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">No Call Sessions Yet</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Start matching on the home screen to connect with real users. Completed calls and durations will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => {
              const date = new Date(item.startedAt);
              const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const durationMin = item.durationSeconds ? Math.floor(item.durationSeconds / 60) : 0;
              const durationSec = item.durationSeconds ? item.durationSeconds % 60 : 0;
              const durationStr = item.durationSeconds !== undefined ? `${durationMin}m ${durationSec}s` : 'Active / Ended';

              return (
                <div
                  key={item.sessionId}
                  className="p-3.5 rounded-xl bg-[#111116] border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#ff2a5f]/15 border border-[#ff2a5f]/30 flex items-center justify-center text-[#ff2a5f]">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">
                        Match Session <span className="text-slate-400 font-mono text-[11px]">#{item.sessionId.slice(-6)}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formattedDate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold text-slate-200 block">
                      {durationStr}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
