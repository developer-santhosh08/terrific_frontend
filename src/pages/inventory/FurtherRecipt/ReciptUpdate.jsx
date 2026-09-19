import { useLoader } from '../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer } from '@phosphor-icons/react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import UpdatePopup from '../../../components/Popup/UpdatePopup';
import CancelPopup from '../../../components/Popup/CancelPopup';

const ReciptUpdate = () => {
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
    const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
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
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/payment-modes`, { headers });
                const result = await response.json();
                
                if (result.status && result.data) {
                    const options = result.data.map(mode => ({
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
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/bank_account_details`, { headers });
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
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/receipts/${id}`, { headers });
                const result = await response.json();
                
                if (result.status && result.data) {
                    const data = result.data;
                    setReceiptData({
                        vendor_name: data.po_header?.vendor?.name || '',
                        grn_inspection_number: data.grn_inspection_header?.grn_inspection_number || '',
                        inspection_date: data.grn_inspection_header?.created_date ? new Date(data.grn_inspection_header.created_date).toLocaleDateString('en-GB') : '',
                        total_invoice_amount: data.grn_inspection_header?.net_value || '0.00',
                        paid_amount: data.grn_inspection_header?.paid_amount || '0.00',
                        balance_amount: data.grn_inspection_header?.balance || '0.00',
                        original_receipt_amount: parseFloat(data.amount_paid || 0),
                        raw_data: data
                    });
                    setAmount(data.amount_paid || '');
                    setDocumentNumber(data.document_number || '');
                    setDocumentDate(data.document_date ? data.document_date.split('T')[0] : '');
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
    }, [id]);

    useEffect(() => {
        if (receiptData?.raw_data && paymentModeOptions.length > 0) {
            const mode = paymentModeOptions.find(m => m.value == receiptData.raw_data.payment_mode);
            if (mode) setSelectedPaymentMode(mode);
        }
    }, [receiptData, paymentModeOptions]);

    useEffect(() => {
        if (receiptData?.raw_data && bankOptions.length > 0 && receiptData.raw_data.bank_id) {
            const bank = bankOptions.find(b => b.value == receiptData.raw_data.bank_id);
            if (bank) setSelectedBank(bank);
        }
    }, [receiptData, bankOptions]);

    const maxAllowedAmount = receiptData ? (parseFloat(receiptData.balance_amount) + receiptData.original_receipt_amount) : 0;
    
    // For calculating current balance, if amount goes UP, balance goes DOWN
    const baseBalance = receiptData ? parseFloat(receiptData.balance_amount || 0) : 0;
    const originalAmount = receiptData ? receiptData.original_receipt_amount : 0;
    const enteredAmount = parseFloat(amount || 0);
    const difference = enteredAmount - originalAmount;
    const currentBalance = (baseBalance - difference).toFixed(2);

    const handleAmountChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            setAmount('');
            setErrors(prev => ({...prev, amount: false}));
            return;
        }
        
        const numVal = parseFloat(val);
        if (numVal > maxAllowedAmount) {
            setToastMessage(`Amount cannot exceed the max allowable amount of ${maxAllowedAmount}`);
            setAmount(maxAllowedAmount.toString());
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
                amount: parseFloat(amount),
                payment_mode: selectedPaymentMode?.value,
                bank_account_id: selectedBank?.value || null,
                document_number: documentNumber,
                document_date: documentDate,
                remark: remark
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/receipt-single/${id}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (response.ok && data.status) {
                navigate('/inventory/further-receipt');
            } else {
                setToastMessage(data.message || 'Failed to update payment.');
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

    const handleCancelClick = () => {
        setIsCancelPopupOpen(true);
    };

    const confirmCancelReceipt = async () => {
        setIsCancelPopupOpen(false);
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/receipts/${id}/cancel`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });

            const data = await response.json();
            
            if (response.ok && data.status) {
                navigate('/inventory/further-receipt');
            } else {
                setToastMessage(data.message || 'Failed to cancel payment.');
                setTimeout(() => setToastMessage(''), 4000);
            }
        } catch (error) {
            console.error(error);
            setToastMessage('An error occurred while canceling.');
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
            <UpdatePopup 
                isOpen={isSubmitPopupOpen} 
                onClose={() => setIsSubmitPopupOpen(false)} 
                onConfirm={handleConfirmSubmit} 
            />
            <CancelPopup
                isOpen={isCancelPopupOpen}
                onClose={() => setIsCancelPopupOpen(false)}
                onConfirm={confirmCancelReceipt}
            />
            <section className="content">
                <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Update Receipt</h3>
                        <div className="d-flex align-items-center gap-2">
                            <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/further-receipt/${id}`, '_blank')}>
                                <Printer size={18} weight="bold" />
                            </button>
                            <button className="btn-header-back m-0" onClick={() => navigate('/inventory/further-receipt')}>Back</button>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleFormSubmit}>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Vendor Name</label>
                                    <input type="text" className="form-control" value={receiptData?.vendor_name || ''} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Date</label>
                                    <input type="date" className="form-control" value={receiptData?.raw_data?.created_date ? receiptData.raw_data.created_date.split('T')[0] : ''} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Grn Inspection Number</label>
                                    <input type="text" className="form-control" value={receiptData?.grn_inspection_number || ''} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Inspection Date</label>
                                    <input type="text" className="form-control" value={receiptData?.inspection_date || ''} readOnly />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Total Invoice Amount</label>
                                    <input type="text" className="form-control" value={receiptData?.total_invoice_amount || '0.00'} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>GRN Paid Amount (Total)</label>
                                    <input type="text" className="form-control" value={receiptData?.paid_amount || '0.00'} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>GRN Balance Amount</label>
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
                                    <label>Estimated New Balance</label>
                                    <input type="text" className="form-control text-primary fw-bold" value={currentBalance} readOnly />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Remark</label>
                                    <input type="text" className="form-control" placeholder="Remark" value={remark} onChange={(e) => setRemark(e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="form-actions mt-3 d-flex justify-content-between">
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn-cancel" onClick={() => navigate('/inventory/further-receipt')}>Back</button>
                                    <button type="button" className="btn btn-danger" onClick={handleCancelClick}>Cancel Receipt</button>
                                </div>
                                <button type="submit" className="btn-save">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
};

export default ReciptUpdate;
