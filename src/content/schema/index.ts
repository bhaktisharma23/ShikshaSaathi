/**
 * Content schemas — the single source of truth for what a lesson file must look like.
 *
 * Why zod? JSON files have no types. zod checks the *shape* of every file when the app
 * loads it (and in tests), and `z.infer` turns each schema into a TypeScript type, so
 * the UI code is type-checked against exactly the same rules. One definition, two uses.
 *
 * `strictObject` rejects unknown keys, so a typo like "objectivs" is an error instead of
 * silently-missing content.
 *
 * Cross-file rules (e.g. "every objectiveId must exist") live in ../validate.ts.
 * Scene (Phase 5) and activity (Phase 6) schemas are added in their phases.
 */
/* eslint-disable @typescript-eslint/no-redeclare --
 * Intentional zod pattern: each schema (a value) and the type inferred from it share one name,
 * e.g. `TopicMeta.parse(x)` returns a `TopicMeta`. TypeScript keeps values and types separate. */
import { z } from 'zod';

// ---------- shared ----------

const nonEmpty = z.string().trim().min(1);

/** Text in English (required) and Hindi (optional while drafting, see CONTENT_STRUCTURE.md). */
export const LocalizedText = z.strictObject({
  en: nonEmpty,
  hi: nonEmpty.optional(),
});
export type LocalizedText = z.infer<typeof LocalizedText>;

const id = (pattern: RegExp, example: string) =>
  z.string().regex(pattern, { message: `ID must look like "${example}"` });

export const SubjectId = z.enum(['maths', 'science', 'english', 'hindi', 'social-science']);
export type SubjectId = z.infer<typeof SubjectId>;

export const Difficulty = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof Difficulty>;

// ---------- subjects.json ----------

export const Subject = z.strictObject({
  id: SubjectId,
  order: z.number().int().positive(),
  title: LocalizedText,
  /** Every topic ID in this subject must start with this, e.g. "sci-". */
  topicIdPrefix: id(/^[a-z]+-$/, 'sci-'),
});
export type Subject = z.infer<typeof Subject>;

export const SubjectsFile = z.strictObject({
  grade: z.literal(6),
  subjects: z.array(Subject).min(1),
});
export type SubjectsFile = z.infer<typeof SubjectsFile>;

// ---------- meta.json ----------

export const ContentStatus = z.enum(['draft', 'curriculum_verified', 'pedagogy_reviewed', 'published']);
export type ContentStatus = z.infer<typeof ContentStatus>;

export const LearningObjective = z.strictObject({
  id: id(/^[a-z]+-[a-z0-9-]+-lo\d+$/, 'sci-magnets-lo1'),
  text: LocalizedText,
  bloomLevel: z.enum(['remember', 'understand', 'apply', 'analyse', 'evaluate', 'create']),
});
export type LearningObjective = z.infer<typeof LearningObjective>;

export const CurriculumInfo = z.strictObject({
  framework: z.literal('CBSE'),
  /** Official book/document, with edition year. Must be confirmed before publishing. */
  source: nonEmpty,
  chapterRef: z.string(),
  learningOutcomeRefs: z.array(nonEmpty),
  verifiedBy: nonEmpty.optional(),
  verifiedOn: z.iso.date().optional(),
  notes: z.string().optional(),
});
export type CurriculumInfo = z.infer<typeof CurriculumInfo>;

export const TopicMeta = z.strictObject({
  id: id(/^[a-z]+-[a-z0-9-]+$/, 'sci-magnets'),
  subjectId: SubjectId,
  grade: z.literal(6),
  order: z.number().int().positive(),
  title: LocalizedText,
  summary: LocalizedText,
  contentVersion: z.string().regex(/^\d+\.\d+\.\d+$/, { message: 'Use a version like "0.1.0"' }),
  status: ContentStatus,
  /** True while the topic has not passed every verification gate. Shown as a "Sample" badge. */
  isSample: z.boolean(),
  curriculum: CurriculumInfo,
  objectives: z.array(LearningObjective).min(1),
  prerequisites: z.array(LocalizedText),
  suggestedDurationMinutes: z.number().int().positive(),
  periods: z.number().int().positive(),
});
export type TopicMeta = z.infer<typeof TopicMeta>;

// ---------- misconceptions.json ----------

export const Misconception = z.strictObject({
  id: id(/^[a-z]+-[a-z0-9-]+-mc\d+$/, 'sci-magnets-mc1'),
  statement: LocalizedText,
  whyStudentsThinkThis: LocalizedText,
  howToSpot: LocalizedText,
  howToCorrect: LocalizedText,
  objectiveIds: z.array(nonEmpty).min(1),
});
export type Misconception = z.infer<typeof Misconception>;

export const MisconceptionsFile = z.array(Misconception);

// ---------- preparation.json ----------

export const Material = z.strictObject({
  name: LocalizedText,
  quantity: z.string().optional(),
  lowCostAlternative: LocalizedText.optional(),
});
export type Material = z.infer<typeof Material>;

