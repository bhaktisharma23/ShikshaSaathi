# ShikshaSaathi — Development Plan

> Status: **APPROVED 2026-11-20** (all recommendations D1–D11 accepted). Phase 1 complete — awaiting review before Phase 2.

Each phase ends with: `npx tsc --noEmit` ✅ · `npx expo lint` ✅ · unit tests ✅ · the phase's manual checklist on a real Android phone ✅ · a short explanation of what was built and why.

---

## 0. Decisions pending approval

| # | Decision | Recommendation |
|---|---|---|
| D1 | UI language | English + Hindi UI from day one (toggle in More) |
| D2 | Result recording detail | Offer quick tally **and** roll-number grid; no student names (optional initials) |
| D3 | Starter template files | Delete template screens/components we don't reuse (it's all in git history) rather than running `reset-project` |
| D4 | Theme | Light theme only for MVP (better in sunlight and on projectors); dark later |
| D5 | Orientation | App portrait; classroom routes rotate to landscape (`app.json` → `default` + per-screen locks) |
| D6 | Content validation library | Add `zod` |
| D7 | Worksheets | On-screen + PDF export/share (`expo-print` + `expo-sharing`) in Phase 7 |
| D8 | Lottie | Defer; use our SVG + Reanimated scene engine |
| D9 | Reference topic | Build `sci-magnets` fully first |
| D10 | Fonts | Bundle Noto Sans + Noto Sans Devanagari |
| D11 | Provisional topic list | Approve as *planning placeholders*, pending verification |

---

## Phase 0 — Architecture & curriculum verification (no code)
- Approve the four documents and decisions D1–D11.
- **In parallel (you):** start Gate 1 verification for the 10 provisional topics against current NCERT/CBSE sources. Replace any topic that doesn't match.
- **Exit:** approved docs; verified (or replaced) topic list for at least the reference topic.

## Phase 1 — Foundation & design system
- Remove starter template screens/assets that we won't use (with your approval).
- Update `app.json`: name, brand colours (splash/adaptive icon background), orientation setting.
- Design tokens in `src/constants/theme.ts`; fonts.
- UI kit: `Text`, `Button`, `IconButton`, `Card`, `Screen`, `ListRow`, `Badge`, `EmptyState`, `ErrorState`, `Loading`, `Segmented`, `Stepper`.
- i18n: `en.ts`, `hi.ts`, `useT()`.
- Navigation skeleton: 4 tabs + stacks + classroom routes, each showing a proper empty state (no fake content).
- Test setup: `jest-expo`, React Native Testing Library.
- **Test:** every tab and back button works; text scaling at 130 %; Hindi labels render; tests run.
- **Change from plan:** `expo-sqlite` was installed in Phase 1 (not 3) so the language choice is saved with its key-value store. The database tables still arrive in Phase 3.
- **Outcome:** tsc ✅ · lint ✅ · 30 Jest tests ✅ (incl. router navigation test) · expo-doctor 20/20 ✅ · Android bundle export ✅ · manual device checklist ⏳ (needs your phone).

## Phase 2 — Content system + reference topic
- Install `zod`. Write schemas in `src/content/schema/` → TypeScript types inferred from them.
- `registry.ts`, `repository.ts`, `scripts/validate-content.ts`.
- Author the reference topic (`sci-magnets`, marked **Sample**) — at least preparation, misconceptions and assessments.
- Screens: Home (subjects), Subject (topic list + verification badge), Topic Hub.
- Other 9 topics appear as "Content in preparation" (honest empty state), not fake data.
- **Test:** validation script catches deliberately broken files; Home → Subject → Topic in 2 taps.

## Phase 3 — Database & classes
- Install `expo-sqlite`, `expo-file-system`.
- `SQLiteProvider` + migration runner (`PRAGMA user_version`) + `001_initial`.
- Repositories: classrooms, notes, bookmarks, recent items, teaching log, media.
- Classes tab: list, add/edit, delete (with undo); kv-store settings.
- Dev-only self-test screen.
- **Test:** fresh install creates DB; kill app and reopen → data persists; migration runs once only.

## Phase 4 — Teacher Preparation Centre
- Prepare screen: collapsible sections (overview, objectives, prerequisites, duration, materials, introduction, step-by-step, examples, demonstrations, questions to ask, misconceptions, alternative methods, remedial).
- Teacher notes per section, bookmarks, "Mark as taught" → teaching log, Recent on Home.
- **Test:** long content scrolls smoothly; notes persist; airplane mode works.

## Phase 5 — Visual Teaching Studio
- Install `react-native-svg`, `expo-speech`, `expo-audio`, `expo-video`, `expo-screen-orientation` (+ keep-awake after verification).
- Scene engine: timeline runner, element renderers, step actions.
- Player: play/pause/replay/previous/next, caption bar, narration toggle (with voice detection), full-screen landscape presentation.
- Video player route that appears **only** for registered, existing media.
- Author scene lesson(s) for the reference topic.
- **Test:** 60 fps target on low-end phone; narration with and without Hindi voice; rotation in and out of presentation.

## Phase 6 — Classroom Activity Centre
- Renderer per type: oral prompt deck, group activity card + timer, matching board, quiz, visual puzzle, demonstration steps, shared-device turn-taking.
- Activities for the reference topic.
- **Test:** each type works with large touch targets; timer survives screen lock.

## Phase 7 — Assessment Centre
- Question bank views, answer keys with explanations, difficulty filters.
- Runners: oral quiz (teacher reads, reveals answer), interactive quiz, topic test, worksheet view (+ PDF if D7 approved).
- Start flow: choose class, date, students present, recording mode.
- Recorders: quick tally (steppers + option counts), roll-number grid, shared-device auto-record.
- Save session → `question_outcomes` / `option_counts` / `student_responses` in one transaction. Summary screen.
- **Test:** tally sums validated (correct ≤ attempted ≤ present); interrupted session resumes; discard works.

## Phase 8 — Teaching Insights
- `src/domain/analytics/` pure functions + unit tests with hand-calculated fixtures.
- Screens: overview per class, topic insight (question accuracy, common wrong answers, learning gaps, trend, history), remedial recommendations from content.
- "Not enough data yet" states for every metric under threshold.
- **Test:** record known data by hand → dashboard shows exactly the expected numbers; zero data shows empty states, never zeros pretending to be results.

## Phase 9 — Remaining content + data safety
- Author the other 9 topics (after verification), one subject at a time.
- Backup export/import (JSON via share sheet).
- Storage & downloads screen (only lists real media).
- About Content screen: verification status and sources per topic.

## Phase 10 — Hardening & release
- Accessibility pass (TalkBack labels, contrast, 48 dp targets, font scaling).
- Performance pass on low-end device; APK size check.
- `npx expo-doctor`; EAS preview build (`npx eas-cli@latest build --profile preview --platform android`) → installable APK.
- Field test with 2–3 teachers; fix issues.

## Later (not in MVP)
Cloud sync, more grades/topics, downloadable content packs, Lottie animations, dark theme, teacher community sharing.

---

## Build-environment note
All planned modules are documented as Expo Go-compatible in SDK 58 (re-checked at install time), so you can test on your phone via Expo Go for most phases. If a module turns out to need native code outside Expo Go, we switch to a development build (`npx expo run:android` or `eas build --profile development`) and I'll explain why at that point.
