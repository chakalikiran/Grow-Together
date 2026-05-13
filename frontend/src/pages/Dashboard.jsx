import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, BookOpen, Video, FileText, Calendar, MessageSquare, LayoutDashboard, Plus } from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [doubts, setDoubts] = useState([]);
  
  // Meeting Schedule State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', description: '' });
  
  // Upload State
  const [uploadingRecording, setUploadingRecording] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [meetRes, assignRes, doubtRes] = await Promise.all([
        api.get('/meetings'),
        api.get('/assignments'),
        api.get('/doubts')
      ]);
      setMeetings(meetRes.data.meetings || []);
      setAssignments(assignRes.data.assignments || []);
      setDoubts(doubtRes.data.doubts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadRecording = async (e, meetingId) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingRecording(prev => ({...prev, [meetingId]: true}));
    
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/meetings/${meetingId}/recording`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      fetchData();
      alert('Recording uploaded successfully!');
    } catch (err) {
      alert("Failed to upload recording.");
    } finally {
      setUploadingRecording(prev => ({...prev, [meetingId]: false}));
    }
  };

  const handleScheduleClass = async (e) => {
    e.preventDefault();
    try {
      // Create a random room ID for this meeting
      const roomId = 'room-' + Math.random().toString(36).substr(2, 9);
      await api.post('/meetings', {
        title: newMeeting.title,
        date: newMeeting.date,
        description: newMeeting.description,
        roomId: roomId,
        link: `/meeting/${roomId}`
      });
      setShowScheduleModal(false);
      setNewMeeting({ title: '', date: '', description: '' });
      fetchData(); // Refresh Data
    } catch (err) {
      alert("Failed to schedule class. Try again.");
    }
  };

  // Calculate dynamic stats
  // For students: how many assignments haven't been submitted by them.
  // For mentors: how many assignments are active/total.
  const pendingAssignmentsCount = user?.role === 'student' 
    ? assignments.filter(a => !a.submissions?.some(sub => sub.student?._id === user._id || sub.student === user._id)).length
    : assignments.length; 

  const activeDoubtsCount = doubts.filter(d => d.status !== 'resolved').length;

  const liveMeetings = meetings.filter(m => !m.recordingUrl);
  const recordedMeetings = meetings.filter(m => m.recordingUrl);

  return (
    <div className="flex h-screen bg-slate-50 relative">
      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Schedule Live Class</h3>
            <form onSubmit={handleScheduleClass} className="space-y-4">
              <input type="text" placeholder="Class Topic / Title" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-emerald-500" value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} />
              <input type="datetime-local" required className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} />
              <textarea placeholder="Brief description..." className="w-full px-4 py-3 border border-slate-200 rounded-xl" rows="3" value={newMeeting.description} onChange={e => setNewMeeting({...newMeeting, description: e.target.value})}></textarea>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full sticky top-0 overflow-y-auto hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-emerald-600 tracking-tight flex items-center gap-2">
            <BookOpen className="text-emerald-500" />
            GrowTogether
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 text-slate-600">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-medium transition">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/notes" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 hover:text-emerald-600 transition">
            <BookOpen size={20} /> Notes
          </Link>
          <Link to="/assignments" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 hover:text-emerald-600 transition">
            <FileText size={20} /> Assignments
          </Link>
          <Link to="/doubts" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 hover:text-emerald-600 transition">
            <MessageSquare size={20} /> Discussions
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold uppercase shadow-sm border border-emerald-200">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">{user?.name}</p>
              <p className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block uppercase font-bold mt-1 tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition font-medium"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Welcome back, {user?.name.split(' ')[0]}! 👋</h2>
            <p className="text-slate-500 mt-2">Here is everything happening with your mentorship group.</p>
          </div>
          {user?.role === 'mentor' && (
            <button onClick={() => setShowScheduleModal(true)} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition transform hover:-translate-y-0.5">
              <Plus size={20} /> Schedule Class
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-slate-500 text-sm font-medium">Upcoming Classes</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{meetings.length}</p>
            </div>
            <div className="h-14 w-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center">
              <Calendar size={28} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-slate-500 text-sm font-medium">{user?.role === 'student' ? 'Pending Assignments' : 'Total Assignments'}</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{pendingAssignmentsCount}</p>
            </div>
            <div className="h-14 w-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <FileText size={28} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-slate-500 text-sm font-medium">Active Discussions</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{activeDoubtsCount}</p>
            </div>
            <div className="h-14 w-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
              <MessageSquare size={28} />
            </div>
          </div>
        </div>

        {/* Live Classes Quick View */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Video className="text-emerald-500"/> Scheduled Live Sessions</h3>
          </div>
          {liveMeetings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Video size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="font-medium text-lg text-slate-500 mb-2">No live classes scheduled</p>
              <p className="text-sm">Mentors will schedule classes here when ready to broadcast.</p>
              {user?.role === 'mentor' && (
                <button onClick={() => setShowScheduleModal(true)} className="mt-6 px-6 py-2 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 font-medium rounded-lg transition shadow-sm">
                  Schedule Now
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {liveMeetings.map(m => (
                <div key={m._id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md bg-white transition group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center border border-indigo-100">
                      <Video size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{m.title}</h4>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar size={14}/> {new Date(m.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/meeting/${m.roomId}`} className="px-6 py-2.5 bg-emerald-100 hover:bg-emerald-500 hover:text-white text-emerald-700 font-bold rounded-xl transition transform hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap">
                      Join Live Space
                    </Link>
                    {user?.role === 'mentor' && (
                      <div className="relative overflow-hidden">
                          <input type="file" onChange={(e) => handleUploadRecording(e, m._id)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="video/*" />
                          <button disabled={uploadingRecording[m._id]} className="px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition whitespace-nowrap">
                              {uploadingRecording[m._id] ? 'Uploading...' : 'Upload Rec'}
                          </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recorded Sessions Library View */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Video className="text-blue-500"/> Library: Recorded Classes</h3>
          </div>
          {recordedMeetings.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 block">
              <p className="font-medium text-slate-500 mb-1">No recorded sessions available yet</p>
              <p className="text-sm">Classes will appear here once the mentor uploads a recording.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recordedMeetings.map(m => (
                <div key={m._id} className="p-5 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800">{m.title}</h4>
                      <p className="text-xs font-medium text-slate-500 mt-1">{new Date(m.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a href={m.recordingUrl} target="_blank" rel="noopener noreferrer" className="block text-center w-full px-4 py-2 bg-blue-100 hover:bg-blue-500 hover:text-white text-blue-700 font-bold rounded-xl transition shadow-sm">
                     Watch Recording
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
