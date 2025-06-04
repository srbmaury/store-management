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
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <InventoryPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/sales"
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
          path="/joinRequests"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminJoinRequests />
            </PrivateRoute>
          }
        />

        <Route
          path="/sales-history"
          element={
            <PrivateRoute allowedRoles={['admin', 'staff']}>
              {/* Assuming SalesHistoryPage is a component that shows sales history */}
              <SalesHistoryPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}