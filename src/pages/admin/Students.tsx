import React, { useState, useEffect } from 'react';
import { AdminLayout } from './Dashboard';
import { api, Student } from '../../lib/db';
import { Plus, Trash2, Edit3, X, Users, Activity, CheckCircle, Clock, Square, CheckSquare, Search, Upload } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState<string>('All');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Partial<Student>>({
    username: '', password: '', name: '', school: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [historyData, setHistoryData] = useState<{ student: Student, results: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s =>
    (filterSchool === 'All' || s.school === filterSchool) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownloadCSV = () => {
    if (filteredStudents.length === 0) {
      alert('No students to download. Apply filters first.');
      return;
    }

    const csvHeaders = ['ID', 'Username', 'Name', 'School', 'Password'];
    const csvRows = filteredStudents.map(s => [
      s.id || '',
      s.username || '',
      `"${(s.name || '').replace(/"/g, '""')}"`,
      s.school || '',
      s.password || ''
    ].map(cell => 
      typeof cell === 'string' && cell.includes(',') && !cell.startsWith('"') ? `"${cell.replace(/"/g, '""')}"` : cell
    ).join(','));

    const content = [csvHeaders.join(','), ...csvRows].join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
    const filename = `students_${new Date().toISOString().split('T')[0]}.csv`;
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    alert(`Downloaded ${filteredStudents.length} students as ${filename}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.name || !formData.school) {
      return alert("Username, Name, and School are required");
    }

    const exists = students.find(s => s.username === formData.username && s.id !== editingId);
    if (exists) {
      return alert("This username is already taken. Please choose another one.");
    }

    setIsLoading(true);
    try {
      if (editingId) {
        await api.updateStudent({ ...formData, id: editingId } as Student);
      } else {
        await api.addStudent({ ...formData, id: 'STU-' + Date.now().toString(36) } as Student);
      }
      await fetchStudents();
      onCloseForm();
    } catch (err: any) {
      console.error("Failed to save student:", err);
      const message = err?.message || err?.toString() || "Unknown error";
      alert(`Failed to save student: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (s: Student) => {
    setFormData(s);
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this student account? They will no longer be able to log in.")) {
      setIsLoading(true);
      try {
        await api.deleteStudent(id);
        await fetchStudents();
        setSelectedIds(prev => prev.filter(i => i !== id));
      } catch (err) {
        alert("Failed to delete student");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected student accounts? This action cannot be undone.`)) return;

    setIsLoading(true);
    try {
      await api.deleteStudents(selectedIds); // Need to add this to api
      await fetchStudents();
      setSelectedIds([]);
      alert("Students deleted successfully");
    } catch (err) {
      alert("Failed to delete students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkMoveSchool = async (targetSchool: string) => {
    if (selectedIds.length === 0) return;
    if (targetSchool === 'New') {
      const name = prompt("Enter new school name:");
      if (!name) return;
      targetSchool = name;
    }
    if (!confirm(`Move ${selectedIds.length} students to school "${targetSchool}"?`)) return;

    setIsLoading(true);
    try {
      const selectedStus = students.filter(s => selectedIds.includes(s.id));
      const updatedStus = selectedStus.map(s => ({ ...s, school: targetSchool }));
      await api.setStudents(updatedStus);
      await fetchStudents();
      setSelectedIds([]);
      alert("Students updated successfully");
    } catch (err) {
      alert("Failed to move students");
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueSchools = Array.from(new Set(students.map(s => s.school).filter(Boolean)));

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAdd = async () => {
    if (!bulkText.trim()) return;
    setIsLoading(true);
    try {
      const lines = bulkText.split('\n').filter(l => l.trim());
      const newStudents: Student[] = lines.map(line => {
        // Support tab or comma or semicolon
        const parts = line.split(/[\t,;]/).map(p => p.trim());
        const username = parts[0] || '';
        const name = parts[1] || 'New Student';
        const school = parts[2] || 'Umum';
        const password = parts[3] || 'siswa123';

        return {
          id: 'STU-' + Math.random().toString(36).substring(2, 9),
          username,
          name,
          school,
          password
        };
      }).filter(s => s.username);

      if (newStudents.length === 0) throw new Error("No valid data found");

      await api.setStudents(newStudents);
      await fetchStudents();
      setShowBulkAdd(false);
      setBulkText('');
      alert(`Successfully added ${newStudents.length} students!`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ username: '', password: '', name: '', school: '' });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b-2 border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main flex items-center gap-3">
            <Users className="text-secondary" /> Student Accounts
          </h1>
          <p className="text-sm text-text-muted font-bold mt-1">Manage student access and view histories</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
          <button onClick={() => setShowBulkAdd(true)} className="btn btn-outline border-secondary text-secondary hover:bg-secondary/5 shadow-sm flex-1 md:flex-none">
            <Upload size={20} /> Bulk Add
          </button>
          <button 
            onClick={handleDownloadCSV}
            disabled={filteredStudents.length === 0}
            className="btn btn-outline border-accent text-accent hover:bg-accent/5 shadow-sm flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            title="Download students as CSV"
          >
            <Upload size={20} className="rotate-180" /> CSV
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary shadow-lg flex-1 md:flex-none">
            <Plus size={20} /> Add Student
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        {/* School Filter Bar */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Filter by School</label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => { setFilterSchool('All'); setSelectedIds([]); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${filterSchool === 'All'
                  ? 'bg-secondary border-secondary text-white shadow-md'
                  : 'bg-surface border-border text-text-muted hover:border-secondary/50'
                }`}
            >
              All Schools ({students.length})
            </button>
            {uniqueSchools.map(school => (
              <button
                key={school}
                onClick={() => { setFilterSchool(school); setSelectedIds([]); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${filterSchool === school
                    ? 'bg-secondary border-secondary text-white shadow-md'
                    : 'bg-surface border-border text-text-muted hover:border-secondary/50'
                  }`}
              >
                {school} ({students.filter(s => s.school === school).length})
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search name, school, or username..."
              className="input-field pl-9 py-2 text-sm bg-surface"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              title="Search students"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={toggleSelectAll}
              className="btn btn-outline py-2 px-4 border-border text-sm flex items-center gap-2 bg-surface"
            >
              {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
              <span className="hidden sm:inline">{selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? 'Deselect All' : 'Select All'}</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-secondary/5 border-2 border-secondary/20 rounded-xl relative overflow-hidden animate-in slide-in-from-top-4">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
              <span className="text-sm font-black text-secondary uppercase tracking-widest">{selectedIds.length} Selected</span>
              <div className="h-6 w-[2px] bg-secondary/20 mx-2" />
              <div className="flex gap-2 flex-wrap flex-1">
                <select
                  onChange={(e) => handleBulkMoveSchool(e.target.value)}
                  value=""
                  className="input-field py-1 px-3 text-xs w-auto bg-white border-secondary/30 text-secondary font-bold"
                  title="Change school of selected students"
                >
                  <option value="" disabled>Change School...</option>
                  {uniqueSchools.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="New">+ Add New School</option>
                </select>
                <button
                  onClick={handleBatchDelete}
                  className="flex items-center gap-2 px-3 py-1 text-xs font-bold text-danger hover:bg-danger/10 rounded-lg transition-colors border border-danger/20"
                  title="Delete selected students"
                >
                  <Trash2 size={14} /> Delete Selected
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs font-bold text-text-muted hover:underline"
                >Cancel</button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {showForm && (
        <div className="card bg-surface border-2 border-secondary mb-8 animate-fade-in relative shadow-xl p-6">
          <button onClick={onCloseForm} className="absolute top-4 right-4 text-text-muted hover:text-danger">
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users className="text-secondary" /> {editingId ? 'Edit Student Account' : 'Create Student Account'}
          </h2>

          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="input-group">
              <label className="input-label" htmlFor="stu-username">Username (NISN / ID)</label>
              <input
                id="stu-username"
                type="text" className="input-field"
                placeholder="e.g. 123456789"
                value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                title="Username or NISN"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="stu-password">Password {editingId && <span className="text-xs text-text-muted font-normal underline">(Optional)</span>}</label>
              <input
                id="stu-password"
                type="text" className="input-field"
                placeholder="Password"
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                title="Password"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="stu-name">Full Name</label>
              <input
                id="stu-name"
                type="text" className="input-field" placeholder="e.g. Budi Santoso"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                title="Full Name"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="stu-school">School Name</label>
              <input
                id="stu-school"
                type="text" className="input-field" placeholder="e.g. SDN 1 Jakarta"
                value={formData.school} onChange={e => setFormData({ ...formData, school: e.target.value })}
                title="School Name"
              />
            </div>

            <button type="submit" className="btn bg-secondary hover:bg-secondary/90 md:col-span-2 text-white text-lg py-3 mt-4">
              {editingId ? 'Update Account' : 'Save Account'}
            </button>
          </form>
        </div>
      )}

      <div className="card bg-surface p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Students List ({filteredStudents.length})</h2>
          {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary"></div>}
        </div>

        <div className="overflow-x-auto rounded-xl border-2 border-border bg-background/50">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface border-b-2 border-border text-text-muted uppercase tracking-widest text-[10px] font-black">
                <th className="p-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="text-text-muted hover:text-secondary transition-colors">
                    {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th className="p-4 w-16 text-center">No</th>
                <th className="p-4 w-16">Icon</th>
                <th className="p-4">Student Name</th>
                <th className="p-4 w-40">School</th>
                <th className="p-4 w-40">Username / NISN</th>
                <th className="p-4 w-32">Password</th>
                <th className="p-4 w-48 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id} className={`border-b border-border transition-colors hover:bg-secondary/5 ${selectedIds.includes(s.id) ? 'bg-secondary/10' : ''}`}>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleSelect(s.id)}
                        className={`transition-colors ${selectedIds.includes(s.id) ? 'text-secondary' : 'text-text-muted hover:text-secondary'}`}
                      >
                        {selectedIds.includes(s.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="p-4 text-center text-sm font-bold text-text-muted">{idx + 1}</td>
                    <td className="p-4">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-xs border border-secondary/20">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-text-main text-sm">{s.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-[10px] font-black uppercase border border-secondary/20">
                        {s.school}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs">{s.username}</td>
                    <td className="p-4 text-xs text-text-muted font-medium">{s.password || '-'}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={async () => {
                            const res = await api.getResultsByStudent(s.id);
                            setHistoryData({ student: s, results: res });
                            setShowHistory(true);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                          title="View History"
                        >
                          <Clock size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(s)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/10 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-text-muted font-bold italic">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Add Modal */}
      {showBulkAdd && (
        <div className="fixed inset-0 bg-text-main/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-text-main">
          <div className="card bg-surface max-w-2xl w-full border-4 border-secondary shadow-2xl relative">
            <button onClick={() => setShowBulkAdd(false)} className="absolute top-4 right-4 text-text-muted hover:text-danger">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <Upload className="text-secondary" /> Bulk Import Students
            </h2>
            <p className="text-sm text-text-muted mb-4 font-bold">
              Paste from Excel or Google Sheets. Format: <span className="text-secondary bg-secondary/10 px-1 rounded">NISN | Name | School | Password</span>
            </p>
            <textarea
              className="input-field h-64 font-mono text-sm mb-6"
              placeholder="123456	Budi Santoso	SDN 1 Jakarta	pass123&#10;789012	Siti Aminah	SDN 2 Jakarta	pass456"
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              title="Paste student data here"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowBulkAdd(false)}
                className="btn btn-outline flex-1 py-4 uppercase tracking-widest text-xs"
              >Cancel</button>
              <button
                onClick={handleBulkAdd}
                disabled={isLoading || !bulkText.trim()}
                className="btn btn-primary flex-1 py-4 uppercase tracking-widest text-xs"
              >
                {isLoading ? 'Processing...' : `Add ${bulkText.split('\n').filter(l => l.trim()).length} Students`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && historyData && (
        <div className="fixed inset-0 bg-text-main/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card bg-surface max-w-2xl w-full max-h-[80vh] flex flex-col relative border-4 border-white shadow-2xl">
            <button onClick={() => setShowHistory(false)} className="absolute top-4 right-4 text-text-muted hover:text-danger z-10">
              <X size={24} />
            </button>
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-black text-text-main flex items-center gap-3">
                <Activity className="text-primary" /> History: {historyData.student.name}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {historyData.results.length > 0 ? (
                historyData.results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(r => (
                  <div key={r.id} className="p-4 bg-background rounded-xl border border-border flex justify-between items-center group hover:border-primary/50 transition-colors">
                    <div>
                      <div className="font-black text-text-main flex items-center gap-2">
                        <CheckCircle size={16} className="text-secondary" /> {new Date(r.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs font-bold text-text-muted mt-1 uppercase tracking-tighter">
                        Correct: {r.correct} • Wrong: {r.wrong}
                      </div>
                    </div>
                    <div className={`text-3xl font-black ${r.score >= 70 ? 'text-secondary' : r.score >= 50 ? 'text-warning' : 'text-danger'}`}>
                      {r.score}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 flex flex-col items-center gap-4 text-text-muted">
                  <Activity size={48} className="opacity-10" />
                  <p className="font-bold">No history available for this student.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border bg-background/50 text-right">
              <button onClick={() => setShowHistory(false)} className="btn btn-primary px-8">Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Students;
