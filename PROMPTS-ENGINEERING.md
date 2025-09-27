# Prompt Engineering Requests (Compiled)

This document compiles the user prompts into a structured format suitable for reproducible prompt engineering and future automation. Each prompt block includes: Goal, Constraints, Acceptance Criteria, and Actionable Tasks.

## Prompt 1: Improve UI/UX with React + Tailwind (All views)
- Goal: Analyze and implement visual, responsive, and accessibility improvements across Dashboard, Game, Auth, Lobby, Summary, Admin, Home, Profile; refactor with reusable components.
- Constraints: Use `tailwind.config.js`; do edits directly; document changes; proceed view-by-view starting with Dashboard.
- Acceptance: Modern, responsive, accessible UI; reusable UI components; no broken flows.
- Tasks:
  - Create UI primitives: Button, Input, Card, Alert, Section, Modal, Skeleton, Spinner.
  - Refactor views incrementally; remove legacy CSS usage.

## Prompt 2: Enhance mobile experience
- Goal: Ensure excellent smartphone rendering; fix button hit targets; avoid horizontal overflow; improved navbar and modal behaviors.
- Constraints: Keep functionality; accessibility preserved.
- Acceptance: Smooth mobile navigation and interactions, responsive layouts.
- Tasks: Navbar mobile drawer, Modal body-scroll lock and max-height, tap highlight removal, safe-area utilities.

## Prompt 3: Improve AI/Manual Questions UX
- Goal: Improve AIQuestionGenerator and ManualQuestionForm with mobile-first forms, clear states, and accessible focus.
- Constraints: Respect existing API flows.
- Acceptance: Clean forms, clear loading/error states, easy numeric inputs on mobile.
- Tasks: Add steppers, spinner, and later switch to manual-only numeric input; validation rules.

## Prompt 4: Game flow polishing
- Goal: Improve Lobby, Game, Summary views with responsive, animated and clear layouts.
- Constraints: Do not break socket flows.
- Acceptance: Organized question/answers layout, ranking on side, timer placement; animations for lists and options.
- Tasks: Framer-motion on cards/players/options; stacked options grid; result highlighting.

## Prompt 5: Performance and feedback
- Goal: Add skeletons and spinners on mobile while loading or connecting.
- Constraints: Minimal performance impact; respect reduced motion.
- Acceptance: Mobile overlays for connecting/creating/generating; skeletons before data.
- Tasks: LoadingOverlay in Dashboard (create), Lobby (connect), AI generator (loading); skeleton grids.

## Prompt 6: Tests and Coverage
- Goal: Run tests, increase test count, and enforce 95% coverage.
- Constraints: Keep CI stable; use Vitest.
- Acceptance: Coverage thresholds enforced; basic component tests added.
- Tasks: Vitest coverage config; add unit tests for AIQuestionGenerator, Question, Navbar.

---

Meta-Guidelines
- Always keep mobile-first, accessibility (focus-visible, aria-*), and visual hierarchy in mind.
- Prefer Tailwind utility classes; remove legacy CSS imports when refactoring.
- Keep socket interactions robust, with timeouts and optimistic UI.

