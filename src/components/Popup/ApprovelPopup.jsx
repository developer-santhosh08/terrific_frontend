import React, { useState } from 'react';

const ApprovelPopup = ({ isOpen, receiptId, onClose, onSubmit, defaultAmount }) => {
    const [actualAmount, setActualAmount] = useState('200000.00');
    const [collectedAmount, setCollectedAmount] = useState('200000.00');
    const [accountHolder, setAccountHolder] = useState('');

    const [receiptData, setReceiptData] = useState(null);
    const [bankOptions, setBankOptions] = useState([]);

    React.useEffect(() => {
        const fetchBanks = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                // Fetch banks for the account holder dropdown
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/bank_account_details`, { headers });
                const result = await response.json();
                if (result.status && result.data) {
                    setBankOptions(result.data);
                } else if (Array.isArray(result)) {
                    setBankOptions(result);
                }
            } catch (error) {
                console.error("Error fetching banks:", error);
            }
        };
        fetchBanks();
    }, []);

    React.useEffect(() => {
        const fetchReceipt = async () => {
            if (isOpen && receiptId) {
                if (defaultAmount !== undefined) {
                    setActualAmount(defaultAmount);
                    setCollectedAmount(defaultAmount);
                    setAccountHolder('');
                    return;
                }
                try {
                    const token = sessionStorage.getItem('token');
                    const headers = {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    };
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/receipts/${receiptId}`, { headers });
                    const result = await response.json();
                    if (result.status && result.data) {
                        setReceiptData(result.data);
                        const amount = result.data.amount_paid || '0.00';
                        setActualAmount(amount);
                        setCollectedAmount(amount);
                    }
                } catch (error) {
                    console.error("Error fetching receipt:", error);
                }
            } else {
                setActualAmount('');
                setCollectedAmount('');
            }
        };
        fetchReceipt();
    }, [isOpen, receiptId, defaultAmount]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit({ receiptId, actualAmount, collectedAmount });
        }
        onClose();
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'transparent' }}>
            <style>{`
                .modal-dialog { margin: 24px auto; }
                .modal-content { box-sizing: border-box; }
                .approval-form-label {
                    color: #1f2937;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 6px;
                    display: inline-block;
                }
            `}</style>
            <div className="modal-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
            <div className="modal-dialog" style={{ zIndex: 1060, maxWidth: '800px', width: 'calc(100% - 40px)', boxSizing: 'border-box' }}>
                <div className="modal-content p-0" style={{ position: 'relative', borderRadius: 8, border: '2px solid #3b82f6', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden', backgroundColor: '#fff' }}>
                    
                    <div className="d-flex p-4 pb-0" style={{ position: 'relative', alignItems: 'center' }}>
                        <h5 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, flex: 1, color: '#1f2937' }}>Apporaval</h5>
                        <button type="button" aria-label="Close" onClick={onClose} style={{background:'#ef4444',border:'none',color:'#fff',fontSize:'1.2rem',width:36,height:36,display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',cursor:'pointer', lineHeight: 1}}>×</button>
                    </div>

                    <div className="modal-body p-4 p-md-4">
                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <label className="approval-form-label">Actual Amount</label>
                                <input type="text" className="form-control" value={actualAmount} disabled readOnly />
                            </div>
                            
                            <div className="col-md-6 mb-4">
                                <label className="approval-form-label">Collected Amount</label>
                                <input type="text" className="form-control" value={collectedAmount} onChange={e => setCollectedAmount(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-footer d-flex justify-content-between" style={{ padding: '16px 24px', backgroundColor: '#fff', borderTop: 'none', marginBottom: '8px' }}>
                        <div>
                            <button type="button" className="btn px-4 py-2" onClick={onClose} style={{ backgroundColor: '#f59e0b', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 6 }}>Close</button>
                        </div>
                        <div>
                            <button type="button" className="btn px-4 py-2" onClick={handleSubmit} style={{ backgroundColor: '#22c55e', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 6 }}>Submit</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ApprovelPopup;
