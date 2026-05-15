import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Video } from 'lucide-react';

const LiveClass = () => {
  const { roomId } = useParams();

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 p-6 text-white font-sans">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-10 max-w-lg text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-sky-500"></div>
        
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Video size={40} />
        </div>
        
        <h2 className="text-3xl font-bold mb-4">Meeting Relocated</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          The video session for <span className="text-emerald-400 font-semibold">{roomId || 'your class'}</span> has moved to Google Meet for a better experience.
        </p>

        <div className="flex flex-col gap-4">
          <a 
            href="https://meet.google.com/ypd-rumq-xgj" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-3"
          >
            <Video size={24} /> Join Session on Google Meet
          </a>
          
          <Link to="/dashboard" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition flex items-center justify-center gap-2">
            Back to Dashboard
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-500 italic">
          Tip: Bookmark the Google Meet link for quick access later!
        </p>
      </div>
    </div>
  );
};

export default LiveClass;