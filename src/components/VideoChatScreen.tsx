import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, EmojiReaction } from '../types';
import { WebRtcService } from '../services/webrtc';
import { socketClient } from '../services/websocket';
import { api } from '../services/api';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  RefreshCw,
  PhoneOff,
  Flag,
  Send,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface VideoChatScreenProps {
  currentUser: User;
  sessionId: string;
  isInitiator: boolean;
  peerId: string;
  peerUsername: string;
  onEndCall: () => void;
  onSkipToNext: () => void;
}

const EMOJI_LIST = ['🔥', '❤️', '😂', '👏', '😮'];

export const VideoChatScreen: React.FC<VideoChatScreenProps> = ({
  currentUser,
  sessionId,
  isInitiator,
  peerId,
  peerUsername,
  onEndCall,
  onSkipToNext
}) => {
  // WebRTC refs & state
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<WebRtcService | null>(null);

  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('connecting');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Active floating emoji bursts
  const [activeBursts, setActiveBursts] = useState<{ id: string; emoji: string }[]>([]);

  // Safety / Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Harassment or Bullying');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Swipe gesture tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const [swipeFeedback, setSwipeFeedback] = useState<string | null>(null);

  // 1. Initialize WebRTC and Local Media
  useEffect(() => {
    let isMounted = true;

    const webrtc = new WebRtcService({
      onRemoteStream: (stream) => {
        if (!isMounted) return;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          setHasRemoteVideo(true);
        }
      },
      onIceCandidate: (candidate) => {
        socketClient.sendIceCandidate(sessionId, candidate);
      },
      onConnectionStateChange: (state) => {
        if (!isMounted) return;
        setConnectionState(state);
      }
    });

    webrtcRef.current = webrtc;

    async function setupMediaAndSignaling() {
      try {
        const localStream = await webrtc.startLocalMedia();
        if (localVideoRef.current && isMounted) {
          localVideoRef.current.srcObject = localStream;
        }

        // Initialize PeerConnection
        webrtc.initPeerConnection();

        if (isInitiator) {
          // Initiator creates offer and dispatches via WebSocket
          const offer = await webrtc.createOffer();
          socketClient.sendOffer(sessionId, offer);
        }
      } catch (err) {
        console.error('Error starting media in VideoChatScreen:', err);
      }
    }

    setupMediaAndSignaling();

    // 2. Listen to WebSocket Signaling & Real-Time Events
    const unsubs: (() => void)[] = [];

    // Remote offer
    unsubs.push(
      socketClient.on('webrtc_offer', async (data: any) => {
        if (data.sessionId === sessionId && !isInitiator && webrtcRef.current) {
          try {
            const answer = await webrtcRef.current.handleOffer(data.offer);
            socketClient.sendAnswer(sessionId, answer);
          } catch (e) {
            console.error('Error handling offer:', e);
          }
        }
      })
    );

    // Remote answer
    unsubs.push(
      socketClient.on('webrtc_answer', async (data: any) => {
        if (data.sessionId === sessionId && webrtcRef.current) {
          try {
            await webrtcRef.current.handleAnswer(data.answer);
          } catch (e) {
            console.error('Error handling answer:', e);
          }
        }
      })
    );

    // ICE candidate
    unsubs.push(
      socketClient.on('webrtc_ice_candidate', async (data: any) => {
        if (data.sessionId === sessionId && webrtcRef.current) {
          try {
            await webrtcRef.current.addIceCandidate(data.candidate);
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      })
    );

    // Incoming chat message
    unsubs.push(
      socketClient.on('chat_message', (data: ChatMessage) => {
        if (data.sessionId === sessionId) {
          setMessages((prev) => {
            // Check if already present by id or tempId
            if (prev.some((m) => m.id === data.id || (data.tempId && m.tempId === data.tempId))) {
              return prev;
            }
            return [...prev, data];
          });
        }
      })
    );

    // Typing indicator
    unsubs.push(
      socketClient.on('typing', (data: { sessionId: string; isTyping: boolean }) => {
        if (data.sessionId === sessionId) {
          setIsOpponentTyping(data.isTyping);
        }
      })
    );

    // Emoji reaction
    unsubs.push(
      socketClient.on('emoji_reaction', (data: EmojiReaction) => {
        if (data.sessionId === sessionId) {
          triggerBurstAnimation(data.emoji);
        }
      })
    );

    // Session ended by remote peer
    unsubs.push(
      socketClient.on('session_ended', (data: any) => {
        if (data.sessionId === sessionId) {
          setSwipeFeedback('Opponent disconnected');
          setTimeout(() => {
            onSkipToNext();
          }, 1200);
        }
      })
    );

    return () => {
      isMounted = false;
      unsubs.forEach((unsub) => unsub());
      if (webrtcRef.current) {
        webrtcRef.current.destroy();
      }
    };
  }, [sessionId, isInitiator]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isOpponentTyping]);

  // Emoji Burst Trigger
  const triggerBurstAnimation = (emoji: string) => {
    const burstId = 'burst_' + Math.random().toString(36).substring(2, 9);
    setActiveBursts((prev) => [...prev, { id: burstId, emoji }]);

    // Auto remove after animation completes (1.8s)
    setTimeout(() => {
      setActiveBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 1800);
  };

  const handleSendEmoji = (emoji: string) => {
    triggerBurstAnimation(emoji);
    socketClient.sendEmojiReaction(sessionId, emoji);
  };

  // Chat message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const tempId = 'temp_' + Date.now();
    socketClient.sendMessage(sessionId, text, tempId);
    socketClient.sendTyping(sessionId, false);
    setInputText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    socketClient.sendTyping(sessionId, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketClient.sendTyping(sessionId, false);
    }, 2000);
  };

  // Media Controls
  const handleToggleAudio = () => {
    if (webrtcRef.current) {
      const active = webrtcRef.current.toggleAudio();
      setIsAudioMuted(!active);
    }
  };

  const handleToggleVideo = () => {
    if (webrtcRef.current) {
      const active = webrtcRef.current.toggleVideo();
      setIsVideoOff(!active);
    }
  };

  const handleFlipCamera = async () => {
    if (webrtcRef.current) {
      const newStream = await webrtcRef.current.flipCamera();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }
    }
  };

  // Swipe Navigation (Horizontal gesture to skip to next user)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Detect significant horizontal swipe (> 60px) and greater than vertical diff
    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
      setSwipeFeedback('Swiped: Finding next person...');
      setTimeout(() => {
        onSkipToNext();
      }, 400);
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Report & Block
  const handleSubmitReport = async () => {
    setIsSubmittingReport(true);
    try {
      await api.submitReport({
        reporterId: currentUser.id,
        reportedUserId: peerId,
        reason: reportReason,
        details: reportDetails
      });
      setShowReportModal(false);
      onEndCall();
    } catch (err: any) {
      alert(err.message || 'Report submission failed');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div
      className="relative w-full h-[100dvh] bg-black overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. MAIN/FULL REMOTE OPPONENT VIDEO */}
      <div className="absolute inset-0 w-full h-full bg-[#0d0d12] flex items-center justify-center">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            hasRemoteVideo ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Video loading / connecting fallback placeholder */}
        {!hasRemoteVideo && (
          <div className="flex flex-col items-center text-center p-6 z-0">
            <div className="w-20 h-20 rounded-full bg-[#181822] border-2 border-[#ff2a5f] flex items-center justify-center shadow-lg shadow-[#ff2a5f]/25 mb-4 animate-pulse">
              <span className="text-2xl font-bold text-white font-display uppercase">
                {peerUsername ? peerUsername.slice(0, 2) : 'TV'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Connecting with @{peerUsername}...
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Negotiating real-time WebRTC audio & video peer connection.
            </p>
          </div>
        )}
      </div>

      {/* 2. LOCAL CAMERA PREVIEW ON LEFT SIDE (PIP) */}
      <div className="absolute top-4 left-4 z-30 w-24 sm:w-28 h-36 sm:h-40 rounded-2xl overflow-hidden bg-[#16161f] border-2 border-white/20 shadow-2xl backdrop-blur-md">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover -scale-x-100 ${
            isVideoOff ? 'hidden' : 'block'
          }`}
        />
        {isVideoOff && (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-2 text-center">
            <VideoOff className="w-5 h-5 mb-1 text-slate-500" />
            <span>Cam Off</span>
          </div>
        )}
        <div className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-white/90 drop-shadow">
          You
        </div>
      </div>

      {/* TOP HEADER CONTROLS & STATUS */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-slate-200 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionState === 'connected' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
            }`}
          />
          <span className="font-medium text-white">@{peerUsername}</span>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-red-400 flex items-center justify-center transition-colors"
          title="Report or Block User"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* HORIZONTAL SWIPE HINT OVERLAY */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-60 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 text-[11px] text-slate-300 border border-white/5 backdrop-blur-sm">
        <span>Swipe horizontally to skip</span>
        <ChevronRight className="w-3 h-3 text-[#ff2a5f]" />
      </div>

      {/* SWIPE FEEDBACK TOAST */}
      {swipeFeedback && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-[#ff2a5f] text-white text-xs font-bold shadow-xl animate-bounce">
          {swipeFeedback}
        </div>
      )}

      {/* FULL-SCREEN FLOATING EMOJI BURSTS */}
      <div className="absolute inset-0 pointer-events-none z-35 overflow-hidden">
        {activeBursts.map((burst) => (
          <div
            key={burst.id}
            className="absolute left-1/2 top-1/2 text-7xl sm:text-8xl animate-emoji-burst select-none"
          >
            {burst.emoji}
          </div>
        ))}
      </div>

      {/* 3. IN-CALL REAL-TIME CHAT OVERLAY (Bottom Area) */}
      <div className="absolute bottom-28 left-4 right-4 sm:left-6 sm:right-6 z-30 max-w-lg pointer-events-auto">
        {/* Messages Feed */}
        <div
          ref={chatScrollRef}
          className="max-h-44 sm:max-h-52 overflow-y-auto space-y-2 pr-2 scrollbar-none"
        >
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id || msg.isSelf;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm shadow-lg backdrop-blur-md ${
                    isMe
                      ? 'bg-gradient-to-r from-[#ff2a5f] to-[#e11d48] text-white rounded-br-none'
                      : 'bg-black/75 text-slate-100 border border-white/15 rounded-bl-none'
                  }`}
                >
                  <p className="break-words leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3 Animated Dots Typing Indicator */}
        {isOpponentTyping && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-xs text-pink-300 w-fit mt-1.5 border border-white/10">
            <span>@{peerUsername} is typing</span>
            <span className="flex items-center gap-0.5 font-bold tracking-widest text-[#ff2a5f] animate-pulse">
              •••
            </span>
          </div>
        )}
      </div>

      {/* 4. EXACTLY FIVE EMOJI REACTION BUTTONS */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl">
        {EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSendEmoji(emoji)}
            className="w-10 h-10 rounded-full hover:scale-125 active:scale-95 transition-transform flex items-center justify-center text-xl hover:bg-white/10"
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* 5. BOTTOM CONTROLS & CHAT INPUT BAR */}
      <div className="absolute bottom-2 left-0 right-0 z-30 px-3 sm:px-6 pb-2">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {/* Chat Input Field & Send */}
          <form
            onSubmit={handleSendMessage}
            className="flex-1 flex items-center gap-1.5 bg-black/70 backdrop-blur-xl border border-white/15 rounded-full px-3 py-1.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Type message..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none px-2"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-8 h-8 rounded-full bg-[#ff2a5f] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#e11d48] transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* WebRTC Video/Audio Hardware Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleAudio}
              className={`w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors ${
                isAudioMuted
                  ? 'bg-red-500/80 border-red-500 text-white'
                  : 'bg-black/60 border-white/15 text-slate-200 hover:text-white'
              }`}
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={handleToggleVideo}
              className={`w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors ${
                isVideoOff
                  ? 'bg-red-500/80 border-red-500 text-white'
                  : 'bg-black/60 border-white/15 text-slate-200 hover:text-white'
              }`}
              title={isVideoOff ? 'Enable Camera' : 'Turn Off Camera'}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleFlipCamera}
              className="w-10 h-10 rounded-full bg-black/60 border border-white/15 text-slate-200 hover:text-white flex items-center justify-center backdrop-blur-md active:rotate-180 transition-transform"
              title="Flip Camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* End Call Button */}
            <button
              onClick={onEndCall}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-colors"
              title="End Call"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* REPORT & BLOCK MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#14141c] border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-2.5 text-red-400 mb-3">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-white font-display">Report & Block User</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Blocking @{peerUsername} will immediately terminate this call and permanently prevent them from matching with you.
            </p>

            <div className="space-y-2 mb-4">
              {[
                'Harassment or Bullying',
                'Nudity or Inappropriate Content',
                'Spam / Commercial Ads',
                'Underage User',
                'Other'
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setReportReason(reason)}
                  className={`w-full py-2 px-3 text-xs font-medium rounded-lg border text-left transition-colors ${
                    reportReason === reason
                      ? 'border-[#ff2a5f] bg-[#ff2a5f]/15 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Additional details (optional)..."
              rows={2}
              className="w-full bg-[#1b1b24] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff2a5f] mb-4"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-white/10 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingReport}
                onClick={handleSubmitReport}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isSubmittingReport ? 'Reporting...' : 'Block & Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
