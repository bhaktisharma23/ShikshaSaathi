import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Collapsible, EmptyState, Screen, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { loadContent, useLocalize } from '@/content';
import { countMissingHindi } from '@/content/validate';
import { notes as notesRepo, useDbQuery, type Database } from '@/db';
import type { TeacherNote } from '@/db/repositories/notes';
import { ContentErrorScreen, subjectStyle, TopicStatusBadge } from '@/features/browse';
import { SectionNotes } from '@/features/preparation/components/section-notes';
import { buildPrepareSections } from '@/features/preparation/sections';
import { useLanguage, useT } from '@/i18n';

/**
 * Teacher Preparation Centre: the full lesson plan for one topic, in collapsible sections,
 * with the teacher's own notes saved under each section.
 */
export default function PrepareScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const t = useT();
  const L = useLocalize();
  const { language } = useLanguage();
  const router = useRouter();
  const content = loadContent();
  const topic = content.ok ? content.store.getTopic(topicId) : undefined;

  const loadNotes = useCallback((db: Database) => notesRepo.listNotes(db, topicId), [topicId]);
  const notes = useDbQuery(loadNotes);
  const notesBySection = useMemo(() => {
    const map = new Map<string, TeacherNote[]>();
    for (const note of notes.data ?? []) {
      const key = note.sectionKey ?? 'overview';
      map.set(key, [...(map.get(key) ?? []), note]);
    }
    return map;
  }, [notes.data]);

  const sections = useMemo(() => (topic ? buildPrepareSections(topic, { t, L }) : []), [topic, t, L]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['overview']));
  const allOpen = sections.length > 0 && sections.every((s) => expanded.has(s.key));

  const toggle = (key: string) =>
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

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

  const style = subjectStyle(topic.meta.subjectId);

  return (
    <>
      <Stack.Screen options={{ title: t('prepare.title') }} />
      <Screen topInset={false} testID="prepare-screen">
        <View style={styles.header}>
          <TopicStatusBadge meta={topic.meta} />
          <Text variant="title">{L(topic.meta.title)}</Text>
          {language === 'hi' && countMissingHindi(topic) > 0 && (
            <Text variant="caption" color={Colors.inkMuted}>
              {t('topic.englishOnly')}
            </Text>
          )}
        </View>

        {sections.length === 0 ? (
          <EmptyState icon="edit_note" title={t('prepare.notAuthored.title')} message={t('prepare.notAuthored.message')} />
        ) : (
          <>
            <Button
              label={allOpen ? t('prepare.collapseAll') : t('prepare.expandAll')}
              icon={allOpen ? 'unfold_less' : 'unfold_more'}
              variant="ghost"
              onPress={() => setExpanded(allOpen ? new Set() : new Set(sections.map((s) => s.key)))}
              testID="toggle-all"
            />
            {sections.map((section) => {
              const sectionNotes = notesBySection.get(section.key) ?? [];
              const subtitle = [section.subtitle, sectionNotes.length > 0 && `${t('notes.title')}: ${sectionNotes.length}`]
                .filter(Boolean)
                .join(' · ');
              return (
                <Collapsible
                  key={section.key}
                  title={section.title}
                  subtitle={subtitle}
                  icon={section.icon}
                  iconColor={style.main}
                  iconBackground={style.soft}
                  expanded={expanded.has(section.key)}
                  onToggle={() => toggle(section.key)}
                  testID={`section-${section.key}`}>
                  {section.render()}
                  <SectionNotes
                    topicId={topic.meta.id}
                    sectionKey={section.key}
                    notes={sectionNotes}
                    onChanged={() => void notes.reload()}
                  />
                </Collapsible>
              );
            })}
          </>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.sm,
  },
});
