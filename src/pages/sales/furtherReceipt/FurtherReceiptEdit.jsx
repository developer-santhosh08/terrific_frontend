import { useLoader } from '../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer } from '@phosphor-icons/react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import SubmitPopup from '../../../components/Popup/SubmitPopup';

const FurtherReceiptEdit = () => {
    const { setLoading } = useLoader();
    const navigate = useNavigate();

    const { id } = useParams();
    
    const [paymentModeOptions, setPaymentModeOptions] = useState([]);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
    const [bankOptions, setBankOptions] = useState([]);
    const [receiptData, setReceiptData] = useState(null);
    const [amount, setAmount] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [selectedBank, setSelectedBank] = useState(null);
    const [documentDate, setDocumentDate] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [remark, setRemark] = useState('');

    useEffect(() => {
        const fetchPaymentModes = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/payment-mode`, { headers });
                const result = await response.json();
                
                if (result.status && result.data) {
                    const options = result.data
                        .filter(mode => mode.status === 1)
                        .map(mode => ({
                            value: mode.id,
                            label: mode.name
                        }));
                    setPaymentModeOptions(options);
                }
            } catch (error) {
                console.error("Error fetching payment modes:", error);
            }
        };

        const fetchBanks = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/bank`, { headers });
                const result = await response.json();
                
                if (result.status && result.data) {
                    const options = result.data.map(bank => ({
                        value: bank.id,
                        label: bank.name
                    }));
                    setBankOptions(options);
                }
            } catch (error) {
                console.error("Error fetching banks:", error);
            }
        };

        const fetchReceiptData = async () => {
            if (!id) return;
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/receipts/create/${id}`, { headers });
                const result = await response.json();
                
                if (result.status && result.data) {
                    setReceiptData(result.data);
                }
            } catch (error) {
                console.error("Error fetching receipt data:", error);
            }
        };

        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchPaymentModes(), fetchBanks(), fetchReceiptData()]);
            setLoading(false);
        };

        loadData();
    }, [id, setLoading]);

    const paymentHistory = receiptData?.payment_history || [];
    const advancePayments = paymentHistory.filter(p => p.type === 'Advance');
    const advCount = advancePayments.length;
    const advAmount = advancePayments.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0).toFixed(2);

    const baseBalance = receiptData ? parseFloat(receiptData.balance_amount || 0) : 0;
    const enteredAmount = parseFloat(amount || 0);
    const currentBalance = (baseBalance - enteredAmount).toFixed(2);

    const handleAmountChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            setAmount('');
            setErrors(prev => ({...prev, amount: false}));
            return;
        }
        
        const numVal = parseFloat(val);
        if (numVal > baseBalance) {
            setToastMessage(`Amount cannot exceed the balance amount of ${baseBalance}`);
            setAmount(baseBalance.toString());
            setErrors(prev => ({...prev, amount: true}));
            setTimeout(() => setToastMessage(''), 6000);
        } else {
            setAmount(val);
            setToastMessage('');
            setErrors(prev => ({...prev, amount: false}));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        let newErrors = {};
        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = true;
        }
        if (!selectedPaymentMode) {
            newErrors.paymentMode = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setToastMessage("Please fill in the required fields correctly.");
            setTimeout(() => setToastMessage(''), 4000);
            return;
        }

        setErrors({});
        setIsSubmitPopupOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitPopupOpen(false);
        setLoading(true);
        
        try {
            const token = sessionStorage.getItem('token');
            const payload = {
                customer_id: receiptData?.customer_id || receiptData?.vendor_id || null,
                amount: parseFloat(amount),
                payment_mode: selectedPaymentMode?.value,
                bank_id: selectedBank?.value || null,
                document_number: documentNumber,
                document_date: documentDate,
                remark: remark
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/receipts/submit/${id}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (response.ok && data.status) {
                navigate('/sales/further-receipt');
            } else {
                setToastMessage(data.message || 'Failed to save payment.');
                setTimeout(() => setToastMessage(''), 4000);
            }
        } catch (error) {
            console.error(error);
            setToastMessage('An error occurred while saving.');
            setTimeout(() => setToastMessage(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {toastMessage && createPortal(
                <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 999999, background: '#ef4444', color: 'white', padding: '12px 20px', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-exclamation-circle"></i> <span>{toastMessage}</span>
                    <button onClick={() => setToastMessage('')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '15px', fontSize: '18px', display: 'flex', alignItems: 'center', padding: 0 }} title="Close">
                        <i className="fas fa-times"></i>
                    </button>
                </div>,
                document.body
            )}
            <SubmitPopup 
                isOpen={isSubmitPopupOpen} 
                onClose={() => setIsSubmitPopupOpen(false)} 
                onConfirm={handleConfirmSubmit} 
            />
            <section className="content">
                <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Create Receipt</h3>
                        <div className="d-flex align-items-center gap-2">
                            <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/sales-further-receipt/${id}`, '_blank')}>
                                <Printer size={18} weight="bold" />
                            </button>
                            <button className="btn-header-back m-0" onClick={() => navigate('/sales/further-receipt')}>Back</button>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleFormSubmit}>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Customer Name</label>
                                    <input type="text" className="form-control" value={receiptData?.customer_name || ''} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Date</label>
                                    <input type="date" className="form-control" defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Invoice Number</label>
                                    <input type="text" className="form-control" value={receiptData?.invoice_number || ''} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Invoice Date</label>
                                    <input type="text" className="form-control" value={receiptData?.invoice_date || ''} readOnly />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Total Invoice Amount</label>
                                    <input type="text" className="form-control" value={receiptData?.total_invoice_amount || '0.00'} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Paid Amount</label>
                                    <input type="text" className="form-control" value={receiptData?.paid_amount || '0.00'} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Balance Amount</label>
                                    <input type="text" className="form-control text-danger fw-bold" value={receiptData?.balance_amount || '0.00'} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Payment Mode</label>
                                    <div style={{ border: errors.paymentMode ? '1px solid red' : 'none', borderRadius: '4px' }}>
                                        <Select 
                                            options={paymentModeOptions} 
                                            placeholder="Select Payment Mode" 
                                            value={selectedPaymentMode}
                                            onChange={(selected) => {
                                                setSelectedPaymentMode(selected);
                                                setErrors(prev => ({...prev, paymentMode: false}));
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {selectedPaymentMode && selectedPaymentMode.label.toLowerCase() !== 'cash' && (
                                <div className="row">
                                    <div className="col-md-3 form-group">
                                        <label>Bank</label>
                                        <Select 
                                            options={bankOptions} 
                                            placeholder="Select Bank" 
                                            value={selectedBank}
                                            onChange={(selected) => setSelectedBank(selected)}
                                        />
                                    </div>
                                    <div className="col-md-3 form-group">
                                        <label>Document Date</label>
                                        <input type="date" className="form-control" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} />
                                    </div>
                                    <div className="col-md-3 form-group">
                                        <label>Document Number</label>
                                        <input type="text" className="form-control" placeholder="Document Number" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
                                    </div>
                                </div>
                            )}

                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Amount</label>
                                    <input type="number" className={`form-control ${errors.amount ? 'is-invalid border-danger text-danger' : ''}`} style={errors.amount ? { border: '1px solid #dc3545', boxShadow: '0 0 0 0.25rem rgba(220,53,69,.25)' } : {}} placeholder="Amount" value={amount} onChange={handleAmountChange} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Current Balance</label>
                                    <input type="text" className="form-control text-primary fw-bold" value={currentBalance} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Remark</label>
                                    <input type="text" className="form-control" placeholder="Remark" value={remark} onChange={(e) => setRemark(e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="row mt-4">
                                <div className="col-12">
                                    <h5 className="mb-3">Payment History</h5>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Receipt No</th>
                                                    <th>Date</th>
                                                    <th>Type</th>
                                                    <th>Payment Mode</th>
                                                    <th className="text-end">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paymentHistory.length > 0 ? (
                                                    paymentHistory.map((p, idx) => (
                                                        <tr key={idx}>
                                                            <td>{idx + 1}</td>
                                                            <td>{p.receipt_number || '-'}</td>
                                                            <td>{p.date}</td>
                                                            <td>
                                                                <span className={`badge ${p.type === 'Advance' ? 'bg-primary' : 'bg-info'}`}>
                                                                    {p.type}
                                                                </span>
                                                            </td>
                                                            <td>{p.payment_mode || '-'}</td>
                                                            <td className="text-end">{parseFloat(p.amount || 0).toFixed(2)}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="text-center text-muted py-3">No payment history found for this invoice.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions mt-3 d-flex justify-content-between">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/sales/further-receipt')}>Cancel</button>
                                <button type="submit" className="btn-save">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
};

export default FurtherReceiptEdit;
