import '@testing-library/jest-dom';
import { vi } from 'vitest';
import translations from '../i18n/en/translation.json';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options = {}) => {
            let value = translations[key] || key;

            if (typeof value === 'string') {
                value = value.replace(/{{(.*?)}}/g, (_, k) => options?.[k.trim()] ?? '');
            }
            if (key === 'welcome') {
                return `Welcome, ${options?.name || 'User'}!`;
            }
            return value;
        },
        i18n: {
            changeLanguage: () => new Promise(() => { }),
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: () => { },
    },
}));
