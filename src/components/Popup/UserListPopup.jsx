import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTableControls } from '../../hooks/useTableControls';
import TableSortIcon from '../TableSortIcon';
import { ArrowBendUpLeftIcon, XCircleIcon } from '@phosphor-icons/react';
import RevertPopup from './RevertPopup';
import Loader from '../Loader';
import { apiFetch } from '../../lib/api.js';

const UserListPopup = ({ isOpen, onClose, onRestoreSuccess }) => {
    const [users, setUsers] = useState([]);
    const [pendingRevertId, setPendingRevertId] = useState(null);
    const [revertConfirmOpen, setRevertConfirmOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch('/roles/users/admin/users/deleted');
            
            if (response && response.json) {
                const json = response.json;
                let data = [];
                if (Array.isArray(json)) data = json;
                else if (json.data) {
                    if (Array.isArray(json.data)) data = json.data;
                    else if (Array.isArray(json.data.data)) data = json.data.data;
                }
                setUsers(data);
            }
        } catch (err) {
            console.error('Error fetching deleted users:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const triggerRestore = (id) => {
        setPendingRevertId(id);
        setRevertConfirmOpen(true);
    };

    const confirmRestore = async () => {
        if (!pendingRevertId) return;
        const id = pendingRevertId;
        setIsRestoring(true);
        try {
            const response = await apiFetch(`/roles/users/admin/users/restore/${id}`, {
                method: 'POST'
            });
            
            if (response && response.res && (response.res.ok || response.json?.status === 'success' || response.json?.status === true)) {
                if (onRestoreSuccess) onRestoreSuccess();
                fetchUsers();
            } else {
                alert(response?.json?.message || 'Failed to revert user');
            }
        } catch (err) {
            console.error('Error restoring user:', err);
            alert('An error occurred while reverting the user.');
        } finally {
            setIsRestoring(false);
            setRevertConfirmOpen(false);
            setPendingRevertId(null);
        }
    };

    const {
        sortConfig,
        handleSort,
        entriesPerPage,
        setEntriesPerPage,
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedData: sortedData,
        startIndex,
        totalEntries
    } = useTableControls(users);

    if (!isOpen) return null;

    return createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`
                @keyframes popInList {
                    0%  { opacity: 0; transform: scale(0.95) translateY(10px); }
                    100%{ opacity: 1; transform: scale(1) translateY(0); }
                }
                .list-popup-box-anim {
                    animation: popInList 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
                }
            `}</style>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(3px)' }} />
            
            <div className="list-popup-box-anim" style={{ position: 'relative', background: '#fff', borderRadius: 12, width: '90%', maxWidth: 1200, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.22)' }}>
                <div className="tw-flex tw-justify-between tw-items-center tw-p-4 tw-border-b tw-border-slate-200">
                    <h3 className="tw-text-lg tw-font-bold tw-text-slate-800 tw-m-0">Deleted Users</h3>
                    <button onClick={onClose} className="tw-bg-red-500 tw-text-white hover:tw-bg-red-600 tw-rounded-full tw-border-none tw-cursor-pointer tw-flex tw-items-center tw-justify-center tw-transition-colors" style={{ width: 32, height: 32 }}>
                        <XCircleIcon size={20} weight="bold" />
                    </button>
                </div>

                <div className="tw-p-4 tw-overflow-y-auto" style={{ flex: 1 }}>
                    <div className="list-top-bar tw-mb-4 tw-flex tw-justify-between">
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <span>Show</span>
                            <select className="form-select form-select-sm tw-w-20 tw-inline-block" value={entriesPerPage} onChange={e => setEntriesPerPage(Number(e.target.value))}>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span>entries</span>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <span>Search:</span>
                            <input type="text" className="form-control form-control-sm tw-w-48 tw-inline-block" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="tw-flex tw-justify-center tw-items-center tw-py-20">
                            <Loader />
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th onClick={() => handleSort('name')} className="tw-cursor-pointer tw-select-none">Name <TableSortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('email')} className="tw-cursor-pointer tw-select-none">Email <TableSortIcon direction={sortConfig.key === 'email' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('role')} className="tw-cursor-pointer tw-select-none">Role <TableSortIcon direction={sortConfig.key === 'role' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((u, index) => (
                                        <tr key={u.id}>
                                            <td>{startIndex + index}</td>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>{u.role ? u.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''}</td>
                                            <td>
                                                <span className="badge badge-success" style={{ backgroundColor: u.status === 1 ? '#28a745' : '#dc3545' }}>
                                                    {u.status === 1 ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="tw-align-middle">
                                                <button type="button" title="Revert" disabled={isRestoring} className={`list-action-btn tw-bg-red-500 tw-text-white hover:tw-bg-red-600 tw-border tw-border-red-600 tw-transition-colors ${isRestoring ? 'tw-opacity-50' : ''}`} onClick={() => triggerRestore(u.id)}>
                                                    <ArrowBendUpLeftIcon weight="bold" className="tw-w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {sortedData.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="tw-text-center tw-text-slate-400 tw-py-8">No deleted records found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                        <div className="tw-text-gray-600 tw-text-sm">
                            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, totalEntries)} of {totalEntries} entries
                        </div>
                        <div className="tw-flex tw-items-center">
                            <button className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-r-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                            <button className="btn btn-sm tw-bg-blue-500 tw-text-white tw-border-blue-500 tw-rounded-none tw-px-3">{currentPage}</button>
                            <button className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-l-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <RevertPopup 
                isOpen={revertConfirmOpen} 
                onClose={() => { setRevertConfirmOpen(false); setPendingRevertId(null); }} 
                onConfirm={confirmRestore} 
                title="Revert User"
                message="Are you sure you want to <strong style={{ color: '#2563eb' }}>revert</strong> this user?<br />It will be restored back to the active list."
            />
        </div>,
        document.body
    );
};

export default UserListPopup;
