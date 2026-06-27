import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { LogOut, Plus, Search, Zap, AlertCircle, RefreshCw, X } from "lucide-react";
import ScoreGauge from "../../components/ScoreGauge";
import QuickWinsList from "../../components/QuickWinsList";
import RoadmapBoard from "../../components/RoadmapBoard";
import type { HealthReport, QuickWin, RoadmapItem, IsoCompliance } from "../../types";
import IsoComplianceCert from "../../components/IsoComplianceCert";
import { apiFetch } from "../../lib/apiClient";

interface Scan {
  id: string;
  repoUrl: string;
  owner: string;
  repo: string;
  score: number;
  grade: string;
  createdAt: string;
}

interface ScanDetail extends Scan {
  report: HealthReport | null;
  compliance?: IsoCompliance | null;
}

interface DashboardProps {
  onLogout: () => void;
}

const PROCESSING_GRADES = new Set(["pending", "processing"]);

function mapScanRow(s: Record<string, unknown>): Scan {
  return {
    id: s.id as string,
    repoUrl: (s.repo_url ?? s.repoUrl) as string,
    owner: s.owner as string,
    repo: (s.name ?? s.repo) as string,
    score: (s.score as number) ?? 0,
    grade: (s.grade_category ?? s.grade) as string,
    createdAt: (s.created_at ?? s.createdAt) as string,
  };
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const { isAuthenticated } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRescanning, setIsRescanning] = useState(false);
  const [showAddScan, setShowAddScan] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [isSubmittingScan, setIsSubmittingScan] = useState(false);
  const [completedWins, setCompletedWins] = useState<string[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredScans = () =>
    scans.filter(
      (s) =>
        s.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.repo.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const fetchDetail = useCallback(async (id: string) => {
    setDetailError(null);
    try {
      const [detailRes, complianceRes] = await Promise.all([
        apiFetch(`/api/v1/scans/${id}`),
        apiFetch(`/api/v1/scans/${id}/compliance`),
      ]);
      if (!detailRes.ok) {
        throw new Error("Failed to load scan details");
      }
      const detail = await detailRes.json();
      const compliance = complianceRes.ok ? await complianceRes.json() : null;
      setSelectedScan({ ...detail, compliance } as ScanDetail);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Failed to load scan details");
    }
  }, []);

  const loadScans = useCallback(async (selectFirst = false) => {
    const res = await apiFetch("/api/v1/scans");
    if (!res.ok) throw new Error("Failed to fetch scans");
    const data = await res.json();
    const list: Scan[] = (data.scans || []).map(mapScanRow);
    setScans(list);
    if (selectFirst && list.length > 0) {
      void fetchDetail(list[0].id);
    }
    return list;
  }, [fetchDetail]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (scanId: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const list = await loadScans(false);
          const target = list.find((s) => s.id === scanId);
          if (target && !PROCESSING_GRADES.has(target.grade)) {
            stopPolling();
            setIsRescanning(false);
            setIsSubmittingScan(false);
            await fetchDetail(scanId);
          }
        } catch {
          /* keep polling */
        }
      }, 3000);
    },
    [fetchDetail, loadScans, stopPolling]
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    loadScans(true)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load scans"))
      .finally(() => setIsLoading(false));
    return () => stopPolling();
  }, [isAuthenticated, loadScans, stopPolling]);

  const handleSelectScan = (scan: Scan) => {
    setSelectedScan(null);
    void fetchDetail(scan.id);
  };

  const submitScan = async (repoUrl: string) => {
    setError(null);
    const res = await apiFetch("/api/v1/scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl: repoUrl.trim() }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? "Failed to submit scan");
    }
    const created = await res.json();
    const list = await loadScans(false);
    const scanId = (created.id as string) ?? list[0]?.id;
    if (scanId) {
      startPolling(scanId);
      await fetchDetail(scanId);
    }
    setShowAddScan(false);
    setNewRepoUrl("");
  };

  const handleRescan = async () => {
    if (!selectedScan) return;
    setIsRescanning(true);
    setError(null);
    try {
      await submitScan(selectedScan.repoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to re-scan");
      setIsRescanning(false);
    }
  };

  const handleAddScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoUrl.trim()) return;
    setIsSubmittingScan(true);
    setError(null);
    try {
      await submitScan(newRepoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add scan");
    } finally {
      setIsSubmittingScan(false);
    }
  };

  const quickWins: QuickWin[] = selectedScan?.report?.quickWins ?? [];
  const roadmap: RoadmapItem[] = selectedScan?.report?.roadmap ?? [];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-400" size={24} />
            <h1 className="text-xl font-bold">Grader</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3">
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Your Scans</h2>
                <button
                  type="button"
                  onClick={() => setShowAddScan(true)}
                  className="text-yellow-400 hover:text-yellow-300 transition"
                  aria-label="Add scan"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400 mb-4" />
                  <p className="text-slate-400 text-sm">Loading your scans...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-medium text-red-300">Error</p>
                      <p className="text-sm text-slate-300 mt-1">{error}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setIsLoading(true);
                          loadScans(true)
                            .catch((err) => setError(err.message))
                            .finally(() => setIsLoading(false));
                        }}
                        className="mt-3 text-sm text-yellow-400 hover:text-yellow-300 transition"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              ) : filteredScans().length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm mb-4">No scans found</p>
                  <button
                    type="button"
                    onClick={() => setShowAddScan(true)}
                    className="text-yellow-400 hover:text-yellow-300 transition flex items-center gap-2 mx-auto"
                  >
                    <Plus size={16} />
                    <span>Add your first scan</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredScans().map((scan) => (
                    <button
                      key={scan.id}
                      type="button"
                      onClick={() => handleSelectScan(scan)}
                      className={`w-full text-left p-3 rounded-lg transition ${selectedScan?.id === scan.id ? "bg-slate-700" : "hover:bg-slate-700/50"}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{scan.owner}/{scan.repo}</p>
                          <p className="text-xs text-slate-400">
                            {PROCESSING_GRADES.has(scan.grade)
                              ? "Processing..."
                              : `Scored: ${scan.score} | Grade: ${scan.grade}`}
                          </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${scan.score >= 90 ? "bg-green-500" : scan.score >= 70 ? "bg-yellow-500" : "bg-red-500"}`}>
                          {PROCESSING_GRADES.has(scan.grade) ? "..." : scan.grade.charAt(0)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-9">
            {selectedScan ? (
              <div className="space-y-8">
                <div className="bg-slate-800 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold">{selectedScan.owner}/{selectedScan.repo}</h2>
                      <p className="text-slate-400">
                        Last scanned: {new Date(selectedScan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <ScoreGauge score={selectedScan.score} category={selectedScan.grade} />
                      <button
                        type="button"
                        onClick={handleRescan}
                        disabled={isRescanning}
                        className={`bg-yellow-400 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${isRescanning ? "opacity-70 cursor-not-allowed" : "hover:bg-yellow-300"}`}
                      >
                        {isRescanning ? (
                          <span className="animate-spin">↻</span>
                        ) : (
                          <RefreshCw size={16} />
                        )}
                        <span>Re-scan</span>
                      </button>
                    </div>
                  </div>

                  {(isRescanning || isSubmittingScan) && (
                    <div className="mb-6 p-4 bg-slate-700 rounded-lg flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-400" />
                      <p className="text-sm text-slate-300">Scan in progress — results update automatically...</p>
                    </div>
                  )}

                  {detailError && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-200">
                      {detailError}
                    </div>
                  )}

                  {selectedScan.report ? (
                    <>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-700 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-slate-400 mb-2">Security</h3>
                          <p className="text-2xl font-bold">{selectedScan.report.security.vulnerabilityCount > 0 ? Math.max(10, 100 - selectedScan.report.security.vulnerabilityCount * 15) : 85}%</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-slate-400 mb-2">Quality</h3>
                          <p className="text-2xl font-bold">{selectedScan.report.quality.readmeScore}%</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-slate-400 mb-2">Market</h3>
                          <p className="text-2xl font-bold">{selectedScan.report.market.benchmarks.starRatingPercentile}%</p>
                        </div>
                      </div>

                      <QuickWinsList quickWins={quickWins} completedWins={completedWins} onToggleWin={(id) => setCompletedWins(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id])} />
                      <RoadmapBoard roadmap={roadmap} />
                      {selectedScan.compliance && (
                        <IsoComplianceCert
                          compliance={selectedScan.compliance}
                          repoOwner={selectedScan.owner}
                          repoName={selectedScan.repo}
                        />
                      )}
                    </>
                  ) : (
                    <p className="text-slate-400 text-center py-8">
                      {PROCESSING_GRADES.has(selectedScan.grade)
                        ? "Scan processing — report will appear when complete..."
                        : "No report available for this scan."}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-8 text-center">
                <p className="text-slate-400 mb-4">Select a scan from the left to view details</p>
                <button
                  type="button"
                  onClick={() => setShowAddScan(true)}
                  className="text-yellow-400 hover:text-yellow-300 transition flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} />
                  <span>Add your first scan</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddScan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Repository Scan</h3>
              <button type="button" onClick={() => setShowAddScan(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddScan}>
              <label className="block text-sm text-slate-400 mb-2" htmlFor="repo-url">
                GitHub repository URL or owner/repo
              </label>
              <input
                id="repo-url"
                type="text"
                value={newRepoUrl}
                onChange={(e) => setNewRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <button
                type="submit"
                disabled={isSubmittingScan}
                className="w-full bg-yellow-400 text-slate-900 py-2 rounded-lg font-medium hover:bg-yellow-300 disabled:opacity-60"
              >
                {isSubmittingScan ? "Submitting..." : "Start Scan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
