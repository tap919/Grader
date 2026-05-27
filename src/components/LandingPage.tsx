import React from 'react';
import { motion } from 'motion/react';
import { Github, Star, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Zap className="text-yellow-400" />
          <span>Grader</span>
        </div>
        <button 
          onClick={onLogin}
          className="bg-white text-slate-900 px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-slate-200 transition"
        >
          <Github size={18} /> Login with GitHub
        </button>
      </header>

      <main className="container mx-auto px-6 py-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold mb-6"
        >
          Automated Codebase Due Diligence
        </motion.h1>
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
          Grade any GitHub repository with Gemini AI. Valuation, ISO 5055 compliance, and automated roadmap generation for 1/10th the cost of competitors.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Feature icon={<ShieldCheck size={32} />} title="Security Audit" description="Find secret leaks and vulnerabilities automatically." />
          <Feature icon={<BarChart3 size={32} />} title="Market Benchmarking" description="Compare your code quality vs market leaders." />
          <Feature icon={<Star size={32} />} title="Valuation Engine" description="Quantify your codebase's commercial worth." />
        </div>

        <button 
          onClick={onLogin}
          className="bg-yellow-400 text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition"
        >
          Get Started For Free
        </button>
      </main>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
      <div className="text-yellow-400 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}
