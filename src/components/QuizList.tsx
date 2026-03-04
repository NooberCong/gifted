'use client';

import { motion } from 'framer-motion';
import { Play, Trash2, FileText, Clock } from 'lucide-react';
import { useQuizStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function QuizList() {
  const quizzes = useQuizStore(state => state.quizzes);
  const startQuiz = useQuizStore(state => state.startQuiz);
  const removeQuiz = useQuizStore(state => state.removeQuiz);

  const handleRemoveQuiz = (quizId: string, quizName: string) => {
    const confirmed = window.confirm(`Delete "${quizName}"? This cannot be undone.`);
    if (!confirmed) return;
    removeQuiz(quizId);
  };

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
              "group flex items-center justify-between p-4 rounded-xl",
              "bg-zinc-50 dark:bg-zinc-800/50",
              "hover:bg-zinc-100 dark:hover:bg-zinc-800",
              "transition-colors duration-200"
            )}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-700 shadow-sm">
                <FileText className="w-5 h-5 text-zinc-500" />
              </div>
              
              <div className="min-w-0">
                <h4 className="font-medium truncate">{quiz.name}</h4>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <span>{quiz.questions.length} questions</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(quiz.importedAt).toLocaleDateString()}
                  </span>
                </div>
                {quiz.source && (
                  <div className="mt-1 text-xs text-zinc-500 truncate" title={quiz.source}>
                    {/^https?:\/\//i.test(quiz.source) ? (
                      <a
                        href={quiz.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {quiz.source}
                      </a>
                    ) : (
                      <span>{quiz.source}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startQuiz(quiz.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-zinc-900 text-white hover:bg-zinc-800",
                  "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
                  "transition-colors"
                )}
              >
                <Play className="w-4 h-4" />
                Start
              </button>
              
              <button
                onClick={() => handleRemoveQuiz(quiz.id, quiz.name)}
                className={cn(
                  "p-2 rounded-lg",
                  "text-zinc-400 hover:text-red-500 hover:bg-red-50",
                  "dark:hover:bg-red-900/20",
                  "transition-colors"
                )}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
