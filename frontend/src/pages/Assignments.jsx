import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { BookOpen, Upload, CheckCircle, ArrowLeft } from 'lucide-react';

const Assignments = () => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  
  // Mentor creation state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState(null);
  
  // Student submission state
  const [submitFile, setSubmitFile] = useState({});
  const [loading, setLoading] = useState({});
  const [creationLoading, setCreationLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data.assignments || []);
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
      fetchAssignments();
    } catch (err) { alert('Failed to create assignment'); }
    finally { setCreationLoading(false); }
  };

  const handleSubmit = async (e, assignmentId) => {
    e.preventDefault();
    const currFile = submitFile[assignmentId];
    if (!currFile) return alert("Please select a file to submit!");

    setLoading(prev => ({ ...prev, [assignmentId]: true }));
    const formData = new FormData();
    formData.append('file', currFile);

    try {
      await api.post(`/assignments/${assignmentId}/submit`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Assignment submitted successfully!');
      fetchAssignments();
    } catch (err) { alert('Submission failed'); }
    finally { setLoading(prev => ({ ...prev, [assignmentId]: false })); }
  };

  return (
    <div className="p-8 pt-24 max-w-6xl mx-auto min-h-screen relative">
      <Link to="/dashboard" className="fixed top-8 left-8 z-50 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Assignments</h2>
        <p className="text-slate-500 mt-1">Track deadlines and submissions.</p>
      </div>

      {user?.role === 'mentor' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Create Assignment</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Title" required className="px-4 py-2 border border-slate-200 rounded-xl w-full" value={title} onChange={e => setTitle(e.target.value)} />
              <input type="datetime-local" required className="px-4 py-2 border border-slate-200 rounded-xl w-full" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
            <textarea placeholder="Description instructions..." required className="w-full px-4 py-2 border border-slate-200 rounded-xl mt-2" value={description} onChange={e => setDescription(e.target.value)} />
            <div className="flex items-center gap-4">
              <input type="file" className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" onChange={e => setFile(e.target.files[0])} />
              <button type="submit" disabled={creationLoading} className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition ml-auto disabled:opacity-50">
                {creationLoading ? 'Creating...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map(a => {
          const isSubmitted = a.submissions?.some(sub => sub.student._id === user._id || sub.student === user._id);
          
          return (
            <div key={a._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center"><BookOpen size={20} /></div>
                  <h4 className="font-bold text-lg text-slate-800">{a.title}</h4>
                </div>
                {isSubmitted && user.role === 'student' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> Submitted</span>}
              </div>
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">{a.description}</p>
              <div className="text-xs text-slate-500 mt-auto mb-4 bg-slate-50 px-3 py-2 rounded-lg inline-block self-start">
                <strong>Deadline:</strong> {new Date(a.deadline).toLocaleString()}
              </div>
              
              {a.fileUrl && (
                <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline mb-4 inline-block">
                  View Reference Resource
                </a>
              )}

              {user?.role === 'student' && !isSubmitted && (
                <form onSubmit={e => handleSubmit(e, a._id)} className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <input type="file" required onChange={e => setSubmitFile({...submitFile, [a._id]: e.target.files[0]})} className="flex-1 text-sm file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700" />
                  <button type="submit" disabled={loading[a._id]} className="px-4 py-1.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 flex items-center gap-2">
                    <Upload size={16} /> {loading[a._id] ? 'Sending...' : 'Submit'}
                  </button>
                </form>
              )}

              {user?.role === 'mentor' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-2">Submissions ({a.submissions?.length || 0})</p>
                  <ul className="space-y-2 max-h-32 overflow-y-auto">
                    {a.submissions?.map(sub => (
                      <li key={sub._id} className="text-sm flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg">
                        <span>{sub.student?.name || 'Student'}</span>
                        <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">View Work</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Assignments;
