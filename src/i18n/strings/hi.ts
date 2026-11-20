import type { StringKey } from './en';

/**
 * Hindi UI strings. `Record<StringKey, string>` means TypeScript reports an error
 * if any English key is missing here.
 * Translations should be reviewed by a Hindi-speaking teacher before release.
 */
export const hi: Record<StringKey, string> = {
  'app.name': 'शिक्षासाथी',

  'tabs.teach': 'पढ़ाएँ',
  'tabs.classes': 'कक्षाएँ',
  'tabs.insights': 'जानकारी',
  'tabs.more': 'अधिक',

  'teach.greeting': 'नमस्ते',
  'teach.subtitle': 'आज आप क्या पढ़ाएँगे?',
  'teach.subjects': 'कक्षा 6 के विषय',

  'subject.topicCount.one': '1 पाठ',
  'subject.topicCount.other': '{count} पाठ',
  'subject.inPreparation': 'तैयार हो रहा है',
  'subject.empty.title': 'पाठ तैयार किए जा रहे हैं',
  'subject.empty.message':
    'इस विषय के पाठ यहाँ तब दिखेंगे जब उनकी सामग्री लिखकर पाठ्यक्रम से जाँच ली जाएगी।',
  'subject.notFound.title': 'विषय नहीं मिला',
  'subject.notFound.message': 'यह विषय ऐप में उपलब्ध नहीं है।',

  'topic.duration': '{minutes} मिनट · {periods} कालांश',
  'topic.sample': 'नमूना',
  'topic.verified': 'जाँचा गया',
  'topic.sampleNotice.title': 'नमूना सामग्री — अभी जाँची नहीं गई',
  'topic.sampleNotice.message':
    'इस पाठ की अभी वर्तमान CBSE/NCERT पाठ्यक्रम से जाँच नहीं हुई है। इसे मसौदे के रूप में उपयोग करें और पढ़ाने से पहले तथ्य जाँच लें।',
  'topic.englishOnly': 'अभी इस पाठ की सामग्री केवल अंग्रेज़ी में है।',
  'topic.objectives': 'सीखने के उद्देश्य',
  'topic.prerequisites': 'विद्यार्थियों को पहले से पता होना चाहिए',
  'topic.tools': 'शिक्षण साधन',
  'topic.tool.prepare': 'पाठ की तैयारी',
  'topic.tool.prepare.detail': '{steps} शिक्षण चरण · {materials} सामग्री',
  'topic.tool.visuals': 'चित्रों से पढ़ाएँ',
  'topic.tool.activities': 'कक्षा गतिविधियाँ',
  'topic.tool.assess': 'विद्यार्थियों का आकलन',
  'topic.tool.assess.detail': '{assessments} आकलन · {questions} प्रश्न',
  'topic.tool.notAuthored': 'इस पाठ के लिए अभी तैयार नहीं',
  'topic.notFound.title': 'पाठ नहीं मिला',
  'topic.notFound.message': 'हो सकता है यह पाठ हटा दिया गया हो या उसका नाम बदला गया हो।',

  'content.error.title': 'पाठ सामग्री लोड नहीं हो सकी',
  'content.error.message': 'कुछ पाठ सामग्री खराब है। कृपया ऐप अपडेट करें या दोबारा इंस्टॉल करें।',

  'classes.title': 'आपकी कक्षाएँ',
  'classes.empty.title': 'अभी कोई कक्षा नहीं जोड़ी गई',
  'classes.empty.message':
    'आप जो कक्षाएँ पढ़ाते हैं, जैसे “6-A”, उन्हें जोड़ें ताकि हर कक्षा के क्विज़ और टेस्ट परिणाम दर्ज कर सकें।',
  'classes.add': 'कक्षा जोड़ें',
  'classes.summary': '{students} विद्यार्थी · {year}',
  'classes.form.newTitle': 'कक्षा जोड़ें',
  'classes.form.editTitle': 'कक्षा बदलें',
  'classes.form.name': 'कक्षा का नाम',
  'classes.form.nameHint': 'जैसे 6-A या 6-नीला',
  'classes.form.students': 'विद्यार्थियों की संख्या',
  'classes.form.year': 'शैक्षणिक सत्र',
  'classes.form.yearHint': '2026-27 की तरह लिखें',
  'classes.form.school': 'विद्यालय का नाम (वैकल्पिक)',
  'classes.form.save': 'कक्षा सहेजें',
  'classes.form.saveError': 'कक्षा सहेजी नहीं जा सकी। कृपया फिर से कोशिश करें।',
  'classes.detail.students': 'विद्यार्थी',
  'classes.detail.year': 'शैक्षणिक सत्र',
  'classes.detail.school': 'विद्यालय',
  'classes.detail.history': 'आकलन इतिहास',
  'classes.detail.noHistory.title': 'अभी कोई आकलन दर्ज नहीं',
  'classes.detail.noHistory.message':
    'जब आप इस कक्षा के लिए कोई क्विज़ या टेस्ट दर्ज करेंगे, वह यहाँ दिखेगा। परिणाम दर्ज करने की सुविधा अगले अपडेट में आएगी।',
  'classes.delete': 'कक्षा हटाएँ',
  'classes.delete.title': '{name} हटाएँ?',
  'classes.delete.message': 'यह कक्षा आपकी सूची से हट जाएगी।',
  'classes.delete.messageWithResults':
    'यह कक्षा और इसके {count} दर्ज आकलन आपकी सूची और जानकारी से छिप जाएँगे।',
  'classes.notFound.title': 'कक्षा नहीं मिली',
  'classes.notFound.message': 'हो सकता है इसे हटा दिया गया हो।',

  'form.error.required': 'कृपया यह भरें।',
  'form.error.tooLong': '{max} या उससे कम अक्षर लिखें।',
  'form.error.range': '{min} से {max} तक की पूरी संख्या लिखें।',
  'form.error.yearFormat': 'सत्र {example} की तरह लिखें।',

  'db.error.title': 'सहेजा गया डेटा खुल नहीं सका',
  'db.error.message':
    'ऐप इस फ़ोन पर अपना स्टोरेज नहीं खोल सका। कृपया फिर से कोशिश करें। अगर ऐसा बार-बार हो, तो फ़ोन दोबारा चालू करें और देखें कि उसमें खाली जगह है।',

  'insights.title': 'शिक्षण जानकारी',
  'insights.empty.title': 'अभी कोई परिणाम दर्ज नहीं हुआ',
  'insights.empty.message':
    'जानकारी केवल आपके द्वारा दर्ज किए गए क्विज़ और टेस्ट परिणामों से निकाली जाती है। असली परिणाम दर्ज होने तक यहाँ कुछ नहीं दिखाया जाएगा।',

  'more.title': 'अधिक',
  'more.section.preferences': 'पसंद',
  'more.section.about': 'जानकारी',
  'more.section.developer': 'डेवलपर',
  'more.language': 'ऐप की भाषा',
  'more.languageHint': 'बटन, मेनू और संदेशों की भाषा बदलता है।',
  'more.about': 'शिक्षासाथी के बारे में',
  'more.aboutText': 'कक्षा 6 के शिक्षकों के लिए एक शिक्षण साथी। बिना इंटरनेट के काम करता है।',
  'more.version': 'संस्करण {version}',
  'more.contentNotice.title': 'पाठ सामग्री के बारे में',
  'more.contentNotice.message':
    'हर विषय प्रकाशित होने से पहले वर्तमान CBSE/NCERT कक्षा 6 पाठ्यक्रम से जाँचा जाता है। जिन विषयों की जाँच अभी नहीं हुई है, उन पर साफ़ तौर पर “नमूना” लिखा होता है।',
  'more.uiKit': 'डिज़ाइन सिस्टम पूर्वावलोकन',
  'more.uiKitHint': 'केवल डेवलपमेंट बिल्ड में दिखता है।',
  'more.dbSelfTest': 'डेटाबेस स्व-जाँच',
  'more.dbSelfTestHint': 'जाँचता है कि इस फ़ोन पर डेटा सहेजना और पढ़ना काम करता है।',
  'selfTest.run': 'जाँच चलाएँ',
  'selfTest.passed': 'सफल',
  'selfTest.failed': 'असफल',

  'teach.continue': 'जहाँ छोड़ा था वहीं से शुरू करें',

  'common.retry': 'फिर से कोशिश करें',
  'common.cancel': 'रद्द करें',
  'common.delete': 'हटाएँ',
  'common.edit': 'बदलें',
  'common.loading': 'लोड हो रहा है…',
  'common.errorTitle': 'कुछ गड़बड़ हो गई',
  'common.sample': 'नमूना',
  'common.comingSoon': 'जल्द आ रहा है',
  'common.goBack': 'वापस जाएँ',

  'language.en': 'English',
  'language.hi': 'हिन्दी',
};
