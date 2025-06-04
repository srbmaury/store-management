import { useContext } from 'react';
import AuthForm from '../../components/AuthForm';
import { AuthContext } from '../../context/AuthContext';
import API from '../../utils/api';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

export default function LoginPage() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (form) => {
        try {
            const { data } = await API.post('/auth/login', form);
            login(data);
            data.role === 'admin' ? navigate('/dashboard') : navigate('/storeListing');
            toast.success('Login successful! Welcome back 😊');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <>
            <AuthForm onSubmit={handleLogin} title="Login" />
        </>
    );
}

