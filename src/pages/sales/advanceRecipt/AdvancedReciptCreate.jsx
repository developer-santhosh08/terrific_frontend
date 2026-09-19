import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../components/Popup/SubmitPopup';
import { useLoader } from '../../../context/LoaderContext';



const AdvancedReciptCreate = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setLoading } = useLoader();

    const currentDate = new Date().toISOString().split('T')[0];

    const [paymentMode, setPaymentMode] = useState(null);
    const [amount, setAmount] = useState('');
    const [remark, setRemark] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [documentDate, setDocumentDate] = useState('');
    const [bank, setBank] = useState(null);
    const [bankOptions, setBankOptions] = useState([]);
    const [paymentModeOptions, setPaymentModeOptions] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
    const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);

    const [headerData, setHeaderData] = useState({
        customerName: '',
        enquiryDate: '',
        paidAmount: '0.00',
        totalAmount: '0.00',
        balanceAmount: '0.00'
    });
    const [products, setProducts] = useState([]);
    const [receipts, setReceipts] = useState([]);

    const enteredAmount = parseFloat(amount) || 0;
    const initialBalance = parseFloat(headerData.balanceAmount) || 0;
    const currentBalance = (initialBalance - enteredAmount).toFixed(2);

    const handleSubmit = () => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            setToastMessage('Please enter a valid amount.');
            setTimeout(() => setToastMessage(''), 4000);
            return;
        }

        if (parseFloat(amount) > initialBalance) {
            setToastMessage('Amount cannot exceed the current balance.');
            setTimeout(() => setToastMessage(''), 4000);
            return;
        }

        const selectedMode = paymentModeOptions.find(opt => opt.value === paymentMode);
        if (selectedMode && selectedMode.label.toLowerCase() !== 'cash') {
            if (!documentNumber || !documentDate || !bank) {
                setToastMessage('Please fill in Document Number, Document Date, and Bank for non-cash payments.');
                setTimeout(() => setToastMessage(''), 4000);
                return;
            }
        }

        setIsSubmitPopupOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitPopupOpen(false);
        setLoading(true);
        
        const payload = {
            payment_mode: paymentMode,
            amount: amount,
            remark: remark,
            document_number: documentNumber,
            document_date: documentDate,
            bank_id: bank
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/advance-payments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await response.json();
            if (json.status) {
                navigate('/sales/advanced-receipt');
            } else {
                setToastMessage(json.message || 'Failed to submit advance receipt.');
                setTimeout(() => setToastMessage(''), 4000);
            }
        } catch (e) {
            console.error(e);
            setToastMessage('An error occurred while submitting.');
            setTimeout(() => setToastMessage(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        setLoading(true);
        
        const fetchBanks = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/bank`)
            .then(res => res.json())
            .then(json => {
                if (json.status && json.data) {
                    const activeBanks = json.data.filter(b => b.status === 1);
                    setBankOptions(activeBanks.map(b => ({ label: b.name, value: b.id })));
                }
            })
            .catch(err => console.error(err));

        const fetchModes = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/payment-mode`)
            .then(res => res.json())
            .then(json => {
                if (json.status && json.data) {
                    const activeModes = json.data.filter(p => p.status === 1);
                    setPaymentModeOptions(activeModes.map(p => ({ label: p.name, value: p.id })));
                    
                    const cashOpt = activeModes.find(p => p.name.toLowerCase() === 'cash');
                    if (cashOpt) setPaymentMode(cashOpt.id);
                }
            })
            .catch(err => console.error(err));

        const fetchDetails = id ? fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/advance-payments/${id}`)
            .then(res => res.json())
            .then(json => {
                if (json.status && json.data) {
                    setHeaderData({
                        customerName: json.data.customer_name || '',
                        enquiryDate: json.data.enquiry_date || '',
                        paidAmount: (parseFloat(json.data.paid_amount) || 0).toFixed(2),
                        totalAmount: (parseFloat(json.data.total_amount) || 0).toFixed(2),
                        balanceAmount: (parseFloat(json.data.balance_amount) || 0).toFixed(2)
                    });
                    setProducts(json.data.products || []);
                    setReceipts(json.data.receipts || []);
                }
            })
            .catch(err => console.error(err)) : Promise.resolve();

        Promise.all([fetchBanks, fetchModes, fetchDetails]).finally(() => {
            setLoading(false);
        });
    }, [id]);

    return (
        <>
            {toastMessage && createPortal(
                <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 999999, background: '#dc2626', color: 'white', padding: '12px 20px', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-exclamation-circle"></i> <span>{toastMessage}</span>
                    <button onClick={() => setToastMessage('')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '15px', fontSize: '18px', display: 'flex', alignItems: 'center', padding: 0 }} title="Close">
                        <i className="fas fa-times"></i>
                    </button>
                </div>,
                document.body
            )}
            <div className="tw-bg-gray-100 tw-min-h-screen">
                <section className="content">
            <div className="container-fluid">
                <div className="card tw-mb-0 tw-bg-white tw-shadow-sm tw-rounded-md tw-overflow-hidden">
                    
                    {/* Header */}
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-center tw-gap-3 sm:tw-gap-0">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Add Advance Receipt</h3>
                        <button className="btn-header-back" onClick={() => navigate(-1)}>Back</button>
                    </div>

                    <div className="card-body">
                        {/* Blue Info Header */}
                        <div
                            className="tw-mb-5"
                            style={{
                                background: '#cce9f7', borderRadius: 6,
                                padding: '14px 24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Customer Name</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{headerData.customerName}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Enquiry Date</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{headerData.enquiryDate}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Paid Amount</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{headerData.paidAmount}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Date<span className="tw-text-red-500">*</span></span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <input
                                    type="date"
                                    className="form-control"
                                    defaultValue={currentDate}
                                    style={{ width: '160px' }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="tw-mb-5 tw-mt-2">
                            {/* Desktop Table */}
                            <div className="tw-hidden md:tw-block tw-overflow-x-auto">
                                <table className="table table-bordered tw-mb-0 tw-min-w-full">
                                    <thead className="tw-bg-gray-50">
                                        <tr>
                                            <th className="tw-py-3 tw-px-4 tw-text-gray-700 tw-font-semibold tw-align-middle">S.No</th>
                                            <th className="tw-py-3 tw-px-4 tw-text-gray-700 tw-font-semibold tw-align-middle">Product Name</th>
                                            <th className="tw-py-3 tw-px-4 tw-text-gray-700 tw-font-semibold tw-align-middle">Quantity</th>
                                            <th className="tw-py-3 tw-px-4 tw-text-gray-700 tw-font-semibold tw-align-middle">Rate</th>
                                            <th className="tw-py-3 tw-px-4 tw-text-gray-700 tw-font-semibold tw-align-middle tw-text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((item, index) => (
                                            <tr key={index}>
                                                <td className="tw-py-3 tw-px-4 tw-align-middle">{index + 1}</td>
                                                <td className="tw-py-3 tw-px-4 tw-align-middle">{item.product_name}</td>
                                                <td className="tw-py-3 tw-px-4 tw-align-middle">{item.quantity}</td>
                                                <td className="tw-py-3 tw-px-4 tw-align-middle">{parseFloat(item.rate).toFixed(2)}</td>
                                                <td className="tw-py-3 tw-px-4 tw-align-middle tw-text-right">{parseFloat(item.amount).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        {products.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="tw-py-4 tw-text-center tw-text-gray-500">No products found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:tw-hidden tw-flex tw-flex-col tw-gap-3 tw-bg-gray-50/50 tw-p-2">
                                {products.map((item, index) => (
                                    <div key={index} className="tw-border tw-border-gray-200 tw-rounded-md tw-p-4 tw-bg-white tw-shadow-sm">
                                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                                            <span className="tw-text-xs tw-text-gray-400 tw-font-semibold">#{index + 1}</span>
                                        </div>
                                        <div className="tw-mb-4">
                                            <div className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-mb-1">Product Name</div>
                                            <div className="tw-text-sm tw-font-semibold tw-text-gray-800">{item.product_name}</div>
                                        </div>
                                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
                                            <div>
                                                <div className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-mb-1">Quantity</div>
                                                <div className="tw-text-sm tw-font-medium">{item.quantity}</div>
                                            </div>
                                            <div className="tw-text-right">
                                                <div className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-mb-1">Rate</div>
                                                <div className="tw-text-sm tw-font-medium">{parseFloat(item.rate).toFixed(2)}</div>
                                            </div>
                                        </div>
                                        <div className="tw-pt-3 tw-border-t tw-border-gray-100 tw-flex tw-justify-between tw-items-center">
                                            <div className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Amount</div>
                                            <div className="tw-text-sm tw-font-bold tw-text-blue-600">₹{parseFloat(item.amount).toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                                {products.length === 0 && (
                                    <div className="tw-text-center tw-py-6 tw-text-sm tw-text-gray-500 tw-bg-white tw-rounded tw-border tw-border-gray-100">No products found</div>
                                )}
                            </div>
                        </div>

                        {/* Totals & Form */}
                        <div className="tw-mt-4">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card p-3 tw-h-full">
                                        <div className="row tw-mb-4">
                                            <label className="col-md-4 tw-text-gray-600 tw-mt-1">Payment Mode</label>
                                            <div className="col-md-8">
                                                <Select
                                                    options={paymentModeOptions}
                                                    value={paymentModeOptions.find(opt => opt.value === paymentMode) || null}
                                                    onChange={(opt) => setPaymentMode(opt ? opt.value : null)}
                                                    placeholder="Select Payment Mode"
                                                    isClearable
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                    menuPortalTarget={document.body}
                                                />
                                            </div>
                                        </div>
                                        <div className="row tw-mb-4">
                                            <label className="col-md-4 tw-text-gray-600 tw-mt-2">Amount</label>
                                            <div className="col-md-8">
                                                <input 
                                                    type="number" 
                                                    className="form-control" 
                                                    placeholder="Amount" 
                                                    value={amount}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (parseFloat(val) > initialBalance) {
                                                            val = initialBalance;
                                                            setToastMessage('Amount cannot exceed the current balance.');
                                                            setTimeout(() => setToastMessage(''), 4000);
                                                        }
                                                        setAmount(val);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="row tw-mb-4">
                                            <label className="col-md-4 tw-text-gray-600 tw-mt-2">Remark</label>
                                            <div className="col-md-8">
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    placeholder="Remark" 
                                                    value={remark}
                                                    onChange={(e) => setRemark(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {paymentMode && paymentModeOptions.find(opt => opt.value === paymentMode)?.label.toLowerCase() !== 'cash' && (
                                            <>
                                                <div className="row tw-mb-4">
                                                    <label className="col-md-4 tw-text-gray-600 tw-mt-2">Document Number</label>
                                                    <div className="col-md-8">
                                                        <input 
                                                            type="text" 
                                                            className="form-control" 
                                                            placeholder="Document Number" 
                                                            value={documentNumber}
                                                            onChange={(e) => setDocumentNumber(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row tw-mb-4">
                                                    <label className="col-md-4 tw-text-gray-600 tw-mt-2">Document Date</label>
                                                    <div className="col-md-8">
                                                        <input 
                                                            type="date" 
                                                            className="form-control" 
                                                            value={documentDate}
                                                            onChange={(e) => setDocumentDate(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row tw-mb-4">
                                                    <label className="col-md-4 tw-text-gray-600 tw-mt-1">Bank</label>
                                                    <div className="col-md-8">
                                                        <Select
                                                            options={bankOptions}
                                                            value={bankOptions.find(opt => opt.value === bank) || null}
                                                            onChange={(opt) => setBank(opt ? opt.value : null)}
                                                            placeholder="Select Bank"
                                                            isClearable
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                            menuPortalTarget={document.body}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="card p-3 tw-h-full">
                                        <div className="d-flex justify-content-between py-2"><div>Total Amount</div><div style={{fontWeight: 700}}>{headerData.totalAmount}</div></div>
                                        <hr className="tw-my-2" />
                                        {receipts.map((r, i) => (
                                            <React.Fragment key={r.receipt_id}>
                                                <div className="d-flex justify-content-between py-2">
                                                    <div>Paid Date {i + 1} : <span className="tw-font-bold tw-text-gray-800 tw-ml-2">{r.created_date ? new Date(r.created_date).toLocaleDateString('en-GB') : ''}</span></div>
                                                    <div style={{fontWeight: 700, color: '#16a34a'}}>{parseFloat(r.amount_paid).toFixed(2)}</div>
                                                </div>
                                                <hr className="tw-my-2" />
                                            </React.Fragment>
                                        ))}
                                        <div className="d-flex justify-content-between py-2"><div style={{fontWeight:'bold'}}>Current Balance</div><div style={{fontWeight:'bold'}}>{headerData.balanceAmount}</div></div>
                                        <hr className="tw-my-2" />
                                        <div className="d-flex justify-content-between py-2"><div style={{fontWeight:'bold'}}>Balance Amount</div><div style={{fontWeight:'bold', color: '#dc2626'}}>{currentBalance}</div></div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="tw-mt-8 tw-mb-4 tw-flex tw-justify-between">
                                <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
                                <button type="button" className="btn-save" onClick={handleSubmit}>Submit</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
        <SubmitPopup 
            isOpen={isSubmitPopupOpen} 
            onClose={() => setIsSubmitPopupOpen(false)} 
            onConfirm={handleConfirmSubmit} 
        />
    </div>

        </>
    );
};

export default AdvancedReciptCreate;
