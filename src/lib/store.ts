import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Quiz, Question } from './gift-parser';

export interface QuizAttempt {
  quizId: string;
  answers: Record<string, UserAnswer>;
  startedAt: number;
  completedAt?: number;
  score?: number;
  totalQuestions: number;
}

export interface UserAnswer {
  questionId: string;
  answer: string | string[] | Record<string, string>;
  isCorrect?: boolean;
  answeredAt: number;
}

interface QuizState {
  // Imported quizzes (persisted in session)
  quizzes: Quiz[];
  
  // Current quiz session
  currentQuizId: string | null;
  currentQuestionIndex: number;
  currentAttempt: QuizAttempt | null;
  
  // UI state
  showResults: boolean;
  isReviewMode: boolean;
  
  // Actions
  addQuiz: (quiz: Quiz) => void;
  removeQuiz: (quizId: string) => void;
  startQuiz: (quizId: string) => void;
  restartQuiz: () => void;
  submitAnswer: (questionId: string, answer: UserAnswer['answer'], isCorrect: boolean) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  finishQuiz: () => void;
  exitQuiz: () => void;
  setReviewMode: (isReview: boolean) => void;
  getQuizById: (quizId: string) => Quiz | undefined;
  getCurrentQuiz: () => Quiz | undefined;
  getCurrentQuestion: () => Question | undefined;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      quizzes: [],
      currentQuizId: null,
      currentQuestionIndex: 0,
      currentAttempt: null,
      showResults: false,
      isReviewMode: false,

      addQuiz: (quiz) => {
        set((state) => ({
          quizzes: [quiz, ...state.quizzes.filter(q => q.id !== quiz.id)]
        }));
      },

      removeQuiz: (quizId) => {
        set((state) => ({
          quizzes: state.quizzes.filter(q => q.id !== quizId),
          currentQuizId: state.currentQuizId === quizId ? null : state.currentQuizId,
          currentAttempt: state.currentAttempt?.quizId === quizId ? null : state.currentAttempt
        }));
      },

      startQuiz: (quizId) => {
        const quiz = get().quizzes.find(q => q.id === quizId);
        if (!quiz) return;

        set({
          currentQuizId: quizId,
          currentQuestionIndex: 0,
          showResults: false,
          isReviewMode: false,
          currentAttempt: {
            quizId,
            answers: {},
            startedAt: Date.now(),
            totalQuestions: quiz.questions.length
          }
        });
      },

      restartQuiz: () => {
        const { currentQuizId } = get();
        if (currentQuizId) {
          get().startQuiz(currentQuizId);
        }
      },

      submitAnswer: (questionId, answer, isCorrect) => {
        set((state) => {
          if (!state.currentAttempt) return state;
          
          return {
            currentAttempt: {
              ...state.currentAttempt,
              answers: {
                ...state.currentAttempt.answers,
                [questionId]: {
                  questionId,
                  answer,
                  isCorrect,
                  answeredAt: Date.now()
                }
              }
            }
          };
        });
      },

      nextQuestion: () => {
        const quiz = get().getCurrentQuiz();
        if (!quiz) return;

        set((state) => ({
          currentQuestionIndex: Math.min(
            state.currentQuestionIndex + 1,
            quiz.questions.length - 1
          )
        }));
      },

      previousQuestion: () => {
        set((state) => ({
          currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
        }));
      },

      goToQuestion: (index) => {
        const quiz = get().getCurrentQuiz();
        if (!quiz) return;

        set({
          currentQuestionIndex: Math.max(0, Math.min(index, quiz.questions.length - 1))
        });
      },

      finishQuiz: () => {
        set((state) => {
          if (!state.currentAttempt) return state;

          const quiz = state.quizzes.find(q => q.id === state.currentQuizId);
          if (!quiz) return state;

          const completedAt = Date.now();
          const correctCount = Object.values(state.currentAttempt.answers).filter(
            a => a.isCorrect
          ).length;
          const totalQuestions = quiz.questions.length;
          const durationMs = completedAt - state.currentAttempt.startedAt;
          const score = Math.round((correctCount / totalQuestions) * 100);

          return {
            showResults: true,
            quizzes: state.quizzes.map((q) =>
              q.id === quiz.id
                ? {
                    ...q,
                    lastCompletion: {
                      correctCount,
                      totalQuestions,
                      durationMs,
                      completedAt
                    }
                  }
                : q
            ),
            currentAttempt: {
              ...state.currentAttempt,
              completedAt,
              score
            }
          };
        });
      },

      exitQuiz: () => {
        set({
          currentQuizId: null,
          currentQuestionIndex: 0,
          currentAttempt: null,
          showResults: false,
          isReviewMode: false
        });
      },

      setReviewMode: (isReview) => {
        set({ isReviewMode: isReview, currentQuestionIndex: 0 });
      },

      getQuizById: (quizId) => {
        return get().quizzes.find(q => q.id === quizId);
      },

      getCurrentQuiz: () => {
        const { currentQuizId, quizzes } = get();
        return quizzes.find(q => q.id === currentQuizId);
      },

      getCurrentQuestion: () => {
        const quiz = get().getCurrentQuiz();
        if (!quiz) return undefined;
        return quiz.questions[get().currentQuestionIndex];
      }
    }),
    {
      name: 'gifted-quiz-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        quizzes: state.quizzes
      })
    }
  )
);
