import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ChartToggleButtons({ current, onChange }) {
	const { t } = useTranslation();

	return (
		<div style={{ marginBottom: '0.5rem' }}>
			<button
				className={`slds-button slds-button_neutral ${current === 'bar' ? 'slds-button_brand' : ''
					}`}
				onClick={() => onChange('bar')}
				style={{ marginRight: 8 }}
			>
				{t('barChart')}
			</button>
			<button
				className={`slds-button slds-button_neutral ${current === 'pie' ? 'slds-button_brand' : ''
					}`}
				onClick={() => onChange('pie')}
			>
				{t('pieChart')}
			</button>
		</div>
	);
}
