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
    <div className="flex items-center justify-center min-h-screen relative w-full bg-slate-100 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl z-10 border border-white/40">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-emerald-500 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-emerald-500/30">
            <UserPlus size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Join Grow Together</h2>
        <p className="text-center text-slate-500 mb-8">Create your dedicated learning account</p>

        {error && <div className="p-3 mb-6 bg-red-100 text-red-700 rounded-lg text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              placeholder="John Doe"
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">I am a...</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white"
              value={role} onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/30 transform transition hover:-translate-y-0.5"
          >
            Create Account
          </button>
        </form>
        <p className="mt-6 text-center text-slate-500 text-sm">
          Already have an account? <Link to="/" className="text-emerald-600 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
