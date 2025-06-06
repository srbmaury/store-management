import API from '../utils/api';
import { toast } from 'react-toastify';

import DashboardLayout from './helper/DashboardLayout';
import KPICards from './charts/KPICards';
import RecentSalesTable from './charts/RecentSalesTable';
import LowStockAlert from './charts/LowStockAlert';
import Chart from './charts/Chart';
import { useState, useEffect } from 'react';
import Spinner from '../utils/Spinner';
import { useParams } from 'react-router-dom';

export default function DashboardPage() {
	const [inventory, setInventory] = useState([]);
	const [salesHistory, setSalesHistory] = useState([]);
	const [loading, setLoading] = useState(true);

	const [inventoryChartType, setInventoryChartType] = useState('bar');
	const [salesCountChartType, setSalesCountChartType] = useState('bar');
	const [topProductChartType, setTopProductChartType] = useState('bar');
	const [categoryChartType, setCategoryChartType] = useState('bar');

	const totalSalesCount = salesHistory.length;
	const totalRevenue = salesHistory.reduce((acc, sale) => acc + (sale.totalAmount || 0), 0);
	const totalInventoryItems = inventory.length;
	const lowStockItems = Array.isArray(inventory) ? inventory.filter(item => item.stock <= 5) : [];
	const { storeId } = useParams();

	const recentSales = salesHistory
		.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		.slice(0, 5);

	const inventoryByCategoryMap = inventory.reduce((acc, item) => {
		acc[item.category] = (acc[item.category] || 0) + 1;
		return acc;
	}, {});
	const inventoryChartData = Object.entries(inventoryByCategoryMap).map(([name, value]) => ({ name, value }));

	const salesCountMap = {};
	const today = new Date();
	for (let i = 6; i >= 0; i--) {
		const d = new Date(today);
		d.setDate(today.getDate() - i);
		const key = d.toLocaleString().slice(0, 10);
		salesCountMap[key] = 0;
	}
	salesHistory.forEach(sale => {
		if (sale.date) {
			const dateKey = new Date(sale.date).toLocaleString().slice(0, 10);
			if (Object.prototype.hasOwnProperty.call(salesCountMap, dateKey)) {
				salesCountMap[dateKey]++;
			}
		}
	});
	const salesCountChartData = Object.entries(salesCountMap).map(([name, value]) => ({ name, value }));

	const productSalesMap = {};
	salesHistory.forEach(sale => {
		(sale.items || []).forEach(({ item, quantity }) => {
			if (!item) return;
			if (!productSalesMap[item._id]) productSalesMap[item._id] = { name: item.name, quantity: 0 };
			productSalesMap[item._id].quantity += quantity;
		});
	});
	const topProducts = Object.values(productSalesMap)
		.sort((a, b) => b.quantity - a.quantity)
		.slice(0, 5);

	const categorySalesMap = {};
	salesHistory.forEach(sale => {
		(sale.items || []).forEach(({ item, quantity }) => {
			if (!item) return;
			const cat = item.category || 'Uncategorized';
			categorySalesMap[cat] = (categorySalesMap[cat] || 0) + quantity * (item.price || 0);
		});
	});
	const categorySalesData = Object.entries(categorySalesMap).map(([category, value]) => ({ category, value }));

	const revenueByDateMap = {};
	for (let i = 6; i >= 0; i--) {
		const d = new Date(today);
		d.setDate(today.getDate() - i);
		const key = d.toLocaleString().slice(0, 10);
		revenueByDateMap[key] = 0;
	}
	salesHistory.forEach(sale => {
		if (!sale.date) return;
		const key = new Date(sale.date).toLocaleString().slice(0, 10);
		if (Object.prototype.hasOwnProperty.call(revenueByDateMap, key)) {
			revenueByDateMap[key] += sale.totalAmount || 0;
		}
	});
	const revenueTrendData = Object.entries(revenueByDateMap).map(([date, revenue]) => ({
		date,
		revenue: Math.round(revenue * 100) / 100,
	}));

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [{ data: inventoryData }, { data: salesData }] = await Promise.all([
					API.get(`/inventory?storeId=${storeId}`),
					API.get(`/sales?storeId=${storeId}`),
				]);

				setInventory(inventoryData.items || []);
				setSalesHistory(salesData.sales || []);
			} catch (err) {
				toast.error(err?err.message:'Failed to fetch dashboard data');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [storeId]);

	if (loading) {
		return <Spinner text="Loading Dashboard..." />
	}

	return (
		<div>
			<DashboardLayout>
				<KPICards
					totalSalesCount={totalSalesCount}
					totalRevenue={totalRevenue}
					totalInventoryItems={totalInventoryItems}
					lowStockItems={lowStockItems}
				/>

				<RecentSalesTable
					recentSales={recentSales}
				/>

				<LowStockAlert
					lowStockItems={lowStockItems}
				/>

				<Chart
					title="Inventory by Category"
					chartType={inventoryChartType}
					setChartType={setInventoryChartType}
					chartData={inventoryChartData}
					names="name"
					chartMetric="value"
				/>

				<Chart
					title="Sales Count (Last 7 Days)"
					chartType={salesCountChartType}
					setChartType={setSalesCountChartType}
					chartData={salesCountChartData}
					names="name"
					chartMetric="value"
				/>

				<Chart
					title="Top Selling Products"
					chartType={topProductChartType}
					setChartType={setTopProductChartType}
					chartData={topProducts}
					names="name"
					chartMetric="quantity"
				/>

				<Chart
					title="Revenue Trends (Last 7 Days)"
					chartType="line"
					chartData={revenueTrendData}
					names="date"
					chartMetric="revenue"
				/>

				<Chart
					title="Sales by Category"
					chartType={categoryChartType}
					setChartType={setCategoryChartType}
					chartData={categorySalesData}
					names="category"
					chartMetric="value"
				/>
			</DashboardLayout>
		</div>
	);
}
