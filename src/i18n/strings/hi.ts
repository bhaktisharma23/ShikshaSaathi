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
    'यहाँ आप अपनी कक्षाएँ, जैसे “6-A”, जोड़ सकेंगे ताकि क्विज़ और टेस्ट के परिणाम दर्ज कर सकें। यह सुविधा अगले अपडेट में आएगी।',

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

  'common.retry': 'फिर से कोशिश करें',
  'common.loading': 'लोड हो रहा है…',
  'common.errorTitle': 'कुछ गड़बड़ हो गई',
  'common.sample': 'नमूना',
  'common.comingSoon': 'जल्द आ रहा है',
  'common.goBack': 'वापस जाएँ',

  'language.en': 'English',
  'language.hi': 'हिन्दी',
};
