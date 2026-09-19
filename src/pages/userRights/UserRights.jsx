import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoader } from '../../context/LoaderContext';
import { usePermissions } from '../../context/PermissionContext';
import {
    CaretLeft, ShieldCheckIcon, CaretDownIcon, CaretRightIcon, HouseIcon, AddressBookIcon,
    ChartBarIcon, ShoppingCartIcon, TagIcon, ArrowsLeftRightIcon,
    PackageIcon, BankIcon, GearSixIcon, UserIcon, FolderOpenIcon,
    CurrencyDollarIcon, ArrowCounterClockwise, Check
} from '@phosphor-icons/react';
import SubmitPopup from '../../components/Popup/SubmitPopup.jsx';
import UserRightsPopup from '../../components/Popup/UserRightsPopup.jsx';
import SuccessPopup from '../../components/Popup/SuccessPopup.jsx';
import { apiFetch } from '../../lib/api';

const MODULES = [
    { name: 'Dashboard', icon: HouseIcon },
    { name: 'Sales Contact', icon: AddressBookIcon },
    { name: 'Work Plan', icon: AddressBookIcon },
    { name: 'Reporting', icon: ChartBarIcon },
    { name: 'Enquiry', icon: ShoppingCartIcon },
    { name: 'Sales', icon: TagIcon },
    { name: 'Contra', icon: ArrowsLeftRightIcon },
    { name: 'Inventory', icon: PackageIcon },
    { name: 'Bank Process', icon: BankIcon },
    { name: 'Power Master', icon: GearSixIcon },
    { name: 'User Rights', icon: ShieldCheckIcon },
    { name: 'Report', icon: FolderOpenIcon },
    { name: 'Payroll', icon: CurrencyDollarIcon }
];

