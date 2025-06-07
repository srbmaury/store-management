import { useTranslation } from 'react-i18next';

export default function Spinner({ text }) {
	const { t } = useTranslation();

	return (
		<div className="slds-spinner_container" style={{ minHeight: 100 }}>
			<div role="status" className="slds-spinner slds-spinner_medium">
				<div className="slds-spinner__dot-a"></div>
				<div className="slds-spinner__dot-b"></div>
			</div>
			<p className="slds-text-body_regular slds-m-top_small slds-text-align_center">{text || t('loading')}</p>
		</div>
	);
}
