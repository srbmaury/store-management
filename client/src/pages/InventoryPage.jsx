import { useEffect, useState } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../utils/Spinner';
import * as XLSX from 'xlsx'; // Add this import

export default function InventoryPage() {
	const [items, setItems] = useState([]);
	const [form, setForm] = useState({
		name: '',
		sku: '',
		price: '',
		stock: '',
		category: '',
	});
	const [editingId, setEditingId] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [loading, setLoading] = useState(false); // loading state

	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [totalPages, setTotalPages] = useState(1);

	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('');
	const [minStock, setMinStock] = useState('');
	const [maxStock, setMaxStock] = useState('');

	const navigate = useNavigate();
	const { storeId } = useParams();

	const fetchInventory = async () => {
		setLoading(true);
		try {
			const { data } = await API.get('/inventory', {
				params: {
					storeId,
					category: categoryFilter,
					search: searchTerm,
					page,
					limit,
					minStock: minStock || undefined,
					maxStock: maxStock || undefined,
					
				},
			});
			setItems(data.items);
			setTotalPages(data.totalPages);
		} catch (err) {
			err ? toast.error('Failed to fetch inventory') : toast.error('Unknown error occurred');
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchInventory();
	}, [page, searchTerm, categoryFilter, minStock, maxStock]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const resetForm = () => {
		setForm({ name: '', sku: '', price: '', stock: '', category: '' });
		setEditingId(null);
		setShowForm(false);
	};

	const handleExcelUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		try {
			const data = await file.arrayBuffer();
			const workbook = XLSX.read(data);
			const sheet = workbook.Sheets[workbook.SheetNames[0]];
			const json = XLSX.utils.sheet_to_json(sheet);

			// Assuming columns: name, sku, price, stock, category
			for (let row of json) {
				const existingItem = items.find((i) => i.sku === row.sku);

				if (existingItem) {
					// Update stock
					const updated = {
						...existingItem,
						stock: Number(existingItem.stock) + Number(row.stock || 0),
					};
					const { data: updatedData } = await API.put(`/inventory/${existingItem._id}`, updated);
					setItems((prev) => prev.map((i) => (i._id === updatedData._id ? updatedData : i)));
				} else {
					// Create new item
					const newItem = {
						name: row.name || '',
						sku: row.sku || '',
						price: row.price || 0,
						stock: row.stock || 0,
						category: row.category || '',
					};
					const { data: createdItem } = await API.post('/inventory', { ...newItem, storeId });
					setItems((prev) => [...prev, createdItem]);
				}
			}

			toast.success('Inventory updated from Excel');
			await fetchInventory();
		} catch (err) {
			toast.error(err?err.message:'Failed to read Excel file');
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		// Always convert number fields before submit
		const preparedForm = {
			...form,
			price: Number(form.price),
			stock: Number(form.stock),
		};

		try {
			if (editingId) {
				// Update existing item
				const { data } = await API.put(`/inventory/${editingId}`, {...preparedForm, storeId});
				setItems((prev) =>
					prev.map((item) => (item._id === editingId ? data : item))
				);
				toast.success('Item updated');
			} else {
				// Check if SKU already exists
				const existingItem = items.find(item => item.sku === form.sku);
				if (existingItem) {
					const updatedItemData = {
						...preparedForm,
						stock: Number(existingItem.stock) + Number(form.stock),
					};
					const { data } = await API.put(`/inventory/${existingItem._id}`, {...updatedItemData, storeId});
					setItems((prev) =>
						prev.map((item) => (item._id === existingItem._id ? data : item))
					);
					toast.success('SKU exists - Stock added and item updated');
				} else {
					const { data } = await API.post('/inventory', {...preparedForm, storeId});
					setItems((prev) => [...prev, data]);
					toast.success('Item added');
				}
			}
			resetForm();
			await fetchInventory();
		} catch (err) {
			toast.error('Save failed: ' + (err.response?.data?.message || 'Unknown error'));
		}
		setLoading(false);
	};

	const editItem = (item) => {
		setForm({
			name: item.name,
			sku: item.sku,
			price: item.price,
			stock: item.stock,
			category: item.category,
		});
		setEditingId(item._id);
		setShowForm(true);
	};

	const deleteItem = async (id) => {
		if (!window.confirm('Are you sure you want to delete this item?')) return;
		setLoading(true);
		try {
			await API.delete(`/inventory/${id}`);
			toast.success('Item deleted');
			setItems((prev) => prev.filter((item) => item._id !== id));
			await fetchInventory();
		} catch (err) {
			toast.error(err ? 'Delete failed' : 'Unknown error occurred');
		}
		setLoading(false);
	};

	return (
		<div className="slds-p-around_medium">
			<h2 className="slds-text-heading_large">Inventory</h2>

			<div className="slds-m-bottom_large">
				<button
					className="slds-button slds-button_neutral"
					onClick={() => navigate(`/dashboard/${storeId}`)}
					disabled={loading}
				>
					← Back to Dashboard
				</button>
			</div>

			<div className="slds-m-bottom_medium">
				<button
					className="slds-button slds-button_brand"
					onClick={() => {
						resetForm();
						setShowForm(true);
					}}
					disabled={loading}
				>
					Add New Item
				</button>
			</div>

			<div className="slds-m-bottom_medium">
				<label className="slds-button slds-button_outline-brand">
					Upload Excel File
					<input data-testid="excel-upload-input" type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} hidden />
				</label>
			</div>

			{/* Loading spinner */}
			{loading && <Spinner text="Loading Inventory..." />}

			{showForm && !loading && (
				<form onSubmit={handleSubmit} className="slds-form slds-form_stacked slds-m-bottom_medium">
					<div className="slds-grid slds-wrap">
						{['name', 'sku', 'price', 'stock', 'category'].map((field) => (
							<div key={field} className="slds-col slds-size_1-of-1 slds-medium-size_1-of-5 slds-p-horizontal_x-small">
								<label className="slds-form-element__label" htmlFor={field}>
									{field.charAt(0).toUpperCase() + field.slice(1)}
								</label>
								<input
									className="slds-input"
									type={field === 'price' || field === 'stock' ? 'number' : 'text'}
									id={field}
									name={field}
									value={form[field]}
									onChange={handleChange}
									required
									min={field === 'price' || field === 'stock' ? 0 : undefined}
									step={field === 'price' ? 'any' : undefined}
									disabled={loading}
								/>
							</div>
						))}
					</div>
					<div className="slds-m-top_small">
						<button type="submit" className="slds-button slds-button_brand slds-m-right_small" disabled={loading}>
							{editingId ? 'Update' : 'Add'}
						</button>
						<button
							type="button"
							className="slds-button slds-button_neutral"
							onClick={resetForm}
							disabled={loading}
						>
							Cancel
						</button>
					</div>
				</form>
			)}

			<div className="slds-grid slds-wrap slds-m-bottom_medium slds-align_absolute-center">
				<div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-6 slds-p-horizontal_x-small">
					<input
						type="text"
						className="slds-input"
						placeholder="Search by name"
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setPage(1);
						}}
					/>
				</div>
				<div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-6 slds-p-horizontal_x-small">
					<input
						type="text"
						className="slds-input"
						placeholder="Category"
						value={categoryFilter}
						onChange={(e) => {
							setCategoryFilter(e.target.value);
							setPage(1);
						}}
					/>
				</div>
				<div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-6 slds-p-horizontal_x-small">
					<input
						type="number"
						className="slds-input"
						placeholder="Min Stock"
						value={minStock}
						onChange={(e) => {
							setMinStock(e.target.value);
							setPage(1);
						}}
					/>
				</div>
				<div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-6 slds-p-horizontal_x-small">
					<input
						type="number"
						className="slds-input"
						placeholder="Max Stock"
						value={maxStock}
						onChange={(e) => {
							setMaxStock(e.target.value);
							setPage(1);
						}}
					/>
				</div>
			</div>

			<table className="slds-table slds-table_cell-buffer slds-table_bordered slds-m-top_medium">
				<thead>
					<tr className="slds-line-height_reset">
						<th>Item Name</th>
						<th>SKU</th>
						<th>Price</th>
						<th>Stock</th>
						<th>Category</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{items.length === 0 && (
						<tr>
							<td colSpan="6" className="slds-text-align_center">No items found</td>
						</tr>
					)}
					{items.map((item) => (
						<tr key={item._id}>
							<td>{item.name}</td>
							<td>{item.sku}</td>
							<td>{item.price}</td>
							<td>{item.stock}</td>
							<td>{item.category}</td>
							<td>
								<button
									className="slds-button slds-button_neutral slds-m-right_x-small"
									onClick={() => editItem(item)}
									disabled={loading}
								>
									Edit
								</button>
								<button
									className="slds-button slds-button_destructive"
									onClick={() => deleteItem(item._id)}
									disabled={loading}
								>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{totalPages > 1 && (
				<div className="slds-m-top_medium">
					<button
						className="slds-button slds-button_neutral"
						onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
						disabled={page === 1 || loading}
					>
						Previous
					</button>
					<span className="slds-m-horizontal_small">Page {page} of {totalPages}</span>
					<button
						className="slds-button slds-button_neutral"
						onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
						disabled={page === totalPages || loading}
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}
