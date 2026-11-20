/**
 * Content repository: the only way the app reads lesson content.
 *
 * On first use it checks every registered file against the zod schemas and builds
 * lookup maps. If any file is malformed, `loadContent` returns an error instead of
 * letting broken content reach a screen — screens then show an ErrorState.
 *
 * Later, downloadable content packs can be added here without changing any screen.
 */
import type { z } from 'zod';

import { rawSubjects, rawTopics, type RawTopic } from './registry';
import { SubjectsFile, TopicContent, type Subject, type SubjectId, type TopicMeta } from './schema';
import { formatIssues, validateContent } from './validate';

export type ContentStore = {
  subjects: Subject[];
  topics: TopicContent[];
  getSubject(id: string): Subject | undefined;
  getTopicsForSubject(subjectId: SubjectId): TopicMeta[];
  getTopic(id: string): TopicContent | undefined;
};

export type ContentLoadResult = { ok: true; store: ContentStore } | { ok: false; error: Error };

export class ContentError extends Error {
  name = 'ContentError';
}

function describeZodError(file: string, error: z.ZodError): string {
  return error.issues
    .slice(0, 5)
    .map((issue) => `${file} › ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
}

export function buildContentStore(subjectsInput: unknown, topicInputs: RawTopic[]): ContentStore {
  const subjectsResult = SubjectsFile.safeParse(subjectsInput);
  if (!subjectsResult.success) {
    throw new ContentError(describeZodError('subjects.json', subjectsResult.error));
  }

  const topics = topicInputs.map((input, index) => {
    const result = TopicContent.safeParse(input);
    if (!result.success) {
      const label = (input.meta as { id?: unknown } | null)?.id;
      throw new ContentError(describeZodError(typeof label === 'string' ? label : `topic #${index + 1}`, result.error));
    }
    return result.data;
  });

  const subjects = [...subjectsResult.data.subjects].sort((a, b) => a.order - b.order);
  const subjectsById = new Map(subjects.map((s) => [s.id, s]));
  const topicsById = new Map(topics.map((t) => [t.meta.id, t]));
  const topicsBySubject = new Map<SubjectId, TopicMeta[]>();
  for (const topic of topics) {
    const list = topicsBySubject.get(topic.meta.subjectId) ?? [];
    list.push(topic.meta);
    topicsBySubject.set(topic.meta.subjectId, list);
  }
  topicsBySubject.forEach((list) => list.sort((a, b) => a.order - b.order));

  if (__DEV__) {
    // Cross-reference problems are caught by the test suite; in development we also log them.
    const errors = validateContent(subjectsResult.data, topics).filter((i) => i.severity === 'error');
    if (errors.length > 0) console.warn(`[content] ${errors.length} validation error(s):\n${formatIssues(errors)}`);
  }

  return {
    subjects,
    topics,
    getSubject: (id) => subjectsById.get(id as SubjectId),
    getTopicsForSubject: (subjectId) => topicsBySubject.get(subjectId) ?? [],
    getTopic: (id) => topicsById.get(id),
  };
}

let cached: ContentLoadResult | undefined;

/** Loads and checks bundled content once, then reuses the result. Never throws. */
export function loadContent(): ContentLoadResult {
  if (!cached) {
    try {
      cached = { ok: true, store: buildContentStore(rawSubjects, rawTopics) };
    } catch (error) {
      cached = { ok: false, error: error instanceof Error ? error : new ContentError(String(error)) };
    }
  }
  return cached;
}
