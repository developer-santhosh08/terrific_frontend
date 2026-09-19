import React from 'react';

const SavePopup = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`
                @keyframes popIn {
                    0%  { opacity: 0; transform: scale(0.85) translateY(20px); }
                    100%{ opacity: 1; transform: scale(1) translateY(0); }
                }
                .confirm-popup-box {
                    animation: popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                .confirm-btn-cancel:hover  { background: #e2e8f0 !important; }
                .confirm-btn-save:hover  { background: #1d4ed8 !important; }
            `}</style>

            {/* Overlay */}
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }} />

            {/* Card */}
            <div className="confirm-popup-box" style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 380, maxWidth: '90%', padding: '36px 32px 28px', boxShadow: '0 25px 60px rgba(0,0,0,0.22)', textAlign: 'center', border: '1.5px solid #bfdbfe' }}>

                {/* Icon circle */}
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#dbeafe,#93c5fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(59,130,246,0.25)' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                </div>

                {/* Text */}
                <h5 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a', marginBottom: 8 }}>Save Changes</h5>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 28 }}>
                    Are you sure you want to <strong style={{ color: '#2563eb' }}>save</strong> these permissions?<br />
                    This action will update the user rights.
                </p>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f5f9', marginBottom: 22 }} />

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                        className="confirm-btn-cancel"
                        onClick={onClose}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s' }}
                    >
                        Cancel
                    </button>
                    <button
                        className="confirm-btn-save"
                        onClick={() => { onConfirm(); onClose(); }}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}
                    >
                        Yes, Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SavePopup;
