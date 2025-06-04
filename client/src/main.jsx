import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './context/AuthContext'; // ✅ default import
import '@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css';
import SalesProvider from './context/SalesContext';

ReactDOM.createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<AuthProvider>
			<SalesProvider>
				<App />
			</SalesProvider>
		</AuthProvider>
	</BrowserRouter>
);