const SUB_MENUS = {
    'Dashboard': {
        'Overview': ['View'],
        'Analytics': ['View']
    },
    'Sales Contact': {
        'Sales Contact': ['View', 'Add', 'Edit', 'Delete'],
        'Closed Contacts': ['View', 'Delete'],
        'Converted Contact': ['View', 'Edit', 'Delete'],
        'Hold Contacts': ['View', 'Delete']
    },
    'Work Plan': {
        'Work Plan': ['View', 'Add', 'Edit', 'Delete'],
        'Completed Plan': ['View', 'Delete']
    },
    'Reporting': {
        'Reporting Details': ['View', 'Create', 'Edit', 'Delete']
    },
    'Enquiry': {
        'Enquiry': ['View', 'Add', 'Edit', 'Delete', 'Print', 'Close'],
        'Cash Discount - Pending List': ['View', 'Collect'],
        'Cash Discount - Receipt List': ['View', 'Print']
    },
    'Sales': {
        'Followup': ['View', 'History', 'Quotation', 'Proforma', 'Convert', 'Revert'],
        'Followup - In Followup': ['View', 'History', 'Quotation', 'Proforma', 'Convert'],
        'Followup - Complete Followup List': ['View', 'History', 'Quotation', 'Proforma', 'Revert'],
        
        'Job Card': ['View', 'Edit', 'Add', 'Print', 'Revert'],
        'Job Card - Jobcard List': ['View', 'Edit', 'Add', 'Print'],
        'Job Card - Erection List': ['View', 'Edit', 'Add', 'Print', 'Revert'],
        
        'Invoice': ['View', 'Edit', 'Add', 'Revert', 'Print'],
        'Invoice - Invoice List': ['View', 'Edit'],
        'Invoice - Installation List': ['View', 'Add', 'Revert', 'Print'],
        'Invoice - Completed List': ['View', 'Add', 'Edit', 'Print'],
        
        'Advanced Receipt': ['View', 'Edit', 'Print', 'Approve'],
        'Advanced Receipt - Advance List in Receipt': ['View', 'Edit', 'Print'],
        'Advanced Receipt - Collection Pending List': ['View', 'Edit', 'Approve'],
        'Advanced Receipt - Receipt List': ['View', 'Print'],
        
        'Further Receipt': ['View', 'Edit', 'Print', 'Add', 'Approve'],
        'Further Receipt - Invoice List in Receipt': ['View', 'Edit', 'Print'],
        'Further Receipt - Receipt Completed Invoice List': ['View', 'Print'],
        'Further Receipt - Collection Pending List': ['View', 'Edit', 'Approve'],
        'Further Receipt - Receipt List': ['View', 'Print'],
        'Further Receipt - Cancelled Receipt': ['View', 'Print'],
        
        'Complete Sales': ['View'],
        'Unallotted Enquiry': ['View', 'Edit', 'Delete'],
        'Closed Enquiry': ['View', 'Revert']
    },
    'Contra': {
        'Contra list': ['View', 'Add', 'Edit', 'Delete'],
        'Contra Receipt': ['View', 'Edit', 'Delete', 'Export'],
        'Contra Receipt - Pending Contra Receipt List': ['View', 'Edit', 'Delete'],
        'Contra Receipt - Completed Contra Receipt List': ['View', 'Export'],
        'Contra Receipt - Contra Receipt List': ['View', 'Export']
    },
    'Inventory': {
        'Stock Details': ['View'],
        'Direct GRN': ['View', 'Add', 'Edit', 'Print', 'Delete', 'Revert'],
        'Purchase Order List': ['View', 'Add', 'Edit', 'Delete', 'Print'],
        'Purchase Order List - Purchase list': ['View', 'Add', 'Edit', 'Delete', 'Print'],
        'Purchase Order List - In followup list': ['View', 'Add', 'Edit', 'Delete', 'Print'],
        'GRN Inspection List': ['View', 'Edit'],
        'GRN Inspection List - GRN Inspection': ['View', 'Edit'],
        'GRN Inspection List - Completed GRN Inspection': ['View', 'Edit'],
        'Advanced Payment List': ['View', 'Add', 'Edit', 'Collect', 'Delete'],
        'Advanced Payment List - Purchase Order List in Receipt': ['View', 'Edit'],
        'Advanced Payment List - Collection Pending List': ['View', 'Edit', 'Collect'],
        'Advanced Payment List - Receipt List': ['View', 'Print'],
        'Further Receipt List': ['View', 'Add', 'Edit', 'Print', 'Approve'],
        'Further Receipt List - Enquiry List in Receipt': ['View', 'Edit', 'Print'],
        'Further Receipt List - Receipt Completed Enquiry List': ['View', 'Print'],
        'Further Receipt List - Collection Pending List': ['View', 'Edit', 'Print', 'Approve'],
        'Further Receipt List - Receipt List': ['View', 'Print'],
        'Further Receipt List - Cancelled Receipt List': ['View', 'Edit']
    },
    'Bank Process': {
        'Payment Voucher': ['View', 'Add', 'Edit', 'Delete', 'Print', 'Revert'],
        'Daywise Report': ['View', 'Print'],
        'Receipt': ['View', 'Edit', 'Delete'],
        'Receipt - Enquiry': ['View', 'Edit', 'Delete'],
        'Receipt - Completed': ['View', 'Edit', 'Delete'],
        'Receipt - Pending': ['View', 'Edit', 'Delete'],
        'Receipt - List': ['View', 'Edit', 'Delete'],
        'Receipt - Cancelled': ['View', 'Edit', 'Delete']
    },
    'Power Master': {
        'General Master': ['View', 'Add', 'Edit', 'Delete'],
        'General Master - Company': ['View', 'Add', 'Edit', 'Delete'],
        'General Master - Branch': ['View', 'Add', 'Edit', 'Delete'],
        'General Master - Tax Master': ['View', 'Add', 'Edit', 'Delete'],
        'General Master - Project': ['View', 'Add', 'Edit', 'Delete'],
        
        'Enquiry Master': ['View', 'Add', 'Edit', 'Delete'],
        'Enquiry Master - Enquiry Source': ['View', 'Add', 'Edit', 'Delete'],
        'Enquiry Master - P&F Notes': ['View', 'Add', 'Edit', 'Delete'],
        'Enquiry Master - Tax Notes': ['View', 'Add', 'Edit', 'Delete'],
        'Enquiry Master - Payment Notes': ['View', 'Add', 'Edit', 'Delete'],
        'Enquiry Master - Delivery Notes': ['View', 'Add', 'Edit', 'Delete'],
        'Enquiry Master - Warranty Notes': ['View', 'Add', 'Edit', 'Delete'],
        'Enquiry Master - Fright Notes': ['View', 'Add', 'Edit', 'Delete'],
        
        'HR Master': ['View', 'Add', 'Edit', 'Delete'],
        'HR Master - HR Category': ['View', 'Add', 'Edit', 'Delete'],
        'HR Master - Designation': ['View', 'Add', 'Edit', 'Delete'],
        'HR Master - Department': ['View', 'Add', 'Edit', 'Delete'],
        
        'Geo Locations': ['View', 'Add', 'Edit', 'Delete'],
        'Geo Locations - Country': ['View', 'Add', 'Edit', 'Delete'],
        'Geo Locations - State': ['View', 'Add', 'Edit', 'Delete'],
        'Geo Locations - City': ['View', 'Add', 'Edit', 'Delete'],
        
        'Employee': ['View', 'Add', 'Edit', 'Delete'],
        'Employee - Employee Type': ['View', 'Add', 'Edit', 'Delete'],
        'Employee - Employee': ['View', 'Add', 'Edit', 'Delete'],
        
        'Contra': ['View', 'Add', 'Edit', 'Delete'],
        'Contra - Contra Person': ['View', 'Add', 'Edit', 'Delete'],
        
        'Bank': ['View', 'Add', 'Edit', 'Delete'],
        'Bank - Bank': ['View', 'Add', 'Edit', 'Delete'],
        'Bank - Payment Mode': ['View', 'Add', 'Edit', 'Delete'],
        'Bank - Account Details': ['View', 'Add', 'Edit', 'Delete'],
        // 'Bank - Cheque Book': ['View', 'Add', 'Edit', 'Delete'],
        'Bank - Accounts Category': ['View', 'Add', 'Edit', 'Delete'],
        'Bank - Accounts Head': ['View', 'Add', 'Edit', 'Delete'],
        
        'Customer': ['View', 'Add', 'Edit', 'Delete'],
        'Customer - Customer Category': ['View', 'Add', 'Edit', 'Delete'],
        'Customer - Customer': ['View', 'Add', 'Edit', 'Delete'],
        'Customer - Customer Sub Category': ['View', 'Add', 'Edit', 'Delete'],
        'Customer - Customer Group': ['View', 'Add', 'Edit', 'Delete'],
        'Customer - Customer Grading': ['View', 'Add', 'Edit', 'Delete'],
        
        'Items': ['View', 'Add', 'Edit', 'Delete'],
        'Items - Brand': ['View', 'Add', 'Edit', 'Delete'],
        'Items - Product Group': ['View', 'Add', 'Edit', 'Delete'],
        'Items - Product Category': ['View', 'Add', 'Edit', 'Delete'],
        'Items - Product Sub Category': ['View', 'Add', 'Edit', 'Delete'],
        'Items - Product Model': ['View', 'Add', 'Edit', 'Delete'],
        'Items - Product': ['View', 'Add', 'Edit', 'Delete'],
        'Items - Unit': ['View', 'Add', 'Edit', 'Delete'],
        
        'Vendor': ['View', 'Add', 'Edit', 'Delete'],
        'Vendor - Vendor': ['View', 'Add', 'Edit', 'Delete'],
        'Vendor - Vendor Product Mapping': ['View', 'Add', 'Edit', 'Delete'],
        'Vendor - Vendor Category': ['View', 'Add', 'Edit', 'Delete'],
        'Vendor - Vendor Sub Category': ['View', 'Add', 'Edit', 'Delete'],
        'Vendor - Vendor Group': ['View', 'Add', 'Edit', 'Delete']
    },
    'User Rights': {
        'User Right': ['View', 'Add', 'Edit', 'Delete', 'Rights']
    },
    'Report': {
        'Stock Report': ['View', 'Print'],
        'Customer Ledger Report': ['View', 'Print'],
        'Vendor Ledger Report': ['View', 'Print'],
        'Outstanding Report': ['View', 'Print'],
        'Enquiry Hold Report': ['View', 'Print'],
        'Pending Vendor Payment': ['View', 'Print'],
        'Total Paid Vendor Payment': ['View', 'Print'],
        'Payment Voucher Report': ['View', 'Print']
    },
    'Payroll': {
        'Payroll Entry': ['View'],
        'Payroll List': ['View', 'Edit'],
        'Payroll Report': ['View', 'Print']
    }
};

