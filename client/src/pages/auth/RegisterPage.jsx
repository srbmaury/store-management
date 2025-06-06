import { useContext } from 'react';
import AuthForm from '../../components/AuthForm';
import { AuthContext } from '../../context/AuthContext';
import API from '../../utils/api';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

export default function RegisterPage() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRegister = async (form) => {
        try {
            const { data } = await API.post('/auth/register', form);
            login(data);
            data.role === 'admin' ? navigate('/myStores') : navigate('/storeListing');
            toast.success('Registration successful! Welcome 😊');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <>
            <AuthForm onSubmit={handleRegister} title="Register" />
        </>
    );
}
