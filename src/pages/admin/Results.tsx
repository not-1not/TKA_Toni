import React, { useState, useEffect } from 'react';
import { AdminLayout } from './Dashboard';
import { api, Result } from '../../lib/db';
import { Download, Search, Edit3, Trash2, X, Save } from 'lucide-react';

const AdminResults = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setResults(api.getResults());
  }, []);

  const handleExportCSV = () => {
    if (results.length === 0) return;
    
    // Create CSV header
    const headers = ['Timestamp', 'Student Name', 'School', 'Correct', 'Wrong', 'Score'];
    
    // Create CSV rows
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
    link.setAttribute('download', `tka_results_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (result: Result) => {
    setEditingResult({ ...result });
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this result?')) {
      api.deleteResult(id);
      setResults(api.getResults());
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResult) {
      api.updateResult(editingResult);
      setResults(api.getResults());
      setShowEditModal(false);
      setEditingResult(null);
    }
  };

  const filteredResults = results.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8 border-b-2 border-border pb-4">
        <h1 className="text-3xl font-black text-text-main">Exam Results</h1>
        <button 
          onClick={handleExportCSV} 
          className="btn btn-secondary shadow-sm"
          disabled={results.length === 0}
        >
          <Download size={20} /> Export CSV
        </button>
      </div>

      <div className="card bg-surface">
        <div className="mb-6 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input 
              type="text" 
              placeholder="Search by student or school..." 
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-text-muted font-bold text-sm">
            Showing {filteredResults.length} records
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-text-muted uppercase tracking-wider text-sm">
                <th className="p-4 font-bold">Date / Time</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">School</th>
                <th className="p-4 font-bold text-center">Correct</th>
                <th className="p-4 font-bold text-center">Wrong</th>
                <th className="p-4 font-bold text-center text-primary">Score</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map(r => (
                  <tr key={r.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="p-4 text-sm">{new Date(r.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-bold text-text-main">{r.studentName}</td>
                    <td className="p-4 text-text-muted">{r.school}</td>
                    <td className="p-4 text-center font-bold text-secondary">{r.correct}</td>
                    <td className="p-4 text-center font-bold text-danger">{r.wrong}</td>
                    <td className="p-4 text-center font-black text-xl text-primary">{r.score}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(r)}
                          className="p-2 text-text-muted hover:text-warning hover:bg-warning/10 rounded-lg transition-colors"
                          title="Edit Result"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(r.id)}
                          className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Delete Result"
                        >
                          <Trash2 size={18} />
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
      </div>

      {/* Edit Modal */}
      {showEditModal && editingResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl p-6 border-2 border-primary animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit Exam Result</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-text-muted hover:text-danger transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="bg-background/50 p-3 rounded-lg border border-border mb-4">
                <p className="text-sm font-bold text-text-muted mb-1 uppercase tracking-wider">Student</p>
                <p className="font-black text-text-main">{editingResult.studentName}</p>
                <p className="text-sm text-text-muted">{editingResult.school}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Correct Answers</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={editingResult.correct}
                    onChange={e => setEditingResult({...editingResult, correct: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Wrong Answers</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={editingResult.wrong}
                    onChange={e => setEditingResult({...editingResult, wrong: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Final Score</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="input-field text-2xl font-black text-primary bg-primary/5" 
                  value={editingResult.score}
                  onChange={e => setEditingResult({...editingResult, score: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary flex-1 gap-2"
                >
                  <Save size={20} /> Save Changes
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
