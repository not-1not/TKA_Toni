import React, { useState, useEffect } from 'react';
import { AdminLayout } from './Dashboard';
import { api, Question, Statement } from '../../lib/db';
import { Plus, Trash2, Edit3, X, GripVertical, CheckSquare, Square, Filter } from 'lucide-react';
import { Reorder, AnimatePresence } from 'framer-motion';

const QuestionBank = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterSubject, setFilterSubject] = useState('All');
  const [showForm, setShowForm] = useState(false);
  
  const initialFormData: Partial<Question> = {
    subject: '', 
    question: '', 
    type: 'pilihan_ganda',
    option_a: '', 
    option_b: '', 
    option_c: '', 
    option_d: '', 
    correct_answer: 'A',
    statements: [
      { text: '', isCorrect: false, correctAnswer: 'Sesuai' },
      { text: '', isCorrect: false, correctAnswer: 'Sesuai' },
      { text: '', isCorrect: false, correctAnswer: 'Sesuai' },
    ],
    image: ''
  };

  const [formData, setFormData] = useState<Partial<Question>>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const data = api.getQuestions();
    setQuestions(data);
  }, []);

  const subjects = ['All', ...Array.from(new Set(api.getQuestions().map(q => q.subject)))];

  const filteredQuestions = filterSubject === 'All' 
    ? questions 
    : questions.filter(q => q.subject === filterSubject);

  const handleReorder = (newOrder: Question[]) => {
    if (filterSubject !== 'All') return; // Reorder only in 'All' view for simplicity
    setQuestions(newOrder);
    api.setQuestions(newOrder);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.question) return alert("Subject and Question required");
    
    const newQuestion = { ...formData, id: editingId || 'Q-' + Date.now().toString(36) } as Question;
    
    if (editingId) {
      api.updateQuestion(newQuestion);
    } else {
      api.addQuestion(newQuestion);
    }
    
    setQuestions(api.getQuestions());
    onCloseForm();
  };

  const handleEdit = (q: Question) => {
    setFormData({
      ...initialFormData,
      ...q,
      statements: q.statements || initialFormData.statements
    });
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this question?")) {
      api.deleteQuestion(id);
      setQuestions(api.getQuestions());
    }
  };

  const onCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const updateStatement = (index: number, field: keyof Statement, value: any) => {
    const newStatements = [...(formData.statements || [])];
    newStatements[index] = { ...newStatements[index], [field]: value };
    setFormData({ ...formData, statements: newStatements });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map(q => q.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected questions?`)) {
      const remaining = questions.filter(q => !selectedIds.includes(q.id));
      api.setQuestions(remaining);
      setQuestions(remaining);
      setSelectedIds([]);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b-2 border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main">Question Bank</h1>
          <p className="text-sm text-text-muted font-bold">Manage and organize your exam material</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setShowForm(true)} className="btn btn-primary flex-1 md:flex-none">
            <Plus size={20} /> Add Question
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {subjects.map(s => (
            <button 
              key={s}
              onClick={() => {
                setFilterSubject(s);
                setSelectedIds([]);
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${
                filterSubject === s 
                ? 'bg-primary border-primary text-white shadow-md scale-105' 
                : 'bg-surface border-border text-text-muted hover:border-primary/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={toggleSelectAll} 
            className="btn btn-outline bg-surface text-text-main border-border text-sm flex items-center gap-2"
          >
            {selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
            {selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? 'Deselect All' : 'Select All'}
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
        <div className="card bg-surface border-2 border-warning mb-8 animate-fade-in relative shadow-xl p-6">
          <button onClick={onCloseForm} className="absolute top-4 right-4 text-text-muted hover:text-danger">
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Question' : 'Create New Question'}</h2>
          
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="input-group">
              <label className="input-label">Subject Category</label>
              <input 
                type="text" className="input-field" placeholder="e.g. Mathematics, Science"
                value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Question Type</label>
              <select 
                className="input-field"
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="pilihan_ganda">Pilihan Ganda (Single Choice)</option>
                <option value="pilihan_ganda_kompleks">Pilihan Ganda Kompleks (Choose 2 of 3)</option>
                <option value="multiple_choice_multiple_answer">MCMA (Sesuai / Tidak Sesuai)</option>
              </select>
            </div>
            
            <div className="input-group md:col-span-2">
              <label className="input-label">Question Text</label>
              <textarea 
                className="input-field min-h-[100px]" placeholder="Type your full question here..."
                value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})}
              />
            </div>

            <div className="input-group md:col-span-2">
              <label className="input-label">Image URL (Optional)</label>
              <input 
                type="text" className="input-field" placeholder="https://example.com/image.jpg"
                value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})}
              />
              {formData.image && (
                <div className="mt-2 p-2 border border-border rounded-lg bg-background inline-block">
                  <img src={formData.image} alt="Preview" className="max-h-32 rounded object-contain" />
                </div>
              )}
            </div>
            
            {formData.type === 'pilihan_ganda' && (
              <>
                <div className="input-group">
                  <label className="input-label">Option A</label>
                  <input type="text" className="input-field border-primary/30" value={formData.option_a} onChange={e => setFormData({...formData, option_a: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Option B</label>
                  <input type="text" className="input-field border-primary/30" value={formData.option_b} onChange={e => setFormData({...formData, option_b: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Option C</label>
                  <input type="text" className="input-field border-primary/30" value={formData.option_c} onChange={e => setFormData({...formData, option_c: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Option D</label>
                  <input type="text" className="input-field border-primary/30" value={formData.option_d} onChange={e => setFormData({...formData, option_d: e.target.value})} />
                </div>
                <div className="input-group md:col-span-2">
                  <label className="input-label">Correct Answer</label>
                  <select 
                    className="input-field text-lg font-bold bg-secondary/10 border-secondary/50 text-secondary"
                    value={formData.correct_answer} 
                    onChange={e => setFormData({...formData, correct_answer: e.target.value as 'A'|'B'|'C'|'D'})}
                  >
                    <option value="A">Choice A</option>
                    <option value="B">Choice B</option>
                    <option value="C">Choice C</option>
                    <option value="D">Choice D</option>
                  </select>
                </div>
              </>
            )}

            {(formData.type === 'pilihan_ganda_kompleks' || formData.type === 'multiple_choice_multiple_answer') && (
              <div className="md:col-span-2 space-y-4">
                <label className="input-label">Statements (3 total)</label>
                {formData.statements?.map((s, i) => (
                  <div key={i} className="flex gap-4 items-center bg-background/30 p-3 rounded-lg border border-border">
                    <span className="font-bold text-primary">{i+1}.</span>
                    <input 
                      type="text" className="input-field flex-1" placeholder={`Statement ${i+1}`}
                      value={s.text} onChange={e => updateStatement(i, 'text', e.target.value)}
                    />
                    {formData.type === 'pilihan_ganda_kompleks' ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" className="w-5 h-5" 
                          checked={s.isCorrect} onChange={e => updateStatement(i, 'isCorrect', e.target.checked)}
                        />
                        <span className="text-xs font-bold">Benar</span>
                      </div>
                    ) : (
                      <select 
                        className="input-field w-32"
                        value={s.correctAnswer} onChange={e => updateStatement(i, 'correctAnswer', e.target.value)}
                      >
                        <option value="Sesuai">Sesuai</option>
                        <option value="Tidak Sesuai">Tidak Sesuai</option>
                        <option value="Benar">Benar</option>
                        <option value="Salah">Salah</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="btn btn-warning md:col-span-2 text-white text-lg py-3 mt-4">
              {editingId ? 'Update Question' : 'Save New Question'}
            </button>
          </form>
        </div>
      )}

      <div className="card bg-surface p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Filter size={20} className="text-primary" />
            {filterSubject === 'All' ? 'All Questions' : `${filterSubject} Questions`} ({filteredQuestions.length})
          </h2>
          {filterSubject === 'All' ? (
             <p className="text-xs text-text-muted italic">Drag the handle to reorder questions.</p>
          ) : (
             <p className="text-xs text-warning font-bold italic">Reorder disabled in filter view.</p>
          )}
        </div>
        
        <Reorder.Group 
          axis="y" 
          values={questions} 
          onReorder={handleReorder}
          className="space-y-4"
        >
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((q) => (
              <Reorder.Item 
                key={q.id} 
                value={q}
                dragListener={filterSubject === 'All'}
                className={`p-4 rounded-xl border-2 transition-all flex gap-4 ${
                  selectedIds.includes(q.id) 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/30 bg-background/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                   <div 
                    className={`p-1 transition-colors ${filterSubject === 'All' ? 'cursor-grab active:cursor-grabbing text-text-muted hover:text-primary' : 'text-text-muted/20'}`}
                    title={filterSubject === 'All' ? "Drag to reorder" : "Filtering active"}
                   >
                     <GripVertical size={24} />
                   </div>
                   <button 
                    onClick={() => toggleSelect(q.id)}
                    className={`transition-colors ${selectedIds.includes(q.id) ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
                   >
                     {selectedIds.includes(q.id) ? <CheckSquare size={24} /> : <Square size={24} />}
                   </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">{q.subject}</span>
                    <span className="text-[10px] font-black bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {q.type === 'pilihan_ganda' ? 'Single Choice' : 
                       q.type === 'pilihan_ganda_kompleks' ? 'PG Kompleks' : 'MCMA'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text-main mb-2 leading-tight">{q.question}</h3>
                  
                  {q.image && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-border bg-background">
                      <img src={q.image} alt="Question" className="max-h-48 w-full object-contain" />
                    </div>
                  )}
                  
                  {q.type === 'pilihan_ganda' ? (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-text-muted font-medium">
                      <div className={q.correct_answer === 'A' ? 'text-secondary font-bold' : ''}><span className="opacity-50 mr-1">A.</span> {q.option_a}</div>
                      <div className={q.correct_answer === 'B' ? 'text-secondary font-bold' : ''}><span className="opacity-50 mr-1">B.</span> {q.option_b}</div>
                      <div className={q.correct_answer === 'C' ? 'text-secondary font-bold' : ''}><span className="opacity-50 mr-1">C.</span> {q.option_c}</div>
                      <div className={q.correct_answer === 'D' ? 'text-secondary font-bold' : ''}><span className="opacity-50 mr-1">D.</span> {q.option_d}</div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {q.statements?.map((s, i) => (
                        <div key={i} className="text-sm flex gap-2 items-center">
                          <span className="text-xs font-bold bg-border/50 w-5 h-5 flex items-center justify-center rounded-full text-text-muted">{i+1}</span>
                          <span className="text-text-main font-medium">{s.text}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-secondary/10 text-secondary ml-auto border border-secondary/20">
                            {q.type === 'pilihan_ganda_kompleks' ? (s.isCorrect ? 'BENAR' : 'SALAH') : s.correctAnswer?.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 justify-start border-l border-border pl-4">
                  <button onClick={() => handleEdit(q)} className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:bg-warning/10 hover:text-warning transition-colors" title="Edit">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:bg-danger/10 hover:text-danger transition-colors" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </Reorder.Item>
            ))
          ) : (
            <div className="text-center p-12 text-text-muted border-2 border-dashed border-border rounded-2xl flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
                <Filter size={32} />
              </div>
              <p className="font-bold text-lg">No questions found</p>
            </div>
          )}
        </Reorder.Group>
      </div>
    </AdminLayout>
  );
};

export default QuestionBank;
