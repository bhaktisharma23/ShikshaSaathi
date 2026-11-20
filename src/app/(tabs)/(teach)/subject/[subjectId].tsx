import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { EmptyState, ListRow, Screen, Section } from '@/components/ui';
import { loadContent, useLocalize } from '@/content';
import { ContentErrorScreen, subjectStyle, TopicStatusBadge } from '@/features/browse';
import { useT } from '@/i18n';

/** One subject's topics. */
export default function SubjectScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const t = useT();
  const L = useLocalize();
  const router = useRouter();
  const content = loadContent();

  if (!content.ok) return <ContentErrorScreen error={content.error} topInset={false} />;

  const subject = content.store.getSubject(subjectId);
  if (!subject) {
    return (
      <Screen topInset={false}>
        <EmptyState
          icon="error"
          title={t('subject.notFound.title')}
          message={t('subject.notFound.message')}
          action={{ label: t('common.goBack'), icon: 'arrow_back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const style = subjectStyle(subject.id);
  const topics = content.store.getTopicsForSubject(subject.id);

  return (
    <>
      <Stack.Screen options={{ title: L(subject.title) }} />
      <Screen topInset={false} testID={`subject-${subject.id}`}>
        {topics.length === 0 ? (
          <EmptyState icon={style.icon} title={t('subject.empty.title')} message={t('subject.empty.message')} />
        ) : (
          <Section>
            {topics.map((topic) => (
              <ListRow
                key={topic.id}
                icon={style.icon}
                iconColor={style.main}
                iconBackground={style.soft}
                title={L(topic.title)}
                subtitle={t('topic.duration', { minutes: topic.suggestedDurationMinutes, periods: topic.periods })}
                trailing={<TopicStatusBadge meta={topic} />}
                onPress={() => router.push({ pathname: '/topic/[topicId]', params: { topicId: topic.id } })}
                testID={`topic-row-${topic.id}`}
              />
            ))}
          </Section>
        )}
      </Screen>
    </>
  );
}
