import { useLoader } from '../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';

/* ── Tax options ─────────────────────────────────────────────── */
const TAX_OPTIONS = [
    { value: 'NO_TAX', rate: 0, label: 'NO TAX[0.00]' },
    { value: 'SGST', rate: 9, label: 'SGST[9.00]' },
    { value: 'CGST', rate: 9, label: 'CGST[9.00]' },
    { value: 'GST', rate: 18, label: 'GST[18.00]' },
];
const DEFAULT_TAX = TAX_OPTIONS.find(o => o.value === 'GST');

/* ── City options ─────────────────────────────────────────────── */
const cityOptions = [
    { value: 'tirupur', label: 'Tirupur' },
    { value: 'coimbatore', label: 'Coimbatore' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'madurai', label: 'Madurai' },
    { value: 'erode', label: 'Erode' },
    { value: 'salem', label: 'Salem' },
    { value: 'trichy', label: 'Trichy' },
];

/* ── Product initial rows ─────────────────────────────────────── */
const INITIAL_PRODUCT_ROWS = [
    { id: 1, productName: 'Split AC', qty: 2, rate: 45000, discount: 0, tax: DEFAULT_TAX, amount: 106200, location: '' },
    { id: 2, productName: 'Cassette AC', qty: 1, rate: 65000, discount: 0, tax: DEFAULT_TAX, amount: 76700, location: '' },
    { id: 3, productName: 'Tower AC', qty: 2, rate: 80000, discount: 0, tax: DEFAULT_TAX, amount: 188800, location: '' },
];

/* ── Initial contact rows ─────────────────────────────────────── */
const INITIAL_ROWS = [
    { id: 1, contactPerson: 'Ramesh Kumar', designation: 'Manager', contactNumber: '9876543210', convenientTime: '10:00 AM – 12:00 PM' },
    { id: 2, contactPerson: 'Priya Devi', designation: 'Director', contactNumber: '9123456780', convenientTime: '02:00 PM – 04:00 PM' },
];

