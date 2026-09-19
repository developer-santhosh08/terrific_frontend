const BASE = import.meta.env.VITE_API_BASE_URL || '';
const clearAuthAndRedirect = () => {
    sessionStorage.removeItem('erp_auth');
    sessionStorage.removeItem('erp_token');
    sessionStorage.removeItem('erp_user');
    
    localStorage.removeItem('erp_auth');
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    
    window.location.href = '/login';
};

export const apiFetch = async (path, options = {}) => {
    const token = sessionStorage.getItem('erp_token');

    const res = await fetch(`${BASE}/api${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    // Unauthorised — clear session and go to login
    if (res.status === 401 || res.status === 403) {
        clearAuthAndRedirect();
        return null;
    }

    const json = await res.json();

    // Laravel sometimes sends a redirect error instead of 401
    if (
        typeof json?.message === 'string' &&
        (json.message.toLowerCase().includes('unauthenticated') ||
         json.message.toLowerCase().includes('route [login]'))
    ) {
        clearAuthAndRedirect();
        return null;
    }

    return { res, json };
};
