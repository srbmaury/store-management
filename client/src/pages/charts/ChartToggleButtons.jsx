export default function ChartToggleButtons({ current, onChange }) {
	return (
		<div style={{ marginBottom: '0.5rem' }}>
			<button
				className={`slds-button slds-button_neutral ${current === 'bar' ? 'slds-button_brand' : ''}`}
				onClick={() => onChange('bar')}
				style={{ marginRight: 8 }}
			>
				Bar Chart
			</button>
			<button
				className={`slds-button slds-button_neutral ${current === 'pie' ? 'slds-button_brand' : ''}`}
				onClick={() => onChange('pie')}
			>
				Pie Chart
			</button>
		</div>
	);
}