import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Spinner from '../utils/Spinner';

export default function MyStoresPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const { t } = useTranslation();

    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const { data } = await API.get('/stores/my-stores');
                setStores(data.stores);
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Failed to load stores');
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    const handleCreateStore = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/stores', { name, address });
            setStores((prev) => [...prev, data]);
            setCreating(false);
            setName('');
            setAddress('');
            toast.success('Store created successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create store.');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="slds-p-around_medium" style={{ maxWidth: 1200, margin: 'auto' }}>
            <div className="slds-grid slds-grid_align-spread slds-m-bottom_medium">
                <h1 className="slds-text-heading_large">{t('myStores')}</h1>
                <div>
                    <span className="slds-m-right_small slds-text-body_regular">
                        {t('welcome', { name: user?.name || 'User' })}
                    </span>
                    <button
                        className="slds-button slds-button_destructive"
                        onClick={handleLogout}
                    >
                        {t('logout')}
                    </button>
                </div>
            </div>

            <button
                className="slds-button slds-button_neutral slds-m-bottom_medium"
                onClick={() => setCreating((prev) => !prev)}
            >
                {creating ? t('cancel') : t('createStore')}
            </button>

            {creating && (
                <form onSubmit={handleCreateStore} className="slds-box slds-theme_default slds-m-bottom_medium">
                    <div className="slds-form-element slds-m-bottom_small">
                        <label className="slds-form-element__label" htmlFor="storeName">{t('storeName')}</label>
                        <div className="slds-form-element__control">
                            <input
                                type="text"
                                id="storeName"
                                className="slds-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="slds-form-element slds-m-bottom_small">
                        <label className="slds-form-element__label" htmlFor="address">{t('address')}</label>
                        <div className="slds-form-element__control">
                            <input
                                type="text"
                                id="address"
                                className="slds-input"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button className="slds-button slds-button_brand" type="submit">
                        {t('submit')}
                    </button>
                </form>
            )}

            {loading ? (
                <Spinner text={t('loadingMyStores')} />
            ) : stores.length === 0 ? (
                <p>{t('noStores')}</p>
            ) : (
                <div className="slds-grid slds-wrap slds-gutters">
                    {stores.map((store) => (
                        <div
                            key={store._id}
                            className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/dashboard/${store._id}`)}
                        >
                            <div className="slds-box slds-theme_shade slds-m-bottom_medium">
                                <h2 className="slds-text-heading_small">{t('storeNameLabel', { name: store.name })}</h2>
                                <p className="slds-text-body_regular">{t('storeAddressLabel', { address: store.address })}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
