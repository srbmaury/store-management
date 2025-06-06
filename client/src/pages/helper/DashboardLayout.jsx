import { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../utils/api';
import { useState } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function DashboardLayout({ children }) {
	const [storeName, setStoreName] = useState('');
	const { user, logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const { storeId } = useParams();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	useEffect(() => {
		const fetchStore = async () => {
			try {
				const res = await API.post(`/stores/${storeId}`);
				setStoreName(res.data.name);
			} catch (err) {
				toast.error('Failed to fetch store', err);
			}
		};

		fetchStore();
	}, [storeId]);

	return (
		<div className="slds-p-around_medium" style={{ maxWidth: 1200, margin: 'auto' }}>
			{/* Header with Welcome + Logout aligned right */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '1rem',
				}}
			>
				<h4 className="slds-text-heading_large">
					{storeName ? `${storeName}` : 'Loading store...'}
				</h4>

				<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
					<span className="slds-text-heading_small">
						Welcome, {user?.name || 'User'}!
					</span>
					<button
						className="slds-button slds-button_destructive"
						onClick={handleLogout}
					>
						Logout
					</button>
				</div>
			</div>

			{/* Navigation */}
			<nav className="slds-m-bottom_large">
				<button
					className="slds-button slds-button_neutral slds-m-right_small"
					onClick={() => navigate(`/inventory/${storeId}`)}
				>
					Inventory
				</button>
				<button
					className="slds-button slds-button_neutral slds-m-right_small"
					onClick={() => navigate(`/sales/${storeId}`)}
				>
					Sales
				</button>
				<button
					className="slds-button slds-button_neutral slds-m-right_small"
					onClick={() => navigate(`/sales-history/${storeId}`)}
				>
					Sales History
				</button>
				<button
					className="slds-button slds-button_neutral slds-m-right_small"
					onClick={() => navigate(`/joinRequests/${storeId}`)}
				>
					Join Requests
				</button>
				<button
					className="slds-button slds-button_neutral slds-m-right_small"
					onClick={() => navigate(`/staff/${storeId}`)}
				>
					Staff
				</button>
				<button
					className="slds-button slds-button_neutral slds-m-right_small"
					onClick={() => navigate('/myStores')}
				>
					My Stores
				</button>
			</nav>

			{/* Page Content */}
			{children}
		</div>
	);
}
