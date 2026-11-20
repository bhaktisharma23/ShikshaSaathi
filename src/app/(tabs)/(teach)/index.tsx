import { EmptyState, Screen } from '@/components/ui';
import { useT } from '@/i18n';

/**
 * Teach tab home. In Phase 2 this shows the subject grid and "Continue where you left off".
 * Until real, verified content exists we show an honest empty state — no placeholder subjects.
 */
export default function TeachHomeScreen() {
  const t = useT();
  return (
    <Screen title={t('teach.greeting')} subtitle={t('teach.subtitle')} testID="teach-home">
      <EmptyState icon="auto_stories" title={t('teach.empty.title')} message={t('teach.empty.message')} />
    </Screen>
  );
}
