import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusIcon, PencilSimpleIcon, PrinterIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import { useLoader } from '../../../context/LoaderContext';
import Pagination from '../../../components/Pagination';
import DeletePopup from '../../../components/Popup/DeletePopup';
import { usePermissions } from '../../../context/PermissionContext';
import MobileCard from '../../../components/common/MobileCard';

const PurchaseOrderList = () => {
    const { hasPermission, refreshPermissions } = usePermissions();
    const navigate = useNavigate();
    const location = useLocation();

    const hasPurchaseListView = hasPermission('Inventory.Purchase Order List - Purchase list.View');
    const hasFollowupListView = hasPermission('Inventory.Purchase Order List - In followup list.View');

    const [activeTab, setActiveTab] = useState(() => {
        if (location.state?.activeTab) return location.state.activeTab;
        if (hasPurchaseListView) return 'purchase_list';
        if (hasFollowupListView) return 'in_follow_up';
        return 'purchase_list';
    });

    const basePerm = activeTab === 'purchase_list' ? 'Inventory.Purchase Order List - Purchase list' : 'Inventory.Purchase Order List - In followup list';
    const hasActionPermission = hasPermission(`${basePerm}.Edit`) || hasPermission(`${basePerm}.Delete`) || hasPermission(`${basePerm}.Print`);

    const { setLoading } = useLoader();
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [purchaseOrderData, setPurchaseOrderData] = useState([]);

    useEffect(() => {
        const fetchPurchaseOrders = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/purchase-orders?tab=${activeTab}`, { headers });
                const result = await response.json();

                if (result.status && result.data) {
                    const formattedData = result.data.map(item => {
                        const nextDateStr = item.next_followup_date || item.followup_date || '';
                        let fStatus = 'Pending';
                        let fColor = 'tw-bg-yellow-500';

                        if (nextDateStr) {
                            const parts = nextDateStr.split('-');
                            if (parts.length === 3) {
                                const followDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                if (followDate.getTime() === today.getTime()) {
                                    fStatus = 'Today';
                                    fColor = 'tw-bg-green-500';
                                } else if (followDate.getTime() > today.getTime()) {
                                    fStatus = 'In Followup';
                                    fColor = 'tw-bg-blue-500';
                                } else {
                                    fStatus = 'Overdue';
                                    fColor = 'tw-bg-red-500';
                                }
                            }
                        }

                        return {
                            id: item.id,
                            poNo: item.po_no || item.purchase_order_number || '',
                            poDate: item.po_date || (item.purchase_order_date ? item.purchase_order_date.split(' ')[0] : ''),
                            totalQty: item.total_quantity || item.quantity || 0,
                            vendorName: item.vendor_name || (item.vendor ? item.vendor.name : ''),
                            productType: 'Product',
                            mobile: item.mobile || '',
                            createdBy: item.created_by || 'Admin',
                            status: item.status || item.status_label || 'Pending',
                            nextFollowupDate: nextDateStr,
                            followupStatus: fStatus,
                            followupColor: fColor,
                        };
                    });
                    setPurchaseOrderData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching PO list:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPurchaseOrders();
    }, [activeTab]);

    const { items: sortedData, requestSort, getSortDirection } = useSortableData(purchaseOrderData);

    const triggerDelete = (id) => {
        setDeleteId(id);
        setIsDeletePopupOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeletePopupOpen(false);
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/purchase-orders/${deleteId}`, {
                method: 'DELETE',
                headers
            });
            const result = await response.json();
            if (result.status) {
                setPurchaseOrderData(prev => prev.filter(item => item.id !== deleteId));
            } else {
                window.alert(result.message || 'Failed to delete Purchase Order');
            }
        } catch (error) {
            console.error("Error deleting PO:", error);
            window.alert('An error occurred while deleting.');
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    const filtered = sortedData.filter((row) => {
        const q = (searchText || '').toLowerCase();
        return (
            String(row.poNo || '').toLowerCase().includes(q) ||
            String(row.poDate || '').toLowerCase().includes(q) ||
            String(row.totalQty || '').toLowerCase().includes(q) ||
            String(row.vendorName || '').toLowerCase().includes(q) ||
            String(row.productType || '').toLowerCase().includes(q) ||
            String(row.mobile || '').toLowerCase().includes(q) ||
            String(row.createdBy || '').toLowerCase().includes(q) ||
            String(row.status || '').toLowerCase().includes(q)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const pageRows = filtered.slice(startIdx, startIdx + pageSize);

    const handleFollowupDateChange = async (id, dateValue) => {
        // Optimistic UI update for instant feedback
        let fStatus = 'Pending';
        let fColor = 'tw-bg-yellow-500';
        let nextDateStr = '';

        if (dateValue) {
            const parts = dateValue.split('-'); // dateValue from input is YYYY-MM-DD
            if (parts.length === 3) {
                nextDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`; // format as DD-MM-YYYY for our state
                const followDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}T00:00:00`);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (followDate.getTime() === today.getTime()) {
                    fStatus = 'Today';
                    fColor = 'tw-bg-green-500';
                } else if (followDate.getTime() > today.getTime()) {
                    fStatus = 'In Followup';
                    fColor = 'tw-bg-blue-500';
                } else {
                    fStatus = 'Overdue';
                    fColor = 'tw-bg-red-500';
                }
            }
        }

        setPurchaseOrderData(prev => prev.map(item => item.id === id ? { 
            ...item, 
            nextFollowupDate: nextDateStr,
            followupStatus: fStatus,
            followupColor: fColor
        } : item));

        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/purchase-orders/followup/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ next_followup_date: dateValue })
            });
        } catch (error) {
            console.error('Error updating follow up date:', error);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
                        <h3 className="card-title tw-m-0">Purchase Order List</h3>
                        {hasPermission(`${basePerm}.Add`) && (
                            <button
                                type="button"
                                className="btn-create tw-w-full sm:tw-w-auto"
                                onClick={() => navigate('/inventory/purchase-order/add')}
                            >
                                Add PO
                            </button>
                        )}
                    </div>

                    <div className="card-body">                        {/* Tabs */}
                        <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mb-3">
                            {hasPurchaseListView && (
                                <button
                                    type="button"
                                    className={`tw-px-4 tw-py-2 tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-rounded-sm ${activeTab === 'purchase_list' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('purchase_list'); setCurrentPage(1);  }}
                                >
                                    Purchase List
                                </button>
                            )}
                            {hasFollowupListView && (
                                <button
                                    type="button"
                                    className={`tw-px-4 tw-py-2 tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-rounded-sm ${activeTab === 'in_follow_up' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('in_follow_up'); setCurrentPage(1);  }}
                                >
                                    In Follow Up
                                </button>
                            )}
                        </div>

                        <div className="list-top-bar tw-mb-4 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                <span>Show</span>
                                <select
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                <span className="tw-whitespace-nowrap">Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-flex-1 md:tw-w-48 tw-inline-block"
                                    placeholder="PO no, date..."
                                    value={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="tw-hidden md:tw-block">
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                # <TableSortIcon direction={getSortDirection('id')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('poNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                PO. No <TableSortIcon direction={getSortDirection('poNo')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('poDate')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                PO. Date <TableSortIcon direction={getSortDirection('poDate')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('totalQty')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                Total Quantity <TableSortIcon direction={getSortDirection('totalQty')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('vendorName')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                Vendor Name <TableSortIcon direction={getSortDirection('vendorName')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('productType')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                Product Type <TableSortIcon direction={getSortDirection('productType')} />
                                            </div>
                                        </th>

                                        {activeTab === 'in_follow_up' && (
                                            <>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('nextFollowupDate')}>
                                                    <div className="tw-flex tw-justify-between tw-items-center">
                                                        Next Followup Date <TableSortIcon direction={getSortDirection('nextFollowupDate')} />
                                                    </div>
                                                </th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('followupStatus')}>
                                                    <div className="tw-flex tw-justify-between tw-items-center">
                                                        Followup Status <TableSortIcon direction={getSortDirection('followupStatus')} />
                                                    </div>
                                                </th>
                                            </>
                                        )}

                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                Mobile <TableSortIcon direction={getSortDirection('mobile')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('createdBy')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                Created By <TableSortIcon direction={getSortDirection('createdBy')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('status')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                Status <TableSortIcon direction={getSortDirection('status')} />
                                            </div>
                                        </th>
                                        {hasActionPermission && <th className="tw-align-middle">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.map((row, idx) => (
                                        <tr key={row.id}>
                                            <td>{startIdx + idx + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{row.poNo}</td>
                                            <td>{row.poDate}</td>
                                            <td>{row.totalQty}</td>
                                            <td>{row.vendorName}</td>
                                            <td>{row.productType}</td>

                                            {activeTab === 'in_follow_up' && (
                                                <>
                                                    <td>
                                                        <input 
                                                            type="date" 
                                                            className="form-control form-control-sm"
                                                            style={{ width: '130px' }}
                                                            value={row.nextFollowupDate ? row.nextFollowupDate.split('-').reverse().join('-') : ''}
                                                            onChange={(e) => handleFollowupDateChange(row.id, e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium ${row.followupColor || 'tw-bg-blue-500'} tw-text-white`}
                                                        >
                                                            {row.followupStatus}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            <td>
                                                <a href={`tel:${row.mobile}`} className="tw-text-blue-600 hover:tw-underline">
                                                    {row.mobile}
                                                </a>
                                            </td>
                                            <td>{row.createdBy}</td>
                                            <td>
                                                <span
                                                    className={`tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium ${
                                                        row.status?.toLowerCase() === 'active'
                                                            ? 'tw-bg-green-500 tw-text-white'
                                                            : row.status?.toLowerCase() === 'inactive'
                                                                ? 'tw-bg-red-500 tw-text-white'
                                                                : 'tw-bg-gray-500 tw-text-white'
                                                    }`}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
                                                <td>
                                                    <div className="tw-flex tw-gap-2 tw-items-center">
                                                        {hasPermission(`${basePerm}.Edit`) && (
                                                            <button
                                                                type="button"
                                                                className="list-action-btn btn-edit"
                                                                title="Edit"
                                                                onClick={() => navigate(`/inventory/purchase-order/edit/${row.id}`, { state: { activeTab } })}
                                                            >
                                                                <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                        {hasPermission(`${basePerm}.Print`) && (
                                                            <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/purchase-order/${row.id}`, '_blank')}>
                                                                <PrinterIcon weight="duotone" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                        {hasPermission(`${basePerm}.Delete`) && (
                                                            <button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => triggerDelete(row.id)}>
                                                                <TrashIcon weight="duotone" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {pageRows.length === 0 && (
                                        <tr>
                                            <td colSpan={activeTab === 'in_follow_up' ? 12 : 10} className="tw-text-center tw-text-slate-400 tw-py-8">
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        </div>

                        {/* Mobile View */}
                        <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
                            {pageRows.map((row, idx) => (
                                <MobileCard key={row.id || idx}>
                                    <MobileCard.Header label="PO. NO" value={row.poNo} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-mb-2">
                                            <MobileCard.Field label="PO. Date" value={row.poDate || '-'} />
                                            <MobileCard.Field label="Total Qty" value={row.totalQty} align="right" bold />
                                            <MobileCard.Field label="Vendor" value={row.vendorName || '-'} />
                                            <MobileCard.Field label="Product Type" value={row.productType || '-'} align="right" />
                                        </div>
                                        {activeTab === 'in_follow_up' && (
                                            <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-border-t tw-border-slate-100 tw-py-2 tw-mb-2">
                                                <div>
                                                    <div className="tw-text-xs tw-text-slate-500 tw-mb-1">Next Followup</div>
                                                    <input 
                                                        type="date" 
                                                        className="form-control form-control-sm tw-w-full"
                                                        value={row.nextFollowupDate ? row.nextFollowupDate.split('-').reverse().join('-') : ''}
                                                        onChange={(e) => handleFollowupDateChange(row.id, e.target.value)}
                                                    />
                                                </div>
                                                <div className="tw-text-right">
                                                    <div className="tw-text-xs tw-text-slate-500 tw-mb-1">Status</div>
                                                    <span className={`tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium ${row.followupColor || 'tw-bg-blue-500'} tw-text-white`}>
                                                        {row.followupStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-border-t tw-border-slate-100 tw-pt-2">
                                            <MobileCard.Field label="Mobile" value={row.mobile || '-'} />
                                            <MobileCard.Field label="Created By" value={row.createdBy || '-'} align="right" />
                                        </div>
                                    </MobileCard.Body>
                                    {hasActionPermission && (
                                        <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                            <MobileCard.Actions>
                                                {hasPermission(`${basePerm}.Edit`) && (
                                                    <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/inventory/purchase-order/edit/${row.id}`, { state: { activeTab } })}>
                                                        <PencilSimpleIcon weight="bold" className="tw-w-4 tw-h-4" />
                                                    </button>
                                                )}
                                                {hasPermission(`${basePerm}.Print`) && (
                                                    <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/purchase-order/${row.id}`, '_blank')}>
                                                        <PrinterIcon weight="bold" className="tw-w-4 tw-h-4" />
                                                    </button>
                                                )}
                                                {hasPermission(`${basePerm}.Delete`) && (
                                                    <button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => triggerDelete(row.id)}>
                                                        <TrashIcon weight="bold" className="tw-w-4 tw-h-4" />
                                                    </button>
                                                )}
                                            </MobileCard.Actions>
                                        </MobileCard.Footer>
                                    )}
                                </MobileCard>
                            ))}
                            {pageRows.length === 0 && (
                                <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                                    No records found
                                </div>
                            )}
                        </div>

                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-gray-600 tw-text-sm">
                                Showing {filtered.length === 0 ? 0 : startIdx + 1} to {Math.min(startIdx + pageSize, filtered.length)} of {filtered.length} entries
                            </div>
                            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>
                    </div>
                </div>
            </div>
            <DeletePopup 
                isOpen={isDeletePopupOpen}
                onClose={() => setIsDeletePopupOpen(false)}
                onConfirm={handleDelete}
            />
        </section>
    );
};

export default PurchaseOrderList;
