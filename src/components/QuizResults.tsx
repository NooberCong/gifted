'use client';

import { motion } from 'framer-motion';
import { RotateCcw, Eye, Home, Check, X, Clock } from 'lucide-react';
import { useQuizStore } from '@/lib/store';
import { cn, formatTime, getQuestionTypeLabel } from '@/lib/utils';

export function QuizResults() {
  const {
    currentAttempt,
    getCurrentQuiz,
    restartQuiz,
    exitQuiz,
    setReviewMode,
    goToQuestion
  } = useQuizStore();

  const quiz = getCurrentQuiz();
  
  if (!currentAttempt || !quiz) return null;

  const score = currentAttempt.score ?? 0;
  const totalQuestions = quiz.questions.length;
  const correctCount = Object.values(currentAttempt.answers).filter(a => a.isCorrect).length;
  const duration = currentAttempt.completedAt 
    ? currentAttempt.completedAt - currentAttempt.startedAt 
    : 0;

  const getScoreMessage = () => {
    if (score >= 90) return { text: 'Excellent!', emoji: '🎉' };
    if (score >= 70) return { text: 'Great job!', emoji: '👏' };
    if (score >= 50) return { text: 'Good effort!', emoji: '👍' };
    return { text: 'Keep practicing!', emoji: '💪' };
  };

  const scoreMessage = getScoreMessage();

  const handleReview = () => {
    setReviewMode(true);
    goToQuestion(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto text-center"
    >
      {/* Score Circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative w-48 h-48 mx-auto mb-8"
      >
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-zinc-200 dark:text-zinc-700"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={cn(
              score >= 70 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'
            )}
            initial={{ strokeDasharray: '0 553' }}
            animate={{ strokeDasharray: `${(score / 100) * 553} 553` }}
            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-5xl font-bold"
          >
            {score}%
          </motion.span>
          <span className="text-sm text-zinc-500 mt-1">Score</span>
        </div>
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-2">
          <span>{scoreMessage.emoji}</span>
          <span>{scoreMessage.text}</span>
        </div>
        <p className="text-zinc-500">
          {quiz.name}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-center gap-2 text-green-500 mb-1">
            <Check className="w-5 h-5" />
            <span className="text-2xl font-bold">{correctCount}</span>
          </div>
          <p className="text-sm text-zinc-500">Correct</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-center gap-2 text-red-500 mb-1">
            <X className="w-5 h-5" />
            <span className="text-2xl font-bold">{totalQuestions - correctCount}</span>
          </div>
          <p className="text-sm text-zinc-500">Incorrect</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-center gap-2 text-blue-500 mb-1">
            <Clock className="w-5 h-5" />
            <span className="text-2xl font-bold">{formatTime(duration)}</span>
          </div>
          <p className="text-sm text-zinc-500">Duration</p>
        </div>
      </motion.div>

      {/* Question Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h3 className="text-lg font-semibold mb-4 text-left">Question Summary</h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {quiz.questions.map((question, index) => {
            const answer = currentAttempt.answers[question.id];
            const isCorrect = answer?.isCorrect;
            
            return (
              <button
                key={question.id}
                onClick={() => {
                  setReviewMode(true);
                  goToQuestion(index);
                }}
                className={cn(
                  "w-full aspect-square rounded-lg flex items-center justify-center font-medium text-sm",
                  "transition-all hover:scale-110",
                  isCorrect
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                )}
                title={`${getQuestionTypeLabel(question.type)}: ${question.text.slice(0, 50)}...`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <button
          onClick={handleReview}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-medium",
            "border-2 border-zinc-200 dark:border-zinc-700",
            "hover:bg-zinc-50 dark:hover:bg-zinc-800",
            "transition-colors w-full sm:w-auto justify-center"
          )}
        >
          <Eye className="w-5 h-5" />
          Review Answers
        </button>
        
        <button
          onClick={restartQuiz}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-medium",
            "bg-zinc-900 text-white hover:bg-zinc-800",
            "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
            "transition-colors w-full sm:w-auto justify-center"
          )}
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
        
        <button
          onClick={exitQuiz}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-medium",
            "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800",
            "transition-colors w-full sm:w-auto justify-center"
          )}
        >
          <Home className="w-5 h-5" />
          Back to Home
        </button>
      </motion.div>
    </motion.div>
  );
}
