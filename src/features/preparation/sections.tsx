/**
 * The lesson-plan sections, defined once as data: key, title, icon, and how to render.
 * The screen just loops over this list — adding or reordering a section happens here only.
 * `key` is also stored with teacher notes (teacher_notes.section_key), so never rename a key.
 */
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, Text, type IconName } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { ClassQuestion, LocalizedText, TopicContent } from '@/content';
import type { StringKey, TranslateParams } from '@/i18n';

import { BoardBox, BulletList, ItemCard, LabeledText, NumberedList, SayThis } from './components/blocks';

export type PrepareSectionKey =
  | 'overview'
  | 'materials'
  | 'introduction'
  | 'steps'
  | 'examples'
  | 'demonstrations'
  | 'questions'
  | 'misconceptions'
  | 'alternatives'
  | 'remedial'
  | 'safety';

export type PrepareSection = {
  key: PrepareSectionKey;
  title: string;
  icon: IconName;
  subtitle?: string;
  render: () => ReactNode;
};

type Helpers = {
  t: (key: StringKey, params?: TranslateParams) => string;
  L: (text: LocalizedText) => string;
};

const LEVEL_KEYS: Record<ClassQuestion['level'], StringKey> = {
  recall: 'prepare.level.recall',
  understand: 'prepare.level.understand',
  apply: 'prepare.level.apply',
  think: 'prepare.level.think',
};

