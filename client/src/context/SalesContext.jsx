import { createContext, useState } from 'react';

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
    const [salesHistory, setSalesHistory] = useState([]);
    const [salesPage, setSalesPage] = useState(1);
    const [salesLimit, setSalesLimit] = useState(10);
    const [customerSearch, setCustomerSearch] = useState('');
    const [salesTotalPages, setSalesTotalPages] = useState(1);

    const updateSalesHistory = (data) => {
        setSalesHistory(data);
    };

    const updatePagination = ({ page }) => {
        if (page !== undefined) setSalesPage(page);
    };

    const updateSearch = (searchTerm) => {
        setCustomerSearch(searchTerm);
        setSalesPage(1); // reset to page 1 when search changes
    };

    return (
        <SalesContext.Provider
            value={{
                salesHistory,
                setSalesHistory,
                updateSalesHistory,
                salesPage,
                setSalesPage,
                salesTotalPages,
                setSalesTotalPages,
                salesLimit,
                setSalesLimit,
                updatePagination,
                customerSearch,
                setCustomerSearch,
                updateSearch
            }}
        >
            {children}
        </SalesContext.Provider>
    );
};

export default SalesProvider;
