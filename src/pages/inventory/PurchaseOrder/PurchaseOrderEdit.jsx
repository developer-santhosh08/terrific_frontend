import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { Plus, Trash } from '@phosphor-icons/react';
import UpdatePopup from '../../../components/Popup/UpdatePopup';
import { useLoader } from '../../../context/LoaderContext';

// Vendor options will be fetched dynamically from API

const productTypeOptions = [
    { value: 'type-2', label: 'Product', selected: true },
];

const taxOptions = [
    { value: 0, label: 'NO TAX [0.00]' },
    { value: 5, label: 'GST [5.00]' },
    { value: 9, label: 'SGST [9.00]' },
    { value: 18, label: 'GST [18.00]' },
];

const currency = (value) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));

const createRow = (id) => ({
    id,
    productName: null,
    qty: 1,
    price: '',
    ed: '',
    freight: '',
    tax: 0,
    discount: '',
    amount: 0,
});

const PurchaseOrderEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const activeTab = location.state?.activeTab || 'purchase_list';

    const [rows, setRows] = useState([createRow(1)]);
    const [roundOff, setRoundOff] = useState('');
    const [form, setForm] = useState({
        poNumber: `PO-${id}`,
        vendorName: null,
        productType: productTypeOptions[0],
        date: new Date().toISOString().split('T')[0],
    });

    const [vendorOptions, setVendorOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [totals, setTotals] = useState({ subTotal: 0, discountTotal: 0, sgst: 0, cgst: 0, round: 0, total: 0 });
    const [taxDetails, setTaxDetails] = useState([]);
    const { setLoading } = useLoader();
    const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);

    useEffect(() => {
        const fetchPO = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/purchase-orders/${id}`, { headers });
                const result = await response.json();
                if (result.status && result.data) {
                    const data = Array.isArray(result.data) ? result.data[0] : result.data;

                    const rawDate = data.purchase_order_date ? data.purchase_order_date.split(' ')[0] : (data.po_date ? data.po_date.split(' ')[0] : new Date().toISOString().split('T')[0]);
                    const dateFormatted = rawDate.includes('-') && rawDate.split('-')[0].length === 2 ? rawDate.split('-').reverse().join('-') : rawDate;

                    setForm({
                        poNumber: data.purchase_order_number || data.po_no || `PO-${id}`,
                        vendorName: data.vendor ? { value: data.vendor.id, label: data.vendor.name } : (data.vendor_id ? { value: data.vendor_id, label: data.vendor_name || 'Vendor' } : null),
                        productType: { value: 'type-2', label: 'Product' },
                        date: dateFormatted,
                    });
                    setRoundOff(data.round_off || '');

                    const details = data.details || data.purchase_order_details || data.items || [];
                    if (details.length > 0) {
                        const fetchedRows = details.map((detail, index) => {
                            const pName = detail.product?.name || detail.product_name || detail.item_name || '';
                            const pId = detail.product_id || detail.item_id || pName;
                            return {
                                id: detail.id || index + 1,
                                productName: pName ? { value: pId, label: pName } : null,
                                qty: detail.quantity || detail.qty || 1,
                                price: detail.price || detail.rate || '',
                                ed: detail.ed || '',
                                freight: detail.freight || '',
                                tax: detail.tax_percentage || detail.tax || 0,
                                discount: detail.discount || '',
                                amount: detail.amount || detail.total_value || 0,
                            };
                        });
                        setRows(fetchedRows);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch PO details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPO();
    }, [id]);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/vendors`, { headers });
                const json = await res.json();
                if (json.status && json.data) {
                    const options = json.data.map(v => ({
                        value: v.id,
                        label: v.name || v.vendor_name || v.company_name || 'Unnamed Vendor'
                    }));
                    setVendorOptions(options);
                }
            } catch (err) {
                console.error("Failed to fetch vendors:", err);
            }
        };
        fetchVendors();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!form.vendorName || !form.vendorName.value) {
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
                        price: p.price
                    }));
                    setProductOptions(options);
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
            }
        };
        fetchProducts();
    }, [form.vendorName]);

    useEffect(() => {
        // Local calculation fallback
        const subTotal = rows.reduce((sum, row) => {
            const basePrice = (Number(row.qty) || 0) * (Number(row.price) || 0);
            const edAmount = basePrice * ((Number(row.ed) || 0) / 100);
            const discountAmount = basePrice * ((Number(row.discount) || 0) / 100);
            const taxableValue = basePrice + edAmount + (Number(row.freight) || 0) - discountAmount;
            return sum + Math.max(0, taxableValue);
        }, 0);
        const discountTotal = rows.reduce((sum, row) => {
            const basePrice = (Number(row.qty) || 0) * (Number(row.price) || 0);
            return sum + (basePrice * ((Number(row.discount) || 0) / 100));
        }, 0);
        const taxTotal = rows.reduce((sum, row) => {
            const basePrice = (Number(row.qty) || 0) * (Number(row.price) || 0);
            const edAmount = basePrice * ((Number(row.ed) || 0) / 100);
            const discountAmount = basePrice * ((Number(row.discount) || 0) / 100);
            const taxableValue = basePrice + edAmount + (Number(row.freight) || 0) - discountAmount;
            return sum + (Math.max(0, taxableValue) * ((Number(row.tax) || 0) / 100));
        }, 0);
        const round = Number(roundOff || 0);

        const localTotals = {
            subTotal, discountTotal, sgst: taxTotal / 2, cgst: taxTotal / 2, round, total: subTotal + taxTotal + round
        };

        const grouped = rows.reduce((acc, row) => {
            const rate = Number(row.tax) || 0;
            const basePrice = (Number(row.qty) || 0) * (Number(row.price) || 0);
            const discountAmount = basePrice * ((Number(row.discount) || 0) / 100);
            const lineBase = basePrice - discountAmount + (Number(row.ed) || 0) + (Number(row.freight) || 0);
            const amount = Math.max(0, lineBase) * (rate / 100);
            const key = rate.toFixed(2);
            if (!acc[key]) acc[key] = { rate, amount: 0 };
            acc[key].amount += amount;
            return acc;
        }, {});

        const localTaxDetails = Object.entries(grouped)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([key, value], index) => ({
                id: `tax_${key}`, sno: index + 1, type: 'Tax', base_amount: 0, rate: value.rate, taxLabel: `${value.rate}%`, amount: value.amount,
            }));

        setTotals(localTotals);
        setTaxDetails(localTaxDetails);

        // API calculation
        const timeoutId = setTimeout(async () => {
            const hasValidProduct = rows.some(r => r.productName && r.productName.value);
            if (!hasValidProduct) return;

            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                const rowsPayload = rows.map(r => ({
                    product_id: r.productName?.value || null,
                    quantity: Number(r.qty) || 0,
                    price: Number(r.price) || 0,
                    tax_percentage: Number(r.tax) || 0,
                    discount: Number(r.discount) || 0,
                    ed: Number(r.ed) || 0,
                    freight: Number(r.freight) || 0,
                }));

                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/purchase-orders/calculate`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ 
                        items: rowsPayload,
                        round_off: roundOff === '' ? null : Number(roundOff)
                    })
                });

                const json = await response.json();

                const data = json.data || json;
                const dataDetails = data.details || data.items || data.purchase_order_details;

                if (dataDetails && Array.isArray(dataDetails)) {
                    setRows(prev => {
                        let changed = false;
                        const next = prev.map((r, idx) => {
                            const calc = dataDetails[idx];
                            if (calc) {
                                const apiAmt = Number(calc.calculated_line_amount || calc.calculated_total_value || calc.amount || calc.total_value || calc.total || 0);
                                const newAmt = apiAmt || r.amount;
                                if (newAmt !== r.amount) {
                                    changed = true;
                                    return { ...r, amount: newAmt };
                                }
                            }
                            return r;
                        });
                        return changed ? next : prev;
                    });
                }

                const totalsObj = data.header_calculations || data.totals || data;
                if (totalsObj && (totalsObj.subTotal !== undefined || totalsObj.sub_total !== undefined || totalsObj.net_total !== undefined)) {
                    const totalTax = Number(totalsObj.total_tax) || 0;
                    setTotals({
                        subTotal: Number(totalsObj.subTotal || totalsObj.sub_total || totalsObj.calculated_basic) || localTotals.subTotal,
                        discountTotal: Number(totalsObj.discountTotal || totalsObj.discount_total || totalsObj.calculated_discount) || localTotals.discountTotal,
                        sgst: totalTax > 0 ? (totalTax / 2) : localTotals.sgst,
                        cgst: totalTax > 0 ? (totalTax / 2) : localTotals.cgst,
                        round: totalsObj.round_off !== undefined ? Number(totalsObj.round_off) : localTotals.round,
                        total: Number(totalsObj.total || totalsObj.net_total || totalsObj.calculated_total_value) || localTotals.total,
                    });
                }

                const taxDet = data.taxDetails || data.tax_details || data.tax;
                if (taxDet && Array.isArray(taxDet) && taxDet.length > 0) {
                    setTaxDetails(taxDet);
                }
            } catch (err) {
                console.error("Calculation API error:", err);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [JSON.stringify(rows.map(r => ({ ...r, amount: 0 }))), roundOff, form.vendorName, form.productType, form.date]);
    // Ignore `amount` changes in rows to avoid infinite loop when API updates it

    const updateRow = (rowId, field, value) => {
        setRows((prev) => prev.map((row) => {
            if (row.id === rowId) {
                if (field === 'productName') {
                    return { ...row, productName: value, price: value ? value.price : '' };
                }
                return { ...row, [field]: value };
            }
            return row;
        }));
    };

    const addRow = () => setRows((prev) => [...prev, createRow(Date.now())]);
    const removeRow = (rowId) => setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== rowId) : prev));

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};

        if (!form.vendorName) {
            newErrors.vendorName = true;
        }

        let hasRowErrors = false;
        const newRows = rows.map(r => {
            let rError = {};
            if (!r.productName) {
                rError.productName = true;
                hasRowErrors = true;
            }
            if (!r.qty || Number(r.qty) <= 0) {
                rError.qty = true;
                hasRowErrors = true;
            }
            return { ...r, errors: rError };
        });

        if (hasRowErrors) {
            setRows(newRows);
        }

        if (Object.keys(newErrors).length > 0 || hasRowErrors) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        setErrors({});

        if (form.productType?.value === 'type-1') {
            window.alert('Please select a valid Product Type.');
            return;
        }

        setIsUpdatePopupOpen(true);
    };

    const submitData = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const payload = {
                po_number: form.poNumber,
                vendor_id: form.vendorName?.value,
                product_type: 1,
                purchase_order_date: form.date || null,
                round_off: roundOff === '' ? null : Number(roundOff),
                created_by: 1,
                products: rows.map(r => ({
                    product_id: r.productName?.value || null,
                    quantity: Number(r.qty) || 0,
                    price: Number(r.price) || 0,
                    tax_percentage: Number(r.tax) || 0,
                    discount: Number(r.discount) || 0,
                    ed: Number(r.ed) || 0,
                    freight: Number(r.freight) || 0,
                }))
            };

            const url = `${import.meta.env.VITE_API_BASE_URL}/api/inventory/purchase-orders/${id}`;
            const method = 'PUT';

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.status) {
                navigate('/inventory/purchase-order', { state: { activeTab } });
            } else {
                window.alert(result.message || 'Failed to update Purchase Order');
            }
        } catch (error) {
            console.error('Error saving PO:', error);
            window.alert('An error occurred while updating.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Purchase Order</h3>
                        <button type="button" className="btn-header-back" onClick={() => navigate('/inventory/purchase-order', { state: { activeTab } })}>
                            Back
                        </button>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Purchase Order Number</label>
                                    <input type="text" className="form-control" value={form.poNumber} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Vendor Name</label>
                                    <Select
                                        options={vendorOptions}
                                        value={form.vendorName}
                                        onChange={(option) => setForm((prev) => ({ ...prev, vendorName: option }))}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                        styles={{ control: (base) => ({ ...base, borderColor: errors.vendorName ? '#dc3545' : base.borderColor }) }}
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Product Type</label>
                                    <Select
                                        options={productTypeOptions}
                                        value={form.productType}
                                        onChange={(option) => setForm((prev) => ({ ...prev, productType: option }))}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Date</label>
                                    <input type="date" className="form-control" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
                                </div>
                            </div>

                            <div className="row mt-2">
                                <div className="col-12">
                                    <div className="table-responsive">
                                        <table className="table table-bordered align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th style={{ minWidth: 220 }}>Product Name</th>
                                                    <th style={{ width: 110 }}>Qty</th>
                                                    <th style={{ width: 140 }}>Price</th>
                                                    <th style={{ width: 120 }}>ED</th>
                                                    <th style={{ width: 130 }}>Frieght</th>
                                                    <th style={{ width: 170 }}>Tax</th>
                                                    <th style={{ width: 140 }}>Dis %</th>
                                                    <th style={{ width: 150 }}>Amount</th>
                                                    <th style={{ width: 110 }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row) => {
                                                    const basePrice = (Number(row.qty) || 0) * (Number(row.price) || 0);
                                                    const edAmount = basePrice * ((Number(row.ed) || 0) / 100);
                                                    const discountAmount = basePrice * ((Number(row.discount) || 0) / 100);
                                                    const taxableValue = basePrice + edAmount + (Number(row.freight) || 0) - discountAmount;
                                                    const taxAmount = taxableValue * ((Number(row.tax) || 0) / 100);
                                                    const localAmount = Math.max(0, taxableValue + taxAmount);
                                                    return (
                                                        <tr key={row.id}>
                                                            <td style={{ minWidth: 220 }}>
                                                                <Select
                                                                    options={productOptions}
                                                                    value={row.productName}
                                                                    onChange={(option) => updateRow(row.id, 'productName', option)}
                                                                    className="react-select-container"
                                                                    classNamePrefix="react-select"
                                                                    menuPosition="fixed"
                                                                    placeholder="Select Product"
                                                                    styles={{ control: (base) => ({ ...base, borderColor: row.errors?.productName ? '#dc3545' : base.borderColor }) }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                                                                    className={`form-control text-end ${row.errors?.qty ? 'is-invalid border-danger text-danger' : ''}`}
                                                                    style={row.errors?.qty ? { border: '1px solid #dc3545' } : {}}
                                                                    placeholder="Qty"
                                                                    value={row.qty}
                                                                    onChange={(e) => {
                                                                        const newQty = e.target.value;
                                                                        setRows((prev) => prev.map((r) => 
                                                                            r.id === row.id 
                                                                                ? { ...r, qty: newQty, errors: { ...r.errors, qty: !newQty || Number(newQty) <= 0 } } 
                                                                                : r
                                                                        ));
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                                                                    className="form-control text-end"
                                                                    placeholder="Price"
                                                                    value={row.price}
                                                                    onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                                                                    className="form-control text-end"
                                                                    placeholder="ED"
                                                                    value={row.ed}
                                                                    onChange={(e) => updateRow(row.id, 'ed', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                                                                    className="form-control text-end"
                                                                    placeholder="Freight"
                                                                    value={row.freight}
                                                                    onChange={(e) => updateRow(row.id, 'freight', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <Select
                                                                    options={taxOptions}
                                                                    value={taxOptions.find((opt) => Number(opt.value) === Number(row.tax))}
                                                                    onChange={(option) => updateRow(row.id, 'tax', option ? option.value : 0)}
                                                                    className="react-select-container"
                                                                    classNamePrefix="react-select"
                                                                    menuPosition="fixed"
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                                                                    className="form-control text-end"
                                                                    placeholder="Discount"
                                                                    value={row.discount}
                                                                    onChange={(e) => updateRow(row.id, 'discount', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input type="text" className="form-control text-end" value={currency(Number(row.amount) || localAmount)} readOnly />
                                                            </td>
                                                            <td>
                                                                <div className="tw-flex tw-gap-2">
                                                                    <button type="button" className="list-action-btn btn-add" title="Add Row" onClick={addRow}>
                                                                        <Plus weight="bold" className="tw-w-4" />
                                                                    </button>
                                                                    <button type="button" className="list-action-btn btn-delete" title="Delete Row" onClick={() => removeRow(row.id)}>
                                                                        <Trash weight="bold" className="tw-w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="row mt-3 g-3 align-items-start">
                                <div className="col-lg-6">
                                    <div className="card">
                                        <div className="card-header with-border">
                                            <h3 className="card-title">Tax Detail</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table align-middle mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Type</th>
                                                            <th>Base Amount</th>
                                                            <th>Rate</th>
                                                            <th>Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {taxDetails.length ? taxDetails.map((row) => (
                                                            <tr key={row.id}>
                                                                <td>{row.type || 'Tax'}</td>
                                                                <td>{currency(row.base_amount || 0)}</td>
                                                                <td>{row.taxLabel}</td>
                                                                <td>{currency(row.amount)}</td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td>Tax</td>
                                                                <td>0.00</td>
                                                                <td>0%</td>
                                                                <td>0.00</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
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
                                                <div className="tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b">
                                                    <span>Sub Total</span>
                                                    <strong>{currency(totals.subTotal)}</strong>
                                                </div>
                                                <div className="tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b">
                                                    <span>SGST Tax</span>
                                                    <strong>{currency(totals.sgst)}</strong>
                                                </div>
                                                <div className="tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b">
                                                    <span>CGST Tax</span>
                                                    <strong>{currency(totals.cgst)}</strong>
                                                </div>
                                                <div className="tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b">
                                                    <span>Round Off</span>
                                                    <div style={{ width: 180 }}>
                                                        <input
                                                            type="number"
                                                            className="form-control text-end"
                                                            value={roundOff}
                                                            onChange={(e) => setRoundOff(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="tw-flex tw-justify-between tw-items-center tw-py-3 tw-bg-slate-200 tw-px-3 tw-rounded">
                                                    <span className="tw-font-semibold tw-text-blue-700">Total</span>
                                                    <strong className="tw-text-violet-600">{currency(totals.total)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap pt-3 border-top">
                                        <button type="button" className="btn-cancel" onClick={() => navigate('/inventory/purchase-order', { state: { activeTab } })}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-save">
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup
                isOpen={isUpdatePopupOpen}
                onClose={() => setIsUpdatePopupOpen(false)}
                onConfirm={submitData}
            />
        </section>
    );
};

export default PurchaseOrderEdit;
