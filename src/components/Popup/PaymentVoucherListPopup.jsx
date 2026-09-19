import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTableControls } from '../../hooks/useTableControls';
import TableSortIcon from '../TableSortIcon';
import { ArrowBendUpLeftIcon, XCircleIcon } from '@phosphor-icons/react';
import RevertPopup from './RevertPopup';
import Loader from '../Loader';

const PaymentVoucherListPopup = ({ isOpen, onClose, onRestoreSuccess }) => {
    const [vouchers, setVouchers] = useState([]);
    const [pendingRevertId, setPendingRevertId] = useState(null);
    const [revertConfirmOpen, setRevertConfirmOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const fetchVouchers = async () => {
        setIsLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/payment-voucher-retrieve`, {
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const json = await res.json();
            
            let data = [];
            if (Array.isArray(json)) data = json;
            else if (json && json.data) {
                if (Array.isArray(json.data)) data = json.data;
                else if (Array.isArray(json.data.data)) data = json.data.data;
            }
            
            setVouchers(data.map(v => ({
                id: v.id,
                date: v.displayDate || v.document_date || '',
                voucherType: v.paymentVoucherTypeName || v.payment_voucher_type_name || v.voucher_type_name || v.type_name || v.payment_voucher_type || '',
                payTo: v.payTo || v.pay_to || v.vendor_name || v.customer_name || v.employee_name || v.general_name || v.name || '',
                accountName: v.accountName || v.account_name || v.bank_account_name || '',
                amount: v.amount || 0,
                status: v.statusName || v.status_name || (v.status === 1 ? 'Active' : 'Inactive') || 'Active'
            })).sort((a, b) => b.id - a.id));
        } catch (err) {
            console.error('Error fetching deleted payment vouchers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchVouchers();
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
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/payment-voucher-restore/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const json = await res.json();
            if (json.status === 'success' || json.status === true || res.ok) {
                if (onRestoreSuccess) onRestoreSuccess();
                fetchVouchers();
            } else {
                alert(json.message || 'Failed to revert payment voucher');
            }
        } catch (err) {
            console.error('Error restoring voucher:', err);
            alert('An error occurred while reverting the voucher.');
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
        paginatedData,
        startIndex,
        totalEntries
    } = useTableControls(vouchers);

    const getSortDirection = (key) => sortConfig.key === key ? sortConfig.direction : null;

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
                    <h3 className="tw-text-lg tw-font-bold tw-text-slate-800 tw-m-0">Deleted Payment Vouchers</h3>
                    <button onClick={onClose} className="tw-bg-red-500 tw-text-white hover:tw-bg-red-600 tw-rounded-full tw-border-none tw-cursor-pointer tw-flex tw-items-center tw-justify-center tw-transition-colors" style={{ width: 32, height: 32 }}>
                        <XCircleIcon size={20} weight="bold" />
                    </button>
                </div>

                <div className="tw-p-4 tw-overflow-y-auto" style={{ flex: 1 }}>
                    <div className="list-top-bar tw-mb-4 tw-flex tw-justify-between">
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <span>Show</span>
                            <select className="form-select form-select-sm tw-w-20 tw-inline-block" value={entriesPerPage} onChange={e => setEntriesPerPage(e.target.value)}>
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
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('id')}><div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div></th>
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('date')}><div className="tw-flex tw-justify-between tw-items-center">Date <TableSortIcon direction={getSortDirection('date')} /></div></th>
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('voucherType')}><div className="tw-flex tw-justify-between tw-items-center">Voucher Type <TableSortIcon direction={getSortDirection('voucherType')} /></div></th>
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('payTo')}><div className="tw-flex tw-justify-between tw-items-center">Pay To <TableSortIcon direction={getSortDirection('payTo')} /></div></th>
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('accountName')}><div className="tw-flex tw-justify-between tw-items-center">Account Name <TableSortIcon direction={getSortDirection('accountName')} /></div></th>
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('amount')}><div className="tw-flex tw-justify-between tw-items-center">Amount <TableSortIcon direction={getSortDirection('amount')} /></div></th>
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('status')}><div className="tw-flex tw-justify-between tw-items-center">Status <TableSortIcon direction={getSortDirection('status')} /></div></th>
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Action <TableSortIcon /></div></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((v, idx) => (
                                    <tr key={v.id}>
                                        <td>{startIndex + idx}</td>
                                        <td>{v.date}</td>
                                        <td>{v.voucherType}</td>
                                        <td>{v.payTo}</td>
                                        <td>{v.accountName}</td>
                                        <td>{v.amount}</td>
                                        <td className="tw-align-middle">{v.status === 'Active' ? <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-emerald-500 tw-text-white">Active</span> : <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-red-400 tw-text-white">Inactive</span>}</td>
                                        <td className="tw-align-middle">
                                            <button type="button" title="Revert" disabled={isRestoring} className={`list-action-btn tw-bg-red-500 tw-text-white hover:tw-bg-red-600 tw-border tw-border-red-600 tw-transition-colors ${isRestoring ? 'tw-opacity-50' : ''}`} onClick={() => triggerRestore(v.id)}>
                                                <ArrowBendUpLeftIcon weight="bold" className="tw-w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="tw-text-center tw-text-slate-400 tw-py-8">No deleted records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    )}

                    <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                        <div className="tw-text-gray-600 tw-text-sm">
                            Showing {totalEntries === 0 ? 0 : startIndex} to {Math.min(startIndex + entriesPerPage - 1, totalEntries)} of {totalEntries} entries
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
                title="Revert Payment Voucher"
                message="Are you sure you want to <strong style={{ color: '#2563eb' }}>revert</strong> this payment voucher?<br />It will be restored back to the active list."
            />
        </div>,
        document.body
    );
};

export default PaymentVoucherListPopup;
