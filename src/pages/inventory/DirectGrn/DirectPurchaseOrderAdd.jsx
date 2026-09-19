import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { useLoader } from '../../../context/LoaderContext';
import SubmitPopup from '../../../components/Popup/SubmitPopup';
import SuccessPopup from '../../../components/Popup/SuccessPopup';
import ErrorPopup from '../../../components/Popup/ErrorPopup';

const currency = (v) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v || 0));

const createRow = (id) => ({
    id,
    productName: '',
    qty: '',
    price: '',
    tax: '',
    discount: '',
});

const calcAmount = (row) => {
    const qty = Number(row.qty) || 0;
    const price = Number(row.price) || 0;
    const discPercent = Number(row.discount) || 0;
    const base = qty * price;
    return base - (base * (discPercent / 100));
};

const DirectPurchaseOrderAdd = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoader();
    const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);
    const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [rows, setRows] = useState([createRow(1)]);
    const [roundOff, setRoundOff] = useState('');
    const [vendorOptions, setVendorOptions] = useState([]);
    const [taxOptions, setTaxOptions] = useState([]);
    const [stockLocationOptions, setStockLocationOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [form, setForm] = useState({
        grnNumber: '',
        stockLocation: null,
        vendorName: null,
        date: new Date().toISOString().split('T')[0],
    });

    const updateRow = (rowId, field, value) =>
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));

    const addRow = () => setRows(prev => [...prev, createRow(Date.now())]);
    const removeRow = (rowId) => setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== rowId) : prev);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                // Fetch Vendors
                const resVendors = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/vendors`, { headers });
                const resultVendors = await resVendors.json();
                if (resultVendors.status && resultVendors.data) {
                    setVendorOptions(resultVendors.data.map(v => ({ value: v.id, label: v.name })));
                }

                // Fetch Stock Locations
                const resStock = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/stockLocationType`, { headers });
                const resultStock = await resStock.json();
                if (resultStock.status && resultStock.data) {
                    setStockLocationOptions(resultStock.data.map(s => ({
                        value: s.id,
                        label: s.type || s.name || s.stock_location_name || s.stockLocationName || `Location ${s.id}`
                    })));
                }

                // Fetch Taxes
                const resTaxes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/tax`, { headers });
                const resultTaxes = await resTaxes.json();
                if (resultTaxes.status && resultTaxes.data) {
                    setTaxOptions(resultTaxes.data.map(t => ({
                        value: t.id,
                        label: `${t.name}[${Number(t.percentage).toFixed(2)}]`,
                        rate: Number(t.percentage)
                    })));
                }

                // Fetch PO Number
                const resPo = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/direct-grn/generate-po-number`, { headers });
                const resultPo = await resPo.json();
                if (resultPo.status && resultPo.data) {
                    setForm(p => ({ ...p, grnNumber: resultPo.data.po_number || resultPo.data }));
                }
            } catch (err) {
                console.error('Error fetching dropdowns', err);
            }
        };
        fetchDropdowns();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!form.vendorName) {
                setProductOptions([]);
                return;
            }
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/vendors/${form.vendorName.value}/products`, { headers });
                const json = await res.json();
                if (json.status && json.data) {
                    const options = json.data.map(p => ({
                        value: p.product_id || p.id,
                        label: p.product_name || p.name || p.item_name || 'Unnamed Product',
                        price: p.price || 0,
                        discount: p.discount || 0
                    }));
                    setProductOptions(options);
                } else {
                    setProductOptions([]);
                }
            } catch (err) {
                console.error('Error fetching products', err);
            }
        };
        fetchProducts();
    }, [form.vendorName]);

    // No edit fetch needed for Add page



    const getTaxRate = (key) => (taxOptions.find(o => o.value == key) || { rate: 0 }).rate;

    const [totals, setTotals] = useState({
        subTotal: 0,
        taxTotal: 0,
        sgst: 0,
        cgst: 0,
        round: 0,
        total: 0,
    });

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            const hasValidProduct = rows.some(r => r.productName && (r.productName.value || typeof r.productName === 'number' || typeof r.productName === 'string'));
            if (!hasValidProduct) return;

            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                const payload = {
                    products: rows.map(r => {
                        const pId = (productOptions.find(o => String(o.value) === String(r.productName) || String(o.label) === String(r.productName)) || {}).value || r.productName;
                        return {
                            product_id: pId,
                            vendor_product_mapping_id: pId,
                            quantity: Number(r.qty) || 0,
                            price: Number(r.price) || 0,
                            tax_id: r.tax,
                            tax_percentage: getTaxRate(r.tax),
                            discount: Number(r.discount) || 0,
                        };
                    }),
                    round_off: roundOff === '' ? null : Number(roundOff),
                };

                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/purchase-orders/calculate`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                
                if (result.status && result.data && result.data.header_calculations) {
                    const data = result.data.header_calculations;
                    setTotals({
                        subTotal: data.sub_total || 0,
                        taxTotal: data.total_tax || 0,
                        sgst: (data.total_tax || 0) / 2,
                        cgst: (data.total_tax || 0) / 2,
                        round: data.round_off || 0,
                        total: data.net_total || 0,
                    });
                }
            } catch (err) {
                console.error("Error calculating PO", err);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [rows, roundOff, productOptions]);

    const taxDetails = useMemo(() => {
        const grouped = rows.reduce((acc, row) => {
            if (!row.tax) return acc;
            const rate = Number(getTaxRate(row.tax) || 0);
            const base = calcAmount(row);
            const amount = base * (rate / 100);
            const key = row.tax;
            if (!acc[key]) acc[key] = { rate, label: taxOptions.find(o => o.value == key)?.label || '', amount: 0, base: 0 };
            acc[key].amount += amount;
            acc[key].base += base;
            return acc;
        }, {});
        return Object.values(grouped).map((v, i) => ({ id: i, rate: Number(v.rate || 0), label: v.label, amount: v.amount, base: v.base }));
    }, [rows, taxOptions]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitPopupOpen(true);
    };

    const submitData = async () => {
        try {
            setLoading(true);
            setIsSubmitPopupOpen(false);
            const payload = {
                grn_number: form.grnNumber,
                stock_location_type_id: form.stockLocation ? form.stockLocation.value : '',
                vendor_id: form.vendorName ? form.vendorName.value : '',
                purchase_order_date: form.date,
                products: rows.map(r => ({
                    vendor_product_mapping_id: r.productName,
                    product_id: r.productName,
                    quantity: r.qty,
                    price: r.price,
                    tax: r.tax,
                    discount: r.discount,
                })),
                round_off: roundOff,
                net_total: totals.total
            };

            const token = sessionStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const url = `${import.meta.env.VITE_API_BASE_URL}/api/inventory/direct-grn`;

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.status || response.ok) {
                let successMsg = result.message || 'Direct GRN created successfully!';
                if (result.data && result.data.purchase_order_number) {
                    successMsg += `\nPO Number: ${result.data.purchase_order_number}`;
                }
                setSuccessMessage(successMsg);
                setIsSuccessPopupOpen(true);
            } else {
                setErrorMessage(result.message || 'Error saving Direct GRN');
                setIsErrorPopupOpen(true);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage('Failed to save Direct GRN');
            setIsErrorPopupOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">

                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Direct GRN</h3>
                        <button type="button" className="btn-header-back" onClick={() => navigate('/inventory/direct-grn')}>
                            Back
                        </button>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit}>

                            {/* Form Fields */}
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>GRN Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.grnNumber}
                                        readOnly
                                        style={{ backgroundColor: '#e9ecef' }}
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Stock Location <span className="text-danger">*</span></label>
                                    <Select
                                        options={stockLocationOptions}
                                        value={form.stockLocation}
                                        onChange={opt => setForm(p => ({ ...p, stockLocation: opt }))}
                                        styles={{ control: (b) => ({ ...b, minHeight: 36 }), menu: (b) => ({ ...b, zIndex: 9999 }) }}
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Vendor Name <span className="text-danger">*</span></label>
                                    <Select
                                        options={vendorOptions}
                                        value={form.vendorName}
                                        onChange={opt => setForm(p => ({ ...p, vendorName: opt }))}
                                        placeholder="Choose a Vendor Name"
                                        styles={{ control: (b) => ({ ...b, minHeight: 36 }), menu: (b) => ({ ...b, zIndex: 9999 }) }}
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Date <span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Created Date"
                                        value={form.date}
                                        onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Product Table */}
                            <div className="table-responsive tw-mt-3">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th style={{ width: 110 }}>Qty</th>
                                            <th style={{ width: 130 }}>Price</th>
                                            <th style={{ width: 160 }}>Tax</th>
                                            <th style={{ width: 130 }}>Dis %</th>
                                            <th style={{ width: 140 }}>Amount</th>
                                            <th style={{ width: 100 }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map(row => (
                                            <tr key={row.id}>
                                                <td>
                                                    <Select
                                                        options={productOptions}
                                                        value={productOptions.find(o => Number(o.value) === Number(row.productName)) || null}
                                                        onChange={opt => {
                                                            updateRow(row.id, 'productName', opt ? opt.value : '');
                                                            if (opt) {
                                                                updateRow(row.id, 'price', opt.price || 0);
                                                                updateRow(row.id, 'discount', opt.discount || 0);
                                                            }
                                                        }}
                                                        styles={{ control: (b) => ({ ...b, minHeight: 36 }), menu: (b) => ({ ...b, zIndex: 9999 }) }}
                                                        menuPosition="fixed"
                                                        placeholder="Select Product..."
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        placeholder="Qty"
                                                        value={row.qty}
                                                        min="0"
                                                        onKeyDown={e => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                                                        onChange={e => {
                                                            if (Number(e.target.value) < 0) return;
                                                            updateRow(row.id, 'qty', e.target.value);
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        placeholder="Price"
                                                        value={row.price}
                                                        min="0"
                                                        onKeyDown={e => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                                                        onChange={e => {
                                                            if (Number(e.target.value) < 0) return;
                                                            updateRow(row.id, 'price', e.target.value);
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <Select
                                                        options={taxOptions}
                                                        value={taxOptions.find(o => String(o.value) === String(row.tax)) || null}
                                                        onChange={opt => updateRow(row.id, 'tax', opt ? opt.value : '')}
                                                        styles={{ control: (b) => ({ ...b, minHeight: 36 }), menu: (b) => ({ ...b, zIndex: 9999 }) }}
                                                        menuPosition="fixed"
                                                        placeholder="Select Tax..."
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        placeholder="Discount"
                                                        value={row.discount}
                                                        min="0"
                                                        onKeyDown={e => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                                                        onChange={e => {
                                                            if (Number(e.target.value) < 0) return;
                                                            updateRow(row.id, 'discount', e.target.value);
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Amount"
                                                        value={row.qty && row.price ? currency(calcAmount(row)) : ''}
                                                        readOnly
                                                        style={{ background: '#f8fafc' }}
                                                    />
                                                </td>
                                                <td className="tw-align-middle">
                                                    <div className="tw-flex tw-gap-1 tw-justify-center">
                                                        <button type="button" className="table-add" onClick={addRow}><i className="bi bi-plus-lg" /></button>
                                                        <button type="button" className="table-delete" onClick={() => removeRow(row.id)}><i className="bi bi-trash" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Tax Detail + Totals */}
                            <div className="row tw-mt-4 g-3 align-items-start">
                                <div className="col-lg-6">
                                    <div className="card">
                                        <div className="card-header with-border">
                                            <h3 className="card-title">Tax Detail</h3>
                                        </div>
                                        <div className="card-body">
                                            <table className="table table-sm mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>For</th>
                                                        <th>Rate</th>
                                                        <th>Tax</th>
                                                        <th>Tax Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {taxDetails.length ? taxDetails.map(t => (
                                                        <tr key={t.id}>
                                                            <td>CST For</td>
                                                            <td>{currency(t.base)}</td>
                                                            <td>{t.rate.toFixed(2)}%</td>
                                                            <td>{currency(t.amount)}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td>CST For</td>
                                                            <td>{currency(totals.subTotal)}</td>
                                                            <td>18.00%</td>
                                                            <td>{currency(totals.taxTotal)}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="card">
                                        <div className="card-header with-border">
                                            <h3 className="card-title">Total Details</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="tw-space-y-3">
                                                <div className="d-flex justify-content-between tw-py-2 tw-border-b">
                                                    <span>Sub Total</span>
                                                    <strong>{currency(totals.subTotal)}</strong>
                                                </div>
                                                <div className="d-flex justify-content-between tw-py-2 tw-border-b">
                                                    <span>SGST Tax</span>
                                                    <strong>{currency(totals.sgst)}</strong>
                                                </div>
                                                <div className="d-flex justify-content-between tw-py-2 tw-border-b">
                                                    <span>CGST Tax</span>
                                                    <strong>{currency(totals.cgst)}</strong>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center tw-py-2 tw-border-b">
                                                    <span>Round Off</span>
                                                    <div style={{ width: 160 }}>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value={roundOff}
                                                            placeholder={totals.round ? String(totals.round) : "0"}
                                                            min="0"
                                                            onKeyDown={e => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                                                            onChange={e => {
                                                                if (Number(e.target.value) < 0) return;
                                                                setRoundOff(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between tw-py-3 tw-px-3 tw-rounded" style={{ background: '#f1f5f9' }}>
                                                    <span className="tw-font-semibold tw-text-blue-700">Total</span>
                                                    <strong className="tw-text-violet-600">{totals.total ? currency(totals.total) : 0}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="d-flex justify-content-between align-items-center tw-mt-4 tw-pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                                <button type="button" className="btn-cancel" onClick={() => navigate('/inventory/direct-grn')}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    Submit
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup
                isOpen={isSubmitPopupOpen}
                onClose={() => setIsSubmitPopupOpen(false)}
                onConfirm={submitData}
            />
            <SuccessPopup
                isOpen={isSuccessPopupOpen}
                onClose={() => {
                    setIsSuccessPopupOpen(false);
                    navigate('/inventory/direct-grn');
                }}
                message={successMessage}
            />
            <ErrorPopup
                isOpen={isErrorPopupOpen}
                onClose={() => setIsErrorPopupOpen(false)}
                message={errorMessage}
            />
        </section>
    );
};

export default DirectPurchaseOrderAdd;
