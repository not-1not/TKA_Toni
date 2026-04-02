import React from 'react';
import { AnswerDetail, Question } from '../lib/db';
import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface AnswerAnalysisProps {
  answerDetails: AnswerDetail[];
  allQuestions?: Question[];
}

export const AnswerAnalysis: React.FC<AnswerAnalysisProps> = ({ answerDetails, allQuestions = [] }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const formatAnswerDisplay = (answer: any, type: string): string => {
    if (answer === null || answer === undefined) return 'Tidak dijawab';
    
    if (type === 'pilihan_ganda') {
      return answer;
    } else if (type === 'pilihan_ganda_kompleks') {
      const indices = Array.isArray(answer) ? answer : [];
      return indices.length > 0 ? `Pernyataan ${indices.map(i => i + 1).join(', ')}` : 'Tidak ada pernyataan dipilih';
    } else if (type === 'multiple_choice_multiple_answer') {
      if (typeof answer === 'object' && answer !== null) {
        const answers = Object.values(answer).filter(a => a);
        return answers.length > 0 ? answers.join(', ') : 'Tidak dijawab';
      }
      return 'Tidak dijawab';
    }
    
    return String(answer);
  };

  const formatCorrectAnswer = (answer: any, type: string): string => {
    if (type === 'pilihan_ganda') {
      return answer || '-';
    } else if (type === 'pilihan_ganda_kompleks') {
      const indices = Array.isArray(answer) ? answer : [];
      return indices.length > 0 ? `Pernyataan ${indices.map(i => i + 1).join(', ')}` : 'Tidak ada pernyataan yang benar';
    } else if (type === 'multiple_choice_multiple_answer') {
      if (Array.isArray(answer)) {
        return answer.join(', ');
      }
      return String(answer);
    }
    
    return String(answer);
  };

  const getQuestion = (questionId: string): Question | undefined => {
    return allQuestions.find(q => q.id === questionId);
  };

  return (
    <div className="space-y-4">
      {answerDetails.map((detail, idx) => {
        const isExpanded = expandedId === detail.questionId;
        const question = getQuestion(detail.questionId);
        
        return (
          <div
            key={detail.questionId}
            className={`border-2 rounded-xl overflow-hidden transition-all ${
              detail.isCorrect
                ? 'border-secondary/30 bg-secondary/5'
                : 'border-danger/30 bg-danger/5'
            }`}
          >
            {/* Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : detail.questionId)}
              className="w-full p-4 flex items-start gap-4 hover:bg-black/5 transition-colors"
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {detail.isCorrect ? (
                  <CheckCircle className="text-secondary" size={24} />
                ) : (
                  <XCircle className="text-danger" size={24} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-text-muted uppercase tracking-wide mb-1">
                      Soal {idx + 1} • {detail.type === 'pilihan_ganda' ? 'Pilihan Ganda' : detail.type === 'pilihan_ganda_kompleks' ? 'Pilihan Ganda Kompleks' : 'Benar/Salah'}
                    </div>
                    <p className="text-base font-semibold text-text-main line-clamp-2">
                      {detail.question}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="text-text-muted" size={20} />
                    ) : (
                      <ChevronDown className="text-text-muted" size={20} />
                    )}
                  </div>
                </div>

                {/* Quick preview on collapsed */}
                {!isExpanded && (
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold text-text-muted uppercase block mb-1">Jawaban Anda</span>
                      <span className="text-sm font-semibold text-text-main">
                        {formatAnswerDisplay(detail.studentAnswer, detail.type)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-muted uppercase block mb-1">Jawaban Benar</span>
                      <span className={`text-sm font-semibold ${detail.isCorrect ? 'text-secondary' : 'text-danger'}`}>
                        {formatCorrectAnswer(detail.correctAnswer, detail.type)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-border/30 p-4 space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
                  {detail.isCorrect ? (
                    <>
                      <CheckCircle className="text-secondary" size={20} />
                      <span className="font-bold text-secondary">Jawaban Benar ✓</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-danger" size={20} />
                      <span className="font-bold text-danger">Jawaban Salah ✗</span>
                    </>
                  )}
                </div>

                {/* Answer Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student Answer */}
                  <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">
                      📝 Jawaban Anda
                    </div>
                    <div className={`text-sm font-semibold p-2 rounded bg-background/70 border-l-4 ${
                      detail.studentAnswer === null || detail.studentAnswer === undefined
                        ? 'border-warning text-warning'
                        : 'border-text-muted text-text-main'
                    }`}>
                      {detail.studentAnswer === null || detail.studentAnswer === undefined ? (
                        <span className="italic opacity-70">Tidak dijawab</span>
                      ) : (
                        formatAnswerDisplay(detail.studentAnswer, detail.type)
                      )}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">
                      ✓ Jawaban Benar
                    </div>
                    <div className={`text-sm font-semibold p-2 rounded bg-background/70 border-l-4 border-secondary text-secondary`}>
                      {formatCorrectAnswer(detail.correctAnswer, detail.type)}
                    </div>
                  </div>
                </div>

                {/* Subject Info */}
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">📚 Mata Pelajaran</span>
                  <p className="text-sm font-semibold text-text-main mt-1">{detail.subject || 'Umum'}</p>
                </div>

                {/* Question Details (PG specific) */}
                {detail.type === 'pilihan_ganda' && question && (
                  <div className="space-y-2 p-3 rounded-lg bg-background/50 border border-border/30">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">📋 Pilihan Jawaban</div>
                    {[
                      { letter: 'A', text: question.option_a },
                      { letter: 'B', text: question.option_b },
                      { letter: 'C', text: question.option_c },
                      { letter: 'D', text: question.option_d }
                    ].map(opt => (
                      <div
                        key={opt.letter}
                        className={`p-2 rounded border-l-4 text-sm ${
                          opt.letter === detail.correctAnswer
                            ? 'bg-secondary/20 border-secondary text-text-main font-semibold'
                            : opt.letter === detail.studentAnswer
                            ? 'bg-danger/10 border-danger text-text-main'
                            : 'bg-background border-border/30 text-text-muted'
                        }`}
                      >
                        <span className="font-bold">{opt.letter}.</span> {opt.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Statement Details (PK/MCMA specific) */}
                {(detail.type === 'pilihan_ganda_kompleks' || detail.type === 'multiple_choice_multiple_answer') && question?.statements && (
                  <div className="space-y-3 p-3 rounded-lg bg-background/50 border border-border/30">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">📋 Pernyataan</div>
                    {question.statements.map((stmt, stmtIdx) => {
                      const isStudentSelected = detail.type === 'pilihan_ganda_kompleks' 
                        ? (detail.studentAnswer as number[] || []).includes(stmtIdx)
                        : (detail.studentAnswer as Record<number, string> || {})[stmtIdx] !== undefined;
                      
                      const isCorrectAnswer = detail.type === 'pilihan_ganda_kompleks'
                        ? (detail.correctAnswer as number[] || []).includes(stmtIdx)
                        : (detail.correctAnswer as string[] || [])[stmtIdx] !== undefined;

                      return (
                        <div
                          key={stmtIdx}
                          className={`p-3 rounded border-l-4 ${
                            isCorrectAnswer
                              ? 'bg-secondary/10 border-secondary'
                              : isStudentSelected
                              ? 'bg-danger/10 border-danger'
                              : 'bg-background border-border/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-bold text-text-muted mt-1">{stmtIdx + 1}.</span>
                            <div className="flex-1">
                              <p className="text-sm text-text-main font-medium">{stmt.text}</p>
                              {detail.type === 'multiple_choice_multiple_answer' ? (
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs font-semibold text-text-muted">Jawaban Anda:</span>
                                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                                    (detail.studentAnswer as Record<number, string>)?.[stmtIdx] === stmt.correctAnswer
                                      ? 'bg-secondary text-white'
                                      : 'bg-danger/30 text-danger'
                                  }`}>
                                    {(detail.studentAnswer as Record<number, string>)?.[stmtIdx] || 'Tidak dijawab'}
                                  </span>
                                  <span className="text-xs font-semibold text-text-muted">Benar:</span>
                                  <span className="text-xs font-bold px-2 py-1 rounded bg-secondary text-white">
                                    {stmt.correctAnswer}
                                  </span>
                                </div>
                              ) : (
                                <div className="mt-2 text-xs font-semibold">
                                  {isStudentSelected && !isCorrectAnswer && (
                                    <span className="text-danger">❌ Anda memilih pernyataan ini (salah)</span>
                                  )}
                                  {isCorrectAnswer && !isStudentSelected && (
                                    <span className="text-warning">⚠ Anda tidak memilih pernyataan ini (seharusnya dipilih)</span>
                                  )}
                                  {isCorrectAnswer && isStudentSelected && (
                                    <span className="text-secondary">✓ Benar dipilih</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
