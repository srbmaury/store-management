export default function ChartContainer({ children }) {
	return (
		<div
			style={{
				border: '1px solid #ddd',
				borderRadius: 4,
				padding: '1rem',
				backgroundColor: '#fff',
				boxShadow: '0 0 5px rgba(0,0,0,0.05)',
			}}
		>
			{children}
		</div>
	);
}