import { useState } from 'react';

const Footer = () => {
    const [loggingOut, setLoggingOut] = useState(false);

    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            await fetch(`${API_BASE}/api/roles/users/logout`, {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch {
            // proceed with local logout even if the API call fails
        } finally {
            sessionStorage.removeItem('erp_auth');
            sessionStorage.removeItem('erp_token');
            sessionStorage.removeItem('erp_user');
            sessionStorage.removeItem('erp_login_date');
            
            localStorage.removeItem('erp_auth');
            localStorage.removeItem('erp_token');
            localStorage.removeItem('erp_user');
            
            window.location.href = '/login';
        }
    };

    return (
        <>
            <footer className="main-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>&copy; {new Date().getFullYear()} All Rights Reserved by <strong style={{ color: '#333333' }}>Teriffic</strong></span>
                <span>Crafted by <a href="https://ahattrickz.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#333333', textDecoration: 'none', fontWeight: 600 }}>Ahattrickz Info Tech</a></span>
            </footer>

            {/* Logout Modal */}
            <div className="modal fade" id="logoutModal" tabIndex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 380 }}>
                    <div className="modal-content" style={{ border: 'none', borderRadius: 24, overflow: 'hidden', boxShadow: 'none' }}>

                        {/* Teal header */}
                        <div style={{ background: 'var(--primary-bg, linear-gradient(135deg,#22C1C3,#1aa8aa))', padding: '32px 28px 24px', textAlign: 'center', position: 'relative' }}>
                            <button type="button" data-bs-dismiss="modal" aria-label="Close" style={{
                                position: 'absolute', top: 14, right: 16,
                                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                                width: 30, height: 30, cursor: 'pointer', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, lineHeight: 1,
                            }}>×</button>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '2px solid rgba(255,255,255,0.35)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                            </div>
                            <h5 style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: 0, letterSpacing: '0.01em' }}>Confirm Logout</h5>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '6px 0 0' }}>Terrific ERP</p>
                        </div>

                        {/* Body */}
                        <div style={{ background: '#fff', padding: '28px 28px 8px', textAlign: 'center' }}>
                            <p style={{ color: '#475569', fontSize: 15, fontWeight: 500, margin: 0 }}>Are you sure you want to log out?</p>
                            <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>You will need to sign in again to access your account.</p>
                        </div>

                        {/* Footer buttons */}
                        <div style={{ background: '#fff', padding: '16px 28px 28px', display: 'flex', gap: 12 }}>
                            <button type="button" data-bs-dismiss="modal" style={{
                                flex: 1, padding: '12px', borderRadius: 50, border: '2px solid var(--primary-color, #22C1C3)',
                                background: '#fff', color: 'var(--primary-color, #22C1C3)', fontWeight: 700, fontSize: 14,
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background='var(--primary-color, #22C1C3)'; e.currentTarget.style.color='#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='var(--primary-color, #22C1C3)'; }}
                            >Cancel</button>
                            <button type="button" onClick={handleLogout} disabled={loggingOut} style={{
                                flex: 1, padding: '12px', borderRadius: 50, border: 'none',
                                background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff',
                                fontWeight: 700, fontSize: 14, cursor: loggingOut ? 'not-allowed' : 'pointer',
                                opacity: loggingOut ? 0.75 : 1, boxShadow: 'none',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { if (!loggingOut) e.currentTarget.style.transform='translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}
                            >{loggingOut ? 'Logging out…' : 'Logout'}</button>
                        </div>

                    </div>
                </div>
            </div>
            
        </>
    );
};

export default Footer;
