import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

const PermissionContext = createContext();

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
    const [userHeaderData, setUserHeaderData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUserPermissions = useCallback(async () => {
        const token = sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token');
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await apiFetch('/roles/users/me', { cache: 'no-store' });
            if (response?.json) {
                setUserHeaderData(response.json.data || response.json);
            }
        } catch (err) {
            console.error("Failed to load user permissions");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUserPermissions();

        // Listen for profile update event within the same tab
        window.addEventListener('profileUpdated', loadUserPermissions);

        // Listen for profile update event across multiple tabs
        const handleStorageChange = (e) => {
            if (e.key === 'profileUpdatedTimestamp') {
                loadUserPermissions();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('profileUpdated', loadUserPermissions);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadUserPermissions]);

    const hasPermission = (permissionString) => {
        if (!userHeaderData?.rights) return false;
        // Super admins or other fallback overrides can be placed here if needed
        return userHeaderData.rights.includes(permissionString);
    };

    return (
        <PermissionContext.Provider value={{
            userHeaderData,
            loading,
            hasPermission,
            refreshPermissions: loadUserPermissions
        }}>
            {children}
        </PermissionContext.Provider>
    );
};
