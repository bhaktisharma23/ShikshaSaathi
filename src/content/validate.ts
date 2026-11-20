/**
 * Content validator: checks rules that span more than one field or file.
 * (The zod schemas only check that each file has the right *shape*.)
 *
 * Severity:
 * - error   → must be fixed; tests fail.
 * - warning → allowed while drafting, but becomes an error when a topic is "published".
 *
 * This is pure TypeScript (no React, no files), so it runs the same in Jest and in the app.
 */
import type { LocalizedText, Question, Subject, SubjectsFile, TopicContent } from './schema';

export type IssueSeverity = 'error' | 'warning';

export type ContentIssue = {
  severity: IssueSeverity;
  topicId?: string;
  /** Where the problem is, e.g. "assessments.questions[3].correctOptionId". */
  path: string;
  message: string;
};

export function validateContent(subjectsFile: SubjectsFile, topics: TopicContent[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const subjectsById = new Map<string, Subject>();

  subjectsFile.subjects.forEach((subject, index) => {
    if (subjectsById.has(subject.id)) {
      issues.push({ severity: 'error', path: `subjects[${index}].id`, message: `Duplicate subject "${subject.id}"` });
    }
    subjectsById.set(subject.id, subject);
  });

  const seenTopicIds = new Set<string>();
  for (const topic of topics) {
    if (seenTopicIds.has(topic.meta.id)) {
      issues.push({ severity: 'error', topicId: topic.meta.id, path: 'meta.id', message: 'Duplicate topic ID' });
    }
    seenTopicIds.add(topic.meta.id);
    issues.push(...validateTopic(topic, subjectsById.get(topic.meta.subjectId)));
  }
  return issues;
}

export function validateTopic(topic: TopicContent, subject: Subject | undefined): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const { meta, preparation, misconceptions = [], assessments } = topic;
  const topicId = meta.id;
  const published = meta.status === 'published';
  /** Rules that are warnings in drafts but errors once published. */
  const strict: IssueSeverity = published ? 'error' : 'warning';

  const add = (severity: IssueSeverity, path: string, message: string) =>
    issues.push({ severity, topicId, path, message });

  // --- subject & IDs ---
  if (!subject) {
    add('error', 'meta.subjectId', `Unknown subject "${meta.subjectId}"`);
  } else if (!topicId.startsWith(subject.topicIdPrefix)) {
    add('error', 'meta.id', `Topic ID must start with "${subject.topicIdPrefix}"`);
  }

  const allIds = new Set<string>();
  const registerId = (value: string, path: string) => {
    if (!value.startsWith(`${topicId}-`)) add('error', path, `ID "${value}" must start with "${topicId}-"`);
    if (allIds.has(value)) add('error', path, `Duplicate ID "${value}"`);
    allIds.add(value);
  };

  const objectiveIds = new Set<string>();
  meta.objectives.forEach((objective, i) => {
    registerId(objective.id, `meta.objectives[${i}].id`);
    objectiveIds.add(objective.id);
  });
  const misconceptionIds = new Set<string>();
  misconceptions.forEach((misconception, i) => {
    registerId(misconception.id, `misconceptions[${i}].id`);
    misconceptionIds.add(misconception.id);
  });

  const checkObjectiveRefs = (refs: string[], path: string) =>
    refs.forEach((ref, i) => {
      if (!objectiveIds.has(ref)) add('error', `${path}[${i}]`, `Unknown learning objective "${ref}"`);
    });
  const checkMisconceptionRef = (ref: string, path: string) => {
    if (!misconceptionIds.has(ref)) add('error', path, `Unknown misconception "${ref}"`);
  };

  misconceptions.forEach((m, i) => checkObjectiveRefs(m.objectiveIds, `misconceptions[${i}].objectiveIds`));

  // --- publishing gate (curriculum verification, CONTENT_STRUCTURE.md §6) ---
  if (published) {
    if (meta.isSample) add('error', 'meta.isSample', 'A published topic cannot be marked as sample');
    const c = meta.curriculum;
    if (!c.verifiedBy) add('error', 'meta.curriculum.verifiedBy', 'Published topics need "verifiedBy"');
    if (!c.verifiedOn) add('error', 'meta.curriculum.verifiedOn', 'Published topics need "verifiedOn"');
    if (!c.chapterRef.trim()) add('error', 'meta.curriculum.chapterRef', 'Published topics need "chapterRef"');
    if (c.learningOutcomeRefs.length === 0) {
      add('error', 'meta.curriculum.learningOutcomeRefs', 'Published topics need learning outcome references');
    }
    if (!preparation || !assessments || misconceptions.length === 0) {
      add('error', 'topic', 'Published topics need preparation, misconceptions and assessments');
    }
  } else if (!meta.isSample) {
    add('error', 'meta.isSample', `A "${meta.status}" topic must be marked as sample until it is published`);
  }

  // --- preparation ---
  if (preparation) {
    const orders = preparation.teachingSteps.map((s) => s.order);
    orders.forEach((order, i) => {
      if (order !== i + 1) add('error', `preparation.teachingSteps[${i}].order`, `Expected step ${i + 1}, found ${order}`);
    });
    preparation.teachingSteps.forEach((step, i) => {
      checkObjectiveRefs(step.objectiveIds, `preparation.teachingSteps[${i}].objectiveIds`);
      if (step.period > meta.periods) {
        add('error', `preparation.teachingSteps[${i}].period`, `Period ${step.period} is more than meta.periods (${meta.periods})`);
      }
    });
    preparation.misconceptionIds.forEach((ref, i) => checkMisconceptionRef(ref, `preparation.misconceptionIds[${i}]`));
    preparation.remedial.forEach((r, i) => checkObjectiveRefs([r.forObjectiveId], `preparation.remedial[${i}].forObjectiveId`));

    const planned =
      preparation.introduction.durationMinutes +
      preparation.teachingSteps.reduce((sum, step) => sum + step.durationMinutes, 0);
    if (Math.abs(planned - meta.suggestedDurationMinutes) > meta.suggestedDurationMinutes * 0.1) {
      add(
        'warning',
        'preparation.teachingSteps',
        `Steps add up to ${planned} min but suggestedDurationMinutes is ${meta.suggestedDurationMinutes}`,
      );
    }

    const remediated = new Set(preparation.remedial.map((r) => r.forObjectiveId));
    meta.objectives.forEach((objective) => {
      if (!remediated.has(objective.id)) add(strict, 'preparation.remedial', `No remedial strategy for "${objective.id}"`);
    });
  }

  // --- assessments ---
  if (assessments) {
    const questionIds = new Set<string>();
    const coverage = new Map<string, number>();
    const linkedMisconceptions = new Set<string>();

    assessments.questions.forEach((question, qi) => {
      const path = `assessments.questions[${qi}]`;
      registerId(question.id, `${path}.id`);
      questionIds.add(question.id);
      checkObjectiveRefs(question.objectiveIds, `${path}.objectiveIds`);
      question.objectiveIds.forEach((o) => coverage.set(o, (coverage.get(o) ?? 0) + 1));
      validateChoiceQuestion(question, path, add, checkMisconceptionRef, linkedMisconceptions);
    });

    assessments.assessments.forEach((assessment, ai) => {
      const path = `assessments.assessments[${ai}]`;
      registerId(assessment.id, `${path}.id`);
      const seen = new Set<string>();
      assessment.questionIds.forEach((ref, i) => {
        if (!questionIds.has(ref)) add('error', `${path}.questionIds[${i}]`, `Unknown question "${ref}"`);
        if (seen.has(ref)) add('error', `${path}.questionIds[${i}]`, `Question "${ref}" listed twice`);
        seen.add(ref);
      });
    });

    meta.objectives.forEach((objective) => {
      const count = coverage.get(objective.id) ?? 0;
      if (count < 2) add(strict, 'assessments.questions', `Objective "${objective.id}" is tested by ${count} question(s); need at least 2`);
    });
    misconceptions.forEach((m) => {
      if (!linkedMisconceptions.has(m.id)) {
        add(strict, 'assessments.questions', `Misconception "${m.id}" is not linked to any wrong answer option`);
      }
    });
  }

  // --- Hindi translations ---
  const missingHindi = countMissingHindi(topic);
  if (missingHindi > 0) {
    add(strict, 'topic', `${missingHindi} text field(s) have no Hindi translation yet`);
  }

  return issues;
}

