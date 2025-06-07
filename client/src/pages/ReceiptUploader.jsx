import { useState } from 'react';
import Tesseract from 'tesseract.js';
import stringSimilarity from 'string-similarity';
import { useTranslation } from 'react-i18next';

const ReceiptUploader = ({ inventory = [], onCartUpdate }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [extractedItems, setExtractedItems] = useState([]);
    const [errors, setErrors] = useState([]);
    const [unmatchedItems, setUnmatchedItems] = useState([]);
    const { t } = useTranslation();

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
        setExtractedItems([]);
    };

    const handleExtract = () => {
        if (!image) return;

        setLoading(true);
        setErrors([]);
        setUnmatchedItems([]);

        Tesseract.recognize(image, 'eng', {
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,  // good for lines
        })
            .then(({ data: { text } }) => {
                const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
                const matched = [];
                const lowStock = [];
                const notFound = [];

                for (let line of lines) {
                    const match = line.match(/^(.*?)(\d+)\s*$/); // "item name   2"
                    if (!match) continue;

                    let rawName = match[1].trim();
                    let qty = parseInt(match[2]);

                    const inventoryNames = inventory.map(item => item.name.toLowerCase());
                    const { bestMatch } = stringSimilarity.findBestMatch(rawName.toLowerCase(), inventoryNames);

                    if (bestMatch.rating > 0.5) {
                        const matchedItem = inventory.find(item => item.name.toLowerCase() === bestMatch.target);
                        if (matchedItem) {
                            if (qty > matchedItem.stock) {
                                lowStock.push(`${matchedItem.name} (requested ${qty}, available ${matchedItem.stock})`);
                            }

                            matched.push({ ...matchedItem, quantity: Math.min(matchedItem.stock, qty) });
                        }
                    } else {
                        notFound.push(rawName);
                    }
                }

                setExtractedItems(matched);
                setErrors(lowStock);
                setUnmatchedItems(notFound);
            })
            .finally(() => setLoading(false));
    };


    const handleQuantityChange = (index, value) => {
        const updated = [...extractedItems];
        updated[index].quantity = parseInt(value) || 1;
        setExtractedItems(updated);
    };

    const handleUpdateCart = () => {
        if (onCartUpdate) onCartUpdate(extractedItems);
    };

    return (
        <div className="slds-box slds-theme_default slds-p-around_medium slds-m-top_medium">
            <h2 className="slds-text-heading_medium slds-m-bottom_medium">{t('uploadReceipt')}</h2>

            <div className="slds-form-element slds-m-bottom_medium">
                <label className="slds-form-element__label" htmlFor="receipt-upload">{t('receiptImage')}</label>
                <div className="slds-form-element__control">
                    <input
                        id="receipt-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="slds-input"
                    />
                </div>
            </div>

            <button
                className="slds-button slds-button_brand slds-m-bottom_medium"
                onClick={handleExtract}
                disabled={!image || loading}
            >
                {loading ? t('extracting') : t('extractFromReceipt')}
            </button>

            {extractedItems.length > 0 && (
                <div className="slds-m-top_medium">
                    <h3 className="slds-text-title_caps slds-m-bottom_small">{t('matchedItems')}</h3>
                    <div className="slds-grid slds-wrap slds-grid_vertical-align-center slds-border_bottom slds-m-bottom_small slds-p-around_x-small slds-text-title_bold">
                        <div className="slds-col slds-size_1-of-2">{t('itemName')}</div>
                        <div className="slds-col slds-size_1-of-2">{t('quantity')}</div>
                    </div>
                    {extractedItems.map((item, i) => (
                        <div
                            key={item._id}
                            className="slds-grid slds-wrap slds-grid_vertical-align-center slds-m-bottom_x-small"
                        >
                            <div className="slds-col slds-size_1-of-2">{item.name}</div>
                            <div className="slds-col slds-size_1-of-2">
                                <input
                                    type="number"
                                    min="0"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(i, e.target.value)}
                                    className="slds-input"
                                    style={{ width: '80px' }}
                                />
                            </div>
                        </div>
                    ))}
                    <button className="slds-button slds-button_success slds-m-top_medium" onClick={handleUpdateCart}>
                        {t('updateCart')}
                    </button>
                </div>
            )}

            {errors.length > 0 && (
                <div className="slds-text-color_error slds-m-bottom_medium">
                    <strong>{t('stockIssues')}:</strong>
                    <ul className="slds-list_dotted slds-m-left_medium">
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            {unmatchedItems.length > 0 && (
                <div className="slds-text-color_error slds-m-bottom_medium">
                    <strong>{t('unmatchedItems')}:</strong>
                    <ul className="slds-list_dotted slds-m-left_medium">
                        {unmatchedItems.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            )}

        </div>
    );

};

export default ReceiptUploader;
