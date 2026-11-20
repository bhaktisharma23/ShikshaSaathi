# ShikshaSaathi — Content Structure

> Status: **PROPOSED — awaiting approval.**
> **All topic names below are PROVISIONAL.** They must pass the Curriculum Verification Step (§6) before any content is written for teachers or published.

---

## 1. Principles

1. **Content is data, not code.** Every lesson, activity and question is a JSON file validated against a schema. Screens never contain educational text.
2. **Original writing only.** We write our own explanations aligned to learning outcomes. We never copy textbook passages, exercises or illustrations.
3. **Practical over generic.** "Explain fractions" is rejected by review. "Fold a roti/paper circle into 4 equal parts; hold up one part and ask: 'what part of the whole is this?'" is accepted.
4. **Affordable materials.** Chalk, slate, paper, leaves, stones, bottle caps, seeds, string, sticks, newspaper, local objects.
5. **Bilingual-ready.** Every teacher-facing and student-facing string has `en` and `hi` fields (Hindi optional during drafting, required before publish if approved).
6. **Traceable.** Every topic records its curriculum source and who verified it.
7. **Honest labelling.** Unverified content shows a visible "Sample — not yet verified" badge in the app.

---

## 2. Hierarchy

```
Grade (6)
 └─ Subject (5)                maths · science · english · hindi · social-science
     └─ Topic (2 per subject)  e.g. science/magnets
         ├─ meta.json          ids, titles, verification, version
         ├─ preparation.json   Teacher Preparation Centre
         ├─ scenes.json        Visual Teaching Studio scene lessons
         ├─ activities.json    Classroom Activity Centre
         ├─ assessments.json   questions, quizzes, tests, worksheets, answer keys
         └─ misconceptions.json  shared by preparation, assessments and insights
```

### File location
```
src/content/data/
├─ subjects.json
└─ subjects/
   ├─ maths/<topic-slug>/*.json
   ├─ science/<topic-slug>/*.json
   ├─ english/<topic-slug>/*.json
   ├─ hindi/<topic-slug>/*.json
   └─ social-science/<topic-slug>/*.json
```
`src/content/registry.ts` imports each file statically (Metro bundler needs static imports). A future "downloadable content pack" would use the same schema, read from the file system instead.

---

## 3. ID scheme

Stable, readable, never reused:

| Item | Pattern | Example |
|---|---|---|
| Subject | `<subject>` | `science` |
| Topic | `<subj>-<slug>` | `sci-magnets` |
| Learning objective | `<topic>-lo<n>` | `sci-magnets-lo2` |
| Misconception | `<topic>-mc<n>` | `sci-magnets-mc1` |
| Scene lesson | `<topic>-sl<n>` | `sci-magnets-sl1` |
| Activity | `<topic>-act<n>` | `sci-magnets-act3` |
| Question | `<topic>-q<nn>` | `sci-magnets-q07` |
| Option | `<question>-<a..d>` | `sci-magnets-q07-b` |
| Assessment | `<topic>-as<n>` | `sci-magnets-as1` |
| Media | `<topic>-m<n>` | `sci-magnets-m1` |

SQLite stores these IDs, so **an ID never changes meaning**. If a question is rewritten substantially, it gets a new ID.

---

## 4. Schema per file (summary)

`LocalizedText = { en: string; hi?: string }`

### meta.json
```ts
{
  id, subjectId, grade: 6, order,
  title: LocalizedText, summary: LocalizedText,
  contentVersion: "0.1.0",
  status: "draft" | "curriculum_verified" | "pedagogy_reviewed" | "published",
  isSample: boolean,
  curriculum: {
    framework: "CBSE",
    source: string,          // e.g. NCERT textbook title + edition year
    chapterRef: string,      // chapter number/title as printed
    learningOutcomeRefs: string[],
    verifiedBy?: string, verifiedOn?: string, notes?: string
  },
  objectives: { id, text: LocalizedText, bloomLevel }[],
  prerequisites: LocalizedText[],
  suggestedDurationMinutes: number,
  periods: number
}
```