const ACTIONS = ['View', 'Add', 'Edit', 'Delete', 'Print'];

const UserRights = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setLoading } = useLoader();
    const { userHeaderData } = usePermissions();

    const isSuperAdmin = userHeaderData?.role?.toLowerCase() === 'super admin';
    const currentUserRights = userHeaderData?.rights || [];

    const activeModules = isSuperAdmin 
        ? MODULES 
        : MODULES.filter(mod => {
            const modSubMenus = SUB_MENUS[mod.name] || { 'General': ['View', 'Add', 'Edit', 'Delete', 'Print'] };
            return Object.keys(modSubMenus).some(menu => {
                const actions = modSubMenus[menu] || [];
                return actions.some(action => currentUserRights.includes(`${mod.name}.${menu}.${action}`));
            });
        });

    const getActiveSubMenus = (modName) => {
        const allSubMenus = SUB_MENUS[modName] || { 'General': ['View', 'Add', 'Edit', 'Delete', 'Print'] };
        if (isSuperAdmin) return allSubMenus;

        const filtered = {};
        Object.keys(allSubMenus).forEach(menu => {
            const actions = allSubMenus[menu] || [];
            const allowedActions = actions.filter(action => currentUserRights.includes(`${modName}.${menu}.${action}`));
            if (allowedActions.length > 0) {
                filtered[menu] = allowedActions;
            }
        });
        return filtered;
    };

    const passedUser = location.state?.user;
    const roleName = passedUser?.role || 'Admin';

    const [selectedPopupModule, setSelectedPopupModule] = useState(null);
    const [permissions, setPermissions] = useState(() => {
        const initial = {};
        MODULES.forEach(mod => {
            const modSubMenus = SUB_MENUS[mod.name] || { 'General': ['View', 'Add', 'Edit', 'Delete', 'Print'] };
            const subMenuPerms = {};
            Object.keys(modSubMenus).forEach(menu => {
                subMenuPerms[menu] = {};
                modSubMenus[menu].forEach(action => {
                    subMenuPerms[menu][action] = false;
                });
            });
            initial[mod.name] = {
                Access: false,
                submenus: subMenuPerms
            };
        });
        return initial;
    });

    useEffect(() => {
        if (!passedUser?.id) return;
        const fetchPermissions = async () => {
            setLoading(true);
            try {
                const { json } = await apiFetch(`/roles/users/admin/rights/user/${passedUser.id}`);
                if (json?.data?.permissions) {
                    const loadedPerms = json.data.permissions;
                    setPermissions(prev => {
                        const updated = { ...prev };
                        MODULES.forEach(mod => {
                            const modSubMenus = SUB_MENUS[mod.name] || { 'General': ['View', 'Add', 'Edit', 'Delete', 'Print'] };
                            const subMenuPerms = {};
                            let moduleHasAccess = false;
                            
                            Object.keys(modSubMenus).forEach(menu => {
                                subMenuPerms[menu] = {};
                                modSubMenus[menu].forEach(action => {
                                    const permStr = `${mod.name}.${menu}.${action}`;
                                    const hasPerm = loadedPerms.includes(permStr);
                                    subMenuPerms[menu][action] = hasPerm;
                                    if (hasPerm) moduleHasAccess = true;
                                });
                            });
                            
                            updated[mod.name] = {
                                Access: moduleHasAccess,
                                submenus: subMenuPerms
                            };
                        });
                        return updated;
                    });
                }
            } catch (err) {
                console.error("Failed to load user permissions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPermissions();
    }, [passedUser]);

    const isModuleAnySelected = (moduleName) => {
        const modSubMenus = getActiveSubMenus(moduleName);
        const modPerms = permissions[moduleName]?.submenus || {};
        
        return Object.keys(modSubMenus).some(menu => {
            const allowedActions = modSubMenus[menu] || [];
            if (allowedActions.length === 0) return false;
            return allowedActions.some(a => modPerms[menu]?.[a]);
        });
    };

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successRedirect, setSuccessRedirect] = useState(false);

    const togglePermission = (module, actionOrSubmenu, action) => {
        if (actionOrSubmenu === 'ModuleAll') {
            // Toggling module level access (all submenus and all their actions)
            setPermissions(prev => {
                const modSubMenus = getActiveSubMenus(module);
                const modPerms = prev[module].submenus;
                
                // Check if all are currently selected
                let allSelected = true;
                Object.keys(modSubMenus).forEach(menu => {
                    const allowedActions = modSubMenus[menu] || [];
                    allowedActions.forEach(a => {
                        if (!modPerms[menu]?.[a]) allSelected = false;
                    });
                });
                
                // Set to opposite
                const nextSub = { ...modPerms };
                Object.keys(modSubMenus).forEach(menu => {
                    nextSub[menu] = { ...modPerms[menu] };
                    const allowedActions = modSubMenus[menu] || [];
                    allowedActions.forEach(a => {
                        nextSub[menu][a] = !allSelected;
                    });
                });
                
                return {
                    ...prev,
                    [module]: {
                        ...prev[module],
                        Access: !allSelected,
                        submenus: nextSub
                    }
                };
            });
        } else if (actionOrSubmenu === 'ModuleReset') {
            // Reset all permissions for module
            setPermissions(prev => {
                const modSubMenus = getActiveSubMenus(module);
                const modPerms = prev[module].submenus;
                const nextSub = { ...modPerms };
                Object.keys(modSubMenus).forEach(menu => {
                    nextSub[menu] = { ...modPerms[menu] };
                    const allowedActions = modSubMenus[menu] || [];
                    allowedActions.forEach(a => {
                        nextSub[menu][a] = false;
                    });
                });
                
                return {
                    ...prev,
                    [module]: {
                        ...prev[module],
                        Access: false,
                        submenus: nextSub
                    }
                };
            });
        } else if (action === 'All') {
            const submenu = actionOrSubmenu;
            setPermissions(prev => {
                const currentSub = prev[module].submenus[submenu] || {};
                const modSubMenus = getActiveSubMenus(module);
                const allowedActions = modSubMenus[submenu] || [];
                const allSelected = allowedActions.length > 0 && allowedActions.every(a => currentSub[a]);
                
                const nextSubmenus = { ...prev[module].submenus };
                
                // Toggle the main menu itself
                const nextSub = { ...currentSub };
                allowedActions.forEach(a => nextSub[a] = !allSelected);
                nextSubmenus[submenu] = nextSub;

                // Toggle all child tabs if this is a parent menu
                Object.keys(modSubMenus).forEach(menuKey => {
                    if (menuKey.startsWith(`${submenu} - `)) {
                        const childSub = prev[module].submenus[menuKey] || {};
                        const childAllowedActions = modSubMenus[menuKey] || [];
                        const nextChildSub = { ...childSub };
                        childAllowedActions.forEach(a => nextChildSub[a] = !allSelected);
                        nextSubmenus[menuKey] = nextChildSub;
                    }
                });

                return {
                    ...prev,
                    [module]: {
                        ...prev[module],
                        submenus: nextSubmenus
                    }
                };
            });
        } else {
            // Toggling submenu level permission
            const submenu = actionOrSubmenu;
            setPermissions(prev => {
                const currentActionState = prev[module].submenus[submenu]?.[action];
                const newActionState = !currentActionState;
                const updatedSubmenu = {
                    ...(prev[module].submenus[submenu] || {}),
                    [action]: newActionState
                };
                
                // If enabling any action other than View, auto-enable View
                if (action !== 'View' && newActionState) {
                    updatedSubmenu['View'] = true;
                }

                return {
                    ...prev,
                    [module]: {
                        ...prev[module],
                        submenus: {
                            ...prev[module].submenus,
                            [submenu]: updatedSubmenu
                        }
                    }
                };
            });
        }
    };

    const handleSelectAllRow = (module) => {
        const row = permissions[module];
        const allSelected = ACTIONS.every(a => row[a]);
        setPermissions(prev => ({
            ...prev,
            [module]: {
                View: !allSelected,
                Add: !allSelected,
                Edit: !allSelected,
                Delete: !allSelected,
                Print: !allSelected
            }
        }));
    };

    const isAllActionSelected = (action) => {
        return activeModules.every(mod => permissions[mod.name][action]);
    };

    const handleSelectAllAction = (action) => {
        const allSelected = isAllActionSelected(action);
        setPermissions(prev => {
            const next = { ...prev };
            activeModules.forEach(mod => {
                next[mod.name] = { ...next[mod.name], [action]: !allSelected };
            });
            return next;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async (shouldRedirect = false) => {
        if (!passedUser?.id) return;
        setLoading(true);
        try {
            // Build permissions array to send
            const permsToSend = [];
            Object.keys(permissions).forEach(mod => {
                const submenus = permissions[mod].submenus;
                Object.keys(submenus).forEach(menu => {
                    Object.keys(submenus[menu]).forEach(action => {
                        if (submenus[menu][action]) {
                            permsToSend.push(`${mod}.${menu}.${action}`);
                        }
                    });
                });
            });

            const { json, res } = await apiFetch(`/roles/users/admin/rights/assign/${passedUser.id}`, {
                method: 'POST',
                body: JSON.stringify({ permissions: permsToSend })
            });
            if (res && res.ok) {
                setShowSubmitPopup(false);
                // Trigger event to refresh Header if we updated our own rights
                window.dispatchEvent(new Event('profileUpdated'));
                
                // Trigger cross-tab update for all other open tabs!
                localStorage.setItem('profileUpdatedTimestamp', Date.now().toString());
                
                if (shouldRedirect === true) {
                    navigate('/user-rights');
                } else {
                    setSuccessRedirect(false);
                    setShowSuccessPopup(true);
                }
            } else {
                console.error('Failed to save rights:', json);
                alert('Failed to save rights');
            }
        } catch (err) {
            console.error('API call failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGlobalSelectAll = () => {
        setPermissions(prev => {
            const next = { ...prev };
            activeModules.forEach(mod => {
                const modSubMenus = getActiveSubMenus(mod.name);
                const subMenuPerms = { ...(prev[mod.name]?.submenus || {}) };
                Object.keys(modSubMenus).forEach(menu => {
                    subMenuPerms[menu] = { ...(subMenuPerms[menu] || {}) };
                    modSubMenus[menu].forEach(action => {
                        subMenuPerms[menu][action] = true;
                    });
                });
                next[mod.name] = { ...prev[mod.name], Access: true, submenus: subMenuPerms };
            });
            return next;
        });
    };

    const handleGlobalRevertAll = () => {
        setPermissions(prev => {
            const next = { ...prev };
            activeModules.forEach(mod => {
                const modSubMenus = getActiveSubMenus(mod.name);
                const subMenuPerms = { ...(prev[mod.name]?.submenus || {}) };
                Object.keys(modSubMenus).forEach(menu => {
                    subMenuPerms[menu] = { ...(subMenuPerms[menu] || {}) };
                    modSubMenus[menu].forEach(action => {
                        subMenuPerms[menu][action] = false;
                    });
                });
                next[mod.name] = { ...prev[mod.name], Access: false, submenus: subMenuPerms };
            });
            return next;
        });
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title d-flex align-items-center gap-2 mb-0" style={{ lineHeight: 1 }}>
                            <span>Assign User Rights</span>
                        </h3>
                        <div className="d-flex gap-2 align-items-center">
                            <button 
                                type="button" 
                                className="btn btn-sm d-flex align-items-center gap-1"
                                style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '8px', border: '1px solid #c7d2fe', fontWeight: '600', padding: '8px 16px' }}
                                onClick={handleGlobalSelectAll}
                            >
                                <Check weight="bold" /> Select All
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-sm d-flex align-items-center gap-1"
                                style={{ backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', border: '1px solid #fecaca', fontWeight: '600', padding: '8px 16px' }}
                                onClick={handleGlobalRevertAll}
                            >
                                <ArrowCounterClockwise weight="bold" /> Revert All
                            </button>
                            <button className="btn-header-back ms-2" onClick={() => navigate('/user-rights')}>
                                Back
                            </button>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="row mb-5 tw-bg-slate-50/50 tw-p-5 tw-rounded-2xl tw-border tw-border-slate-100">
                            <h6 className="tw-text-slate-700 tw-font-bold tw-mb-4 tw-text-sm tw-uppercase tw-tracking-wider">User Profile</h6>
                            <div className="col-12 col-md-4">
                                <div className="form-group mb-md-0">
                                    <label className="tw-font-medium tw-text-slate-600 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control tw-bg-white tw-border-slate-200 tw-rounded-xl tw-shadow-sm tw-py-2.5 tw-text-slate-800"
                                        value={passedUser?.name || 'N/A'}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="form-group mb-md-0">
                                    <label className="tw-font-medium tw-text-slate-600 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control tw-bg-white tw-border-slate-200 tw-rounded-xl tw-shadow-sm tw-py-2.5 tw-text-slate-800"
                                        value={passedUser?.email || 'N/A'}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="form-group mb-0">
                                    <label className="tw-font-medium tw-text-slate-600 mb-2">System Role</label>
                                    <input
                                        type="text"
                                        className="form-control tw-bg-blue-50 tw-border-blue-100 tw-text-blue-700 tw-font-semibold tw-rounded-xl tw-shadow-sm tw-py-2.5"
                                        value={roleName}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        <style>{`
                            .workspace-card {
                                transition: transform 0.3s ease, box-shadow 0.3s ease;
                            }
                            .workspace-card:hover {
                                transform: translateY(-4px);
                                box-shadow: 0 12px 40px rgba(0,0,0,0.08) !important;
                            }
                            .workspace-icon-wrapper {
                                background-color: #0d6efd;
                                color: #ffffff;
                                border: 2px solid transparent;
                                transition: all 0.3s ease;
                            }
                            .workspace-card:hover .workspace-icon-wrapper {
                                background-color: #ffffff;
                                color: #0d6efd;
                                border-color: #0d6efd;
                            }
                            .workspace-btn {
                                background-color: #f8fafc;
                                color: #475569;
                                border: 1px solid #e2e8f0;
                                transition: all 0.3s ease;
                                white-space: nowrap;
                            }
                            .workspace-card:hover .workspace-btn {
                                background-color: #0d6efd;
                                color: #ffffff;
                                border-color: #0d6efd;
                            }
                        `}</style>

                        <div className="permissions-matrix mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="tw-text-slate-800 tw-font-bold tw-text-xl mb-0">Workspace Access</h5>
                                <div className="d-flex gap-2">
                                    <button 
                                        type="button" 
                                        className="btn btn-sm d-flex align-items-center gap-1"
                                        style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '8px', border: '1px solid #c7d2fe', fontWeight: '600' }}
                                        onClick={handleGlobalSelectAll}
                                    >
                                        <Check weight="bold" /> Select All
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-sm d-flex align-items-center gap-1"
                                        style={{ backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', border: '1px solid #fecaca', fontWeight: '600' }}
                                        onClick={handleGlobalRevertAll}
                                    >
                                        <ArrowCounterClockwise weight="bold" /> Revert All
                                    </button>
                                </div>
                            </div>
                            <div className="row g-4">
                                {activeModules.map(mod => (
                                    <div className="col-12 col-md-6 col-lg-4" key={mod.name}>
                                        <div className="card workspace-card" style={{ height: 'auto', minHeight: '340px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', overflow: 'visible', cursor: 'pointer' }}>
                                            <div className="card-body d-flex flex-column align-items-center text-center position-relative" style={{ padding: '2.5rem 2rem' }}>
                                                {(() => {
                                                    const anySelected = isModuleAnySelected(mod.name);
                                                    return (
                                                        <div className="position-absolute d-flex gap-2" style={{ top: '20px', right: '20px', zIndex: 10 }}>
                                                            <div
                                                                className="d-flex align-items-center justify-content-center"
                                                                style={{ 
                                                                    width: '32px', height: '32px', 
                                                                    backgroundColor: anySelected ? '#e0e7ff' : '#f8fafc', 
                                                                    borderRadius: '8px', 
                                                                    cursor: 'pointer', 
                                                                    transition: 'all 0.2s ease', 
                                                                    border: anySelected ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                                                                    color: anySelected ? '#4f46e5' : 'transparent'
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    togglePermission(mod.name, 'ModuleAll');
                                                                }}
                                                            >
                                                                {anySelected && (
                                                                    <Check weight="bold" size={18} />
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn d-flex align-items-center justify-content-center p-0"
                                                                style={{ width: '32px', height: '32px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', border: '1px solid #fecaca', transition: 'all 0.2s ease' }}
                                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fca5a5'; e.currentTarget.style.color = '#dc2626'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    togglePermission(mod.name, 'ModuleReset');
                                                                }}
                                                            >
                                                                <ArrowCounterClockwise weight="bold" size={16} />
                                                            </button>
                                                        </div>
                                                    );
                                                })()}

                                                <div className="d-flex align-items-center justify-content-center mb-4 mt-2" style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: '#f8fafc', flexShrink: 0 }}>
                                                    <div className="workspace-icon-wrapper d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(13, 110, 253, 0.2)' }}>
                                                        <mod.icon weight="bold" size={22} />
                                                    </div>
                                                </div>

                                                <h5 className="fw-bold mb-3" style={{ color: '#1e293b', fontSize: '1.15rem' }}>{mod.name}</h5>

                                                <p className="text-muted mb-4 flex-grow-1" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                                                    Tailored views and permissions for the {mod.name} module with granular controls.
                                                </p>

                                                <button 
                                                    type="button"
                                                    className="btn workspace-btn mt-auto fw-semibold"
                                                    style={{ borderRadius: '12px', padding: '0.6rem 1.5rem', whiteSpace: 'nowrap' }}
                                                    onClick={() => setSelectedPopupModule(mod)}
                                                >
                                                    Enter Workspace
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="mt-5" />

                        <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => navigate('/user-rights')}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-save"
                                onClick={handleSubmit}
                            >
                                Save Rights
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={() => handleConfirmSubmit(true)} />
            <SuccessPopup 
                isOpen={showSuccessPopup} 
                onClose={() => {
                    setShowSuccessPopup(false);
                    if (successRedirect) navigate('/user-rights');
                }} 
                message="Rights saved successfully!" 
            />
            <UserRightsPopup 
                isOpen={!!selectedPopupModule} 
                onClose={() => setSelectedPopupModule(null)}
                onSave={() => handleConfirmSubmit(false)}
                module={selectedPopupModule} 
                submenus={selectedPopupModule ? getActiveSubMenus(selectedPopupModule.name) : []}
                permissions={selectedPopupModule ? permissions[selectedPopupModule.name]?.submenus : {}}
                togglePermission={(submenu, action) => togglePermission(selectedPopupModule?.name, submenu, action)}
            />
        </section>
    );
};

export default UserRights;
