export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  gender: Gender;
  role: 'user' | 'admin';
  createdAt: number;
  avatarUrl?: string;
  bio?: string;
  isBanned?: boolean;
}

export interface MatchSession {
  sessionId: string;
  userAId: string;
  userBId: string;
  userAUsername: string;
  userBUsername: string;
  startedAt: number;
  endedAt?: number;
  durationSeconds?: number;
  status: 'active' | 'ended' | 'reported';
}

export interface ChatMessage {
  id: string;
  tempId?: string;
  sessionId: string;
  senderId: string;
  senderUsername: string;
  text: string;
  timestamp: number;
  isSelf?: boolean;
}

export interface EmojiReaction {
  id?: string;
  sessionId: string;
  emoji: string;
  senderId: string;
  timestamp: number;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  reporterUsername: string;
  reportedUserId: string;
  reportedUsername: string;
  reason: string;
  details?: string;
  timestamp: number;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface AdminStats {
  totalUsers: number;
  onlineUsers: number;
  queueCount: number;
  activeCalls: number;
  totalReports: number;
  pendingReports: number;
}
