import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { BookOpen, Plus, X, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sprints = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const [sprints, setSprints] = useState([]);
  
  // Mentor creation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState(null);
  const [creationLoading, setCreationLoading] = useState(false);

  useEffect(() => {
    fetchSprints();
  }, []);

  const fetchSprints = async () => {
    try {
      const res = await api.get('/assignments');
      const sorted = (res.data.assignments || []).sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
      setSprints(sorted);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreationLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('deadline', deadline);
    if (file) formData.append('file', file);

    try {
      await api.post('/assignments', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTitle(''); setDescription(''); setDeadline(''); setFile(null);
      setIsModalOpen(false);
      addToast('Sprint created successfully!', 'success');
      fetchSprints();
    } catch (err) { addToast('Failed to create sprint', 'error'); }
    finally { setCreationLoading(false); }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen relative space-y-16">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-slate tracking-tight">Sprint Gallery</h2>
          <p className="text-slate/70 mt-2 text-lg">Drill down into your active topics and discussions.</p>
        </div>
        {user?.role === 'mentor' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-terracotta text-white px-8 py-4 rounded-[2rem] font-bold shadow-warm-deep hover:bg-terracotta/90 transition active:scale-95"
          >
            <Plus size={24} strokeWidth={2} /> New Topic
          </button>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bone/40 backdrop-blur-md p-4">
          <div className="bg-white/90 backdrop-blur-3xl w-full max-w-2xl rounded-[2.5rem] shadow-warm-deep border border-terracotta/5 overflow-hidden relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate hover:text-terracotta transition bg-bone rounded-full p-2">
               <X size={20} strokeWidth={1.5} />
            </button>
            <div className="p-10">
              <h3 className="text-3xl font-bold text-slate mb-8 flex items-center gap-3">
                <BookOpen className="text-terracotta" strokeWidth={1.5} size={32} /> Initialize Sprint
              </h3>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate mb-2">Topic Focus</label>
                    <input type="text" placeholder="e.g. Neo-Brutalism" required className="w-full px-5 py-4 border border-terracotta/10 rounded-2xl focus:ring-2 focus:ring-terracotta outline-none transition bg-bone/50 text-slate" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate mb-2">Target Date</label>
                     <input type="datetime-local" required className="w-full px-5 py-4 border border-terracotta/10 rounded-2xl focus:ring-2 focus:ring-terracotta outline-none transition bg-bone/50 text-slate" value={deadline} onChange={e => setDeadline(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate mb-2">Brief & Context</label>
                  <textarea placeholder="Provide the context for this sprint..." required className="w-full px-5 py-4 border border-terracotta/10 rounded-2xl focus:ring-2 focus:ring-terracotta outline-none transition bg-bone/50 min-h-[150px] text-slate resize-none" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate mb-2">Reference Assets</label>
                   <input type="file" className="text-sm text-slate file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:font-bold file:bg-gold/20 file:text-terracotta hover:file:bg-gold/30 transition w-full" onChange={e => setFile(e.target.files[0])} />
                </div>
                <div className="pt-6 border-t border-terracotta/10 flex justify-end gap-4 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl font-bold text-slate bg-bone hover:bg-gold/20 transition">Cancel</button>
                  <button type="submit" disabled={creationLoading} className="px-10 py-4 bg-terracotta text-white rounded-2xl font-bold hover:bg-terracotta/90 transition disabled:opacity-50 active:scale-95 shadow-warm-sm">
                    {creationLoading ? 'Initializing...' : 'Launch Sprint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Asymmetrical Bento Gallery */}
      <div className="grid grid-cols-12 gap-10">
        {sprints.map(sprint => {
          const deadlinePassed = new Date(sprint.deadline) < new Date();
          const feedCount = sprint.feed?.length || 0;

          return (
            <Link to={`/assignments/${sprint._id}`} key={sprint._id} className="col-span-12 md:col-span-6 lg:col-span-4 block group">
              <div className="bg-white/80 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-warm-deep border border-terracotta/5 h-full flex flex-col justify-between transition-transform duration-300 group-hover:-translate-y-2 group-active:scale-95 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-xl pointer-events-none group-hover:bg-gold/20 transition-colors"></div>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-1.5 bg-bone text-deep-charcoal text-xs font-bold uppercase rounded-full tracking-widest shadow-sm border border-terracotta/5">Sprint</span>
                    <ArrowRight size={20} className="text-terracotta opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-deep-charcoal mb-4 leading-tight line-clamp-2">{sprint.title}</h3>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-bone/50 rounded-2xl border border-terracotta/5">
                    <span className="text-deep-charcoal/80 text-sm font-semibold flex items-center gap-2"><Clock size={16} /> Deadline</span>
                    <span className={`text-sm font-bold ${deadlinePassed ? 'text-terracotta' : 'text-deep-charcoal'}`}>{new Date(sprint.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gold/10 rounded-2xl border border-gold/20">
                    <span className="text-deep-charcoal/90 text-sm font-semibold">Squad Feed</span>
                    <span className="text-terracotta font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm">{feedCount} Updates</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        {sprints.length === 0 && (
          <div className="col-span-12 text-center py-20 text-slate/50 font-bold text-xl">
            No sprints available yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Sprints;
