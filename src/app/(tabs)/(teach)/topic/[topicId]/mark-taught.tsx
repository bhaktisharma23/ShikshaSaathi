/**
 * "Mark as taught": records which class was taught this topic, when, and whether it was
 * the first teaching or a revision. Saved in the teaching_log table.
 */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, EmptyState, Icon, LoadingState, Screen, Segmented, Text, TextField } from '@/components/ui';
import { Colors, Spacing, Touch } from '@/constants/theme';
import { loadContent, useLocalize } from '@/content';
import { classrooms, teachingLog, useDatabase, useDbQuery, type Database } from '@/db';
import { addDays, checkPastDate, todayIsoDate } from '@/domain/dates';
import { useT } from '@/i18n';

type Kind = 'taught' | 'revisited';

export default function MarkTaughtScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const t = useT();
  const L = useLocalize();
  const router = useRouter();
  const db = useDatabase();
  const content = loadContent();
  const topic = content.ok ? content.store.getTopic(topicId) : undefined;

  const loadClasses = useCallback((database: Database) => classrooms.listClassrooms(database), []);
  const classes = useDbQuery(loadClasses);

  // `undefined` = teacher hasn't chosen yet, so we default to the first class.
  const [chosenClass, setChosenClass] = useState<string | null | undefined>(undefined);
  const [date, setDate] = useState(todayIsoDate());
  const [kind, setKind] = useState<Kind>('taught');
  const [notes, setNotes] = useState('');
  const [dateError, setDateError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  if (!topic) {
    return (
      <Screen topInset={false}>
        <EmptyState icon="error" title={t('topic.notFound.title')} message={t('topic.notFound.message')} />
      </Screen>
    );
  }
  if (!classes.data) {
    return (
      <Screen topInset={false}>
        <LoadingState />
      </Screen>
    );
  }

  const classroomId = chosenClass === undefined ? (classes.data[0]?.id ?? null) : chosenClass;
  const today = todayIsoDate();
  const yesterday = addDays(today, -1);

  const chooseClass = async (id: string | null) => {
    setChosenClass(id);
    // Suggest "Revision" if this class was already taught this topic.
    setKind(id && (await teachingLog.hasBeenTaught(db, topicId, id)) ? 'revisited' : 'taught');
  };

  const save = async () => {
    const problem = checkPastDate(date);
    if (problem) {
      setDateError(problem === 'future' ? t('taught.error.future') : t('taught.error.format', { example: today }));
      return;
    }
    setDateError(undefined);
    setSaving(true);
    try {
      await teachingLog.logTeaching(db, { topicId, status: kind, classroomId, taughtOn: date.trim(), notes });
      router.back();
    } catch (error) {
      console.error('[teaching-log] save failed', error);
      setSaveFailed(true);
      setSaving(false);
    }
  };

  const classOptions: { id: string | null; label: string }[] = [
    ...classes.data.map((c) => ({ id: c.id as string | null, label: c.name })),
    { id: null, label: t('taught.noClass') },
  ];

  return (
    <>
      <Stack.Screen options={{ title: t('taught.mark') }} />
      <Screen topInset={false} testID="mark-taught">
        <Text variant="title">{L(topic.meta.title)}</Text>

        <View style={styles.group}>
          <Text variant="label">{t('taught.class')}</Text>
          <Card padded={false}>
            {classOptions.map((option, index) => {
              const selected = option.id === classroomId;
              return (
                <Pressable
                  key={option.id ?? 'none'}
                  onPress={() => void chooseClass(option.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={option.label}
                  style={({ pressed }) => [
                    styles.radioRow,
                    index > 0 && styles.divider,
                    pressed && { backgroundColor: Colors.surfaceMuted },
                  ]}
                  testID={`taught-class-${option.label}`}>
                  <Icon
                    name={selected ? 'radio_button_checked' : 'radio_button_unchecked'}
                    color={selected ? Colors.primary : Colors.inkMuted}
                  />
                  <Text variant={selected ? 'bodyStrong' : 'body'}>{option.label}</Text>
                </Pressable>
              );
            })}
          </Card>
          {classes.data.length === 0 && (
            <Text variant="caption" color={Colors.inkMuted}>
              {t('taught.noClassesHint')}
            </Text>
          )}
        </View>

        <View style={styles.group}>
          <Text variant="label">{t('taught.date')}</Text>
          <Segmented
            options={[
              { value: today, label: t('taught.today') },
              { value: yesterday, label: t('taught.yesterday') },
            ]}
            value={date === today || date === yesterday ? date : ('' as string)}
            onChange={(value) => {
              setDate(value);
              setDateError(undefined);
            }}
            accessibilityLabel={t('taught.date')}
          />
          <TextField
            label={t('taught.dateHint', { example: today })}
            value={date}
            onChangeText={setDate}
            error={dateError}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            testID="taught-date"
          />
        </View>

        <View style={styles.group}>
          <Text variant="label">{t('taught.kind')}</Text>
          <Segmented
            options={[
              { value: 'taught' as Kind, label: t('taught.kind.taught') },
              { value: 'revisited' as Kind, label: t('taught.kind.revisited') },
            ]}
            value={kind}
            onChange={setKind}
            accessibilityLabel={t('taught.kind')}
          />
        </View>

        <TextField label={t('taught.notes')} value={notes} onChangeText={setNotes} multiline maxLength={500} />

        {saveFailed && <Text color={Colors.danger}>{t('taught.error.save')}</Text>}
        <Button label={t('taught.save')} icon="event_available" size="lg" fullWidth loading={saving} onPress={save} testID="taught-save" />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: Touch.comfortable,
    paddingHorizontal: Spacing.lg,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.line,
  },
});
