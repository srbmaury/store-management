import { useEffect, useState, useContext } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../utils/Spinner';
import Items from './helper/Items';
import SaleSummary from './helper/SaleSummary';
import ReceiptUploader from './ReceiptUploader';
import { AuthContext } from '../context/AuthContext';
import { SalesContext } from '../context/SalesContext';
import { useTranslation } from 'react-i18next';

export default function SalesPage() {
    const [inventory, setInventory] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [customerName, setCustomerName] = useState('Store Customer');
    const [loading, setLoading] = useState(true);
    const { storeId } = useParams();
    const { t } = useTranslation();

    const {
        setSalesHistory,
        salesPage,
        setSalesPage,
        salesLimit,
        setSalesTotalPages
    } = useContext(SalesContext);

    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchSalesAndInventory = async () => {
        setLoading(true);
        try {
            const [{ data: inventoryData }, { data: salesData }] = await Promise.all([
                API.get('/inventory', { params: { storeId } }),
                API.get(`/sales?page=${salesPage}&limit=${salesLimit}`),
            ]);
            setInventory(inventoryData.items);
            setSalesHistory(salesData.sales);
            setSalesTotalPages(salesData.totalPages);
        } catch (err) {
            toast.error(err ? 'Failed to fetch data' : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesAndInventory();
    }, [salesPage]);

    const groupByCategory = (items) => {
        return items.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});
    };

    const handleAddItem = (itemId, qty = 1) => {
        setSelectedItems(prev => {
            const item = inventory.find(i => i._id === itemId);
            if (!item || item.stock === 0) {
                toast.info('Item out of stock');
                return prev;
            }
            const existing = prev.find(i => i.item === itemId);
            if (existing) {
                if (existing.quantity + qty <= item.stock) {
                    return prev.map(i =>
                        i.item === itemId ? { ...i, quantity: i.quantity + qty } : i
                    );
                } else {
                    toast.info(`Cannot add more than available stock (${item.stock})`);
                    return prev;
                }
            } else {
                return [...prev, {
                    item: itemId,
                    quantity: qty,
                    name: item.name,
                    price: item.price,
                    maxStock: item.stock,
                }];
            }
        });
    };

    const updateItemQuantity = (itemId, newQty) => {
        const item = inventory.find(i => i._id === itemId);
        let quantity = parseInt(newQty, 10);
        if (isNaN(quantity) || quantity < 0) quantity = 0;
        if (quantity > item.stock) {
            quantity = item.stock;
            toast.info(`Max quantity is ${item.stock}`);
        }

        if (quantity === 0) {
            setSelectedItems(prev => prev.filter(i => i.item !== itemId));
        } else {
            setSelectedItems(prev =>
                prev.map(i => (i.item === itemId ? { ...i, quantity } : i))
            );
        }
    };

    const handleQuantityChange = (itemId, qty) => {
        updateItemQuantity(itemId, qty);
    };

    const handleDecreaseItem = (itemId) => {
        const existing = selectedItems.find(i => i.item === itemId);
        if (!existing) return;
        updateItemQuantity(itemId, existing.quantity - 1);
    };

    const totalAmount = selectedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    const handleSubmit = async () => {
        if (!customerName.trim()) {
            toast.error('Please enter customer name');
            return;
        }
        if (selectedItems.length === 0) {
            toast.error('Please select at least one item');
            return;
        }
        try {
            const payload = {
                items: selectedItems.map(({ item, quantity, price }) => ({
                    item,
                    quantity,
                    price,
                })),
                totalAmount,
                customerName,
                storeId
            };

            await API.post('/sales', payload);
            toast.success('Sale recorded');
            setSelectedItems([]);
            setSalesPage(1);
            setCustomerName('Store Customer');
            fetchSalesAndInventory();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Sale failed');
        }
    };

    const handleUpdateCart = async (items) => {
        for (let item of items) {
            handleAddItem(item._id, item.quantity);
        }
    };

    const clearCart = () => {
        setSelectedItems([]);
        setCustomerName('Store Customer');
        toast.info('Cart cleared');
    };

    const groupedInventory = groupByCategory(inventory);

    return (
        <div className="slds-p-around_medium">
            {loading && <Spinner text={t('loadingSalesPage')} />}
            <h2 className="slds-text-heading_medium slds-m-bottom_large">{t('salesEntry')}</h2>

            {user.role === 'admin' ? (
                <div className="slds-m-bottom_large">
                    <button
                        className="slds-button slds-button_neutral"
                        onClick={() => navigate(`/dashboard/${storeId}`)}
                    >
                        {t('backToDashboard')}
                    </button>
                </div>
            ) : (
                <div className="slds-m-bottom_large">
                    <button
                        className="slds-button slds-button_neutral slds-m-right_small"
                        onClick={() => navigate(`/sales-history/${storeId}`)}
                    >
                        {t('salesHistory')}
                    </button>
                    <button
                        className="slds-button slds-button_destructive"
                        onClick={handleLogout}
                    >
                        {t('logout')}
                    </button>
                </div>
            )}

            <Items
                groupedInventory={groupedInventory}
                selectedItems={selectedItems}
                handleAddItem={handleAddItem}
                handleDecreaseItem={handleDecreaseItem}
            />

            <SaleSummary
                selectedItems={selectedItems}
                inventory={inventory}
                handleQuantityChange={handleQuantityChange}
                totalAmount={totalAmount}
                customerName={customerName}
                setCustomerName={setCustomerName}
                handleSubmit={handleSubmit}
                clearCart={clearCart}
            />

            <ReceiptUploader inventory={inventory} onCartUpdate={handleUpdateCart} />
        </div>
    );
}
