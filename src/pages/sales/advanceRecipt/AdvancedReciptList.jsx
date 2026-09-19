import { useLoader } from '../../../context/LoaderContext';
import SmartPagination from '../../../components/SmartPagination';
import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, ListIcon, Printer, FilePdf } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import ApprovelPopup from '../../../components/Popup/ApprovelPopup';
import UpdateFollowupDatePopup from '../../../components/Popup/UpdateFollowupDatePopup';
import SuccessPopup from '../../../components/Popup/SuccessPopup';
import ErrorPopup from '../../../components/Popup/ErrorPopup';
import CollectAmountPopup from '../../../components/Popup/CollectAmountPopup';
import { usePermissions } from '../../../context/PermissionContext';
import MobileCard from '../../../components/common/MobileCard';

/* ── Badge styles ─────────────────────────────────────────────── */
const BADGE_STYLE = {
    'Job Card': { bg: '#0ea5e9', color: '#ffffff' },
    'Enquiry': { bg: '#f59e0b', color: '#ffffff' },
    'No Followup': { bg: '#94a3b8', color: '#ffffff' },
    'Pending': { bg: '#ef4444', color: '#ffffff' },
    'Completed': { bg: '#10b981', color: '#ffffff' },
    'Overdue': { bg: '#ef4444', color: '#ffffff' }, // Red
    'Today': { bg: '#eab308', color: '#ffffff' }, // Yellow
    'Infollowup': { bg: '#3b82f6', color: '#ffffff' } // Blue
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
const AdvancedReciptList = () => {
    const { hasPermission, refreshPermissions } = usePermissions();
    const { setLoading } = useLoader();
    const navigate = useNavigate();
    const [enquiryData, setEnquiryData] = useState([]);
    const [collectionData, setCollectionData] = useState([]);
    const [receiptData, setReceiptData] = useState([]);
    
    const location = useLocation();
    
    // Tab and Display Limits
    const canViewAdvanceList = hasPermission('Sales.Advanced Receipt - Advance List in Receipt.View');
    const canViewCollectionPending = hasPermission('Sales.Advanced Receipt - Collection Pending List.View');
    const canViewReceiptList = hasPermission('Sales.Advanced Receipt - Receipt List.View');

    const [activeTab, setActiveTab] = useState(() => {
        if (location.state?.defaultTab) return location.state.defaultTab;
        if (canViewAdvanceList) return 'enquiry';
        if (canViewCollectionPending) return 'collection';
        if (canViewReceiptList) return 'receipt';
        return 'enquiry';
    });

    useEffect(() => {
        if (activeTab === 'enquiry' && !canViewAdvanceList) {
            setActiveTab(canViewCollectionPending ? 'collection' : (canViewReceiptList ? 'receipt' : 'enquiry'));
        } else if (activeTab === 'collection' && !canViewCollectionPending) {
            setActiveTab(canViewAdvanceList ? 'enquiry' : (canViewReceiptList ? 'receipt' : 'collection'));
        } else if (activeTab === 'receipt' && !canViewReceiptList) {
            setActiveTab(canViewAdvanceList ? 'enquiry' : (canViewCollectionPending ? 'collection' : 'receipt'));
        }
    }, [canViewAdvanceList, canViewCollectionPending, canViewReceiptList, activeTab]);

    const activeTabLabel = 
        activeTab === 'enquiry' ? 'Advanced Receipt - Advance List in Receipt' :
        activeTab === 'collection' ? 'Advanced Receipt - Collection Pending List' :
        'Advanced Receipt - Receipt List';

    const canEdit = hasPermission(`Sales.${activeTabLabel}.Edit`);
    const canPrint = hasPermission(`Sales.${activeTabLabel}.Print`);
    const canApprove = hasPermission(`Sales.${activeTabLabel}.Approve`);

    const hasActionPermission = canEdit || canPrint || canApprove;

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Legacy ones that might still be used elsewhere:
    const [entriesCount, setEntriesCount] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Popups
    const [isApprovalPopupOpen, setIsApprovalPopupOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [isFollowupDatePopupOpen, setIsFollowupDatePopupOpen] = useState(false);
    const [selectedFollowupRow, setSelectedFollowupRow] = useState(null);

    const getFollowupStatus = (dateStr) => {
        if (!dateStr) return 'No Followup';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fDate = new Date(dateStr);
        fDate.setHours(0, 0, 0, 0);
        if (fDate < today) return 'Overdue';
        if (fDate.getTime() === today.getTime()) return 'Today';
        return 'Infollowup';
    };

    // Popup state
    const [isFollowupPopupOpen, setIsFollowupPopupOpen] = useState(false);
    const [selectedFollowup, setSelectedFollowup] = useState({ id: null, date: '' });
    
    // Collect popup states
    const [isCollectPopupOpen, setIsCollectPopupOpen] = useState(false);
    const [pendingReceiptData, setPendingReceiptData] = useState(null);
    const [bankOptions, setBankOptions] = useState([]);

    const handleFollowupChange = (id, newDate) => {
        setSelectedFollowup({ id, date: newDate });
        setIsFollowupPopupOpen(true);
    };

    const handleFollowupConfirm = async (remark) => {
        try {
            const { id, date: newDate } = selectedFollowup;
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/advance-receipt/followup/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ followup_date: newDate, remark })
            });
            const json = await response.json();
            if (json.status) {
                const updatedData = enquiryData.map(item => {
                    if (item.id === id) {
                        return { 
                            ...item, 
                            followupDate: newDate, 
                            followupStatus: getFollowupStatus(newDate) 
                        };
                    }
                    return item;
                });
                const priority = { 'Today': 1, 'Overdue': 2, 'Infollowup': 3, 'No Followup': 4 };
                updatedData.sort((a, b) => (priority[a.followupStatus] || 5) - (priority[b.followupStatus] || 5));
                setEnquiryData(updatedData);
                setSuccessMessage('Followup date updated successfully');
            } else {
                setErrorMessage(json.message || 'Failed to update followup date');
            }
        } catch (e) {
            console.error(e);
            setErrorMessage('Failed to update followup date');
        } finally {
            setIsFollowupPopupOpen(false);
        }
    };



    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [custRes, stageRes, res, colRes, recRes, bankRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/customer`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/terrific_stages`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/advance-receipt/list`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/collections/pending?type=1`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/collections/receipts?type=1`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/bank_account_details`)
                ]);

                const [custJson, stageJson, json, colJson, recJson, bankJson] = await Promise.all([
                    custRes.json(),
                    stageRes.json(),
                    res.json(),
                    colRes.json(),
                    recRes.json(),
                    bankRes.json()
                ]);

                if (bankJson.status && bankJson.data) {
                    setBankOptions(bankJson.data.map(b => ({ value: b.id, label: b.holder_name || b.name || b.text })));
                } else if (Array.isArray(bankJson)) {
                    setBankOptions(bankJson.map(b => ({ value: b.id, label: b.holder_name || b.name || b.text })));
                }

                const custMap = {};
                if (custJson.status && custJson.data) custJson.data.forEach(c => custMap[c.id] = c.name);

                const stageMap = {};
                if (stageJson.status && stageJson.data) stageJson.data.forEach(s => stageMap[s.id] = s.name);

                if (json.status === 'success' && json.data) {
                    const mappedData = json.data.map(item => {
                        const total = parseFloat(item.computed_total_amount) || 0;
                        const advance = parseFloat(item.computed_paid_amount) || 0;
                        const bal = total - advance;
                        const fDateStr = item.last_committed_date ? item.last_committed_date.substring(0, 10) : '';

                        return {
                            id: item.id,
                            enqNo: item.enquiry_number || '',
                            customerName: custMap[item.customer_id] || item.cust_contact_name || item.customer_id || 'Unknown',
                            mobile: item.mobile_number1 || '',
                            balance: bal.toFixed(2),
                            paid: advance.toFixed(2),
                            followupDate: fDateStr,
                            followupStatus: getFollowupStatus(fDateStr),
                            currentStage: item.current_stage || stageMap[item.stage_id] || 'Converted'
                        };
                    });
                    const priority = { 'Today': 1, 'Overdue': 2, 'Infollowup': 3, 'No Followup': 4 };
                    mappedData.sort((a, b) => (priority[a.followupStatus] || 5) - (priority[b.followupStatus] || 5));
                    setEnquiryData(mappedData);
                }

                if (colJson.status && colJson.data) {
                    const mappedCol = colJson.data.map(item => ({
                        id: item.receipt_id,
                        enqNo: item.enq_no,
                        invNo: item.invoice_id || '-',
                        receiptDate: item.receipt_date,
                        receiptNumber: item.receipt_id,
                        receiptAmount: parseFloat(item.amount).toFixed(2),
                        customerName: item.customer_name,
                        employeeName: item.engineer_name,
                        mobile: item.mobile || '-',
                        followupDate: item.followup_date,
                        followupStatus: item.followup_status,
                        receiptStatus: item.status
                    }));
                    setCollectionData(mappedCol);
                }

                if (recJson.status && recJson.data) {
                    const mappedRec = recJson.data.map(item => ({
                        id: item.receipt_id,
                        enqNo: item.enq_no,
                        invNo: item.invoice_no,
                        receiptDate: item.receipt_date,
                        receiptNumber: item.receipt_number,
                        receiptAmount: parseFloat(item.amount).toFixed(2),
                        customerName: item.customer_name,
                        mobile: item.mobile,
                        followupDate: item.followup_date,
                        followupStatus: item.followup_status,
                        receiptStatus: item.receipt_status
                    }));
                    setReceiptData(mappedRec);
                }

            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setLoading]);

    const { items: sortedEnquiry, requestSort: reqSortEnquiry, getSortDirection: getSortDirEnquiry } = useSortableData(enquiryData);
    const { items: sortedCollection, requestSort: reqSortCollection, getSortDirection: getSortDirCollection } = useSortableData(collectionData);
    const { items: sortedReceipt, requestSort: reqSortReceipt, getSortDirection: getSortDirReceipt } = useSortableData(receiptData);

    const handleApprovalSubmit = async (data) => {
        setIsApprovalPopupOpen(false);
        setPendingReceiptData(data);
        setIsCollectPopupOpen(true);
    };

    const handleCollectSubmit = async (bankId) => {
        setIsCollectPopupOpen(false);
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/collections/approve/${pendingReceiptData.receiptId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    account_id: bankId
                })
            });
            const result = await response.json();
            if (result.status) {
                setSuccessMessage(result.message || 'Amount collected successfully.');
                // Refresh data
                const [pendingRes, receiptsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/collections/pending?type=1`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/collections/receipts?type=1`)
                ]);
                const [colJson, recJson] = await Promise.all([pendingRes.json(), receiptsRes.json()]);
                
                if (colJson.status && colJson.data) {
                    const mappedCol = colJson.data.map(item => ({
                        id: item.receipt_id,
                        enqNo: item.enq_no,
                        invNo: item.invoice_id || '-',
                        receiptDate: item.receipt_date,
                        receiptNumber: item.receipt_id,
                        receiptAmount: parseFloat(item.amount).toFixed(2),
                        customerName: item.customer_name,
                        employeeName: item.engineer_name,
                        mobile: item.mobile || '-',
                        followupDate: item.followup_date,
                        followupStatus: item.followup_status,
                        receiptStatus: item.status
                    }));
                    setCollectionData(mappedCol);
                }

                if (recJson.status && recJson.data) {
                    const mappedRec = recJson.data.map(item => ({
                        id: item.receipt_id,
                        enqNo: item.enq_no,
                        invNo: item.invoice_no,
                        receiptDate: item.receipt_date,
                        receiptNumber: item.receipt_number,
                        receiptAmount: parseFloat(item.amount).toFixed(2),
                        customerName: item.customer_name,
                        mobile: item.mobile,
                        followupDate: item.followup_date,
                        followupStatus: item.followup_status,
                        receiptStatus: item.receipt_status
                    }));
                    setReceiptData(mappedRec);
                }
            } else {
                setErrorMessage(result.message || 'Failed to approve collection.');
            }
        } catch (error) {
            console.error('Error approving collection:', error);
            setErrorMessage('An error occurred during approval.');
        } finally {
            setLoading(false);
        }
    };

    const renderActionButtons = (tabKey, row) => {
        if (tabKey === 'enquiry') {
            return (
                <div className="tw-flex tw-gap-2 tw-items-center">
                    {canEdit && (
                        <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate('/sales/advanced-receipt/add/' + row.id)}>
                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                        </button>
                    )}
                    {canPrint && (
                        <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/sales-further-receipt/${row.id}?type=advance`, '_blank')}>
                            <Printer weight="duotone" className="tw-w-4" />
                        </button>
                    )}
                </div>
            );
        }
        return (
            <div className="tw-flex tw-gap-2 tw-items-center">
                {tabKey !== 'receipt' && canEdit && (
                    <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/sales/advanced-receipt/edit/${row.id}`)}>
                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                    </button>
                )}
                {tabKey === 'receipt' && canPrint && (
                    <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/sales-advance-receipt/${row.id}`, '_blank')}>
                        <Printer weight="duotone" className="tw-w-4" />
                    </button>
                )}
                {tabKey === 'collection' && canApprove && (
                    <button type="button" className="list-action-btn btn-add" title="Approve" onClick={() => {
                        setSelectedReceipt(row);
                        setIsApprovalPopupOpen(true);
                    }}>
                        <PlusIcon weight="bold" className="tw-w-4" />
                    </button>
                )}
            </div>
        );
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
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('balance')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Balance <TableSortIcon direction={getSortDirection('balance')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('paid')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Paid <TableSortIcon direction={getSortDirection('paid')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('followupDate')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Followup Date <TableSortIcon direction={getSortDirection('followupDate')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('followupStatus')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Followup Status <TableSortIcon direction={getSortDirection('followupStatus')} /></div>
                                        </th>
                                        {/* <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('currentStage')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div>
                                        </th> */}
                                        {hasActionPermission && <th className="tw-align-middle">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((r, idx) => (
                                        <tr key={r.id}>
                                            <td>{startIndex + idx + 1}</td>
                                            <td>{r.enqNo}</td>
                                            <td>{r.customerName}</td>
                                            <td>{r.mobile}</td>
                                            <td>
                                                <strong style={{ color: '#ef4444' }}>{r.balance}</strong>
                                            </td>
                                            <td>
                                                <strong style={{ color: '#16a34a' }}>{r.paid}</strong>
                                            </td>
                                            <td>
                                                <input 
                                                    type="date" 
                                                    className="form-control" 
                                                    value={r.followupDate} 
                                                    onChange={(e) => handleFollowupChange(r.id, e.target.value)}
                                                    style={{ minWidth: '150px' }} 
                                                />
                                            </td>
                                            <td><Badge value={r.followupStatus} map={BADGE_STYLE} /></td>
                                            {/* <td><Badge value={r.currentStage} map={BADGE_STYLE} /></td> */}
                                            {hasActionPermission && (
                                                <td>
                                                    {renderActionButtons(tabKey, r)}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 9 : 8} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
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
                                        <MobileCard.Field label="Balance" value={r.balance} valueColor="red" align="right" bold />
                                        <MobileCard.Field label="Paid" value={r.paid} valueColor="green" bold />
                                    </div>

                                    <div className="tw-mt-3">
                                        <label className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-block tw-mb-1">Followup Date</label>
                                        <input 
                                            type="date" 
                                            className="form-control form-control-sm tw-w-full" 
                                            value={r.followupDate} 
                                            onChange={(e) => handleFollowupChange(r.id, e.target.value)}
                                        />
                                    </div>
                                </MobileCard.Body>
                                <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                    <div className="tw-flex tw-gap-4 tw-w-full">
                                        <div className="tw-flex tw-flex-col tw-gap-1">
                                            <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Status</span>
                                            <div><Badge value={r.followupStatus} map={BADGE_STYLE} /></div>
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
        } else if (tabKey === 'collection') {
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
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Inv. No <TableSortIcon direction={getSortDirection('invNo')} /></div>
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
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('employeeName')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Employee Name <TableSortIcon direction={getSortDirection('employeeName')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('followupDate')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Followup Date <TableSortIcon direction={getSortDirection('followupDate')} /></div>
                                        </th>
                                        {hasActionPermission && <th className="tw-align-middle">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((r, idx) => (
                                        <tr key={r.id}>
                                            <td>{startIndex + idx + 1}</td>
                                            <td>{r.enqNo}</td>
                                            <td>{r.invNo}</td>
                                            <td>{r.receiptDate}</td>
                                            <td>{r.receiptNumber}</td>
                                            <td>{r.receiptAmount}</td>
                                            <td>{r.customerName}</td>
                                            <td>{r.employeeName}</td>
                                            <td>{r.mobile}</td>
                                            <td>{r.followupDate}</td>
                                            {hasActionPermission && (
                                                <td>
                                                    {renderActionButtons(tabKey, r)}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 11 : 10} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
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
                                    <MobileCard.Field label="Employee Name" value={r.employeeName} />
                                    
                                    <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                        <MobileCard.Field label="Mobile" value={r.mobile || '-'} />
                                        <MobileCard.Field label="Inv. No" value={r.invNo || '-'} align="right" />
                                        <MobileCard.Field label="Receipt Date" value={r.receiptDate || '-'} />
                                        <MobileCard.Field label="Receipt No" value={r.receiptNumber || '-'} align="right" />
                                        <MobileCard.Field label="Amount" value={r.receiptAmount} bold align="right" />
                                        <MobileCard.Field label="Followup Date" value={r.followupDate || '-'} />
                                    </div>
                                </MobileCard.Body>
                                <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                    {hasActionPermission && (
                                        <div className="tw-w-full tw-flex tw-justify-end">
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
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invNo')}>
                                        <div className="tw-flex tw-justify-between tw-items-center">Inv. No <TableSortIcon direction={getSortDirection('invNo')} /></div>
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
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('followupDate')}>
                                        <div className="tw-flex tw-justify-between tw-items-center">Followup Date <TableSortIcon direction={getSortDirection('followupDate')} /></div>
                                    </th>
                                    {hasActionPermission && <th className="tw-align-middle">Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((r, idx) => (
                                    <tr key={r.id}>
                                        <td>{startIndex + idx + 1}</td>
                                        <td>{r.enqNo}</td>
                                        <td>{r.invNo}</td>
                                        <td>{r.receiptDate}</td>
                                        <td>{r.receiptNumber}</td>
                                        <td>{r.receiptAmount}</td>
                                        <td>{r.customerName}</td>
                                        <td>{r.mobile}</td>
                                        <td>{r.followupDate}</td>
                                        {hasActionPermission && (
                                            <td>
                                                {renderActionButtons(tabKey, r)}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan="10" className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
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
                                    <MobileCard.Field label="Inv. No" value={r.invNo || '-'} align="right" />
                                    <MobileCard.Field label="Receipt Date" value={r.receiptDate || '-'} />
                                    <MobileCard.Field label="Receipt No" value={r.receiptNumber || '-'} align="right" />
                                    <MobileCard.Field label="Amount" value={r.receiptAmount} bold align="right" />
                                    <MobileCard.Field label="Followup Date" value={r.followupDate || '-'} />
                                </div>
                            </MobileCard.Body>
                            <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                {hasActionPermission && (
                                    <div className="tw-w-full tw-flex tw-justify-end">
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
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Advanced Receipt</h3>
                    </div>

                    <div className="card-body">
                        {/* Tabs */}
                        {/* Tabs */}
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 tw-mb-4">
                            {canViewAdvanceList && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'enquiry' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('enquiry'); setCurrentPage(1);  }}
                                >
                                    Advance List in Receipt
                                </button>
                            )}
                            {canViewCollectionPending && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'collection' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('collection'); setCurrentPage(1);  }}
                                >
                                    Collection Pending List
                                </button>
                            )}
                            {canViewReceiptList && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'receipt' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('receipt'); setCurrentPage(1);  }}
                                >
                                    Receipt List
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
                            } else if (activeTab === 'collection') {
                                sourceItems = sortedCollection;
                                requestSort = reqSortCollection;
                                getSortDir = getSortDirCollection;
                            } else {
                                sourceItems = sortedReceipt;
                                requestSort = reqSortReceipt;
                                getSortDir = getSortDirReceipt;
                            }

                            const q = searchText.trim().toLowerCase();
                            const filtered = q
                                ? sourceItems.filter(r =>
                                    String(r.receiptNo || '').toLowerCase().includes(q) ||
                                    String(r.receiptNumber || '').toLowerCase().includes(q) ||
                                    String(r.enqNo || '').toLowerCase().includes(q) ||
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
                                    <SmartPagination 
                                        currentPage={safePage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        startIndex={startIndex}
                                        entriesPerPage={pageSize}
                                        totalEntries={total}
                                    />
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
            <ApprovelPopup 
                isOpen={isApprovalPopupOpen} 
                receiptId={selectedReceipt?.id}
                defaultAmount={selectedReceipt?.receiptAmount}
                onClose={() => setIsApprovalPopupOpen(false)} 
                onSubmit={handleApprovalSubmit}
            />
            <UpdateFollowupDatePopup
                isOpen={isFollowupPopupOpen}
                onClose={() => setIsFollowupPopupOpen(false)}
                onConfirm={handleFollowupConfirm}
                newDate={selectedFollowup.date ? new Date(selectedFollowup.date).toLocaleDateString('en-GB').replace(/\//g, '-') : ''}
            />
            
            <CollectAmountPopup
                isOpen={isCollectPopupOpen}
                onClose={() => setIsCollectPopupOpen(false)}
                onConfirm={handleCollectSubmit}
                bankOptions={bankOptions}
                amount={pendingReceiptData?.actualAmount || ''}
            />

            <SuccessPopup
                isOpen={!!successMessage}
                message={successMessage}
                onClose={() => setSuccessMessage('')}
            />

            <ErrorPopup
                isOpen={!!errorMessage}
                message={errorMessage}
                onClose={() => setErrorMessage('')}
            />
        </section>
    );
};

export default AdvancedReciptList;
