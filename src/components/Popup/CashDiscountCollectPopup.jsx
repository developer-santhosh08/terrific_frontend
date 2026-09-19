import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const CashDiscountCollectPopup = ({ isOpen, onClose, enquiryId, cashDiscountAmount, remainingBalance, onSuccess }) => {
    const [isCollecting, setIsCollecting] = useState(false);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount(remainingBalance !== undefined ? remainingBalance : cashDiscountAmount);
        }
    }, [isOpen, remainingBalance, cashDiscountAmount]);

    if (!isOpen) return null;

    const handleCollect = async () => {
        const collectAmount = parseFloat(amount);
        if (isNaN(collectAmount) || collectAmount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const currentRemaining = parseFloat(remainingBalance !== undefined ? remainingBalance : cashDiscountAmount);
        if (collectAmount > currentRemaining + 0.01) {
            alert('Amount cannot exceed the remaining balance.');
            return;
        }

        setIsCollecting(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/cash-discount/collect/${enquiryId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: collectAmount })
            });
            const json = await res.json();
            
            if (json.status === 'success') {
                onSuccess();
            } else {
                alert(json.message || 'Failed to collect cash discount');
            }
        } catch (error) {
            console.error('Error collecting cash discount:', error);
            alert('An error occurred during collection.');
        } finally {
            setIsCollecting(false);
        }
    };

    return ReactDOM.createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`
                @keyframes popIn {
                    0%  { opacity: 0; transform: scale(0.85) translateY(20px); }
                    100%{ opacity: 1; transform: scale(1) translateY(0); }
                }
                .collect-popup-box {
                    animation: popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                .collect-btn-cancel:hover  { background: #e2e8f0 !important; }
                .collect-btn-action:hover  { background: #16a34a !important; }
                .amount-input:focus { outline: none; border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
            `}</style>

            {/* Overlay */}
            <div onClick={() => !isCollecting && onClose()} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }} />

            {/* Card */}
            <div className="collect-popup-box" style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 420, padding: '36px 32px 28px', boxShadow: '0 25px 60px rgba(0,0,0,0.22)', border: '1.5px solid #bbf7d0' }}>

                {/* Icon circle */}
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(34,197,94,0.25)' }}>
                    <span style={{ fontSize: '32px', fontWeight: '600', color: '#22c55e' }}>₹</span>
                </div>

                {/* Text */}
                <h5 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a', marginBottom: 8, textAlign: 'center' }}>Collect Amount</h5>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 16, textAlign: 'center' }}>
                    Total Discount: <strong>{cashDiscountAmount}</strong><br/>
                    Remaining Balance: <strong>{remainingBalance !== undefined ? remainingBalance : cashDiscountAmount}</strong><br/>
                    {amount && !isNaN(parseFloat(amount)) && (
                        <>New Balance: <strong>{(parseFloat(remainingBalance !== undefined ? remainingBalance : cashDiscountAmount) - parseFloat(amount)).toFixed(2)}</strong></>
                    )}
                </p>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Amount to Collect</label>
                    <input 
                        type="number" 
                        className="amount-input"
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder="Enter amount"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s' }}
                        autoFocus
                    />
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f5f9', marginBottom: 22 }} />

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                        className="collect-btn-cancel"
                        onClick={onClose}
                        disabled={isCollecting}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '0.9rem', cursor: isCollecting ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
                    >
                        Close
                    </button>
                    <button
                        className="collect-btn-action"
                        onClick={handleCollect}
                        disabled={isCollecting}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#22c55e', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: isCollecting ? 'not-allowed' : 'pointer', transition: 'background 0.15s', boxShadow: '0 4px 12px rgba(34,197,94,0.3)', opacity: isCollecting ? 0.7 : 1 }}
                    >
                        {isCollecting ? 'Collecting...' : 'Collect'}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default CashDiscountCollectPopup;
