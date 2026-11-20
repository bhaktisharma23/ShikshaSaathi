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
  'teach.subjects': 'Class 6 subjects',

  'subject.topicCount.one': '1 topic',
  'subject.topicCount.other': '{count} topics',
  'subject.inPreparation': 'In preparation',
  'subject.empty.title': 'Topics are being prepared',
  'subject.empty.message':
    'Topics for this subject will appear here after their content is written and checked against the curriculum.',
  'subject.notFound.title': 'Subject not found',
  'subject.notFound.message': 'This subject is not available in the app.',

  'topic.duration': '{minutes} min · {periods} periods',
  'topic.sample': 'Sample',
  'topic.verified': 'Verified',
  'topic.sampleNotice.title': 'Sample content — not yet verified',
  'topic.sampleNotice.message':
    'This topic has not yet been checked against the current CBSE/NCERT curriculum. Use it as a draft and check facts before teaching.',
  'topic.englishOnly': 'Lesson content for this topic is in English only for now.',
  'topic.objectives': 'Learning objectives',
  'topic.prerequisites': 'Students should already know',
  'topic.tools': 'Teaching tools',
  'topic.tool.prepare': 'Prepare the lesson',
  'topic.tool.prepare.detail': '{steps} teaching steps · {materials} materials',
  'topic.tool.visuals': 'Teach visually',
  'topic.tool.activities': 'Classroom activities',
  'topic.tool.assess': 'Assess students',
  'topic.tool.assess.detail': '{assessments} assessments · {questions} questions',
  'topic.tool.notAuthored': 'Not written yet for this topic',
  'topic.notFound.title': 'Topic not found',
  'topic.notFound.message': 'This topic may have been removed or renamed.',

  'content.error.title': 'Lesson content could not be loaded',
  'content.error.message': 'Some lesson content is damaged. Please update or reinstall the app.',

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
  'common.comingSoon': 'Coming soon',
  'common.goBack': 'Go back',

  'language.en': 'English',
  'language.hi': 'हिन्दी',
} as const;

export type StringKey = keyof typeof en;
