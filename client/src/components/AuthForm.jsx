import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AuthForm({ onSubmit, title }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const defaultForm = {
        role: 'admin',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    };

    const [form, setForm] = useState(defaultForm);
    const isRegister = title === 'Register';

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'role') {
            setForm({ ...defaultForm, role: value });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    const registerFields = [
        { order: 1, name: 'name', label: t('name'), type: 'text', required: true },
        {
            order: 2,
            name: 'phone',
            label: t('phoneNumber'),
            type: 'tel',
            required: true,
            placeholder: '+1234567890',
        },
        { order: 5, name: 'confirmPassword', label: t('confirmPassword'), type: 'password', required: true },
    ];

    const commonFields = [
        { order: 3, name: 'email', label: t('email'), type: 'email', required: true },
        { order: 4, name: 'password', label: t('password'), type: 'password', required: true },
    ];

    const fieldsToRender = isRegister ? [...registerFields, ...commonFields] : commonFields;

    return (
        <div className="slds-grid slds-grid_vertical-align-center slds-grid_align-center slds-height_full">
            <div className="slds-box slds-theme_default slds-p-around_medium slds-size_1-of-3 slds-m-top_xx-large">
                <h2 className="slds-text-heading_medium slds-m-bottom_medium">{t(title.toLowerCase())}</h2>
                <form onSubmit={handleSubmit} className="slds-form slds-form_stacked">

                    {isRegister && (
                        <div className="slds-form-element slds-m-bottom_small">
                            <label className="slds-form-element__label" htmlFor="role">
                                {t('role')} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <div className="slds-form-element__control">
                                <select
                                    className="slds-select"
                                    id="role"
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="admin">{t('admin')}</option>
                                    <option value="staff">{t('staff')}</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {fieldsToRender
                        .sort((a, b) => a.order - b.order)
                        .map((field) => (
                            <div key={field.name} className="slds-form-element slds-m-bottom_small">
                                <label className="slds-form-element__label" htmlFor={field.name}>
                                    {field.label} <span style={{ color: 'red' }}>*</span>
                                </label>
                                <div className="slds-form-element__control">
                                    <input
                                        className="slds-input"
                                        type={field.type}
                                        id={field.name}
                                        name={field.name}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        required={field.required}
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            </div>
                        ))}
                    <button type="submit" className="slds-button slds-button_brand slds-button_stretch">
                        {t(title.toLowerCase())}
                    </button>
                </form>

                <div className="slds-text-align_center slds-m-top_medium">
                    {isRegister ? (
                        <>
                            {t('alreadyHaveAccount')}{' '}
                            <button
                                className="slds-button slds-button_reset slds-text-link"
                                onClick={() => navigate('/login')}
                            >
                                {t('login')}
                            </button>
                        </>
                    ) : (
                        <>
                            {t('dontHaveAccount')}{' '}
                            <button
                                className="slds-button slds-button_reset slds-text-link"
                                onClick={() => navigate('/register')}
                            >
                                {t('register')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
