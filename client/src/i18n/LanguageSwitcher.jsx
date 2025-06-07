import i18n from 'i18next';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
    const savedLang = localStorage.getItem('lang');
    const [language, setLanguage] = useState(savedLang || i18n.language || 'en');

    useEffect(() => {
        i18n.changeLanguage(language);
        localStorage.setItem('lang', language);
    }, [language]);

    const handleChange = (e) => {
        setLanguage(e.target.value);
    };

    return (
        <div
            className="slds-form-element"
            style={{
                position: 'fixed',    // This makes it stick on scroll
                bottom: '1rem',
                right: '1rem',
                minWidth: '100px',
                zIndex: 1000,
            }}
        >
            <label
                className="slds-form-element__label slds-assistive-text"
                htmlFor="language-select"
            >
                Language
            </label>
            <div className="slds-form-element__control">
                <div className="slds-select_container">
                    <select
                        id="language-select"
                        className="slds-select slds-text-body_small"
                        onChange={handleChange}
                        value={language}
                    >
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                        <option value="bn">বাংলা</option>
                        <option value="ta">தமிழ்</option>
                        <option value="te">తెలుగు</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
