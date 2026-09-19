import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginLogo, setLoginLogo] = useState('/assets/images/logo-2.png');

    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

    // Disable DevTools shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Prevent F12
            if (e.keyCode === 123) {
                e.preventDefault();
            }
            // Prevent Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
            }
            // Prevent Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
            }
            // Prevent Ctrl+Shift+J
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
            }
            // Prevent Ctrl+U (View Source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/company`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.data) {
                        const d = data.data;
                        const makeUrl = (path) => {
                            if (path.startsWith('http')) return path;
                            const base = API_BASE;
                            return `${base}/api/file?path=${encodeURIComponent(path)}`;
                        };
                        const lg = d.main_logo || d.company_logo || d.logo;
                        if (lg) {
                            setLoginLogo(makeUrl(lg));
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
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch company details for login:", err);
            }
        };
        fetchCompanyDetails();
    }, [API_BASE]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/roles/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            /* Safely parse JSON — API might return HTML on error pages */
            let json;
            try {
                json = await res.json();
            } catch {
                console.error('Login: response was not JSON. Status:', res.status, res.statusText);
                setError(`Server error (${res.status}). Please contact support.`);
                return;
            }

            console.log('Login response:', res.status, json);

            // Handle both { success: true } and { status: "success" } response shapes
            const isSuccess = json.success === true || json.status === 'success';
            if (!res.ok || !isSuccess) {
                setError(json.message || 'Invalid email or password.');
                return;
            }

            // Handle both access_token and token key names
            const token = json.data?.access_token || json.data?.token;

            // Persist auth data
            sessionStorage.setItem('erp_auth', 'true');
            sessionStorage.setItem('erp_token', token);
            sessionStorage.setItem('erp_user', JSON.stringify(json.data.user));
            sessionStorage.setItem('erp_login_date', new Date().toDateString());

            localStorage.setItem('erp_auth', 'true');
            localStorage.setItem('erp_token', token);
            localStorage.setItem('erp_user', JSON.stringify(json.data.user));
            localStorage.setItem('erp_login_date', new Date().toDateString());

            navigate(from, { replace: true });

        } catch (err) {
            console.error('Login fetch error:', err);
            setError('Unable to reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lp-bg" onContextMenu={(e) => e.preventDefault()}>

            {/* Animated background shapes */}
            <div className="lp-shape lp-shape-1" />
            <div className="lp-shape lp-shape-2" />
            <div className="lp-shape lp-shape-3" />
            <div className="lp-shape lp-shape-4" />
            <div className="lp-shape lp-shape-5" />
            <div className="lp-shape lp-shape-6" />
            <div className="lp-dot-grid lp-dot-grid-tr" />
            <div className="lp-dot-grid lp-dot-grid-bl" />
            <div className="lp-dot-grid lp-dot-grid-tl" />

            {/* Center white card */}
            <div className="lp-card">

                {/* Left: illustration */}
                <div className="lp-illus">
                    <img src="/assets/images/Login.png" alt="Air Compressor" className="lp-illus-img" />
                    <p className="lp-illus-title">Terrific Technologies</p>
                    <p className="lp-illus-sub">Powering Industry with Precision</p>
                </div>

                {/* Right: login form card */}
                <div className="lp-form-card">
                    <div className="lp-logo-wrap">
                        <img src={loginLogo} alt="Terrific" className="lp-logo-img" />
                    </div>

                    <h3 className="lp-form-title">Login your account</h3>

                    <form onSubmit={handleSubmit} className="lp-form">
                        <input
                            type="email"
                            className="lp-input"
                            placeholder="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            autoFocus
                        />
                        <div className="lp-pw-wrap">
                            <input
                                type={showPass ? 'text' : 'password'}
                                className="lp-input lp-input--pw"
                                placeholder="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="lp-eye-btn"
                                onClick={() => setShowPass(v => !v)}
                                tabIndex={-1}
                                aria-label={showPass ? 'Hide password' : 'Show password'}
                            >
                                {showPass ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {error && <p className="lp-error">{error}</p>}

                        <div className="lp-forgot-row">
                            <a href="#" className="lp-forgot-link">forget password?</a>
                        </div>

                        <button type="submit" className="lp-btn" disabled={loading}>
                            {loading ? <span className="lp-spinner" /> : 'Login'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Login;
