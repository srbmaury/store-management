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
		return user.role === 'staff' ? <Navigate to="/storeListing" replace /> : <Navigate to="/dashboard" replace />;
	}

	if(user.role === 'staff' && user.storeOwnerId === user._id && location.pathname !== '/storeListing') {
		// Staff without storeOwnerId should acess only storeListing
		return <Navigate to="/storeListing" replace />;
	}

	if(user.role === 'staff' && user.storeOwnerId !== user._id && location.pathname === '/storeListing') {
		// Staff with storeOwnerId should acess only sales
		return <Navigate to="/sales" replace />;
	}

	return children;
}