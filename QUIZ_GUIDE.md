# QUIZ_GUIDE.md

This guide explains how to write GIFT files that are fully compatible with this app.

## Overview

The app imports plain-text `.gift` / `.txt` files and parses them into quiz questions.

Supported question types:

1. Multiple choice
2. True/False
3. Short answer
4. Matching
5. Numerical
6. Essay

## Quick Rules

1. Every question must contain an answer block in `{ ... }`.
2. Use one question per block, separated by blank lines.
3. Recommended: always use a question title with `::Title::`.
4. Use `=` for correct answers and `~` for incorrect answers.
5. Use uppercase `TRUE` / `FALSE` for true-false.

---

## Question Structure

Recommended full structure:

```gift
::Question Title::
[markdown]
Question text here
{=Correct ~Wrong ~Wrong}
```

Parts:

1. `::Question Title::` (optional, but recommended)
2. `[markdown]` format tag (optional, see Markdown section)
3. Question text
4. Answer block `{ ... }` (required)

---

## Supported Formats for Question Text

You can optionally place one format tag right after the title:

1. `[plain]`
2. `[markdown]`
3. `[html]`
4. `[moodle]`

Notes:

1. Markdown rendering is supported and recommended (`[markdown]`).
2. HTML is not rendered as raw HTML in the UI; prefer markdown.

---

## Multiple Choice

Use `=` for correct option(s), `~` for incorrect.

Single-correct:

```gift
::Capital::
What is the capital of France?
{=Paris ~London ~Berlin ~Madrid}
```

Multi-correct (select all that apply):

```gift
::Prime Numbers::
Which are prime?
{=2 =3 =5 ~4 ~6}
```

Scoring behavior:

1. For multi-correct, user must select exactly all correct options.
2. Extra or missing selections are marked incorrect.

---

## True/False

Use uppercase `TRUE` or `FALSE`:

```gift
::TF Example::
The Earth orbits the Sun.
{TRUE}
```

---

## Short Answer

Use only `=` answers (no `~`) to create short-answer type.

```gift
::Short Answer::
Type the language used by this app.
{=TypeScript =typescript}
```

---

## Matching

Use `=left -> right` pairs:

```gift
::Matching::
Match each term.
{=CPU -> Processor =RAM -> Memory =SSD -> Storage}
```

UI behavior:

1. Correct rows are highlighted.
2. Wrong rows are highlighted and show the correct match.

---

## Numerical

Supported forms:

1. Exact value: `{#42}`
2. Value with tolerance: `{#10:0.5}` (means 10 ± 0.5)
3. Range: `{#5..8}`

Examples:

```gift
::Numerical Exact::
How many days are in a week?
{#7}
```

```gift
::Numerical Tolerance::
Approximate value of pi (1 decimal).
{#3.1:0.2}
```

```gift
::Numerical Range::
Pick a value in range.
{#10..20}
```

---

## Essay

Use empty answer block:

```gift
::Essay::
Explain event-driven architecture.
{}
```

Essay is treated as answered, not auto-graded.

---

## Feedback per Answer

Add feedback with `#` after an answer option:

```gift
{=Paris#Correct! ~London#Not France.}
```

Feedback can include markdown if the question is `[markdown]`.

---

## Weights (Partial Support)

Parser supports `%weight%` syntax, for example:

```gift
{~%50%Partially correct ~%0%Wrong =Correct}
```

Notes:

1. For multiple-choice correctness, positive weight is treated as correct by parser.
2. App scoring is still binary per question (correct/incorrect), not partial points.

---

## Escaping Special Characters

Escape these when you want literal characters in text/answers:

1. `\~`
2. `\=`
3. `\#`
4. `\{`
5. `\}`
6. `\:`
7. `\n` for newline

Example:

```gift
::Escape Example::
What does \= mean in docs?
{=\= indicates equality}
```

---

## Comments

Lines starting with `//` are removed before parsing.

```gift
// This is a comment
::Q1::
2 + 2 = ?
{=4 ~3}
```

---

## Markdown Support Notes

When using `[markdown]`, rendered features include:

1. Headings
2. Bold / italic / strikethrough
3. Inline code + fenced code blocks
4. Lists (ordered/unordered/task lists)
5. Blockquotes
6. Tables
7. Horizontal rules
8. Links (open in new tab)

---

## Recommended File Template

```gift
::Q1 Title::
[markdown]
Question text
{=Correct ~Wrong ~Wrong}

::Q2 Title::
Statement here.
{TRUE}

::Q3 Title::
Short answer prompt
{=Answer1 =Answer2}

::Q4 Title::
Match items
{=A -> 1 =B -> 2}

::Q5 Title::
Numeric prompt
{#10:0.5}

::Q6 Title::
Essay prompt
{}
```

---

## Compatibility Checklist

Before importing:

1. Every question has a valid `{ ... }` block.
2. Correct/incorrect markers (`=` / `~`) are used properly.
3. True/False uses `TRUE` or `FALSE`.
4. If markdown desired, add `[markdown]`.
5. Escape special characters when needed.
6. Keep one clear question block per section, separated by blank lines.

