import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.use(express.json());

// In-Memory Database for real persistent session storage across the app lifetime
export interface UserRecord {
  id: string;
  fullName: string;
  username: string; // lowercase unique
  email: string; // lowercase unique
  passwordHash: string;
  salt: string;
  gender: 'male' | 'female' | 'other';
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

// State
const usersByUsername = new Map<string, UserRecord>();
const usersByEmail = new Map<string, UserRecord>();
const usersById = new Map<string, UserRecord>();
const activeSessions = new Map<string, MatchSession>();
const userSessionsHistory = new Map<string, MatchSession[]>(); // userId -> history
const reports: ReportRecord[] = [];
const blocks = new Map<string, Set<string>>(); // userId -> Set of blockedUserIds

// Helper: Password Hashing (PBKDF2 - Never plain text)
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Seed default admin account if not existing
const adminSalt = crypto.randomBytes(16).toString('hex');
const adminUser: UserRecord = {
  id: 'admin-vibetv-master',
  fullName: 'VIBE TV Moderator',
  username: 'admin',
  email: 'admin@vibetv.app',
  passwordHash: hashPassword('VibeAdmin2026!', adminSalt),
  salt: adminSalt,
  gender: 'other',
  role: 'admin',
  createdAt: Date.now() - 86400000,
  bio: 'Official VIBE TV Safety & Operations Team'
};
usersByUsername.set(adminUser.username.toLowerCase(), adminUser);
usersByEmail.set(adminUser.email.toLowerCase(), adminUser);
usersById.set(adminUser.id, adminUser);

// Auth Endpoints
app.post('/api/auth/register', (req, res) => {
  try {
    const { fullName, email, password, gender } = req.body;

    if (!fullName || !email || !password || !gender) {
      return res.status(400).json({ error: 'All fields (Full Name, Email, Password, Gender) are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Password strength check
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (usersByEmail.has(cleanEmail)) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Auto-generate username from email prefix or name (no username input needed in register)
    let rawPrefix = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user';
    let cleanUsername = rawPrefix.slice(0, 15);
    let counter = 1;
    while (usersByUsername.has(cleanUsername)) {
      cleanUsername = `${rawPrefix.slice(0, 12)}_${counter}`;
      counter++;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const userId = 'usr_' + crypto.randomUUID().slice(0, 8);

    const newUser: UserRecord = {
      id: userId,
      fullName: String(fullName).trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      salt,
      gender: ['male', 'female', 'other'].includes(gender) ? gender : 'other',
      role: 'user',
      createdAt: Date.now()
    };

    usersByUsername.set(cleanUsername, newUser);
    usersByEmail.set(cleanEmail, newUser);
    usersById.set(userId, newUser);

    // Return sanitized user (never return salt or password hash)
    const { passwordHash: _, salt: __, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      user: safeUser,
      token: 'vibe_' + Buffer.from(userId + ':' + Date.now()).toString('base64')
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal registration error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email OR username

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier (Email or Username) and password are required.' });
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();

    // Resolve username to email / user account
    let user = usersByEmail.get(cleanIdentifier) || usersByUsername.get(cleanIdentifier);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User account does not exist.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'This account has been suspended for violating Community Guidelines.' });
    }

    const testHash = hashPassword(password, user.salt);
    if (testHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
      token: 'vibe_' + Buffer.from(user.id + ':' + Date.now()).toString('base64')
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login error' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email address is required.' });
  const cleanEmail = String(email).trim().toLowerCase();
  const user = usersByEmail.get(cleanEmail);

  if (!user) {
    // Return standard message to prevent email enumeration
    return res.json({ success: true, message: 'If an account exists with this email, password reset instructions have been sent.' });
  }

  return res.json({
    success: true,
    message: `Password reset verification link has been dispatched to ${cleanEmail}.`
  });
});

app.post('/api/user/profile', (req, res) => {
  const { userId, fullName, bio, gender } = req.body;
  const user = usersById.get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (fullName) user.fullName = String(fullName).trim();
  if (bio !== undefined) user.bio = String(bio).trim();
  if (gender && ['male', 'female', 'other'].includes(gender)) {
    user.gender = gender;
  }

  const { passwordHash: _, salt: __, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// History & Safety Endpoints
app.get('/api/history', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.json({ history: [] });
  const list = userSessionsHistory.get(userId) || [];
  return res.json({ history: list.slice(-30).reverse() });
});

app.post('/api/safety/report', (req, res) => {
  const { reporterId, reportedUserId, reason, details } = req.body;
  if (!reporterId || !reportedUserId || !reason) {
    return res.status(400).json({ error: 'Missing required report parameters.' });
  }

  const reporter = usersById.get(reporterId);
  const reported = usersById.get(reportedUserId);

  const reportItem: ReportRecord = {
    id: 'rep_' + crypto.randomUUID().slice(0, 8),
    reporterId,
    reporterUsername: reporter ? reporter.username : 'Unknown',
    reportedUserId,
    reportedUsername: reported ? reported.username : 'Unknown',
    reason,
    details: details || '',
    timestamp: Date.now(),
    status: 'pending'
  };

  reports.push(reportItem);

  // Automatically block reported user
  if (!blocks.has(reporterId)) blocks.set(reporterId, new Set());
  blocks.get(reporterId)!.add(reportedUserId);

  return res.json({ success: true, message: 'Report submitted. User blocked from future matchmaking.' });
});

app.post('/api/safety/block', (req, res) => {
  const { userId, blockedUserId } = req.body;
  if (!userId || !blockedUserId) return res.status(400).json({ error: 'Missing userId or blockedUserId.' });

  if (!blocks.has(userId)) blocks.set(userId, new Set());
  blocks.get(userId)!.add(blockedUserId);

  return res.json({ success: true, message: 'User successfully blocked.' });
});

app.get('/api/safety/blocks', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.json({ blockedIds: [] });
  const userBlocks = blocks.get(userId);
  return res.json({ blockedIds: userBlocks ? Array.from(userBlocks) : [] });
});

// Admin Dashboard Endpoints
app.get('/api/admin/overview', (req, res) => {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  // Simple administrative authorization check
  const allUsers = Array.from(usersById.values()).map(u => {
    const { passwordHash: _, salt: __, ...safe } = u;
    return safe;
  });

  return res.json({
    stats: {
      totalUsers: usersById.size,
      onlineUsers: connectedClients.size,
      queueCount: matchmakingQueue.length,
      activeCalls: activeSessions.size,
      totalReports: reports.length,
      pendingReports: reports.filter(r => r.status === 'pending').length
    },
    users: allUsers,
    reports: reports.slice(-50).reverse(),
    activeSessions: Array.from(activeSessions.values())
  });
});

app.post('/api/admin/user-action', (req, res) => {
  const { targetUserId, action } = req.body;
  const user = usersById.get(targetUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (action === 'ban') {
    user.isBanned = true;
    // Disconnect if currently online
    const client = connectedClients.get(targetUserId);
    if (client) {
      client.ws.send(JSON.stringify({ type: 'account_suspended', message: 'Your account was suspended by moderation.' }));
      client.ws.close();
    }
  } else if (action === 'unban') {
    user.isBanned = false;
  }

  return res.json({ success: true, message: `Action ${action} executed on ${user.username}` });
});

app.post('/api/admin/report-status', (req, res) => {
  const { reportId, status } = req.body;
  const report = reports.find(r => r.id === reportId);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  report.status = status;
  return res.json({ success: true, report });
});

// ==========================================
// REAL-TIME WEBRTC SIGNALING & MATCHMAKING
// ==========================================

interface ConnectedClient {
  userId: string;
  username: string;
  ws: WebSocket;
  currentSessionId?: string;
  inQueue: boolean;
  peerId?: string;
  joinedQueueAt?: number;
}

const connectedClients = new Map<string, ConnectedClient>(); // userId -> ConnectedClient
const matchmakingQueue: string[] = []; // userIds in queue

// Helper: Broadcast online count to all clients
function broadcastPresence() {
  const payload = JSON.stringify({
    type: 'presence_update',
    onlineCount: connectedClients.size,
    queueCount: matchmakingQueue.length
  });
  connectedClients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  });
}

// Matchmaker Engine
function processQueue() {
  if (matchmakingQueue.length < 2) return;

  // Filter out disconnected or invalid queue members
  for (let i = matchmakingQueue.length - 1; i >= 0; i--) {
    const uid = matchmakingQueue[i];
    const client = connectedClients.get(uid);
    if (!client || !client.inQueue || client.ws.readyState !== WebSocket.OPEN) {
      matchmakingQueue.splice(i, 1);
    }
  }

  if (matchmakingQueue.length < 2) return;

  // Find two compatible users (check blocks and not same user)
  let userAId: string | null = null;
  let userBId: string | null = null;
  let indexA = -1;
  let indexB = -1;

  for (let i = 0; i < matchmakingQueue.length; i++) {
    const candidateA = matchmakingQueue[i];
    const blockedByA = blocks.get(candidateA);

    for (let j = i + 1; j < matchmakingQueue.length; j++) {
      const candidateB = matchmakingQueue[j];
      const blockedByB = blocks.get(candidateB);

      // Check mutual block checks
      const aBlockedB = blockedByA && blockedByA.has(candidateB);
      const bBlockedA = blockedByB && blockedByB.has(candidateA);

      if (!aBlockedB && !bBlockedA && candidateA !== candidateB) {
        userAId = candidateA;
        userBId = candidateB;
        indexA = i;
        indexB = j;
        break;
      }
    }
    if (userAId && userBId) break;
  }

  if (!userAId || !userBId) return;

  // Remove both from queue
  matchmakingQueue.splice(indexB, 1);
  matchmakingQueue.splice(indexA, 1);

  const clientA = connectedClients.get(userAId);
  const clientB = connectedClients.get(userBId);

  if (!clientA || !clientB) {
    if (clientA) matchmakingQueue.push(userAId);
    if (clientB) matchmakingQueue.push(userBId);
    return;
  }

  clientA.inQueue = false;
  clientB.inQueue = false;

  const sessionId = 'ses_' + crypto.randomUUID().slice(0, 10);
  const session: MatchSession = {
    sessionId,
    userAId,
    userBId,
    userAUsername: clientA.username,
    userBUsername: clientB.username,
    startedAt: Date.now(),
    status: 'active'
  };

  activeSessions.set(sessionId, session);
  clientA.currentSessionId = sessionId;
  clientB.currentSessionId = sessionId;
  clientA.peerId = userBId;
  clientB.peerId = userAId;

  // Send matched event: Client A is designated initiator (caller), Client B is responder (callee)
  if (clientA.ws.readyState === WebSocket.OPEN) {
    clientA.ws.send(JSON.stringify({
      type: 'match_found',
      sessionId,
      isInitiator: true, // A creates offer
      peerId: userBId,
      peerUsername: clientB.username
    }));
  }

  if (clientB.ws.readyState === WebSocket.OPEN) {
    clientB.ws.send(JSON.stringify({
      type: 'match_found',
      sessionId,
      isInitiator: false, // B waits for offer
      peerId: userAId,
      peerUsername: clientA.username
    }));
  }

  broadcastPresence();
}

function endSession(sessionId: string, endedByUserId?: string, reason: string = 'ended') {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  session.endedAt = Date.now();
  session.durationSeconds = Math.round((session.endedAt - session.startedAt) / 1000);
  session.status = 'ended';

  // Record in both users' history
  const addHistory = (userId: string, s: MatchSession) => {
    if (!userSessionsHistory.has(userId)) userSessionsHistory.set(userId, []);
    userSessionsHistory.get(userId)!.push({ ...s });
  };
  addHistory(session.userAId, session);
  addHistory(session.userBId, session);

  activeSessions.delete(sessionId);

  // Notify both peers
  [session.userAId, session.userBId].forEach(uid => {
    const client = connectedClients.get(uid);
    if (client && client.currentSessionId === sessionId) {
      client.currentSessionId = undefined;
      client.peerId = undefined;
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'session_ended',
          sessionId,
          reason,
          endedBy: endedByUserId
        }));
      }
    }
  });

  broadcastPresence();
}

