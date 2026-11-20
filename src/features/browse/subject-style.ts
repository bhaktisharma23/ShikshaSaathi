import type { IconName } from '@/components/ui';
import type { SubjectId } from '@/content';
import { SubjectColors } from '@/constants/theme';

/** Visual identity per subject. Kept in code (not JSON) so icon names are type-checked. */
export const SUBJECT_ICONS: Record<SubjectId, IconName> = {
  maths: 'calculate',
  science: 'science',
  english: 'abc',
  hindi: 'translate',
  'social-science': 'public',
};

export function subjectStyle(id: SubjectId) {
  return { icon: SUBJECT_ICONS[id], ...SubjectColors[id] };
}
