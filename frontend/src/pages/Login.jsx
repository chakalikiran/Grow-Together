import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, BookOpen, User } from 'lucide-react';

const Login = () => {
  const { bypassLoginAsStudent, bypassLoginAsMentor } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleStudentLogin = () => {
    bypassLoginAsStudent();
    navigate('/dashboard');
  };

  const handleMentorLogin = () => {
    bypassLoginAsMentor();
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative w-full overflow-hidden mesh-gradient">
      <div className="noise-overlay"></div>
      {/* Aesthetic blob backgrounds - Updated to Nordic Autumn */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-terracotta/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-orange-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-warm z-10 border border-terracotta/10 relative">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-bone text-terracotta flex items-center justify-center rounded-2xl shadow-warm-sm border border-terracotta/10">
            <LogIn size={32} strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-slate mb-2 tracking-tight">Grow Together</h2>
        <p className="text-center text-slate/70 mb-8">Choose your role to enter the portal</p>

        <div className="space-y-4">
          <button 
            onClick={handleStudentLogin}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-bone border border-terracotta/10 text-slate hover:bg-gold/20 hover:text-terracotta hover:border-terracotta/30 font-bold rounded-2xl shadow-sm transition active:scale-95"
          >
            <BookOpen size={20} strokeWidth={1.5} /> Enter as Student
          </button>
          <button 
            onClick={handleMentorLogin}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-terracotta hover:bg-terracotta/90 text-white font-bold rounded-2xl shadow-warm transition active:scale-95 border border-terracotta/20"
          >
            <User size={20} strokeWidth={1.5} /> Enter as Mentor
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
