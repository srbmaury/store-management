
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import { toast } from 'react-toastify';
import Spinner from '../utils/Spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function StaffPage() {
    const { user } = useContext(AuthContext); // assumes you store user and token in context
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [firingId, setFiringId] = useState(null);
    const navigate = useNavigate();
    const { storeId } = useParams();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await API.get(`/staff?storeId=${storeId}`);
                setStaff(res.data);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to fetch staff');
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, [user.token, storeId]);

    const handleFire = async (staffId) => {
        if (!window.confirm('Are you sure you want to fire this staff member?')) return;

        try {
            setFiringId(staffId);
            await API.put(`/staff/fire/${staffId}?storeId=${storeId}`);
            setStaff(prev => prev.filter(s => s._id !== staffId));
            toast.success('Staff member fired successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fire staff member');
        } finally {
            setFiringId(null);
        }
    };

    return (
        <div className="slds-p-around_medium">
            {loading && <Spinner text={t('loadingStaffPage')}/>}
            <h1 className="slds-text-heading_large slds-m-bottom_medium">{t('staffMembers')}</h1>
            <div className="slds-m-bottom_large">
                <button
                    className="slds-button slds-button_neutral"
                    onClick={() => navigate(`/dashboard/${storeId}`)}
                    disabled={loading}
                >
                    {t('backToDashboard')}
                </button>
            </div>
            {staff.length === 0 ? (
                <p>{t('noStaff')}</p>
            ) : (
                <div className="slds-box slds-box_xx-small">
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped">
                        <thead>
                            <tr className="slds-line-height_reset">
                                <th scope="col"><div className="slds-truncate">{t('name')}</div></th>
                                <th scope="col"><div className="slds-truncate">{t('email')}</div></th>
                                <th scope="col"><div className="slds-truncate">{t('phone')}</div></th>
                                <th scope="col"><div className="slds-truncate">{t('actions')}</div></th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(user => (
                                <tr key={user._id}>
                                    <td><div className="slds-truncate">{user.name}</div></td>
                                    <td><div className="slds-truncate">{user.email}</div></td>
                                    <td><div className="slds-truncate">{user.phone}</div></td>
                                    <td>
                                        <button
                                            className="slds-button slds-button_destructive"
                                            onClick={() => handleFire(user._id)}
                                            disabled={firingId === user._id}
                                        >
                                            {firingId === user._id ? t('firing') : t('fire')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
