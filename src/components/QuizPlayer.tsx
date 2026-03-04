'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { useQuizStore } from '@/lib/store';
import { QuestionCard } from './QuestionCard';
import { QuizResults } from './QuizResults';
import { cn } from '@/lib/utils';

export function QuizPlayer() {
  const {
    currentQuizId,
    currentQuestionIndex,
    showResults,
    isReviewMode,
    getCurrentQuiz,
    getCurrentQuestion,
    exitQuiz,
    setReviewMode
  } = useQuizStore();

  const quiz = getCurrentQuiz();
  const question = getCurrentQuestion();

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  if (!currentQuizId || !quiz) return null;

  const handleExit = () => {
    if (isReviewMode) {
      setReviewMode(false);
    } else {
      exitQuiz();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-zinc-900 z-50 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleExit}
              className={cn(
                "p-2 -ml-2 rounded-lg",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                "transition-colors"
              )}
            >
              {isReviewMode ? (
                <ArrowLeft className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </button>
            <div>
              <h1 className="font-semibold truncate max-w-[200px] sm:max-w-none">
                {quiz.name}
              </h1>
              {isReviewMode && (
                <p className="text-sm text-zinc-500">Review Mode</p>
              )}
            </div>
          </div>

          {!showResults && (
            <div className="hidden sm:flex items-center gap-1">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentQuestionIndex
                      ? "bg-zinc-900 dark:bg-white"
                      : index < currentQuestionIndex
                      ? "bg-zinc-400 dark:bg-zinc-500"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-12">
        {!showResults && question && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-zinc-500 mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full bg-zinc-900 dark:bg-white"
              />
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {showResults && !isReviewMode ? (
            <QuizResults key="results" />
          ) : question ? (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={quiz.questions.length}
            />
          ) : null}
        </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
}
