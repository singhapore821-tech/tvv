/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from './types';
import { socketClient } from './services/websocket';
import { WelcomeAuth } from './components/WelcomeAuth';
import { MainScreen } from './components/MainScreen';
import { VideoChatScreen } from './components/VideoChatScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { AdminScreen } from './components/AdminScreen';
import { AndroidBlueprintModal } from './components/AndroidBlueprintModal';
import { SharePublicModal } from './components/SharePublicModal';
import { TopNavigation, BottomTabBar } from './components/Navigation';

interface ActiveMatch {
  sessionId: string;
  isInitiator: boolean;
  peerId: string;
  peerUsername: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'history' | 'profile' | 'admin'>('home');

  // Matchmaking & Session state
  const [isSearching, setIsSearching] = useState(false);
  const [activeMatch, setActiveMatch] = useState<ActiveMatch | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [queueCount, setQueueCount] = useState<number>(0);

  // Modals
  const [showAndroidHub, setShowAndroidHub] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // 1. Restore Persistent Session
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('vibetv_user');
      const savedToken = localStorage.getItem('vibetv_token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (e) {
      console.warn('Could not restore user session', e);
    }
  }, []);

  // 2. Connect WebSocket when user logs in
  useEffect(() => {
    if (!user) {
      socketClient.disconnect();
      return;
    }

    socketClient.connect(user.id, user.username);

    const unsubPresence = socketClient.on('presence_update', (data: any) => {
      if (data.onlineCount !== undefined) setOnlineCount(data.onlineCount);
      if (data.queueCount !== undefined) setQueueCount(data.queueCount);
    });

    const unsubAck = socketClient.on('auth_ack', (data: any) => {
      if (data.onlineCount !== undefined) setOnlineCount(data.onlineCount);
      if (data.queueCount !== undefined) setQueueCount(data.queueCount);
    });

    const unsubMatch = socketClient.on('match_found', (data: any) => {
      setIsSearching(false);
      setActiveMatch({
        sessionId: data.sessionId,
        isInitiator: data.isInitiator,
        peerId: data.peerId,
        peerUsername: data.peerUsername
      });
    });

    const unsubSuspended = socketClient.on('account_suspended', (data: any) => {
      alert(data.message || 'Your account was suspended.');
      handleLogout();
    });

    return () => {
      unsubPresence();
      unsubAck();
      unsubMatch();
      unsubSuspended();
    };
  }, [user]);

  const handleAuthSuccess = (authUser: User, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem('vibetv_user', JSON.stringify(authUser));
    localStorage.setItem('vibetv_token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setActiveMatch(null);
    setIsSearching(false);
    localStorage.removeItem('vibetv_user');
    localStorage.removeItem('vibetv_token');
    socketClient.disconnect();
  };

  // Matchmaking actions
  const handleStartMatch = () => {
    setIsSearching(true);
    socketClient.joinQueue();
  };

  const handleCancelMatch = () => {
    setIsSearching(false);
    socketClient.leaveQueue();
  };

  const handleEndCall = () => {
    if (activeMatch) {
      socketClient.endCall(activeMatch.sessionId, 'user_disconnected');
    }
    setActiveMatch(null);
    setIsSearching(false);
  };

  const handleSkipToNext = () => {
    if (activeMatch) {
      socketClient.endCall(activeMatch.sessionId, 'skipped');
    }
    setActiveMatch(null);
    // Immediately re-enter searching queue without closing app
    setIsSearching(true);
    socketClient.joinQueue();
  };

  // If user is not logged in: display Welcome / Auth Gate
  if (!user) {
    return <WelcomeAuth onAuthSuccess={handleAuthSuccess} />;
  }

  // If in an active video call: display Full-Screen VideoChatScreen
  if (activeMatch) {
    return (
      <VideoChatScreen
        currentUser={user}
        sessionId={activeMatch.sessionId}
        isInitiator={activeMatch.isInitiator}
        peerId={activeMatch.peerId}
        peerUsername={activeMatch.peerUsername}
        onEndCall={handleEndCall}
        onSkipToNext={handleSkipToNext}
      />
    );
  }

  // Standard Navigation Shell
  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col pb-16 md:pb-0">
      {/* Top Header */}
      <TopNavigation
        user={user}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onOpenAndroidCode={() => setShowAndroidHub(true)}
        onOpenShare={() => setShowShareModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full">
        {currentTab === 'home' && (
          <MainScreen
            user={user}
            onlineCount={onlineCount}
            queueCount={queueCount}
            isSearching={isSearching}
            onStartMatch={handleStartMatch}
            onCancelMatch={handleCancelMatch}
            onOpenAndroidCode={() => setShowAndroidHub(true)}
          />
        )}

        {currentTab === 'history' && <HistoryScreen userId={user.id} />}

        {currentTab === 'profile' && (
          <ProfileScreen
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('vibetv_user', JSON.stringify(updated));
            }}
            onLogout={handleLogout}
            onOpenAndroidCode={() => setShowAndroidHub(true)}
          />
        )}

        {currentTab === 'admin' && <AdminScreen />}
      </main>

      {/* Bottom Tab Bar for Mobile Touch Ergonomics */}
      <BottomTabBar
        user={user}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onOpenAndroidCode={() => setShowAndroidHub(true)}
      />

      {/* Modals */}
      {showAndroidHub && (
        <AndroidBlueprintModal onClose={() => setShowAndroidHub(false)} />
      )}

      {showShareModal && (
        <SharePublicModal onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
