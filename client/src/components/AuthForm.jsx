import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthForm({ onSubmit, title }) {
    const navigate = useNavigate();

    const defaultForm = {
        role: 'admin',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        storeName: '',
        address: '',
    };

    const [form, setForm] = useState(defaultForm);

    const isRegister = title === 'Register';
    const isAdmin = form.role === 'admin';

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If role changes, reset form and update role
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
        { order: 1, name: 'name', label: 'Name', type: 'text', required: true },
        { order: 2, name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+1234567890' },
        ...(isAdmin ? [
            { order: 3, name: 'storeName', label: 'Store Name', type: 'text', required: true },
            { order: 4, name: 'address', label: 'Address', type: 'textarea', rows: 2, required: true },
        ] : []),
        { order: 7, name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
    ];

    const commonFields = [
        { order: 5, name: 'email', label: 'Email', type: 'email', required: true },
        { order: 6, name: 'password', label: 'Password', type: 'password', required: true },
    ];

    const fieldsToRender = isRegister ? [...registerFields, ...commonFields] : commonFields;

    return (
        <div className="slds-grid slds-grid_vertical-align-center slds-grid_align-center slds-height_full">
            <div className="slds-box slds-theme_default slds-p-around_medium slds-size_1-of-3 slds-m-top_xx-large">
                <h2 className="slds-text-heading_medium slds-m-bottom_medium">{title}</h2>
                <form onSubmit={handleSubmit} className="slds-form slds-form_stacked">

                    {/* Only show role field in Register */}
                    {isRegister && (
                        <div className="slds-form-element slds-m-bottom_small">
                            <label className="slds-form-element__label" htmlFor="role">
                                Role <span style={{ color: 'red' }}>*</span>
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
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {fieldsToRender
                        .sort((a, b) => a.order - b.order)
                        .map((field) => {
                            if (field.type === 'textarea') {
                                return (
                                    <div key={field.name} className="slds-form-element slds-m-bottom_small">
                                        <label className="slds-form-element__label" htmlFor={field.name}>
                                            {field.label} <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <div className="slds-form-element__control">
                                            <textarea
                                                className="slds-textarea"
                                                id={field.name}
                                                name={field.name}
                                                value={form[field.name]}
                                                onChange={handleChange}
                                                rows={field.rows}
                                                required={field.required}
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            return (
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
                            );
                        })}
                    <button type="submit" className="slds-button slds-button_brand slds-button_stretch">
                        {title}
                    </button>
                </form>

                <div className="slds-text-align_center slds-m-top_medium">
                    {isRegister ? (
                        <>
                            Already have an account?{' '}
                            <button
                                className="slds-button slds-button_reset slds-text-link"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </button>
                        </>
                    ) : (
                        <>
                            Don’t have an account?{' '}
                            <button
                                className="slds-button slds-button_reset slds-text-link"
                                onClick={() => navigate('/register')}
                            >
                                Register
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