### preparation.json (Teacher Preparation Centre)
```ts
{
  overview: LocalizedText,
  materials: { name: LocalizedText, lowCostAlternative?: LocalizedText, quantity?: string }[],
  introduction: { hook: LocalizedText, script: LocalizedText, durationMinutes }[],
  teachingSteps: {
    order, title: LocalizedText, durationMinutes,
    teacherDoes: LocalizedText, studentsDo: LocalizedText,
    sayThis?: LocalizedText,          // sample teacher talk
    boardWork?: LocalizedText,        // what to write/draw on board
    checkForUnderstanding?: LocalizedText,
    objectiveIds: string[]
  }[],
  realLifeExamples: LocalizedText[],
  demonstrations: { title, materials, steps: LocalizedText[], safetyNote? }[],
  questionsToAsk: { text: LocalizedText, level: "recall"|"understand"|"apply"|"think", expectedAnswer?: LocalizedText }[],
  misconceptionIds: string[],
  alternativeMethods: { title, whenToUse: LocalizedText, description: LocalizedText }[],
  remedial: { forObjectiveId, strategy: LocalizedText, quickActivity?: LocalizedText }[]
}
```

### misconceptions.json
```ts
{ id, statement: LocalizedText, whyStudentsThinkThis: LocalizedText,
  howToSpot: LocalizedText, howToCorrect: LocalizedText, objectiveIds: string[] }[]
```

### scenes.json (Visual Teaching Studio)
```ts
{
  id, title: LocalizedText, durationSeconds,
  scenes: {
    id, background?: string,
    elements: { id, kind: "rect"|"circle"|"line"|"path"|"text"|"image"|"arrow", props }[],
    steps: { action: "appear"|"hide"|"move"|"highlight"|"split"|"color"|"label"|"wait",
             target: string, params?, durationMs,
             caption?: LocalizedText }[]
  }[],
  mediaIds?: string[]      // only real, registered media
}
```

### activities.json (Classroom Activity Centre)
```ts
{
  id, type: "oral" | "group" | "matching" | "quiz" | "puzzle" | "demonstration" | "shared_device",
  title, instructions: LocalizedText, durationMinutes, groupSize?, materials?,
  objectiveIds, payload   // type-specific (pairs for matching, grid for puzzle, prompts for oral …)
}[]
```

### assessments.json (Assessment Centre)
```ts
{
  questions: {
    id, type: "mcq"|"true_false"|"short_answer"|"oral"|"match",
    prompt: LocalizedText, options?: { id, text: LocalizedText, misconceptionId?: string }[],
    correctOptionId?, modelAnswer?: LocalizedText,
    explanation: LocalizedText,       // why the correct answer is correct
    difficulty: "easy"|"medium"|"hard", marks, objectiveIds: string[]
  }[],
  assessments: {
    id, kind: "oral_quiz"|"interactive_quiz"|"topic_test"|"worksheet",
    title, questionIds: string[], timeMinutes?, instructions?
  }[]
}
```
Every wrong MCQ option should link to a `misconceptionId` where possible. **This link is what lets Insights recommend a specific remedial step.**

---

## 5. Provisional topics (10)

> NCERT released new Class 6 textbooks from 2024–25 onward. The textbook names and chapter titles below are recalled from memory and are **unverified**. They are planning placeholders only.

