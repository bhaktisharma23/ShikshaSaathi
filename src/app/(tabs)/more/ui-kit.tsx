/**
 * Developer-only page that shows every UI component, so we can check the design
 * on a real phone (font sizes, Hindi rendering, touch targets) in one place.
 * In release builds this route redirects away and its link is hidden.
 */
import { Redirect, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  ListRow,
  LoadingState,
  Screen,
  Section,
  Segmented,
  Stepper,
  Text,
} from '@/components/ui';
import { Colors, Radius, Spacing, SubjectColors, Typography, type TypographyVariant } from '@/constants/theme';
import { useT } from '@/i18n';

const VARIANTS = Object.keys(Typography) as TypographyVariant[];

export default function UiKitScreen() {
  const t = useT();
  const [segment, setSegment] = useState<'a' | 'b' | 'c'>('a');
  const [count, setCount] = useState(3);
  const [lastPressed, setLastPressed] = useState('—');

  if (!__DEV__) {
    return <Redirect href="/more" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: t('more.uiKit') }} />
      <Screen topInset={false}>
        <Heading>Typography</Heading>
        <Card>
          <View style={styles.stack}>
            {VARIANTS.map((variant) => (
              <Text key={variant} variant={variant}>
                {variant} · भिन्न और क्षेत्रफल
              </Text>
            ))}
            <Text color={Colors.inkMuted}>Muted text — secondary information</Text>
          </View>
        </Card>

        <Heading>Buttons</Heading>
        <Text variant="caption" color={Colors.inkMuted}>
          Last pressed: {lastPressed}
        </Text>
        <View style={styles.stack}>
          <Button label="Start class" icon="play_arrow" size="lg" onPress={() => setLastPressed('primary lg')} />
          <Button label="Secondary" variant="secondary" onPress={() => setLastPressed('secondary')} />
          <Button label="Ghost" variant="ghost" onPress={() => setLastPressed('ghost')} />
          <Button label="Delete" variant="danger" icon="delete" onPress={() => setLastPressed('danger')} />
          <Button label="Disabled" disabled onPress={() => setLastPressed('disabled')} />
          <Button label="Saving" loading onPress={() => setLastPressed('loading')} />
          <Button label="कक्षा शुरू करें" fullWidth onPress={() => setLastPressed('hindi full width')} />
          <View style={styles.row}>
            <IconButton icon="replay" accessibilityLabel="Replay" onPress={() => setLastPressed('icon plain')} />
            <IconButton icon="play_arrow" variant="filled" accessibilityLabel="Play" onPress={() => setLastPressed('icon filled')} />
            <IconButton icon="pause" disabled accessibilityLabel="Pause" onPress={() => setLastPressed('icon disabled')} />
          </View>
        </View>

        <Heading>Badges</Heading>
        <View style={styles.wrap}>
          <Badge label="Sample" tone="accent" icon="info" />
          <Badge label="Verified" tone="success" icon="check_circle" />
          <Badge label="Neutral" />
          <Badge label="Primary" tone="primary" />
          <Badge label="Danger" tone="danger" />
          <Badge label="नमूना" tone="info" />
        </View>

        <Heading>Subject colours</Heading>
        <View style={styles.wrap}>
          {Object.entries(SubjectColors).map(([key, color]) => (
            <View key={key} style={[styles.swatch, { backgroundColor: color.soft }]}>
              <Text variant="caption" weight="semibold" color={color.main}>
                {key}
              </Text>
            </View>
          ))}
        </View>

        <Heading>List section</Heading>
        <Section title="Section title">
          <ListRow icon="calculate" title="Mathematics" subtitle="Tappable row" onPress={() => setLastPressed('row')} />
          <ListRow icon="science" title="Science" trailing={<Badge label="Sample" tone="accent" />} />
          <ListRow icon="translate" title="हिन्दी" subtitle="बिना onPress वाली पंक्ति" />
        </Section>

        <Heading>Segmented control</Heading>
        <Segmented
          options={[
            { value: 'a', label: 'Tally' },
            { value: 'b', label: 'Roll grid' },
            { value: 'c', label: 'Device' },
          ]}
          value={segment}
          onChange={setSegment}
        />

        <Heading>Stepper</Heading>
        <Card>
          <Stepper label="Answered correctly" value={count} min={0} max={10} onChange={setCount} />
        </Card>

        <Heading>States</Heading>
        <Card>
          <EmptyState
            icon="inbox"
            title="Empty state"
            message="Explains why nothing is here and what to do next."
            action={{ label: 'Action', icon: 'add', onPress: () => setLastPressed('empty action') }}
          />
        </Card>
        <Card>
          <ErrorState message="Shown when something fails, with a retry button." onRetry={() => setLastPressed('retry')} />
        </Card>
        <Card>
          <LoadingState />
        </Card>
      </Screen>
    </>
  );
}

function Heading({ children }: { children: string }) {
  return (
    <Text variant="heading" accessibilityRole="header" style={styles.heading}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: Spacing.sm,
  },
  stack: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
});
