import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Eye, Plus, PencilSimple, Trash, Printer, XCircle, Clock, FileTextIcon, CheckCircleIcon, ArrowBendUpLeftIcon, FilePdfIcon, CurrencyDollarIcon, ShieldCheckIcon } from '@phosphor-icons/react';
import SavePopup from './SavePopup.jsx';

const ACTION_ICONS = {
    View: Eye,
    Add: Plus,
    Create: Plus,
    Edit: PencilSimple,
    Delete: Trash,
    Print: Printer,
    Close: XCircle,
    History: Clock,
    Quotation: FileTextIcon,
    Proforma: FileTextIcon,
    Convert: CheckCircleIcon,
    Revert: ArrowBendUpLeftIcon,
    Approve: CheckCircleIcon,
    Export: FilePdfIcon,
    Collect: CurrencyDollarIcon,
    Rights: ShieldCheckIcon
};

const ACTION_COLORS = {
    View: '#3b82f6',
    Add: '#10b981',
    Create: '#10b981',
    Edit: '#f59e0b',
    Delete: '#ef4444',
    Print: '#8b5cf6',
    Close: '#64748b',
    History: '#7c3aed',
    Quotation: '#2563eb',
    Proforma: '#0891b2',
    Convert: '#16a34a',
    Revert: '#ef4444',
    Approve: '#16a34a',
    Export: '#ef4444',
    Collect: '#10b981',
    Rights: '#8b5cf6'
};

