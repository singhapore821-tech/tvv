import { ChatMessage, EmojiReaction } from '../types';

export type SocketEventType =
  | 'presence_update'
  | 'match_found'
  | 'session_ended'
  | 'webrtc_offer'
  | 'webrtc_answer'
  | 'webrtc_ice_candidate'
  | 'chat_message'
  | 'typing'
  | 'emoji_reaction'
  | 'queue_joined'
  | 'queue_left'
  | 'account_suspended';

type Listener = (data: any) => void;

class SocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<Listener>> = new Map();
  private reconnectTimeout: any = null;
  private pingInterval: any = null;
  private currentUserId: string | null = null;
  private currentUsername: string | null = null;
  public isConnected: boolean = false;

  connect(userId: string, username: string) {
    this.currentUserId = userId;
    this.currentUsername = username;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.emit('connection_status', { connected: true });

        // Authenticate socket session
        this.send({
          type: 'auth_connect',
          userId: this.currentUserId,
          username: this.currentUsername
        });

        // Start ping heartbeat
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          this.send({ type: 'ping' });
        }, 15000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type) {
            this.emit(data.type, data);
          }
        } catch (e) {
          console.error('Failed to parse incoming socket message', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit('connection_status', { connected: false });
        if (this.pingInterval) clearInterval(this.pingInterval);

        // Auto reconnect after 2 seconds if user is logged in
        if (this.currentUserId) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = setTimeout(() => {
            this.connect(this.currentUserId!, this.currentUsername!);
          }, 2000);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('Socket encountered error', err);
      };
    } catch (e) {
      console.error('WebSocket connection initialization error:', e);
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  joinQueue() {
    this.send({ type: 'join_queue' });
  }

  leaveQueue() {
    this.send({ type: 'leave_queue' });
  }

  sendOffer(sessionId: string, offer: RTCSessionDescriptionInit) {
    this.send({ type: 'webrtc_offer', sessionId, offer });
  }

  sendAnswer(sessionId: string, answer: RTCSessionDescriptionInit) {
    this.send({ type: 'webrtc_answer', sessionId, answer });
  }

  sendIceCandidate(sessionId: string, candidate: RTCIceCandidate) {
    this.send({ type: 'webrtc_ice_candidate', sessionId, candidate });
  }

  sendMessage(sessionId: string, text: string, tempId: string) {
    this.send({ type: 'chat_message', sessionId, text, tempId });
  }

  sendTyping(sessionId: string, isTyping: boolean) {
    this.send({ type: 'typing', sessionId, isTyping });
  }

  sendEmojiReaction(sessionId: string, emoji: string) {
    this.send({ type: 'emoji_reaction', sessionId, emoji });
  }

  endCall(sessionId: string, reason: string = 'user_disconnected') {
    this.send({ type: 'end_call', sessionId, reason });
  }

  on(event: string, callback: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: Listener) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in listener for ${event}:`, err);
        }
      });
    }
  }

  disconnect() {
    this.currentUserId = null;
    this.currentUsername = null;
    clearTimeout(this.reconnectTimeout);
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const socketClient = new SocketClient();