export const TeachingStep = z.strictObject({
  order: z.number().int().positive(),
  period: z.number().int().positive(),
  title: LocalizedText,
  durationMinutes: z.number().int().positive(),
  teacherDoes: LocalizedText,
  studentsDo: LocalizedText,
  /** Sample words the teacher can say. */
  sayThis: LocalizedText.optional(),
  /** What to write or draw on the blackboard. */
  boardWork: LocalizedText.optional(),
  checkForUnderstanding: LocalizedText.optional(),
  objectiveIds: z.array(nonEmpty).min(1),
});
export type TeachingStep = z.infer<typeof TeachingStep>;

export const Demonstration = z.strictObject({
  title: LocalizedText,
  materials: z.array(LocalizedText).min(1),
  steps: z.array(LocalizedText).min(1),
  whatHappens: LocalizedText,
  safetyNote: LocalizedText.optional(),
});
export type Demonstration = z.infer<typeof Demonstration>;

export const ClassQuestion = z.strictObject({
  text: LocalizedText,
  level: z.enum(['recall', 'understand', 'apply', 'think']),
  expectedAnswer: LocalizedText.optional(),
});
export type ClassQuestion = z.infer<typeof ClassQuestion>;

export const AlternativeMethod = z.strictObject({
  title: LocalizedText,
  whenToUse: LocalizedText,
  description: LocalizedText,
});
export type AlternativeMethod = z.infer<typeof AlternativeMethod>;

export const RemedialStrategy = z.strictObject({
  forObjectiveId: nonEmpty,
  strategy: LocalizedText,
  quickActivity: LocalizedText.optional(),
});
export type RemedialStrategy = z.infer<typeof RemedialStrategy>;

export const Preparation = z.strictObject({
  overview: LocalizedText,
  materials: z.array(Material).min(1),
  introduction: z.strictObject({
    hook: LocalizedText,
    script: LocalizedText,
    durationMinutes: z.number().int().positive(),
  }),
  teachingSteps: z.array(TeachingStep).min(1),
  realLifeExamples: z.array(LocalizedText).min(1),
  demonstrations: z.array(Demonstration),
  questionsToAsk: z.array(ClassQuestion).min(1),
  misconceptionIds: z.array(nonEmpty),
  alternativeMethods: z.array(AlternativeMethod),
  remedial: z.array(RemedialStrategy),
  safetyNotes: z.array(LocalizedText),
});
export type Preparation = z.infer<typeof Preparation>;

// ---------- assessments.json ----------

export const QuestionOption = z.strictObject({
  id: nonEmpty,
  text: LocalizedText,
  /** For wrong options: which misconception this answer reveals. Powers remedial suggestions. */
  misconceptionId: nonEmpty.optional(),
});
export type QuestionOption = z.infer<typeof QuestionOption>;

const questionBase = {
  id: id(/^[a-z]+-[a-z0-9-]+-q\d{2}$/, 'sci-magnets-q01'),
  prompt: LocalizedText,
  /** Why the correct answer is correct — shown in answer keys. */
  explanation: LocalizedText,
  difficulty: Difficulty,
  marks: z.number().positive(),
  objectiveIds: z.array(nonEmpty).min(1),
};

export const ChoiceQuestion = z.strictObject({
  ...questionBase,
  type: z.enum(['mcq', 'true_false']),
  options: z.array(QuestionOption).min(2),
  correctOptionId: nonEmpty,
});

export const OpenQuestion = z.strictObject({
  ...questionBase,
  type: z.enum(['short_answer', 'oral']),
  /** What a good answer contains; the teacher marks against this. */
  modelAnswer: LocalizedText,
});

export const Question = z.union([ChoiceQuestion, OpenQuestion]);
export type Question = z.infer<typeof Question>;
export type ChoiceQuestion = z.infer<typeof ChoiceQuestion>;
export type OpenQuestion = z.infer<typeof OpenQuestion>;

export const AssessmentKind = z.enum(['oral_quiz', 'interactive_quiz', 'topic_test', 'worksheet']);
export type AssessmentKind = z.infer<typeof AssessmentKind>;

export const Assessment = z.strictObject({
  id: id(/^[a-z]+-[a-z0-9-]+-as\d+$/, 'sci-magnets-as1'),
  kind: AssessmentKind,
  title: LocalizedText,
  instructions: LocalizedText.optional(),
  timeMinutes: z.number().int().positive().optional(),
  questionIds: z.array(nonEmpty).min(1),
});
export type Assessment = z.infer<typeof Assessment>;

export const AssessmentsFile = z.strictObject({
  questions: z.array(Question).min(1),
  assessments: z.array(Assessment).min(1),
});
export type AssessmentsFile = z.infer<typeof AssessmentsFile>;

// ---------- a whole topic ----------

/** Everything about one topic. Optional parts are authored in later phases. */
export const TopicContent = z.strictObject({
  meta: TopicMeta,
  preparation: Preparation.optional(),
  misconceptions: MisconceptionsFile.optional(),
  assessments: AssessmentsFile.optional(),
});
export type TopicContent = z.infer<typeof TopicContent>;