function validateChoiceQuestion(
  question: Question,
  path: string,
  add: (severity: IssueSeverity, path: string, message: string) => void,
  checkMisconceptionRef: (ref: string, path: string) => void,
  linkedMisconceptions: Set<string>,
) {
  if (question.type !== 'mcq' && question.type !== 'true_false') return;

  if (question.type === 'true_false' && question.options.length !== 2) {
    add('error', `${path}.options`, 'True/false questions need exactly 2 options');
  }
  const optionIds = new Set<string>();
  question.options.forEach((option, oi) => {
    const optionPath = `${path}.options[${oi}]`;
    if (!option.id.startsWith(`${question.id}-`)) add('error', `${optionPath}.id`, `Option ID must start with "${question.id}-"`);
    if (optionIds.has(option.id)) add('error', `${optionPath}.id`, `Duplicate option "${option.id}"`);
    optionIds.add(option.id);
    if (option.misconceptionId) {
      checkMisconceptionRef(option.misconceptionId, `${optionPath}.misconceptionId`);
      linkedMisconceptions.add(option.misconceptionId);
      if (option.id === question.correctOptionId) {
        add('error', `${optionPath}.misconceptionId`, 'The correct option cannot be linked to a misconception');
      }
    }
  });
  if (!optionIds.has(question.correctOptionId)) {
    add('error', `${path}.correctOptionId`, `"${question.correctOptionId}" is not one of the options`);
  }
}

/** Counts every LocalizedText ({ en, hi? }) in the topic that has no Hindi. */
export function countMissingHindi(value: unknown): number {
  if (Array.isArray(value)) return value.reduce((sum: number, item) => sum + countMissingHindi(item), 0);
  if (value && typeof value === 'object') {
    if (isLocalizedText(value)) return value.hi ? 0 : 1;
    return Object.values(value).reduce((sum: number, item) => sum + countMissingHindi(item), 0);
  }
  return 0;
}

function isLocalizedText(value: object): value is LocalizedText {
  return 'en' in value && typeof (value as { en: unknown }).en === 'string';
}

export function formatIssues(issues: ContentIssue[]): string {
  return issues
    .map((i) => `[${i.severity.toUpperCase()}] ${i.topicId ? `${i.topicId} › ` : ''}${i.path}: ${i.message}`)
    .join('\n');
}
