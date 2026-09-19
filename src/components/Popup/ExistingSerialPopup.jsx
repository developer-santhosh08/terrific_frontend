import React from 'react';

const ExistingSerialPopup = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`
                @keyframes popIn {
                    0%  { opacity: 0; transform: scale(0.85) translateY(20px); }
                    100%{ opacity: 1; transform: scale(1) translateY(0); }
                }
                .serial-popup-box {
                    animation: popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                .serial-btn-ok:hover  { background: #d97706 !important; }
            `}</style>

            {/* Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }} />

            {/* Card */}
            <div className="serial-popup-box" style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 380, padding: '36px 32px 28px', boxShadow: '0 25px 60px rgba(0,0,0,0.22)', textAlign: 'center', border: '1.5px solid #fef08a' }}>

                {/* Icon circle */}
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#fef9c3,#fef08a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(234,179,8,0.25)' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>

                {/* Text */}
                <h5 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a', margin: '0 0 8px' }}>Warning</h5>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 28px', whiteSpace: 'pre-wrap' }}>
                    {message}
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                        className="serial-btn-ok"
                        onClick={onClose}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#eab308', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 4px 14px rgba(234,179,8,0.35)' }}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExistingSerialPopup;
