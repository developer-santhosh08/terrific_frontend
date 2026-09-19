import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { CaretLeft } from '@phosphor-icons/react';
import UpdatePopup from '../../../components/Popup/UpdatePopup';
import CancelPopup from '../../../components/Popup/CancelPopup';
import { useLoader } from '../../../context/LoaderContext';

const paymentModeOptions = [
    { value: 'Cash',   label: 'Cash'   },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'RTGS',   label: 'RTGS'   },
    { value: 'Card',   label: 'Card'   },
    { value: 'Bajaj',  label: 'Bajaj'  },
];

const MOCK_DATA = {
    vendorName:    'SARAS INDUSTRY',
    receiptNumber: '1',
    receiptDate:   '22/02/2026',
    date:          '11-06-2026',
    products: [
        { id: 1, productName: 'SARAS TD-100 100CFM Dew Point @ 5°C ± 3 °C', quantity: 2, rate: 55000, freight: 0.00, taxRange: '19,800.00-38,220.34', discount: 0.00, amount: 55000 },
    ],
    totalDiscount: 0.00,
    totalAmount:   74800.00,
    paymentMode:   'RTGS',
    bank:          null,
    documentNumber: '',
    documentDate:  '01/01/1970',
    amount:        '29000.00',
    remark:        '',
};

const fmt = (v) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v || 0));

