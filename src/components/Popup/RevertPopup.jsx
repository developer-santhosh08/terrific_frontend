import { createPortal } from 'react-dom';

const RevertPopup = ({ isOpen, onClose, onConfirm, title = "Revert Confirmation", message = "Are you sure you want to <strong style={{ color: '#dc2626' }}>revert</strong> this enquiry?<br />It will be moved back to the Open Enquiries list." }) => {
    if (!isOpen) return null;
    return createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`
                @keyframes popIn {
                    0%  { opacity: 0; transform: scale(0.85) translateY(20px); }
                    100%{ opacity: 1; transform: scale(1) translateY(0); }
                }
                .confirm-popup-box-r {
                    animation: popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                .confirm-btn-cancel-r:hover { background: #e2e8f0 !important; }
                .confirm-btn-revert:hover   { background: #b91c1c !important; }
            `}</style>

            {/* Overlay */}
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }} />

            {/* Card */}
            <div className="confirm-popup-box-r" style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 380, padding: '36px 32px 28px', boxShadow: '0 25px 60px rgba(0,0,0,0.22)', textAlign: 'center', border: '1.5px solid #fecaca' }}>

                {/* Icon circle */}
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#fee2e2,#fca5a5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(220,38,38,0.25)' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 14 4 9 9 4"></polyline>
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                    </svg>
                </div>

                {/* Text */}
                <h5 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a', marginBottom: 8 }}>{title}</h5>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 28 }} dangerouslySetInnerHTML={{ __html: message }}></p>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f5f9', marginBottom: 22 }} />

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                        className="confirm-btn-cancel-r"
                        onClick={onClose}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s' }}
                    >
                        Cancel
                    </button>
                    <button
                        className="confirm-btn-revert"
                        onClick={onConfirm}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#dc2626', color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }}
                    >
                        Revert
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RevertPopup;
