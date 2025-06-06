import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StoreListingPage from './pages/StoreListingPage';
import AdminJoinRequests from './pages/AdminJoinRequests';
import SalesHistoryPage from './pages/SalesHistoryPage';
import StaffPage from './pages/StaffPage';
import MyStoresPage from './pages/MyStores';

export default function App() {
	return (
		<>
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>

			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />

				<Route
					path="/myStores"
					element={
						<PrivateRoute allowedRoles={['admin']}>
							<MyStoresPage />
						</PrivateRoute>
					}
				/>

				<Route
					path="/dashboard/:storeId"
					element={
						<PrivateRoute allowedRoles={['admin']}>
							<DashboardPage />
						</PrivateRoute>
					}
				/>

				<Route
					path="/inventory/:storeId"
					element={
						<PrivateRoute allowedRoles={['admin']}>
							<InventoryPage />
						</PrivateRoute>
					}
				/>

				<Route
					path="/sales/:storeId"
					element={
						<PrivateRoute allowedRoles={['admin', 'staff']}>
							<SalesPage />
						</PrivateRoute>
					}
				/>

				<Route
					path="/storeListing"
					element={
						<PrivateRoute allowedRoles={['staff']}>
							<StoreListingPage />
						</PrivateRoute>
					}
				/>

				<Route
					path="/joinRequests/:storeId"
					element={
						<PrivateRoute allowedRoles={['admin']}>
							<AdminJoinRequests />
						</PrivateRoute>
					}
				/>

				<Route
					path="/staff/:storeId"
					element={
						<PrivateRoute allowedRoles={['admin']}>
							<StaffPage />
						</PrivateRoute>
					}
				/>

				<Route
					path="/sales-history/:storeId"
					element={
						<PrivateRoute allowedRoles={['admin', 'staff']}>
							<SalesHistoryPage />
						</PrivateRoute>
					}
				/>

				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		</>
	);
}