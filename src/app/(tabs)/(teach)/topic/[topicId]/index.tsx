import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Badge, Button, Card, EmptyState, Icon, IconButton, ListRow, Screen, Section, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { loadContent, useLocalize } from '@/content';
import { countMissingHindi } from '@/content/validate';
import { bookmarks, recent, teachingLog, useDatabase, useDbQuery, type Database } from '@/db';
import type { TeachingLogEntry } from '@/db/repositories/teaching-log';
import { formatDisplayDate } from '@/domain/dates';
import { ContentErrorScreen, subjectStyle, TopicStatusBadge } from '@/features/browse';
import { useLanguage, useT } from '@/i18n';

/**
 * Topic Hub: everything about one topic in one place.
 * Tool rows become tappable as their screens are built (Prepare: done; Visuals: Phase 5,
 * Activities: 6, Assess: 7). Counts shown are real counts from the content files.
 * Also: Mark as taught, Save (bookmark), and the teaching record for this topic.
 */
export default function TopicHubScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const t = useT();
  const L = useLocalize();
  const { language } = useLanguage();
  const router = useRouter();
  const db = useDatabase();
  const content = loadContent();
  const topic = content.ok ? content.store.getTopic(topicId) : undefined;
  const exists = topic !== undefined;

  // Remember this topic for "Continue where you left off" on Home.
  useEffect(() => {
    if (!exists) return;
    recent.recordOpened(db, 'topic', topicId).catch((e) => console.warn('[recent] not saved', e));
  }, [db, topicId, exists]);

  // Teacher's own data for this topic; reloads when returning from "Mark as taught".
  const loadTeacherData = useCallback(
    async (database: Database) => ({
      bookmarked: await bookmarks.isBookmarked(database, 'topic', topicId),
      log: await teachingLog.listTeachingLog(database, topicId),
    }),
    [topicId],
  );
  const teacherData = useDbQuery(loadTeacherData);

  if (!content.ok) return <ContentErrorScreen error={content.error} topInset={false} />;

  if (!topic) {
    return (
      <Screen topInset={false}>
        <EmptyState
          icon="error"
          title={t('topic.notFound.title')}
          message={t('topic.notFound.message')}
          action={{ label: t('common.goBack'), icon: 'arrow_back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const { meta, preparation, assessments } = topic;
  const style = subjectStyle(meta.subjectId);
  const isSample = meta.isSample || meta.status !== 'published';
  const showEnglishOnly = language === 'hi' && countMissingHindi(topic) > 0;
  const comingSoon = <Badge label={t('common.comingSoon')} />;
  const bookmarked = teacherData.data?.bookmarked ?? false;
  const log = teacherData.data?.log ?? [];
  const statusLabel = { taught: t('taught.status.taught'), revisited: t('taught.status.revisited'), planned: t('taught.status.planned') };

  const toggleBookmark = async () => {
    await bookmarks.toggleBookmark(db, 'topic', meta.id);
    await teacherData.reload();
  };

  const confirmDeleteLog = (entry: TeachingLogEntry) =>
    Alert.alert(t('taught.delete.title'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await teachingLog.deleteTeachingLog(db, entry.id);
          await teacherData.reload();
        },
      },
    ]);

  return (
    <>
      <Stack.Screen options={{ title: L(meta.title) }} />
      <Screen topInset={false} testID={`topic-${meta.id}`}>
        <View style={styles.header}>
          <TopicStatusBadge meta={meta} />
          <Text variant="title">{L(meta.title)}</Text>
          <View style={styles.durationRow}>
            <Icon name="schedule" size={18} color={Colors.inkMuted} />
            <Text variant="caption" color={Colors.inkMuted}>
              {t('topic.duration', { minutes: meta.suggestedDurationMinutes, periods: meta.periods })}
            </Text>
          </View>
          <Text>{L(meta.summary)}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            label={t('taught.mark')}
            icon="event_available"
            onPress={() => router.push({ pathname: '/topic/[topicId]/mark-taught', params: { topicId: meta.id } })}
            testID="mark-taught-button"
          />
          <Button
            label={bookmarked ? t('bookmark.remove') : t('bookmark.add')}
            icon={bookmarked ? 'bookmark_added' : 'bookmark_border'}
            variant="secondary"
            onPress={toggleBookmark}
            testID="bookmark-button"
          />
        </View>

        {isSample && (
          <Card style={styles.notice} testID="sample-notice">
            <View style={styles.noticeRow}>
              <Icon name="warning" color={Colors.accentInk} />
              <View style={styles.noticeText}>
                <Text variant="bodyStrong" color={Colors.accentInk}>
                  {t('topic.sampleNotice.title')}
                </Text>
                <Text variant="caption" color={Colors.ink}>
                  {t('topic.sampleNotice.message')}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {showEnglishOnly && (
          <Text variant="caption" color={Colors.inkMuted}>
            {t('topic.englishOnly')}
          </Text>
        )}

        <Section title={t('topic.tools')}>
          <ListRow
            icon="edit_note"
            iconColor={style.main}
            iconBackground={style.soft}
            title={t('topic.tool.prepare')}
            subtitle={
              preparation
                ? t('topic.tool.prepare.detail', {
                    steps: preparation.teachingSteps.length,
                    materials: preparation.materials.length,
                  })
                : t('topic.tool.notAuthored')
            }
            onPress={() => router.push({ pathname: '/topic/[topicId]/prepare', params: { topicId: meta.id } })}
            testID="open-prepare"
          />
          <ListRow
            icon="slideshow"
            iconColor={style.main}
            iconBackground={style.soft}
            title={t('topic.tool.visuals')}
            subtitle={t('topic.tool.notAuthored')}
            trailing={comingSoon}
          />
          <ListRow
            icon="groups"
            iconColor={style.main}
            iconBackground={style.soft}
            title={t('topic.tool.activities')}
            subtitle={t('topic.tool.notAuthored')}
            trailing={comingSoon}
          />
          <ListRow
            icon="quiz"
            iconColor={style.main}
            iconBackground={style.soft}
            title={t('topic.tool.assess')}
            subtitle={
              assessments
                ? t('topic.tool.assess.detail', {
                    assessments: assessments.assessments.length,
                    questions: assessments.questions.length,
                  })
                : t('topic.tool.notAuthored')
            }
            trailing={comingSoon}
          />
        </Section>

        <Section title={t('taught.history')}>
          {log.length === 0 ? (
            <View style={styles.listItem}>
              <Text color={Colors.inkMuted}>{t('taught.none')}</Text>
            </View>
          ) : (
            log.map((entry) => (
              <ListRow
                key={entry.id}
                icon={entry.status === 'revisited' ? 'replay' : 'event_available'}
                title={entry.classroomName ?? t('taught.general')}
                subtitle={[
                  statusLabel[entry.status],
                  entry.taughtOn ? formatDisplayDate(entry.taughtOn, language) : null,
                  entry.notes,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                trailing={
                  <IconButton icon="delete" accessibilityLabel={t('taught.delete')} onPress={() => confirmDeleteLog(entry)} />
                }
                testID="teaching-log-entry"
              />
            ))
          )}
        </Section>

        <Section title={t('topic.objectives')}>
          {meta.objectives.map((objective, index) => (
            <View key={objective.id} style={styles.listItem}>
              <Text variant="bodyStrong" color={style.main} style={styles.number}>
                {index + 1}
              </Text>
              <Text style={styles.flex}>{L(objective.text)}</Text>
            </View>
          ))}
        </Section>

        {meta.prerequisites.length > 0 && (
          <Section title={t('topic.prerequisites')}>
            {meta.prerequisites.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Icon name="task_alt" size={20} color={Colors.success} />
                <Text style={styles.flex}>{L(item)}</Text>
              </View>
            ))}
          </Section>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  notice: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
  },
  noticeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  noticeText: {
    flex: 1,
    gap: Spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'flex-start',
  },
  number: {
    minWidth: 20,
  },
  flex: {
    flex: 1,
  },
});
