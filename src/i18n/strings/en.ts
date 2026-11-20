/**
 * English UI strings. This file defines the list of keys;
 * hi.ts must provide a translation for every key (TypeScript enforces it).
 *
 * Use {name} placeholders for values, e.g. 'Version {version}'.
 * These are interface strings only — lesson content lives in src/content.
 */
export const en = {
  'app.name': 'ShikshaSaathi',

  'tabs.teach': 'Teach',
  'tabs.classes': 'Classes',
  'tabs.insights': 'Insights',
  'tabs.more': 'More',

  'teach.greeting': 'Namaste',
  'teach.subtitle': 'What will you teach today?',
  'teach.empty.title': 'Lessons are being prepared',
  'teach.empty.message':
    'Class 6 topics will appear here once their content has been written and checked against the curriculum.',

  'classes.title': 'Your classes',
  'classes.empty.title': 'No classes added yet',
  'classes.empty.message':
    'You will be able to add your classes here, such as “6-A”, to record quiz and test results. This is coming in the next update.',

  'insights.title': 'Teaching insights',
  'insights.empty.title': 'No results recorded yet',
  'insights.empty.message':
    'Insights are calculated only from quiz and test results that you record. Nothing is shown until real results exist.',

  'more.title': 'More',
  'more.section.preferences': 'Preferences',
  'more.section.about': 'About',
  'more.section.developer': 'Developer',
  'more.language': 'App language',
  'more.languageHint': 'Changes the language of buttons, menus and messages.',
  'more.about': 'About ShikshaSaathi',
  'more.aboutText': 'A teaching companion for Class 6 teachers. Works without internet.',
  'more.version': 'Version {version}',
  'more.contentNotice.title': 'About the lesson content',
  'more.contentNotice.message':
    'Every topic is checked against the current CBSE/NCERT Class 6 curriculum before it is published. Topics not yet checked are clearly marked “Sample”.',
  'more.uiKit': 'Design system preview',
  'more.uiKitHint': 'Visible only in development builds.',

  'common.retry': 'Try again',
  'common.loading': 'Loading…',
  'common.errorTitle': 'Something went wrong',
  'common.sample': 'Sample',

  'language.en': 'English',
  'language.hi': 'हिन्दी',
} as const;

export type StringKey = keyof typeof en;
