import { User, Gender, MatchSession, ReportRecord, AdminStats } from '../types';

export const API_BASE = '/api';

export const api = {
  async register(data: { fullName: string; email: string; password: string; gender: Gender }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
    return result;
  },

  async login(data: { identifier: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    return result;
  },

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Password reset request failed');
    return result;
  },

  async updateProfile(data: { userId: string; fullName?: string; bio?: string; gender?: Gender }): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Update failed');
    return result;
  },

  async getHistory(userId: string): Promise<{ history: MatchSession[] }> {
    const res = await fetch(`${API_BASE}/history?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return { history: [] };
    return res.json();
  },

  async submitReport(data: { reporterId: string; reportedUserId: string; reason: string; details?: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/safety/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Report failed');
    return result;
  },

  async blockUser(data: { userId: string; blockedUserId: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/safety/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Block failed');
    return result;
  },

  async getBlockedUsers(userId: string): Promise<{ blockedIds: string[] }> {
    const res = await fetch(`${API_BASE}/safety/blocks?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return { blockedIds: [] };
    return res.json();
  },

  async getAdminOverview(): Promise<{ stats: AdminStats; users: User[]; reports: ReportRecord[]; activeSessions: MatchSession[] }> {
    const res = await fetch(`${API_BASE}/admin/overview`);
    if (!res.ok) throw new Error('Failed to load admin data');
    return res.json();
  },

  async adminUserAction(targetUserId: string, action: 'ban' | 'unban'): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/user-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, action })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Action failed');
    return result;
  },

  async adminReportStatus(reportId: string, status: 'resolved' | 'dismissed'): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/report-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Update status failed');
    return result;
  }
};
