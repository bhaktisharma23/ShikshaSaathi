import { EmptyState, Screen } from '@/components/ui';
import { useT } from '@/i18n';

/**
 * Insights tab. This empty state is permanent behaviour, not a placeholder:
 * with no recorded results, there is nothing truthful to show.
 */
export default function InsightsScreen() {
  const t = useT();
  return (
    <Screen title={t('insights.title')} testID="insights-home">
      <EmptyState icon="bar_chart" title={t('insights.empty.title')} message={t('insights.empty.message')} />
    </Screen>
  );
}