const UserRightsPopup = ({ isOpen, onClose, onSave, module, submenus, permissions, togglePermission }) => {
    const [showSavePopup, setShowSavePopup] = useState(false);
    const ACTIONS = ['View', 'Add', 'Edit', 'Delete', 'Print'];

    if (!isOpen || !module || !submenus) return null;

    return ReactDOM.createPortal(
        <div
            className="position-fixed top-0 start-0 d-flex align-items-center justify-content-center p-3"
            style={{
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 99999
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-white position-relative d-flex flex-column"
                style={{
                    width: '95%',
                    maxWidth: '1000px',
                    maxHeight: '90vh',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    overflow: 'hidden'
                }}
            >
                <style>{`
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(30px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    .close-btn {
                        background: transparent;
                    }
                    .close-btn:hover { 
                        background-color: #f1f5f9; 
                        color: #0f172a !important;
                    }
                    
                    /* Mini Toggle Switch CSS for 'All' button */
                    .permission-toggle-mini {
                        position: relative;
                        display: inline-block;
                        width: 30px;
                        height: 16px;
                        background-color: #cbd5e1;
                        border-radius: 20px;
                        transition: 0.3s;
                    }
                    .permission-toggle-mini .slider-mini {
                        position: absolute; height: 12px; width: 12px;
                        left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%;
                    }
                    .permission-toggle-mini.checked { background-color: #3b82f6; }
                    .permission-toggle-mini.checked .slider-mini { transform: translateX(14px); }
                `}</style>

                {/* Header */}
                <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#eff6ff', color: '#3b82f6', boxShadow: 'inset 0 0 0 1px #bfdbfe' }}>
                            {module.icon && <module.icon weight="fill" size={24} />}
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold" style={{ color: '#0f172a' }}>{module.name} Permissions</h5>
                            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Configure granular access rights</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="btn d-flex align-items-center justify-content-center p-0"
                        style={{
                            width: '36px', height: '36px',
                            borderRadius: '50%', border: 'none',
                            backgroundColor: '#DC2626', color: '#ffffff',
                            // boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#DC2626'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#DC2626'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        <X weight="regular" size={18} />
                    </button>
                </div>

                {/* Body Content - Scrollable for Mobile */}
                <div className="p-4" style={{ overflowY: 'auto', backgroundColor: '#f8fafc', flexGrow: 1 }}>
                    <div className="d-flex flex-column gap-3">
                        {Object.keys(submenus).map((menu) => {
                            const isSubTab = menu.includes(' - ') && submenus[menu.split(' - ')[0]];
                            const isParentMenu = Object.keys(submenus).some(key => key.startsWith(`${menu} - `));
                            
                            if (isSubTab) {
                                const mainMenuName = menu.split(' - ')[0];
                                const mainAllowedActions = submenus[mainMenuName] || [];
                                const isMainAllChecked = mainAllowedActions.length > 0 && mainAllowedActions.every(a => permissions?.[mainMenuName]?.[a]);
                                if (!isMainAllChecked) {
                                    return null;
                                }
                            }

                            const allowedActions = submenus[menu] || [];
                            const isAllChecked = allowedActions.length > 0 && allowedActions.every(a => permissions?.[menu]?.[a]);

                            return (
                                <div key={menu} className="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 bg-white" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginLeft: isSubTab ? '2.5rem' : '0' }}>
                                    <div className="d-flex align-items-center mb-3 mb-md-0" style={{ minWidth: '180px' }}>
                                        {isSubTab && <div style={{ width: '12px', height: '12px', borderLeft: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1', marginRight: '12px', marginBottom: '6px' }} />}
                                        <h6 className="mb-0 fw-bold text-slate-800" style={{ fontSize: '1.05rem' }}>{isSubTab ? menu.split(' - ')[1] : menu}</h6>
                                    </div>

                                    <div className="d-flex align-items-center gap-2 flex-wrap justify-content-md-end">
                                        {/* All Toggle Button */}
                                        <button
                                            className="btn d-flex align-items-center gap-2"
                                            style={{
                                                backgroundColor: isAllChecked ? '#0f172a' : '#f1f5f9',
                                                color: isAllChecked ? '#fff' : '#475569',
                                                borderRadius: '10px', padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', border: '1px solid transparent'
                                            }}
                                            onClick={() => togglePermission(menu, 'All')}
                                        >
                                            <div className={`permission-toggle-mini ${isAllChecked ? 'checked' : ''}`}>
                                                <div className="slider-mini"></div>
                                            </div>
                                            All
                                        </button>

                                        {/* Granular Action Buttons (Hidden for Parent Menus) */}
                                        {!isParentMenu && (
                                            <>
                                                <div className="vr mx-1 d-none d-md-block" style={{ opacity: 0.15, minHeight: '24px' }}></div>
                                                {allowedActions.map(action => {
                                                    const Icon = ACTION_ICONS[action];
                                                    const isChecked = permissions?.[menu]?.[action] || false;
                                                    const color = ACTION_COLORS[action];

                                                    return (
                                                        <button
                                                            key={action}
                                                            className="btn d-flex align-items-center gap-1"
                                                            style={{
                                                                backgroundColor: isChecked ? color : '#f8fafc',
                                                                color: isChecked ? '#fff' : '#64748b',
                                                                border: isChecked ? `1px solid ${color}` : '1px solid #e2e8f0',
                                                                borderRadius: '10px', padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s'
                                                            }}
                                                            onClick={() => togglePermission(menu, action)}
                                                        >
                                                            <Icon weight={isChecked ? "bold" : "regular"} size={16} />
                                                            {action}
                                                        </button>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top bg-white" style={{ borderColor: '#f1f5f9' }}>
                    <button
                        onClick={onClose}
                        className="btn fw-bold px-4 py-2"
                        style={{ borderRadius: '8px', color: '#fff', backgroundColor: '#f59e0b', border: 'none', transition: 'all 0.2s', minWidth: '110px' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d97706'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f59e0b'}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => setShowSavePopup(true)}
                        className="btn fw-bold px-4 py-2"
                        style={{ borderRadius: '8px', color: '#fff', backgroundColor: '#10b981', border: 'none', transition: 'all 0.2s', minWidth: '110px' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
                    >
                        Save Rights
                    </button>
                </div>
            </div>

            <SavePopup
                isOpen={showSavePopup}
                onClose={() => setShowSavePopup(false)}
                onConfirm={() => {
                    setShowSavePopup(false);
                    if (onSave) onSave();
                    onClose();
                }}
            />
        </div>,
        document.body
    );
};

export default UserRightsPopup;
