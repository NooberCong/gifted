'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Question, Answer } from '@/lib/gift-parser';
import { useQuizStore } from '@/lib/store';
import { cn, checkAnswer, shuffleArray } from '@/lib/utils';
import { MarkdownText } from './MarkdownText';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

// Note: This component relies on key={question.id} in parent to remount on question change
export function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
  const { 
    currentAttempt, 
    submitAnswer, 
    nextQuestion, 
    previousQuestion,
    finishQuiz,
    isReviewMode 
  } = useQuizStore();
  
  const existingAnswer = currentAttempt?.answers[question.id];
  
  // Initial state derived from existing answer (component remounts on question change via key prop)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(() => {
    if (!existingAnswer) return [];
    if (Array.isArray(existingAnswer.answer)) {
      return existingAnswer.answer.filter((answer): answer is string => typeof answer === 'string');
    }
    if (typeof existingAnswer.answer === 'string') {
      return [existingAnswer.answer];
    }
    return [];
  });
  
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>(() => {
    if (existingAnswer && typeof existingAnswer.answer === 'object' && !Array.isArray(existingAnswer.answer)) {
      return existingAnswer.answer as Record<string, string>;
    }
    return {};
  });
  
  const [textAnswer, setTextAnswer] = useState<string>(() => {
    if (existingAnswer && typeof existingAnswer.answer === 'string') {
      return existingAnswer.answer;
    }
    return '';
  });
  
  const [showFeedback, setShowFeedback] = useState(() => !!existingAnswer || isReviewMode);
  const useMarkdown = question.textFormat === 'markdown';

  const isMultiSelect = useMemo(() => {
    if (question.type !== 'multiple-choice' || !question.answers) return false;
    return question.answers.filter(answer => answer.isCorrect).length > 1;
  }, [question.type, question.answers]);
  const acceptedAnswers = useMemo(
    () => (question.answers ? question.answers.filter((answer) => answer.isCorrect) : []),
    [question.answers]
  );
  const numericalAnswerHint = useMemo(() => {
    if (!question.numericalAnswer) return null;
    const answer = question.numericalAnswer;
    if (answer.min !== undefined && answer.max !== undefined) {
      return `${answer.min} to ${answer.max}`;
    }
    if (answer.tolerance !== undefined) {
      return `${answer.value} ± ${answer.tolerance}`;
    }
    return `${answer.value}`;
  }, [question.numericalAnswer]);
  
  // Shuffle answers for multiple choice (memoized)
  const shuffledAnswers = useMemo(() => {
    if (question.type === 'multiple-choice' && question.answers) {
      return shuffleArray(question.answers);
    }
    return question.answers || [];
  }, [question.type, question.answers]);

  // Shuffle match options
  const shuffledMatchOptions = useMemo(() => {
    if (question.matchPairs) {
      return shuffleArray(question.matchPairs.map(p => p.right));
    }
    return [];
  }, [question.matchPairs]);

  const handleSelect = (answer: string) => {
    if (showFeedback && !isReviewMode) return;
    if (question.type === 'multiple-choice' && isMultiSelect) {
      setSelectedAnswers((prev) =>
        prev.includes(answer) ? prev.filter((item) => item !== answer) : [...prev, answer]
      );
      return;
    }
    setSelectedAnswers([answer]);
  };

  const handleMatchSelect = (left: string, right: string) => {
    if (showFeedback && !isReviewMode) return;
    setMatchingAnswers(prev => ({ ...prev, [left]: right }));
  };

  const handleSubmit = () => {
    let answer: string | string[] | Record<string, string>;
    let isCorrect: boolean;

    switch (question.type) {
      case 'multiple-choice':
        if (selectedAnswers.length === 0) return;
        answer = isMultiSelect ? selectedAnswers : selectedAnswers[0];
        isCorrect = checkAnswer(question, answer);
        break;
      case 'true-false':
        if (selectedAnswers.length === 0) return;
        answer = selectedAnswers[0];
        isCorrect = checkAnswer(question, answer);
        break;
      case 'short-answer':
      case 'numerical':
        if (!textAnswer.trim()) return;
        answer = textAnswer.trim();
        isCorrect = checkAnswer(question, answer);
        break;
      case 'matching':
        if (!question.matchPairs || Object.keys(matchingAnswers).length !== question.matchPairs.length) return;
        answer = matchingAnswers;
        isCorrect = checkAnswer(question, matchingAnswers);
        break;
      case 'essay':
        answer = textAnswer;
        isCorrect = true;
        break;
      default:
        return;
    }

    submitAnswer(question.id, answer, isCorrect);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (questionNumber === totalQuestions) {
      finishQuiz();
    } else {
      nextQuestion();
    }
  };

  const canSubmit = () => {
    switch (question.type) {
      case 'multiple-choice':
        return selectedAnswers.length > 0;
      case 'true-false':
        return selectedAnswers.length > 0;
      case 'short-answer':
      case 'numerical':
      case 'essay':
        return textAnswer.trim().length > 0;
      case 'matching':
        return question.matchPairs?.length === Object.keys(matchingAnswers).length;
      default:
        return false;
    }
  };

  const renderAnswerFeedback = (answer: Answer, isSelected: boolean) => {
    if (!showFeedback) return null;
    
    if (answer.isCorrect) {
      return <Check className="w-5 h-5 text-green-500" />;
    }
    if (isSelected && !answer.isCorrect) {
      return <X className="w-5 h-5 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-8 lg:items-start"
      >
        <div className="mb-8 lg:mb-0 lg:sticky lg:top-24">
          {/* Question */}
          <div>
            {question.title && (
              <MarkdownText text={question.title} enabled={useMarkdown} className="text-sm font-medium text-zinc-500 mb-2" />
            )}
            <div className="text-xl font-semibold leading-relaxed">
              <MarkdownText text={question.text} enabled={useMarkdown} />
            </div>
          </div>
        </div>
        
        <div>
          {/* Answers */}
          <div className="space-y-3 mb-6 lg:max-h-[calc(100vh-320px)] lg:overflow-y-auto lg:pr-2">
        {question.type === 'multiple-choice' && isMultiSelect && (
          <p className="text-sm text-zinc-500">Select all that apply.</p>
        )}
        {(question.type === 'multiple-choice' || question.type === 'true-false') && (
          shuffledAnswers.map((answer, index) => {
            const isSelected = selectedAnswers.includes(answer.text);
            const isCorrect = answer.isCorrect;
            const shouldShowFeedbackText = showFeedback && answer.feedback && (isSelected || isCorrect);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-2"
              >
                <button
                  onClick={() => handleSelect(answer.text)}
                  disabled={showFeedback && !isReviewMode}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl text-left transition-all",
                    "border-2",
                    !showFeedback && [
                      isSelected
                        ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    ],
                    showFeedback && [
                      isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                      isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
                      !isSelected && !isCorrect && "border-zinc-200 dark:border-zinc-700 opacity-50"
                    ]
                  )}
                >
                  <MarkdownText text={answer.text} enabled={useMarkdown} inline className="font-medium text-sm sm:text-base" />
                  {renderAnswerFeedback(answer, isSelected)}
                </button>
                {shouldShowFeedbackText && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={cn(
                      "text-sm px-4 py-2 rounded-lg ml-2",
                      isCorrect
                        ? "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20"
                        : "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20"
                    )}
                  >
                    <MarkdownText text={answer.feedback || ''} enabled={useMarkdown} />
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}

        {(question.type === 'short-answer' || question.type === 'numerical') && (
          <div>
            <input
              type={question.type === 'numerical' ? 'number' : 'text'}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={showFeedback && !isReviewMode}
              placeholder={question.type === 'numerical' ? 'Enter a number...' : 'Type your answer...'}
              className={cn(
                "w-full px-4 py-3 rounded-xl border-2 bg-transparent",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                "dark:border-zinc-700",
                showFeedback && existingAnswer?.isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                showFeedback && !existingAnswer?.isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20"
              )}
            />
            {showFeedback && existingAnswer?.isCorrect === false && (
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {question.type === 'short-answer' && acceptedAnswers.length > 0 && (
                  <div>
                    <span className="font-medium">Correct answer{acceptedAnswers.length > 1 ? 's' : ''}: </span>
                    {acceptedAnswers.map((answer, index) => (
                      <span key={`${answer.text}-${index}`}>
                        <MarkdownText text={answer.text} enabled={useMarkdown} inline />
                        {index < acceptedAnswers.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
                {question.type === 'numerical' && numericalAnswerHint && (
                  <div>
                    <span className="font-medium">Correct answer: </span>
                    <span>{numericalAnswerHint}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {question.type === 'matching' && question.matchPairs && (
          <div className="space-y-4">
            {question.matchPairs.map((pair, index) => {
              const currentMatch = matchingAnswers[pair.left];
              const isCorrectMatch = showFeedback && currentMatch === pair.right;
              const isWrongMatch = showFeedback && currentMatch && currentMatch !== pair.right;
              
              return (
                <div key={index} className="space-y-2">
                  <div
                    className={cn(
                      "flex items-center gap-4 rounded-lg p-1 border",
                      "border-transparent",
                      isCorrectMatch && "border-green-500/70",
                      isWrongMatch && "border-red-500/70"
                    )}
                  >
                    <div className={cn(
                      "flex-1 p-3 rounded-lg border bg-zinc-100 dark:bg-zinc-800",
                      "border-zinc-200 dark:border-zinc-700",
                      isCorrectMatch && "bg-green-100 dark:bg-green-900/30",
                      isWrongMatch && "bg-red-100 dark:bg-red-900/30",
                      isCorrectMatch && "border-green-500",
                      isWrongMatch && "border-red-500"
                    )}>
                      {pair.left}
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                    <select
                      value={matchingAnswers[pair.left] || ''}
                      onChange={(e) => handleMatchSelect(pair.left, e.target.value)}
                      disabled={showFeedback && !isReviewMode}
                      className={cn(
                        "flex-1 p-3 rounded-lg border-2 appearance-none cursor-pointer",
                        "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500",
                        "dark:border-zinc-700",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                        isCorrectMatch && "border-green-500",
                        isWrongMatch && "border-red-500"
                      )}
                    >
                      <option value="" className="text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800">Select...</option>
                      {shuffledMatchOptions.map((option, i) => (
                        <option key={i} value={option} className="text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800">
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  {showFeedback && isWrongMatch && (
                    <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                      Correct match: <span className="font-medium">{pair.right}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {question.type === 'essay' && (
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={showFeedback && !isReviewMode}
            placeholder="Write your essay response..."
            rows={6}
            className={cn(
              "w-full px-4 py-3 rounded-xl border-2 bg-transparent resize-none",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "dark:border-zinc-700"
            )}
          />
        )}
          </div>

          {/* Feedback message */}
          {showFeedback && existingAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mb-6 p-4 rounded-xl",
                existingAnswer.isCorrect
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              )}
            >
              <p className="font-medium flex items-center gap-2">
                {existingAnswer.isCorrect ? (
                  <><Check className="w-5 h-5" /> Correct!</>
                ) : (
                  <><X className="w-5 h-5" /> Incorrect</>
                )}
              </p>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between lg:sticky lg:bottom-0 lg:py-3 lg:bg-white/95 lg:dark:bg-zinc-900/95 lg:backdrop-blur-sm">
            <button
              onClick={previousQuestion}
              disabled={questionNumber === 1}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                "transition-colors"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {!showFeedback ? (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit()}
                className={cn(
                  "px-6 py-2 rounded-lg font-medium transition-all",
                  "bg-zinc-900 text-white hover:bg-zinc-800",
                  "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all",
                  "bg-zinc-900 text-white hover:bg-zinc-800",
                  "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                )}
              >
                {questionNumber === totalQuestions ? 'Finish' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
