'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Trash2, FileText, CheckCircle2, Link as LinkIcon, Folder } from 'lucide-react';
import { useQuizStore } from '@/lib/store';
import { cn, formatTime } from '@/lib/utils';

export function QuizList() {
  const quizzes = useQuizStore((state) => state.quizzes);
  const startQuiz = useQuizStore((state) => state.startQuiz);
  const removeQuiz = useQuizStore((state) => state.removeQuiz);
  const [quizToDelete, setQuizToDelete] = useState<{ id: string; name: string } | null>(null);

  if (quizzes.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-12">
      <h3 className="text-lg font-semibold mb-4 text-zinc-600 dark:text-zinc-400">
        Your Quizzes
      </h3>

      <div className="space-y-3">
        {quizzes.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'group flex items-start justify-between gap-4 p-5 rounded-2xl',
              'bg-zinc-50 dark:bg-zinc-800/50',
              'hover:bg-zinc-100 dark:hover:bg-zinc-800',
              'transition-colors duration-200'
            )}
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className="mt-0.5 p-2.5 rounded-xl bg-white dark:bg-zinc-700 shadow-sm">
                <FileText className="w-5 h-5 text-zinc-500" />
              </div>

              <div className="min-w-0">
                <h4 className="font-medium truncate">{quiz.name}</h4>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
                  {quiz.lastCompletion ? (
                    <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {quiz.lastCompletion.correctCount}/{quiz.lastCompletion.totalQuestions} correct
                      </span>
                      <span>·</span>
                      <span>{formatTime(quiz.lastCompletion.durationMs)}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span>{quiz.questions.length}</span>
                      <span>questions</span>
                    </span>
                  )}
                </div>

                {quiz.source && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 min-w-0" title={quiz.source}>
                    {/^https?:\/\//i.test(quiz.source) ? (
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 shrink-0" />
                    )}
                    {/^https?:\/\//i.test(quiz.source) ? (
                      <a
                        href={quiz.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300 truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {quiz.source}
                      </a>
                    ) : (
                      <span className="truncate">{quiz.source}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => startQuiz(quiz.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
                  'bg-zinc-900 text-white hover:bg-zinc-800',
                  'dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100',
                  'transition-colors'
                )}
              >
                <Play className="w-4 h-4" />
                Start
              </button>

              <button
                onClick={() => setQuizToDelete({ id: quiz.id, name: quiz.name })}
                className={cn(
                  'p-2 rounded-lg',
                  'text-zinc-400 hover:text-red-500 hover:bg-red-50',
                  'dark:hover:bg-red-900/20',
                  'transition-colors'
                )}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {quizToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/45 backdrop-blur-[2px] flex items-center justify-center px-4"
            onClick={() => setQuizToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="w-full max-w-md rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-medium tracking-wide uppercase text-zinc-500 dark:text-zinc-400 mb-2">
                Confirm Action
              </p>
              <h2 className="text-xl font-semibold mb-2">Delete Quiz?</h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 mb-6 break-words">
                <span className="break-all">&quot;{quizToDelete.name}&quot;</span> will be permanently removed.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    removeQuiz(quizToDelete.id);
                    setQuizToDelete(null);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg font-medium transition-colors',
                    'bg-red-700 text-red-50 hover:bg-red-600',
                    'dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700'
                  )}
                >
                  Delete
                </button>
                <button
                  onClick={() => setQuizToDelete(null)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg font-medium transition-colors',
                    'border border-zinc-300 text-zinc-700 hover:bg-zinc-100',
                    'dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
                  )}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