/** Builds the sections that have content for this topic. Empty sections are left out. */
export function buildPrepareSections(topic: TopicContent, { t, L }: Helpers): PrepareSection[] {
  const { meta, preparation: p, misconceptions = [] } = topic;
  if (!p) return [];

  const objectiveNumber = (id: string) => meta.objectives.findIndex((o) => o.id === id) + 1;
  const misconceptionsById = new Map(misconceptions.map((m) => [m.id, m]));
  const totalMinutes = p.introduction.durationMinutes + p.teachingSteps.reduce((s, x) => s + x.durationMinutes, 0);
  const periods = [...new Set(p.teachingSteps.map((s) => s.period))].sort((a, b) => a - b);
  const count = (n: number) => t('prepare.count', { count: n });

  const sections: (PrepareSection | false)[] = [
    {
      key: 'overview',
      title: t('prepare.section.overview'),
      icon: 'menu_book',
      subtitle: t('topic.duration', { minutes: meta.suggestedDurationMinutes, periods: meta.periods }),
      render: () => <Text>{L(p.overview)}</Text>,
    },
    {
      key: 'materials',
      title: t('prepare.section.materials'),
      icon: 'inventory_2',
      subtitle: count(p.materials.length),
      render: () =>
        p.materials.map((m, i) => (
          <ItemCard key={i}>
            <Text variant="bodyStrong">{L(m.name)}</Text>
            {m.quantity ? (
              <Text variant="caption" color={Colors.inkMuted}>
                {t('prepare.quantity', { quantity: m.quantity })}
              </Text>
            ) : null}
            {m.lowCostAlternative ? (
              <LabeledText label={t('prepare.lowCost')} icon="lightbulb">
                {L(m.lowCostAlternative)}
              </LabeledText>
            ) : null}
          </ItemCard>
        )),
    },
    {
      key: 'introduction',
      title: t('prepare.section.introduction'),
      icon: 'campaign',
      subtitle: t('prepare.minutes', { minutes: p.introduction.durationMinutes }),
      render: () => (
        <>
          <LabeledText label={t('prepare.hook')} icon="lightbulb">
            {L(p.introduction.hook)}
          </LabeledText>
          <Text>{L(p.introduction.script)}</Text>
        </>
      ),
    },
    {
      key: 'steps',
      title: t('prepare.section.steps'),
      icon: 'format_list_numbered',
      subtitle: t('prepare.stepsSummary', { count: p.teachingSteps.length, minutes: totalMinutes }),
      render: () =>
        periods.map((period) => (
          <View key={period} style={styles.period}>
            <Text variant="heading" accessibilityRole="header">
              {t('prepare.period', { n: period })}
            </Text>
            {p.teachingSteps
              .filter((s) => s.period === period)
              .map((step) => (
                <ItemCard key={step.order} testID={`step-${step.order}`}>
                  <View style={styles.stepHeader}>
                    <Text variant="bodyStrong" style={styles.flex}>
                      {step.order}. {L(step.title)}
                    </Text>
                    <Badge label={t('prepare.minutes', { minutes: step.durationMinutes })} icon="timer" />
                  </View>
                  <LabeledText label={t('prepare.teacherDoes')} icon="co_present">
                    {L(step.teacherDoes)}
                  </LabeledText>
                  <LabeledText label={t('prepare.studentsDo')} icon="groups">
                    {L(step.studentsDo)}
                  </LabeledText>
                  {step.sayThis ? <SayThis label={t('prepare.sayThis')}>{L(step.sayThis)}</SayThis> : null}
                  {step.boardWork ? <BoardBox label={t('prepare.boardWork')}>{L(step.boardWork)}</BoardBox> : null}
                  {step.checkForUnderstanding ? (
                    <LabeledText label={t('prepare.check')} icon="help">
                      {L(step.checkForUnderstanding)}
                    </LabeledText>
                  ) : null}
                </ItemCard>
              ))}
          </View>
        )),
    },
    p.realLifeExamples.length > 0 && {
      key: 'examples',
      title: t('prepare.section.examples'),
      icon: 'public',
      subtitle: count(p.realLifeExamples.length),
      render: () => <BulletList items={p.realLifeExamples.map(L)} />,
    },
    p.demonstrations.length > 0 && {
      key: 'demonstrations',
      title: t('prepare.section.demonstrations'),
      icon: 'science',
      subtitle: count(p.demonstrations.length),
      render: () =>
        p.demonstrations.map((d, i) => (
          <ItemCard key={i}>
            <Text variant="bodyStrong">{L(d.title)}</Text>
            <LabeledText label={t('prepare.youNeed')} icon="inventory_2">
              {d.materials.map(L).join(', ')}
            </LabeledText>
            <NumberedList items={d.steps.map(L)} />
            <LabeledText label={t('prepare.whatHappens')} icon="visibility">
              {L(d.whatHappens)}
            </LabeledText>
            {d.safetyNote ? (
              <LabeledText label={t('prepare.section.safety')} icon="health_and_safety">
                {L(d.safetyNote)}
              </LabeledText>
            ) : null}
          </ItemCard>
        )),
    },
    {
      key: 'questions',
      title: t('prepare.section.questions'),
      icon: 'help',
      subtitle: count(p.questionsToAsk.length),
      render: () =>
        p.questionsToAsk.map((q, i) => (
          <ItemCard key={i}>
            <Badge label={t(LEVEL_KEYS[q.level])} tone="info" />
            <Text variant="bodyStrong">{L(q.text)}</Text>
            {q.expectedAnswer ? (
              <LabeledText label={t('prepare.expectedAnswer')} icon="check_circle">
                {L(q.expectedAnswer)}
              </LabeledText>
            ) : null}
          </ItemCard>
        )),
    },
    p.misconceptionIds.length > 0 && {
      key: 'misconceptions',
      title: t('prepare.section.misconceptions'),
      icon: 'psychology',
      subtitle: count(p.misconceptionIds.length),
      render: () =>
        p.misconceptionIds.flatMap((id) => {
          const m = misconceptionsById.get(id);
          if (!m) return [];
          return [
            <ItemCard key={id}>
              <Text variant="bodyStrong">{L(m.statement)}</Text>
              <LabeledText label={t('prepare.why')}>{L(m.whyStudentsThinkThis)}</LabeledText>
              <LabeledText label={t('prepare.spot')} icon="visibility">
                {L(m.howToSpot)}
              </LabeledText>
              <LabeledText label={t('prepare.correct')} icon="check_circle">
                {L(m.howToCorrect)}
              </LabeledText>
            </ItemCard>,
          ];
        }),
    },
    p.alternativeMethods.length > 0 && {
      key: 'alternatives',
      title: t('prepare.section.alternatives'),
      icon: 'alt_route',
      subtitle: count(p.alternativeMethods.length),
      render: () =>
        p.alternativeMethods.map((a, i) => (
          <ItemCard key={i}>
            <Text variant="bodyStrong">{L(a.title)}</Text>
            <LabeledText label={t('prepare.whenToUse')}>{L(a.whenToUse)}</LabeledText>
            <Text>{L(a.description)}</Text>
          </ItemCard>
        )),
    },
    p.remedial.length > 0 && {
      key: 'remedial',
      title: t('prepare.section.remedial'),
      icon: 'healing',
      subtitle: count(p.remedial.length),
      render: () =>
        p.remedial.map((r, i) => {
          const objective = meta.objectives.find((o) => o.id === r.forObjectiveId);
          return (
            <ItemCard key={i}>
              <Badge label={t('prepare.forObjective', { n: objectiveNumber(r.forObjectiveId) })} tone="primary" />
              {objective ? (
                <Text variant="caption" color={Colors.inkMuted}>
                  {L(objective.text)}
                </Text>
              ) : null}
              <Text>{L(r.strategy)}</Text>
              {r.quickActivity ? (
                <LabeledText label={t('prepare.quickActivity')} icon="lightbulb">
                  {L(r.quickActivity)}
                </LabeledText>
              ) : null}
            </ItemCard>
          );
        }),
    },
    p.safetyNotes.length > 0 && {
      key: 'safety',
      title: t('prepare.section.safety'),
      icon: 'health_and_safety',
      subtitle: count(p.safetyNotes.length),
      render: () => <BulletList items={p.safetyNotes.map(L)} />,
    },
  ];

  return sections.filter((s): s is PrepareSection => s !== false);
}

const styles = StyleSheet.create({
  period: {
    gap: Spacing.md,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
