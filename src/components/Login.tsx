import React from 'react';
import { Github } from 'lucide-react';

export default function Login() {
  const handleGithubLogin = () => {
    window.location.href = '/api/v1/auth/github';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-10 rounded-3xl border border-slate-700 text-center max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6">Welcome Back</h2>
        <p className="text-slate-400 mb-8">Sign in to your organization dashboard to start grading repositories.</p>
        
        <button 
          onClick={handleGithubLogin}
          className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition"
        >
          <Github size={20} /> Continue with GitHub
        </button>
      </div>
    </div>
  );
}
