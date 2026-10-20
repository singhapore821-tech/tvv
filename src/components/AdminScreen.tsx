import React, { useState, useEffect } from 'react';
import { User, ReportRecord, AdminStats, MatchSession } from '../types';
import { api } from '../services/api';
import { ShieldAlert, Users, Video, AlertCircle, Ban, CheckCircle, RefreshCw, UserCheck } from 'lucide-react';

export const AdminScreen: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [activeSessions, setActiveSessions] = useState<MatchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOverview();
      setStats(res.stats);
      setUsers(res.users);
      setReports(res.reports);
      setActiveSessions(res.activeSessions);
    } catch (err: any) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUserAction = async (targetUserId: string, action: 'ban' | 'unban') => {
    try {
      const res = await api.adminUserAction(targetUserId, action);
      setActionMsg(res.message);
      loadData();
    } catch (e: any) {
      setActionMsg(e.message || 'Action failed');
    }
  };

  const handleReportStatus = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await api.adminReportStatus(reportId, status);
      setActionMsg(`Report marked as ${status}`);
      loadData();
    } catch (e: any) {
      setActionMsg(e.message || 'Status update failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#ff2a5f]" />
            <span>VIBE TV Admin & Safety Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time presence monitoring, registered user registry, and moderation control.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 bg-[#ff2a5f]/15 border border-[#ff2a5f]/30 rounded-xl text-xs text-pink-300">
          {actionMsg}
        </div>
      )}

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#111116] border border-white/10">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Registered Users</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">{stats.totalUsers}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111116] border border-white/10">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Online Presence</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400 font-mono">{stats.onlineUsers}</span>
              <span className="text-[10px] text-slate-500">live sockets</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111116] border border-white/10">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Active Calls</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#ff2a5f] font-mono">{stats.activeCalls}</span>
              <span className="text-[10px] text-slate-500">WebRTC</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111116] border border-white/10">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Pending Reports</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400 font-mono">{stats.pendingReports}</span>
              <span className="text-[10px] text-slate-500">review</span>
            </div>
          </div>
        </div>
      )}

      {/* Safety Reports Table */}
      <div className="p-5 rounded-2xl bg-[#111116] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-display">Safety Reports & Violations</h3>
          <span className="text-xs text-slate-500">{reports.length} total reports</span>
        </div>

        {reports.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No user reports filed yet. Clean community status!
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-400">{rep.reason}</span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-300">
                      Reported: <strong className="text-white">@{rep.reportedUsername}</strong>
                    </span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-400">By: @{rep.reporterUsername}</span>
                  </div>
                  {rep.details && <p className="text-slate-400 text-[11px] mt-1">{rep.details}</p>}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rep.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {rep.status}
                  </span>

                  {rep.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReportStatus(rep.id, 'resolved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px]"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleUserAction(rep.reportedUserId, 'ban')}
                        className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-[11px]"
                      >
                        Ban User
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Accounts Management */}
      <div className="p-5 rounded-2xl bg-[#111116] border border-white/10 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-display">Registered Accounts Directory</h3>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{u.fullName}</span>
                  <span className="text-[#ff7597]">@{u.username}</span>
                  {u.isBanned && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-600 text-white">
                      Suspended
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {u.email} &bull; Gender: {u.gender} &bull; Role: {u.role}
                </div>
              </div>

              {u.role !== 'admin' && (
                <div>
                  {u.isBanned ? (
                    <button
                      onClick={() => handleUserAction(u.id, 'unban')}
                      className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUserAction(u.id, 'ban')}
                      className="px-3 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Suspend
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
