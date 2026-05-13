import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { MessageSquare, Send, User, ArrowLeft } from 'lucide-react';

const Doubts = () => {
  const { user } = useContext(AuthContext);
  const [doubts, setDoubts] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchDoubts = async () => {
    try {
      const res = await api.get('/doubts');
      setDoubts(res.data.doubts || []);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doubts', { title, description });
      setTitle(''); setDescription('');
      fetchDoubts();
    } catch (err) { alert('Failed to post doubt'); }
  };

  const handleReply = async (e, doubtId) => {
    e.preventDefault();
    if (!replyText[doubtId]) return;
    try {
      await api.post(`/doubts/${doubtId}/reply`, { text: replyText[doubtId] });
      setReplyText({ ...replyText, [doubtId]: '' });
      fetchDoubts();
    } catch (err) { alert('Reply failed'); }
  };

  return (
    <div className="p-8 pt-24 max-w-4xl mx-auto min-h-screen relative">
      <Link to="/dashboard" className="fixed top-8 left-8 z-50 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Class Discussions</h2>
        <p className="text-slate-500 mt-1">Ask questions, clear doubts, and help peers.</p>
      </div>

      {user?.role === 'student' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquare className="text-emerald-500" /> Start a Discussion
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <input type="text" placeholder="Question Subject" required className="w-full px-4 py-2 border border-slate-200 rounded-xl" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea placeholder="Describe your doubt in detail..." required className="w-full px-4 py-2 border border-slate-200 rounded-xl h-24" value={description} onChange={e => setDescription(e.target.value)} />
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition flex items-center gap-2">
                <Send size={16} /> Post Doubt
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {doubts.map(d => (
          <div key={d._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className={`p-6 border-b border-slate-100 ${d.status === 'resolved' ? 'bg-slate-50' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg text-slate-800">{d.title}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${d.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {d.status.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-600 mb-3">{d.description}</p>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <User size={14} /> {d.student?.name} • {new Date(d.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="p-4 bg-slate-50">
              {d.replies?.length > 0 ? (
                <ul className="space-y-4 mb-4">
                  {d.replies.map((reply, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="h-8 w-8 min-w-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                        {reply.user?.name?.charAt(0)}
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 flex-1 relative">
                        <p className="text-sm font-semibold text-slate-700 mb-1">
                          {reply.user?.name} {reply.user?.role === 'mentor' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded ml-2">Mentor</span>}
                        </p>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap">{reply.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 mb-4 px-2 italic">No replies yet.</p>
              )}

              {d.status !== 'resolved' && (
                <form onSubmit={e => handleReply(e, d._id)} className="flex gap-3 mt-2">
                  <input type="text" placeholder="Type a helpful reply..." required className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm" value={replyText[d._id] || ''} onChange={e => setReplyText({ ...replyText, [d._id]: e.target.value })} />
                  <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition flex items-center gap-2">
                    <Send size={14} /> Reply
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doubts;
