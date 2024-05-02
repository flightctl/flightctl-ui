import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    lng: 'en',
    ns: 'translation',
    resources: {
      en: {
        // eslint-disable-next-line
        translation: require('../../i18n/locales/en/translation.json'),
      },
    },
  });
