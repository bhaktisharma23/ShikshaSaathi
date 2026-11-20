import { Badge } from '@/components/ui';
import type { TopicMeta } from '@/content';
import { useT } from '@/i18n';

/** "Sample" for anything not yet published (verification pending), "Verified" once published. */
export function TopicStatusBadge({ meta }: { meta: TopicMeta }) {
  const t = useT();
  return meta.isSample || meta.status !== 'published' ? (
    <Badge label={t('topic.sample')} tone="accent" icon="info" />
  ) : (
    <Badge label={t('topic.verified')} tone="success" icon="check_circle" />
  );
}
