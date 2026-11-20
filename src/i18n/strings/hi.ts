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
  'teach.empty.title': 'पाठ तैयार किए जा रहे हैं',
  'teach.empty.message':
    'कक्षा 6 के विषय यहाँ तब दिखेंगे जब उनकी सामग्री लिखकर पाठ्यक्रम से जाँच ली जाएगी।',

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

  'language.en': 'English',
  'language.hi': 'हिन्दी',
};
