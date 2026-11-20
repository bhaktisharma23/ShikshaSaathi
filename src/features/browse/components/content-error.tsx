import { ErrorState, Screen } from '@/components/ui';
import { useT } from '@/i18n';

/** Shown if bundled content fails its schema check — should never reach a teacher, but never crash. */
export function ContentErrorScreen({ error, topInset = true }: { error: Error; topInset?: boolean }) {
  const t = useT();
  if (__DEV__) console.error(error);
  return (
    <Screen topInset={topInset}>
      <ErrorState title={t('content.error.title')} message={t('content.error.message')} />
    </Screen>
  );
}