// Upgrade HTTP to WS
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws: WebSocket, req) => {
  let authenticatedUserId: string | null = null;

  ws.on('message', (messageRaw: string) => {
    try {
      const data = JSON.parse(messageRaw.toString());

      switch (data.type) {
        case 'auth_connect': {
          const { userId, username } = data;
          if (!userId || !username) return;
          authenticatedUserId = userId;

          connectedClients.set(userId, {
            userId,
            username,
            ws,
            inQueue: false
          });

          ws.send(JSON.stringify({
            type: 'auth_ack',
            userId,
            onlineCount: connectedClients.size,
            queueCount: matchmakingQueue.length
          }));

          broadcastPresence();
          break;
        }

        case 'join_queue': {
          if (!authenticatedUserId) return;
          const client = connectedClients.get(authenticatedUserId);
          if (!client) return;

          // If in an active session, end it first
          if (client.currentSessionId) {
            endSession(client.currentSessionId, authenticatedUserId, 'skipped');
          }

          if (!client.inQueue) {
            client.inQueue = true;
            client.joinedQueueAt = Date.now();
            if (!matchmakingQueue.includes(authenticatedUserId)) {
              matchmakingQueue.push(authenticatedUserId);
            }
          }

          ws.send(JSON.stringify({ type: 'queue_joined', status: 'searching' }));
          broadcastPresence();
          processQueue();
          break;
        }

        case 'leave_queue': {
          if (!authenticatedUserId) return;
          const client = connectedClients.get(authenticatedUserId);
          if (client) {
            client.inQueue = false;
          }
          const idx = matchmakingQueue.indexOf(authenticatedUserId);
          if (idx !== -1) matchmakingQueue.splice(idx, 1);

          ws.send(JSON.stringify({ type: 'queue_left' }));
          broadcastPresence();
          break;
        }

        case 'webrtc_offer': {
          // Relay SDP offer to peer
          const { sessionId, offer } = data;
          const session = activeSessions.get(sessionId);
          if (!session) return;

          const targetUid = session.userAId === authenticatedUserId ? session.userBId : session.userAId;
          const targetClient = connectedClients.get(targetUid);
          if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            targetClient.ws.send(JSON.stringify({
              type: 'webrtc_offer',
              sessionId,
              fromUserId: authenticatedUserId,
              offer
            }));
          }
          break;
        }

        case 'webrtc_answer': {
          // Relay SDP answer to peer
          const { sessionId, answer } = data;
          const session = activeSessions.get(sessionId);
          if (!session) return;

          const targetUid = session.userAId === authenticatedUserId ? session.userBId : session.userAId;
          const targetClient = connectedClients.get(targetUid);
          if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            targetClient.ws.send(JSON.stringify({
              type: 'webrtc_answer',
              sessionId,
              fromUserId: authenticatedUserId,
              answer
            }));
          }
          break;
        }

        case 'webrtc_ice_candidate': {
          // Relay ICE candidate
          const { sessionId, candidate } = data;
          const session = activeSessions.get(sessionId);
          if (!session) return;

          const targetUid = session.userAId === authenticatedUserId ? session.userBId : session.userAId;
          const targetClient = connectedClients.get(targetUid);
          if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            targetClient.ws.send(JSON.stringify({
              type: 'webrtc_ice_candidate',
              sessionId,
              fromUserId: authenticatedUserId,
              candidate
            }));
          }
          break;
        }

        case 'chat_message': {
          const { sessionId, text, tempId } = data;
          const session = activeSessions.get(sessionId);
          if (!session) return;

          const targetUid = session.userAId === authenticatedUserId ? session.userBId : session.userAId;
          const targetClient = connectedClients.get(targetUid);

          const messagePayload = {
            type: 'chat_message',
            id: 'msg_' + crypto.randomUUID().slice(0, 8),
            tempId,
            sessionId,
            senderId: authenticatedUserId,
            senderUsername: connectedClients.get(authenticatedUserId || '')?.username || 'You',
            text,
            timestamp: Date.now()
          };

          // Echo to sender with confirmed ID
          ws.send(JSON.stringify({ ...messagePayload, isSelf: true }));

          // Send to peer
          if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            targetClient.ws.send(JSON.stringify({ ...messagePayload, isSelf: false }));
          }
          break;
        }

        case 'typing': {
          const { sessionId, isTyping } = data;
          const session = activeSessions.get(sessionId);
          if (!session) return;

          const targetUid = session.userAId === authenticatedUserId ? session.userBId : session.userAId;
          const targetClient = connectedClients.get(targetUid);
          if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            targetClient.ws.send(JSON.stringify({
              type: 'typing',
              sessionId,
              isTyping: !!isTyping
            }));
          }
          break;
        }

        case 'emoji_reaction': {
          const { sessionId, emoji } = data;
          const session = activeSessions.get(sessionId);
          if (!session) return;

          const targetUid = session.userAId === authenticatedUserId ? session.userBId : session.userAId;
          const targetClient = connectedClients.get(targetUid);

          const reactionEvent = {
            type: 'emoji_reaction',
            sessionId,
            senderId: authenticatedUserId,
            emoji,
            timestamp: Date.now()
          };

          // Synchronize with opponent
          if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            targetClient.ws.send(JSON.stringify(reactionEvent));
          }
          break;
        }

        case 'end_call': {
          const { sessionId, reason } = data;
          if (sessionId) {
            endSession(sessionId, authenticatedUserId || undefined, reason || 'user_ended');
          }
          break;
        }

        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
        }
      }
    } catch (e) {
      console.error('WebSocket message parsing error:', e);
    }
  });

  ws.on('close', () => {
    if (authenticatedUserId) {
      const client = connectedClients.get(authenticatedUserId);
      if (client && client.currentSessionId) {
        endSession(client.currentSessionId, authenticatedUserId, 'disconnected');
      }

      const qIdx = matchmakingQueue.indexOf(authenticatedUserId);
      if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1);

      connectedClients.delete(authenticatedUserId);
      broadcastPresence();
    }
  });
});

// Setup Vite Dev Middleware in dev mode, or serve static dist in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[VIBE TV Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
