import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { ListRow, Screen, Section, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { loadContent, useLocalize, type TopicMeta } from '@/content';
import { bookmarks, recent, useDbQuery, type Database } from '@/db';
import { ContentErrorScreen, subjectStyle, SubjectCard, TopicStatusBadge } from '@/features/browse';
import { useT } from '@/i18n';

/**
 * Teach tab home.
 * - "Continue where you left off": recently opened topics — reachable in 1 tap.
 * - Subjects: tap a subject (1) → tap a topic (2).
 */
export default function TeachHomeScreen() {
  const t = useT();
  const L = useLocalize();
  const router = useRouter();
  const content = loadContent();
  const loadTeacherLists = useCallback(
    async (db: Database) => ({
      recent: (await recent.listRecent(db, 'topic', 3)).map((r) => r.targetId),
      saved: await bookmarks.listBookmarks(db, 'topic'),
    }),
    [],
  );
  const teacherLists = useDbQuery(loadTeacherLists);

  if (!content.ok) return <ContentErrorScreen error={content.error} />;
  const { store } = content;

  const openTopic = (topicId: string) => router.push({ pathname: '/topic/[topicId]', params: { topicId } });
  // Skip any remembered topic that no longer exists in the content (e.g. removed in an update).
  const toMetas = (ids: string[]) =>
    ids.flatMap((id) => {
      const topic = store.getTopic(id);
      return topic ? [topic.meta] : [];
    });
  const continueItems = toMetas(teacherLists.data?.recent ?? []);
  const savedItems = toMetas(teacherLists.data?.saved ?? []);

  const topicRow = (meta: TopicMeta, testPrefix: string) => {
    const style = subjectStyle(meta.subjectId);
    return (
      <ListRow
        key={meta.id}
        icon={style.icon}
        iconColor={style.main}
        iconBackground={style.soft}
        title={L(meta.title)}
        subtitle={L(store.getSubject(meta.subjectId)!.title)}
        trailing={<TopicStatusBadge meta={meta} />}
        onPress={() => openTopic(meta.id)}
        testID={`${testPrefix}-${meta.id}`}
      />
    );
  };

  return (
    <Screen title={t('teach.greeting')} subtitle={t('teach.subtitle')} testID="teach-home">
      {continueItems.length > 0 && (
        <Section title={t('teach.continue')}>{continueItems.map((meta) => topicRow(meta, 'continue'))}</Section>
      )}
      {savedItems.length > 0 && (
        <Section title={t('teach.saved')}>{savedItems.map((meta) => topicRow(meta, 'saved'))}</Section>
      )}

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
