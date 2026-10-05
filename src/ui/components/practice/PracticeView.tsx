import React, { useEffect, useState, useRef } from 'react';
import { usePracticeStore } from '../../../app/store/usePracticeStore';
import { CheckCircle2, XCircle, ArrowRight, Flame } from 'lucide-react';

export const PracticeView: React.FC = () => {
  const { activeQuestion, score, streak, lastResult, loadNextQuestion, submitAnswer } = usePracticeStore();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeQuestion && !lastResult) {
      loadNextQuestion();
    }
  }, [activeQuestion, lastResult, loadNextQuestion]);

  useEffect(() => {
    if (!lastResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [lastResult, activeQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    submitAnswer(inputValue);
  };

  const handleNext = () => {
    setInputValue('');
    loadNextQuestion();
  };

  if (!activeQuestion) return null;

  return (
    <div className="absolute inset-0 bg-base flex flex-col items-center pt-24 pb-8 overflow-y-auto">
      {/* Header Stats */}
      <div className="w-full max-w-2xl flex items-center justify-between px-6 py-4 bg-surface border border-border-base rounded-xl mb-8">
        <div className="text-secondary font-medium">Practice Arena</div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted font-bold uppercase tracking-wider">Score</span>
            <span className="text-xl font-bold text-accent">{score}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted font-bold uppercase tracking-wider">Streak</span>
            <div className="flex items-center gap-1 text-xl font-bold text-warning">
              <Flame className="w-5 h-5" />
              {streak}
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-surface border border-border-base rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 pb-6 border-b border-border-base/50">
          <h2 className="text-2xl font-bold text-primary leading-tight">
            {activeQuestion.prompt}
          </h2>
        </div>

        <div className="p-8 pt-6">
          {!lastResult ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <input 
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="e.g. 192.168.1.0"
                className="w-full bg-base border-2 border-border-strong hover:border-accent focus:border-accent rounded-lg px-6 py-4 text-xl font-mono text-primary outline-none transition-colors"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="w-full bg-accent hover:bg-accent-hover disabled:bg-elevated disabled:text-muted text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Submit Answer
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
              <div className={`flex items-start gap-4 p-5 rounded-lg border ${lastResult.correct ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                <div className="mt-1">
                  {lastResult.correct ? (
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  ) : (
                    <XCircle className="w-8 h-8 text-danger" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-1 ${lastResult.correct ? 'text-success' : 'text-danger'}`}>
                    {lastResult.correct ? 'Correct!' : 'Incorrect'}
                  </h3>
                  {!lastResult.correct && (
                    <div className="text-secondary font-mono mb-3 bg-black/40 px-3 py-2 rounded inline-block">
                      Correct answer: <span className="text-success font-bold">{lastResult.expected}</span>
                    </div>
                  )}
                  <p className="text-secondary text-sm leading-relaxed">
                    {activeQuestion.explanation}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleNext}
                autoFocus
                className="w-full bg-primary hover:opacity-90 text-base font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Next Question
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
