import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusIcon, PencilSimpleIcon, PrinterIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import DeletePopup from '../../../components/Popup/DeletePopup';
import { useSortableData } from '../../../hooks/useSortableData';
import { useLoader } from '../../../context/LoaderContext';
import Pagination from '../../../components/Pagination';
import { usePermissions } from '../../../context/PermissionContext';
import MobileCard from '../../../components/common/MobileCard';

const GrnList = () => {
    const { hasPermission, refreshPermissions } = usePermissions();

    const hasInspectionView = hasPermission('Inventory.GRN Inspection List - GRN Inspection.View');
    const hasCompletedView = hasPermission('Inventory.GRN Inspection List - Completed GRN Inspection.View');

    const navigate = useNavigate();
    const location = useLocation();
    const { setLoading } = useLoader();

    const [activeTab, setActiveTab] = useState(() => {
        if (location.state?.tab) return location.state.tab;
        if (hasInspectionView) return 'inspection';
        if (hasCompletedView) return 'completed';
        return 'inspection';
    });

    const basePerm = activeTab === 'inspection' ? 'Inventory.GRN Inspection List - GRN Inspection' : 'Inventory.GRN Inspection List - Completed GRN Inspection';
    const hasActionPermission = hasPermission(`${basePerm}.Edit`);
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [inspectionData, setInspectionData] = useState([]);
    const [completedData, setCompletedData] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        const fetchGrnData = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                
                const url = activeTab === 'inspection' 
                    ? `${import.meta.env.VITE_API_BASE_URL}/api/inventory/grn`
                    : `${import.meta.env.VITE_API_BASE_URL}/api/inventory/grn/completed`;

                const response = await fetch(url, { headers });
                const result = await response.json();

                if (result.status && result.data) {
                    const formattedData = result.data.map(item => ({
                        id: item.id,
                        grnNo: item.grn_no || '',
                        poNo: item.po_no || '',
                        invoiceNo: item.invoice_number || '',
                        inspectionDate: item.created_date ? item.created_date.split(' ')[0] : '',
                        vendorName: item.vendor_name || '',
                        productType: 'Product',
                        total: item.total || 0,
                        accept: item.accept || 0,
                        returnQty: item.return || item.returnQty || 0,
                        pending: item.pending || 0,
                        cancelQty: item.cancel || item.cancelQty || 0,
                        reject: item.reject || 0,
                    }));
                    if (activeTab === 'inspection') {
                        setInspectionData(formattedData);
                    } else {
                        setCompletedData(formattedData);
                    }
                }
            } catch (error) {
                console.error("Error fetching GRN list:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGrnData();
    }, [activeTab]);

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/grn/${itemToDelete.id}`, {
                method: 'DELETE',
                headers
            });
            const result = await response.json();
            if (result.status) {
                setInspectionData(prev => prev.filter(i => i.id !== itemToDelete.id));
                setCompletedData(prev => prev.filter(i => i.id !== itemToDelete.id));
            } else {
                console.error("Delete failed:", result.message);
            }
        } catch (error) {
            console.error("Error deleting GRN:", error);
        } finally {
            setLoading(false);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const { items: sortedInspection, requestSort: requestSortInspection, getSortDirection: getSortDirectionInspection } = useSortableData(inspectionData);
    const { items: sortedCompleted, requestSort: requestSortCompleted, getSortDirection: getSortDirectionCompleted } = useSortableData(completedData);

    const renderInspectionTable = (items, requestSort, getSortDirection, startIndex) => (
        <>
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
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invoiceNo')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Invoice No <TableSortIcon direction={getSortDirection('invoiceNo')} />
                            </div>
                        </th>
                        {/* <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('inspectionDate')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Insp. Date <TableSortIcon direction={getSortDirection('inspectionDate')} />
                            </div>
                        </th> */}
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
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('total')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Total <TableSortIcon direction={getSortDirection('total')} />
                            </div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('accept')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Accept <TableSortIcon direction={getSortDirection('accept')} />
                            </div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('returnQty')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Return <TableSortIcon direction={getSortDirection('returnQty')} />
                            </div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('pending')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Pending <TableSortIcon direction={getSortDirection('pending')} />
                            </div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('cancelQty')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Cancel <TableSortIcon direction={getSortDirection('cancelQty')} />
                            </div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('reject')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Reject <TableSortIcon direction={getSortDirection('reject')} />
                            </div>
                        </th>
                        {hasActionPermission && <th className="tw-align-middle">Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((row, idx) => (
                        <tr key={row.id}>
                            <td>{startIndex + idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>{row.poNo}</td>
                            <td>{row.invoiceNo}</td>
                            {/* <td>{row.inspectionDate}</td> */}
                            <td>{row.vendorName}</td>
                            <td>{row.productType}</td>
                            <td>{row.total}</td>
                            <td>{row.accept}</td>
                            <td>{row.returnQty}</td>
                            <td>{row.pending}</td>
                            <td>{row.cancelQty}</td>
                            <td>{row.reject}</td>
                            {hasActionPermission && (
                                <td>
                                    <div className="tw-flex tw-gap-2 tw-items-center">
                                        {hasPermission(`${basePerm}.Edit`) && (
                                            <button
                                                type="button"
                                                className="list-action-btn btn-edit"
                                                title="Edit"
                                                onClick={() => navigate(`/inventory/grn-inspection/edit/${row.id}`, { state: { tab: activeTab } })}
                                            >
                                                <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                            </button>
                                        )}
                                        {/* <button 
                                            type="button" 
                                            className="list-action-btn btn-delete" 
                                            title="Delete"
                                            onClick={() => { setItemToDelete(row); setDeleteModalOpen(true); }}
                                        >
                                            <TrashIcon weight="duotone" className="tw-w-4" />
                                        </button> */}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={hasActionPermission ? 12 : 11} className="tw-text-center tw-text-slate-400 tw-py-8">
                                No records found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        </div>
        <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
            {items.map((row, idx) => (
                <MobileCard key={row.id || idx}>
                    <MobileCard.Header label="PO. NO" value={row.poNo} />
                    <MobileCard.Body>
                        <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-mb-2">
                            <MobileCard.Field label="Invoice No" value={row.invoiceNo || '-'} />
                            <MobileCard.Field label="Vendor" value={row.vendorName || '-'} align="right" />
                            <MobileCard.Field label="Product Type" value={row.productType || '-'} />
                            <MobileCard.Field label="Total" value={row.total} align="right" />
                        </div>
                        <div className="tw-grid tw-grid-cols-3 tw-gap-2 tw-pt-2 tw-border-t tw-border-slate-100">
                            <MobileCard.Field label="Accept" value={row.accept} bold valueColor="green" />
                            <MobileCard.Field label="Return" value={row.returnQty} bold valueColor="red" />
                            <MobileCard.Field label="Pending" value={row.pending} bold valueColor="orange" />
                            <MobileCard.Field label="Cancel" value={row.cancelQty} />
                            <MobileCard.Field label="Reject" value={row.reject} />
                        </div>
                    </MobileCard.Body>
                    {hasActionPermission && (
                        <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                            <MobileCard.Actions>
                                {hasPermission(`${basePerm}.Edit`) && (
                                    <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/inventory/grn-inspection/edit/${row.id}`, { state: { tab: activeTab } })}>
                                        <PencilSimpleIcon weight="bold" className="tw-w-4 tw-h-4" />
                                    </button>
                                )}
                            </MobileCard.Actions>
                        </MobileCard.Footer>
                    )}
                </MobileCard>
            ))}
            {items.length === 0 && (
                <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                    No records found
                </div>
            )}
        </div>
        </>
    );

    const renderCompletedTable = (items, requestSort, getSortDirection, startIndex) => (
        <>
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
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('grnNo')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                GRN. No <TableSortIcon direction={getSortDirection('grnNo')} />
                            </div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('poNo')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                PO. No <TableSortIcon direction={getSortDirection('poNo')} />
                            </div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invoiceNo')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Invoice No <TableSortIcon direction={getSortDirection('invoiceNo')} />
                            </div>
                        </th>
                        {/* <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('inspectionDate')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Insp. Date <TableSortIcon direction={getSortDirection('inspectionDate')} />
                            </div>
                        </th> */}
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
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('total')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Total <TableSortIcon direction={getSortDirection('total')} />
                            </div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('accept')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Accept <TableSortIcon direction={getSortDirection('accept')} />
                            </div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('returnQty')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Return <TableSortIcon direction={getSortDirection('returnQty')} />
                            </div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('pending')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Pending <TableSortIcon direction={getSortDirection('pending')} />
                            </div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('cancelQty')}>
                            <div className="tw-flex tw-justify-between tw-items-center">
                                Cancel <TableSortIcon direction={getSortDirection('cancelQty')} />
                            </div>
                        </th>
                        {hasActionPermission && <th className="tw-align-middle">Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((row, idx) => (
                        <tr key={row.id}>
                            <td>{startIndex + idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>{row.grnNo}</td>
                            <td>{row.poNo}</td>
                            <td>{row.invoiceNo}</td>
                            {/* <td>{row.inspectionDate}</td> */}
                            <td>{row.vendorName}</td>
                            <td>{row.productType}</td>
                            <td>{row.total}</td>
                            <td>{row.accept}</td>
                            <td>{row.returnQty}</td>
                            <td>{row.pending}</td>
                            <td>{row.cancelQty}</td>
                            {hasActionPermission && (
                                <td>
                                    <div className="tw-flex tw-gap-2 tw-items-center">
                                        {hasPermission(`${basePerm}.Edit`) && (
                                            <button
                                                type="button"
                                                className="list-action-btn btn-edit"
                                                title="Edit"
                                                onClick={() => navigate(`/inventory/grn-inspection/edit/${row.id}`, { state: { tab: activeTab } })}
                                            >
                                                <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                            </button>
                                        )}
                                        {/* <button 
                                            type="button" 
                                            className="list-action-btn btn-delete" 
                                            title="Delete"
                                            onClick={() => { setItemToDelete(row); setDeleteModalOpen(true); }}
                                        >
                                            <TrashIcon weight="duotone" className="tw-w-4" />
                                        </button> */}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={hasActionPermission ? 12 : 11} className="tw-text-center tw-text-slate-400 tw-py-8">
                                No records found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        </div>
        <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
            {items.map((row, idx) => (
                <MobileCard key={row.id || idx}>
                    <MobileCard.Header label="GRN NO" value={row.grnNo || '-'} />
                    <MobileCard.Body>
                        <MobileCard.Field label="PO. No" value={row.poNo || '-'} bold />
                        <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-my-2">
                            <MobileCard.Field label="Invoice No" value={row.invoiceNo || '-'} />
                            <MobileCard.Field label="Vendor" value={row.vendorName || '-'} align="right" />
                            <MobileCard.Field label="Product Type" value={row.productType || '-'} />
                            <MobileCard.Field label="Total" value={row.total} align="right" />
                        </div>
                        <div className="tw-grid tw-grid-cols-3 tw-gap-2 tw-pt-2 tw-border-t tw-border-slate-100">
                            <MobileCard.Field label="Accept" value={row.accept} bold valueColor="green" />
                            <MobileCard.Field label="Return" value={row.returnQty} bold valueColor="red" />
                            <MobileCard.Field label="Pending" value={row.pending} bold valueColor="orange" />
                            <MobileCard.Field label="Cancel" value={row.cancelQty} />
                        </div>
                    </MobileCard.Body>
                    {hasActionPermission && (
                        <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                            <MobileCard.Actions>
                                {hasPermission(`${basePerm}.Edit`) && (
                                    <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/inventory/grn-inspection/edit/${row.id}`, { state: { tab: activeTab } })}>
                                        <PencilSimpleIcon weight="bold" className="tw-w-4 tw-h-4" />
                                    </button>
                                )}
                            </MobileCard.Actions>
                        </MobileCard.Footer>
                    )}
                </MobileCard>
            ))}
            {items.length === 0 && (
                <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                    No records found
                </div>
            )}
        </div>
        </>
    );

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
                        <h3 className="card-title tw-m-0">GRN Inspection</h3>
                        {hasPermission('Inventory.Direct GRN.Add') && (
                            <button
                                type="button"
                                className="btn-create tw-w-full sm:tw-w-auto"
                                onClick={() => navigate('/inventory/grn-inspection/add')}
                            >
                                Add GRN
                            </button>
                        )}
                    </div>
                    

                    <div className="card-body">
                        <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mb-3">
                            {hasInspectionView && (
                                <button
                                    type="button"
                                    className={`tw-px-4 tw-py-2 tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-rounded-sm ${activeTab === 'inspection' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => {
                                        setActiveTab('inspection');
                                        setCurrentPage(1);
                                        
                                    }}
                                >
                                    GRN Inspection
                                </button>
                            )}
                            {hasCompletedView && (
                                <button
                                    type="button"
                                    className={`tw-px-4 tw-py-2 tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-rounded-sm ${activeTab === 'completed' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => {
                                        setActiveTab('completed');
                                        setCurrentPage(1);
                                        
                                    }}
                                >
                                    Completed GRN Inspection
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
                                    placeholder="Search..."
                                    value={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        {(() => {
                            const isInspection = activeTab === 'inspection';
                            const sourceItems = isInspection ? sortedInspection : sortedCompleted;
                            const requestSort = isInspection ? requestSortInspection : requestSortCompleted;
                            const getSortDirection = isInspection ? getSortDirectionInspection : getSortDirectionCompleted;

                            const q = searchText.trim().toLowerCase();
                            const filtered = q
                                ? sourceItems.filter((row) =>
                                    Object.values(row).some((value) => String(value).toLowerCase().includes(q))
                                )
                                : sourceItems;

                            const total = filtered.length;
                            const totalPages = Math.max(1, Math.ceil(total / pageSize));
                            const safePage = Math.min(currentPage, totalPages);
                            const startIndex = (safePage - 1) * pageSize;
                            const paginated = filtered.slice(startIndex, startIndex + pageSize);

                            return (
                                <>
                                    {isInspection
                                        ? renderInspectionTable(paginated, requestSort, getSortDirection, startIndex)
                                        : renderCompletedTable(paginated, requestSort, getSortDirection, startIndex)}

                                    <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                                        <div className="tw-text-gray-600 tw-text-sm">
                                            Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, total)} of {total} entries
                                        </div>
                                        <Pagination 
                                            currentPage={safePage} 
                                            totalPages={totalPages} 
                                            onPageChange={setCurrentPage} 
                                        />
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
            <DeletePopup 
                isOpen={deleteModalOpen} 
                onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }} 
                onConfirm={handleDeleteConfirm} 
            />
        </section>
    );
};

export default GrnList;
