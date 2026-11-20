import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Text, TextField } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import {
  CLASSROOM_LIMITS,
  currentAcademicYear,
  validateClassroomInput,
  type ClassroomFieldError,
  type ClassroomInput,
} from '@/domain/classroom';
import { useT, type TranslateParams } from '@/i18n';

type FieldErrors = Partial<Record<ClassroomFieldError['field'], string>>;

export type ClassFormProps = {
  initial?: ClassroomInput;
  /** Saves the class. Throwing shows a general "could not be saved" message. */
  onSubmit: (input: ClassroomInput) => Promise<void>;
};

export function ClassForm({ initial, onSubmit }: ClassFormProps) {
  const t = useT();
  const [name, setName] = useState(initial?.name ?? '');
  const [students, setStudents] = useState(initial ? String(initial.studentCount) : '');
  const [year, setYear] = useState(initial?.academicYear ?? currentAcademicYear());
  const [school, setSchool] = useState(initial?.schoolName ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const message = (error: ClassroomFieldError): string => {
    const params: Record<string, TranslateParams> = {
      tooLong: { max: error.field === 'schoolName' ? CLASSROOM_LIMITS.schoolMax : CLASSROOM_LIMITS.nameMax },
      outOfRange: { min: CLASSROOM_LIMITS.studentsMin, max: CLASSROOM_LIMITS.studentsMax },
      format: { example: currentAcademicYear() },
    };
    switch (error.reason) {
      case 'required':
        return t('form.error.required');
      case 'tooLong':
        return t('form.error.tooLong', params.tooLong);
      case 'outOfRange':
        return t('form.error.range', params.outOfRange);
      case 'format':
        return t('form.error.yearFormat', params.format);
    }
  };

  const submit = async () => {
    // Only digits count as a number of students; "38a" or "" is invalid, not 38 or 0.
    const studentCount = /^\d+$/.test(students.trim()) ? Number(students.trim()) : Number.NaN;
    const result = validateClassroomInput({ name, studentCount, academicYear: year, schoolName: school });
    if (!result.ok) {
      setErrors(Object.fromEntries(result.errors.map((e) => [e.field, message(e)])));
      return;
    }
    setErrors({});
    setSaveFailed(false);
    setSaving(true);
    try {
      await onSubmit(result.value);
    } catch (error) {
      console.error('[classes] save failed', error);
      setSaveFailed(true);
      setSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      <TextField
        label={t('classes.form.name')}
        hint={t('classes.form.nameHint')}
        value={name}
        onChangeText={setName}
        error={errors.name}
        maxLength={CLASSROOM_LIMITS.nameMax + 5}
        autoFocus={!initial}
        testID="class-name"
      />
      <TextField
        label={t('classes.form.students')}
        value={students}
        onChangeText={(v) => setStudents(v.replace(/[^\d]/g, ''))}
        error={errors.studentCount}
        keyboardType="number-pad"
        maxLength={3}
        testID="class-students"
      />
      <TextField
        label={t('classes.form.year')}
        hint={t('classes.form.yearHint')}
        value={year}
        onChangeText={setYear}
        error={errors.academicYear}
        keyboardType="numbers-and-punctuation"
        maxLength={7}
        testID="class-year"
      />
      <TextField
        label={t('classes.form.school')}
        value={school}
        onChangeText={setSchool}
        error={errors.schoolName}
        maxLength={CLASSROOM_LIMITS.schoolMax + 5}
        testID="class-school"
      />
      {saveFailed && (
        <Text color={Colors.danger} accessibilityLiveRegion="assertive">
          {t('classes.form.saveError')}
        </Text>
      )}
      <Button label={t('classes.form.save')} icon="check" size="lg" fullWidth loading={saving} onPress={submit} testID="class-save" />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.xl,
  },
});
