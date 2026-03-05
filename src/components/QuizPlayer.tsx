'use client';

import { useEffect, useRef, useState } from 'react';
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
    currentAttempt,
    showResults,
    isReviewMode,
    getCurrentQuiz,
    getCurrentQuestion,
    exitQuiz,
    setReviewMode,
    goToQuestion,
    finishQuiz
  } = useQuizStore();

  const quiz = getCurrentQuiz();
  const question = getCurrentQuestion();
  const dotsContainerRef = useRef<HTMLDivElement | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);

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

  useEffect(() => {
    const container = dotsContainerRef.current;
    if (!container) return;
    const activeDot = container.querySelector<HTMLButtonElement>('[data-current="true"]');
    if (!activeDot) return;
    activeDot.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentQuestionIndex, showResults]);

  useEffect(() => {
    if (!quiz) return;
    const previousTitle = document.title;
    document.title = `${quiz.name} | Gifted`;
    return () => {
      document.title = previousTitle;
    };
  }, [quiz]);

  if (!currentQuizId || !quiz) return null;

  const handleExit = () => {
    if (isReviewMode) {
      setReviewMode(false);
      return;
    }

    if (!showResults) {
      setShowExitDialog(true);
      return;
    }

    if (showResults) {
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
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto sm:flex-1 sm:justify-end">
            {(!showResults || isReviewMode) && (
              <div
                ref={dotsContainerRef}
                className="flex min-w-0 max-w-full items-center gap-0.5 px-1 py-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {quiz.questions.map((quizQuestion, index) => {
                  const answer = currentAttempt?.answers[quizQuestion.id];
                  const status =
                    index === currentQuestionIndex
                      ? 'current'
                      : answer === undefined
                      ? 'not-done'
                      : answer.isCorrect
                      ? 'correct'
                      : 'wrong';

                  return (
                  <button
                    key={quizQuestion.id}
                    onClick={() => goToQuestion(index)}
                    data-current={status === 'current' ? 'true' : 'false'}
                    className={cn(
                      "shrink-0",
                      "w-4 h-4 rounded-full flex items-center justify-center transition-all",
                      status === 'current' && "ring-1 ring-zinc-300 dark:ring-zinc-600",
                      status === 'correct' && "hover:bg-green-50/70 dark:hover:bg-green-900/20",
                      status === 'wrong' && "hover:bg-red-50/70 dark:hover:bg-red-900/20",
                      status === 'not-done' && "hover:bg-zinc-100/70 dark:hover:bg-zinc-800"
                    )}
                    title={`Question ${index + 1}: ${
                      status === 'current'
                        ? 'Current'
                        : status === 'correct'
                        ? 'Correct'
                        : status === 'wrong'
                        ? 'Wrong'
                        : 'Not done'
                    }`}
                    aria-label={`Go to question ${index + 1}`}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        status === 'current' && "bg-white shadow-[0_0_0_1px_rgba(161,161,170,0.75)] dark:shadow-[0_0_0_1px_rgba(113,113,122,0.85)]",
                        status === 'correct' && "bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.28)]",
                        status === 'wrong' && "bg-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.24)]",
                        status === 'not-done' && "bg-zinc-300 dark:bg-zinc-600"
                      )}
                    />
                  </button>
                )})}
              </div>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showExitDialog && !showResults && !isReviewMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/45 backdrop-blur-[2px] flex items-center justify-center px-4"
            onClick={() => setShowExitDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="w-full max-w-md rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5">
                <p className="text-xs font-medium tracking-wide uppercase text-zinc-500 dark:text-zinc-400 mb-2">
                  Confirm Action
                </p>
                <h2 className="text-xl font-semibold mb-2">Leave Quiz?</h2>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 mb-6">
                You answered {Object.keys(currentAttempt?.answers || {}).length}/{quiz.questions.length} questions.
                Choose how you want to leave this attempt.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowExitDialog(false);
                    finishQuiz();
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg font-medium transition-colors",
                    "bg-zinc-900 text-white hover:bg-zinc-800",
                    "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  )}
                >
                  Show Results
                </button>
                <button
                  onClick={() => {
                    setShowExitDialog(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg font-medium transition-colors",
                    "border border-zinc-300 text-zinc-700 hover:bg-zinc-100",
                    "dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  )}
                >
                  Continue Quiz
                </button>
                <button
                  onClick={() => {
                    setShowExitDialog(false);
                    exitQuiz();
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg font-medium transition-colors",
                    "text-red-700 hover:bg-red-50",
                    "dark:text-red-300 dark:hover:bg-red-900/20"
                  )}
                >
                  Quit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
