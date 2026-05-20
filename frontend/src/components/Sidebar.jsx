import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, BookOpen, FileText, MessageSquare, LayoutDashboard, User } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} strokeWidth={1.5} /> },
    { name: 'Notes', path: '/notes', icon: <BookOpen size={20} strokeWidth={1.5} /> },
    { name: 'Sprints', path: '/assignments', icon: <FileText size={20} strokeWidth={1.5} /> },
  ];

  return (
    <>
      {/* Desktop Floating Vertical Dock */}
      <aside className="hidden lg:flex flex-col fixed top-6 bottom-6 left-6 w-64 bg-white/40 backdrop-blur-3xl border border-terracotta/10 shadow-[0_25px_50px_-12px_rgba(69,26,3,0.15)] rounded-[2rem] z-50 overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-deep-charcoal tracking-tight flex items-center gap-2">
            <BookOpen className="text-terracotta" strokeWidth={1.5} />
            GrowTogether
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3 px-3 py-2 rounded-2xl transition group active:scale-95 ${
                  isActive ? 'text-terracotta font-semibold' : 'text-deep-charcoal font-medium hover:bg-white/30'
                }`}
              >
                {/* Glowing Tab Effect */}
                <div className={`p-2.5 rounded-[1rem] transition ${isActive ? 'bg-gold/40 text-terracotta shadow-sm border border-gold/50' : 'text-slate group-hover:text-terracotta'}`}>
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 bg-bone/30 border-t border-terracotta/5 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 bg-gold/20 text-terracotta rounded-full flex items-center justify-center font-bold uppercase shadow-sm border border-terracotta/10 shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden whitespace-nowrap">
              <p className="font-bold text-deep-charcoal text-sm truncate">{user?.name}</p>
              <p className="text-[10px] text-terracotta bg-white/50 px-2 py-0.5 rounded-md inline-block uppercase font-bold tracking-wider border border-terracotta/10 mt-1">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-3 text-slate hover:bg-white/50 hover:text-terracotta rounded-xl transition font-bold text-sm active:scale-95"
          >
            <LogOut size={16} strokeWidth={2} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Pill */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/60 backdrop-blur-3xl border border-terracotta/10 shadow-[0_25px_50px_-12px_rgba(69,26,3,0.15)] rounded-full z-50 flex items-center justify-between px-2 py-2">
        <div className="flex items-center justify-around flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className="group flex items-center justify-center p-2 active:scale-95 transition"
              >
                {/* Glowing Tab Effect */}
                <div className={`p-3 rounded-full transition ${isActive ? 'bg-gold/40 text-terracotta shadow-sm border border-gold/50' : 'text-slate/70 group-hover:text-terracotta'}`}>
                  {item.icon}
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Mobile Profile Avatar / Sign Out */}
        <div className="pl-2 border-l border-terracotta/10 ml-1 flex items-center justify-center pr-2">
           <button onClick={logout} title="Sign Out" className="h-10 w-10 bg-gold/30 text-terracotta rounded-full flex items-center justify-center font-bold active:scale-95 transition hover:bg-terracotta hover:text-white border border-terracotta/20">
             {user?.name?.charAt(0) || <LogOut size={18} strokeWidth={1.5} />}
           </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
