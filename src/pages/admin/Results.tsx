import React, { useState, useEffect } from 'react';
import { AdminLayout } from './Dashboard';
import { api, Result, Question } from '../../lib/db';
import { Download, Search, Edit3, Trash2, X, Save, BarChart3 } from 'lucide-react';
import { AnswerAnalysis } from '../../components/AnswerAnalysis';

const AdminResults = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const data = await api.getResults();
      const allQuestions = await api.getQuestions();
      setResults(data);
      setQuestions(allQuestions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = ['Timestamp', 'Student Name', 'School', 'Correct', 'Wrong', 'Score'];
    const rows = results.map(r => [
      new Date(r.timestamp).toLocaleString(),
      r.studentName,
      r.school,
      r.correct,
      r.wrong,
      r.score
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tka_results_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (result: Result) => {
    setEditingResult({ ...result });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this result?')) {
      setIsLoading(true);
      try {
          await api.deleteResult(id);
          await fetchResults();
      } catch (err) {
          alert("Failed to delete result");
      } finally {
          setIsLoading(false);
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResult) {
      setIsLoading(true);
      try {
          await api.updateResult(editingResult);
          await fetchResults();
          setShowEditModal(false);
          setEditingResult(null);
      } catch (err) {
          alert("Failed to update result");
      } finally {
          setIsLoading(false);
      }
    }
  };

  const filteredResults = results.filter(r =>
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      {!showAnalysis ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 border-b border-border pb-4 gap-4">
            <h1 className="text-2xl sm:text-3xl font-black text-text-main">Exam Results</h1>
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary shadow-sm w-full sm:w-auto text-sm sm:text-base"
              disabled={results.length === 0}
            >
              <Download size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>

          <div className="card bg-surface">
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="input-field pl-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-text-muted font-bold text-xs sm:text-sm whitespace-nowrap flex items-center gap-3">
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
                {filteredResults.length} records
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background border-b border-border text-text-muted uppercase tracking-wider text-xs sm:text-sm">
                    <th className="p-3 sm:p-4 font-bold">Date / Time</th>
                    <th className="p-3 sm:p-4 font-bold">Student Name</th>
                    <th className="p-3 sm:p-4 font-bold">School</th>
                    <th className="p-3 sm:p-4 font-bold text-center">Correct</th>
                    <th className="p-3 sm:p-4 font-bold text-center">Wrong</th>
                    <th className="p-3 sm:p-4 font-bold text-center text-primary">Score</th>
                    <th className="p-3 sm:p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length > 0 ? (
                    filteredResults.map(r => (
                      <tr key={r.id} className="border-b border-border hover:bg-background/50 transition-colors">
                        <td className="p-3 sm:p-4 text-xs sm:text-sm">{new Date(r.timestamp).toLocaleString()}</td>
                        <td className="p-3 sm:p-4 font-bold text-text-main text-sm sm:text-base">{r.studentName}</td>
                        <td className="p-3 sm:p-4 text-text-muted text-xs sm:text-sm">{r.school}</td>
                        <td className="p-3 sm:p-4 text-center font-bold text-secondary text-sm sm:text-base">{r.correct}</td>
                        <td className="p-3 sm:p-4 text-center font-bold text-danger text-sm sm:text-base">{r.wrong}</td>
                        <td className="p-3 sm:p-4 text-center font-black text-xl text-primary">{r.score}%</td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            {r.answerDetails && r.answerDetails.length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedResult(r);
                                  setShowAnalysis(true);
                                }}
                                className="p-1.5 sm:p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="View Answer Analysis"
                              >
                                <BarChart3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-1.5 sm:p-2 text-text-muted hover:text-warning hover:bg-warning/10 rounded-lg transition-colors"
                              title="Edit Result"
                            >
                              <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="p-1.5 sm:p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                              title="Delete Result"
                            >
                              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-text-muted">
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredResults.length > 0 ? (
                filteredResults.map(r => (
                  <div key={r.id} className="bg-background rounded-xl border border-border p-4 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-text-main text-base">{r.studentName}</div>
                        <div className="text-xs text-text-muted">{r.school}</div>
                        <div className="text-[10px] text-text-muted mt-1">{new Date(r.timestamp).toLocaleString()}</div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg font-black text-lg ${r.score >= 70 ? 'bg-secondary/10 text-secondary' : r.score >= 50 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                        {r.score}%
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 text-xs">
                        <span className="text-secondary font-bold">✓ {r.correct}</span>
                        <span className="text-danger font-bold">✗ {r.wrong}</span>
                      </div>
                      <div className="flex gap-1">
                        {r.answerDetails && r.answerDetails.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedResult(r);
                              setShowAnalysis(true);
                            }}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <BarChart3 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-2 text-text-muted hover:text-warning hover:bg-warning/10 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-text-muted">
                  No results found.
                </div>
              )}
            </div>
          </div>
        </>
      ) : selectedResult && selectedResult.answerDetails ? (
        /* Analysis View */
        <div className="animate-fade-in">
          <button
            onClick={() => {
              setShowAnalysis(false);
              setSelectedResult(null);
            }}
            className="btn btn-outline mb-6 py-2 px-4"
          >
            ← Back to Results
          </button>

          <div className="card border-2 border-border/50 p-6 mb-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Analisis Jawaban Siswa</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-xs font-bold text-text-muted uppercase mb-1">Nama Siswa</div>
                <div className="text-lg font-bold text-text-main">{selectedResult.studentName}</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-xs font-bold text-text-muted uppercase mb-1">Sekolah</div>
                <div className="text-lg font-bold text-text-main">{selectedResult.school}</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-xs font-bold text-text-muted uppercase mb-1">Nilai</div>
                <div className="text-2xl font-black text-primary">{selectedResult.score}%</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-xs font-bold text-text-muted uppercase mb-1">Waktu</div>
                <div className="text-sm font-bold text-text-main">{new Date(selectedResult.timestamp).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="card border-2 border-border/50 p-6">
            <AnswerAnalysis answerDetails={selectedResult.answerDetails} allQuestions={questions} />
          </div>

          <div className="flex justify-center mt-8 pb-8">
            <button
              onClick={() => {
                setShowAnalysis(false);
                setSelectedResult(null);
              }}
              className="btn btn-outline py-3 px-8"
            >
              ← Back to Results
            </button>
          </div>
        </div>
      ) : null}

      {/* Edit Modal */}
      {showEditModal && editingResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl p-5 sm:p-6 border-2 border-primary animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold">Edit Exam Result</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-text-muted hover:text-danger transition-colors p-1"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 sm:space-y-4">
              <div className="bg-background/50 p-3 rounded-lg border border-border mb-4">
                <p className="text-xs font-bold text-text-muted mb-1 uppercase tracking-wider">Student</p>
                <p className="font-black text-text-main text-sm sm:text-base">{editingResult.studentName}</p>
                <p className="text-xs sm:text-sm text-text-muted">{editingResult.school}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="input-group">
                  <label className="input-label text-xs sm:text-sm" htmlFor="edit-correct">Correct</label>
                  <input
                    id="edit-correct"
                    type="number"
                    className="input-field text-sm sm:text-base"
                    placeholder="Correct answers"
                    value={editingResult.correct}
                    onChange={e => setEditingResult({ ...editingResult, correct: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label text-xs sm:text-sm" htmlFor="edit-wrong">Wrong</label>
                  <input
                    id="edit-wrong"
                    type="number"
                    className="input-field text-sm sm:text-base"
                    placeholder="Wrong answers"
                    value={editingResult.wrong}
                    onChange={e => setEditingResult({ ...editingResult, wrong: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label text-xs sm:text-sm" htmlFor="edit-score">Final Score</label>
                <input
                  id="edit-score"
                  type="number"
                  step="0.01"
                  className="input-field text-xl sm:text-2xl font-black text-primary bg-primary/5 text-sm sm:text-base"
                  placeholder="Score percentage"
                  value={editingResult.score}
                  onChange={e => setEditingResult({ ...editingResult, score: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-outline flex-1 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <Save size={16} className="sm:w-5 sm:h-5" /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminResults;
