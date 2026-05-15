import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import {
  Send, MessageSquare, X, Users,
  PhoneOff, Settings, Info, Maximize
} from 'lucide-react';

// ─── ENV VARS ────────────────────────────────────────────────────────────────
// Make sure your .env file has these (restart dev server after editing .env):
//   VITE_SOCKET_URL=http://localhost:5000
//   VITE_ZEGO_APP_ID=357770097
//   VITE_ZEGO_SERVER_SECRET=your_secret_here

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID);
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET;

const LiveClass = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Refs
  const zpRef = useRef(null);
  const videoContainerRef = useRef(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const zegoInitialized = useRef(false); // FIX: prevent double-init in React StrictMode

  // State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // FIX: Sanitize userId — Zego requires alphanumeric strings only (no special chars)
  const userId = useMemo(() => {
    const raw = user?._id || String(Math.floor(Math.random() * 100000));
    // Strip any non-alphanumeric characters (MongoDB ObjectIds are hex, so this is safe)
    return String(raw).replace(/[^a-zA-Z0-9]/g, '').slice(0, 36);
  }, [user?._id]);

  const userName = String(user?.name || 'Guest').slice(0, 20);

  // ─── Socket.IO ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.emit('join-room', { roomId, userName });

    socket.on('chat-message', ({ sender, text, timestamp }) => {
      setMessages(prev => [...prev, { sender, text, timestamp, self: false }]);
      // Increment unread if chat is closed
      setChatOpen(open => {
        if (!open) setUnreadCount(c => c + 1);
        return open;
      });
    });

    socket.on('user-joined', ({ userName: who }) => {
      setMessages(prev => [...prev, {
        sender: 'System',
        text: `${who} joined the room`,
        timestamp: Date.now(),
        system: true,
      }]);
      setOnlineCount(c => c + 1);
    });

    socket.on('user-left', ({ userName: who }) => {
      setMessages(prev => [...prev, {
        sender: 'System',
        text: `${who} left the room`,
        timestamp: Date.now(),
        system: true,
      }]);
      setOnlineCount(c => Math.max(1, c - 1));
    });

    socket.on('meeting-ended', () => {
      navigate('/dashboard');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
      // Non-fatal: chat won't work but video can still work
    });

    return () => {
      socket.emit('leave-room', { roomId, userName });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, userName, navigate]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset unread on open
  useEffect(() => {
    if (chatOpen) setUnreadCount(0);
  }, [chatOpen]);

  // ─── ZegoCloud Video ──────────────────────────────────────────────────────
  useEffect(() => {
    // FIX 1: Validate all required values before attempting init
    if (!videoContainerRef.current) {
      console.warn('Zego: container ref not ready');
      return;
    }
    if (!ZEGO_APP_ID || isNaN(ZEGO_APP_ID)) {
      console.error('Zego: VITE_ZEGO_APP_ID is missing or not a number. Check your .env file.');
      setError('Video configuration error: App ID is missing. Contact support.');
      return;
    }
    if (!ZEGO_SERVER_SECRET) {
      console.error('Zego: VITE_ZEGO_SERVER_SECRET is missing. Check your .env file.');
      setError('Video configuration error: Server secret is missing. Contact support.');
      return;
    }
    if (!user) {
      // User not loaded yet — effect will re-run when user arrives
      console.log('Zego: waiting for user...');
      return;
    }
    if (!roomId) {
      console.error('Zego: roomId is missing from URL params.');
      setError('Invalid room link. Please go back and try again.');
      return;
    }

    // FIX 2: Prevent double-init (React StrictMode runs effects twice in dev)
    if (zegoInitialized.current) return;
    zegoInitialized.current = true;

    const initZego = async () => {
      try {
        console.log('=== Zego Init ===');
        console.log('appId:', ZEGO_APP_ID);
        console.log('roomId:', roomId);
        console.log('userId:', userId);
        console.log('userName:', userName);
        console.log('container:', videoContainerRef.current);

        // FIX 3: generateKitTokenForTest is for dev only.
        // For production, generate token on your backend and use generateKitTokenForProduction instead.
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          ZEGO_APP_ID,
          ZEGO_SERVER_SECRET,
          String(roomId),   // must be string
          String(userId),   // must be string, alphanumeric
          String(userName), // must be string
        );

        if (!kitToken) {
          throw new Error('Token generation returned null/undefined. Check appId and serverSecret.');
        }
        console.log('Token generated successfully');

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        if (!zp) {
          throw new Error('ZegoUIKitPrebuilt.create() returned null. The token may be invalid.');
        }
        zpRef.current = zp;
        console.log('Zego instance created');

        // FIX 4: joinRoom doesn't return a promise in all SDK versions — wrap in try/catch only
        zp.joinRoom({
          container: videoContainerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          showPreJoinView: false,           // FIX: skip the pre-join camera preview screen
          showRoomDetailsButton: false,
          showLeaveRoomConfirmDialog: false,
          onJoinRoom: () => {
            console.log('Successfully joined Zego room');
            setIsJoined(true);
          },
          onLeaveRoom: () => {
            console.log('Left Zego room');
            navigate('/dashboard');
          },
          onError: (err) => {
            console.error('Zego room error:', err);
            setError('Video error: ' + (err?.message || 'Unknown error. Please reload.'));
          },
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: false,   // we use our own chat sidebar
          showUserList: false,
          showNonVideoUser: true,
          maxUsers: 50,
          layout: 'Grid',
          showLayoutButton: true,
        });

        // FIX 5: Set joined optimistically since onJoinRoom may not fire in all SDK versions
        setTimeout(() => {
          if (!isJoined) setIsJoined(true);
        }, 3000);

      } catch (err) {
        console.error('Zego initialization failed:', err);
        zegoInitialized.current = false; // allow retry
        setError(
          'Failed to connect to video server. ' +
          'Check your internet connection and camera/microphone permissions. ' +
          'Error: ' + (err?.message || 'Unknown')
        );
      }
    };

    initZego();

    return () => {
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
          console.log('Zego instance destroyed');
        } catch (_) {}
        zpRef.current = null;
      }
      zegoInitialized.current = false;
    };
  }, [roomId, userId, userName, user, navigate]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !socketRef.current) return;
    const timestamp = Date.now();
    socketRef.current.emit('chat-message', { roomId, text, sender: userName, timestamp });
    setMessages(prev => [...prev, { sender: userName, text, timestamp, self: true }]);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endSession = () => {
    if (window.confirm('End this session for everyone?')) {
      socketRef.current?.emit('end-meeting', { roomId });
      navigate('/dashboard');
    }
  };

  const leaveSession = () => {
    if (window.confirm('Leave the room?')) {
      navigate('/dashboard');
    }
  };

  // ─── Error Screen ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 p-6 text-white font-sans">
        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-10 max-w-lg text-center shadow-2xl">
          <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">⚠️</div>
          <h2 className="text-3xl font-bold mb-4">Connection Failed</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { setError(null); zegoInitialized.current = false; window.location.reload(); }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition"
            >
              Try Again
            </button>
            <Link to="/dashboard" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition text-slate-300">
              Exit
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden text-white font-sans relative">

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col relative h-full">

        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-40 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-4 py-2 rounded-2xl flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="font-semibold text-sm truncate max-w-[200px]">Live: {roomId}</span>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-3 py-2 rounded-2xl flex items-center gap-2 text-xs text-slate-300 font-medium">
              <Users size={14} className="text-emerald-400" />
              <span>{onlineCount} Online</span>
            </div>
          </div>
        </div>

        {/* Video Stage */}
        <div className="flex-1 bg-black relative">
          {/* Loading overlay — shown until Zego fires onJoinRoom */}
          {!isJoined && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20 pointer-events-none">
              <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-medium animate-pulse">Connecting to room…</p>
              <p className="text-slate-600 text-xs mt-2">Allow camera & microphone when prompted</p>
            </div>
          )}
          {/* FIX: Container must have explicit dimensions for Zego to render video tiles */}
          <div
            ref={videoContainerRef}
            id="zego-container"
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          />
        </div>

        {/* Bottom Controls Bar */}
        <div className="h-24 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between px-8 z-50 flex-shrink-0">
          <div className="flex items-center gap-2 w-1/3">
            <span className="text-sm font-medium text-slate-400">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {roomId}
            </span>
          </div>

          <div className="flex items-center gap-4 w-1/3 justify-center">
            {/* Chat Toggle with unread badge */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-4 rounded-full transition relative ${chatOpen ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
            >
              <MessageSquare size={22} />
              {unreadCount > 0 && !chatOpen && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 rounded-full border-2 border-[#0a0a0a] text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Leave / End button */}
            {user?.role === 'mentor' ? (
              <button
                onClick={endSession}
                className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full transition flex items-center gap-2 shadow-lg shadow-rose-900/20"
              >
                <PhoneOff size={20} /> End for all
              </button>
            ) : (
              <button
                onClick={leaveSession}
                className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full transition flex items-center gap-2 shadow-lg shadow-rose-900/20"
              >
                <PhoneOff size={20} /> Leave
              </button>
            )}

            <button className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition">
              <Settings size={22} />
            </button>
          </div>

          <div className="w-1/3 flex justify-end gap-3 text-slate-400">
            <button className="p-3 hover:bg-white/5 rounded-xl transition"><Info size={20} /></button>
            <button
              onClick={() => document.documentElement.requestFullscreen?.()}
              className="p-3 hover:bg-white/5 rounded-xl transition"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Chat Sidebar ── */}
      {chatOpen && (
        <div className="w-[380px] h-full flex flex-col bg-slate-900 border-l border-white/5 shadow-2xl z-[60]"
          style={{ animation: 'slideIn 0.25s ease' }}
        >
          <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

          {/* Chat Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="text-emerald-400" size={24} /> In-call messages
            </h3>
            <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            <p className="bg-slate-800/50 p-4 rounded-2xl text-[11px] text-slate-400 text-center leading-relaxed italic border border-white/5">
              Messages are only visible to people in the call and are deleted when the call ends.
            </p>

            {messages.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center text-slate-600 opacity-50">
                <MessageSquare size={40} className="mb-3" />
                <p className="text-sm font-medium">No messages yet</p>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.system) return (
                <div key={i} className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold py-2 border-y border-white/5">
                  {msg.text}
                </div>
              );
              return (
                <div key={i} className={`flex flex-col ${msg.self ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-400">{msg.self ? 'You' : msg.sender}</span>
                    <span className="text-[10px] text-slate-600">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[90%] ${
                    msg.self
                      ? 'bg-emerald-600 text-white rounded-tr-sm'
                      : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-white/5 flex-shrink-0">
            <div className="flex items-center gap-3 bg-slate-800 rounded-2xl px-4 py-2 border border-white/5 focus-within:border-emerald-500/50 transition">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message…"
                className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-white placeholder-slate-500"
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClass;