# Gifted
Interactive GIFT quiz player for fast import, clean quiz-taking UX, and rich markdown question rendering.

Gifted is built for teachers, trainers, and teams that already have quiz banks in GIFT format and want a modern browser-based experience.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://gifted-gold-three.vercel.app/)

## Live Demo

https://gifted-gold-three.vercel.app/

## Highlights

1. Import from local `.gift`/`.txt` files or URLs
2. URL import works via server-side proxy (avoids browser CORS issues)
3. Full markdown question rendering (`[markdown]`) with GFM support
4. Supports all major GIFT question types used in this app
5. Multi-correct multiple-choice grading (exact-match selection)
6. Matching question feedback shows correct pair when user is wrong
7. Review mode + results breakdown after completion
8. Quiz data persistence in session storage
9. Desktop-optimized matching UI with drag/drop option chips
10. Shareable URL imports with optional prefilled quiz name via query params
11. Last run summary per quiz (correct answers + duration)
12. In-app confirm dialogs for critical actions (quit/delete)

## Tech Stack

1. Next.js 16 (App Router)
2. React 19 + TypeScript
3. Tailwind CSS v4
4. Zustand (session persistence)
5. Framer Motion
6. Lucide Icons

## Supported GIFT Types

1. Multiple choice (single and multi-correct)
2. True/False
3. Short answer
4. Matching
5. Numerical
6. Essay

For full syntax and compatibility details, see [QUIZ_GUIDE.md](QUIZ_GUIDE.md).

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm start        # run production server
npm run lint     # lint checks
```

## Import Options

1. File upload from local machine
2. URL import in UI
3. Share button in URL mode copies a link using query params
4. Query params:

```text
http://localhost:3000/?file=https://example.com/quiz.gift
http://localhost:3000/?file=https://example.com/quiz.gift&name=My%20Quiz
```

## Example GIFT

```gift
::Capital of France::
[markdown]
What is the capital of **France**?
{=Paris ~London ~Berlin ~Madrid}

::True or False::
The Earth is flat.
{FALSE}
```

## Project Structure

```text
src/app/                # App Router pages + API routes
src/components/         # UI components (import/list/player/results/cards)
src/lib/gift-parser.ts  # GIFT parsing logic
src/lib/store.ts        # Zustand quiz state
public/                 # sample .gift files
```

## Quality Notes

1. URL imports are proxied by `src/app/api/import/route.ts`.
2. Markdown links open in new tab with safe `rel` attributes.
3. Quiz overlay locks background scroll for focused test-taking.
4. Active quiz updates browser tab title to the current quiz name.

## Contributing

Contributions are welcome. Good first improvements:

1. Add Playwright E2E coverage for import + quiz flow
2. Add unit tests for parser edge cases
3. Add screenshot assets for this README

## License

Choose and add a license file (`MIT` recommended for open-source projects).
