import { useLoader } from '../../../context/LoaderContext';
import Pagination from '../../../components/Pagination';
import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimple, Plus, Printer, FilePdf } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import ApprovelPopup from '../../../components/Popup/ApprovelPopup';
import { usePermissions } from '../../../context/PermissionContext';

/* ── Dummy data ───────────────────────────────────────────────── */
const RECEIPT_COMPLETED_DATA = [
    { id: 1, enqNo: '8190', balance: '0.00', paid: '200000.00', invoiceDetails: 'Invoice', customerName: 'GAMMA EXPORTS', mobile: '9988776655', category: 'converted', followupDate: '01-05-2026', followupStatus: 'No Followup', currentStage: 'Invoice' },
    { id: 2, enqNo: '8195', balance: '0.00', paid: '350000.00', invoiceDetails: 'Invoice', customerName: 'DELTA TEXTILES', mobile: '9345678901', category: 'converted', followupDate: '05-05-2026', followupStatus: 'No Followup', currentStage: 'Invoice' },
];
const COLLECTION_PENDING_DATA = [
    { id: 1, enqNo: '8213', invNo: 'TF0012/2627', receiptDate: '01-06-2026', receiptNumber: '1', receiptAmount: '140000.00', customerName: 'YOUNG STYLE CLOTHING', mobile: '9894135100', employeeName: 'RAMESH P', followupDate: '14-06-2026', followupStatus: 'Today', receiptStatus: 'receipt' },
    { id: 2, enqNo: '8217', invNo: 'TF0015/2627', receiptDate: '05-06-2026', receiptNumber: '2', receiptAmount: '95000.00', customerName: 'OMEGA KNIT WORKS', mobile: '9871234567', employeeName: 'SURIYA S', followupDate: '18-06-2026', followupStatus: 'Overdue', receiptStatus: 'receipt' },
];
const RECEIPT_DATA = [
    { id: 1, enqNo: '8202', invNo: 'TF0010/2627', receiptDate: '20-05-2026', receiptNumber: '3', receiptAmount: '175000.00', customerName: 'SIGMA GARMENTS', mobile: '9543210987', followupDate: '25-06-2026', followupStatus: 'Today', receiptStatus: 'receipt' },
    { id: 2, enqNo: '8208', invNo: 'TF0011/2627', receiptDate: '25-05-2026', receiptNumber: '4', receiptAmount: '210000.00', customerName: 'ZETA FABRICATORS', mobile: '9432109876', followupDate: '28-06-2026', followupStatus: 'No Followup', receiptStatus: 'receipt' },
];
const CANCELLED_RECEIPT_DATA = [
    { id: 1, enqNo: '8180', receiptDate: '10-03-2026', receiptNumber: '5', receiptAmount: '50000.00', customerName: 'KAPPA TEXTILES', mobile: '9321098765', receiptStatus: 'Cancelled' },
    { id: 2, enqNo: '8185', receiptDate: '15-03-2026', receiptNumber: '6', receiptAmount: '75000.00', customerName: 'LAMBDA CLOTHING', mobile: '9012345678', receiptStatus: 'Cancelled' },
];

/* ── Badge styles ─────────────────────────────────────────────── */
const BADGE_STYLE = {
    'Job Card': { bg: '#0ea5e9', color: '#ffffff' },
    'Enquiry': { bg: '#f59e0b', color: '#ffffff' },
    'No Followup': { bg: '#64748b', color: '#ffffff' },
    'Pending': { bg: '#ef4444', color: '#ffffff' },
    'Completed': { bg: '#10b981', color: '#ffffff' },
    'Invoice': { bg: '#6366f1', color: '#ffffff' },
    'converted': { bg: '#a855f7', color: '#ffffff' },
    'Overdue': { bg: '#dc2626', color: '#ffffff' },
    'Today': { bg: '#22c55e', color: '#ffffff' },
    'receipt': { bg: '#0d9488', color: '#ffffff' },
    'Cancelled': { bg: '#ef4444', color: '#ffffff' },
};

