/**
 * Bottom tabs (native Android tab bar). Four tabs — Android allows at most five.
 * Each tab is a folder with its own Stack, so going "back" stays inside that tab.
 */
import { NativeTabs } from 'expo-router/native-tabs';

import { Colors } from '@/constants/theme';
import { useT } from '@/i18n';

export default function TabsLayout() {
  const t = useT();

  return (
    <NativeTabs
      backgroundColor={Colors.surface}
      indicatorColor={Colors.primarySoft}
      tintColor={Colors.primary}
      iconColor={{ default: Colors.inkMuted, selected: Colors.primary }}
      labelStyle={{ default: { color: Colors.inkMuted }, selected: { color: Colors.primary } }}>
      <NativeTabs.Trigger name="(teach)">
        <NativeTabs.Trigger.Label>{t('tabs.teach')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.fill" md="menu_book" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="classes">
        <NativeTabs.Trigger.Label>{t('tabs.classes')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.3.fill" md="groups" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Label>{t('tabs.insights')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="insights" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Label>{t('tabs.more')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="ellipsis.circle.fill" md="more_horiz" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
