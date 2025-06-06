import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function PrivateRoute({ children, allowedRoles }) {
	const { user } = useContext(AuthContext);
	const location = useLocation();

	if (!user || !user.token) {
		// Not logged in
		return <Navigate to="/login" replace />;
	}

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		// Logged in but role not allowed
		return user.role === 'staff' ? <Navigate to="/storeListing" replace /> : <Navigate to="/myStores" replace />;
	}

	if (user.role === 'staff') {
		// Staff without storeId assigned should only access /storeListing (to see stores they can join)
		if (!user.storeId && location.pathname !== '/storeListing') {
			return <Navigate to="/storeListing" replace />;
		}

		// Staff with storeId assigned should not go to /storeListing (store listing page)
		if (user.storeId && location.pathname === '/storeListing') {
			return <Navigate to={`/sales/${user.storeId}`} replace />;
		}
	}
	return children;
}
