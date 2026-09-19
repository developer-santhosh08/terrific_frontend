import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { usePermissions } from '../../context/PermissionContext';

const Header = () => {
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1001);
    const [isXL, setIsXL] = useState(window.innerWidth >= 1280);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [headerLogo, setHeaderLogo] = useState('/assets/images/logos.webp');

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);


    const location = useLocation();


    
    const getDismissedDynamicNotifs = () => {
        try {
            const data = JSON.parse(localStorage.getItem('dismissed_dynamic_notifs') || '{}');
            if (data.date !== new Date().toDateString()) return [];
            return data.list || [];
        } catch { return []; }
    };
    const setDismissedDynamicNotif = (id) => {
        try {
            const list = getDismissedDynamicNotifs();
            if (!list.includes(id)) list.push(id);
            localStorage.setItem('dismissed_dynamic_notifs', JSON.stringify({ date: new Date().toDateString(), list }));
        } catch {}
    };

    const fetchNotifications = async () => {
        try {
            const token = sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token') || localStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data) {
                    const dismissed = getDismissedDynamicNotifs();
                    const adjustedData = data.data.map(n => {
                        if (dismissed.includes(n.id)) {
                            return { ...n, is_read: 1 };
                        }
                        return n;
                    });
                    setNotifications(adjustedData);
                    setUnreadCount(adjustedData.filter(n => !n.is_read).length);
                }
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    const markAsRead = async (id, is_read) => {
        if (is_read) return; // already read
        try {
            const token = sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token') || localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                if (typeof id === 'string') setDismissedDynamicNotif(id);
                fetchNotifications();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async (e) => {
        if(e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (unreadCount === 0) return;
        try {
            const token = sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token') || localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAllDismissedDynamicNotifs(notifications);
                fetchNotifications();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const setAllDismissedDynamicNotifs = (notifs) => {
        try {
            const list = getDismissedDynamicNotifs();
            notifs.forEach(n => {
                if (typeof n.id === 'string' && !list.includes(n.id)) list.push(n.id);
            });
            localStorage.setItem('dismissed_dynamic_notifs', JSON.stringify({ date: new Date().toDateString(), list }));
        } catch {}
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('erp_token');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/company`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.data) {
                        const d = data.data;
                        const makeUrl = (path) => {
                            if (path.startsWith('http')) return path;
                            const base = import.meta.env.VITE_API_BASE_URL;
                            return `${base}/api/file?path=${encodeURIComponent(path)}`;
                        };
                        const lg = d.main_logo || d.company_logo || d.logo;
                        if (lg) {
                            setHeaderLogo(makeUrl(lg));
                        }
                        const fv = d.company_favicon || d.favicon;
                        if (fv) {
                            let link = document.querySelector("link[rel~='icon']");
                            if (!link) {
                                link = document.createElement('link');
                                link.rel = 'icon';
                                document.getElementsByTagName('head')[0].appendChild(link);
                            }
                            link.href = makeUrl(fv);
                        }

                        if (d.primary_color) {
                            document.documentElement.style.setProperty('--primary-color', d.primary_color);
                            document.documentElement.style.setProperty('--primary-bg', `linear-gradient(135deg, ${d.primary_color}, ${d.primary_color}dd)`);
                            localStorage.setItem('theme_primary', d.primary_color);
                        }
                        if (d.secondary_color) {
                            document.documentElement.style.setProperty('--secondary-color', d.secondary_color);
                            document.documentElement.style.setProperty('--secondary-bg', d.secondary_color + '15');
                            localStorage.setItem('theme_secondary', d.secondary_color);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch company details for header:", err);
            }
        };
        fetchCompanyDetails();

        const handleUpdate = () => {
            fetchCompanyDetails();
        };

        window.addEventListener('companyProfileUpdated', handleUpdate);
        return () => window.removeEventListener('companyProfileUpdated', handleUpdate);
    }, []);

    // User state for header from global context
    const { userHeaderData, refreshPermissions } = usePermissions();

    useEffect(() => {
        refreshPermissions();
    }, [location.pathname, refreshPermissions]);

    useEffect(() => {
        const onResize = () => {
            setIsMobile(window.innerWidth < 1001);
            setIsXL(window.innerWidth >= 1280);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = (e) => {
        e.preventDefault();
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        if (window.feather) window.feather.replace();
    }, [isFullscreen]);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setCurrentDate(now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }));
            setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const iconBtn = {
        width: 36, height: 36, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f0f0f0f0', border: '1px solid rgba(0,0,0,0.2)',
        cursor: 'pointer', color: '#000000', textDecoration: 'none', flexShrink: 0,
    };

    return (
        <>
        <header className="main-header">

            {/* ── Top bar ── */}
            <nav className="navbar navbar-static-top" style={{ padding: 0 }}>
                <div className="inside-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 16px', boxSizing: 'border-box' }}>

                    {/* Logo */}
                    <a href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none' }}>
                        <img
                            src={headerLogo}
                            alt="Terrific"
                            style={{ height: isMobile ? 32 : 42, width: 'auto', objectFit: 'contain', display: 'block' }}
                        />
                    </a>

                    {/* Right-side icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

                        {/* Date & Time — XL only */}
                        {isXL && (
                            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: 10, padding: '4px 12px', border: '1px solid rgba(255,255,255,0.2)', minWidth: 160 }}>
                                <i className="mdi mdi-calendar-clock" style={{ color: '#000000', fontSize: 18, marginRight: 8 }}></i>
                                <div>
                                    <div style={{ color: '#000000', fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>{currentDate}</div>
                                    <div style={{ color: 'rgba(0,0,0,0.75)', fontSize: 10, lineHeight: 1.2 }}>{currentTime}</div>
                                </div>
                            </div>
                        )}

                        {/* Maximize — desktop only */}
                        {!isMobile && (
                            <a href="#" className="full-screen" style={iconBtn} onClick={toggleFullscreen} title={isFullscreen ? "Minimize" : "Maximize"}>
                                <span key={isFullscreen ? "minimize" : "maximize"} style={{ display: 'flex' }}>

                                    <i data-feather={isFullscreen ? "minimize" : "maximize"} style={{ width: 16, height: 16 }}></i>
                                </span>
                            </a>
                        )}

                        {/* Bell - always */}
                        <div className="dropdown">
                            <a href="#" data-bs-toggle="dropdown" data-bs-auto-close="outside" data-bs-display={isMobile ? "static" : "dynamic"} style={iconBtn} onClick={() => { if(unreadCount > 0) fetchNotifications(); }}>
                                <i data-feather="bell" style={{ width: 16, height: 16 }}></i>
                                {unreadCount > 0 && (
                                    <span style={{ position: 'absolute', top: 4, right: 4, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 'bold', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid #fff' }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </a>
                            
                            <ul className={`dropdown-menu ${!isMobile ? 'dropdown-menu-end' : ''}`} style={{
                                padding: 0, borderRadius: 16, overflow: 'hidden',
                                border: 'none', boxShadow: '0 16px 48px rgba(34,193,195,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                                minWidth: isMobile ? 'calc(100vw - 32px)' : 320, 
                                maxWidth: isMobile ? 'calc(100vw - 32px)' : 360,
                                ...(isMobile ? {
                                    position: 'absolute',
                                    right: -86,
                                    top: 48,
                                    left: 'auto',
                                    transform: 'none'
                                } : {})
                            }}>
                                <li style={{ background: 'var(--primary-bg, linear-gradient(135deg,#22C1C3,#1aa8aa))', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Notifications</div>
                                    <button onClick={markAllAsRead} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, cursor: unreadCount > 0 ? 'pointer' : 'default', opacity: unreadCount > 0 ? 1 : 0.5, transition: 'all 0.2s' }}>
                                        Mark all as read
                                    </button>
                                </li>
                                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                                            <i className="bi bi-bell-slash" style={{ fontSize: 24, marginBottom: 8, display: 'block', opacity: 0.5 }}></i>
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <li key={notif.id} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: notif.is_read ? '#fff' : '#f8fafc', transition: 'background 0.2s', display: 'flex', gap: 14 }} onClick={() => markAsRead(notif.id, notif.is_read)} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = notif.is_read ? '#fff' : '#f8fafc'}>
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: notif.is_read ? '#e2e8f0' : 'rgba(34,193,195,0.15)', color: notif.is_read ? '#64748b' : 'var(--primary-color, #22C1C3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                                                    <i className="bi bi-bell"></i>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 14, color: notif.is_read ? '#475569' : '#0f172a', fontWeight: notif.is_read ? 500 : 600, lineHeight: 1.4, marginBottom: 4 }}>
                                                        {notif.title || notif.message}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                                        {new Date(notif.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                                {!notif.is_read && (
                                                    <button onClick={(e) => { e.stopPropagation(); markAsRead(notif.id, notif.is_read); }} style={{ background: 'transparent', border: '1px solid var(--primary-color, #22C1C3)', color: 'var(--primary-color, #22C1C3)', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', alignSelf: 'center', flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-color, #22C1C3)'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary-color, #22C1C3)'; }}>
                                                        Mark Read
                                                    </button>
                                                )}
                                            </li>
                                        ))
                                    )}
                                </div>
                                <li style={{ background: '#f8fafc', padding: '10px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                                    <a href="#" data-bs-toggle="modal" data-bs-target="#notificationsModal" onClick={() => document.body.click()} style={{ fontSize: 13, color: 'var(--primary-color, #22C1C3)', fontWeight: 600, textDecoration: 'none' }}>View all notifications</a>
                                </li>
                            </ul>
                        </div>

                        {/* Avatar + dropdown — always */}
                        <div className="dropdown">
                            <a href="#" data-bs-toggle="dropdown" data-bs-auto-close="outside"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.55)', textDecoration: 'none', flexShrink: 0, cursor: 'pointer' }}>
                                <img src={userHeaderData?.profile_photo_url || "/assets/images/avatar/3.jpg"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end " style={{
                                padding: 0, borderRadius: 18, overflow: 'hidden',
                                border: 'none', boxShadow: '0 16px 48px rgba(34,193,195,0.22), 0 4px 16px rgba(0,0,0,0.12)',
                                minWidth: 220,
                            }}>
                                <li style={{ background: 'var(--primary-bg, linear-gradient(135deg,#22C1C3,#1aa8aa))', padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <img src={userHeaderData?.profile_photo_url || "/assets/images/avatar/3.jpg"} alt="" style={{ width: 42, height: 42, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.7)', objectFit: 'cover' }} />
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Welcome Back</div>
                                        <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 11, marginTop: 2 }}>{userHeaderData?.name || 'Terrific ERP'}</div>
                                    </div>
                                </li>
                                <li style={{ background: '#fff', padding: '6px 8px' }}>
                                    <Link className="dropdown-item" to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#1e293b', fontWeight: 500, fontSize: 13 }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f0fdfd'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(34,193,195,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color, #22C1C3)', flexShrink: 0 }}>
                                            <i className="ti-user" style={{ fontSize: 13 }}></i>
                                        </span>
                                        Profile
                                    </Link>
                                </li>
                                <li style={{ background: '#fff', padding: '0 8px 8px' }}>
                                    <Link className="dropdown-item" to="/global-settings" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#1e293b', fontWeight: 500, fontSize: 13 }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f0fdfd'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(34,193,195,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color, #22C1C3)', flexShrink: 0 }}>
                                            <i className="ti-settings" style={{ fontSize: 13 }}></i>
                                        </span>
                                        Settings
                                    </Link>
                                </li>
                                <li style={{ background: '#fff', padding: '0 8px 8px' }}>
                                    <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#logoutModal"
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#ef4444', fontWeight: 500, fontSize: 13 }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                                            <i className="ti-lock" style={{ fontSize: 13 }}></i>
                                        </span>
                                        Logout
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Mobile hamburger — < 1001px — Bootstrap icon, opens the same right drawer */}
                        {isMobile && (
                            <button
                                onClick={() => setDrawerOpen(o => !o)}
                                aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 38, height: 38, borderRadius: 9, border: 'none',
                                    background: drawerOpen
                                        ? 'linear-gradient(135deg,#1e40af,#2563EB)'
                                        : 'rgba(255,255,255,0.18)',
                                    cursor: 'pointer', padding: 0, outline: 'none',
                                    boxShadow: drawerOpen ? '0 4px 14px rgba(37,99,235,0.45)' : 'none',
                                    transition: 'background 0.22s ease',
                                }}
                            >
                                <i
                                    className={drawerOpen ? 'bi bi-x-lg' : 'bi bi-list'}
                                    style={{ fontSize: drawerOpen ? 18 : 22, color: '#ffffff', lineHeight: 1 }}
                                />
                            </button>
                        )}

                    </div>
                </div>
            </nav>
            <Navigation drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} userPermissions={userHeaderData ? userHeaderData.rights : undefined} headerLogo={headerLogo} />
        </header>


            {/* Notifications Modal */}
            <div className="modal fade" id="notificationsModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content" style={{ borderRadius: 16, border: 'none' }}>
                        <div className="modal-header" style={{ background: 'var(--primary-bg, linear-gradient(135deg,#22C1C3,#1aa8aa))', color: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                            <h5 className="modal-title" style={{ color: '#fff', fontWeight: 600 }}>All Notifications</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body" style={{ padding: 0 }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 15 }}>
                                    <i className="bi bi-bell-slash" style={{ fontSize: 32, marginBottom: 12, display: 'block', opacity: 0.5 }}></i>
                                    You have no notifications at the moment.
                                </div>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {notifications.map(notif => (
                                        <li key={notif.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: notif.is_read ? '#fff' : '#f8fafc', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: notif.is_read ? '#e2e8f0' : 'rgba(34,193,195,0.15)', color: notif.is_read ? '#64748b' : 'var(--primary-color, #22C1C3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
                                                <i className="bi bi-bell"></i>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 15, color: notif.is_read ? '#475569' : '#0f172a', fontWeight: notif.is_read ? 500 : 600, lineHeight: 1.4, marginBottom: 4 }}>
                                                    {notif.title || notif.message}
                                                </div>
                                                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                                                    {notif.message}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                            {!notif.is_read && (
                                                <button onClick={() => markAsRead(notif.id, notif.is_read)} style={{ background: 'transparent', border: '1px solid var(--primary-color, #22C1C3)', color: 'var(--primary-color, #22C1C3)', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-color, #22C1C3)'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary-color, #22C1C3)'; }}>
                                                    Mark Read
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', background: '#f8fafc', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" style={{ borderRadius: 8, fontWeight: 500 }}>Close</button>
                            {unreadCount > 0 && (
                                <button type="button" className="btn btn-primary" onClick={markAllAsRead} style={{ borderRadius: 8, fontWeight: 500, background: 'var(--primary-color, #22C1C3)', border: 'none' }}>Mark all as read</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
