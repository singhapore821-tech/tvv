// WebRTC Client Service for VIBE TV

export interface WebRtcCallbacks {
  onRemoteStream: (stream: MediaStream) => void;
  onIceCandidate: (candidate: RTCIceCandidate) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
}

export class WebRtcService {
  private peerConnection: RTCPeerConnection | null = null;
  public localStream: MediaStream | null = null;
  public remoteStream: MediaStream | null = null;
  private callbacks: WebRtcCallbacks;
  public isAudioMuted: boolean = false;
  public isVideoOff: boolean = false;
  public facingMode: 'user' | 'environment' = 'user';

  private config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' }
    ]
  };

  constructor(callbacks: WebRtcCallbacks) {
    this.callbacks = callbacks;
  }

  // Request user camera and microphone
  async startLocalMedia(preferredFacingMode?: 'user' | 'environment'): Promise<MediaStream> {
    if (preferredFacingMode) {
      this.facingMode = preferredFacingMode;
    }

    // Stop existing tracks if switching camera
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.localStream = stream;

      // Apply current mute states if re-acquiring
      stream.getAudioTracks().forEach(t => { t.enabled = !this.isAudioMuted; });
      stream.getVideoTracks().forEach(t => { t.enabled = !this.isVideoOff; });

      // If peer connection exists, replace track
      if (this.peerConnection) {
        const senders = this.peerConnection.getSenders();
        const videoTrack = stream.getVideoTracks()[0];
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack);
        }
      }

      return stream;
    } catch (err) {
      console.warn('Failed to get media with preferred facing mode, falling back to basic camera/mic:', err);
      // Fallback without constraints
      const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localStream = fallbackStream;
      return fallbackStream;
    }
  }

  // Initialize RTCPeerConnection
  initPeerConnection(): RTCPeerConnection {
    this.closePeerConnection();

    const pc = new RTCPeerConnection(this.config);
    this.peerConnection = pc;

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Listen for remote track
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.callbacks.onRemoteStream(event.streams[0]);
      }
    };

    // ICE candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.callbacks.onIceCandidate(event.candidate);
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      this.callbacks.onConnectionStateChange(pc.connectionState);
    };

    return pc;
  }

  // Caller creates offer
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) this.initPeerConnection();
    const offer = await this.peerConnection!.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    await this.peerConnection!.setLocalDescription(offer);
    return offer;
  }

  // Callee receives offer and creates answer
  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) this.initPeerConnection();
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    return answer;
  }

  // Caller receives answer
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  // Add remote ICE candidate
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (this.peerConnection && this.peerConnection.remoteDescription) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  // Toggle microphone
  toggleAudio(): boolean {
    this.isAudioMuted = !this.isAudioMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isAudioMuted;
      });
    }
    return !this.isAudioMuted;
  }

  // Toggle camera
  toggleVideo(): boolean {
    this.isVideoOff = !this.isVideoOff;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !this.isVideoOff;
      });
    }
    return !this.isVideoOff;
  }

  // Flip camera (front/back)
  async flipCamera(): Promise<MediaStream> {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    return this.startLocalMedia(this.facingMode);
  }

  // Close peer connection without stopping local camera
  closePeerConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
  }

  // Stop everything completely
  destroy(): void {
    this.closePeerConnection();
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}
