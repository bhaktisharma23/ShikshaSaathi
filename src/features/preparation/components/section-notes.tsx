/**
 * "My notes" inside one section of the lesson plan, e.g. a reminder under Materials:
 * "Borrow 3 magnets from Class 8 lab". Notes are saved on the phone (teacher_notes table).
 */
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, IconButton, Icon, Text, TextField } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { notes as notesRepo, useDatabase, type Database } from '@/db';
import type { TeacherNote } from '@/db/repositories/notes';
import { useT } from '@/i18n';

type Mode = { kind: 'idle' } | { kind: 'new' } | { kind: 'edit'; id: string };

export type SectionNotesProps = {
  topicId: string;
  sectionKey: string;
  notes: TeacherNote[];
  /** Called after any change so the parent reloads notes. */
  onChanged: () => void;
};

export function SectionNotes({ topicId, sectionKey, notes, onChanged }: SectionNotesProps) {
  const t = useT();
  const db = useDatabase();
  const [mode, setMode] = useState<Mode>({ kind: 'idle' });
  const [draft, setDraft] = useState('');
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setDraft('');
    setFailed(false);
    setMode({ kind: 'new' });
  };
  const startEdit = (note: TeacherNote) => {
    setDraft(note.body);
    setFailed(false);
    setMode({ kind: 'edit', id: note.id });
  };
  const cancel = () => setMode({ kind: 'idle' });

  const save = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await persist(db, mode, topicId, sectionKey, draft);
      setMode({ kind: 'idle' });
      onChanged();
    } catch (error) {
      console.error('[notes] save failed', error);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (note: TeacherNote) =>
    Alert.alert(t('notes.delete.title'), note.body.slice(0, 120), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await notesRepo.deleteNote(db, note.id);
          onChanged();
        },
      },
    ]);

  return (
    <View style={styles.wrap} testID={`notes-${sectionKey}`}>
      {notes.length > 0 && (
        <View style={styles.titleRow}>
          <Icon name="sticky_note_2" size={18} color={Colors.info} />
          <Text variant="caption" weight="semibold" color={Colors.info}>
            {t('notes.title')}
          </Text>
        </View>
      )}

      {notes.map((note) =>
        mode.kind === 'edit' && mode.id === note.id ? null : (
          <View key={note.id} style={styles.note}>
            <Text style={styles.flex}>{note.body}</Text>
            <IconButton icon="edit" accessibilityLabel={t('notes.edit')} onPress={() => startEdit(note)} />
            <IconButton icon="delete" accessibilityLabel={t('notes.delete')} onPress={() => confirmDelete(note)} />
          </View>
        ),
      )}

      {mode.kind === 'idle' ? (
        <Button label={t('notes.add')} icon="add" variant="ghost" onPress={startNew} testID={`add-note-${sectionKey}`} />
      ) : (
        <View style={styles.editor}>
          <TextField
            label={t('notes.label')}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={notesRepo.NOTE_MAX_LENGTH}
            error={failed ? t('notes.error') : undefined}
            autoFocus
            testID={`note-input-${sectionKey}`}
          />
          <View style={styles.actions}>
            <Button
              label={t('notes.save')}
              icon="check"
              onPress={save}
              loading={saving}
              disabled={!draft.trim()}
              testID={`save-note-${sectionKey}`}
            />
            <Button label={t('common.cancel')} variant="ghost" onPress={cancel} />
          </View>
        </View>
      )}
    </View>
  );
}

async function persist(db: Database, mode: Mode, topicId: string, sectionKey: string, body: string) {
  if (mode.kind === 'edit') await notesRepo.updateNote(db, mode.id, body);
  else await notesRepo.addNote(db, topicId, body, sectionKey);
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.line,
    paddingTop: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.infoSoft,
    borderRadius: Radius.md,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.xs,
  },
  flex: {
    flex: 1,
  },
  editor: {
    gap: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
