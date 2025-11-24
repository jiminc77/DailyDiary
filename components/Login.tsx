import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] dark:bg-[#191919] p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#202020] rounded-xl shadow-sm border border-[#E9E9E7] dark:border-[#2F2F2F] p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#37352F] dark:text-[#E3E3E3] mb-2">Daily Diary</h1>
          <p className="text-[#787774] dark:text-[#9B9B9B]">
            {mode === 'signin' ? 'Sign in to continue' : 'Create an account'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#37352F] dark:text-[#D4D4D4] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-transparent border border-[#E9E9E7] dark:border-[#2F2F2F] rounded-lg outline-none focus:border-black dark:focus:border-white transition-colors text-[#37352F] dark:text-[#D4D4D4]"
              placeholder="hello@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#37352F] dark:text-[#D4D4D4] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-transparent border border-[#E9E9E7] dark:border-[#2F2F2F] rounded-lg outline-none focus:border-black dark:focus:border-white transition-colors text-[#37352F] dark:text-[#D4D4D4]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setMessage(null);
            }}
            className="text-[#787774] dark:text-[#9B9B9B] hover:text-black dark:hover:text-white transition-colors"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
