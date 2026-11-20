import { EmptyState, Screen } from '@/components/ui';
import { useT } from '@/i18n';

/** Classes tab. Adding and managing classes arrives in Phase 3 (needs the database). */
export default function ClassesScreen() {
  const t = useT();
  return (
    <Screen title={t('classes.title')} testID="classes-home">
      <EmptyState icon="groups" title={t('classes.empty.title')} message={t('classes.empty.message')} />
    </Screen>
  );
}
