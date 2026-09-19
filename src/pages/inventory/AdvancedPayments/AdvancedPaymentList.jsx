import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PencilSimpleIcon, FilePdfIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import { useLoader } from '../../../context/LoaderContext';
import Pagination from '../../../components/Pagination';

/* ── Dummy data ─────────────────────────────────────────────────── */
const PO_RECEIPT_DATA = [
    { id: 1, poNo: 'PO-1001', vendorName: 'COMPTECH EQUIPMENTS LIMITED', productType: 'Air Compressor',  mobile: '9876543210', balanceAmount: 10000, currentStage: 'Under Process' },
    { id: 2, poNo: 'PO-1002', vendorName: 'SAI ENGINEERING WORKS',       productType: 'Pump',            mobile: '9123456780', balanceAmount: 0,     currentStage: 'Completed'     },
    { id: 3, poNo: 'PO-1003', vendorName: 'SFMC PIPES PVT LTD',          productType: 'Pipe Fittings',   mobile: '9988776655', balanceAmount: 5500,  currentStage: 'Pending'       },
];

const COLLECTION_PENDING_DATA = [
    { id: 1, poNo: '2305', receiptDate: '22-02-2026', receiptNumber: '1', receiptAmount: 29000, productType: '', customerName: 'SARAS INDUSTRY', employeeName: 'Naveen', mobile: '9698667083', receiptStatus: 'receipt' },
    { id: 2, poNo: '2306', receiptDate: '10-03-2026', receiptNumber: '2', receiptAmount: 15000, productType: '', customerName: 'ABC TRADERS',     employeeName: 'Ravi',   mobile: '9876543210', receiptStatus: 'receipt' },
    { id: 3, poNo: '2307', receiptDate: '18-04-2026', receiptNumber: '3', receiptAmount: 42000, productType: '', customerName: 'XYZ CORP',        employeeName: 'Kumar',  mobile: '9123456780', receiptStatus: 'receipt' },
];

const RECEIPT_DATA = [
    { id: 1, poNo: '2305', invNo: '', receiptDate: '22-02-2026', receiptNumber: '1', receiptAmount: 29000, customerName: 'SARAS INDUSTRY', mobile: '9698667083', receiptStatus: 'receipt' },
    { id: 2, poNo: '2306', invNo: '', receiptDate: '10-03-2026', receiptNumber: '2', receiptAmount: 15000, customerName: 'ABC TRADERS',    mobile: '9876543210', receiptStatus: 'receipt' },
    { id: 3, poNo: '2307', invNo: '', receiptDate: '18-04-2026', receiptNumber: '3', receiptAmount: 42000, customerName: 'XYZ CORP',       mobile: '9123456780', receiptStatus: 'receipt' },
];

/* ── Badge ──────────────────────────────────────────────────────── */
const STATUS_STYLE = {
    Paid:    { bg: '#22c55e', color: '#fff' },
    Partial: { bg: '#f59e0b', color: '#000' },
    Pending: { bg: '#ef4444', color: '#fff' },
};

const Badge = ({ value }) => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Inventory.Advanced Payment List.Edit') || hasPermission('Inventory.Advanced Payment List.Delete');
    const st = STATUS_STYLE[value] || { bg: '#e5e7eb', color: '#111827' };
    return (
        <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 3, whiteSpace: 'nowrap', fontSize: 12 }}>
            {value || '-'}
        </span>
    );
};

const fmt = (v) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v || 0));

/* ── Component ──────────────────────────────────────────────────── */
import CollectAmountPopup from '../../../components/Popup/CollectAmountPopup';
import { usePermissions } from '../../../context/PermissionContext';
import MobileCard from '../../../components/common/MobileCard';

