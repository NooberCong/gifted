/**
 * GIFT Format Parser
 * Parses GIFT (General Import Format Template) quiz files
 * Reference: https://docs.moodle.org/en/GIFT_format
 */

export type QuestionType = 
  | 'multiple-choice'
  | 'true-false'
  | 'short-answer'
  | 'matching'
  | 'numerical'
  | 'essay';
export type QuestionTextFormat = 'html' | 'moodle' | 'plain' | 'markdown';

export interface Answer {
  text: string;
  isCorrect: boolean;
  feedback?: string;
  weight?: number;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface NumericalAnswer {
  value: number;
  tolerance?: number;
  min?: number;
  max?: number;
}

export interface Question {
  id: string;
  title?: string;
  text: string;
  textFormat: QuestionTextFormat;
  type: QuestionType;
  answers?: Answer[];
  matchPairs?: MatchPair[];
  numericalAnswer?: NumericalAnswer;
  generalFeedback?: string;
}

export interface Quiz {
  id: string;
  name: string;
  questions: Question[];
  importedAt: number;
  source?: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function unescapeGift(text: string): string {
  return text
    .replace(/\\~/g, '~')
    .replace(/\\=/g, '=')
    .replace(/\\#/g, '#')
    .replace(/\\{/g, '{')
    .replace(/\\}/g, '}')
    .replace(/\\:/g, ':')
    .replace(/\\n/g, '\n')
    .trim();
}

function parseAnswerWeight(text: string): { text: string; weight: number } {
  const weightMatch = text.match(/^%(-?\d+(?:\.\d+)?)%(.*)$/s);
  if (weightMatch) {
    return {
      weight: parseFloat(weightMatch[1]),
      text: weightMatch[2].trim()
    };
  }
  return { text: text.trim(), weight: 0 };
}

function parseFeedback(text: string): { text: string; feedback?: string } {
  const feedbackMatch = text.match(/^(.+?)#(.+)$/s);
  if (feedbackMatch) {
    return {
      text: feedbackMatch[1].trim(),
      feedback: unescapeGift(feedbackMatch[2].trim())
    };
  }
  return { text: text.trim() };
}

function parseAnswerBlock(block: string): {
  type: QuestionType;
  answers?: Answer[];
  matchPairs?: MatchPair[];
  numericalAnswer?: NumericalAnswer;
} {
  const content = block.slice(1, -1).trim();
  
  // True/False
  if (content === 'T' || content === 'TRUE' || content === 'F' || content === 'FALSE') {
    const isTrue = content === 'T' || content === 'TRUE';
    return {
      type: 'true-false',
      answers: [
        { text: 'True', isCorrect: isTrue },
        { text: 'False', isCorrect: !isTrue }
      ]
    };
  }
  
  // Essay (empty answer block)
  if (content === '') {
    return { type: 'essay' };
  }
  
  // Numerical answer
  if (content.startsWith('#')) {
    const numContent = content.slice(1).trim();
    const rangeMatch = numContent.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
    if (rangeMatch) {
      return {
        type: 'numerical',
        numericalAnswer: {
          value: parseFloat(rangeMatch[1]),
          tolerance: parseFloat(rangeMatch[2])
        }
      };
    }
    const minMaxMatch = numContent.match(/^(\d+(?:\.\d+)?)\.\.(\d+(?:\.\d+)?)$/);
    if (minMaxMatch) {
      return {
        type: 'numerical',
        numericalAnswer: {
          value: (parseFloat(minMaxMatch[1]) + parseFloat(minMaxMatch[2])) / 2,
          min: parseFloat(minMaxMatch[1]),
          max: parseFloat(minMaxMatch[2])
        }
      };
    }
    return {
      type: 'numerical',
      numericalAnswer: { value: parseFloat(numContent) || 0 }
    };
  }
  
  // Matching
  if (content.includes('->')) {
    const pairs = content.split(/\s*=\s*/).filter(Boolean);
    const matchPairs: MatchPair[] = [];
    for (const pair of pairs) {
      const match = pair.match(/^(.+?)\s*->\s*(.+)$/s);
      if (match) {
        matchPairs.push({
          left: unescapeGift(match[1].trim()),
          right: unescapeGift(match[2].trim())
        });
      }
    }
    if (matchPairs.length > 0) {
      return { type: 'matching', matchPairs };
    }
  }
  
  // Multiple choice or short answer
  const answerParts = content.split(/(?<!\\)(?:~|(?==))/);
  const answers: Answer[] = [];
  let hasCorrect = false;
  let hasIncorrect = false;
  
  for (let part of answerParts) {
    part = part.trim();
    if (!part) continue;
    
    const isCorrect = part.startsWith('=');
    if (isCorrect) {
      part = part.slice(1).trim();
      hasCorrect = true;
    } else {
      hasIncorrect = true;
    }
    
    const { text: weightedText, weight } = parseAnswerWeight(part);
    const { text: finalText, feedback } = parseFeedback(weightedText);
    
    if (finalText) {
      answers.push({
        text: unescapeGift(finalText),
        isCorrect: isCorrect || weight > 0,
        feedback,
        weight: isCorrect ? 100 : weight
      });
    }
  }
  
  // Short answer: only correct answers (all start with =)
  if (hasCorrect && !hasIncorrect && !content.includes('~')) {
    return { type: 'short-answer', answers };
  }
  
  return { type: 'multiple-choice', answers };
}

function parseQuestion(questionText: string): Question | null {
  let text = questionText.trim();
  if (!text || text.startsWith('//')) return null;
  
  // Extract title
  let title: string | undefined;
  const titleMatch = text.match(/^::([^:]+)::\s*/);
  if (titleMatch) {
    title = unescapeGift(titleMatch[1].trim());
    text = text.slice(titleMatch[0].length);
  }
  
  // Extract format specifier (e.g., [html], [moodle], [plain], [markdown])
  let textFormat: QuestionTextFormat = 'plain';
  const formatMatch = text.match(/^\[(html|moodle|plain|markdown)\]\s*/i);
  if (formatMatch) {
    textFormat = formatMatch[1].toLowerCase() as QuestionTextFormat;
    text = text.slice(formatMatch[0].length);
  }
  
  // Find answer block - need to handle multi-line content
  // Find the opening brace and then find its matching closing brace
  const openBraceIndex = text.indexOf('{');
  if (openBraceIndex === -1) {
    // No answer block - could be a description, skip
    return null;
  }
  
  // Find matching closing brace (handle potential nested braces in code blocks)
  let braceDepth = 0;
  let closeBraceIndex = -1;
  for (let i = openBraceIndex; i < text.length; i++) {
    if (text[i] === '{') braceDepth++;
    else if (text[i] === '}') {
      braceDepth--;
      if (braceDepth === 0) {
        closeBraceIndex = i;
        break;
      }
    }
  }
  
  if (closeBraceIndex === -1) {
    // No matching closing brace
    return null;
  }
  
  const questionTextPart = text.slice(0, openBraceIndex).trim();
  const answerBlock = text.slice(openBraceIndex, closeBraceIndex + 1);
  
  const parsed = parseAnswerBlock(answerBlock);
  
  return {
    id: generateId(),
    title,
    text: unescapeGift(questionTextPart),
    textFormat,
    type: parsed.type,
    answers: parsed.answers,
    matchPairs: parsed.matchPairs,
    numericalAnswer: parsed.numericalAnswer
  };
}

export function parseGift(content: string, quizName?: string): Quiz {
  // Normalize line endings and remove comment lines
  const normalized = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n');
  
  // Split into question blocks
  // Strategy: Split on question title markers (::title::) or use blank-line separation for untitled questions
  const blocks: string[] = [];
  
  // Check if content uses titled questions (::title::)
  const hasTitledQuestions = /^\s*::[^:]+::/m.test(normalized);
  
  if (hasTitledQuestions) {
    // Split by title markers, keeping the marker with the content
    const parts = normalized.split(/(?=^\s*::[^:]+::)/m);
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed && trimmed.includes('{')) {
        blocks.push(trimmed);
      }
    }
  } else {
    // Fallback: split by blank lines for untitled questions
    // But be smarter - only split on multiple consecutive blank lines
    // or blank lines that are NOT between question text and answer block
    const lines = normalized.split('\n');
    let currentBlock = '';
    let braceDepth = 0;
    
    for (const line of lines) {
      // Track brace depth to know if we're inside an answer block
      for (const char of line) {
        if (char === '{') braceDepth++;
        else if (char === '}') braceDepth--;
      }
      
      if (line.trim() === '' && braceDepth === 0) {
        // Blank line outside answer block - potential question separator
        // But only if current block has a complete question (has closing brace)
        if (currentBlock.trim() && currentBlock.includes('}')) {
          blocks.push(currentBlock.trim());
          currentBlock = '';
        } else if (currentBlock.trim()) {
          // Keep accumulating - question text before answer block
          currentBlock += '\n';
        }
      } else {
        currentBlock += (currentBlock && !currentBlock.endsWith('\n') ? '\n' : '') + line;
      }
    }
    if (currentBlock.trim()) {
      blocks.push(currentBlock.trim());
    }
  }
  
  const questions: Question[] = [];
  for (const block of blocks) {
    const question = parseQuestion(block);
    if (question) {
      questions.push(question);
    }
  }
  
  return {
    id: generateId(),
    name: quizName || 'Imported Quiz',
    questions,
    importedAt: Date.now()
  };
}

export function validateGiftContent(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content is empty or invalid' };
  }
  
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Content is empty' };
  }
  
  // Check for at least one question pattern
  if (!trimmed.includes('{') || !trimmed.includes('}')) {
    return { valid: false, error: 'No valid GIFT questions found (missing answer blocks)' };
  }
  
  try {
    const quiz = parseGift(content);
    if (quiz.questions.length === 0) {
      return { valid: false, error: 'No valid questions could be parsed from the content' };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: `Parse error: ${e instanceof Error ? e.message : 'Unknown error'}` };
  }
}
