import React, { useRef } from 'react';
import { AdminLayout } from './Dashboard';
import { Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, Student, Question, Statement } from '../../lib/db';

const Import = () => {
  const questionInputRef = useRef<HTMLInputElement>(null);
  const studentInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = React.useState<{type: 'success'|'error'|'loading', message: string} | null>(null);

  const downloadTemplate = (type: 'questions' | 'students') => {
    let headers = '';
    let rows = '';
    let filename = '';

    if (type === 'questions') {
      headers = 'subject,question,type,option_a,option_b,option_c,option_d,correct_answer,s1_text,s1_ans,s2_text,s2_ans,s3_text,s3_ans,image';
      rows = 'IPA,Apa ibu kota Indonesia?,pilihan_ganda,Jakarta,Bandung,Surabaya,Medan,A,,,,,,,https://placehold.co/600x400?text=Jakarta\n' +
             'IPA,Pernyataan tentang mamalia,pilihan_ganda_kompleks,,,,, ,Bernapas dengan paru-paru,Benar,Memiliki daun telinga,Benar,Bertelur,Salah,\n' +
             'BI,Kesesuaian tata surya,multiple_choice_multiple_answer,,,,, ,Bumi mengelilingi matahari,Sesuai,Matahari adalah planet,Tidak Sesuai,Pluto adalah planet kerdil,Sesuai,';
      filename = 'template_soal.csv';
    } else {
      headers = 'username,password,name,school';
      rows = 'siswa01,pass123,Budi Santoso,SDN 01 Jakarta\nsiswa02,pass123,Siti Aminah,SDN 01 Jakarta';
      filename = 'template_siswa.csv';
    }

    const content = headers + '\n' + rows;
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'questions' | 'students') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setStatus({ type: 'loading', message: 'Memproses file...' });

      try {
        if (type === 'students') {
          const students = api.parseStudentCSV(text);
          const current = api.getStudents();
          const all = [...current, ...students];
          // Deduplicate by username
          const unique = Array.from(new Map(all.map(s => [s.username.toLowerCase(), s])).values());
          api.setStudents(unique);
          setStatus({ type: 'success', message: `Berhasil mengimport ${students.length} siswa (Duplikat username diabaikan).` });
        } else {
          const questions = api.parseQuestionCSV(text);
          const current = api.getQuestions();
          const all = [...current, ...questions];
          // Deduplicate by question text
          const unique = Array.from(new Map(all.map(q => [q.question, q])).values());
          api.setQuestions(unique);
          setStatus({ type: 'success', message: `Berhasil mengimport ${questions.length} soal (Duplikat otomatis diabaikan).` });
        }
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', message: 'Gagal mengimport file. Pastikan format sesuai template.' });
      }
      
      if (e.target) e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight">Import Data</h1>
          <p className="text-text-muted mt-2 font-medium">Bulk import students or questions from CSV file.</p>
        </div>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${status.type === 'success' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
          {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <span className="font-bold">{status.message}</span>
          <button onClick={() => setStatus(null)} className="ml-auto text-xs uppercase font-black hover:underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <input 
          type="file" accept=".csv" ref={questionInputRef} className="hidden" 
          onChange={(e) => handleFileUpload(e, 'questions')} 
        />
        <input 
          type="file" accept=".csv" ref={studentInputRef} className="hidden" 
          onChange={(e) => handleFileUpload(e, 'students')} 
        />

        <div className="card bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors group">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Import Questions</h2>
          <p className="text-text-muted mb-6 text-sm">Upload a CSV file to bulk add questions to your bank.</p>
          <button onClick={() => questionInputRef.current?.click()} className="btn btn-primary w-full shadow-lg">Select CSV</button>
          
          <button onClick={() => downloadTemplate('questions')} className="mt-4 flex items-center justify-center gap-2 text-xs text-primary hover:underline cursor-pointer font-bold">
            <Download size={14} /> Template (.csv)
          </button>
        </div>

        <div className="card bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center hover:border-secondary/50 transition-colors group">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Import Students</h2>
          <p className="text-text-muted mb-6 text-sm">Upload a valid CSV file containing names and schools.</p>
          <button onClick={() => studentInputRef.current?.click()} className="btn btn-secondary w-full shadow-lg">Select CSV</button>

          <button onClick={() => downloadTemplate('students')} className="mt-4 flex items-center justify-center gap-2 text-xs text-secondary hover:underline cursor-pointer font-bold">
            <Download size={14} /> Template (.csv)
          </button>
        </div>

        <div className="card bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center hover:border-danger/50 transition-colors group">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-6 group-hover:scale-110 transition-transform">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2 text-danger">Reset & Sync</h2>
          <p className="text-text-muted mb-6 text-sm">Bersihkan cache dan muat ulang bank soal dari file default.</p>
          <button 
            onClick={() => {
              if(confirm("PERINGATAN: Semua data (HASIL UJIAN, SISWA, SOAL) di browser ini akan dihapus dan direset ke data awal. Lanjutkan?")) {
                api.resetDatabase();
              }
            }} 
            className="btn bg-danger text-white w-full shadow-lg hover:bg-danger/90"
          >
            Reset Database
          </button>
        </div>
      </div>

      <div className="mt-12 p-6 bg-background rounded-2xl border border-dashed border-border">
        <h3 className="font-bold text-text-main mb-4 flex items-center gap-2">
          <AlertCircle size={18} className="text-warning"/> Petunjuk Import CSV
        </h3>
        <div className="grid md:grid-cols-2 gap-8 text-sm">
          <div>
            <h4 className="font-bold text-primary mb-2 uppercase tracking-wider text-xs">Format Siswa</h4>
            <p className="text-text-muted">Gunakan 4 kolom: <strong>username, password, name, school</strong>. Kolom ID akan digenerate otomatis.</p>
          </div>
          <div>
            <h4 className="font-bold text-secondary mb-2 uppercase tracking-wider text-xs">Format Soal</h4>
            <p className="text-text-muted">Gunakan tipe <strong>pilihan_ganda</strong>, <strong>pilihan_ganda_kompleks</strong>, atau <strong>multiple_choice_multiple_answer</strong>. Kolom ke-15 (image) opsional untuk URL gambar.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Import;
