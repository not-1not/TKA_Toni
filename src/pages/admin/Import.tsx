import React, { useRef } from 'react';
import { AdminLayout } from './Dashboard';
import { Download, Upload, CheckCircle2, AlertCircle, FileJson, ClipboardType, Table, HelpCircle } from 'lucide-react';
import { api, Student, Question, Statement } from '../../lib/db';

const Import = () => {
  const questionInputRef = useRef<HTMLInputElement>(null);
  const studentInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = React.useState<{ type: 'success' | 'error' | 'loading', message: string } | null>(null);
  const [activeTab, setActiveTab] = React.useState<'students' | 'questions'>('students');
  const [importMode, setImportMode] = React.useState<'file' | 'quick'>('file');
  const [quickPasteText, setQuickPasteText] = React.useState("");

  const downloadTemplate = (type: 'questions' | 'students', format: 'csv' | 'json' = 'csv') => {
    let headers = '';
    let rows = '';
    let filename = '';
    let content = '';

    if (type === 'questions') {
      if (format === 'csv') {
        headers = 'package,subject,question,type,option_a,option_b,option_c,option_d,correct_answer,s1_text,s1_answer,s2_text,s2_answer,s3_text,s3_answer,image';
        rows = 'Default,Math,1+1=?,PG,1,2,3,4,B,,,,,,,\n' +
          'Default,Bio,Tumbuhan,PK,,,,,, ,Memiliki daun,TRUE,Memiliki akar,TRUE,Bisa berjalan,FALSE,\n' +
          'Default,IPA,Energi,MCMA,,,,,, ,Panas adalah energi,S,Suara adalah energi,S,Cahaya berhenti,T,';
        filename = 'template_soal.csv';
        content = '\ufeff' + headers + '\n' + rows;
      } else {
        const json = [
          {
            package: "TO-1",
            subject: "IPA",
            question: "Apa ibu kota Indonesia?",
            type: "pilihan_ganda",
            option_a: "Jakarta",
            option_b: "Bandung",
            option_c: "Surabaya",
            option_d: "Medan",
            correct_answer: "A"
          }
        ];
        content = JSON.stringify(json, null, 2);
        filename = 'template_soal.json';
      }
    } else {
      if (format === 'csv') {
        headers = 'username,password,name,school';
        rows = 'siswa01,pass123,Budi Santoso,SDN 01 Jakarta\nsiswa02,pass123,Siti Aminah,SDN 01 Jakarta';
        filename = 'template_siswa.csv';
        content = '\ufeff' + headers + '\n' + rows;
      } else {
        const json = [
          {
            username: "siswa01",
            password: "password123",
            name: "Budi Santoso",
            school: "SDN 01 Jakarta"
          }
        ];
        content = JSON.stringify(json, null, 2);
        filename = 'template_siswa.json';
      }
    }

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' });
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'questions' | 'students') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isJson = file.name.endsWith('.json');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setStatus({ type: 'loading', message: 'Memproses file...' });

      try {
        let imported: any[] = [];
        if (type === 'students') {
          imported = isJson ? api.parseStudentJSON(text) : api.parseStudentCSV(text);
          const current = await api.getStudents();
          const all = [...current, ...imported];
          const unique = Array.from(new Map(all.map(s => [s.username.toLowerCase(), s])).values());
          await api.setStudents(unique);
          setStatus({ type: 'success', message: `Berhasil mengimport ${imported.length} siswa.` });
        } else {
          imported = isJson ? api.parseQuestionJSON(text) : api.parseQuestionCSV(text);
          const current = await api.getQuestions();
          const all = [...current, ...imported];
          const unique = Array.from(new Map(all.map(q => [q.question, q])).values());
          await api.setQuestions(unique);
          setStatus({ type: 'success', message: `Berhasil mengimport ${imported.length} soal.` });
        }
      } catch (err: any) {
        console.error(err);
        setStatus({ type: 'error', message: err.message || 'Gagal mengimport file. Pastikan format sesuai.' });
      }

      if (e.target) e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleQuickPaste = async () => {
    if (!quickPasteText.trim()) return;
    setStatus({ type: 'loading', message: 'Memproses data...' });

    try {
      let imported: any[] = [];
      if (activeTab === 'students') {
        imported = api.parseStudentQuickPaste(quickPasteText);
        const current = await api.getStudents();
        const all = [...current, ...imported];
        const unique = Array.from(new Map(all.map(s => [s.username.toLowerCase(), s])).values());
        await api.setStudents(unique);
        setStatus({ type: 'success', message: `Berhasil mengimport ${imported.length} siswa.` });
      } else {
        imported = api.parseQuestionQuickPaste(quickPasteText);
        const current = await api.getQuestions();
        const all = [...current, ...imported];
        const unique = Array.from(new Map(all.map(q => [q.question, q])).values());
        await api.setQuestions(unique);
        setStatus({ type: 'success', message: `Berhasil mengimport ${imported.length} soal.` });
      }
      setQuickPasteText("");
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: 'Gagal memproses data paste. Pastikan format benar.' });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight">Import Data</h1>
          <p className="text-text-muted mt-2 font-medium">Bulk import students or questions using various formats.</p>
        </div>
        <div className="flex bg-surface p-1 rounded-xl border border-border shadow-sm self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'students' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-background'}`}
          >
            Siswa
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'questions' ? 'bg-secondary text-white shadow-md' : 'text-text-muted hover:bg-background'}`}
          >
            Soal
          </button>
        </div>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${status.type === 'success' ? 'bg-secondary/10 text-secondary border border-secondary/20' : status.type === 'loading' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
          {status.type === 'success' ? <CheckCircle2 size={24} /> : status.type === 'loading' ? <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div> : <AlertCircle size={24} />}
          <span className="font-bold">{status.message}</span>
          <button onClick={() => setStatus(null)} className="ml-auto text-xs uppercase font-black hover:underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Import Methods */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => setImportMode('file')}
                className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${importMode === 'file' ? 'bg-background text-primary border-b-2 border-primary' : 'text-text-muted hover:bg-background/50'}`}
              >
                <Upload size={18} /> File Upload (CSV/JSON)
              </button>
              <button
                onClick={() => setImportMode('quick')}
                className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${importMode === 'quick' ? 'bg-background text-primary border-b-2 border-primary' : 'text-text-muted hover:bg-background/50'}`}
              >
                <ClipboardType size={18} /> Quick Paste (Easy)
              </button>
            </div>

            <div className="p-6 md:p-8">
              {importMode === 'file' ? (
                <div className="text-center py-8">
                  <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 transition-transform hover:scale-110 ${activeTab === 'students' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                    {activeTab === 'students' ? <Upload size={40} /> : <FileJson size={40} />}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Upload {activeTab === 'students' ? 'Data Siswa' : 'Bank Soal'}</h2>
                  <p className="text-text-muted mb-8 max-w-md mx-auto">
                    Pilih file CSV atau JSON yang sesuai dengan format template untuk melakukan import massal.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => (activeTab === 'students' ? studentInputRef : questionInputRef).current?.click()}
                      className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'} px-8 py-3 shadow-lg flex items-center gap-2`}
                    >
                      <Upload size={18} /> Pilih File
                    </button>
                  </div>

                  <input
                    type="file"
                    accept=".csv,.json"
                    ref={questionInputRef}
                    className="hidden"
                    title="Upload questions file"
                    aria-label="Upload questions file"
                    onChange={(e) => handleFileUpload(e, 'questions')}
                  />
                  <input
                    type="file"
                    accept=".csv,.json"
                    ref={studentInputRef}
                    className="hidden"
                    title="Upload students file"
                    aria-label="Upload students file"
                    onChange={(e) => handleFileUpload(e, 'students')}
                  />

                  <div className="mt-8 pt-8 border-t border-border flex flex-wrap justify-center gap-6">
                    <button onClick={() => downloadTemplate(activeTab, 'csv')} className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-primary transition-colors">
                      <Download size={16} /> Template CSV
                    </button>
                    <button onClick={() => downloadTemplate(activeTab, 'json')} className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-primary transition-colors">
                      <FileJson size={16} /> Template JSON
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Quick Paste</h2>
                    <span className="text-xs font-black px-2 py-1 bg-secondary/10 text-secondary rounded uppercase tracking-tighter">Beginner Friendly</span>
                  </div>
                  <p className="text-sm text-text-muted">
                    {activeTab === 'students'
                      ? "Tempel daftar siswa di bawah. Format: username | password | nama | sekolah (satu per baris)."
                      : "Tempel soal di bawah sesuai tipe. Format: package|subject|question|type|[fields sesuai tipe]|image (satu per baris)."}
                  </p>

                  <textarea
                    value={quickPasteText}
                    onChange={(e) => setQuickPasteText(e.target.value)}
                    placeholder={activeTab === 'students' 
                      ? "Contoh:\nsiswa01|pass123|Budi Santoso|SDN 01 Jakarta\nsiswa02|pass123|Siti Aminah|SDN 01 Jakarta" 
                      : "Contoh PG:\nDefault|Math|1+1=?|PG|1|2|3|4|B|\nContoh PK:\nDefault|Bio|Tumbuhan|PK||||||Daun|TRUE|Akar|TRUE|Jalan|FALSE|\nContoh MCMA:\nDefault|IPA|Energi|MCMA||||||Panas|S|Suara|S|Cahaya|T|"}
                    className="w-full h-64 p-4 rounded-xl bg-background border border-border font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  />

                  <button
                    onClick={handleQuickPaste}
                    disabled={!quickPasteText.trim()}
                    className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'} w-full py-4 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Proses & Import Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Instructions & Reset */}
        <div className="space-y-6">
          <div className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm">
            <h3 className="font-bold text-text-main mb-6 flex items-center gap-2">
              <HelpCircle size={20} className="text-primary" /> Petunjuk Format
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-2">
                  <Table size={16} /> CSV Format
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  {activeTab === 'students'
                    ? "Wajib memiliki 4 kolom: username, password, name, school."
                    : "Wajib 16 kolom: package,subject,question,type,option_a,option_b,option_c,option_d,correct_answer,s1_text,s1_answer,s2_text,s2_answer,s3_text,s3_answer,image. PG gunakan kolom 4-8, PK/MCMA gunakan kolom 9-15."}
                </p>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-secondary uppercase tracking-wider mb-2">
                  <FileJson size={16} /> JSON Format
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Format array of objects. Mendukung field {activeTab === 'students' ? "'name', 'school', 'username', 'password'" : "'question', 'option_a', 'option_b', etc"}.
                </p>
              </div>

              <div className="p-4 bg-background rounded-xl border border-border">
                <h4 className="text-xs font-black mb-2 opacity-50 uppercase">Pro Tip</h4>
                <p className="text-xs font-medium italic">"Gunakan Quick Paste jika Anda hanya ingin menambahkan beberapa data dengan cepat tanpa repot membuat file."</p>
              </div>
            </div>
          </div>

          <div className="card bg-surface p-6 md:p-8 rounded-2xl border border-danger/30 shadow-sm flex flex-col items-center justify-center text-center hover:border-danger transition-colors group">
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-6 group-hover:scale-110 transition-transform">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2 text-danger">Reset & Sync</h2>
            <p className="text-text-muted mb-6 text-sm">Bersihkan cache lokal dan muat ulang database.</p>
            <button
              onClick={() => {
                if (confirm("PERINGATAN: Semua data di browser ini akan dihapus dan direset. Lanjutkan?")) {
                  api.resetDatabase();
                }
              }}
              className="btn bg-danger text-white w-full shadow-lg hover:bg-danger/90"
            >
              Reset Database
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Import;
