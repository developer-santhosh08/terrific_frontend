import React from 'react';

const SuccessPopup = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`
                @keyframes popIn {
                    0%  { opacity: 0; transform: scale(0.85) translateY(20px); }
                    100%{ opacity: 1; transform: scale(1) translateY(0); }
                }
                .success-popup-box {
                    animation: popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                .success-btn-ok:hover  { background: #15803d !important; }
            `}</style>

            {/* Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }} />

            {/* Card */}
            <div className="success-popup-box" style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 380, padding: '36px 32px 28px', boxShadow: '0 25px 60px rgba(0,0,0,0.22)', textAlign: 'center', border: '1.5px solid #bbf7d0' }}>

                {/* Icon circle */}
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(22,163,74,0.25)' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </div>

                {/* Text */}
                <h5 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a', margin: '0 0 8px' }}>Success</h5>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 28px', whiteSpace: 'pre-wrap' }}>
                    {message}
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                        className="success-btn-ok"
                        onClick={onClose}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessPopup;