const Badge = ({ value, map }) => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Sales Contact.Sales Contact.Edit') || hasPermission('Sales Contact.Sales Contact.Delete');
    const { setLoading } = useLoader();
    const st = map[value] || { bg: '#e5e7eb', color: '#111827' };
    return (
        <span style={{ background: st.bg, color: st.color, padding: '4px 12px', borderRadius: 4, whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500 }}>
            {value || '-'}
        </span>
    );
};

/* ── Component ────────────────────────────────────────────────── */
const FurtherReciptList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Sales Contact.Sales Contact.Edit') || hasPermission('Sales Contact.Sales Contact.Delete');
    const { setLoading } = useLoader();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('enquiry');
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isApprovalPopupOpen, setIsApprovalPopupOpen] = useState(false);
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);

    const [enquiryData, setEnquiryData] = useState([]);
    const [collectionData, setCollectionData] = useState([]);
    const [completedGrnData, setCompletedGrnData] = useState([]);
    const [cancelledData, setCancelledData] = useState([]);

    useEffect(() => {
        const fetchGrnList = async () => {
            if (activeTab === 'enquiry') {
                try {
                    const token = sessionStorage.getItem('token');
                    const headers = {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    };
                    setLoading(true);
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/grn-list`, { headers });
                    const result = await response.json();

                    if (result.status && result.data) {
                        const mappedData = result.data.map(item => ({
                            id: item.id,
                            poNo: item.purchase_order?.purchase_order_number || '',
                            poDate: item.purchase_order?.po_date || (item.created_at ? item.created_at.split('T')[0] : ''),
                            productType: 'Product',
                            balance: item.balance || '0.00',
                            paid: item.paid_amount || '0.00',
                            invoiceDetails: 'Invoice',
                            customerName: item.purchase_order?.vendor?.name || '',
                            mobile: item.purchase_order?.vendor?.mobile_number || '',
                            currentStage: 'Pending'
                        }));
                        setEnquiryData(mappedData);
                    } else {
                        setEnquiryData([]);
                    }
                } catch (error) {
                    console.error("Error fetching GRN list:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        const fetchCollectionPending = async () => {
            if (activeTab === 'collection_pending') {
                try {
                    const token = sessionStorage.getItem('token');
                    const headers = {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    };
                    setLoading(true);
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/receipts`, { headers });
                    const result = await response.json();

                    if (response.ok && result) {
                        const dataArray = Array.isArray(result) ? result : (result.data || []);
                        const mappedData = dataArray.map(item => ({
                            id: item.id,
                            enqNo: item.po_no || '',
                            invNo: item.grnInspectionHeader?.grn_inspection_number || '',
                            receiptDate: item.created_date ? new Date(item.created_date).toLocaleDateString('en-GB').replace(/\//g, '-') : '',
                            receiptNumber: item.receipt_number || item.id,
                            receiptAmount: parseFloat(item.amount_paid || 0).toFixed(2),
                            customerName: item.vendor?.name || '',
                            mobile: '',
                            employeeName: '',
                            followupDate: '',
                            followupStatus: 'Today',
                            receiptStatus: 'Pending'
                        }));
                        setCollectionData(mappedData);
                    } else {
                        setCollectionData([]);
                    }
                } catch (error) {
                    console.error("Error fetching collections:", error);
                } finally {
                    setLoading(false);
                }
            } else if (activeTab === 'receipt') {
                try {
                    const token = sessionStorage.getItem('token');
                    const headers = {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    };
                    setLoading(true);
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/collected-receipts`, { headers });
                    const result = await response.json();

                    if (response.ok && result) {
                        const dataArray = Array.isArray(result) ? result : (result.data || []);
                        const mappedData = dataArray.map(item => ({
                            id: item.id,
                            enqNo: item.po_no || '',
                            invNo: item.grnInspectionHeader?.grn_inspection_number || '',
                            receiptDate: item.created_date ? new Date(item.created_date).toLocaleDateString('en-GB').replace(/\//g, '-') : '',
                            receiptNumber: item.receipt_number || item.id,
                            receiptAmount: parseFloat(item.amount_paid || 0).toFixed(2),
                            customerName: item.vendor?.name || '',
                            mobile: item.vendor?.mobile_number || '',
                            employeeName: '',
                            followupDate: '',
                            followupStatus: 'Today',
                            receiptStatus: 'Completed'
                        }));
                        setCollectionData(mappedData);
                    } else {
                        setCollectionData([]);
                    }
                } catch (error) {
                    console.error("Error fetching collected receipts:", error);
                } finally {
                    setLoading(false);
                }
            } else if (activeTab === 'cancelled_receipt') {
                try {
                    const token = sessionStorage.getItem('token');
                    const headers = {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    };
                    setLoading(true);
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/cancelled-receipts`, { headers });
                    const result = await response.json();

                    if (response.ok && result) {
                        const dataArray = Array.isArray(result) ? result : (result.data || []);
                        const mappedData = dataArray.map(item => ({
                            id: item.id,
                            enqNo: item.po_no || '',
                            invNo: item.grnInspectionHeader?.invoice_number || '',
                            receiptDate: item.created_date ? new Date(item.created_date).toLocaleDateString('en-GB').replace(/\//g, '-') : '',
                            receiptNumber: item.receipt_number || item.id,
                            receiptAmount: parseFloat(item.amount_paid || 0).toFixed(2),
                            customerName: item.vendor?.name || '',
                            mobile: item.vendor?.mobile_number || '',
                            employeeName: '',
                            followupDate: '',
                            followupStatus: 'Today',
                            receiptStatus: 'Cancelled'
                        }));
                        setCancelledData(mappedData);
                    } else {
                        setCancelledData([]);
                    }
                } catch (error) {
                    console.error("Error fetching cancelled receipts:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        const fetchCompletedGrnList = async () => {
            if (activeTab === 'receipt_completed_enquiry') {
                try {
                    const token = sessionStorage.getItem('token');
                    const headers = {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    };
                    setLoading(true);
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/completed-grn-list`, { headers });
                    const result = await response.json();

                    if (result.status && result.data) {
                        const mappedData = result.data.map(item => ({
                            id: item.id,
                            poNo: item.purchase_order?.purchase_order_number || '',
                            balance: parseFloat(item.balance || 0).toFixed(2),
                            paid: parseFloat(item.paid_amount || 0).toFixed(2),
                            customerName: item.purchase_order?.vendor?.name || '',
                            mobile: item.purchase_order?.vendor?.mobile_number || '',
                            currentStage: 'Completed'
                        }));
                        setCompletedGrnData(mappedData);
                    } else {
                        setCompletedGrnData([]);
                    }
                } catch (error) {
                    console.error("Error fetching completed GRN list:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchGrnList();
        fetchCollectionPending();
        fetchCompletedGrnList();
    }, [activeTab]);

    const handleApprovalSubmit = async (data) => {
        if (!data.receiptId) return;
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/receipts/${data.receiptId}/collect`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    bank_account_id: data.accountHolder
                })
            });
            const result = await response.json();
            if (response.ok && result.status) {
                // Refresh list or show success
                // We'll just force a refresh by triggering the active tab fetch again or reloading
                setActiveTab('receipt'); // typically switches to completed tab or stay on same
            } else {
                console.error("Failed to collect receipt:", result.message);
            }
        } catch (error) {
            console.error("Error collecting receipt:", error);
        }
    };

    const { items: sortedEnquiry, requestSort: reqSortEnquiry, getSortDirection: getSortDirEnquiry } = useSortableData(enquiryData);
    const { items: sortedReceiptCompleted, requestSort: reqSortReceiptCompleted, getSortDirection: getSortDirReceiptCompleted } = useSortableData(completedGrnData);
    const { items: sortedCollection, requestSort: reqSortCollection, getSortDirection: getSortDirCollection } = useSortableData(collectionData);
    const { items: sortedReceipt, requestSort: reqSortReceipt, getSortDirection: getSortDirReceipt } = useSortableData(RECEIPT_DATA);
    const { items: sortedCancelled, requestSort: reqSortCancelled, getSortDirection: getSortDirCancelled } = useSortableData(cancelledData);

    const renderActionButtons = (tabKey, row) => {
        if (tabKey === 'enquiry') {
            return (
                <div className="tw-flex tw-gap-2 tw-items-center">
                    {hasPermission('Sales Contact.Sales Contact.Edit') && (
<button type="button" className="sv-action-icon sv-edit" title="Edit" onClick={() => navigate(`/inventory/further-receipt/edit/${row.id}`)}>
                        <PencilSimple weight="bold" className="tw-w-4 tw-h-4" />
                    </button>
)}
                    <button type="button" className="sv-action-icon sv-pdf" title="PDF">
                        <FilePdf weight="bold" className="tw-w-4 tw-h-4" />
                    </button>
                </div>
            );
        }
        if (tabKey === 'receipt_completed_enquiry') {
            return (
                <div className="tw-flex tw-gap-2 tw-items-center">
                    <button type="button" className="sv-action-icon sv-pdf" title="PDF">
                        <FilePdf weight="bold" className="tw-w-4 tw-h-4" />
                    </button>
                </div>
            );
        }
        if (tabKey === 'collection_pending' || tabKey === 'receipt' || tabKey === 'cancelled_receipt') {
            return (
                <div className="tw-flex tw-gap-2 tw-items-center">
                    {tabKey !== 'receipt' && tabKey !== 'cancelled_receipt' && hasPermission('Sales Contact.Sales Contact.Edit') && (
                        <button type="button" className="sv-action-icon sv-edit" title="Edit" onClick={() => navigate(`/inventory/further-receipt/update/${row.id}`)}>
                            <PencilSimple weight="bold" className="tw-w-4 tw-h-4" />
                        </button>
                    )}
                    <button type="button" className="sv-action-icon sv-pdf" title="PDF">
                        <FilePdf weight="bold" className="tw-w-4 tw-h-4" />
                    </button>
                    {tabKey !== 'receipt' && tabKey !== 'cancelled_receipt' && (
                        <button type="button" className="sv-action-icon sv-add" title="Add" onClick={() => { setSelectedReceiptId(row.id); setIsApprovalPopupOpen(true); }}>
                            <Plus weight="bold" className="tw-w-4 tw-h-4" />
                        </button>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderTable = (items, requestSort, getSortDirection, startIndex, tabKey) => {
        if (tabKey === 'enquiry') {
            return (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped no-margin">
                        <thead>
                            <tr>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                    <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('poNo')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Po. No <TableSortIcon direction={getSortDirection('poNo')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('poDate')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Po. Date <TableSortIcon direction={getSortDirection('poDate')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('productType')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Product Type <TableSortIcon direction={getSortDirection('productType')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('balance')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Amount Details <TableSortIcon direction={getSortDirection('balance')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invoiceDetails')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Invoice Details <TableSortIcon direction={getSortDirection('invoiceDetails')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Vendor Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('currentStage')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div>
                                </th>
                                {hasActionPermission && <th className="tw-align-middle">Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((r, idx) => (
                                <tr key={r.id}>
                                    <td>{startIndex + idx + 1}</td>
                                    <td>{r.poNo}</td>
                                    <td>{r.poDate}</td>
                                    <td>{r.productType}</td>
                                    <td>
                                        <div className="tw-flex tw-flex-col">
                                            <span className="tw-text-sm">Balance: <strong style={{ color: '#ef4444' }}>{r.balance}</strong></span>
                                            <span className="tw-text-sm">Paid: <strong style={{ color: '#16a34a' }}>{r.paid}</strong></span>
                                        </div>
                                    </td>
                                    <td><Badge value={r.invoiceDetails} map={BADGE_STYLE} /></td>
                                    <td>{r.customerName}</td>
                                    <td>{r.mobile}</td>
                                    <td><Badge value={r.currentStage} map={BADGE_STYLE} /></td>
                                    <td>{renderActionButtons(tabKey, r)}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={hasActionPermission ? 10 : 9} className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            );
        } else if (tabKey === 'receipt_completed_enquiry') {
            return (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped no-margin">
                        <thead>
                            <tr>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                    <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('poNo')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Po. No <TableSortIcon direction={getSortDirection('poNo')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('balance')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Amount Details <TableSortIcon direction={getSortDirection('balance')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Vendor Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('currentStage')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div>
                                </th>
                                <th className="tw-align-middle">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((r, idx) => (
                                <tr key={r.id}>
                                    <td>{startIndex + idx + 1}</td>
                                    <td>{r.poNo}</td>
                                    <td>
                                        <div className="tw-flex tw-flex-col">
                                            <span className="tw-text-sm">Balance: <strong style={{ color: '#ef4444' }}>{r.balance}</strong></span>
                                            <span className="tw-text-sm">Paid: <strong style={{ color: '#16a34a' }}>{r.paid}</strong></span>
                                        </div>
                                    </td>
                                    <td>{r.customerName}</td>
                                    <td>{r.mobile}</td>
                                    <td><Badge value={r.currentStage} map={BADGE_STYLE} /></td>
                                    <td>{renderActionButtons(tabKey, r)}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={hasActionPermission ? 7 : 6} className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            );
        } else if (tabKey === 'collection_pending' || tabKey === 'receipt') {
            return (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped no-margin">
                        <thead>
                            <tr>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                    <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqNo')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">
                                        {(tabKey === 'receipt' || tabKey === 'cancelled') ? 'Po. No' : 'Enq. No'} <TableSortIcon direction={getSortDirection('enqNo')} />
                                    </div>
                                </th>
                                {/* <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invNo')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Inv. No <TableSortIcon direction={getSortDirection('invNo')} /></div>
                                </th> */}
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptDate')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Receipt Date <TableSortIcon direction={getSortDirection('receiptDate')} /></div>
                                </th>
                                {tabKey !== 'collection_pending' && (
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptNumber')}>
                                        <div className="tw-flex tw-justify-between tw-items-center">Receipt Number <TableSortIcon direction={getSortDirection('receiptNumber')} /></div>
                                    </th>
                                )}
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptAmount')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Receipt Amount <TableSortIcon direction={getSortDirection('receiptAmount')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">
                                        Vendor Name <TableSortIcon direction={getSortDirection('customerName')} />
                                    </div>
                                </th>
                                {tabKey === 'collection_pending' && (
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('employeeName')}>
                                        <div className="tw-flex tw-justify-between tw-items-center">Employee Name <TableSortIcon direction={getSortDirection('employeeName')} /></div>
                                    </th>
                                )}
                                {(tabKey === 'receipt' || tabKey === 'cancelled') && (
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                        <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                    </th>
                                )}
                                {tabKey !== 'collection_pending' && tabKey !== 'receipt' && tabKey !== 'cancelled' && (
                                    <>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('followupDate')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Followup Date <TableSortIcon direction={getSortDirection('followupDate')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('followupStatus')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Followup Status <TableSortIcon direction={getSortDirection('followupStatus')} /></div>
                                        </th>
                                    </>
                                )}
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptStatus')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Receipt Status <TableSortIcon direction={getSortDirection('receiptStatus')} /></div>
                                </th>
                                <th className="tw-align-middle">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((r, idx) => (
                                <tr key={r.id}>
                                    <td>{startIndex + idx + 1}</td>
                                    <td>{r.enqNo}</td>
                                    {/* <td>{r.invNo}</td> */}
                                    <td>{r.receiptDate}</td>
                                    {tabKey !== 'collection_pending' && (
                                        <td>{r.receiptNumber}</td>
                                    )}
                                    <td>{r.receiptAmount}</td>
                                    <td>
                                        <div>{r.customerName}</div>
                                        {tabKey === 'collection_pending' && (
                                            <div className="tw-text-gray-500 tw-text-sm">{r.mobile}</div>
                                        )}
                                    </td>
                                    {tabKey === 'collection_pending' && (
                                        <td>{r.employeeName}</td>
                                    )}
                                    {(tabKey === 'receipt' || tabKey === 'cancelled') && (
                                        <td>{r.mobile}</td>
                                    )}
                                    {tabKey !== 'collection_pending' && tabKey !== 'receipt' && tabKey !== 'cancelled' && (
                                        <>
                                            <td>
                                                <input type="text" className="form-control" defaultValue={r.followupDate} style={{ minWidth: '130px' }} />
                                            </td>
                                            <td><Badge value={r.followupStatus} map={BADGE_STYLE} /></td>
                                        </>
                                    )}
                                    <td><Badge value={r.receiptStatus} map={BADGE_STYLE} /></td>
                                    <td>{renderActionButtons(tabKey, r)}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan="12" className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            );
        } else if (tabKey === 'cancelled_receipt') {
            return (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped no-margin">
                        <thead>
                            <tr>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                    <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqNo')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Po. No <TableSortIcon direction={getSortDirection('enqNo')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptDate')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Receipt Date <TableSortIcon direction={getSortDirection('receiptDate')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptNumber')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Receipt Number <TableSortIcon direction={getSortDirection('receiptNumber')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptAmount')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Receipt Amount <TableSortIcon direction={getSortDirection('receiptAmount')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Vendor Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptStatus')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Receipt Status <TableSortIcon direction={getSortDirection('receiptStatus')} /></div>
                                </th>
                                <th className="tw-align-middle">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((r, idx) => (
                                <tr key={r.id}>
                                    <td>{startIndex + idx + 1}</td>
                                    <td>{r.enqNo}</td>
                                    <td>{r.receiptDate}</td>
                                    <td>{r.receiptNumber}</td>
                                    <td>{r.receiptAmount}</td>
                                    <td>{r.customerName}</td>
                                    <td>{r.mobile}</td>
                                    <td><Badge value={r.receiptStatus} map={BADGE_STYLE} /></td>
                                    <td>{renderActionButtons(tabKey, r)}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            );
        }

        return null;
    };

    return (
        <section className="content">
            <style>{`
                .sv-action-icon {
                    width: 28px; height: 28px; border-radius: 8px; border: none;
                    display: inline-flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background-color .12s ease, transform .06s ease;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.10);
                }
                .sv-action-icon:hover { transform: translateY(-1px); }
                .sv-action-icon:focus { outline: none; }
                .sv-edit  { background-color: #f59e0b; color: #000000; }
                .sv-edit:hover  { background-color: #d97706; }
                .sv-add   { background-color: #10b981; color: #ffffff; }
                .sv-add:hover   { background-color: #059669; }
                .sv-print { background-color: #06b6d4; color: #ffffff; }
                .sv-print:hover { background-color: #0891b2; }
                .sv-pdf { background-color: #ef4444; color: #ffffff; }
                .sv-pdf:hover { background-color: #dc2626; }
            `}</style>

            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Further Receipt</h3>
                    </div>

                    <div className="card-body">
                        {/* Tabs */}
                        <div className="tw-flex tw-gap-2 tw-mb-3 tw-flex-wrap">
                            <button
                                type="button"
                                className={`tw-px-4 tw-py-2 tw-rounded-sm ${activeTab === 'enquiry' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                onClick={() => { setActiveTab('enquiry'); setCurrentPage(1); }}
                            >
                                Enquiry List in Receipt
                            </button>
                            <button
                                type="button"
                                className={`tw-px-4 tw-py-2 tw-rounded-sm ${activeTab === 'receipt_completed_enquiry' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                onClick={() => { setActiveTab('receipt_completed_enquiry'); setCurrentPage(1); }}
                            >
                                Receipt Completed Enquiry List
                            </button>
                            <button
                                type="button"
                                className={`tw-px-4 tw-py-2 tw-rounded-sm ${activeTab === 'collection_pending' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                onClick={() => { setActiveTab('collection_pending'); setCurrentPage(1); }}
                            >
                                Collection Pending List
                            </button>
                            <button
                                type="button"
                                className={`tw-px-4 tw-py-2 tw-rounded-sm ${activeTab === 'receipt' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                onClick={() => { setActiveTab('receipt'); setCurrentPage(1); }}
                            >
                                Receipt List
                            </button>
                            <button
                                type="button"
                                className={`tw-px-4 tw-py-2 tw-rounded-sm ${activeTab === 'cancelled_receipt' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                onClick={() => { setActiveTab('cancelled_receipt'); setCurrentPage(1); }}
                            >
                                Cancelled Receipt List
                            </button>
                        </div>

                        {/* Show / Search */}
                        <div className="list-top-bar">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span>Show</span>
                                <select
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={pageSize}
                                    onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span>Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-w-48 tw-inline-block"
                                    value={searchText}
                                    onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Table + Pagination */}
                        {(() => {
                            let sourceItems = [];
                            let requestSort = null;
                            let getSortDir = null;

                            if (activeTab === 'enquiry') {
                                sourceItems = sortedEnquiry;
                                requestSort = reqSortEnquiry;
                                getSortDir = getSortDirEnquiry;
                            } else if (activeTab === 'receipt_completed_enquiry') {
                                sourceItems = sortedReceiptCompleted;
                                requestSort = reqSortReceiptCompleted;
                                getSortDir = getSortDirReceiptCompleted;
                            } else if (activeTab === 'collection_pending') {
                                sourceItems = sortedCollection;
                                requestSort = reqSortCollection;
                                getSortDir = getSortDirCollection;
                            } else if (activeTab === 'receipt') {
                                sourceItems = sortedCollection;
                                requestSort = reqSortCollection;
                                getSortDir = getSortDirCollection;
                            } else {
                                sourceItems = sortedCancelled;
                                requestSort = reqSortCancelled;
                                getSortDir = getSortDirCancelled;
                            }

                            const q = searchText.trim().toLowerCase();
                            const filtered = q
                                ? sourceItems.filter(r =>
                                    String(r.receiptNo || '').toLowerCase().includes(q) ||
                                    String(r.receiptNumber || '').toLowerCase().includes(q) ||
                                    String(r.poNo || '').toLowerCase().includes(q) ||
                                    String(r.invNo || '').toLowerCase().includes(q) ||
                                    String(r.customerName || '').toLowerCase().includes(q) ||
                                    String(r.employeeName || '').toLowerCase().includes(q) ||
                                    String(r.mobile || '').toLowerCase().includes(q)
                                )
                                : sourceItems;

                            const total = filtered.length;
                            const totalPages = Math.max(1, Math.ceil(total / pageSize));
                            const safePage = Math.min(currentPage, totalPages);
                            const startIndex = (safePage - 1) * pageSize;
                            const paginated = filtered.slice(startIndex, startIndex + pageSize);

                            return (
                                <>
                                    {renderTable(paginated, requestSort, getSortDir, startIndex, activeTab)}
                                    <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                                        <div className="tw-text-gray-600 tw-text-sm">
                                            Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, total)} of {total} entries
                                        </div>
                                        <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
            <ApprovelPopup
                isOpen={isApprovalPopupOpen}
                receiptId={selectedReceiptId}
                onClose={() => { setIsApprovalPopupOpen(false); setSelectedReceiptId(null); }}
                onSubmit={handleApprovalSubmit}
            />
        </section>
    );
};

export default FurtherReciptList;
