import { useEffect, useState, useContext } from 'react';
import API from '../utils/api';
import Spinner from '../utils/Spinner';
import SalesHistory from './helper/SalesHistory';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SalesContext } from '../context/SalesContext';
import { useDebounce } from '../utils/useDebounce';
import { toast } from 'react-toastify';

export default function SalesHistoryPage() {
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const initialPage = parseInt(searchParams.get('page')) || 1;
    const { user } = useContext(AuthContext);
	const { storeId } = useParams();

    const {
        salesHistory,
        setSalesHistory,
        salesPage,
        setSalesPage,
        salesLimit,
        salesTotalPages,
        setSalesTotalPages,
        customerSearch,
        setCustomerSearch
    } = useContext(SalesContext);

    const debouncedCustomerName = useDebounce(customerSearch, 500);

    useEffect(() => {
        setSalesPage(initialPage);
    }, [initialPage]);

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                const { data } = await API.get(
                    `/sales?page=${salesPage}&limit=${salesLimit}&customerName=${debouncedCustomerName}&storeId=${storeId}`);
                setSalesHistory(data.sales);
                setSalesTotalPages(data.totalPages);
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Server error');
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, [salesPage, salesLimit, debouncedCustomerName]);

    if (loading) return <Spinner text="Loading Sales..." />;

    return (
        <div className="slds-p-around_medium">
            <h2 className="slds-text-heading_medium slds-m-bottom_medium">Sales History</h2>

            <div className="slds-m-bottom_large">
                <button
                    className="slds-button slds-button_neutral"
                    onClick={() => navigate(user.role === 'admin' ? `/dashboard/${storeId}` : `/sales/${storeId}`)}
                >
                    ← {user.role === 'admin' ? 'Back to Dashboard' : 'Sales Page'}
                </button>
            </div>

            <div className="slds-grid slds-grid_align-spread slds-m-vertical_medium">
                <div>
                    <input
                        type="text"
                        placeholder="Search customer..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="slds-input"
                    />
                </div>
                <div>
                    <button
                        className="slds-button"
                        disabled={salesPage === 1}
                        onClick={() => setSalesPage(p => Math.max(1, p - 1))}
                    >
                        ⬅ Prev
                    </button>
                    <span className="slds-m-horizontal_small">Page {salesPage} of {salesTotalPages}</span>
                    <button
                        className="slds-button"
                        disabled={salesPage === salesTotalPages}
                        onClick={() => setSalesPage(p => Math.min(salesTotalPages, p + 1))}
                    >
                        Next ➡
                    </button>
                </div>
            </div>

            <SalesHistory salesHistory={salesHistory} />
        </div>
    );
}
