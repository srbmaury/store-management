import { useEffect, useState, useContext } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../utils/Spinner';
import { useTranslation } from 'react-i18next';

export default function StoreListingPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    const { logout, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [storesRes, requestsRes] = await Promise.all([
                    API.get('/stores'),
                    API.get('/join-requests/my-requests'),
                ]);

                const stores = storesRes.data;
                const requests = requestsRes.data;

                // Map storeId (NOT storeOwnerId) to request status
                const requestMap = {};
                requests.forEach(req => {
                    // Assuming join request object has a 'storeId' field
                    const storeId = typeof req.storeId === 'object' ? req.storeId._id : req.storeId;
                    requestMap[storeId] = req.status;
                });

                // Combine store with request status
                const enrichedStores = stores.map(store => ({
                    ...store,
                    status: requestMap[store._id] || 'none',
                }));
                setStores(enrichedStores);
            } catch (err) {
                toast.error(err ? 'Failed to load stores or requests' : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const joinStore = async (storeId) => {
        try {
            // Call your backend API to join the store
            const res = await API.post('/staff/join', { storeId });
            toast.success(res.data.message || 'Successfully joined the store');

            // Update local stores state: change status to 'joined'
            setStores(prevStores =>
                prevStores.map(store =>
                    store._id === storeId ? { ...store, status: 'joined' } : store
                )
            );

            // Update user context with the storeId assigned
            updateUser({ storeId });

            navigate(`/sales/${storeId}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to join store');
        }
    };

    const sendJoinRequest = async (storeId) => {
        try {
            const res = await API.post('/join-requests', { storeId });
            toast.success(res.data.message || 'Request sent successfully');

            // Update local stores state to show "pending" immediately
            setStores(prevStores =>
                prevStores.map(store =>
                    store._id === storeId ? { ...store, status: 'pending' } : store
                )
            );
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to send request');
        }
    };

    return (
        <div className="slds-p-around_large">
            {loading && <Spinner text={t('loadingStores')} />}
            <button className="slds-button slds-button_destructive" onClick={handleLogout}>
                {t('logout')}
            </button>
            <h2 className="slds-text-heading_medium">{t('availableStores')}</h2>
            {stores.length === 0 ? (
                <p>{t('noStores')}</p>
            ) : (
                <ul className="slds-list_vertical slds-has-dividers_top">
                    {stores.map(store => (
                        <div key={store._id} className="slds-box slds-m-around_medium slds-p-around_medium">
                            <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
                                <div>
                                    <h2 className="slds-text-heading_small">{store.name}</h2>
                                    <p className="slds-text-body_small">{t('owner')}: {store.owner.name}</p>
                                    <p className="slds-text-body_small slds-text-color_weak">{t('address')}: {store.address}</p>
                                </div>

                                <div>
                                    {store.status === 'none' ? (
                                        <button
                                            className="slds-button slds-button_neutral"
                                            onClick={() => sendJoinRequest(store._id)}
                                        >
                                            {t('requestToJoin')}
                                        </button>
                                    ) : (
                                        <>
                                            {store.status === 'pending' && (
                                                <span className="slds-badge slds-theme_warning">{t('pending')}</span>
                                            )}
                                            {store.status === 'approved' && (
                                                <>
                                                    <span className="slds-badge slds-theme_success">{t('approved')}</span>
                                                    <button
                                                        className="slds-button slds-button_brand slds-m-horizontal_medium"
                                                        onClick={() => joinStore(store._id)}
                                                    >
                                                        {t('joinStore')}
                                                    </button>
                                                </>
                                            )}
                                            {store.status === 'rejected' && (
                                                <span className="slds-badge slds-theme_error">{t('rejected')}</span>
                                            )}
                                            {store.status === 'joined' && (
                                                <span className="slds-badge slds-theme_info">{t('joined')}</span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </ul>
            )}
        </div>
    );
}
