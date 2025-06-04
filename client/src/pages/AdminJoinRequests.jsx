import { useEffect, useState } from 'react';
import API from "../utils/api";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminJoinRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchJoinRequests = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/join-requests/pending');
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
                err?.response?.data?.message || `Failed to ${status} request`
            );
        }
    };

    useEffect(() => {
        fetchJoinRequests();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="slds-box slds-box_xx-small">
            <div className="slds-m-bottom_large">
                <button
                    className="slds-button slds-button_neutral"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                >
                    ← Back to Dashboard
                </button>
            </div>
            <h2 className="slds-text-heading_medium">Pending Join Requests</h2>
            {requests.length === 0 ? (
                <p>No pending requests.</p>
            ) : (
                <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-m-top_medium">
                    <thead>
                        <tr className="slds-line-height_reset">
                            <th>Name</th>
                            <th>Email</th>
                            <th>Message</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req._id}>
                                <td>{req.staffId?.name}</td>
                                <td>{req.staffId?.email}</td>
                                <td>{req.message || '—'}</td>
                                <td>
                                    <button
                                        className="slds-button slds-button_success slds-m-right_small"
                                        onClick={() => updateStatus(req._id, 'approved')}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="slds-button slds-button_destructive"
                                        onClick={() => updateStatus(req._id, 'rejected')}
                                    >
                                        Reject
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
