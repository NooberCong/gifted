import type { Question, NumericalAnswer } from './gift-parser';

type ClassValue = string | boolean | undefined | null | (string | boolean | undefined | null)[];

export function cn(...classes: ClassValue[]): string {
  const result: string[] = [];
  
  for (const cls of classes) {
    if (!cls) continue;
    if (typeof cls === 'string') {
      result.push(cls);
    } else if (Array.isArray(cls)) {
      for (const c of cls) {
        if (typeof c === 'string' && c) {
          result.push(c);
        }
      }
    }
  }
  
  return result.join(' ');
}

export function checkAnswer(
  question: Question,
  userAnswer: string | string[] | Record<string, string>
): boolean {
  switch (question.type) {
    case 'multiple-choice': {
      if (!question.answers) return false;
      const correctAnswers = question.answers
        .filter(a => a.isCorrect)
        .map(a => a.text);

      const selectedAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      if (selectedAnswers.some(answer => typeof answer !== 'string')) return false;

      if (selectedAnswers.length !== correctAnswers.length) return false;

      const selectedSet = new Set(selectedAnswers);
      if (selectedSet.size !== selectedAnswers.length) return false;

      return correctAnswers.every(answer => selectedSet.has(answer));
    }

    case 'true-false': {
      if (!question.answers) return false;
      if (typeof userAnswer !== 'string') return false;
      const correctAnswer = question.answers.find(a => a.isCorrect);
      return correctAnswer?.text === userAnswer;
    }

    case 'short-answer': {
      if (!question.answers || typeof userAnswer !== 'string') return false;
      const normalizedInput = userAnswer.toLowerCase().trim();
      return question.answers.some(
        a => a.isCorrect && a.text.toLowerCase().trim() === normalizedInput
      );
    }

    case 'matching': {
      if (!question.matchPairs || typeof userAnswer !== 'object' || Array.isArray(userAnswer)) {
        return false;
      }
      const matches = userAnswer as Record<string, string>;
      return question.matchPairs.every(pair => matches[pair.left] === pair.right);
    }

    case 'numerical': {
      if (!question.numericalAnswer || typeof userAnswer !== 'string') return false;
      const numValue = parseFloat(userAnswer);
      if (isNaN(numValue)) return false;
      return checkNumericalAnswer(numValue, question.numericalAnswer);
    }

    case 'essay':
      // Essays are always marked as "answered" but not auto-graded
      return true;

    default:
      return false;
  }
}

function checkNumericalAnswer(value: number, answer: NumericalAnswer): boolean {
  if (answer.min !== undefined && answer.max !== undefined) {
    return value >= answer.min && value <= answer.max;
  }
  if (answer.tolerance !== undefined) {
    return Math.abs(value - answer.value) <= answer.tolerance;
  }
  return value === answer.value;
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function getQuestionTypeLabel(type: Question['type']): string {
  const labels: Record<Question['type'], string> = {
    'multiple-choice': 'Multiple Choice',
    'true-false': 'True/False',
    'short-answer': 'Short Answer',
    'matching': 'Matching',
    'numerical': 'Numerical',
    'essay': 'Essay'
  };
  return labels[type] || type;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
