import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowLeft, Send, MessageSquare, X, Users, 
  Mic, MicOff, Video, VideoOff, ScreenShare, 
  PhoneOff, Settings, Info, Maximize 
} from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID);
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET;

const LiveClass = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Zego Instance Ref
  const zpRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const userName = String(user?.name || 'Guest');
  const userId = useMemo(
    () => String(user?._id || Math.floor(Math.random() * 100000)),
    [user?._id]
  );

  // ─── Socket.IO chat ────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('join-room', { roomId, userName });

    socket.on('chat-message', ({ sender, text, timestamp }) => {
      setMessages(prev => [...prev, { sender, text, timestamp, self: false }]);
    });

    socket.on('user-joined', ({ userName: who }) => {
      setMessages(prev => [...prev, { sender: 'System', text: `${who} joined the room`, timestamp: Date.now(), system: true }]);
      setOnlineCount(c => c + 1);
    });

    socket.on('user-left', ({ userName: who }) => {
      setMessages(prev => [...prev, { sender: 'System', text: `${who} left the room`, timestamp: Date.now(), system: true }]);
      setOnlineCount(c => Math.max(1, c - 1));
    });

    socket.on('meeting-ended', () => {
      navigate('/dashboard');
    });

    return () => {
      socket.emit('leave-room', { roomId, userName });
      socket.disconnect();
    };
  }, [roomId, userName, navigate]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── ZegoCloud video ───────────────────────────────────────────────
  useEffect(() => {
    if (!videoContainerRef.current || !ZEGO_APP_ID || !ZEGO_SERVER_SECRET || !user) return;

    const initZego = async () => {
      try {
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          ZEGO_APP_ID,
          ZEGO_SERVER_SECRET,
          roomId,
          userId,
          userName,
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        await zp.joinRoom({
          container: videoContainerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          showRoomDetailsButton: false,
          showLeaveRoomConfirmDialog: false,
          onLeaveRoom: () => navigate('/dashboard'),
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          showMyCameraToggleButton: false, // We'll use our own UI if possible, or Zego's internal.
          showMyMicrophoneToggleButton: false, // Default UI can be messy, Zego UIKit is usually better with showNonVideoUser: true
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: false, 
          showUserList: false,
          maxUsers: 50,
          layout: 'Auto',
        });
        
        setIsJoined(true);
      } catch (err) {
        console.error('Zego initialization failed:', err);
        setError('Failed to connect to video server. Please check your internet and camera permissions.');
      }
    };

    initZego();

    return () => {
      if (zpRef.current) {
        try { zpRef.current.destroy(); } catch (_) {}
      }
    };
  }, [roomId, userId, userName, user, navigate]);

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
      socketRef.current.emit('end-meeting', { roomId });
    }
  };

  const leaveSession = () => {
    if (window.confirm('Leave the room?')) {
      navigate('/dashboard');
    }
  };

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 p-6 text-white font-sans">
        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-10 max-w-lg text-center shadow-2xl">
          <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">⚠️</div>
          <h2 className="text-3xl font-bold mb-4">Connection Failed</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">{error}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition">Try Again</button>
            <Link to="/dashboard" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition text-slate-300">Exit</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden text-white font-sans relative">
      
      {/* ── Main Content Area ──────────────────────────────── */}
      <div className="flex-1 flex flex-col relative h-full">
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-40 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-4">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-4 py-2 rounded-2xl flex items-center gap-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="font-semibold text-sm truncate max-w-[200px]">Live Session: {roomId}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-3 py-2 rounded-2xl flex items-center gap-2 text-xs text-slate-300 font-medium">
                <Users size={14} className="text-emerald-400" />
                <span>{onlineCount} Participating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Stage */}
        <div className="flex-1 bg-black relative">
          {!isJoined && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20">
              <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-medium animate-pulse">Entering the meeting...</p>
            </div>
          )}
          <div ref={videoContainerRef} className="w-full h-full" id="zego-container" />
        </div>

        {/* Google Meet Bottom Logic / Controls Bar */}
        <div className="h-24 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between px-8 z-50">
          <div className="flex items-center gap-2 w-1/3">
             <span className="text-sm font-medium text-slate-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {roomId}</span>
          </div>

          <div className="flex items-center gap-4 w-1/3 justify-center">
            {/* The actual hardware controls are inside Zego, but we add these for Meet aesthetic or custom logic */}
            {/* If we want real custom controls, we'd need to use Zego SDK instead of UIKit. 
                For now, we add the Leave/End buttons that are clear and visible. */}
             
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-4 rounded-full transition relative ${chatOpen ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
              <MessageSquare size={22} />
              {messages.length > onlineCount && !chatOpen && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#0a0a0a]"></span>
              )}
            </button>

            {user?.role === 'mentor' ? (
              <button onClick={endSession} className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full transition flex items-center gap-2 shadow-lg shadow-rose-900/20">
                <PhoneOff size={20} /> End for all
              </button>
            ) : (
              <button onClick={leaveSession} className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full transition flex items-center gap-2 shadow-lg shadow-rose-900/20">
                <PhoneOff size={20} /> Leave
              </button>
            )}

            <button className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition">
              <Settings size={22} />
            </button>
          </div>

          <div className="w-1/3 flex justify-end gap-3 text-slate-400">
             <button className="p-3 hover:bg-white/5 rounded-xl transition"><Info size={20}/></button>
             <button className="p-3 hover:bg-white/5 rounded-xl transition"><Maximize size={20}/></button>
          </div>
        </div>
      </div>

      {/* ── Chat Sidebar (Overlaid or Pushed) ────────────────── */}
      {chatOpen && (
        <div className="w-[380px] h-full flex flex-col bg-slate-900 border-l border-white/5 shadow-2xl z-[60] animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="text-emerald-400" size={24} /> In-call messages
            </h3>
            <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
            <p className="bg-slate-800/50 p-4 rounded-2xl text-[11px] text-slate-400 text-center leading-relaxed italic border border-white/5">
              Messages can only be seen by people in the call when the message is sent. They are deleted when the call ends.
            </p>
            
            {messages.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-slate-600 opacity-50">
                <MessageSquare size={48} className="mb-4" />
                <p className="text-sm font-medium">No messages yet</p>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.system) return (
                <div key={i} className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold py-2 border-y border-white/5 my-2">{msg.text}</div>
              );
              return (
                <div key={i} className={`flex flex-col ${msg.self ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-400">{msg.sender}</span>
                    <span className="text-[10px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[90%] shadow-sm ${
                    msg.self ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-slate-900 border-t border-white/5">
            <div className="flex items-center gap-3 bg-slate-800 rounded-2xl px-4 py-2 border border-white/5 group focus-within:border-emerald-500/50 transition">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message"
                className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-white placeholder-slate-500"
              />
              <button 
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition shadow-lg shadow-emerald-900/20">
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
