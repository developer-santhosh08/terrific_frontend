import React from 'react';
import { usePermissions } from '../context/PermissionContext';
import AccessDenied from './AccessDenied';

/**
 * A wrapper component that checks if the user has the required permission 
 * before rendering its children. If not, it renders an Access Denied component.
 * 
 * @param {string|string[]} permission - A single permission string or an array of possible permission strings
 * @param {React.ReactNode} children - The component to render if access is granted
 */
const RequirePermission = ({ permission, children }) => {
    const { hasPermission, loading } = usePermissions();

    // Support for checking multiple possible permissions (OR logic)
    const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
    
    // If we are still fetching the user's data and permissions, don't immediately deny access
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>Loading Permissions...</div>;
    }

    // If the user has at least one of the required permissions, grant access
    const isAuthorized = permissionsToCheck.some(p => hasPermission(p));

    if (!isAuthorized) {
        return <AccessDenied />;
    }

    return <>{children}</>;
};

export default RequirePermission;
