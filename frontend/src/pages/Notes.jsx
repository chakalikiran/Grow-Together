import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { FileText, UploadCloud, Download } from 'lucide-react';

const Notes = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return addToast("Please select a file.", "error");
    
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('file', file);

    try {
      await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setSubject('');
      setFile(null);
      addToast('Note uploaded successfully!', 'success');
      fetchNotes();
    } catch (err) {
      console.error(err);
      addToast('Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate tracking-tight">Resource Gallery</h2>
        <p className="text-slate/70 mt-2 text-lg">Access study materials and essential resources.</p>
      </div>

      {user?.role === 'mentor' && (
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-warm border border-terracotta/10 mb-8">
          <h3 className="text-xl font-bold text-slate mb-6 flex items-center gap-2">
            <UploadCloud className="text-terracotta" strokeWidth={1.5} /> Upload New Note
          </h3>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="relative flex flex-col gap-1 w-full">
              <label className="text-xs font-bold text-slate/80 px-1 uppercase tracking-wider">Note Title</label>
              <input 
                type="text" placeholder="e.g. Tactile Bento Systems" required 
                className="px-5 py-3 border border-terracotta/10 rounded-2xl focus:ring-2 focus:ring-terracotta outline-none transition bg-white/50 w-full"
                value={title} onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className="relative flex flex-col gap-1 w-full">
              <label className="text-xs font-bold text-slate/80 px-1 uppercase tracking-wider">Subject</label>
              <input 
                type="text" placeholder="e.g. Design Systems" required 
                className="px-5 py-3 border border-terracotta/10 rounded-2xl focus:ring-2 focus:ring-terracotta outline-none transition bg-white/50 w-full"
                value={subject} onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div className="relative flex flex-col gap-1 w-full">
              <label className="text-xs font-bold text-slate/80 px-1 uppercase tracking-wider">File Asset</label>
              <input 
                type="file" required 
                className="px-5 py-3 border border-terracotta/10 rounded-2xl text-sm file:mr-4 file:py-1 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gold/20 file:text-terracotta hover:file:bg-gold/30 transition bg-white/50 w-full"
                onChange={e => setFile(e.target.files[0])}
              />
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full px-5 py-[14px] bg-terracotta text-white rounded-2xl font-bold hover:bg-terracotta/90 transition active:scale-95 disabled:opacity-50 shadow-warm-sm"
            >
              {loading ? 'Uploading...' : 'Publish Note'}
            </button>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="p-12 text-center text-slate/70 bg-white/50 backdrop-blur-md rounded-[2rem] border border-terracotta/10 border-dashed">
          No resources found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <div key={note._id} className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2rem] shadow-warm-sm border border-terracotta/10 flex flex-col justify-between hover:shadow-warm transition group">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 bg-bone text-terracotta rounded-2xl flex items-center justify-center group-hover:bg-gold/20 transition border border-terracotta/5">
                    <FileText size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate text-lg line-clamp-1">{note.title}</h4>
                    <p className="text-sm font-bold text-terracotta/80">{note.subject}</p>
                  </div>
                </div>
                <div className="text-sm text-slate/80 mb-6 bg-bone/50 p-4 rounded-2xl border border-terracotta/5">
                   <span className="block mb-1"><strong>Uploaded by:</strong> {note.mentor?.name}</span>
                   <span className="block"><strong>Date:</strong> {new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <a 
                href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-bone text-terracotta font-bold rounded-2xl hover:bg-terracotta hover:text-white transition active:scale-95 border border-terracotta/5"
              >
                <Download size={18} strokeWidth={1.5} /> View Resource
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