const AdvancedPaymentList = () => {
    const { hasPermission, refreshPermissions } = usePermissions();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Dynamic tabs based on view permissions
    const ALL_TABS = [
        { key: 'po',         label: 'Purchase Order List in Receipt', perm: 'Inventory.Advanced Payment List - Purchase Order List in Receipt.View' },
        { key: 'collection', label: 'Collection Pending List', perm: 'Inventory.Advanced Payment List - Collection Pending List.View' },
        { key: 'receipt',    label: 'Receipt List', perm: 'Inventory.Advanced Payment List - Receipt List.View' },
    ];
    const availableTabs = ALL_TABS.filter(t => hasPermission(t.perm));

    const [activeTab,   setActiveTab]   = useState(() => {
        if (location.state?.tab) return location.state.tab;
        return availableTabs.length > 0 ? availableTabs[0].key : 'po';
    });

    let hasActionPermission = false;
    if (activeTab === 'po') {
        hasActionPermission = hasPermission('Inventory.Advanced Payment List - Purchase Order List in Receipt.Edit');
    } else if (activeTab === 'collection') {
        hasActionPermission = hasPermission('Inventory.Advanced Payment List - Collection Pending List.Edit') || hasPermission('Inventory.Advanced Payment List - Collection Pending List.Collect');
    } else if (activeTab === 'receipt') {
        hasActionPermission = hasPermission('Inventory.Advanced Payment List - Receipt List.Print');
    }

    const { setLoading } = useLoader();
    const [searchText,  setSearchText]  = useState('');
    const [pageSize,    setPageSize]    = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [poData, setPoData] = useState([]);
    const [collectionData, setCollectionData] = useState([]);
    const [receiptData, setReceiptData] = useState([]);
    const [bankOptions, setBankOptions] = useState([]);

    const [showCollectPopup, setShowCollectPopup] = useState(false);
    const [selectedReceiptForCollection, setSelectedReceiptForCollection] = useState(null);
    
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        if (activeTab === 'po') {
            fetchPoData(signal);
        } else if (activeTab === 'collection') {
            fetchCollectionData(signal);
        } else if (activeTab === 'receipt') {
            fetchReceiptData(signal);
        }

        return () => {
            controller.abort();
        };
    }, [activeTab]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchInitialData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const headers = { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
                const bankRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/bank_account_details`, { headers, signal: controller.signal });
                const bankJson = await bankRes.json();
                if (bankJson.status && bankJson.data) {
                    setBankOptions(bankJson.data.map(b => ({ value: b.id, label: b.holder_name })));
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error("Error fetching banks:", err);
            }
        };
        fetchInitialData();
        return () => controller.abort();
    }, []);

    const fetchPoData = async (signal) => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/advance-payments/purchase-orders?t=${new Date().getTime()}`, { headers, cache: 'no-store', signal });
            const result = await response.json();
            if (result.status && result.data) {
                const formatted = result.data.map(item => {
                    let pType = 'Product';
                    if (item.product_type == 1) pType = 'Spare';
                    else if (item.product_type == 2) pType = 'Tool';
                    else if (item.product_type == 3) pType = 'Accessory';

                    return {
                        id: item.id,
                        poNo: item.po_no,
                        vendorName: item.vendor ? item.vendor.name : '',
                        productType: pType,
                        mobile: item.vendor ? (item.vendor.mobile_number || item.vendor.phone_number || '') : '',
                        balanceAmount: item.balance_amount || 0,
                        currentStage: item.status == 1 ? 'Pending' : (item.status == 2 ? 'Completed' : 'Under Process')
                    };
                });
                setPoData(formatted);
            }
        } catch (error) {
            if (error.name !== 'AbortError') console.error("Error fetching PO data:", error);
        } finally {
            // Only stop loading if the request wasn't aborted
            if (!signal?.aborted) setLoading(false);
        }
    };

    const fetchCollectionData = async (signal) => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/advance-payments/receipts?log_status=1&t=${new Date().getTime()}`, { headers, cache: 'no-store', signal });
            const result = await response.json();
            if (result.status && result.data) {
                const formatted = result.data.map(item => {
                    let pType = 'Product';
                    if (item.purchase_order) {
                        if (item.purchase_order.product_type == 1) pType = 'Spare';
                        else if (item.purchase_order.product_type == 2) pType = 'Tool';
                        else if (item.purchase_order.product_type == 3) pType = 'Accessory';
                    }
                    
                    return {
                        id: item.id,
                        poNo: item.po_no,
                        invNo: '',
                        receiptDate: item.receipt_date,
                        receiptNumber: item.id,
                        receiptAmount: item.amount,
                        productType: pType,
                        customerName: (item.purchase_order && item.purchase_order.vendor) ? item.purchase_order.vendor.name : '',
                        employeeName: '',
                        mobile: (item.purchase_order && item.purchase_order.vendor) ? (item.purchase_order.vendor.mobile_number || item.purchase_order.vendor.phone_number || '') : '',
                        receiptStatus: 'receipt',
                        log_status: item.log_status,
                        bank_account_id: item.bank_account_id
                    };
                });
                setCollectionData(formatted);
            }
        } catch (error) {
            if (error.name !== 'AbortError') console.error("Error fetching collection data:", error);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    };

    const fetchReceiptData = async (signal) => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/advance-payments/receipts?log_status=2&t=${new Date().getTime()}`, { headers, cache: 'no-store', signal });
            const result = await response.json();
            if (result.status && result.data) {
                const formatted = result.data.map(item => {
                    let pType = 'Product';
                    if (item.purchase_order) {
                        if (item.purchase_order.product_type == 1) pType = 'Spare';
                        else if (item.purchase_order.product_type == 2) pType = 'Tool';
                        else if (item.purchase_order.product_type == 3) pType = 'Accessory';
                    }
                    
                    return {
                        id: item.id,
                        poNo: item.po_no,
                        invNo: '',
                        receiptDate: item.receipt_date,
                        receiptNumber: item.id,
                        receiptAmount: item.amount,
                        productType: pType,
                        customerName: (item.purchase_order && item.purchase_order.vendor) ? item.purchase_order.vendor.name : '',
                        employeeName: '',
                        mobile: (item.purchase_order && item.purchase_order.vendor) ? (item.purchase_order.vendor.mobile_number || item.purchase_order.vendor.phone_number || '') : '',
                        receiptStatus: 'receipt',
                        log_status: item.log_status,
                        bank_account_id: item.bank_account_id
                    };
                });
                setReceiptData(formatted);
            }
        } catch (error) {
            if (error.name !== 'AbortError') console.error("Error fetching receipt data:", error);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    };

    const handleCollectConfirm = async (bankId) => {
        if (!selectedReceiptForCollection) return;
        
        setShowCollectPopup(false);
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/advance-payments/receipts/${selectedReceiptForCollection.receiptNumber}/collect`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ bank_account_id: bankId })
            });

            const result = await response.json();
            if (result.status) {
                // Refresh data
                fetchCollectionData();
            } else {
                alert("Error: " + (result.message || "Failed to collect receipt"));
            }
        } catch (error) {
            console.error("Error collecting receipt:", error);
            alert("Error collecting receipt");
        } finally {
            setLoading(false);
        }
    };

    const { items: sortedPo,         requestSort: rsPo,  getSortDirection: gsdPo  } = useSortableData(poData);
    const { items: sortedCollection, requestSort: rsColl, getSortDirection: gsdColl } = useSortableData(collectionData);
    const { items: sortedReceipt,    requestSort: rsRec,  getSortDirection: gsdRec  } = useSortableData(receiptData);

    const switchTab = (key) => { setActiveTab(key); setSearchText(''); setCurrentPage(1);  };

    /* ── PO table ── */
    const renderPoTable = (items, requestSort, getSortDirection, startIndex) => (
        <>
        <div className="tw-hidden md:tw-block">
        <div className="table-responsive">
            <table className="table table-bordered table-striped no-margin">
                <thead>
                    <tr>
                        {[['id','#'],['poNo','Po. No'],['vendorName','Vendor Name'],['productType','Product Type'],['mobile','Mobile'],['balanceAmount','Balance Amount'],['currentStage','Current Stage']].map(([key, label]) => (
                            <th key={key} className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort(key)}>
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    {label} <TableSortIcon direction={getSortDirection(key)} />
                                </div>
                            </th>
                        ))}
                        {hasActionPermission && <th className="tw-align-middle">Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((r, idx) => (
                        <tr key={r.id}>
                            <td>{startIndex + idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>{r.poNo}</td>
                            <td>{r.vendorName}</td>
                            <td>{r.productType}</td>
                            <td>{r.mobile}</td>
                            <td className="tw-text-right">{fmt(r.balanceAmount)}</td>
                            <td>{r.currentStage}</td>
                            {hasActionPermission && (
                                <td>
                                    <div className="tw-flex tw-flex-row tw-gap-1">
                                        {hasPermission('Inventory.Advanced Payment List - Purchase Order List in Receipt.Edit') && (
                                            <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/inventory/advanced-payments/edit/${r.id}`, { state: { tab: activeTab } })}>
                                                <PencilSimpleIcon weight="bold" className="tw-w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    {items.length === 0 && <tr><td colSpan={hasActionPermission ? 8 : 7} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td></tr>}
                </tbody>
            </table>
        </div>
        </div>
        <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
            {items.map((r) => (
                <MobileCard key={r.id}>
                    <MobileCard.Header label="PO. NO" value={r.poNo} />
                    <MobileCard.Body>
                        <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-mb-2">
                            <MobileCard.Field label="Vendor" value={r.vendorName} />
                            <MobileCard.Field label="Product Type" value={r.productType} align="right" />
                            <MobileCard.Field label="Mobile" value={r.mobile} />
                            <MobileCard.Field label="Balance" value={fmt(r.balanceAmount)} align="right" bold />
                            <MobileCard.Field label="Stage" value={r.currentStage} />
                        </div>
                    </MobileCard.Body>
                    {hasActionPermission && (
                        <MobileCard.Footer>
                            <MobileCard.Actions>
                                {hasPermission('Inventory.Advanced Payment List - Purchase Order List in Receipt.Edit') && (
                                    <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/inventory/advanced-payments/edit/${r.id}`, { state: { tab: activeTab } })}>
                                        <PencilSimpleIcon weight="bold" className="tw-w-4 tw-h-4" />
                                    </button>
                                )}
                            </MobileCard.Actions>
                        </MobileCard.Footer>
                    )}
                </MobileCard>
            ))}
            {items.length === 0 && (
                <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">No records found</div>
            )}
        </div>
        </>
    );

    /* ── Collection Pending table ── */
    const renderCollectionTable = (items, requestSort, getSortDirection, startIndex) => (
        <>
        <div className="tw-hidden md:tw-block">
        <div className="table-responsive">
            <table className="table table-bordered table-striped no-margin">
                <thead>
                    <tr>
                        {[['id','#'],['poNo','Po. No'],['receiptDate','Receipt Date'],['receiptNumber','Receipt Number'],['receiptAmount','Receipt Amount'],['productType','Product Type'],['customerName','Customer Name'],['employeeName','Emplyee Name'],['mobile','Mobile'],['receiptStatus','Receipt Status']].map(([key, label]) => (
                            <th key={key} className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort(key)}>
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    {label} <TableSortIcon direction={getSortDirection(key)} />
                                </div>
                            </th>
                        ))}
                        {hasActionPermission && <th className="tw-align-middle">Action <TableSortIcon direction={null} /></th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((r, idx) => (
                        <tr key={r.id}>
                            <td>{startIndex + idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>{r.poNo}</td>
                            <td>{r.receiptDate}</td>
                            <td>{r.receiptNumber}</td>
                            <td>{fmt(r.receiptAmount)}</td>
                            <td>{r.productType}</td>
                            <td>{r.customerName}</td>
                            <td>{r.employeeName}</td>
                            <td>{r.mobile}</td>
                            <td>
                                <span style={{ background: '#22c55e', color: '#fff', padding: '2px 10px', borderRadius: 3, fontSize: 12 }}>
                                    {r.receiptStatus}
                                </span>
                            </td>
                            {hasActionPermission && (
                                <td>
                                    <div className="tw-flex tw-flex-row tw-gap-1">
                                        {hasPermission('Inventory.Advanced Payment List - Collection Pending List.Edit') && (
                                            <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/inventory/advanced-payments/receipt-edit/${r.receiptNumber}`, { state: { tab: activeTab } })}>
                                                <PencilSimpleIcon weight="bold" className="tw-w-3.5" />
                                            </button>
                                        )}
                                        {hasPermission('Inventory.Advanced Payment List - Collection Pending List.Collect') && (
                                            <button type="button" className="list-action-btn btn-add" title="Collect" onClick={() => { setSelectedReceiptForCollection(r); setShowCollectPopup(true); }}>
                                                <PlusIcon weight="bold" className="tw-w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    {items.length === 0 && <tr><td colSpan={hasActionPermission ? 11 : 10} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td></tr>}
                </tbody>
            </table>
        </div>
        </div>
        <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
            {items.map((r) => (
                <MobileCard key={r.id}>
                    <MobileCard.Header label="PO. NO" value={r.poNo} />
                    <MobileCard.Body>
                        <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-mb-2">
                            <MobileCard.Field label="Receipt Date" value={r.receiptDate} />
                            <MobileCard.Field label="Receipt No" value={r.receiptNumber} align="right" />
                            <MobileCard.Field label="Customer" value={r.customerName} />
                            <MobileCard.Field label="Product Type" value={r.productType} align="right" />
                            <MobileCard.Field label="Amount" value={fmt(r.receiptAmount)} bold />
                            <MobileCard.Field label="Mobile" value={r.mobile} align="right" />
                            <MobileCard.Field label="Status" value={
                                <span style={{ background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: 3, fontSize: 11 }}>{r.receiptStatus}</span>
                            } />
                        </div>
                    </MobileCard.Body>
                    {hasActionPermission && (
                        <MobileCard.Footer>
                            <MobileCard.Actions>
                                {hasPermission('Inventory.Advanced Payment List - Collection Pending List.Edit') && (
                                    <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/inventory/advanced-payments/receipt-edit/${r.receiptNumber}`, { state: { tab: activeTab } })}>
                                        <PencilSimpleIcon weight="bold" className="tw-w-4 tw-h-4" />
                                    </button>
                                )}
                                {hasPermission('Inventory.Advanced Payment List - Collection Pending List.Collect') && (
                                    <button type="button" className="list-action-btn btn-add" title="Collect" onClick={() => { setSelectedReceiptForCollection(r); setShowCollectPopup(true); }}>
                                        <PlusIcon weight="bold" className="tw-w-4 tw-h-4" />
                                    </button>
                                )}
                            </MobileCard.Actions>
                        </MobileCard.Footer>
                    )}
                </MobileCard>
            ))}
            {items.length === 0 && (
                <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">No records found</div>
            )}
        </div>
        </>
    );

    /* ── Receipt table ── */
    const renderReceiptTable = (items, requestSort, getSortDirection, startIndex) => (
        <>
        <div className="tw-hidden md:tw-block">
        <div className="table-responsive">
            <table className="table table-bordered table-striped no-margin">
                <thead>
                    <tr>
                        {[['id','#'],['poNo','Po. No'],['receiptDate','Receipt Date'],['receiptNumber','Receipt Number'],['receiptAmount','Receipt Amount'],['customerName','Customer Name'],['mobile','Mobile'],['receiptStatus','Receipt Status']].map(([key, label]) => (
                            <th key={key} className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort(key)}>
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    {label} <TableSortIcon direction={getSortDirection(key)} />
                                </div>
                            </th>
                        ))}
                        {hasActionPermission && <th className="tw-align-middle">Action <TableSortIcon direction={null} /></th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((r, idx) => (
                        <tr key={r.id}>
                            <td>{startIndex + idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>{r.poNo}</td>
                            <td>{r.receiptDate}</td>
                            <td>{r.receiptNumber}</td>
                            <td>{fmt(r.receiptAmount)}</td>
                            <td>{r.customerName}</td>
                            <td>{r.mobile}</td>
                            <td>
                                <span style={{ background: '#22c55e', color: '#fff', padding: '2px 10px', borderRadius: 3, fontSize: 12 }}>
                                    {r.receiptStatus}
                                </span>
                            </td>
                            {hasActionPermission && (
                                <td>
                                    <div className="tw-flex tw-flex-row tw-gap-1">
                                        {hasPermission('Inventory.Advanced Payment List - Receipt List.Print') && (
                                            <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/advance-receipt-voucher/${r.id}`, '_blank')}>
                                                <FilePdfIcon weight="bold" className="tw-w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    {items.length === 0 && <tr><td colSpan={hasActionPermission ? 9 : 8} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td></tr>}
                </tbody>
            </table>
        </div>
        </div>
        <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
            {items.map((r) => (
                <MobileCard key={r.id}>
                    <MobileCard.Header label="PO. NO" value={r.poNo} />
                    <MobileCard.Body>
                        <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-mb-2">
                            <MobileCard.Field label="Receipt Date" value={r.receiptDate} />
                            <MobileCard.Field label="Receipt No" value={r.receiptNumber} align="right" />
                            <MobileCard.Field label="Customer" value={r.customerName} />
                            <MobileCard.Field label="Amount" value={fmt(r.receiptAmount)} align="right" bold />
                            <MobileCard.Field label="Mobile" value={r.mobile} />
                            <MobileCard.Field label="Status" value={
                                <span style={{ background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: 3, fontSize: 11 }}>{r.receiptStatus}</span>
                            } align="right" />
                        </div>
                    </MobileCard.Body>
                    {hasActionPermission && (
                        <MobileCard.Footer>
                            <MobileCard.Actions>
                                {hasPermission('Inventory.Advanced Payment List - Receipt List.Print') && (
                                    <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/advance-receipt-voucher/${r.id}`, '_blank')}>
                                        <FilePdfIcon weight="bold" className="tw-w-4 tw-h-4" />
                                    </button>
                                )}
                            </MobileCard.Actions>
                        </MobileCard.Footer>
                    )}
                </MobileCard>
            ))}
            {items.length === 0 && (
                <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">No records found</div>
            )}
        </div>
        </>
    );

    /* ── Active data source ── */
    const sourceMap = {
        po:         { items: sortedPo,         rs: rsPo,   gsd: gsdPo,   render: renderPoTable },
        collection: { items: sortedCollection, rs: rsColl, gsd: gsdColl, render: renderCollectionTable },
        receipt:    { items: sortedReceipt,    rs: rsRec,  gsd: gsdRec,  render: renderReceiptTable },
    };
    const { items: sourceItems, rs, gsd, render } = sourceMap[activeTab];

    const q        = searchText.trim().toLowerCase();
    const filtered = q
        ? sourceItems.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)))
        : sourceItems;

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage   = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginated  = filtered.slice(startIndex, startIndex + pageSize);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
                        <h3 className="card-title tw-m-0">Advanced Payment</h3>
                    </div>

                    <div className="card-body">

                        {/* ── Tabs ── */}
                        <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mb-3">
                            {availableTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={`tw-px-4 tw-py-2 tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-rounded ${activeTab === tab.key ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => switchTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Show / Search ── */}
                        <div className="list-top-bar tw-mb-4 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                <span>Show</span>
                                <select
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={pageSize}
                                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
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
                                    onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        {/* ── Table ── */}
                        {render(paginated, rs, gsd, startIndex)}

                        {/* ── Pagination ── */}
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-gray-600 tw-text-sm">
                                Showing {filtered.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} entries
                            </div>
                            <Pagination 
                                currentPage={safePage} 
                                totalPages={totalPages} 
                                onPageChange={setCurrentPage} 
                            />
                        </div>

                    </div>
                </div>
            </div>
            
            <CollectAmountPopup 
                isOpen={showCollectPopup} 
                onClose={() => setShowCollectPopup(false)} 
                onConfirm={handleCollectConfirm} 
                bankOptions={bankOptions} 
                defaultBankId={selectedReceiptForCollection ? selectedReceiptForCollection.bank_account_id : null}
                amount={selectedReceiptForCollection ? fmt(selectedReceiptForCollection.receiptAmount) : ''}
            />
        </section>
    );
};

export default AdvancedPaymentList;
