import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { useLoader } from '../../../context/LoaderContext';
import UpdatePopup from '../../../components/Popup/UpdatePopup';



// stockLocationOptions will be fetched dynamically

const damageLocationOptions = [
    { value: '', label: 'Choose Damage location...' },
    { value: 'damage-a', label: 'Damage A' },
    { value: 'damage-b', label: 'Damage B' },
];

const taxOptions = [
    { value: 'SGST9', label: 'SGST[9.00]', rate: 9 },
    { value: 'NO_TAX', label: 'NO TAX[0.00]', rate: 0 },
    { value: 'IGST18', label: 'IGST[18.00]', rate: 18 },
    { value: 'GST18', label: 'GST[18.00]', rate: 18 },
    { value: 'CGST9', label: 'CGST[9.00]', rate: 9 },
];

const inspectionStatusOptions = [
    { value: 'Accept', label: 'Accept' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Return', label: 'Return' },
    { value: 'Cancel', label: 'Cancel' },
    { value: 'Reject', label: 'Reject' },
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
    tax: 'GST18',
    discount: '0.00',
    checkValue: 'Invoice',
});

const GrnEdit = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { setLoading } = useLoader();

    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [activeInspectionRow, setActiveInspectionRow] = useState(null);
    const [inspectionForms, setInspectionForms] = useState([]);
    const [allInspectionParts, setAllInspectionParts] = useState({});
    const [errors, setErrors] = useState({});

    const [rows, setRows] = useState([]);
    const [roundOff, setRoundOff] = useState('0');
    const [stockLocationOptions, setStockLocationOptions] = useState([]);
    const [form, setForm] = useState({
        vendorName: null,
        purchaseOrderNumber: '',
        grnNumber: '9106',
        inspectionDate: '',
        invoiceNumber: '',
        value: '0.00',
        stockLocation: null,
        damageLocation: damageLocationOptions[0],
    });

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [submitAction, setSubmitAction] = useState('save');
    const [originalStatus, setOriginalStatus] = useState(1);
    const [vendorOptions, setVendorOptions] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                const locationsPromise = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/stockLocationType`, { headers }).then(r => r.json());
                const vendorsPromise = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/vendors`, { headers }).then(r => r.json());
                const grnPromise = isEdit ? fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/grn/${id}`, { headers }).then(r => r.json()) : Promise.resolve(null);

                const [locationsJson, vendorsJson, result] = await Promise.all([locationsPromise, vendorsPromise, grnPromise]);

                let loadedLocations = [];
                if (locationsJson && locationsJson.status && locationsJson.data) {
                    loadedLocations = locationsJson.data.map(loc => ({ value: loc.id, label: loc.name }));
                    setStockLocationOptions(loadedLocations);
                }

                if (vendorsJson && vendorsJson.status && vendorsJson.data) {
                    setVendorOptions(vendorsJson.data.map(v => ({ value: v.id, label: v.name })));
                }

                if (isEdit && result && result.status && result.data && result.data.header) {
                    const h = result.data.header;
                    setOriginalStatus(h.inspection_status_id || 1);
                    setForm({
                        vendorName: { label: h.vendor_name, value: h.vendor_name },
                        purchaseOrderNumber: h.po_no,
                        grnNumber: h.grn_number || '9106',
                        inspectionDate: h.grn_date ? h.grn_date.split(' ')[0] : '',
                        invoiceNumber: h.invoice_number,
                        value: h.net_value,
                        stockLocation: loadedLocations.find(o => o.value == h.stock_location_type_id) || loadedLocations[0] || null,
                        damageLocation: damageLocationOptions.find(o => o.value == h.damage_location_id) || damageLocationOptions[0],
                    });
                    setRoundOff(h.round_off?.toString() || '0');

                    if (result.data.details && result.data.details.length > 0) {
                        const formattedRows = result.data.details.map((d, index) => ({
                            id: d.po_detail_id || index + 1,
                            productName: d.product_name,
                            totalQty: d.tot_qty,
                            insQty: d.ins_qty,
                            price: d.price,
                            ed: d.ed,
                            freight: d.freight,
                            tax: taxOptions.find(t => t.rate == d.tax_percentage)?.value || 'GST18',
                            discount: d.dis_percent,
                            checkValue: 'Invoice',
                        }));
                        setRows(formattedRows);

                        const initialParts = {};
                        result.data.details.forEach(d => {
                            if (d.inspection_parts && d.inspection_parts.length > 0) {
                                initialParts[d.po_detail_id] = d.inspection_parts.map(p => ({
                                    id: p.id,
                                    serialNumber: p.serial_number || '',
                                    status: inspectionStatusOptions.find(opt => opt.value === p.product_status) || inspectionStatusOptions[0],
                                    warranty: p.warranty_status == 1 || p.warranty_status === true,
                                    period: p.warranty_period || 0,
                                    outDoorSerialNumber: p.subproduct_serial_number || 'Subproduct Serial',
                                    warrantyPeriod: p.subproduct_warranty_period || p.warranty_period || 0,
                                    reason: p.reason || ''
                                }));
                            }
                        });
                        setAllInspectionParts(initialParts);
                    } else {
                        setRows([{
                            ...createRow(1),
                            productName: '',
                            totalQty: 1,
                            insQty: 1,
                            price: 0,
                        }]);
                    }
                } else if (!isEdit) {
                    setRows([{
                        ...createRow(1),
                        productName: '',
                        totalQty: 1,
                        insQty: 1,
                        price: 0,
                    }]);
                    setForm({
                        vendorName: null,
                        purchaseOrderNumber: '',
                        grnNumber: '',
                        inspectionDate: new Date().toISOString().split('T')[0],
                        invoiceNumber: '',
                        value: '0.00',
                        stockLocation: loadedLocations[0] || null,
                        damageLocation: damageLocationOptions[0],
                    });
                }
            } catch (error) {
                console.error("Error fetching GRN initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id, isEdit]);

    const updateRow = (rowId, field, value) =>
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));

    const addRow = () => setRows(prev => [...prev, createRow(Date.now())]);
    const removeRow = (rowId) => setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== rowId) : prev);

    const openInspectionModal = (row) => {
        setActiveInspectionRow(row);
        const qty = Number(row.insQty) || 1;

        if (allInspectionParts[row.id] && allInspectionParts[row.id].length > 0) {
            const existingParts = allInspectionParts[row.id];
            const forms = Array.from({ length: qty }).map((_, i) => {
                if (existingParts[i]) return existingParts[i];
                return {
                    serialNumber: '',
                    status: inspectionStatusOptions[0],
                    warranty: true,
                    period: 0,
                    outDoorSerialNumber: 'Subproduct Serial',
                    warrantyPeriod: 0,
                    reason: ''
                };
            });
            setInspectionForms(forms);
        } else {
            setInspectionForms(Array.from({ length: qty }).map(() => ({
                serialNumber: '',
                status: inspectionStatusOptions[0],
                warranty: true,
                period: 0,
                outDoorSerialNumber: 'Subproduct Serial',
                warrantyPeriod: 0,
                reason: ''
            })));
        }
        setShowInspectionModal(true);
    };

    const closeInspectionModal = () => {
        setShowInspectionModal(false);
        setActiveInspectionRow(null);
    };

    const updateInspectionForm = (index, field, value) => {
        setInspectionForms(prev => {
            const newForms = [...prev];
            newForms[index] = { ...newForms[index], [field]: value };
            return newForms;
        });
    };

    const saveInspection = async () => {
        try {
            console.log("Saving inspection parts for row:", activeInspectionRow?.id, inspectionForms);
            const token = sessionStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            for (const part of inspectionForms) {
                const partPayload = {
                    purchase_order_header_id: id,
                    purchase_order_detail_id: activeInspectionRow.id,
                    serial_number: part.serialNumber,
                    product_status: part.status.value,
                    warranty_status: part.warranty ? 1 : 0,
                    warranty_period: part.period || 0,
                    subproduct_serial_number: part.outDoorSerialNumber || '',
                    subproduct_warranty_period: part.warrantyPeriod || 0,
                    reason: part.reason || ''
                };
                if (part.id) {
                    partPayload.id = part.id;
                }
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/grn/parts`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(partPayload)
                });
            }

            setAllInspectionParts(prev => ({
                ...prev,
                [activeInspectionRow.id]: inspectionForms
            }));
            closeInspectionModal();
        } catch (err) {
            console.error("Failed to save inspection", err);
        }
    };

    const getTaxRate = (key) => (taxOptions.find(o => o.value === key) || { rate: 0 }).rate;

    const calcRowAmount = (row) => {
        const qty = Number(row.insQty) || 0;
        const price = Number(row.price) || 0;
        const edPercent = Number(row.ed) || 0;
        const freight = Number(row.freight) || 0;
        const discountPercent = Number(row.discount) || 0;

        const grossAmount = qty * price;
        const edAmount = grossAmount * (edPercent / 100);
        const discountAmount = grossAmount * (discountPercent / 100);

        const base = grossAmount + edAmount + freight - discountAmount;
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

    const taxDetails = useMemo(() => {
        const grouped = rows.reduce((acc, row) => {
            const taxRate = getTaxRate(row.tax);
            const edRate = Number(row.ed) || 0;

            // Base amount for ED is (Qty * Price)
            const qty = Number(row.insQty) || 0;
            const price = Number(row.price) || 0;
            const baseAmount = qty * price;

            // ED Grouping
            if (edRate > 0 && baseAmount > 0) {
                const edAmount = baseAmount * (edRate / 100);
                const edKey = `ED_${edRate}`;
                if (!acc[edKey]) acc[edKey] = { type: 'ED', rate: edRate, amount: 0, baseTotal: 0 };
                acc[edKey].amount += edAmount;
                acc[edKey].baseTotal += baseAmount;
            }

            // Tax Grouping
            const taxBase = calcRowAmount(row);
            if (taxRate > 0 && taxBase > 0) {
                const taxAmount = taxBase * (taxRate / 100);
                const taxKey = `TAX_${taxRate}`;
                if (!acc[taxKey]) acc[taxKey] = { type: 'Tax', rate: taxRate, amount: 0, baseTotal: 0 };
                acc[taxKey].amount += taxAmount;
                acc[taxKey].baseTotal += taxBase;
            }

            return acc;
        }, {});
        return Object.values(grouped).map((v, i) => ({ id: i, type: v.type, rate: v.rate, amount: v.amount, baseTotal: v.baseTotal }));
    }, [rows]);

    const handleSubmit = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const payload = {
                grn_inspection_number: form.grnNumber,
                invoice_number: form.invoiceNumber,
                stock_location_type_id: form.stockLocation ? form.stockLocation.value : null,
                damage_location_id: form.damageLocation ? form.damageLocation.value : null,
                created_date: form.inspectionDate ? `${form.inspectionDate} 00:00:00` : null,
                round_off: Number(roundOff) || 0,
                inspection_status_id: submitAction === 'complete' ? 2 : (originalStatus === 2 ? 2 : 1),
                details: rows.map(r => ({ po_detail_id: r.id, ins_qty: r.insQty }))
            };

            const endpoint = submitAction === 'complete'
                ? `${import.meta.env.VITE_API_BASE_URL}/api/inventory/grn/${id}/complete`
                : `${import.meta.env.VITE_API_BASE_URL}/api/inventory/grn/${id}`;
            const method = submitAction === 'complete' ? 'POST' : 'PUT';

            const response = await fetch(endpoint, {
                method,
                headers,
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.status) {
                navigate('/inventory/grn-inspection', { state: { tab: location.state?.tab } });
            } else {
                console.error("Error submitting GRN:", result.message);
            }
        } catch (error) {
            console.error("Error submitting GRN edit:", error);
        }
    };

    const handleFormSubmit = (action) => {
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
        setSubmitAction(action);
        setShowUpdatePopup(true);
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
                        <h3 className="card-title">Edit GRN </h3>
                        <button type="button" className="btn-header-back" onClick={() => navigate('/inventory/grn-inspection', { state: { tab: location.state?.tab } })}>
                            Back
                        </button>
                    </div>

                    <div className="card-body">
                        <form onSubmit={(e) => e.preventDefault()}>

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
                                    <input type="text" className="form-control" value={form.purchaseOrderNumber} readOnly style={{ background: '#f1f5f9' }} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>GRN Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.grnNumber}
                                        onChange={(e) => setForm(p => ({ ...p, grnNumber: e.target.value }))}
                                    />
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
                                {/* <div className="col-md-3 form-group">
                                    <label>Value</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Value"
                                        value={form.value}
                                        onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                                    />
                                </div> */}
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
                                            {/* <th style={{ width: 120 }}>Check</th> */}
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
                                                            value={taxOptions.find(o => o.value === row.tax) || taxOptions[3]}
                                                            onChange={opt => updateRow(row.id, 'tax', opt ? opt.value : 0)}
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
                                                    {/* <td>
                                                        <input type="text" className="form-control" placeholder="Invoice..."
                                                            value={row.checkValue} onChange={e => updateRow(row.id, 'checkValue', e.target.value)} />
                                                    </td> */}
                                                    <td>
                                                        <div className="tw-flex tw-gap-1 tw-justify-center">
                                                            <button type="button" className="table-add" onClick={() => openInspectionModal(row)}><i className="bi bi-plus-lg" /></button>
                                                            {/* <button type="button" className="table-delete" onClick={() => removeRow(row.id)}><i className="bi bi-trash" /></button> */}
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
                                                        <th>Type</th>
                                                        <th>Base Amount</th>
                                                        <th>Rate</th>
                                                        <th>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {taxDetails.length ? taxDetails.map(t => (
                                                        <tr key={t.id}>
                                                            <td>{t.type || 'Tax'}</td>
                                                            <td>{currency(t.baseTotal)}</td>
                                                            <td>{t.rate.toFixed(2)}%</td>
                                                            <td>{currency(t.amount)}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td>Tax</td>
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/inventory/grn-inspection', { state: { tab: location.state?.tab } })}>
                                    Cancel
                                </button>
                                <div className="tw-flex tw-gap-3">
                                    <button type="button" className="btn-save" onClick={() => handleFormSubmit('save')}>
                                        Update
                                    </button>
                                    <button type="button" className="btn-save" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }} onClick={() => handleFormSubmit('complete')}>
                                        Complete GRN
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup
                isOpen={showUpdatePopup}
                onClose={() => setShowUpdatePopup(false)}
                onConfirm={() => {
                    setShowUpdatePopup(false);
                    handleSubmit();
                }}
            />

            {/* ── Add Inspection Parts Modal ── */}
            {showInspectionModal && createPortal(
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999 }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Inspection Parts</h5>
                                <button type="button" className="btn-close" onClick={closeInspectionModal}></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                                <div className="table-responsive">
                                    <table className="table table-bordered align-middle text-nowrap">
                                        <thead className="bg-light">
                                            <tr>
                                                <th style={{ width: 50 }}>Sno</th>
                                                <th>InDoor Serial Number</th>
                                                <th style={{ width: 150 }}>Status</th>
                                                <th style={{ width: 80 }}>Warranty</th>
                                                <th style={{ width: 100 }}>Period</th>
                                                <th>OutDoor Serial Number</th>
                                                <th style={{ width: 150 }}>Warranty Period</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inspectionForms.map((form, index) => (
                                                <React.Fragment key={index}>
                                                    <tr>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Serial Number"
                                                                value={form.serialNumber}
                                                                onChange={e => updateInspectionForm(index, 'serialNumber', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Select
                                                                options={inspectionStatusOptions}
                                                                value={form.status}
                                                                onChange={opt => updateInspectionForm(index, 'status', opt)}
                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                            />
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <div className="form-check d-flex justify-content-center m-0 p-0">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input position-static m-0"
                                                                    style={{ width: '20px', height: '20px', cursor: 'pointer', opacity: 1 }}
                                                                    checked={form.warranty}
                                                                    onChange={e => updateInspectionForm(index, 'warranty', e.target.checked)}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                min="0"
                                                                value={form.period}
                                                                readOnly={!form.warranty}
                                                                style={{ background: !form.warranty ? '#f1f5f9' : '#fff' }}
                                                                onChange={e => {
                                                                    const val = Math.max(0, e.target.value);
                                                                    setInspectionForms(prev => {
                                                                        const newForms = [...prev];
                                                                        newForms[index] = { ...newForms[index], period: val, warrantyPeriod: val };
                                                                        return newForms;
                                                                    });
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={form.outDoorSerialNumber}
                                                                readOnly
                                                                style={{ background: '#f1f5f9' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                min="0"
                                                                value={form.warrantyPeriod}
                                                                readOnly
                                                                style={{ background: '#f1f5f9' }}
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="7">
                                                            <textarea
                                                                className="form-control"
                                                                placeholder="Reason"
                                                                rows="2"
                                                                value={form.reason}
                                                                onChange={e => updateInspectionForm(index, 'reason', e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="table-responsive tw-mt-4">
                                    <table className="table table-bordered align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th style={{ width: 80 }}>Q.No</th>
                                                <th>Question</th>
                                                <th style={{ width: 80 }}>Yes</th>
                                                <th style={{ width: 80 }}>No</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Static rows or dynamic rows will go here later */}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer justify-content-center">
                                <button type="button" className="btn btn-primary px-4" onClick={saveInspection}>Save</button>
                                <button type="button" className="btn btn-secondary px-4" onClick={closeInspectionModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};

export default GrnEdit;