| # | Subject | Provisional topic | Topic ID | Possible source to verify | Why chosen |
|---|---|---|---|---|---|
| 1 | Maths | Fractions | `math-fractions` | NCERT *Ganita Prakash* (Class 6) | Foundational, highly visual, common misconceptions |
| 2 | Maths | Perimeter and Area | `math-perimeter-area` | NCERT *Ganita Prakash* (Class 6) | Hands-on with string/grids, frequently confused pair |
| 3 | Science | Exploring Magnets | `sci-magnets` | NCERT *Curiosity* (Class 6) | Cheap demonstrations, strong misconceptions |
| 4 | Science | Methods of Separation | `sci-separation` | NCERT *Curiosity* (Class 6) | Uses kitchen/village materials |
| 5 | English | Nouns and their kinds | `eng-nouns` | NCERT *Poorvi* (Class 6) + CBSE grammar outcomes | Skill-based, works with any text |
| 6 | English | Reading comprehension: finding the main idea | `eng-main-idea` | CBSE learning outcomes | Core skill, original passages |
| 7 | Hindi | संज्ञा (Noun) | `hin-sangya` | NCERT *Malhar* (Class 6) + व्याकरण outcomes | Foundational grammar |
| 8 | Hindi | पर्यायवाची और विलोम शब्द | `hin-paryay-vilom` | CBSE learning outcomes | Game-friendly, oral activities |
| 9 | Social Science | Locating places on the Earth (maps, latitude/longitude) | `sst-locating-places` | NCERT *Exploring Society: India and Beyond* (Class 6) | Visual, globe/ball demonstrations |
| 10 | Social Science | Grassroots democracy — local government (Panchayat) | `sst-local-government` | NCERT *Exploring Society: India and Beyond* (Class 6) | Directly relevant to rural students |

The Hindi and English topics are *skills*, not textbook chapters, so we write original passages and examples and avoid reproducing copyrighted text.

---

## 6. Curriculum verification step (mandatory before publishing)

Each topic moves through these statuses in `meta.json`:

```
draft ──► curriculum_verified ──► pedagogy_reviewed ──► published
```

| Gate | Who | Checks | Evidence recorded |
|---|---|---|---|
| **1. Curriculum verification** | You + ideally a practising Class 6 teacher | Topic exists in the **current** NCERT Class 6 textbook / CBSE syllabus for the current academic year; chapter title and number correct; learning outcomes mapped | `curriculum.source`, `chapterRef`, `learningOutcomeRefs`, `verifiedBy`, `verifiedOn` |
| **2. Content accuracy** | Subject teacher | Facts, answers, explanations correct; Hindi grammar correct | review notes |
| **3. Pedagogy review** | Experienced teacher | Steps are practical, timed, use cheap materials; misconceptions realistic | review notes |
| **4. Publish** | You | Validation script passes; `isSample` set to `false` | `status: "published"` |

Sources to check (official only): ncert.nic.in textbooks (current editions), the CBSE academic curriculum documents on cbseacademic.nic.in for the current session, and NCERT learning-outcome documents.

**Enforcement:**
- `scripts/validate-content.ts` fails if `status` is `published` and any verification field is empty.
- The app shows a **"Sample — not yet verified"** badge on every topic whose `status` is below `published`, and the About Content screen lists each topic's verification status and source.

---

## 7. Authoring workflow

1. Copy the topic template folder.
2. Fill `meta.json` and get **Gate 1** done *before* writing the rest. If a topic doesn't exist in current books, replace it now.
3. Write preparation → misconceptions → assessments → activities → scenes (scenes last, since they visualise the misconceptions).
4. Run `validate-content`.
5. Preview in the app (sample badge visible).
6. Gates 2–3 → publish.

One fully worked topic (proposed: `sci-magnets` or `math-fractions`) is built first in Phase 2 as the **reference topic** that defines quality for the other nine.

---

## 8. Content quality checklist (per topic)

- [ ] At least 3 learning objectives, each covered by ≥ 2 questions
- [ ] Every teaching step has teacher action, student action and duration
- [ ] Every material has a low-cost alternative where relevant
- [ ] ≥ 3 misconceptions, each linked to at least one MCQ distractor
- [ ] ≥ 2 alternative methods and a remedial strategy for every objective
- [ ] ≥ 1 scene lesson with captions on every step
- [ ] ≥ 4 activities across at least 3 types
- [ ] Question bank ≥ 15 questions, mixed difficulty, each with explanation
- [ ] Assessments: 1 oral quiz, 1 interactive quiz, 1 topic test, 1 worksheet
- [ ] No copied textbook text or images
