import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, FileText, MessageSquare, ArrowRight, Users } from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [doubts, setDoubts] = useState([]);
  
  // Mock Squad Members
  const squad = [
    { name: "Alice Chen" },
    { name: "Bob Smith" },
    { name: "Charlie Davis" },
    { name: "Diana Prince" },
    { name: "Evan Wright" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const pendingAssignmentsCount = user?.role === 'student' 
    ? assignments.filter(a => !a.feed?.some(item => item.user?._id === user._id || item.user === user._id)).length
    : assignments.length; 

  // Calculate active insights/doubts from sprints
  const activeInsightsCount = assignments.reduce((acc, sprint) => acc + (sprint.feed?.length || 0), 0);
  const doubtFlagCount = assignments.reduce((acc, sprint) => acc + (sprint.feed?.filter(item => item.isDoubt).length || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="mb-10">
        <h2 className="text-4xl font-bold text-slate tracking-tight">Welcome back, {user?.name.split(' ')[0]}</h2>
        <p className="text-slate/70 mt-2 text-lg">Command Center overview for your mentorship group.</p>
      </header>

      {/* Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Welcome Card (Wide) */}
        <div className="md:col-span-8 bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-warm border border-terracotta/10 flex flex-col justify-between">
          <div>
             <div className="w-12 h-12 bg-gold/20 rounded-2xl flex items-center justify-center mb-4 border border-terracotta/5">
                <BookOpen className="text-terracotta" strokeWidth={1.5} size={24} />
             </div>
             <h3 className="text-2xl font-bold text-slate mb-2">Ready to learn?</h3>
             <p className="text-slate/70 mb-6">Explore the latest materials uploaded by your mentor and stay on top of your coursework.</p>
          </div>
          <Link to="/notes" className="inline-flex items-center gap-2 text-terracotta font-semibold hover:text-terracotta/80 transition active:scale-95">
             Browse Resources <ArrowRight size={18} strokeWidth={1.5} />
          </Link>
        </div>

        {/* Assignments Stat Card (Tall/Square) */}
        <div className="md:col-span-4 bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-warm border border-terracotta/10 flex flex-col items-center justify-center text-center hover:bg-bone transition active:scale-95 cursor-pointer" onClick={() => navigate('/assignments')}>
          <div className="w-16 h-16 bg-bone text-terracotta rounded-full flex items-center justify-center mb-4 border border-terracotta/10 shadow-sm">
            <FileText size={32} strokeWidth={1.5} />
          </div>
          <p className="text-4xl font-bold text-slate mb-1">{pendingAssignmentsCount}</p>
          <p className="text-slate/70 text-sm font-medium">{user?.role === 'student' ? 'Pending Sprints' : 'Total Sprints'}</p>
        </div>

        {/* Squad Activity (Wide) */}
        <div className="md:col-span-6 bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-warm border border-terracotta/10">
           <h3 className="text-xl font-bold text-slate mb-6 flex items-center gap-2">
             <Users className="text-terracotta" strokeWidth={1.5} size={20} /> Squad Activity
           </h3>
           <div className="flex items-center gap-3">
              {squad.map((member, i) => (
                <div key={i} className="relative group">
                  <div className="w-12 h-12 rounded-full bg-gold/30 flex items-center justify-center text-terracotta font-bold border-2 border-white shadow-sm transition transform hover:-translate-y-1">
                    {member.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    {member.name}
                  </div>
                </div>
              ))}
              <div className="w-12 h-12 rounded-full bg-bone flex items-center justify-center text-slate font-bold border-2 border-white shadow-sm border-dashed text-sm">
                +{Math.floor(Math.random() * 10) + 1}
              </div>
           </div>
           <p className="text-sm text-slate/70 mt-4">Your squad is highly active today. Jump into discussions!</p>
        </div>

        {/* Insight Threads Card */}
        <div className="md:col-span-6 bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-warm border border-terracotta/10 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-bone transition active:scale-95 cursor-pointer" onClick={() => navigate('/assignments')}>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gold/20 text-terracotta rounded-full flex items-center justify-center border border-terracotta/10 shadow-sm shrink-0">
              <MessageSquare size={32} strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="text-4xl font-bold text-slate mb-1">{doubtFlagCount}</p>
              <p className="text-slate/70 text-sm font-medium">Critical Support Flags</p>
            </div>
          </div>
          <div className="shrink-0">
             <ArrowRight className="text-terracotta" size={24} strokeWidth={1.5}/>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
