import React, { useState, useEffect } from 'react';
import { AdminLayout } from './Dashboard';
import { api, Student } from '../../lib/db';
import { Plus, Trash2, Edit3, X, Users, Activity, CheckCircle, Clock, Square, CheckSquare, Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Student>>({
    username: '', password: '', name: '', school: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<{student: Student, results: any[]} | null>(null);

  useEffect(() => {
    setStudents(api.getStudents());
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.name || !formData.school) {
      return alert("Username, Name, and School are required");
    }
    
    const exists = students.find(s => s.username === formData.username && s.id !== editingId);
    if (exists) {
      return alert("This username is already taken. Please choose another one.");
    }
    
    if (editingId) {
      api.updateStudent({ ...formData, id: editingId } as Student);
    } else {
      api.addStudent({ ...formData, id: 'STU-' + Date.now().toString(36) } as Student);
    }
    
    setStudents(api.getStudents());
    onCloseForm();
  };

  const handleEdit = (s: Student) => {
    setFormData(s);
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this student account? They will no longer be able to log in.")) {
      api.deleteStudent(id);
      setStudents(api.getStudents());
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected students?`)) {
      const remaining = students.filter(s => !selectedIds.includes(s.id));
      api.setStudents(remaining);
      setStudents(remaining);
      setSelectedIds([]);
    }
  };

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
        <button onClick={() => setShowForm(true)} className="btn btn-secondary shadow-sm w-full md:w-auto">
          <Plus size={20} /> Add Student
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
           <input 
            type="text" 
            placeholder="Search by name, school, or username..."
            className="input-field pl-12 bg-surface"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex gap-3">
           <button 
            onClick={toggleSelectAll} 
            className="btn btn-outline bg-surface text-text-main border-border text-sm flex items-center gap-2"
          >
            {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
            {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
          
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <button 
                onClick={handleBatchDelete}
                className="btn bg-danger text-white text-sm flex items-center gap-2 animate-in slide-in-from-right-4"
              >
                <Trash2 size={18} /> Delete ({selectedIds.length})
              </button>
            )}
          </AnimatePresence>
        </div>
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
              <label className="input-label">Username (NISN / ID)</label>
              <input 
                type="text" className="input-field" 
                placeholder="e.g. 123456789"
                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Password {editingId && <span className="text-xs text-text-muted font-normal underline">(Optional)</span>}</label>
              <input 
                type="text" className="input-field" 
                placeholder="Password"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" className="input-field" placeholder="e.g. Budi Santoso"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">School Name</label>
              <input 
                type="text" className="input-field" placeholder="e.g. SDN 1 Jakarta"
                value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})}
              />
            </div>

            <button type="submit" className="btn btn-secondary md:col-span-2 text-white text-lg py-3 mt-4">
              {editingId ? 'Update Account' : 'Save Account'}
            </button>
          </form>
        </div>
      )}

      <div className="card bg-surface p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Students List ({filteredStudents.length})</h2>
        </div>
        
        <div className="grid gap-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((s) => (
              <div 
                key={s.id} 
                className={`p-4 rounded-xl border-2 transition-all bg-background/50 flex flex-col md:flex-row gap-4 items-center justify-between ${
                  selectedIds.includes(s.id) ? 'border-secondary bg-secondary/5 shadow-md' : 'border-border hover:border-secondary/30'
                }`}
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => toggleSelect(s.id)}
                      className={`transition-colors ${selectedIds.includes(s.id) ? 'text-secondary' : 'text-text-muted hover:text-secondary'}`}
                    >
                      {selectedIds.includes(s.id) ? <CheckSquare size={24} /> : <Square size={24} />}
                    </button>

                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-xl border border-secondary/20">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                        {s.name} <span className="text-[10px] font-black bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full uppercase">{s.school}</span>
                      </h3>
                      <div className="text-sm text-text-muted font-medium mt-1">NISN: <span className="text-text-main font-bold">{s.username}</span> {s.password ? `• Pass: ${s.password}` : ''}</div>
                    </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <button 
                    onClick={() => {
                      const res = api.getResultsByStudent(s.id);
                      setHistoryData({ student: s, results: res });
                      setShowHistory(true);
                    }} 
                    className="btn btn-outline py-2 border-primary/30 text-primary hover:bg-primary/10" 
                  >
                    <Clock size={18} /> History
                  </button>
                  <button onClick={() => handleEdit(s)} className="btn btn-outline py-2 px-3 border-secondary/30 text-secondary hover:bg-secondary/10">
                    <Edit3 size={18} /> Edit
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="btn btn-outline py-2 border-danger/30 text-danger hover:bg-danger/10">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-12 text-text-muted border-2 border-dashed border-border rounded-xl font-bold">
              No student accounts match your filter.
            </div>
          )}
        </div>
      </div>

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
                historyData.results.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(r => (
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
