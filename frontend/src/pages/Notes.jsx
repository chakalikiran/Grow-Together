import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { FileText, UploadCloud, Download, ArrowLeft } from 'lucide-react';

const Notes = () => {
  const { user } = useContext(AuthContext);
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
    if (!file) return alert("Please select a file.");
    
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
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 pt-24 max-w-6xl mx-auto min-h-screen relative">
      <Link to="/dashboard" className="fixed top-8 left-8 z-50 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Class Notes</h2>
          <p className="text-slate-500 mt-1">Access study materials and resources.</p>
        </div>
      </div>

      {user?.role === 'mentor' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UploadCloud className="text-emerald-500" /> Upload New Note
          </h3>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="text" placeholder="Note Title" required 
              className="px-4 py-2 border border-slate-200 rounded-xl"
              value={title} onChange={e => setTitle(e.target.value)}
            />
            <input 
              type="text" placeholder="Subject" required 
              className="px-4 py-2 border border-slate-200 rounded-xl"
              value={subject} onChange={e => setSubject(e.target.value)}
            />
            <input 
              type="file" required 
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
              onChange={e => setFile(e.target.files[0])}
            />
            <button 
              type="submit" disabled={loading}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Publish Note'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No notes found.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notes.map(note => (
              <li key={note._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-lg">{note.title}</h4>
                    <p className="text-sm text-slate-500">
                      Subject: {note.subject} • By {note.mentor?.name} • {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a 
                  href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                >
                  <Download size={18} /> View / Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notes;
