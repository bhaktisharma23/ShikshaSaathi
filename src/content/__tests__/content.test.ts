/**
 * Content validation — run with `npm run validate-content` (also part of `npm test`).
 *
 * 1. The real bundled content must load and have zero validation errors.
 * 2. Deliberately broken copies must be caught, proving the validator works.
 */
import { buildContentStore, formatIssues, validateContent, type TopicContent } from '@/content';
import { rawSubjects, rawTopics } from '@/content/registry';
import { SubjectsFile, TopicContent as TopicSchema } from '@/content/schema';
import { countMissingHindi } from '@/content/validate';

const subjectsFile = SubjectsFile.parse(rawSubjects);
const realTopics = rawTopics.map((t) => TopicSchema.parse(t));
const magnets = realTopics.find((t) => t.meta.id === 'sci-magnets')!;

/** Deep copy so each test can break its own version safely. */
const copy = (topic: TopicContent): TopicContent => JSON.parse(JSON.stringify(topic));
const errorsFor = (topic: TopicContent) =>
  validateContent(subjectsFile, [topic]).filter((issue) => issue.severity === 'error');

describe('bundled content', () => {
  it('passes schema checks and loads into the store', () => {
    const store = buildContentStore(rawSubjects, rawTopics);
    expect(store.subjects.map((s) => s.id)).toEqual(['maths', 'science', 'english', 'hindi', 'social-science']);
    expect(store.getTopicsForSubject('science').map((t) => t.id)).toContain('sci-magnets');
    expect(store.getTopic('does-not-exist')).toBeUndefined();
  });

  it('has no validation errors', () => {
    const errors = validateContent(subjectsFile, realTopics).filter((i) => i.severity === 'error');
    if (errors.length > 0) throw new Error(`\n${formatIssues(errors)}`);
  });

  it('prints remaining draft warnings (informational)', () => {
    const warnings = validateContent(subjectsFile, realTopics).filter((i) => i.severity === 'warning');
    // Not a failure: drafts may have warnings (e.g. missing Hindi). They become errors on publish.
    if (warnings.length > 0) console.info(`Draft warnings:\n${formatIssues(warnings)}`);
    expect(Array.isArray(warnings)).toBe(true);
  });

  it('marks every unpublished topic as sample', () => {
    for (const topic of realTopics) {
      if (topic.meta.status !== 'published') expect(topic.meta.isSample).toBe(true);
    }
  });
});

describe('validator catches broken content', () => {
  it('unknown learning objective in a question', () => {
    const broken = copy(magnets);
    broken.assessments!.questions[0].objectiveIds = ['sci-magnets-lo99'];
    expect(formatIssues(errorsFor(broken))).toMatch(/Unknown learning objective "sci-magnets-lo99"/);
  });

  it('correct answer that is not one of the options', () => {
    const broken = copy(magnets);
    const question = broken.assessments!.questions.find((q) => q.type === 'mcq')!;
    if (question.type === 'mcq' || question.type === 'true_false') question.correctOptionId = 'nope';
    expect(formatIssues(errorsFor(broken))).toMatch(/"nope" is not one of the options/);
  });

  it('correct option linked to a misconception', () => {
    const broken = copy(magnets);
    const question = broken.assessments!.questions[0];
    if (question.type === 'mcq' || question.type === 'true_false') {
      question.options.find((o) => o.id === question.correctOptionId)!.misconceptionId = 'sci-magnets-mc1';
    }
    expect(formatIssues(errorsFor(broken))).toMatch(/correct option cannot be linked/);
  });

  it('duplicate IDs', () => {
    const broken = copy(magnets);
    broken.assessments!.questions[1].id = broken.assessments!.questions[0].id;
    expect(formatIssues(errorsFor(broken))).toMatch(/Duplicate ID "sci-magnets-q01"/);
  });

  it('assessment pointing at a missing question', () => {
    const broken = copy(magnets);
    broken.assessments!.assessments[0].questionIds.push('sci-magnets-q99');
    expect(formatIssues(errorsFor(broken))).toMatch(/Unknown question "sci-magnets-q99"/);
  });

  it('topic ID with the wrong subject prefix', () => {
    const broken = copy(magnets);
    broken.meta.id = 'math-magnets';
    expect(formatIssues(errorsFor(broken))).toMatch(/must start with "sci-"/);
  });

  it('publishing without curriculum verification', () => {
    const broken = copy(magnets);
    broken.meta.status = 'published';
    broken.meta.isSample = false;
    const text = formatIssues(errorsFor(broken));
    expect(text).toMatch(/verifiedBy/);
    expect(text).toMatch(/verifiedOn/);
    expect(text).toMatch(/chapterRef/);
    // Draft warnings such as missing Hindi become errors once published.
    expect(text).toMatch(/no Hindi translation/);
  });

  it('draft topic not marked as sample', () => {
    const broken = copy(magnets);
    broken.meta.isSample = false;
    expect(formatIssues(errorsFor(broken))).toMatch(/must be marked as sample/);
  });

  it('schema rejects a misspelled key', () => {
    const raw = JSON.parse(JSON.stringify(rawTopics[0]));
    raw.meta.objectivs = raw.meta.objectives;
    expect(() => buildContentStore(rawSubjects, [raw])).toThrow(/objectivs/);
  });
});

describe('countMissingHindi()', () => {
  it('counts LocalizedText objects without Hindi', () => {
    expect(countMissingHindi({ a: { en: 'x' }, b: [{ en: 'y', hi: 'य' }, { en: 'z' }] })).toBe(2);
  });
});
