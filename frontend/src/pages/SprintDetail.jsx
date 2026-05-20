import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  ArrowLeft, Paperclip, Link as LinkIcon, Send,
  Lightbulb, FileText, X, Reply, CornerUpRight,
  MessageSquare, ChevronDown
} from 'lucide-react';

// ─── Quote Block ─────────────────────────────────────────────────────────────
const QuoteBlock = ({ replyTo, feed, isMentor }) => {
  const original = feed?.find(m => m._id === replyTo);
  if (!original) return null;

  const scrollToOriginal = () => {
    const el = document.getElementById(`msg-${replyTo}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const isDoubtReply = original.isDoubt;
  const borderClass = isMentor
    ? 'border-l-[3px] border-terracotta shadow-[0_0_12px_rgba(154,52,18,0.25)]'
    : 'border-l-[3px] border-dashed border-slate';

  return (
    <button
      onClick={scrollToOriginal}
      className={`w-full text-left px-3 py-2 mb-3 rounded-xl bg-bone/60 ${borderClass} transition hover:bg-gold/10 group`}
    >
      <p className="text-[11px] font-bold text-terracotta mb-0.5 flex items-center gap-1">
        <CornerUpRight size={11} /> {original.user?.name || 'Unknown'}
      </p>
      <p className="text-xs text-slate/70 line-clamp-2 leading-relaxed">
        {original.text || (original.fileUrl ? '📎 Attachment' : original.linkUrl ? '🔗 Link' : '…')}
      </p>
    </button>
  );
};

// ─── Swipeable Message Row ─────────────────────────────────────────────────
const SWIPE_THRESHOLD = 60;

const SwipeableMessage = ({ children, onSwipe }) => {
  const x = useMotionValue(0);
  const iconOpacity = useTransform(x, [0, SWIPE_THRESHOLD * 0.6, SWIPE_THRESHOLD], [0, 0.5, 1]);
  const iconScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.5, 1]);
  const bgOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 0.15]);

  const handleDragEnd = () => {
    if (x.get() >= SWIPE_THRESHOLD) {
      onSwipe();
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem]">
      {/* Swipe indicator background */}
      <motion.div
        className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
        style={{ opacity: bgOpacity }}
      >
        <motion.div
          style={{ opacity: iconOpacity, scale: iconScale }}
          className="p-2 bg-terracotta/20 rounded-full"
        >
          <Reply size={18} className="text-terracotta" />
        </motion.div>
      </motion.div>

      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: SWIPE_THRESHOLD + 10 }}
        dragElastic={{ left: 0, right: 0.3 }}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const SprintDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const [sprint, setSprint] = useState(null);

  // Drawer state
  const [isBriefOpen, setIsBriefOpen] = useState(false);

  // Input state
  const [text, setText] = useState('');
  const [isDoubt, setIsDoubt] = useState(false);
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [loading, setLoading] = useState(false);

  // WhatsApp Reply state
  const [replyingTo, setReplyingTo] = useState(null); // { _id, user, text, fileUrl, linkUrl }

  const endOfFeedRef = useRef(null);
  const inputRef = useRef(null);
  const isMentor = user?.role === 'mentor';

  useEffect(() => { fetchSprint(); }, [id]);

  useEffect(() => {
    endOfFeedRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sprint?.feed]);

  const fetchSprint = async () => {
    try {
      const res = await api.get(`/assignments/${id}`);
      const fetchedSprint = res.data.assignment;

      // --- DUMMY DATA FOR TESTING ---
      const dummyMessages = [
        {
          _id: 'dummy-1',
          user: { _id: 'student-1', name: 'Alice (Student)', role: 'student' },
          text: "I'm having trouble with the mesh gradient animation. It seems to jitter on mobile? ❓",
          isDoubt: true,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: 'dummy-2',
          user: { _id: '65f8a2e4b8a1c92d5e3f4a02', name: 'Demo Mentor', role: 'mentor' },
          text: "That's a common issue with high-density gradients. Try adding will-change: transform to the animated layer. I've updated the App.css to optimize it!",
          replyTo: 'dummy-1',
          isDoubt: false,
          createdAt: new Date(Date.now() - 3000000).toISOString()
        },
        {
          _id: 'dummy-3',
          user: { _id: 'student-2', name: 'Bob (Student)', role: 'student' },
          text: "I also noticed that using 'background-attachment: fixed' can cause some lag on Safari mobile.",
          replyTo: 'dummy-1',
          isDoubt: false,
          createdAt: new Date(Date.now() - 2400000).toISOString()
        },
        {
          _id: 'dummy-4',
          user: { _id: '65f8a2e4b8a1c92d5e3f4a01', name: 'Demo Student', role: 'student' },
          text: "Just shared my progress on the layout. Let me know what you guys think!",
          fileUrl: "https://example.com/layout-preview.pdf",
          isDoubt: false,
          createdAt: new Date(Date.now() - 1800000).toISOString()
        },
        {
          _id: 'dummy-5',
          user: { _id: 'student-3', name: 'Charlie (Student)', role: 'student' },
          text: "Found this great article on glassmorphism accessibility:",
          linkUrl: "https://uxdesign.cc/glassmorphism-in-user-interfaces-1f51a34a57",
          isDoubt: false,
          createdAt: new Date(Date.now() - 1200000).toISOString()
        }
      ];

      // Merge dummy data with actual feed (if empty or for testing)
      if (!fetchedSprint.feed || fetchedSprint.feed.length === 0) {
        fetchedSprint.feed = dummyMessages;
      } else {
        // Option: Prepend dummy messages for testing
        // fetchedSprint.feed = [...dummyMessages, ...fetchedSprint.feed];
      }
      // ------------------------------

      setSprint(fetchedSprint);
    } catch (err) { console.error(err); }
  };

  const handleReply = useCallback((msg) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  }, []);

  const cancelReply = () => setReplyingTo(null);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text && !file && !linkUrl) return addToast('Message cannot be empty!', 'error');

    setLoading(true);
    const formData = new FormData();
    if (text) formData.append('text', text);
    if (linkUrl) formData.append('linkUrl', linkUrl);
    formData.append('isDoubt', isDoubt);
    if (file) formData.append('file', file);
    if (replyingTo?._id) formData.append('replyTo', replyingTo._id);

    try {
      await api.post(`/assignments/${id}/feed`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setText(''); setFile(null); setLinkUrl('');
      setIsDoubt(false); setShowLinkInput(false); setReplyingTo(null);
      fetchSprint();
    } catch (err) { addToast('Failed to post message', 'error'); }
    finally { setLoading(false); }
  };

  const handleToggleDoubt = async (messageId) => {
    try {
      await api.put(`/assignments/${id}/feed/${messageId}/doubt`);
      fetchSprint();
    } catch (err) { addToast('Failed to toggle doubt', 'error'); }
  };

  if (!sprint) return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-gold/20 border-t-terracotta rounded-full animate-spin shadow-warm-sm" />
        <p className="text-slate/70 font-bold animate-pulse">Loading Sprint...</p>
      </div>
    </div>
  );

  const feed = sprint.feed || [];

  return (
    <div className="flex flex-col h-screen bg-transparent overflow-hidden">

      {/* ── Persistent Context Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-terracotta/10 px-4 md:px-6 py-3 flex items-center justify-between shadow-warm-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/assignments"
            className="p-2 bg-white/80 rounded-full text-slate hover:text-terracotta transition border border-terracotta/10 shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-deep-charcoal leading-tight line-clamp-1">{sprint.title}</h2>
            <p className="text-[11px] font-semibold text-deep-charcoal/50 uppercase tracking-widest">Sprint Feed</p>
          </div>
        </div>
        <button
          onClick={() => setIsBriefOpen(true)}
          className="px-4 py-2 bg-white/80 text-terracotta font-bold rounded-full border border-terracotta/10 shadow-sm hover:bg-gold/10 transition active:scale-95 text-sm shrink-0 backdrop-blur-sm"
        >
          View Brief
        </button>
      </header>

      {/* ── Brief Bottom Sheet (Mobile) / Slide-in Panel (Desktop) ─────── */}
      <AnimatePresence>
        {isBriefOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBriefOpen(false)}
              className="fixed inset-0 z-50 bg-slate/20 backdrop-blur-sm"
            />
            {/* Desktop: slide-in right panel */}
            <motion.div
              key="brief-panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 35 }}
              className="hidden md:flex fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-white/90 backdrop-blur-3xl border-l border-terracotta/10 shadow-warm-deep flex-col"
            >
              <div className="p-5 border-b border-terracotta/10 flex justify-between items-center bg-bone/50">
                <h3 className="font-bold text-slate text-lg">Sprint Brief</h3>
                <button onClick={() => setIsBriefOpen(false)} className="p-2 bg-white rounded-full text-slate hover:text-terracotta shadow-sm border border-terracotta/5 active:scale-95">
                  <X size={18} />
                </button>
              </div>
              <BriefContent sprint={sprint} />
            </motion.div>

            {/* Mobile: bottom sheet */}
            <motion.div
              key="brief-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 35 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-3xl border-t border-terracotta/10 rounded-t-[2rem] shadow-warm-deep flex flex-col max-h-[85vh]"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate/20" />
              </div>
              <div className="px-5 py-3 border-b border-terracotta/10 flex justify-between items-center">
                <h3 className="font-bold text-slate text-base">Sprint Brief</h3>
                <button onClick={() => setIsBriefOpen(false)} className="p-1.5 bg-bone rounded-full text-slate hover:text-terracotta active:scale-95">
                  <ChevronDown size={18} />
                </button>
              </div>
              <BriefContent sprint={sprint} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Chat Stream ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 lg:px-10 py-6 space-y-5 pb-[160px] md:pb-36">
        {feed.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-deep-charcoal/40 space-y-4 pt-20">
            <MessageSquare size={48} strokeWidth={1} />
            <p className="text-lg font-bold">No activity yet. Start the sprint!</p>
          </div>
        )}

        {feed.map((msg, idx) => {
          const isSelf = msg.user?._id === user._id || msg.user === user._id;
          const senderIsMentor = msg.user?.role === 'mentor';
          const hasReply = !!msg.replyTo;

          // Border style for replied doubt messages
          let replyBorderClass = '';
          if (hasReply) {
            const orig = feed.find(m => m._id === msg.replyTo);
            if (orig?.isDoubt) {
              replyBorderClass = senderIsMentor
                ? 'border-2 border-solid border-terracotta shadow-[0_0_18px_rgba(154,52,18,0.2)]'
                : 'border-2 border-dashed border-slate/60';
            }
          }

          return (
            <div key={msg._id || idx} id={`msg-${msg._id}`} className={`flex w-full ${isSelf ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] md:max-w-[72%] lg:max-w-[62%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>

                {/* Name Tag */}
                <div className="mb-1 px-2 flex items-center gap-1.5">
                  <span className="text-sm font-bold text-deep-charcoal">{msg.user?.name}</span>
                  {msg.user?.role && (
                    <span className="text-[9px] font-bold text-terracotta uppercase tracking-wider bg-terracotta/10 px-1.5 py-0.5 rounded-md">
                      {msg.user.role}
                    </span>
                  )}
                </div>

                {/* Swipe-to-Reply (Mobile only) */}
                <SwipeableMessage onSwipe={() => handleReply(msg)}>
                  {/* Bubble */}
                  <div
                    className={`relative group p-4 md:p-5 backdrop-blur-2xl transition-all
                      ${msg.isDoubt
                        ? 'bg-gold/40 border border-gold shadow-[0_0_20px_rgba(253,230,138,0.4)] rounded-[2rem]'
                        : `bg-white/95 border border-terracotta/15 shadow-warm-sm ${isSelf ? 'rounded-[2rem] rounded-tr-md' : 'rounded-[2rem] rounded-tl-md'}`
                      }
                      ${replyBorderClass}
                    `}
                  >
                    {/* Quote Block */}
                    {hasReply && (
                      <QuoteBlock
                        replyTo={msg.replyTo}
                        feed={feed}
                        isMentor={senderIsMentor}
                      />
                    )}

                    {/* Doubt Header */}
                    {msg.isDoubt && (
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="bg-white/80 text-terracotta text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-gold/30">
                          ❓ Critical Doubt
                        </span>
                        {(isSelf || isMentor) && (
                          <button
                            onClick={() => handleToggleDoubt(msg._id)}
                            className="text-terracotta hover:text-slate transition text-xs font-bold bg-white/60 px-2.5 py-1 rounded-lg border border-terracotta/10"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    )}

                    {/* Message Text */}
                    {msg.text && (
                      <p className={`text-base leading-relaxed whitespace-pre-wrap ${msg.isDoubt ? 'text-deep-brown' : 'text-deep-charcoal'}`}>
                        {msg.text}
                      </p>
                    )}

                    {/* Attachments */}
                    {(msg.fileUrl || msg.linkUrl) && (
                      <div className={`mt-3 space-y-2 ${msg.text ? 'pt-3 border-t border-slate/10' : ''}`}>
                        {msg.fileUrl && (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-3 rounded-xl transition text-sm font-semibold
                              ${msg.isDoubt ? 'bg-white/60 hover:bg-white text-terracotta' : 'bg-bone hover:bg-gold/20 text-slate'}
                              border border-transparent hover:border-terracotta/10`}
                          >
                            <FileText size={15} /> Attached Asset
                          </a>
                        )}
                        {msg.linkUrl && (
                          <a
                            href={msg.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-3 rounded-xl transition text-sm font-semibold break-all
                              ${msg.isDoubt ? 'bg-white/60 hover:bg-white text-terracotta' : 'bg-bone hover:bg-gold/20 text-slate'}
                              border border-transparent hover:border-terracotta/10`}
                          >
                            <LinkIcon size={15} /> {msg.linkUrl}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Hover Action Tray (Desktop) */}
                    <div className={`absolute top-1/2 -translate-y-1/2 ${isSelf ? '-left-14' : '-right-14'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1.5 hidden md:flex`}>
                      <button
                        onClick={() => handleReply(msg)}
                        title="Reply"
                        className="p-2 bg-white rounded-full text-slate/40 hover:text-terracotta shadow-sm border border-terracotta/5 hover:bg-bone transition active:scale-95"
                      >
                        <Reply size={15} />
                      </button>
                      {!msg.isDoubt && (isSelf || isMentor) && (
                        <button
                          onClick={() => handleToggleDoubt(msg._id)}
                          title="Mark as Doubt"
                          className="p-2 bg-white rounded-full text-slate/40 hover:text-gold shadow-sm border border-terracotta/5 hover:bg-bone transition active:scale-95"
                        >
                          <Lightbulb size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </SwipeableMessage>

                {/* Timestamp */}
                <span className="text-[10px] font-semibold text-deep-charcoal/40 mt-1 px-2">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={endOfFeedRef} />
      </div>

      {/* ── Input Dock ───────────────────────────────────────────────────── */}
      {/* On mobile, sits above the bottom pill bar (bottom-[80px]); on desktop, bottom-6 */}
      <div className="fixed bottom-[80px] md:bottom-6 inset-x-3 md:inset-x-6 lg:left-[calc(theme(spacing.80)+1.5rem)] z-30 flex flex-col gap-2">

        {/* Reply Preview Bar */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              key="reply-preview"
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex items-center gap-3 px-4 py-2.5 bg-white/80 backdrop-blur-2xl rounded-[1.5rem] border border-terracotta/15 shadow-warm-sm"
            >
              <CornerUpRight size={15} className="text-terracotta shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-terracotta">
                  Replying to {replyingTo.user?.name}
                </p>
                <p className="text-xs text-slate/60 truncate leading-relaxed">
                  {replyingTo.text || (replyingTo.fileUrl ? '📎 Attachment' : replyingTo.linkUrl ? '🔗 Link' : '…')}
                </p>
              </div>
              <button
                onClick={cancelReply}
                className="p-1 rounded-full text-slate/40 hover:text-terracotta hover:bg-bone transition shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Link Input */}
        <AnimatePresence>
          {showLinkInput && (
            <motion.div
              key="link-input"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-2xl rounded-[1.5rem] border border-terracotta/10 shadow-warm-sm"
            >
              <LinkIcon size={15} className="text-slate/40" />
              <input
                type="url"
                placeholder="https://..."
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-slate placeholder:text-slate/40"
              />
              <button onClick={() => { setShowLinkInput(false); setLinkUrl(''); }} className="text-slate/40 hover:text-terracotta">
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Preview */}
        <AnimatePresence>
          {file && (
            <motion.div
              key="file-preview"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-2xl rounded-[1.5rem] border border-terracotta/10 shadow-warm-sm"
            >
              <Paperclip size={15} className="text-slate/40" />
              <span className="flex-1 text-sm text-slate font-medium truncate">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-slate/40 hover:text-terracotta"><X size={15} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input Row */}
        <div className="bg-white/80 backdrop-blur-3xl px-3 py-2.5 rounded-[2rem] shadow-warm-deep border border-terracotta/10">
          <form onSubmit={handlePost} className="flex items-center gap-2">
            {/* Tool buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <label className="p-2.5 bg-bone rounded-full text-slate/50 hover:text-terracotta hover:bg-gold/20 transition cursor-pointer active:scale-95">
                <Paperclip size={18} />
                <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
              </label>
              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className={`p-2.5 rounded-full transition active:scale-95 ${showLinkInput ? 'bg-terracotta text-white' : 'bg-bone text-slate/50 hover:text-terracotta hover:bg-gold/20'}`}
              >
                <LinkIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsDoubt(!isDoubt)}
                title="Mark as Doubt"
                className={`p-2.5 rounded-full transition active:scale-95 ${isDoubt ? 'bg-gold text-terracotta shadow-sm border border-gold/50' : 'bg-bone text-slate/50 hover:text-gold hover:bg-gold/10'}`}
              >
                <Lightbulb size={18} />
              </button>
            </div>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              placeholder={isDoubt ? 'Post your doubt…' : 'Share an insight, question, or file…'}
              className="flex-1 bg-bone px-4 py-3 rounded-2xl border border-terracotta/5 text-base text-slate focus:ring-2 focus:ring-terracotta/30 outline-none transition placeholder:text-slate/40 leading-relaxed"
              value={text}
              onChange={e => setText(e.target.value)}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={loading}
              className="p-3 md:px-6 bg-terracotta text-white rounded-2xl font-bold hover:bg-terracotta/90 transition shadow-warm-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              <Send size={17} />
              <span className="hidden md:inline">{loading ? 'Sending…' : 'Post'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Brief Content (shared between desktop panel and mobile sheet) ─────────
const BriefContent = ({ sprint }) => (
  <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
    <h1 className="text-3xl font-extrabold text-slate leading-tight">{sprint.title}</h1>
    <div className="flex flex-wrap gap-3">
      <span className="px-4 py-1.5 bg-bone rounded-full text-slate text-sm font-bold border border-terracotta/10 flex items-center gap-1.5">
        Mentor: <span className="text-terracotta">{sprint.mentor?.name}</span>
      </span>
      <span className="px-4 py-1.5 bg-bone rounded-full text-slate text-sm font-bold border border-terracotta/10 flex items-center gap-1.5">
        Deadline: <span className="text-terracotta">{new Date(sprint.deadline).toLocaleDateString()}</span>
      </span>
    </div>
    <p className="text-base text-slate/80 leading-relaxed whitespace-pre-wrap">
      {sprint.description}
    </p>
    {sprint.fileUrl && (
      <div className="p-5 bg-gold/10 rounded-[1.5rem] border border-gold/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-terracotta shadow-sm">
            <FileText size={20} />
          </div>
          <div>
            <p className="font-bold text-slate text-sm">Reference Asset</p>
            <p className="text-xs text-slate/60">Mentor-attached file</p>
          </div>
        </div>
        <a
          href={sprint.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-white text-terracotta font-bold rounded-xl shadow-sm border border-terracotta/10 hover:bg-gold/20 transition active:scale-95 text-sm"
        >
          Download
        </a>
      </div>
    )}
  </div>
);

export default SprintDetail;
