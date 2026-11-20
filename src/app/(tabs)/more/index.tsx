import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, ListRow, Screen, Section, Segmented, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { LANGUAGES, useLanguage, useT, type Language } from '@/i18n';

export default function MoreScreen() {
  const t = useT();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const version = Constants.expoConfig?.version ?? '—';

  const languageOptions = LANGUAGES.map((value: Language) => ({ value, label: t(`language.${value}`) }));

  return (
    <Screen title={t('more.title')} testID="more-home">
      <View style={styles.group}>
        <Text variant="caption" weight="semibold" color={Colors.inkMuted} style={styles.groupTitle} accessibilityRole="header">
          {t('more.section.preferences')}
        </Text>
        <Card>
          <View style={styles.cardBody}>
            <Text variant="bodyStrong">{t('more.language')}</Text>
            <Text variant="caption" color={Colors.inkMuted}>
              {t('more.languageHint')}
            </Text>
            <Segmented
              options={languageOptions}
              value={language}
              onChange={setLanguage}
              accessibilityLabel={t('more.language')}
            />
          </View>
        </Card>
      </View>

      <Section title={t('more.section.about')}>
        <ListRow icon="school" title={t('more.about')} subtitle={`${t('more.aboutText')}\n${t('more.version', { version })}`} />
        <ListRow icon="verified" title={t('more.contentNotice.title')} subtitle={t('more.contentNotice.message')} />
      </Section>

      {__DEV__ && (
        <Section title={t('more.section.developer')}>
          <ListRow
            icon="palette"
            iconColor={Colors.accentInk}
            iconBackground={Colors.accentSoft}
            title={t('more.uiKit')}
            subtitle={t('more.uiKitHint')}
            onPress={() => router.push('/more/ui-kit')}
            testID="open-ui-kit"
          />
          <ListRow
            icon="database"
            iconColor={Colors.accentInk}
            iconBackground={Colors.accentSoft}
            title={t('more.dbSelfTest')}
            subtitle={t('more.dbSelfTestHint')}
            onPress={() => router.push('/more/db-self-test')}
            testID="open-db-self-test"
          />
        </Section>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.sm,
  },
  groupTitle: {
    paddingHorizontal: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    gap: Spacing.sm,
  },
});
