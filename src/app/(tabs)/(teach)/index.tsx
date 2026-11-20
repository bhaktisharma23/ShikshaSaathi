import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { loadContent } from '@/content';
import { ContentErrorScreen, SubjectCard } from '@/features/browse';
import { useT } from '@/i18n';

/** Teach tab home: tap a subject (1) → tap a topic (2). */
export default function TeachHomeScreen() {
  const t = useT();
  const router = useRouter();
  const content = loadContent();

  if (!content.ok) return <ContentErrorScreen error={content.error} />;
  const { store } = content;

  return (
    <Screen title={t('teach.greeting')} subtitle={t('teach.subtitle')} testID="teach-home">
      <Text variant="caption" weight="semibold" color={Colors.inkMuted} style={styles.heading} accessibilityRole="header">
        {t('teach.subjects')}
      </Text>
      <View style={styles.grid}>
        {store.subjects.map((subject) => (
          <View key={subject.id} style={styles.cell}>
            <SubjectCard
              subject={subject}
              topicCount={store.getTopicsForSubject(subject.id).length}
              onPress={() => router.push({ pathname: '/subject/[subjectId]', params: { subjectId: subject.id } })}
            />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.xs,
    marginBottom: -Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  cell: {
    flexGrow: 1,
    flexBasis: '45%',
  },
});
