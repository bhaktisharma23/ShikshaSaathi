import { StyleSheet, View } from 'react-native';

import { Card, Icon, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useLocalize, type Subject } from '@/content';
import { useT } from '@/i18n';

import { subjectStyle } from '../subject-style';

export type SubjectCardProps = {
  subject: Subject;
  topicCount: number;
  onPress: () => void;
};

export function SubjectCard({ subject, topicCount, onPress }: SubjectCardProps) {
  const t = useT();
  const L = useLocalize();
  const style = subjectStyle(subject.id);
  const countLabel =
    topicCount === 0
      ? t('subject.inPreparation')
      : topicCount === 1
        ? t('subject.topicCount.one')
        : t('subject.topicCount.other', { count: topicCount });

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${L(subject.title)}. ${countLabel}`}
      style={styles.card}
      testID={`subject-card-${subject.id}`}>
      <View style={[styles.iconWrap, { backgroundColor: style.soft }]}>
        <Icon name={style.icon} size={30} color={style.main} />
      </View>
      <Text variant="heading" numberOfLines={2}>
        {L(subject.title)}
      </Text>
      <Text variant="caption" color={topicCount === 0 ? Colors.inkMuted : style.main} weight="semibold">
        {countLabel}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
    minHeight: 150,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
});
