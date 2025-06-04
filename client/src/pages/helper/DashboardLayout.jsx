import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardLayout({ children }) {
	const { user, logout } = useContext(AuthContext);
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<div className="slds-p-around_medium" style={{ maxWidth: 1200, margin: 'auto' }}>
			<h1 className="slds-text-heading_large slds-m-bottom_medium">
				Welcome, {user?.name || 'User'}!
			</h1>

			{/* Navigation */}
			<nav className="slds-m-bottom_large">
				<button
					className="slds-button slds-button_neutral slds-m-right_small"
					onClick={() => navigate('/inventory')}
				>
					Inventory
				</button>
				<button
					className="slds-button slds-button_neutral slds-m-right_small"
					onClick={() => navigate('/sales')}
				>
					Sales
				</button>

				<button
					className="slds-button slds-button_neutral slds-m-right_small"
					onClick={() => navigate('/sales-history')}
				>
					Sales History
				</button>

				<button
					className="slds-button slds-button_neutral slds-m-right_small"
					onClick={() => navigate('/joinRequests')}
				>
					Join Requests
				</button>

				<button
					className="slds-button slds-button_destructive"
					onClick={handleLogout}
				>
					Logout
				</button>
			</nav>

			{/* Page Content */}
			{children}
		</div>
	);
}
