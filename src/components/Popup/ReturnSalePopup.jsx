import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, CheckCircle, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useLoader } from '../../context/LoaderContext';
import SuccessPopup from './SuccessPopup';
import ErrorPopup from './ErrorPopup';

const ReturnSalePopup = ({ isOpen, onClose, invoiceId }) => {
    // ... logic remains same until return statement
    const { setLoading } = useLoader();
    const [invoiceData, setInvoiceData] = useState(null);
    const [products, setProducts] = useState([]);
    
    // UI state
    const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen && invoiceId) {
            fetchReturnData();
        } else {
            setInvoiceData(null);
            setProducts([]);
        }
    }, [isOpen, invoiceId]);

    const fetchReturnData = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/completed/return-data/${invoiceId}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await res.json();
            if (data.status) {
                setInvoiceData(data.data.invoice_header);
                
                // Initialize products state with return_quantity field
                const initialProducts = (data.data.products || []).map(p => ({
                    ...p,
                    returned_quantity: '',
                    original_quantity: p.quantity || 1 // Assuming quantity exists, else default 1
                }));
                setProducts(initialProducts);
            } else {
                setErrorMessage(data.message || 'Failed to fetch invoice details');
                setIsErrorPopupOpen(true);
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('An error occurred while fetching invoice details.');
            setIsErrorPopupOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (index, value) => {
        const newProducts = [...products];
        // Allow empty string for backspacing
        if (value === '') {
            newProducts[index].returned_quantity = '';
            setProducts(newProducts);
            return;
        }

        const numVal = parseFloat(value);
        if (!isNaN(numVal) && numVal >= 0 && numVal <= newProducts[index].original_quantity) {
            newProducts[index].returned_quantity = numVal;
            setProducts(newProducts);
        }
    };

    const handleSubmit = async () => {
        const itemsToReturn = products
            .filter(p => parseFloat(p.returned_quantity) > 0)
            .map(p => ({
                invoice_detail_id: p.id,
                returned_quantity: parseFloat(p.returned_quantity),
                serial_number: p.serial_number
            }));

        if (itemsToReturn.length === 0) {
            setErrorMessage('Please specify the quantity to return for at least one item.');
            setIsErrorPopupOpen(true);
            return;
        }

        try {
            setLoading(true);
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/completed/return/${invoiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ items: itemsToReturn })
            });

            const data = await res.json();
            if (data.status) {
                setSuccessMessage(data.message || 'Return processed successfully');
                setIsSuccessPopupOpen(true);
            } else {
                setErrorMessage(data.message || 'Failed to process return');
                setIsErrorPopupOpen(true);
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('An error occurred while processing the return.');
            setIsErrorPopupOpen(true);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="tw-fixed tw-inset-0 tw-z-[999999] tw-flex tw-items-center tw-justify-center tw-bg-black/50">
            <div className="tw-bg-white tw-w-11/12 md:tw-w-3/4 lg:tw-w-2/3 xl:tw-w-1/2 tw-max-h-[90vh] tw-rounded-lg tw-shadow-xl tw-flex tw-flex-col">
                <div className="tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <ArrowCounterClockwise className="tw-text-red-500 tw-text-xl" weight="bold" />
                        <h2 className="tw-text-lg tw-font-bold tw-text-gray-900">Return Sale (Credit Note)</h2>
                    </div>
                    <button 
                        onClick={() => onClose(false)} 
                        className="tw-bg-red-500 hover:tw-bg-red-600 tw-text-white tw-rounded-full tw-w-7 tw-h-7 tw-flex tw-items-center tw-justify-center tw-transition-colors tw-border-none tw-shadow-none tw-outline-none"
                    >
                        <X size={14} weight="bold" />
                    </button>
                </div>

                <div className="tw-px-6 tw-py-2 tw-overflow-y-auto tw-flex-1">
                    {invoiceData && (
                        <div className="tw-mb-6 tw-grid tw-grid-cols-2 tw-gap-4">
                            <div>
                                <label className="tw-text-xs tw-font-bold tw-text-gray-500 tw-uppercase">Invoice No</label>
                                <div className="tw-mt-1 tw-p-2 tw-border tw-border-gray-200 tw-rounded tw-bg-gray-50 tw-text-sm">
                                    {invoiceData.invoice_number}
                                </div>
                            </div>
                            <div>
                                <label className="tw-text-xs tw-font-bold tw-text-gray-500 tw-uppercase">Invoice Date</label>
                                <div className="tw-mt-1 tw-p-2 tw-border tw-border-gray-200 tw-rounded tw-bg-gray-50 tw-text-sm">
                                    {invoiceData.invoice_date}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="tw-mb-4">
                        <h3 className="tw-text-md tw-font-bold tw-text-gray-800 tw-mb-2">Select Items to Return</h3>
                        <div className="tw-bg-yellow-50 tw-border-l-4 tw-border-yellow-400 tw-p-3 tw-mb-4 tw-flex tw-gap-2">
                            <p className="tw-text-sm tw-text-yellow-700">Specify the quantity for the items you wish to return. Leave as 0 or empty for items not being returned.</p>
                        </div>
                    </div>

                    <div className="tw-border tw-rounded-md tw-overflow-x-auto tw-mb-4">
                        <table className="tw-w-full tw-text-left tw-text-sm">
                            <thead className="tw-bg-gray-100 tw-text-gray-700 tw-border-b">
                                <tr>
                                    <th className="tw-px-4 tw-py-3 tw-font-semibold">Product</th>
                                    <th className="tw-px-4 tw-py-3 tw-font-semibold">Serial No</th>
                                    <th className="tw-px-4 tw-py-3 tw-font-semibold tw-text-right">Rate (₹)</th>
                                    <th className="tw-px-4 tw-py-3 tw-font-semibold tw-text-center">Return Qty</th>
                                </tr>
                            </thead>
                            <tbody className="tw-divide-y">
                                {products.map((product, index) => (
                                    <tr key={product.id} className="hover:tw-bg-gray-50">
                                        <td className="tw-px-4 tw-py-3">
                                            <div className="tw-flex tw-items-center tw-justify-between">
                                                <span>{product.product_description || 'Product'}</span>
                                                <span className="tw-ml-2 tw-text-xs tw-bg-blue-100 tw-text-blue-800 tw-py-0.5 tw-px-2 tw-rounded-full tw-whitespace-nowrap tw-font-medium">
                                                    Qty: {product.original_quantity}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="tw-px-4 tw-py-3">
                                            {product.serial_number ? (
                                                <span className="tw-bg-gray-100 tw-text-gray-600 tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-border tw-border-gray-200">
                                                    {product.serial_number}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="tw-px-4 tw-py-3 tw-text-right">{product.rate}</td>
                                        <td className="tw-px-4 tw-py-3 tw-text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max={product.original_quantity}
                                                step="0.01"
                                                className="form-control form-control-sm tw-w-24 tw-mx-auto tw-text-center tw-border-gray-300 focus:tw-border-blue-500 focus:tw-ring-1 focus:tw-ring-blue-500"
                                                value={product.returned_quantity}
                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="tw-text-center tw-py-8 tw-text-gray-500">No products found for this invoice.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center tw-bg-white tw-rounded-b-lg">
                    <button 
                        onClick={() => onClose(false)} 
                        className="btn tw-bg-[#f39c12] tw-text-white hover:tw-bg-[#e67e22] tw-px-6 tw-py-2 tw-font-medium tw-rounded tw-shadow-sm tw-border-none"
                    >
                        Close
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className="btn tw-bg-[#2ecc71] tw-text-white hover:tw-bg-[#27ae60] tw-px-6 tw-py-2 tw-font-medium tw-rounded tw-shadow-sm tw-border-none"
                        disabled={products.filter(p => parseFloat(p.returned_quantity) > 0).length === 0}
                    >
                        Submit
                    </button>
                </div>
            </div>

            <SuccessPopup
                isOpen={isSuccessPopupOpen}
                onClose={() => {
                    setIsSuccessPopupOpen(false);
                    onClose(true); // Close return popup and trigger refresh
                }}
                message={successMessage}
            />
            <ErrorPopup
                isOpen={isErrorPopupOpen}
                onClose={() => setIsErrorPopupOpen(false)}
                message={errorMessage}
            />
        </div>,
        document.body
    );
};

export default ReturnSalePopup;
