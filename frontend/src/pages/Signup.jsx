import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative w-full overflow-hidden mesh-gradient">
      <div className="noise-overlay"></div>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-terracotta/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-orange-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-warm z-10 border border-terracotta/10 relative">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-bone text-terracotta flex items-center justify-center rounded-2xl shadow-warm-sm border border-terracotta/10">
            <UserPlus size={32} strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-slate mb-2 tracking-tight">Join Grow Together</h2>
        <p className="text-center text-slate/70 mb-8">Create your dedicated learning account</p>

        {error && <div className="p-3 mb-6 bg-terracotta/10 text-terracotta rounded-lg text-sm text-center font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate mb-1">Full Name</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 rounded-xl border border-terracotta/10 focus:outline-none focus:ring-2 focus:ring-terracotta transition bg-bone"
              placeholder="John Doe"
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-1">Email Address</label>
            <input 
              type="email" required
              className="w-full px-4 py-3 rounded-xl border border-terracotta/10 focus:outline-none focus:ring-2 focus:ring-terracotta transition bg-bone"
              placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-1">Password</label>
            <input 
              type="password" required
              className="w-full px-4 py-3 rounded-xl border border-terracotta/10 focus:outline-none focus:ring-2 focus:ring-terracotta transition bg-bone"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-1">I am a...</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-terracotta/10 focus:outline-none focus:ring-2 focus:ring-terracotta transition bg-bone"
              value={role} onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full py-4 px-4 bg-terracotta hover:bg-terracotta/90 text-white font-bold rounded-2xl shadow-warm transition active:scale-95 border border-terracotta/20 mt-6"
          >
            Create Account
          </button>
        </form>
        <p className="mt-6 text-center text-slate/70 text-sm">
          Already have an account? <Link to="/" className="text-terracotta font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
