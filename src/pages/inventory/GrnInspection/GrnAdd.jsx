import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { useLoader } from '../../../context/LoaderContext';
import SubmitPopup from '../../../components/Popup/SubmitPopup';



// stockLocationOptions will be fetched dynamically

const damageLocationOptions = [
    { value: '', label: 'Choose Damage location...' },
    { value: 'damage-a', label: 'Damage A' },
    { value: 'damage-b', label: 'Damage B' },
];

const currency = (v) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v || 0));

const createRow = (id) => ({
    id,
    productName: '',
    totalQty: 1,
    insQty: 1,
    price: '',
    ed: '0.00',
    freight: '0.00',
    tax: null,
    discount: '0.00',
    checkValue: 'Invoice',
});

const GrnAdd = () => {
    const navigate = useNavigate();

    const [rows, setRows] = useState([{
        ...createRow(1),
        productName: '',
        totalQty: 1,
        insQty: 1,
        price: 0,
    }]);
    const [roundOff, setRoundOff] = useState('0');
    const [stockLocationOptions, setStockLocationOptions] = useState([]);
    const [taxOptions, setTaxOptions] = useState([]);
    
    useEffect(() => {
        const fetchTaxes = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/tax`);
                const json = await res.json();
                if (json.status && json.data) {
                    const uniqueTaxes = Array.from(new Map(json.data.map(t => [(t.name || '').trim().toUpperCase(), t])).values());
                    setTaxOptions(uniqueTaxes.map(t => ({ 
                        value: t.id, 
                        label: `${t.name} (${t.percentage !== undefined && t.percentage !== null ? t.percentage : 0}%)`, 
                        rate: t.percentage !== undefined && t.percentage !== null ? t.percentage : 0 
                    })));
                }
            } catch (error) {
                console.error("Error fetching taxes:", error);
            }
        };
        fetchTaxes();
    }, []);

    const [form, setForm] = useState({
        vendorName: null,
        purchaseOrderNumber: '',
        grnNumber: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        value: '0.00',
        stockLocation: null,
        damageLocation: damageLocationOptions[0],
    });

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [errors, setErrors] = useState({});

    const updateRow = (rowId, field, value) =>
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));

    const addRow = () => setRows(prev => [...prev, createRow(Date.now())]);
    const removeRow = (rowId) => setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== rowId) : prev);

    const getTaxRate = (key) => (taxOptions.find(o => o.value === key) || { rate: 0 }).rate;

    const calcRowAmount = (row) => {
        const base = (Number(row.insQty) || 0) * (Number(row.price) || 0)
            + (Number(row.ed) || 0)
            + (Number(row.freight) || 0)
            - (Number(row.discount) || 0);
        return Math.max(0, base);
    };

    const totals = useMemo(() => {
        const subTotal = rows.reduce((s, r) => s + calcRowAmount(r), 0);
        const taxTotal = rows.reduce((s, r) => s + calcRowAmount(r) * (getTaxRate(r.tax) / 100), 0);
        const round = Number(roundOff || 0);
        return {
            subTotal,
            taxTotal,
            sgst: taxTotal / 2,
            cgst: taxTotal / 2,
            round,
            total: subTotal + taxTotal + round,
        };
    }, [rows, roundOff]);

    const { setLoading } = useLoader();

    const [vendorOptions, setVendorOptions] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                
                const locationsPromise = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/stockLocationType`, { headers }).then(r => r.json());
                const vendorsPromise = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/vendors`, { headers }).then(r => r.json());
                
                const [locationsJson, vendorsJson] = await Promise.all([locationsPromise, vendorsPromise]);
                
                let loadedLocations = [];
                if (locationsJson && locationsJson.status && locationsJson.data) {
                    loadedLocations = locationsJson.data.map(loc => ({ value: loc.id, label: loc.name }));
                    setStockLocationOptions(loadedLocations);
                    setForm(prev => ({ ...prev, stockLocation: loadedLocations[0] || null }));
                }
                
                if (vendorsJson && vendorsJson.status && vendorsJson.data) {
                    setVendorOptions(vendorsJson.data.map(v => ({ value: v.id, label: v.name })));
                }
            } catch (error) {
                console.error("Error fetching GRN initial data:", error);
            }
        };
        fetchInitialData();
    }, []);

    const taxDetails = useMemo(() => {
        const grouped = rows.reduce((acc, row) => {
            const rate = getTaxRate(row.tax);
            const base = calcRowAmount(row);
            const amount = base * (rate / 100);
            const key = row.tax;
            if (!acc[key]) acc[key] = { rate, label: taxOptions.find(o => o.value === key)?.label || '', amount: 0 };
            acc[key].amount += amount;
            return acc;
        }, {});
        return Object.values(grouped).map((v, i) => ({ id: i, rate: v.rate, label: v.label, amount: v.amount }));
    }, [rows]);

    const handleSubmit = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            // Iterate through rows and save them as parts
            for (const row of rows) {
                const payload = {
                    purchase_order_header_id: 1, // Provide actual header ID if available
                    purchase_order_detail_id: row.id,
                    serial_number: row.productName || `SN-${Date.now()}`, // Using productName as serial for now
                    product_status: 'Accept', // Defaulting to Accept
                    grn_inspection_header_id: 0,
                    batch_number: '',
                    reason: row.checkValue || ''
                };

                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/grn/parts`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                if (!result.status) {
                    console.error("Failed to save part:", result.message);
                }
            }

            navigate('/inventory/grn-inspection');
        } catch (error) {
            console.error("Error submitting GRN parts:", error);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        let newErrors = {};
        if (!form.invoiceNumber) {
            newErrors.invoiceNumber = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setErrors({});
        setShowSubmitPopup(true);
    };

    const rsStyles = {
        control: (b) => ({ ...b, minHeight: 36 }),
        menu: (b) => ({ ...b, zIndex: 9999 }),
        menuPortal: (b) => ({ ...b, zIndex: 9999 }),
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">

                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Direct GRN</h3>
                        <button type="button" className="btn-header-back" onClick={() => navigate('/inventory/grn-inspection')}>
                            Back
                        </button>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleFormSubmit}>

                            {/* ── Form Fields ── */}
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Vendor Name</label>
                                    <Select
                                        options={vendorOptions}
                                        value={form.vendorName}
                                        onChange={opt => setForm(p => ({ ...p, vendorName: opt }))}
                                        styles={rsStyles}
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Purchase Order Number</label>
                                    <input type="text" className="form-control" value={form.purchaseOrderNumber} style={{ background: '#f1f5f9' }} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>GRN Number</label>
                                    <input type="text" className="form-control" value={form.grnNumber} style={{ background: '#f1f5f9' }} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Inspection Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.inspectionDate}
                                        onChange={e => setForm(p => ({ ...p, inspectionDate: e.target.value }))}
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Invoice Number</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.invoiceNumber ? 'is-invalid border-danger text-danger' : ''}`}
                                        style={errors.invoiceNumber ? { border: '1px solid #dc3545' } : {}}
                                        value={form.invoiceNumber}
                                        onChange={e => {
                                            setForm(p => ({ ...p, invoiceNumber: e.target.value }));
                                            if (e.target.value) setErrors(prev => ({ ...prev, invoiceNumber: false }));
                                        }}
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Value</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Value"
                                        value={form.value}
                                        onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Stock Location</label>
                                    <Select
                                        options={stockLocationOptions}
                                        value={form.stockLocation}
                                        onChange={opt => setForm(p => ({ ...p, stockLocation: opt }))}
                                        styles={rsStyles}
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Damage Location</label>
                                    <Select
                                        options={damageLocationOptions}
                                        value={form.damageLocation}
                                        onChange={opt => setForm(p => ({ ...p, damageLocation: opt }))}
                                        styles={rsStyles}
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>

                            {/* ── Product Table ── */}
                            <div className="table-responsive tw-mt-3">
                                <table className="table table-bordered align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{ minWidth: 220 }}>Product Name</th>
                                            <th style={{ width: 90 }}>Tot.Qty</th>
                                            <th style={{ width: 90 }}>Ins.Qty</th>
                                            <th style={{ width: 120 }}>Price</th>
                                            <th style={{ width: 110 }}>ED</th>
                                            <th style={{ width: 110 }}>Freight</th>
                                            <th style={{ width: 160 }}>Tax</th>
                                            <th style={{ width: 110 }}>Dis %</th>
                                            <th style={{ width: 130 }}>Amount</th>
                                            <th style={{ width: 120 }}>Check</th>
                                            <th style={{ width: 90 }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map(row => {
                                            const amount = calcRowAmount(row);
                                            return (
                                                <tr key={row.id}>
                                                    <td>
                                                        <input type="text" className="form-control" placeholder="Product Name"
                                                            value={row.productName} onChange={e => updateRow(row.id, 'productName', e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <input type="number" className="form-control" value={row.totalQty} readOnly style={{ background: '#f1f5f9' }} />
                                                    </td>
                                                    <td>
                                                        <input type="number" className="form-control" value={row.insQty}
                                                            onChange={e => updateRow(row.id, 'insQty', e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <input type="number" className="form-control" placeholder="Price"
                                                            value={row.price} onChange={e => updateRow(row.id, 'price', e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <input type="number" className="form-control" value={row.ed}
                                                            onChange={e => updateRow(row.id, 'ed', e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <input type="number" className="form-control" value={row.freight}
                                                            onChange={e => updateRow(row.id, 'freight', e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <Select
                                                            options={taxOptions}
                                                            value={taxOptions.find(o => o.value === row.tax) || null}
                                                            onChange={(opt) => updateRow(row.id, 'tax', opt ? opt.value : null)}
                                                            styles={rsStyles}
                                                            menuPortalTarget={document.body}
                                                            menuPosition="fixed"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input type="number" className="form-control" value={row.discount}
                                                            onChange={e => updateRow(row.id, 'discount', e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <input type="text" className="form-control" value={currency(amount)} readOnly style={{ background: '#f1f5f9' }} />
                                                    </td>
                                                    <td>
                                                        <input type="text" className="form-control" placeholder="Invoice..."
                                                            value={row.checkValue} onChange={e => updateRow(row.id, 'checkValue', e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <div className="tw-flex tw-gap-1 tw-justify-center">
                                                            <button type="button" className="table-add" onClick={addRow}><i className="bi bi-plus-lg" /></button>
                                                            <button type="button" className="table-delete" onClick={() => removeRow(row.id)}><i className="bi bi-trash" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Tax Detail + Totals ── */}
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
                                                            <td>{currency(totals.subTotal)}</td>
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
                                                        <input type="number" className="form-control"
                                                            value={roundOff} onChange={e => setRoundOff(e.target.value)} />
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

                            {/* ── Footer Buttons ── */}
                            <div className="d-flex justify-content-between align-items-center tw-mt-4 tw-pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                                <button type="button" className="btn-cancel" onClick={() => navigate('/inventory/grn-inspection')}>
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
                isOpen={showSubmitPopup}
                onClose={() => setShowSubmitPopup(false)}
                onConfirm={() => {
                    setShowSubmitPopup(false);
                    handleSubmit();
                }}
            />
        </section>
    );
};

export default GrnAdd;
