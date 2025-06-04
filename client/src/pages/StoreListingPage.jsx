import { useEffect, useState } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function StoreListingPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    API.get('/stores/available'),
                    API.get('/join-requests/my-requests'),
                ]);

                const stores = storesRes.data;
                const requests = requestsRes.data;

                // Map storeOwnerId to request status
                const requestMap = {};
                requests.forEach(req => {
                    const storeId = typeof req.storeOwnerId === 'object' ? req.storeOwnerId._id : req.storeOwnerId;
                    requestMap[storeId] = req.status;
                });

                // Combine store with request status
                const enrichedStores = stores.map(store => ({
                    ...store,
                    status: requestMap[store._id] || 'none',
                }));

                setStores(enrichedStores); // Now each store has a status
            } catch (err) {
                toast.error(err ? 'Failed to load stores or requests' : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const joinStore = async (storeOwnerId) => {
        try {
            // Call your backend API to join the store
            const res = await API.post('/auth/join', { storeOwnerId });
            toast.success(res.data.message || 'Successfully joined the store');

            // Update local stores state: change status to 'joined'
            setStores(prevStores =>
                prevStores.map(store =>
                    store.storeOwnerId === storeOwnerId ? { ...store, status: 'joined' } : store
                )
            );
            updateUser({ storeOwnerId });
            navigate('/sales');
            // Optionally redirect to dashboard or refresh user context
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to join store');
        }
    };

    const sendJoinRequest = async (storeOwnerId) => {
        try {
            const res = await API.post('/join-requests', { storeOwnerId });
            toast.success(res.data.message || 'Request sent successfully');

            // Update local stores state to show "pending" immediately
            setStores(prevStores =>
                prevStores.map(store =>
                    store._id === storeOwnerId ? { ...store, status: 'pending' } : store
                )
            );
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to send request');
        }
    };


    if (loading) return <p>Loading stores...</p>;

    return (
        <div className="slds-p-around_large">
            <button
                className="slds-button slds-button_destructive"
                onClick={handleLogout}
            >
                Logout
            </button>
            <h2 className="slds-text-heading_medium">Available Stores</h2>
            {stores.length === 0 ? (
                <p>No stores available right now.</p>
            ) : (
                <ul className="slds-list_vertical slds-has-dividers_top">
                    {stores.map(store => (
                        <div key={store._id} className="slds-box slds-m-around_medium slds-p-around_medium">
                            <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
                                <div>
                                    <h2 className="slds-text-heading_small">{store.storeName}</h2>
                                    <p className="slds-text-body_small">Owner: {store.name}</p>
                                    <p className="slds-text-body_small slds-text-color_weak">Address: {store.address}</p>
                                </div>

                                <div>
                                    {store.status === 'none' ? (
                                        <button
                                            className="slds-button slds-button_neutral"
                                            onClick={() => sendJoinRequest(store._id)}
                                        >
                                            Request to Join
                                        </button>
                                    ) : (
                                        <>
                                            {store.status === 'pending' && (
                                                <span className="slds-badge slds-theme_warning">Pending</span>
                                            )}
                                            {store.status === 'approved' && (
                                                <span className="slds-badge slds-theme_success">Approved</span>
                                            )}
                                            {store.status === 'rejected' && (
                                                <span className="slds-badge slds-theme_error">Rejected</span>
                                            )}

                                            {store.status === 'approved' && (
                                                <button
                                                    className="slds-button slds-button_brand slds-m-horizontal_medium"
                                                    onClick={() => joinStore(store.storeOwnerId)}
                                                >
                                                    Join Store
                                                </button>
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