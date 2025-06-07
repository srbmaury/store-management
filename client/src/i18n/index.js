import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './en/translation.json';
import hiTranslation from './hi/translation.json';
import bnTranslation from './bn/translation.json';
import taTranslation from './ta/translation.json';
import teTranslation from './te/translation.json';

i18n
    .use(initReactI18next) // connects with React
    .init({
        resources: {
            en: { translation: enTranslation },
            hi: { translation: hiTranslation },
            bn: { translation: bnTranslation },
            ta: { translation: taTranslation },
            te: { translation: teTranslation },
        },
        lng: 'en', // default language
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    });

export default i18n;
