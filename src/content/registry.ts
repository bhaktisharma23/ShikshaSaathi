/**
 * Every content file the app ships with, imported statically.
 *
 * Why static imports? The Metro bundler must know at build time which files to put
 * inside the app; it cannot follow a file path built at runtime. So each new topic is
 * registered here once.
 *
 * Values are typed `unknown` on purpose: nothing may use them until the repository has
 * checked them against the schemas.
 */
import subjects from './data/subjects.json';
import sciMagnetsAssessments from './data/subjects/science/magnets/assessments.json';
import sciMagnetsMeta from './data/subjects/science/magnets/meta.json';
import sciMagnetsMisconceptions from './data/subjects/science/magnets/misconceptions.json';
import sciMagnetsPreparation from './data/subjects/science/magnets/preparation.json';

export type RawTopic = {
  meta: unknown;
  preparation?: unknown;
  misconceptions?: unknown;
  assessments?: unknown;
};

export const rawSubjects: unknown = subjects;

export const rawTopics: RawTopic[] = [
  {
    meta: sciMagnetsMeta,
    preparation: sciMagnetsPreparation,
    misconceptions: sciMagnetsMisconceptions,
    assessments: sciMagnetsAssessments,
  },
];
