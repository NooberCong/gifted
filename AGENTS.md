# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Gifted is a Next.js quiz application that imports GIFT format files and provides an interactive quiz-taking experience. It uses session storage to remember imported quizzes within a browser session.

## Build & Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (ES2018 target)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand with session storage persistence
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Key Directories
- `src/app/` - Next.js App Router pages
- `src/components/` - React components (QuizImport, QuizList, QuizPlayer, QuestionCard, QuizResults)
- `src/lib/` - Core utilities and business logic
  - `gift-parser.ts` - GIFT format parser supporting multiple question types
  - `store.ts` - Zustand store for quiz state management
  - `utils.ts` - Utility functions including answer validation
- `public/sample-quiz.gift` - Example GIFT format file for testing

### Data Flow
1. User imports GIFT file (upload or URL, including `?file=` query parameter)
2. `gift-parser.ts` parses content into structured `Quiz` objects
3. Quiz is stored in Zustand store (persisted to sessionStorage)
4. `QuizPlayer` orchestrates the quiz-taking flow
5. `QuestionCard` renders questions based on type and handles answer submission
6. `QuizResults` displays final score with review capability

### GIFT Format Support
The parser (`src/lib/gift-parser.ts`) supports these question types:
- Multiple choice (`{=correct ~wrong ~wrong}`)
- True/False (`{TRUE}` or `{FALSE}`)
- Short answer (`{=answer1 =answer2}`)
- Matching (`{=item1 -> match1 =item2 -> match2}`)
- Numerical (`{#value:tolerance}` or `{#min..max}`)
- Essay (`{}`)

### State Management
Zustand store in `src/lib/store.ts` manages:
- Imported quizzes (persisted to sessionStorage)
- Current quiz session state
- User answers with correctness tracking
- Quiz navigation (current question index)
- Review mode for post-quiz answer review

## Important Patterns

### Client Components
All interactive components use `'use client'` directive. The main page is a client component to handle quiz state.

### Component Remounting
`QuestionCard` relies on React's key prop (`key={question.id}`) for state reset when navigating between questions. Do not add useEffect-based state syncing.

### Answer Validation
Answer checking logic is centralized in `src/lib/utils.ts:checkAnswer()` and handles all question types with proper normalization.

### CSS Class Utility
The `cn()` utility in `src/lib/utils.ts` handles conditional class names including arrays for complex conditional styling patterns.