/* ── Component ────────────────────────────────────────────────── */
const SiteVisitEdit = () => {
    const { setLoading } = useLoader();
    const navigate = useNavigate();
    useParams();

    const [activeTab, setActiveTab] = useState('customerProfile');

    /* ── Product rows (dynamic) ───────────────────────────────── */
    const [productRows, setProductRows] = useState(INITIAL_PRODUCT_ROWS);

    const calcAmount = (qty, rate, discount, tax) => {
        const base = Number(qty) * Number(rate);
        const taxRate = tax?.rate ?? 0;
        return +(base - Number(discount) + base * (taxRate / 100)).toFixed(2);
    };

    const addProductRow = () =>
        setProductRows(prev => [...prev, { id: Date.now(), productName: '', qty: '', rate: '', discount: 0, tax: DEFAULT_TAX, amount: 0, location: '' }]);

    const deleteProductRow = (id) =>
        setProductRows(prev => prev.filter(r => r.id !== id));

    const updateProductRow = (id, field, value) =>
        setProductRows(prev => prev.map(r => {
            if (r.id !== id) return r;
            const updated = { ...r, [field]: value };
            updated.amount = calcAmount(updated.qty, updated.rate, updated.discount, updated.tax);
            return updated;
        }));

    const [buyback, setBuyback] = useState('');

    /* ── Totals ───────────────────────────────────────────────── */
    const subTotal = +productRows.reduce((s, r) => s + (Number(r.qty) * Number(r.rate) - Number(r.discount)), 0).toFixed(2);
    const totalTax = +productRows.reduce((s, r) => s + (Number(r.qty) * Number(r.rate) - Number(r.discount)) * ((r.tax?.rate ?? 0) / 100), 0).toFixed(2);
    const sgst = +(totalTax / 2).toFixed(2);
    const cgst = sgst;
    const igst = 0;
    const netTotal = +(subTotal + sgst + cgst + igst - (Number(buyback) || 0)).toFixed(2);

    /* ── Accessory rows (dynamic) ─────────────────────────────── */
    const [accessoryRows, setAccessoryRows] = useState([]);

    const addAccessoryRow = () =>
        setAccessoryRows(prev => [...prev, { id: Date.now(), productName: '', qty: '', rate: '', discount: 0, tax: DEFAULT_TAX, amount: 0, location: '' }]);

    const deleteAccessoryRow = (id) =>
        setAccessoryRows(prev => prev.filter(r => r.id !== id));

    const updateAccessoryRow = (id, field, value) =>
        setAccessoryRows(prev => prev.map(r => {
            if (r.id !== id) return r;
            const updated = { ...r, [field]: value };
            updated.amount = calcAmount(updated.qty, updated.rate, updated.discount, updated.tax);
            return updated;
        }));

    const [accBuyback, setAccBuyback] = useState('');

    /* ── Accessory Totals ──────────────────────────────────────── */
    const accSubTotal = +accessoryRows.reduce((s, r) => s + (Number(r.qty) * Number(r.rate) - Number(r.discount)), 0).toFixed(2);
    const accTotalTax = +accessoryRows.reduce((s, r) => s + (Number(r.qty) * Number(r.rate) - Number(r.discount)) * ((r.tax?.rate ?? 0) / 100), 0).toFixed(2);
    const accSgst = +(accTotalTax / 2).toFixed(2);
    const accCgst = accSgst;
    const accIgst = 0;
    const accNetTotal = +(accSubTotal + accSgst + accCgst + accIgst - (Number(accBuyback) || 0)).toFixed(2);

    /* ── Customer Profile form state ──────────────────────────── */
    const [addr1, setAddr1] = useState('');
    const [addr2, setAddr2] = useState('');
    const [addr3, setAddr3] = useState('');
    const [city, setCity] = useState(null);
    const [enqDate, setEnqDate] = useState('');
    const [cadPreview, setCadPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type.startsWith('image/')) {
            setCadPreview(URL.createObjectURL(file));
        } else {
            setCadPreview(null);
        }
    };

    /* ── Contact rows ─────────────────────────────────────────── */
    const [rows, setRows] = useState(INITIAL_ROWS);

    const addRow = () =>
        setRows(prev => [...prev, { id: Date.now(), contactPerson: '', designation: '', contactNumber: '', convenientTime: '' }]);

    const deleteRow = (id) =>
        setRows(prev => prev.filter(r => r.id !== id));

    const updateRow = (id, field, value) =>
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

    const TABS = [
        { key: 'customerProfile', label: 'Customer Profile' },
        { key: 'productDetails', label: 'Product Details' },
        { key: 'accessoriesDetails', label: 'Accessories Details' },
    ];

    const renderDetailsTab = (rows, updateRow, addRow, deleteRow, subTotalVal, sgstVal, cgstVal, igstVal, netTotalVal, buybackVal, setBuybackVal, emptyMsg, itemLabel) => (
        <div className="table-responsive">
            <table className="table table-bordered table-striped no-margin">
                <thead>
                    <tr>
                        <th style={{ width: 46 }}>#</th>
                        <th>{itemLabel}</th>
                        <th style={{ width: 100 }}>Quantity</th>
                        <th style={{ width: 110 }}>Rate</th>
                        <th style={{ width: 110 }}>Discount</th>
                        <th style={{ width: 160 }}>Tax</th>
                        <th style={{ width: 120 }}>Amount</th>
                        <th>Location</th>
                        <th style={{ width: 80 }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={r.id}>
                            <td className="tw-align-middle tw-text-center">{i + 1}</td>
                            <td>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={itemLabel}
                                    value={r.productName}
                                    onChange={e => updateRow(r.id, 'productName', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0"
                                    value={r.qty}
                                    onChange={e => updateRow(r.id, 'qty', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0.00"
                                    value={r.rate}
                                    onChange={e => updateRow(r.id, 'rate', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0.00"
                                    value={r.discount}
                                    onChange={e => updateRow(r.id, 'discount', e.target.value)}
                                />
                            </td>
                            <td style={{ minWidth: 160 }}>
                                <Select
                                    options={TAX_OPTIONS}
                                    value={r.tax}
                                    onChange={opt => updateRow(r.id, 'tax', opt)}
                                    styles={{
                                        control: (b) => ({ ...b, minHeight: 36, fontSize: '1rem', borderColor: '#d1d5db' }),
                                        menu: (b) => ({ ...b, zIndex: 9999 }),
                                        valueContainer: (b) => ({ ...b, padding: '2px 12px' }),
                                        indicatorsContainer: (b) => ({ ...b, height: 36 }),
                                    }}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    readOnly
                                    style={{ background: '#f8fafc', color: '#374151', fontWeight: 600 }}
                                    value={r.amount}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Location"
                                    value={r.location}
                                    onChange={e => updateRow(r.id, 'location', e.target.value)}
                                />
                            </td>
                            <td className="tw-align-middle">
                                <div className="tw-flex tw-gap-1 tw-justify-center">
                                    <button
                                        type="button"
                                        className="table-add"
                                        title="Add Row"
                                        onClick={addRow}
                                    >
                                        <i className="bi bi-plus-lg" />
                                    </button>
                                    <button
                                        type="button"
                                        className="table-delete"
                                        title="Delete Row"
                                        onClick={() => deleteRow(r.id)}
                                    >
                                        <i className="bi bi-trash" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan="9" className="tw-text-center tw-py-6 tw-text-slate-400">
                                {emptyMsg}{' '}
                                <button type="button" onClick={addRow} className="tw-text-blue-500 hover:tw-underline tw-font-medium">
                                    + Add row
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <table className="table table-bordered no-margin tw-mt-0" style={{ width: '420px' }}>
                    <tbody>
                        <tr>
                            <td className="tw-text-right tw-py-2 tw-px-4" style={{ width: '60%' }}>Sub Total</td>
                            <td className="tw-text-right tw-py-2 tw-px-4">{subTotalVal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="tw-text-right tw-py-2 tw-px-4">SGST</td>
                            <td className="tw-text-right tw-py-2 tw-px-4">{sgstVal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="tw-text-right tw-py-2 tw-px-4">CGST</td>
                            <td className="tw-text-right tw-py-2 tw-px-4">{cgstVal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="tw-text-right tw-py-2 tw-px-4">IGST</td>
                            <td className="tw-text-right tw-py-2 tw-px-4">{igstVal}</td>
                        </tr>
                        <tr>
                            <td className="tw-text-right tw-py-2 tw-px-4">Buyback</td>
                            <td className="tw-py-1 tw-px-2">
                                <input
                                    type="number"
                                    className="form-control tw-text-right"
                                    placeholder="0.00"
                                    value={buybackVal}
                                    onChange={e => setBuybackVal(e.target.value)}
                                />
                            </td>
                        </tr>
                        <tr style={{ background: '#f1f5f9' }}>
                            <td className="tw-text-right tw-py-2 tw-px-4 tw-font-semibold" style={{ color: '#2563eb' }}>Net Total</td>
                            <td className="tw-text-right tw-py-2 tw-px-4 tw-font-bold" style={{ color: '#2563eb' }}>{netTotalVal.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <section className="content">
            <style>{`
                .cad-preview-img {
                    margin-top: 8px;
                    max-width: 120px;
                    max-height: 100px;
                    object-fit: contain;
                    border-radius: 4px;
                    border: 1px solid #d1d5db;
                    display: block;
                }
            `}</style>

            <div className="container-fluid">
                <div className="card">
                    {/* ── Card Header ──────────────────────────── */}
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Site Visit Details</h3>
                        <button className="btn-header-back" onClick={() => navigate('/sales/site-visit')}>
                            Back
                        </button>
                    </div>

                    <div className="card-body">

                        {/* ── Top info bar ─────────────────────── */}
                        <div
                            className="tw-mb-5"
                            style={{
                                background: '#cce9f7', borderRadius: 6,
                                padding: '14px 24px',
                                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0,
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Customer Name</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>YOUNG STYLE CLOTHING</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Enquiry Number</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>8204</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Allotted To</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>RAMESH P</span>
                            </div>
                        </div>

                        {/* ── Tabs ─────────────────────────────── */}
                        <div className="tw-flex tw-gap-2 tw-mb-4">
                            {TABS.map(t => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setActiveTab(t.key)}
                                    className={`tw-px-4 tw-py-2 ${activeTab === t.key
                                        ? 'tw-bg-blue-600 tw-text-white'
                                        : 'tw-bg-white tw-border tw-text-gray-700'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* ════════════════════════════════════════
                            TAB 1 — Customer Profile
                        ════════════════════════════════════════ */}
                        {activeTab === 'customerProfile' && (
                            <div>
                                {/* ── Address / Date / Upload fields ── */}
                                <div className="row">
                                    <div className="col-md-4 form-group">
                                        <label>Address 1</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Address line 1"
                                            value={addr1}
                                            onChange={e => setAddr1(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Address 2</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Address line 2"
                                            value={addr2}
                                            onChange={e => setAddr2(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Address 3</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Address line 3"
                                            value={addr3}
                                            onChange={e => setAddr3(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>City</label>
                                        <Select
                                            options={cityOptions}
                                            value={city}
                                            onChange={setCity}
                                            placeholder="Select City"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Enquiry Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={enqDate}
                                            onChange={e => setEnqDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Upload CAD Drawing</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept=".dwg,.png,.jpg,.jpeg,.pdf"
                                            onChange={handleFileChange}
                                        />
                                        {cadPreview && (
                                            <img src={cadPreview} alt="CAD preview" className="cad-preview-img" />
                                        )}
                                    </div>
                                </div>

                                {/* ── Contact Persons table ────────── */}
                                <div className="table-responsive tw-mt-3">
                                    <table className="table table-bordered table-striped no-margin">
                                        <thead>
                                            <tr>
                                                <th style={{ width: 46 }}>#</th>
                                                <th>Contact Person</th>
                                                <th>Designation</th>
                                                <th>Contact Number</th>
                                                <th>Convenient Time</th>
                                                <th style={{ width: 80 }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, i) => (
                                                <tr key={row.id}>
                                                    <td className="tw-align-middle tw-text-center">{i + 1}</td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Contact person name"
                                                            value={row.contactPerson}
                                                            onChange={e => updateRow(row.id, 'contactPerson', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Designation"
                                                            value={row.designation}
                                                            onChange={e => updateRow(row.id, 'designation', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            placeholder="Contact number"
                                                            value={row.contactNumber}
                                                            onChange={e => updateRow(row.id, 'contactNumber', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="e.g. 10:00 AM – 12:00 PM"
                                                            value={row.convenientTime}
                                                            onChange={e => updateRow(row.id, 'convenientTime', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="tw-align-middle">
                                                        <div className="tw-flex tw-gap-1 tw-justify-center">
                                                            <button
                                                                type="button"
                                                                className="table-add"
                                                                title="Add Row"
                                                                onClick={addRow}
                                                            >
                                                                <i className="bi bi-plus-lg" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="table-delete"
                                                                title="Delete Row"
                                                                onClick={() => deleteRow(row.id)}
                                                            >
                                                                <i className="bi bi-trash" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {rows.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="tw-text-center tw-py-6 tw-text-slate-400">
                                                        No contacts added.{' '}
                                                        <button type="button" onClick={addRow} className="tw-text-blue-500 hover:tw-underline tw-font-medium">
                                                            + Add row
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ════════════════════════════════════════
                            TAB 2 — Product Details
                        ════════════════════════════════════════ */}
                        {activeTab === 'productDetails' && (
                            renderDetailsTab(
                                productRows, updateProductRow, addProductRow, deleteProductRow,
                                subTotal, sgst, cgst, igst, netTotal, buyback, setBuyback,
                                'No products added.', 'Product Name'
                            )
                        )}

                        {/* ════════════════════════════════════════
                            TAB 3 — Accessories Details
                        ════════════════════════════════════════ */}
                        {activeTab === 'accessoriesDetails' && (
                            renderDetailsTab(
                                accessoryRows, updateAccessoryRow, addAccessoryRow, deleteAccessoryRow,
                                accSubTotal, accSgst, accCgst, accIgst, accNetTotal, accBuyback, setAccBuyback,
                                'No accessories added.', 'Accessory Name'
                            )
                        )}

                    </div>

                    {/* Action Buttons */}
                    <div className="card-footer mt-3 tw-flex tw-justify-between">
                        <button type="button" class="btn-cancel" onClick={() => navigate('/sales/site-visit')}>Cancel</button>
                        <button type="button" class="btn-save">Submit</button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default SiteVisitEdit;
