import { create } from 'zustand';
import { type PracticeQuestion, generateQuestion } from '../../core/practice/QuestionGenerators';

interface PracticeStoreState {
  activeQuestion: PracticeQuestion | null;
  score: number;
  streak: number;
  lastResult: { correct: boolean; expected: string } | null;

  loadNextQuestion: () => void;
  submitAnswer: (answer: string) => void;
}

export const usePracticeStore = create<PracticeStoreState>((set, get) => ({
  activeQuestion: null,
  score: 0,
  streak: 0,
  lastResult: null,

  loadNextQuestion: () => {
    set({
      activeQuestion: generateQuestion(),
      lastResult: null
    });
  },

  submitAnswer: (answer: string) => {
    const { activeQuestion, score, streak } = get();
    if (!activeQuestion) return;

    const normalizedInput = answer.trim().toLowerCase();
    const normalizedExpected = activeQuestion.correctAnswer.trim().toLowerCase();

    const isCorrect = normalizedInput === normalizedExpected;

    set({
      score: isCorrect ? score + 10 : score,
      streak: isCorrect ? streak + 1 : 0,
      lastResult: {
        correct: isCorrect,
        expected: activeQuestion.correctAnswer
      }
    });
  }
}));
