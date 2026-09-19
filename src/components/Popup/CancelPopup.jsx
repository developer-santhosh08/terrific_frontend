import React from 'react';

const CancelPopup = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`
                @keyframes popIn {
                    0%  { opacity: 0; transform: scale(0.85) translateY(20px); }
                    100%{ opacity: 1; transform: scale(1) translateY(0); }
                }
                .confirm-popup-box-cancel {
                    animation: popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                .confirm-btn-cancel-close:hover  { background: #e2e8f0 !important; }
                .confirm-btn-cancel-action:hover { background: #dc2626 !important; }
            `}</style>

            {/* Overlay */}
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }} />

            {/* Card */}
            <div className="confirm-popup-box-cancel" style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 400, padding: '36px 32px 28px', boxShadow: '0 25px 60px rgba(0,0,0,0.22)', textAlign: 'center', border: '1.5px solid #fecaca' }}>

                {/* Icon circle */}
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#fee2e2,#fca5a5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(239,68,68,0.25)' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                </div>

                {/* Text */}
                <h5 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a', marginBottom: 8 }}>Cancel Receipt</h5>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 28 }}>
                    Are you sure you want to <strong style={{ color: '#ef4444' }}>cancel</strong> this receipt?<br />
                    This action will revert the amount back to the Purchase Order and refund the Bank Account.
                </p>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f5f9', marginBottom: 22 }} />

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                        className="confirm-btn-cancel-close"
                        onClick={onClose}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s' }}
                    >
                        Close
                    </button>
                    <button
                        className="confirm-btn-cancel-action"
                        onClick={onConfirm}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
                    >
                        Yes, Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CancelPopup;
