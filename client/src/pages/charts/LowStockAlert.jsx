import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LowStockAlert({ lowStockItems }) {
    const { t } = useTranslation();

    return (
        <section className="slds-m-bottom_large">
            <h2 className="slds-text-heading_medium slds-m-bottom_small">
                {t('lowStockAlert')}
            </h2>
            {lowStockItems.length === 0 ? (
                <p>{t('allItemsSufficientlyStocked')}</p>
            ) : (
                <ul>
                    {lowStockItems.map((item) => (
                        <li key={item._id} style={{ color: 'red' }}>
                            {item.name} — {t('onlyLeft', { stock: item.stock })}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
