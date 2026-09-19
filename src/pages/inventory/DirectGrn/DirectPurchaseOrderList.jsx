import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import Pagination from '../../../components/Pagination';
import DeletePopup from '../../../components/Popup/DeletePopup';
import ErrorPopup from '../../../components/Popup/ErrorPopup';
import DirectPurchaseOrderRevertListPopup from './DirectPurchaseOrderRevertListPopup';
import { useLoader } from '../../../context/LoaderContext';
import { usePermissions } from '../../../context/PermissionContext';
import MobileCard from '../../../components/common/MobileCard';

const DirectPurchaseOrderList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Inventory.Direct GRN.Edit') || hasPermission('Inventory.Direct GRN.Print') || hasPermission('Inventory.Direct GRN.Revert') || hasPermission('Inventory.Direct GRN.Delete');
    const navigate = useNavigate();
    const { setLoading } = useLoader();
    const [search,    setSearch]    = useState('');
    const [pageSize,  setPageSize]  = useState(10);
    const [page,      setPage]      = useState(1);
    const [listData,  setListData]  = useState([]);

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [showRevertListPopup, setShowRevertListPopup] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/direct-grn`, { headers });
            const result = await res.json();
            if (result.status && result.data) {
                const detailedPromises = result.data.map(async (item) => {
                    try {
                        const detailRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/direct-grn/${item.id}`, { headers });
                        const detailResult = await detailRes.json();
                        let totalQty = 0;
                        
                        // The detail API returns 'details' array, not 'products'
                        if (detailResult.status && detailResult.data && Array.isArray(detailResult.data.details)) {
                            totalQty = detailResult.data.details.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
                        } else if (item.quantity) {
                            // Fallback to list API quantity if detail fetch fails structurally
                            totalQty = Number(item.quantity);
                        }
                        
                        return {
                            id: item.id,
                            poNo: item.purchase_order_number || detailResult.data?.header?.po_no || item.grn_number || item.po_number || item.id,
                            poDate: item.purchase_order_date ? item.purchase_order_date.split(' ')[0] : (item.date || (item.created_at ? item.created_at.split('T')[0] : '')),
                            totalQty: totalQty
                        };
                    } catch (err) {
                        console.error(`Error fetching details for GRN ${item.id}`, err);
                        return {
                            id: item.id,
                            poNo: item.purchase_order_number || item.grn_number || item.po_number || item.id,
                            poDate: item.purchase_order_date ? item.purchase_order_date.split(' ')[0] : (item.date || (item.created_at ? item.created_at.split('T')[0] : '')),
                            totalQty: Number(item.quantity) || 0
                        };
                    }
                });
                const formatted = await Promise.all(detailedPromises);
                setListData(formatted);
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const { items: sorted, requestSort, getSortDirection } = useSortableData(listData);

    const q = search.trim().toLowerCase();
    const filtered = q
        ? sorted.filter(r =>
            String(r.poNo   || '').toLowerCase().includes(q) ||
            String(r.poDate || '').toLowerCase().includes(q)
          )
        : sorted;

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage   = Math.min(page, totalPages);
    const startIdx   = (safePage - 1) * pageSize;
    const paginated  = filtered.slice(startIdx, startIdx + pageSize);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        if (!pendingDeleteId) return;
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/direct-grn/${pendingDeleteId}`, {
                method: 'DELETE',
                headers
            });
            const result = await response.json().catch(() => ({}));
            if (response.ok || result.status) {
                setListData(prev => prev.filter(r => r.id !== pendingDeleteId));
                setShowDeletePopup(false);
            } else {
                setErrorMessage(result.message || 'Failed to delete Direct GRN.');
                setShowErrorPopup(true);
                setShowDeletePopup(false);
            }
        } catch (error) {
            console.error('Error deleting:', error);
            setErrorMessage('An error occurred while deleting.');
            setShowErrorPopup(true);
            setShowDeletePopup(false);
        } finally {
            setLoading(false);
            setPendingDeleteId(null);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">

                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
                        <h3 className="card-title tw-m-0">Direct GRN</h3>
                        <div className="tw-flex tw-flex-wrap tw-gap-2 tw-w-full sm:tw-w-auto">
                            {hasPermission('Inventory.Direct GRN.Revert') && (
                                <button
                                    type="button"
                                    className="btn-reset tw-flex-1 sm:tw-flex-none"
                                    onClick={() => setShowRevertListPopup(true)}
                                >
                                    <i className="bi bi-arrow-counterclockwise" style={{ marginRight: '6px' }} />
                                    Revert
                                </button>
                            )}
                            {hasPermission('Inventory.Direct GRN.Add') && (
                                <button
                                    type="button"
                                    className="btn-create tw-flex-1 sm:tw-flex-none"
                                    onClick={() => navigate('/inventory/direct-grn/add')}
                                >
                                    Add GRN
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="card-body">

                        {/* Show entries + Search */}
                        <div className="list-top-bar tw-mb-4 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                <span>Show</span>
                                <select
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={pageSize}
                                    onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                <span className="tw-whitespace-nowrap">Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-flex-1 md:tw-w-48 tw-inline-block"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="tw-hidden md:tw-block">
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                            <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('poNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">PO. No <TableSortIcon direction={getSortDirection('poNo')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('poDate')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">PO. Date <TableSortIcon direction={getSortDirection('poDate')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('totalQty')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Total Quantity <TableSortIcon direction={getSortDirection('totalQty')} /></div>
                                        </th>
                                        {hasActionPermission && (
<th className="tw-align-middle">
                                            <div className="tw-flex tw-justify-between tw-items-center">Action <TableSortIcon direction={null} /></div>
                                        </th>
)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((row, idx) => (
                                        <tr key={row.id}>
                                            <td className="tw-align-middle">{startIdx + idx + 1}</td>
                                            <td className="tw-align-middle tw-font-semibold">{row.poNo}</td>
                                            <td className="tw-align-middle">{row.poDate}</td>
                                            <td className="tw-align-middle">{row.totalQty}</td>
                                            {hasActionPermission && (
<td className="tw-align-middle">
                                                <div className="tw-flex tw-gap-2 tw-items-center">
                                                    {hasPermission('Inventory.Direct GRN.Edit') && (
                                                        <button type="button" className="list-action-btn btn-edit" title="Edit"
                                                            onClick={() => navigate(`/inventory/direct-grn/edit/${row.id}`)}>
                                                            <i className="bi bi-pencil" />
                                                        </button>
                                                    )}
                                                    {hasPermission('Inventory.Direct GRN.Delete') && (
                                                        <button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => handleDelete(row.id)}>
                                                            <i className="bi bi-trash" />
                                                        </button>
                                                    )}
                                                    {hasPermission('Inventory.Direct GRN.Print') && (
                                                        <button type="button" className="list-action-btn btn-print" title="Print"
                                                            onClick={() => window.open(`/print/direct-grn/${row.id}`, '_blank')}>
                                                            <i className="bi bi-printer" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
)}
                                        </tr>
                                    ))}
                                    {paginated.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 5 : 4} className="tw-text-center tw-text-slate-400 tw-py-6">
                                                No data available in table
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        </div>

                        {/* Mobile View */}
                        <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
                            {paginated.map((row, idx) => (
                                <MobileCard key={row.id || idx}>
                                    <MobileCard.Header label="PO. NO" value={row.poNo} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                                            <MobileCard.Field label="PO. Date" value={row.poDate || '-'} />
                                            <MobileCard.Field label="Total Quantity" value={row.totalQty} align="right" bold valueColor="blue" />
                                        </div>
                                    </MobileCard.Body>
                                    {hasActionPermission && (
                                        <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                            <MobileCard.Actions>
                                                {hasPermission('Inventory.Direct GRN.Edit') && (
                                                    <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/inventory/direct-grn/edit/${row.id}`)}>
                                                        <i className="bi bi-pencil" />
                                                    </button>
                                                )}
                                                {hasPermission('Inventory.Direct GRN.Delete') && (
                                                    <button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => handleDelete(row.id)}>
                                                        <i className="bi bi-trash" />
                                                    </button>
                                                )}
                                                {hasPermission('Inventory.Direct GRN.Print') && (
                                                    <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/direct-grn/${row.id}`, '_blank')}>
                                                        <i className="bi bi-printer" />
                                                    </button>
                                                )}
                                            </MobileCard.Actions>
                                        </MobileCard.Footer>
                                    )}
                                </MobileCard>
                            ))}
                            {paginated.length === 0 && (
                                <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                                    No records found
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-sm tw-text-slate-500">
                                Showing {filtered.length === 0 ? 0 : startIdx + 1} to {Math.min(startIdx + pageSize, filtered.length)} of {filtered.length} entries
                            </div>
                            <Pagination 
                                currentPage={safePage} 
                                totalPages={totalPages} 
                                onPageChange={setPage} 
                            />
                        </div>

                    </div>
                </div>
            </div>
            <DeletePopup
                isOpen={showDeletePopup}
                onClose={() => { setShowDeletePopup(false); setPendingDeleteId(null); }}
                onConfirm={confirmDelete}
            />
            <ErrorPopup
                isOpen={showErrorPopup}
                onClose={() => setShowErrorPopup(false)}
                message={errorMessage}
            />
            <DirectPurchaseOrderRevertListPopup
                isOpen={showRevertListPopup}
                onClose={() => setShowRevertListPopup(false)}
                onSuccess={fetchData}
            />
        </section>
    );
};

export default DirectPurchaseOrderList;
