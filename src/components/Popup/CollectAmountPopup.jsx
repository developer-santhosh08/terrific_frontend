import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const CollectAmountPopup = ({ isOpen, onClose, onConfirm, bankOptions, defaultBankId, amount }) => {
    const [selectedBank, setSelectedBank] = useState(null);

    useEffect(() => {
        if (isOpen) {
            // Pre-select if we have a default bank id
            if (defaultBankId && bankOptions && bankOptions.length > 0) {
                const found = bankOptions.find(b => String(b.value) === String(defaultBankId));
                setSelectedBank(found || null);
            } else {
                setSelectedBank(null);
            }
        }
    }, [isOpen, defaultBankId, bankOptions]);

    if (!isOpen) return null;

    const handleCollect = () => {
        if (!selectedBank) {
            alert("Please select a bank to collect the amount.");
            return;
        }
        onConfirm(selectedBank.value);
    };

    return (
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
            `}</style>

            {/* Overlay */}
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }} />

            {/* Card */}
            <div className="collect-popup-box" style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 420, padding: '36px 32px 28px', boxShadow: '0 25px 60px rgba(0,0,0,0.22)', border: '1.5px solid #bbf7d0' }}>

                {/* Icon circle */}
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(34,197,94,0.25)' }}>
                    <span style={{ fontSize: '32px', fontWeight: '600', color: '#22c55e' }}>₹</span>
                </div>

                {/* Text */}
                <h5 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a', marginBottom: 8, textAlign: 'center' }}>Collect Amount</h5>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
                    You are collecting <strong>{amount}</strong>.<br/>
                    Please confirm the Bank Account.
                </p>

                {/* Bank Select */}
                <div style={{ marginBottom: 28, textAlign: 'left' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: 6, display: 'block' }}>Bank Name</label>
                    <Select
                        options={bankOptions}
                        value={selectedBank}
                        onChange={(opt) => setSelectedBank(opt)}
                        placeholder="Choose Bank Name..."
                        menuPosition="fixed"
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f5f9', marginBottom: 22 }} />

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                        className="collect-btn-cancel"
                        onClick={onClose}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s' }}
                    >
                        Close
                    </button>
                    <button
                        className="collect-btn-action"
                        onClick={handleCollect}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#22c55e', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}
                    >
                        Collect
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CollectAmountPopup;
