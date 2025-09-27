# Prompt Engineering Log (Role-based, Timestamped, Files Affected)

Compiled at (UTC): 2025-09-27T00:00:00Z

Each entry captures: Role prompt, Goal, Constraints, Acceptance Criteria, Actionable Tasks, Time used (UTC), and Files affected.

---

## 1) Improve UI/UX with React + Tailwind (All views)
- Role: user
- Time (UTC): 2025-09-27T00:00:00Z
- Goal: Analyze and implement visual, responsive, and accessible improvements across Dashboard, Game, Auth, Lobby, Summary, Admin, Home, Profile; refactor with reusable components.
- Constraints: Use `tailwind.config.js`. Apply edits directly. Document changes. Start with Dashboard.
- Acceptance: Modern, responsive, accessible UI; reusable components; no broken flows.
- Tasks:
  - Create primitives: Button, Input, Card, Alert, Section, Modal, Skeleton, Spinner.
  - Refactor views; remove legacy CSS imports in refactored files.
- Files affected (high-level):
  - `tailwind.config.js`
  - `src/components/ui/{Button.jsx,Input.jsx,Card.jsx,Alert.jsx,Section.jsx,Modal.jsx,Skeleton.jsx,Spinner.jsx}`
  - `src/pages/{DashboardPage.jsx,HomePage.jsx,LoginPage.jsx,RegisterPage.jsx,PasswordResetPage.jsx,CompleteProfilePage.jsx,ProfilePage.jsx,AdminPage.jsx,GameLobbyPage.jsx,GamePage.jsx,GameSummaryPage.jsx}`
  - `src/components/{Navbar.jsx,ManualQuestionForm.jsx,AIQuestionGenerator.jsx,Question.jsx,Ranking.jsx,Timer.jsx}`
  - Legacy CSS usage removed from those same views.

---

## 2) Enhance mobile experience (navbar, modals, tap targets)
- Role: user
- Time (UTC): 2025-09-27T00:05:00Z
- Goal: Ensure great smartphone UX; fix button hit targets; prevent horizontal overflow; improve navbar and modal behavior.
- Constraints: Do not break functionality; preserve accessibility.
- Acceptance: Smooth mobile navigation and modals; consistent focus ring; no overflow.
- Tasks: Navbar mobile drawer with aria-expanded, larger tap targets; Modal with body scroll lock, sticky header, `max-h` and internal scroll; remove tap highlight; safe-area utilities.
- Files affected:
  - `src/components/Navbar.jsx`
  - `src/components/ui/Modal.jsx`
  - `src/styles/tailwind.css` (tap highlight + safe-area utils)

---

## 3) Improve AI/Manual Questions UX (mobile numeric input)
- Role: user
- Time (UTC): 2025-09-27T00:10:00Z
- Goal: Make AI/Manual question generation forms mobile-first, with clear states and accessible focus; simplify numeric input.
- Constraints: Keep current API flows intact.
- Acceptance: Clean forms; reliable mobile numeric input; clear loading/error feedback.
- Tasks: Stepper initially + Spinner; then switch to manual-only numeric input with `inputMode="numeric"` and `pattern` filtering; empty by default; validations on blur; show helper text.
- Files affected:
  - `src/components/AIQuestionGenerator.jsx`
  - `src/components/ui/Spinner.jsx`
  - `src/components/ManualQuestionForm.jsx`

---

## 4) Game flow polishing (Lobby, Game, Summary)
- Role: user
- Time (UTC): 2025-09-27T00:15:00Z
- Goal: Organize question layout, ranking, and timer; add subtle animations; improve readability.
- Constraints: Socket flows must remain stable.
- Acceptance: Left column: question + options; right: ranking; timer aligned; animations for lists and options; stacked options on small screens.
- Tasks: framer-motion in public games grid, lobby players list, question options; two-column options on `sm:`; result highlighting (correct/incorrect).
- Files affected:
  - `src/pages/GameLobbyPage.jsx`
  - `src/pages/GamePage.jsx`
  - `src/pages/GameSummaryPage.jsx`
  - `src/components/Question.jsx`
  - `src/components/Ranking.jsx`
  - `src/components/Timer.jsx`

---

## 5) Performance and feedback (skeletons/spinners overlays on mobile)
- Role: user
- Time (UTC): 2025-09-27T00:20:00Z
- Goal: Add skeletons and mobile overlays while loading or connecting.
- Constraints: Minimal perf impact; respect reduced motion.
- Acceptance: Mobile overlays for connecting/creating/generating; skeletons for grids.
- Tasks: LoadingOverlay for Dashboard (creating), Lobby (connecting), AI generator (loading); skeleton grid in Dashboard and Lobby list placeholders; shimmer styling.
- Files affected:
  - `src/components/ui/LoadingOverlay.jsx`
  - `src/components/ui/Skeleton.jsx`
  - `src/theme.css` (skeleton shimmer)
  - `src/pages/{DashboardPage.jsx,GameLobbyPage.jsx}`
  - `src/components/AIQuestionGenerator.jsx`

---

## 6) Robust socket connect + timeouts (Create Game)
- Role: user
- Time (UTC): 2025-09-27T00:25:00Z
- Goal: Ensure create-game button never “se queda parado”.
- Constraints: Maintain current server events.
- Acceptance: Connects once, uses `once` listeners, and applies a 10s fallback timeout; opens AI generator if missing questions.
- Tasks: `connectSocket()` helper; `once('gameCreated')` and `once('error')`; timeout clearing.
- Files affected:
  - `src/pages/DashboardPage.jsx`
  - `src/services/socket.js` (read-only validation)

---

## 7) Tests and Coverage (95%)
- Role: user
- Time (UTC): 2025-09-27T00:30:00Z
- Goal: Increase tests and enforce 95% coverage.
- Constraints: Use Vitest JS DOM; keep CI stable.
- Acceptance: Coverage thresholds enforced; component tests added; plan updated.
- Tasks: Configure coverage in vitest; add tests for AIQuestionGenerator, Question, Navbar; update QA plan.
- Files affected:
  - `vitest.config.js`
  - `src/__tests__/{AIQuestionGenerator.test.jsx,Question.test.jsx,Navbar.test.jsx}`
  - `QA-TEST-PLAN.md`

---

Meta-Guidelines
- Mobile-first & accessibility (focus-visible, aria-*), consistent visual hierarchy.
- Prefer Tailwind utilities; phase out legacy CSS in refactored parts.
- Keep socket interactions robust (timeouts, optimistic UI, listener hygiene).

