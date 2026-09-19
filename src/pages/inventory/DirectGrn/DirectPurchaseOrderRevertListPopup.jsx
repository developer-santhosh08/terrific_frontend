import React, { useState, useEffect } from 'react';
import RevertPopup from '../../../components/Popup/RevertPopup';
import ErrorPopup from '../../../components/Popup/ErrorPopup';
import { useLoader } from '../../../context/LoaderContext';
import Pagination from '../../../components/Pagination';

const DirectPurchaseOrderRevertListPopup = ({ isOpen, onClose, onSuccess }) => {
    const { setLoading } = useLoader();
    const [revertedList, setRevertedList] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showRevertConfirm, setShowRevertConfirm] = useState(false);
    const [pendingRestoreId, setPendingRestoreId] = useState(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchRevertedData = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/direct-grn-reverted`, { headers });
            const result = await response.json();
            if (result.status && result.data) {
                setRevertedList(result.data);
            }
        } catch (error) {
            console.error('Error fetching reverted GRNs:', error);
            setErrorMessage('An error occurred while fetching reverted items.');
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchRevertedData();
            setPage(1);
        } else {
            setRevertedList([]);
        }
    }, [isOpen]);

    const handleRestoreClick = (id) => {
        setPendingRestoreId(id);
        setShowRevertConfirm(true);
    };

    const confirmRestore = async () => {
        if (!pendingRestoreId) return;
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/direct-grn/${pendingRestoreId}/restore`, {
                method: 'POST',
                headers
            });
            const result = await response.json().catch(() => ({}));
            if (response.ok || result.status) {
                setRevertedList(prev => prev.filter(r => r.id !== pendingRestoreId));
                setShowRevertConfirm(false);
                if (onSuccess) onSuccess(); // refresh the main list
                if (revertedList.length === 1) onClose(); // close popup if empty
            } else {
                setErrorMessage(result.message || 'Failed to restore Direct GRN.');
                setShowErrorPopup(true);
                setShowRevertConfirm(false);
            }
        } catch (error) {
            console.error('Error restoring:', error);
            setErrorMessage('An error occurred while restoring.');
            setShowErrorPopup(true);
            setShowRevertConfirm(false);
        } finally {
            setLoading(false);
            setPendingRestoreId(null);
        }
    };

    if (!isOpen) return null;

    const totalPages = Math.max(1, Math.ceil(revertedList.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const paginated = revertedList.slice(startIdx, startIdx + pageSize);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1040, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Overlay */}
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }} />

            {/* Modal Content */}
            <div style={{ position: 'relative', background: '#fff', borderRadius: 8, width: '90%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.22)' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ margin: 0, fontWeight: 600, fontSize: '1.25rem' }}>Deleted Direct GRNs</h5>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
                </div>
                
                <div style={{ padding: '24px', overflowY: 'auto' }}>
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped no-margin">
                            <thead>
                                <tr>
                                    <th className="tw-align-middle">#</th>
                                    <th className="tw-align-middle">PO. No</th>
                                    <th className="tw-align-middle">PO. Date</th>
                                    <th className="tw-align-middle">Vendor</th>
                                    <th className="tw-align-middle">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((row, idx) => (
                                    <tr key={row.id}>
                                        <td className="tw-align-middle">{startIdx + idx + 1}</td>
                                        <td className="tw-align-middle tw-font-semibold">{row.purchase_order_number || row.id}</td>
                                        <td className="tw-align-middle">{row.purchase_order_date ? row.purchase_order_date.split(' ')[0] : ''}</td>
                                        <td className="tw-align-middle">{row.vendor?.name || '-'}</td>
                                        <td className="tw-align-middle">
                                            <button 
                                                type="button" 
                                                className="btn btn-sm btn-success" 
                                                title="Restore"
                                                onClick={() => handleRestoreClick(row.id)}
                                            >
                                                <i className="bi bi-arrow-counterclockwise" /> Restore
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {paginated.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="tw-text-center tw-text-slate-400 tw-py-6">
                                            No deleted GRNs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {revertedList.length > 0 && (
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-sm tw-text-slate-500">
                                Showing {startIdx + 1} to {Math.min(startIdx + pageSize, revertedList.length)} of {revertedList.length} entries
                            </div>
                            <Pagination 
                                currentPage={safePage} 
                                totalPages={totalPages} 
                                onPageChange={setPage} 
                            />
                        </div>
                    )}
                </div>
            </div>

            <RevertPopup
                isOpen={showRevertConfirm}
                onClose={() => { setShowRevertConfirm(false); setPendingRestoreId(null); }}
                onConfirm={confirmRestore}
                title="Restore GRN"
                message={<>Are you sure you want to <strong style={{ color: '#059669' }}>restore</strong> this Direct GRN?</>}
            />
            
            <ErrorPopup
                isOpen={showErrorPopup}
                onClose={() => setShowErrorPopup(false)}
                message={errorMessage}
            />
        </div>
    );
};

export default DirectPurchaseOrderRevertListPopup;
