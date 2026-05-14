import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Send, MessageSquare, X, Users } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID);
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET;

const LiveClass = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Video container ref
  const videoContainerRef = useRef(null);
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatOpen, setChatOpen] = useState(true);
  const [onlineCount, setOnlineCount] = useState(1);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const userName = user?.name || 'Guest';
  // Memoize userId so it never changes across re-renders → prevents Zego from reinitializing
  const userId = useMemo(
    () => user?._id || String(Math.floor(Math.random() * 100000)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // intentionally empty: compute once on mount
  );

  // ─── Socket.IO chat ────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('join-room', { roomId, userName });

    socket.on('chat-message', ({ sender, text, timestamp }) => {
      setMessages(prev => [...prev, { sender, text, timestamp, self: sender === userName }]);
    });

    socket.on('user-joined', ({ userName: who }) => {
      setMessages(prev => [...prev, { sender: 'System', text: `${who} joined the room`, timestamp: Date.now(), system: true }]);
      setOnlineCount(c => c + 1);
    });

    socket.on('user-left', ({ userName: who }) => {
      setMessages(prev => [...prev, { sender: 'System', text: `${who} left the room`, timestamp: Date.now(), system: true }]);
      setOnlineCount(c => Math.max(1, c - 1));
    });

    return () => {
      socket.emit('leave-room', { roomId, userName });
      socket.disconnect();
    };
  }, [roomId, userName]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── ZegoCloud video ───────────────────────────────────────────────
  useEffect(() => {
    if (!videoContainerRef.current || !ZEGO_APP_ID || !ZEGO_SERVER_SECRET) return;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      ZEGO_APP_ID,
      ZEGO_SERVER_SECRET,
      roomId,
      userId,
      userName,
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: videoContainerRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      showRoomDetailsButton: false,
      showLeaveRoomConfirmDialog: false,
      onLeaveRoom: () => navigate('/dashboard'),
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: true,
      showTextChat: false, // We use our own chat sidebar
      showUserList: false,
      maxUsers: 50,
      layout: 'Auto',
    });

    return () => {
      try { zp.destroy(); } catch (_) {}
    };
  }, [roomId, userId, userName, navigate]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !socketRef.current) return;
    const timestamp = Date.now();
    socketRef.current.emit('chat-message', { roomId, text, sender: userName, timestamp });
    // Optimistically add own message
    setMessages(prev => [...prev, { sender: userName, text, timestamp, self: true }]);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ─── No credentials warning ────────────────────────────────────────
  if (!ZEGO_APP_ID || !ZEGO_SERVER_SECRET || ZEGO_APP_ID === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 p-6">
        <div className="bg-slate-800 border border-amber-500/30 rounded-2xl p-8 max-w-lg text-center shadow-2xl">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-3">ZegoCloud Credentials Missing</h2>
          <p className="text-slate-400 mb-4 text-sm leading-relaxed">
            Add your <span className="text-amber-400 font-semibold">VITE_ZEGO_APP_ID</span> and{' '}
            <span className="text-amber-400 font-semibold">VITE_ZEGO_SERVER_SECRET</span> to{' '}
            <code className="bg-slate-700 px-2 py-0.5 rounded text-xs text-white">frontend/.env</code>
            <br /><br />
            Get free credentials at{' '}
            <a href="https://console.zegocloud.com" target="_blank" rel="noreferrer"
              className="text-emerald-400 underline">console.zegocloud.com</a>
          </p>
          <Link to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* ── Back button ─────────────────────────────────────── */}
      <Link to="/dashboard"
        className="absolute top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 backdrop-blur text-white text-sm font-medium border border-slate-700 hover:bg-slate-700 transition rounded-lg shadow-lg">
        <ArrowLeft size={14} /> Dashboard
      </Link>

      {/* ── Toggle chat button (mobile / collapsed) ─────────── */}
      <button
        onClick={() => setChatOpen(o => !o)}
        className="absolute top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 backdrop-blur text-white text-sm font-medium border border-slate-700 hover:bg-slate-700 transition rounded-lg shadow-lg">
        {chatOpen ? <X size={14} /> : <MessageSquare size={14} />}
        {chatOpen ? 'Hide Chat' : 'Chat'}
      </button>

      {/* ── Video panel ─────────────────────────────────────── */}
      <div
        className="flex-1 h-full transition-all duration-300"
        style={{ width: chatOpen ? 'calc(100% - 320px)' : '100%' }}
      >
        <div ref={videoContainerRef} className="w-full h-full" />
      </div>

      {/* ── Chat sidebar ──────────────────────────────────────── */}
      {chatOpen && (
        <div className="w-80 flex-shrink-0 h-full flex flex-col bg-slate-800 border-l border-slate-700">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/90">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-400" />
              <span className="text-white font-semibold text-sm">Live Chat</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Users size={13} />
              <span>{onlineCount} online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-600">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 text-xs mt-8">
                <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
                No messages yet. Say hi! 👋
              </div>
            )}
            {messages.map((msg, i) => {
              if (msg.system) {
                return (
                  <div key={i} className="text-center text-xs text-slate-500 py-0.5">
                    {msg.text}
                  </div>
                );
              }
              return (
                <div key={i} className={`flex flex-col ${msg.self ? 'items-end' : 'items-start'}`}>
                  {!msg.self && (
                    <span className="text-xs text-emerald-400 font-semibold mb-0.5 ml-1">{msg.sender}</span>
                  )}
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-snug break-words ${
                    msg.self
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-slate-700 text-slate-100 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 mx-1">{formatTime(msg.timestamp)}</span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-700 bg-slate-800">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                className="flex-1 bg-slate-700 text-white text-sm rounded-xl px-3 py-2.5 resize-none outline-none border border-slate-600 focus:border-emerald-500 transition placeholder-slate-400 leading-snug"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="flex-shrink-0 w-9 h-9 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition shadow">
                <Send size={15} />
              </button>
            </div>
            <p className="text-slate-500 text-[10px] mt-1.5 ml-1">Enter to send · Shift+Enter for newline</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClass;
