import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ca from './locales/ca.json';
import es from './locales/es.json';
import en from './locales/en.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ca: { translation: ca },
            es: { translation: es },
            en: { translation: en },
        },
        fallbackLng: 'ca',
        lng: localStorage.getItem('i18nextLng') || 'ca',
        interpolation: {
            escapeValue: false, // React already safe from XSS
        }
    });

// Make sure any change is saved to localStorage
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('i18nextLng', lng);
});

export default i18n;
