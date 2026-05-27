import React, { useState, useEffect } from 'react';
import { Plus, GitBranch, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import { HistoricalScan } from '../types';

export default function Dashboard() {
  const [scans, setScans] = useState<HistoricalScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [repoUrl, setRepoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch('/api/v1/scans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setScans(data.scans || []);
      }
    } catch (err) {
      console.error('Failed to fetch scans', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('authToken');
    try {
      await fetch('/api/v1/scans', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ repoUrl }),
      });
      setRepoUrl('');
      fetchScans();
    } catch (err) {
      console.error('Failed to submit scan', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text" 
            placeholder="github.com/owner/repo" 
            className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 w-80"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <button 
            disabled={submitting}
            className="bg-yellow-400 text-slate-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-300 transition"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <><Plus size={18} /> Grade Repo</>}
          </button>
        </form>
      </header>

      {loading ? (
        <div className="text-center py-20">Loading your scans...</div>
      ) : (
        <div className="grid gap-4">
          {scans.map((scan) => (
            <div key={scan.repoKey} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <GitBranch className="text-slate-500" />
                <div>
                  <h3 className="font-bold">{scan.owner}/{scan.name}</h3>
                  <p className="text-slate-400 text-sm">{new Date(scan.scannedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className={`px-3 py-1 rounded-full font-bold text-sm ${scan.overallScore >= 80 ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'}`}>
                  {scan.gradeCategory} ({scan.overallScore}%)
                </div>
                <button className="text-blue-400 hover:text-blue-300">View Report</button>
              </div>
            </div>
          ))}
          {scans.length === 0 && (
            <div className="text-center py-20 text-slate-500">No scans found. Start by grading your first repository!</div>
          )}
        </div>
      )}
    </div>
  );
}
