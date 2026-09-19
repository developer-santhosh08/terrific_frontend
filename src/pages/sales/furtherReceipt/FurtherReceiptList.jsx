import { useLoader } from '../../../context/LoaderContext';
import Pagination from '../../../components/Pagination';
import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, Printer, FilePdf } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import ApprovelPopup from '../../../components/Popup/ApprovelPopup';
import CollectAmountPopup from '../../../components/Popup/CollectAmountPopup';
import { usePermissions } from '../../../context/PermissionContext';
import SuccessPopup from '../../../components/Popup/SuccessPopup';
import ErrorPopup from '../../../components/Popup/ErrorPopup';
import MobileCard from '../../../components/common/MobileCard';

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

const Badge = ({ value, map, color }) => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Sales.Further Receipt.Edit') || hasPermission('Sales.Further Receipt.Print') || hasPermission('Sales.Further Receipt.Approve');
    const { setLoading } = useLoader();
    const st = map[value] || { bg: color || '#e5e7eb', color: '#ffffff' };
    return (
        <span style={{ background: color || st.bg, color: st.color, padding: '4px 12px', borderRadius: 4, whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500 }}>
            {value || '-'}
        </span>
    );
};

/* ── Component ────────────────────────────────────────────────── */
const FurtherReceiptList = () => {
    const { hasPermission, refreshPermissions } = usePermissions();
    const { setLoading } = useLoader();
    const navigate = useNavigate();
    const location = useLocation();

    const canViewEnquiry = hasPermission('Sales.Further Receipt - Invoice List in Receipt.View');
    const canViewReceiptCompletedEnquiry = hasPermission('Sales.Further Receipt - Receipt Completed Invoice List.View');
    const canViewCollectionPending = hasPermission('Sales.Further Receipt - Collection Pending List.View');
    const canViewReceipt = hasPermission('Sales.Further Receipt - Receipt List.View');
    const canViewCancelledReceipt = hasPermission('Sales.Further Receipt - Cancelled Receipt.View');

    const [activeTab, setActiveTab] = useState(() => {
        if (location?.state?.defaultTab) return location.state.defaultTab;
        if (canViewEnquiry) return 'enquiry';
        if (canViewReceiptCompletedEnquiry) return 'receipt_completed_enquiry';
        if (canViewCollectionPending) return 'collection_pending';
        if (canViewReceipt) return 'receipt';
        if (canViewCancelledReceipt) return 'cancelled_receipt';
        return 'enquiry';
    });

    useEffect(() => {
        if (activeTab === 'enquiry' && !canViewEnquiry) {
            setActiveTab(canViewReceiptCompletedEnquiry ? 'receipt_completed_enquiry' : (canViewCollectionPending ? 'collection_pending' : (canViewReceipt ? 'receipt' : (canViewCancelledReceipt ? 'cancelled_receipt' : 'enquiry'))));
        } else if (activeTab === 'receipt_completed_enquiry' && !canViewReceiptCompletedEnquiry) {
            setActiveTab(canViewEnquiry ? 'enquiry' : (canViewCollectionPending ? 'collection_pending' : (canViewReceipt ? 'receipt' : (canViewCancelledReceipt ? 'cancelled_receipt' : 'receipt_completed_enquiry'))));
        } else if (activeTab === 'collection_pending' && !canViewCollectionPending) {
            setActiveTab(canViewEnquiry ? 'enquiry' : (canViewReceiptCompletedEnquiry ? 'receipt_completed_enquiry' : (canViewReceipt ? 'receipt' : (canViewCancelledReceipt ? 'cancelled_receipt' : 'collection_pending'))));
        } else if (activeTab === 'receipt' && !canViewReceipt) {
            setActiveTab(canViewEnquiry ? 'enquiry' : (canViewReceiptCompletedEnquiry ? 'receipt_completed_enquiry' : (canViewCollectionPending ? 'collection_pending' : (canViewCancelledReceipt ? 'cancelled_receipt' : 'receipt'))));
        } else if (activeTab === 'cancelled_receipt' && !canViewCancelledReceipt) {
            setActiveTab(canViewEnquiry ? 'enquiry' : (canViewReceiptCompletedEnquiry ? 'receipt_completed_enquiry' : (canViewCollectionPending ? 'collection_pending' : (canViewReceipt ? 'receipt' : 'cancelled_receipt'))));
        }
    }, [canViewEnquiry, canViewReceiptCompletedEnquiry, canViewCollectionPending, canViewReceipt, canViewCancelledReceipt, activeTab]);

    const activeTabLabel = 
        activeTab === 'enquiry' ? 'Further Receipt - Invoice List in Receipt' :
        activeTab === 'receipt_completed_enquiry' ? 'Further Receipt - Receipt Completed Invoice List' :
        activeTab === 'collection_pending' ? 'Further Receipt - Collection Pending List' :
        activeTab === 'receipt' ? 'Further Receipt - Receipt List' :
        'Further Receipt - Cancelled Receipt';

    const canEdit = hasPermission(`Sales.${activeTabLabel}.Edit`);
    const canPrint = hasPermission(`Sales.${activeTabLabel}.Print`);
    const canApprove = hasPermission(`Sales.${activeTabLabel}.Approve`);

    const hasActionPermission = canEdit || canPrint || canApprove;

    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isApprovalPopupOpen, setIsApprovalPopupOpen] = useState(false);
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);
    const [bankOptions, setBankOptions] = useState([]);

    const [enquiryData, setEnquiryData] = useState([]);
    const [collectionData, setCollectionData] = useState([]);
    const [completedInvoiceData, setCompletedInvoiceData] = useState([]);
    const [cancelledData, setCancelledData] = useState([]);



    useEffect(() => {
        const fetchInvoiceList = async () => {
            if (activeTab === 'enquiry') {
                try {
                    const token = sessionStorage.getItem('token');
                    const headers = {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    };
                    setLoading(true);
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/receipts/further`, { headers });
                    const result = await response.json();

                    if (result.status && result.data) {
                        const mappedData = result.data.map(item => ({
                            id: item.invoice_id,
                            enqNo: item.enq_no || '',
                            invoiceNo: item.invoice_no || '',
                            invoiceDate: item.enq_date || '',
                            productType: 'Product',
                            balance: item.balance_amount || '0.00',
                            paid: item.paid_amount || '0.00',
                            invoiceDetails: 'Invoice',
                            customerName: item.customer_name || '',
                            mobile: item.mobile || '',
                            currentStage: item.enquiry_status || 'Pending',
                            stageColor: item.stage_color || null
                        }));
                        setEnquiryData(mappedData);
                    } else {
                        setEnquiryData([]);
                    }
                } catch (error) {
                    console.error("Error fetching invoice list:", error);
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
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/collections/pending?type=2`, { headers });
                    const result = await response.json();

                    if (result.status && result.data) {
                        const dataArray = Array.isArray(result.data) ? result.data : [];
                        const mappedData = dataArray.map(item => ({
                            id: item.receipt_id,
                            enqNo: item.enq_no || '',
                            invoiceNo: item.invoice_id || '',
                            receiptDate: item.receipt_date || '',
                            receiptNumber: item.receipt_id,
                            receiptAmount: parseFloat(item.amount || 0).toFixed(2),
                            customerName: item.customer_name || '',
                            mobile: item.mobile || '',
                            employeeName: item.engineer_name || '',
                            followupDate: item.followup_date || '',
                            followupStatus: item.followup_status || 'No Followup',
                            receiptStatus: item.status || 'Pending',
                            stageColor: item.stage_color || null
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
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/collections/receipts?type=2`, { headers });
                    const result = await response.json();

                    if (result.status && result.data) {
                        const dataArray = Array.isArray(result.data) ? result.data : [];
                        const mappedData = dataArray.map(item => ({
                            id: item.receipt_id,
                            enqNo: item.enq_no || '',
                            invoiceNo: item.invoice_no || '',
                            receiptDate: item.receipt_date || '',
                            receiptNumber: item.receipt_number || item.receipt_id,
                            receiptAmount: parseFloat(item.amount || 0).toFixed(2),
                            customerName: item.customer_name || '',
                            mobile: item.mobile || '',
                            employeeName: item.engineer_name || '',
                            followupDate: item.followup_date || '',
                            followupStatus: item.followup_status || 'No Followup',
                            receiptStatus: item.stage_name || item.receipt_status || 'Completed',
                            stageColor: item.stage_color || null
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
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/receipts/cancelled`, { headers });
                    const result = await response.json();

                    if (response.ok && result) {
                        const dataArray = Array.isArray(result) ? result : (result.data || []);
                        const mappedData = dataArray.map((item, index) => ({
                            id: index + 1,
                            receiptId: item.receipt_id || item.id,
                            enqNo: item.enquiry_number || item.enq_no || '',
                            invoiceNo: item.invoice?.invoice_number || item.invoice_no || '',
                            receiptDate: item.receipt_date || (item.created_date ? new Date(item.created_date).toLocaleDateString('en-GB').replace(/\//g, '-') : ''),
                            receiptNumber: item.receipt_number || item.receipt_id || item.id,
                            receiptAmount: parseFloat(item.amount_paid || item.amount || 0).toFixed(2),
                            customerName: item.customer?.name || item.customer_name || '',
                            mobile: item.customer?.mobile_number || item.mobile || '',
                            employeeName: item.engineer_name || '',
                            followupDate: item.followup_date || '',
                            followupStatus: item.followup_status || 'Today',
                            receiptStatus: item.stage_name || 'Cancelled',
                            stageColor: item.stage_color || '#ef4444'
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
        const fetchCompletedInvoiceList = async () => {
            if (activeTab === 'receipt_completed_enquiry') {
                try {
                    const token = sessionStorage.getItem('token');
                    const headers = {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    };
                    setLoading(true);
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/receipts/completed`, { headers });
                    const result = await response.json();

                    if (result.status && result.data) {
                        const mappedData = result.data.map(item => ({
                            id: item.invoice_id,
                            enqNo: item.enq_no || '',
                            invoiceNo: item.invoice_no || '',
                            balance: parseFloat(item.balance_amount || 0).toFixed(2),
                            paid: parseFloat(item.paid_amount || 0).toFixed(2),
                            customerName: item.customer_name || '',
                            mobile: item.mobile || '',
                            currentStage: 'Completed'
                        }));
                        setCompletedInvoiceData(mappedData);
                    } else {
                        setCompletedInvoiceData([]);
                    }
                } catch (error) {
                    console.error("Error fetching completed invoice list:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        const fetchBanks = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/bank_account_details`, { headers });
                const result = await response.json();
                if (result.status && result.data) {
                    const options = result.data.map(b => ({
                        value: b.id,
                        label: b.bank_name || b.holder_name
                    }));
                    setBankOptions(options);
                } else if (Array.isArray(result)) {
                    const options = result.map(b => ({
                        value: b.id,
                        label: b.bank_name || b.holder_name
                    }));
                    setBankOptions(options);
                }
            } catch (error) {
                console.error("Error fetching banks:", error);
            }
        };

        fetchInvoiceList();
        fetchCollectionPending();
        fetchCompletedInvoiceList();
        fetchBanks();
    }, [activeTab]);

    const [isCollectAmountPopupOpen, setIsCollectAmountPopupOpen] = useState(false);
    const [finalCollectedAmount, setFinalCollectedAmount] = useState('0.00');
    const [selectedReceiptAmount, setSelectedReceiptAmount] = useState('');

    const handleApprovalSubmit = (data) => {
        // Save the amount and open the bank account popup
        setFinalCollectedAmount(data.collectedAmount || '0.00');
        setIsApprovalPopupOpen(false);
        setIsCollectAmountPopupOpen(true);
    };

    const handleCollectSubmit = async (bankId) => {
        if (!selectedReceiptId) return;
        if (!bankId) {
            alert("Please select a bank account.");
            return;
        }
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/collections/approve/${selectedReceiptId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    account_id: bankId,
                    collected_amount: finalCollectedAmount
                })
            });
            const result = await response.json();
            if (response.ok && result.status) {
                // Refresh list or show success
                setIsCollectAmountPopupOpen(false);
                setActiveTab('receipt'); 
            } else {
                console.error("Failed to collect receipt:", result.message);
            }
        } catch (error) {
            console.error("Error collecting receipt:", error);
        }
    };

    const { items: sortedEnquiry, requestSort: reqSortEnquiry, getSortDirection: getSortDirEnquiry } = useSortableData(enquiryData);
    const { items: sortedReceiptCompleted, requestSort: reqSortReceiptCompleted, getSortDirection: getSortDirReceiptCompleted } = useSortableData(completedInvoiceData);
    const { items: sortedCollection, requestSort: reqSortCollection, getSortDirection: getSortDirCollection } = useSortableData(collectionData);
    const { items: sortedCancelled, requestSort: reqSortCancelled, getSortDirection: getSortDirCancelled } = useSortableData(cancelledData);

    const renderActionButtons = (tabKey, row) => {
        if (tabKey === 'enquiry') {
            return (
                <div className="tw-flex tw-gap-2 tw-items-center tw-justify-center">
                    {canEdit && (
                        <button type="button" className="sv-action-icon sv-edit" title="Edit" onClick={() => navigate(`/sales/further-receipt/edit/${row.id}`)}>
                            <PencilSimpleIcon weight="bold" className="tw-w-4 tw-h-4" />
                        </button>
                    )}
                    {canPrint && (
                        <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/sales-further-receipt/${row.id}`, '_blank')}>
                            <Printer weight="bold" className="tw-w-4 tw-h-4" />
                        </button>
                    )}
                </div>
            );
        }
        if (tabKey === 'receipt_completed_enquiry') {
            return (
                <div className="tw-flex tw-gap-2 tw-items-center tw-justify-center">
                    {canPrint && (
                        <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/sales-further-receipt/${row.id}`, '_blank')}>
                            <Printer weight="bold" className="tw-w-4 tw-h-4" />
                        </button>
                    )}
                </div>
            );
        }
        if (tabKey === 'collection_pending' || tabKey === 'receipt' || tabKey === 'cancelled_receipt') {
            return (
                <div className="tw-flex tw-gap-2 tw-items-center tw-justify-center">
                    {tabKey !== 'receipt' && tabKey !== 'cancelled_receipt' && canEdit && (
                        <button type="button" className="sv-action-icon sv-edit" title="Edit" onClick={() => navigate(`/sales/further-receipt/update/${row.id}`)}>
                            <PencilSimpleIcon weight="bold" className="tw-w-4 tw-h-4" />
                        </button>
                    )}
                    {canPrint && (
                        <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/sales-further-receipt-voucher/${row.receiptId || row.id}${tabKey === 'cancelled_receipt' ? '?cancelled=true' : ''}`, '_blank')}>
                            <Printer weight="bold" className="tw-w-4 tw-h-4" />
                        </button>
                    )}
                    {tabKey !== 'receipt' && tabKey !== 'cancelled_receipt' && canApprove && (
                        <button type="button" className="sv-action-icon sv-add" title="Add" onClick={() => { setSelectedReceiptId(row.id); setSelectedReceiptAmount(row.receiptAmount || row.amount_paid); setIsApprovalPopupOpen(true); }}>
                            <PlusIcon weight="bold" className="tw-w-4 tw-h-4" />
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
                <>
                    <div className="tw-hidden md:tw-block">
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                            <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={getSortDirection('enqNo')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invoiceNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Inv. No <TableSortIcon direction={getSortDirection('invoiceNo')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invoiceDate')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Invoice Date <TableSortIcon direction={getSortDirection('invoiceDate')} /></div>
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
                                            <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
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
                                            <td>{r.enqNo}</td>
                                            <td>{r.invoiceNo}</td>
                                            <td>{r.invoiceDate}</td>
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
                                            <td><Badge value={r.currentStage} map={BADGE_STYLE} color={r.stageColor} /></td>
                                            {hasActionPermission && (
                                                <td>{renderActionButtons(tabKey, r)}</td>
                                            )}
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 11 : 10} className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Mobile View */}
                    <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
                        {items.map((r, idx) => (
                            <MobileCard key={r.id || idx}>
                                <MobileCard.Header label="ENQ. NO" value={r.enqNo} />
                                <MobileCard.Body>
                                    <MobileCard.Field label="Customer Name" value={r.customerName} bold valueColor="blue" />
                                    
                                    <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                        <MobileCard.Field label="Mobile" value={r.mobile || '-'} />
                                        <MobileCard.Field label="Invoice No" value={r.invoiceNo || '-'} align="right" />
                                        <MobileCard.Field label="Invoice Date" value={r.invoiceDate || '-'} />
                                        <MobileCard.Field label="Product Type" value={r.productType || '-'} align="right" />
                                        <MobileCard.Field label="Balance" value={r.balance} valueColor="red" bold />
                                        <MobileCard.Field label="Paid" value={r.paid} valueColor="green" bold align="right" />
                                    </div>
                                    <div className="tw-mt-3 tw-flex tw-items-center tw-gap-2">
                                        <label className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Inv Details</label>
                                        <Badge value={r.invoiceDetails} map={BADGE_STYLE} />
                                    </div>
                                </MobileCard.Body>
                                <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                    <div className="tw-flex tw-gap-4 tw-w-full">
                                        <div className="tw-flex tw-flex-col tw-gap-1">
                                            <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Current Stage</span>
                                            <div><Badge value={r.currentStage} map={BADGE_STYLE} color={r.stageColor} /></div>
                                        </div>
                                    </div>
                                    {hasActionPermission && (
                                        <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                            <MobileCard.Actions>
                                                {renderActionButtons(tabKey, r)}
                                            </MobileCard.Actions>
                                        </div>
                                    )}
                                </MobileCard.Footer>
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
        } else if (tabKey === 'receipt_completed_enquiry') {
            return (
                <>
                    <div className="tw-hidden md:tw-block">
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                            <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={getSortDirection('enqNo')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invoiceNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Inv. No <TableSortIcon direction={getSortDirection('invoiceNo')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('balance')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Amount Details <TableSortIcon direction={getSortDirection('balance')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
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
                                            <td>{r.enqNo}</td>
                                            <td>{r.invoiceNo}</td>
                                            <td>
                                                <div className="tw-flex tw-flex-col">
                                                    <span className="tw-text-sm">Balance: <strong style={{ color: '#ef4444' }}>{r.balance}</strong></span>
                                                    <span className="tw-text-sm">Paid: <strong style={{ color: '#16a34a' }}>{r.paid}</strong></span>
                                                </div>
                                            </td>
                                            <td>{r.customerName}</td>
                                            <td>{r.mobile}</td>
                                            <td><Badge value={r.currentStage} map={BADGE_STYLE} color={r.stageColor} /></td>
                                            {hasActionPermission && (
                                                <td>{renderActionButtons(tabKey, r)}</td>
                                            )}
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 8 : 7} className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Mobile View */}
                    <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
                        {items.map((r, idx) => (
                            <MobileCard key={r.id || idx}>
                                <MobileCard.Header label="ENQ. NO" value={r.enqNo} />
                                <MobileCard.Body>
                                    <MobileCard.Field label="Customer Name" value={r.customerName} bold valueColor="blue" />
                                    
                                    <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                        <MobileCard.Field label="Mobile" value={r.mobile || '-'} />
                                        <MobileCard.Field label="Invoice No" value={r.invoiceNo || '-'} align="right" />
                                        <MobileCard.Field label="Balance" value={r.balance} valueColor="red" bold />
                                        <MobileCard.Field label="Paid" value={r.paid} valueColor="green" bold align="right" />
                                    </div>
                                </MobileCard.Body>
                                <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                    <div className="tw-flex tw-gap-4 tw-w-full">
                                        <div className="tw-flex tw-flex-col tw-gap-1">
                                            <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Current Stage</span>
                                            <div><Badge value={r.currentStage} map={BADGE_STYLE} color={r.stageColor} /></div>
                                        </div>
                                    </div>
                                    {hasActionPermission && (
                                        <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                            <MobileCard.Actions>
                                                {renderActionButtons(tabKey, r)}
                                            </MobileCard.Actions>
                                        </div>
                                    )}
                                </MobileCard.Footer>
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
        } else if (tabKey === 'collection_pending' || tabKey === 'receipt') {
            return (
                <>
                    <div className="tw-hidden md:tw-block">
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                            <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invoiceNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                Invoice No <TableSortIcon direction={getSortDirection('invoiceNo')} />
                                            </div>
                                        </th>
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
                                                Customer Name <TableSortIcon direction={getSortDirection('customerName')} />
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
                                        {hasActionPermission && <th className="tw-align-middle">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((r, idx) => (
                                        <tr key={r.id}>
                                            <td>{startIndex + idx + 1}</td>
                                            <td>{r.invoiceNo}</td>
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
                                            <td><Badge value={r.receiptStatus} map={BADGE_STYLE} color={r.stageColor} /></td>
                                            {hasActionPermission && (
                                                <td>{renderActionButtons(tabKey, r)}</td>
                                            )}
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan="11" className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Mobile View */}
                    <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
                        {items.map((r, idx) => (
                            <MobileCard key={r.id || idx}>
                                <MobileCard.Header label="INVOICE NO" value={r.invoiceNo} />
                                <MobileCard.Body>
                                    <MobileCard.Field label="Customer Name" value={r.customerName} bold valueColor="blue" />
                                    {tabKey === 'collection_pending' && (
                                        <MobileCard.Field label="Employee Name" value={r.employeeName} />
                                    )}
                                    
                                    <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                        <MobileCard.Field label="Mobile" value={r.mobile || '-'} />
                                        <MobileCard.Field label="Receipt Date" value={r.receiptDate || '-'} align="right" />
                                        
                                        {tabKey !== 'collection_pending' && (
                                            <MobileCard.Field label="Receipt No" value={r.receiptNumber || '-'} />
                                        )}
                                        <MobileCard.Field label="Amount" value={r.receiptAmount} bold valueColor="green" align="right" />
                                    </div>
                                    
                                    {tabKey !== 'collection_pending' && tabKey !== 'receipt' && tabKey !== 'cancelled' && (
                                        <div className="tw-mt-3">
                                            <label className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-block tw-mb-1">Followup Date</label>
                                            <input type="text" className="form-control form-control-sm tw-w-full" defaultValue={r.followupDate} />
                                        </div>
                                    )}
                                </MobileCard.Body>
                                <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                    <div className="tw-flex tw-gap-4 tw-w-full">
                                        <div className="tw-flex tw-flex-col tw-gap-1">
                                            <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Status</span>
                                            <div><Badge value={r.receiptStatus} map={BADGE_STYLE} color={r.stageColor} /></div>
                                        </div>
                                        {tabKey !== 'collection_pending' && tabKey !== 'receipt' && tabKey !== 'cancelled' && (
                                            <div className="tw-flex tw-flex-col tw-gap-1">
                                                <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Followup Status</span>
                                                <div><Badge value={r.followupStatus} map={BADGE_STYLE} /></div>
                                            </div>
                                        )}
                                    </div>
                                    {hasActionPermission && (
                                        <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                            <MobileCard.Actions>
                                                {renderActionButtons(tabKey, r)}
                                            </MobileCard.Actions>
                                        </div>
                                    )}
                                </MobileCard.Footer>
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
        } else if (tabKey === 'cancelled_receipt') {
            return (
                <>
                    <div className="tw-hidden md:tw-block">
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                            <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invoiceNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Invoice No <TableSortIcon direction={getSortDirection('invoiceNo')} /></div>
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
                                            <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptStatus')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Receipt Status <TableSortIcon direction={getSortDirection('receiptStatus')} /></div>
                                        </th>
                                        {hasActionPermission && <th className="tw-align-middle">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((r, idx) => (
                                        <tr key={r.id}>
                                            <td>{startIndex + idx + 1}</td>
                                            <td>{r.invoiceNo}</td>
                                            <td>{r.receiptDate}</td>
                                            <td>{r.receiptNumber}</td>
                                            <td>{r.receiptAmount}</td>
                                            <td>{r.customerName}</td>
                                            <td>{r.mobile}</td>
                                            <td><Badge value={r.receiptStatus} map={BADGE_STYLE} color={r.stageColor} /></td>
                                            {hasActionPermission && (
                                                <td>{renderActionButtons(tabKey, r)}</td>
                                            )}
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
                    </div>
                    {/* Mobile View */}
                    <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
                        {items.map((r, idx) => (
                            <MobileCard key={r.id || idx}>
                                <MobileCard.Header label="INVOICE NO" value={r.invoiceNo} />
                                <MobileCard.Body>
                                    <MobileCard.Field label="Customer Name" value={r.customerName} bold valueColor="blue" />
                                    
                                    <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                        <MobileCard.Field label="Mobile" value={r.mobile || '-'} />
                                        <MobileCard.Field label="Receipt Date" value={r.receiptDate || '-'} align="right" />
                                        <MobileCard.Field label="Receipt No" value={r.receiptNumber || '-'} />
                                        <MobileCard.Field label="Amount" value={r.receiptAmount} bold valueColor="green" align="right" />
                                    </div>
                                </MobileCard.Body>
                                <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                    <div className="tw-flex tw-gap-4 tw-w-full">
                                        <div className="tw-flex tw-flex-col tw-gap-1">
                                            <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Status</span>
                                            <div><Badge value={r.receiptStatus} map={BADGE_STYLE} color={r.stageColor} /></div>
                                        </div>
                                    </div>
                                    {hasActionPermission && (
                                        <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                            <MobileCard.Actions>
                                                {renderActionButtons(tabKey, r)}
                                            </MobileCard.Actions>
                                        </div>
                                    )}
                                </MobileCard.Footer>
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
                        {/* Tabs */}
                        <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mb-4">
                            {canViewEnquiry && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-font-medium ${activeTab === 'enquiry' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('enquiry'); setCurrentPage(1);  }}
                                >
                                    Invoice List in Receipt
                                </button>
                            )}
                            {canViewReceiptCompletedEnquiry && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-font-medium ${activeTab === 'receipt_completed_enquiry' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('receipt_completed_enquiry'); setCurrentPage(1);  }}
                                >
                                    Receipt Completed Invoice List
                                </button>
                            )}
                            {canViewCollectionPending && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-font-medium ${activeTab === 'collection_pending' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('collection_pending'); setCurrentPage(1);  }}
                                >
                                    Collection Pending List
                                </button>
                            )}
                            {canViewReceipt && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-font-medium ${activeTab === 'receipt' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('receipt'); setCurrentPage(1);  }}
                                >
                                    Receipt List
                                </button>
                            )}
                            {canViewCancelledReceipt && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-font-medium ${activeTab === 'cancelled_receipt' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('cancelled_receipt'); setCurrentPage(1);  }}
                                >
                                    Cancelled Receipt
                                </button>
                            )}
                        </div>

                        {/* Show / Search */}
                        <div className="list-top-bar tw-mb-4 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
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
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                <span className="tw-whitespace-nowrap">Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-flex-1 md:tw-w-48 tw-inline-block"
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
                            } else if (activeTab === 'cancelled_receipt') {
                                sourceItems = sortedCancelled;
                                requestSort = reqSortCancelled;
                                getSortDir = getSortDirCancelled;
                            } else {
                                sourceItems = sortedCollection;
                                requestSort = reqSortCollection;
                                getSortDir = getSortDirCollection;
                            }

                            const q = searchText.trim().toLowerCase();
                            const filtered = q
                                ? sourceItems.filter(r =>
                                    String(r.receiptNo || '').toLowerCase().includes(q) ||
                                    String(r.receiptNumber || '').toLowerCase().includes(q) ||
                                    String(r.enqNo || '').toLowerCase().includes(q) ||
                                    String(r.invoiceNo || '').toLowerCase().includes(q) ||
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
            {isApprovalPopupOpen && (
                <ApprovelPopup 
                    isOpen={isApprovalPopupOpen} 
                    receiptId={selectedReceiptId}
                    defaultAmount={selectedReceiptAmount}
                    onClose={() => setIsApprovalPopupOpen(false)} 
                    onSubmit={handleApprovalSubmit}
                />
            )}
            {isCollectAmountPopupOpen && (
                <CollectAmountPopup 
                    isOpen={isCollectAmountPopupOpen} 
                    onClose={() => setIsCollectAmountPopupOpen(false)} 
                    onConfirm={handleCollectSubmit}
                    bankOptions={bankOptions}
                    amount={finalCollectedAmount}
                />
            )}
        </section>
    );
};

export default FurtherReceiptList;