const AdvanceReceiptEdit = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id }   = useParams();
    const { setLoading } = useLoader();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [showCancelPopup, setShowCancelPopup] = useState(false);
    const [bankOptions, setBankOptions] = useState([]);
    
    const [poData, setPoData] = useState({
        vendorName: '',
        receiptNumber: 'New',
        receiptDate: new Date().toISOString().split('T')[0],
        products: [],
        totalDiscount: 0,
        totalAmount: 0,
        balanceAmount: 0
    });

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        paymentMode: null,
        bank: null,
        documentNumber: '',
        documentDate: new Date().toISOString().split('T')[0],
        amount: '',
        remark: '',
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                const bankPromise = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/bank`, { headers }).then(r => r.json());
                const receiptPromise = id ? fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/advance-payments/receipt-single/${id}`, { headers }).then(r => r.json()) : Promise.resolve(null);

                const [bankJson, receiptDataResult] = await Promise.all([bankPromise, receiptPromise]);

                if (bankJson && bankJson.status && bankJson.data) {
                    setBankOptions(bankJson.data.map(b => ({ value: b.id, label: b.name })));
                }

                if (receiptDataResult && receiptDataResult.status && receiptDataResult.data) {
                    const rd = receiptDataResult.data;
                    const po = rd.purchase_order;
                    
                    let totalDis = 0;
                    const products = (po && po.details ? po.details : []).map((det, i) => {
                        totalDis += (det.discount_amount || 0);
                        return {
                            id: det.id || i,
                            productName: det.product ? det.product.name : '',
                            quantity: det.quantity,
                            rate: det.price,
                            freight: det.freight,
                            taxRange: `${det.tax_percentage}% (${fmt(det.tax_amount)})`,
                            discount: det.discount_amount,
                            amount: det.amount
                        };
                    });
                    
                    let poBalance = po ? po.balance_amount : 0;
                    let maxAllowedBalance = poBalance + Number(rd.amount);

                    setPoData({
                        vendorName: (po && po.vendor) ? po.vendor.name : '',
                        receiptNumber: rd.id,
                        receiptDate: rd.receipt_date,
                        products: products,
                        totalDiscount: totalDis,
                        totalAmount: po ? po.net_value : 0,
                        balanceAmount: maxAllowedBalance
                    });
                    
                    setForm(prev => ({ 
                        ...prev, 
                        amount: rd.amount?.toString() || '',
                        date: rd.receipt_date || prev.date,
                        bank: bankJson.status ? bankJson.data.filter(b => b.id == rd.bank_account_id).map(b => ({ value: b.id, label: b.name }))[0] : null,
                        paymentMode: rd.payment_mode ? { value: rd.payment_mode, label: rd.payment_mode } : null,
                        documentNumber: rd.document_number || '',
                        documentDate: rd.document_date || prev.documentDate,
                        remark: rd.remark || ''
                    }));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.amount) {
            alert("Please provide an amount.");
            return;
        }

        if (!form.paymentMode) {
            alert("Please select a Payment Mode!");
            return;
        }

        const isCash = form.paymentMode && form.paymentMode.label.toLowerCase() === 'cash';

        if (!isCash && !form.bank) {
            alert("Please provide a bank.");
            return;
        }

        if (!isCash && !form.documentNumber) {
            alert("Please enter a Document Number!");
            return;
        }

        if (Number(form.amount) > Number(poData.balanceAmount)) {
            alert("Amount cannot exceed the balance amount.");
            return;
        }

        setShowUpdatePopup(true);
    };

    const handleConfirmSubmit = async () => {
        setShowUpdatePopup(false);
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const payload = {
                collected_amount: form.amount,
                bank_account_id: form.bank ? form.bank.value : null,
                payment_mode: form.paymentMode ? form.paymentMode.value : null,
                document_number: form.documentNumber,
                document_date: form.documentDate,
                remark: form.remark
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/advance-payments/receipt-single/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.status) {
                navigate('/inventory/advanced-payments', { state: { tab: location.state?.tab } });
            } else {
                alert("Error: " + (result.message || "Failed to save"));
            }
        } catch (error) {
            console.error("Error saving receipt:", error);
        }
    };

    const handleCancelReceiptClick = () => {
        setShowCancelPopup(true);
    };

    const handleConfirmCancelReceipt = async () => {
        setShowCancelPopup(false);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/advance-payments/receipts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            const result = await response.json();
            if (result.status) {
                navigate('/inventory/advanced-payments', { state: { tab: location.state?.tab } });
            } else {
                alert("Error: " + (result.message || "Failed to cancel receipt"));
            }
        } catch (error) {
            console.error("Error cancelling receipt:", error);
            alert("Error cancelling receipt");
        }
    };

    return (
        <section className="content">
            <style>{`
                .btn-cancel-receipt {
                    background-color: #ef4444 !important;
                    border-color: #ef4444 !important;
                    color: white !important;
                }
                .btn-cancel-receipt:hover {
                    background-color: #dc2626 !important;
                    border-color: #dc2626 !important;
                }
            `}</style>
            <div className="container-fluid">
                <div className="card">
                    {/* Card header */}
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Advance Receipt #{id}</h3>
                        <button
                            type="button"
                            className="btn-header-back"
                            onClick={() => navigate('/inventory/advanced-payments', { state: { tab: location.state?.tab } })}
                        >
                            <CaretLeft size={16} weight="bold" />
                            Back
                        </button>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit}>

                            {/* ── Blue info bar ── */}
                            <div style={{
                                background: '#29abe2',
                                borderRadius: 6,
                                padding: '14px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 0,
                            }}>
                                <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
                                    Vendor Name :&nbsp;
                                    <span style={{ fontWeight: 800, letterSpacing: 0.3 }}>{poData.vendorName}</span>
                                </span>
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Date :</span>
                                    <input
                                        type="text"
                                        value={form.date}
                                        onChange={(e) => set('date', e.target.value)}
                                        style={{
                                            background: '#fff',
                                            border: 'none',
                                            borderRadius: 4,
                                            padding: '6px 14px',
                                            fontWeight: 700,
                                            fontSize: 15,
                                            color: '#0f172a',
                                            minWidth: 160,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* ── Receipt info row ── */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '12px 24px',
                                borderBottom: '1px solid #e2e8f0',
                                fontSize: 14,
                                color: '#334155',
                            }}>
                                <span>
                                    Receipt Number :&nbsp;
                                    <strong>{poData.receiptNumber}</strong>
                                </span>
                                <span>
                                    Receipt Date :&nbsp;
                                    <strong>{poData.receiptDate}</strong>
                                </span>
                            </div>

                            {/* ── Product table ── */}
                            <div className="table-responsive mt-2">
                                <table className="table table-bordered align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{ width: 60 }}>S.No</th>
                                            <th>Product Name</th>
                                            <th style={{ width: 100 }}>Quantity</th>
                                            <th style={{ width: 120 }}>Rate</th>
                                            <th style={{ width: 100 }}>Frieght</th>
                                            <th style={{ width: 200 }}>Tax</th>
                                            <th style={{ width: 100 }}>Discount</th>
                                            <th style={{ width: 120 }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {poData.products.map((row, idx) => (
                                            <tr key={row.id}>
                                                <td>{idx + 1}</td>
                                                <td>{row.productName}</td>
                                                <td className="tw-text-right">{row.quantity}</td>
                                                <td className="tw-text-right">{fmt(row.rate)}</td>
                                                <td className="tw-text-right">{fmt(row.freight)}</td>
                                                <td>{row.taxRange}</td>
                                                <td className="tw-text-right">{fmt(row.discount)}</td>
                                                <td className="tw-text-right">{fmt(row.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="6" style={{ border: 'none' }} />
                                            <td className="tw-text-right tw-font-bold" style={{ borderLeft: 'none' }}>
                                                Total Discount :
                                            </td>
                                            <td className="tw-text-right tw-font-bold">{fmt(poData.totalDiscount)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="6" style={{ border: 'none' }} />
                                            <td className="tw-text-right tw-font-bold" style={{ borderLeft: 'none' }}>
                                                Total Amount :
                                            </td>
                                            <td className="tw-text-right tw-font-bold">{fmt(poData.totalAmount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* ── Payment details — 4 fields per row ── */}
                            <div className="row mt-3">
                                <div className="col-md-3 form-group">
                                    <label>Payment Mode</label>
                                    <Select
                                        options={paymentModeOptions}
                                        value={form.paymentMode}
                                        onChange={(opt) => set('paymentMode', opt)}
                                        placeholder="Choose Payment Mode..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>

                                <div className="col-md-3 form-group">
                                    <label>Bank</label>
                                    <Select
                                        options={bankOptions}
                                        value={form.bank}
                                        onChange={(opt) => set('bank', opt)}
                                        placeholder="Choose Bank..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>

                                <div className="col-md-3 form-group">
                                    <label>Document Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Document Number"
                                        value={form.documentNumber}
                                        onChange={(e) => set('documentNumber', e.target.value)}
                                    />
                                </div>

                                <div className="col-md-3 form-group">
                                    <label>Document Date</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.documentDate}
                                        onChange={(e) => set('documentDate', e.target.value)}
                                    />
                                </div>

                                <div className="col-md-3 form-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.amount}
                                        onChange={(e) => set('amount', e.target.value)}
                                    />
                                </div>

                                <div className="col-md-9 form-group">
                                    <label>Remark</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Remark"
                                        rows={2}
                                        value={form.remark}
                                        onChange={(e) => set('remark', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* ── Footer buttons ── */}
                            <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap pt-3 border-top mt-3">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => navigate('/inventory/advanced-payments', { state: { tab: location.state?.tab } })}
                                >
                                    Cancel
                                </button>
                                <div>
                                    <button 
                                        type="button" 
                                        className="btn-save btn-cancel-receipt me-2" 
                                        onClick={handleCancelReceiptClick}
                                    >
                                        Cancel Receipt
                                    </button>
                                    <button type="submit" className="btn-save">Update</button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmSubmit} />
            <CancelPopup isOpen={showCancelPopup} onClose={() => setShowCancelPopup(false)} onConfirm={handleConfirmCancelReceipt} />
        </section>
    );
};

export default AdvanceReceiptEdit;
