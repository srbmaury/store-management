import { useEffect, useState } from 'react';
import API from "../utils/api";
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from '../utils/Spinner';

const AdminJoinRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { storeId } = useParams();
    const { t } = useTranslation();

    const fetchJoinRequests = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/join-requests/pending?storeId=${storeId}`);
            setRequests(data);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load join requests');
        } finally {
            setLoading(false);
        }
    };

    // Approve or reject a request
    const updateStatus = async (requestId, status) => {
        try {
            await API.put(`/join-requests/${requestId}/status`, { status });
            setRequests((prev) => prev.filter((req) => req._id !== requestId));
            toast.success(`Request ${status} successfully`);
        } catch (err) {
            toast.error(
                err?.response?.data?.message || `Failed to ${status.replace(/ed$/, '')} request`
            );
        }
    };

    useEffect(() => {
        fetchJoinRequests();
    }, []);

    return (
        <div className="slds-box slds-box_xx-small">
            <div className="slds-m-bottom_large">
                <button
                    className="slds-button slds-button_neutral"
                    onClick={() => navigate(`/dashboard/${storeId}`)}
                    disabled={loading}
                >
                    {t('backToDashboard')}
                </button>
            </div>
            <h2 className="slds-text-heading_medium">{t('pendingJoinRequests')}</h2>
            {loading && <Spinner text={t('loadingJoinRequests')} />}
            {requests.length === 0 ? (
                <p>{t('noPendingRequests')}</p>
            ) : (
                <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-m-top_medium">
                    <thead>
                        <tr className="slds-line-height_reset">
                            <th>{t('name')}</th>
                            <th>{t('email')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req._id}>
                                <td>{req.staffId?.name}</td>
                                <td>{req.staffId?.email}</td>
                                <td>
                                    <button
                                        className="slds-button slds-button_success slds-m-right_small"
                                        onClick={() => updateStatus(req._id, 'approved')}
                                    >
                                        {t('approve')}
                                    </button>
                                    <button
                                        className="slds-button slds-button_destructive"
                                        onClick={() => updateStatus(req._id, 'rejected')}
                                    >
                                        {t('reject')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminJoinRequests;
