import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { useLoader } from '../../../context/LoaderContext';

import UpdatePopup from '../../../components/Popup/UpdatePopup';
import CancelPopup from '../../../components/Popup/CancelPopup';
import SuccessPopup from '../../../components/Popup/SuccessPopup';
import ErrorPopup from '../../../components/Popup/ErrorPopup';

const AdvancedReciptEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setLoading } = useLoader();

    const [receiptData, setReceiptData] = useState(null);
    const [paymentMode, setPaymentMode] = useState('');
    const [amount, setAmount] = useState('');
    const [remark, setRemark] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [documentDate, setDocumentDate] = useState('');
    const [bank, setBank] = useState('');

    const [paymentModeOptions, setPaymentModeOptions] = useState([]);
    const [bankOptions, setBankOptions] = useState([]);

    // Popup states
    const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
    const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                const [pmRes, bankRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/payment-mode`, { headers }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/bank`, { headers })
                ]);
                const pmJson = await pmRes.json();
                const bankJson = await bankRes.json();

                if (pmJson.status && pmJson.data) {
                    setPaymentModeOptions(pmJson.data.filter(p => p.status === 1).map(p => ({ label: p.name, value: p.id.toString(), originalName: p.name })));
                }
                if (bankJson.status && bankJson.data) {
                    setBankOptions(bankJson.data.filter(b => b.status === 1).map(b => ({ label: b.name, value: b.id.toString() })));
                }
            } catch (err) {
                console.error("Error fetching dependencies", err);
            }
        };

        fetchDependencies();
    }, []);

    useEffect(() => {
        const fetchReceiptData = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/advance-receipt/edit/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const result = await response.json();
                if (result.status && result.data) {
                    const data = result.data;
                    setReceiptData(data);
                    setPaymentMode(data.payment_mode ? data.payment_mode.toString() : '');
                    setAmount(data.amount || '');
                    setRemark(data.remark || '');
                    setDocumentNumber(data.document_number || '');
                    setDocumentDate(data.document_date || '');
                    setBank(data.bank_id ? data.bank_id.toString() : '');
                } else {
                    setErrorMessage('Error fetching receipt data');
                }
            } catch (error) {
                console.error("Error fetching receipt edit data:", error);
                setErrorMessage('Error connecting to server.');
            } finally {
                setLoading(false);
            }
        };
        fetchReceiptData();
    }, [id, setLoading]);

    const handleUpdateClick = () => {
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            setErrorMessage("Please enter a valid amount.");
            return;
        }

        const selectedModeObj = paymentModeOptions.find(opt => opt.value === paymentMode);
        const isCash = selectedModeObj && selectedModeObj.originalName.toLowerCase() === 'cash';

        if (!isCash) {
            if (!documentNumber || !documentDate || !bank) {
                setErrorMessage("Please fill in Document Number, Document Date, and Bank for non-cash payments.");
                return;
            }
        }
        
        setIsUpdatePopupOpen(true);
    };

    const submitUpdate = async () => {
        setLoading(true);
        try {
            const selectedModeObj = paymentModeOptions.find(opt => opt.value === paymentMode);
            const isCash = selectedModeObj && selectedModeObj.originalName.toLowerCase() === 'cash';

            const token = sessionStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/advance-receipt/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    amount,
                    payment_mode: paymentMode,
                    document_number: isCash ? '' : documentNumber,
                    document_date: isCash ? '' : documentDate,
                    bank_id: isCash ? '' : bank,
                    remark
                })
            });
            const result = await response.json();
            if (result.status) {
                navigate('/sales/advanced-receipt');
            } else {
                setErrorMessage(result.message || 'Failed to update receipt.');
            }
        } catch (error) {
            console.error("Error updating receipt:", error);
            setErrorMessage("An error occurred while updating the receipt.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = () => {
        setIsCancelPopupOpen(true);
    };

    const submitCancelReceipt = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/advance-receipt/cancel/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const result = await response.json();
            if (result.status) {
                navigate('/sales/advanced-receipt');
            } else {
                setErrorMessage(result.message || 'Failed to cancel receipt.');
            }
        } catch (error) {
            console.error("Error cancelling receipt:", error);
            setErrorMessage("An error occurred while cancelling the receipt.");
        } finally {
            setLoading(false);
            setIsCancelPopupOpen(false);
        }
    };

    const handleSuccessClose = () => {
        setSuccessMessage('');
        navigate('/sales/advanced-receipt');
    };

    const handleErrorClose = () => {
        setErrorMessage('');
    };

    if (!receiptData) return null;

    const isCancelled = receiptData.status == 0;
    const selectedModeObj = paymentModeOptions.find(opt => opt.value === paymentMode);
    const isCash = selectedModeObj ? selectedModeObj.originalName.toLowerCase() === 'cash' : false;

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card tw-mb-0 tw-bg-white tw-shadow-sm tw-rounded-md tw-overflow-hidden">
                    
                    {/* Header */}
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-center tw-gap-3 sm:tw-gap-0">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Edit Advance Receipt</h3>
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
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{receiptData.customer_name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Receipt Number</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{receiptData.receipt_number}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Receipt Date</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{receiptData.receipt_date}</span>
                            </div>
                        </div>

                        {/* Total Footer */}
                        <div className="tw-px-4 tw-py-3 tw-border-b tw-border-gray-200 tw-flex tw-justify-end tw-items-center tw-gap-4">
                            <span className="tw-font-bold tw-text-gray-800">Total Enquiry Amount :</span>
                            <span className="tw-font-bold tw-text-gray-800 tw-w-32 tw-text-right">{receiptData.total_enquiry_amount}</span>
                        </div>

                        {/* Form Section */}
                        <div className="tw-p-6">
                            {isCancelled && (
                                <div className="alert alert-danger tw-mb-6">
                                    This advance receipt has been cancelled and cannot be edited.
                                </div>
                            )}

                            <div className="row tw-mb-4">
                                <div className="col-md-4 form-group">
                                    <label className="tw-text-gray-600">Payment Mode</label>
                                    <Select
                                        options={paymentModeOptions}
                                        value={paymentModeOptions.find(opt => opt.value === paymentMode) || null}
                                        onChange={(opt) => setPaymentMode(opt.value)}
                                        placeholder="Select Payment Mode"
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        menuPortalTarget={document.body}
                                        isDisabled={isCancelled}
                                    />
                                </div>
                                {!isCash && (
                                    <>
                                        <div className="col-md-4 form-group">
                                            <label className="tw-text-gray-600">Document Number</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="Document Number" 
                                                value={documentNumber}
                                                onChange={(e) => setDocumentNumber(e.target.value)}
                                                disabled={isCancelled}
                                            />
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <label className="tw-text-gray-600">Document Date</label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                value={documentDate}
                                                onChange={(e) => setDocumentDate(e.target.value)}
                                                disabled={isCancelled}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <div className="row tw-mb-6">
                                {!isCash && (
                                    <div className="col-md-4 form-group">
                                        <label className="tw-text-gray-600">Bank</label>
                                        <Select
                                            options={bankOptions}
                                            value={bankOptions.find(opt => opt.value === bank) || null}
                                            onChange={(opt) => setBank(opt.value)}
                                            placeholder="Select Bank"
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            menuPortalTarget={document.body}
                                            isDisabled={isCancelled}
                                        />
                                    </div>
                                )}
                                <div className="col-md-4 form-group">
                                    <label className="tw-text-gray-600">Amount</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Amount" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        disabled={isCancelled}
                                    />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label className="tw-text-gray-600">Remark</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Remark" 
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        disabled={isCancelled}
                                    />
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="tw-mt-8 tw-mb-4 tw-flex tw-justify-between">
                                <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Back</button>
                                
                                <div className="tw-flex tw-gap-4">
                                    {!isCancelled && (
                                        <>
                                            <button 
                                                type="button" 
                                                className="btn btn-danger tw-px-6" 
                                                onClick={handleCancelClick}
                                            >
                                                Cancel Receipt
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn-save" 
                                                onClick={handleUpdateClick}
                                            >
                                                Update
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <UpdatePopup
                isOpen={isUpdatePopupOpen}
                onClose={() => setIsUpdatePopupOpen(false)}
                onConfirm={submitUpdate}
            />
            
            <CancelPopup
                isOpen={isCancelPopupOpen}
                onClose={() => setIsCancelPopupOpen(false)}
                onConfirm={submitCancelReceipt}
            />

            <SuccessPopup
                isOpen={!!successMessage}
                message={successMessage}
                onClose={handleSuccessClose}
            />

            <ErrorPopup
                isOpen={!!errorMessage}
                message={errorMessage}
                onClose={handleErrorClose}
            />
        </section>
    );
};

export default AdvancedReciptEdit;
