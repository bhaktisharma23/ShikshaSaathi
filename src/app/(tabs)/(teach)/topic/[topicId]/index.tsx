import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, Card, EmptyState, Icon, ListRow, Screen, Section, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { loadContent, useLocalize } from '@/content';
import { countMissingHindi } from '@/content/validate';
import { recent, useDatabase } from '@/db';
import { ContentErrorScreen, subjectStyle, TopicStatusBadge } from '@/features/browse';
import { useLanguage, useT } from '@/i18n';

/**
 * Topic Hub: everything about one topic in one place.
 * Tool rows become tappable as their screens are built (Prepare: Phase 4, Visuals: 5,
 * Activities: 6, Assess: 7). Counts shown are real counts from the content files.
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
            trailing={comingSoon}
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
