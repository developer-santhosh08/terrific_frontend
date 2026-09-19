import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';
import { usePermissions } from '../../../context/PermissionContext';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import MobileCard from '../../../components/common/MobileCard';

const TABS = [
    { key: 'enquiry',   label: 'Enquiry List in Receipt' },
    { key: 'completed', label: 'Receipt Completed Enquiry List' },
    { key: 'pending',   label: 'Collection Pending List' },
    { key: 'receipt',   label: 'Receipt List' },
    { key: 'cancelled', label: 'Cancelled Receipt List' },
];

const sampleData = {
    enquiry: [
        { id: 1, amountDetails: '1,250.00', customerName: 'Acme Corp', mobile: '9876543210', currentStage: 'New' },
        { id: 2, amountDetails: '3,400.00', customerName: 'Beta Ltd', mobile: '9123456780', currentStage: 'In Progress' },
    ],
    completed: [
        { id: 1, amountDetails: '800.00', customerName: 'Gamma LLC', mobile: '9012345678', currentStage: 'Completed' },
    ],
    pending: [
        { id: 1, receiptDate: '2026-06-01', receiptNumber: 'RCPT-001', receiptAmount: '2,200.00', customerName: 'Delta Inc', employeeName: 'P.Ramesh', mobile: '9988776655', receiptStatus: 'Pending' },
    ],
    receipt: [
        { id: 1, receiptDate: '2026-06-03', receiptNumber: 'RCPT-002', receiptAmount: '1,500.00', customerName: 'Sigma Co', employeeName: 'S.Kumar', mobile: '9871234560', receiptStatus: 'Paid' },
    ],
    cancelled: [
        { id: 1, receiptDate: '2026-05-28', receiptNumber: 'RCPT-003', receiptAmount: '950.00', customerName: 'Omega Ltd', employeeName: 'C.Raju', mobile: '9765432100', receiptStatus: 'Cancelled' },
    ],
};

const statusMap = {
    'New':       { bg: '#3b82f6', color: '#fff' },
    'In Progress': { bg: '#f59e0b', color: '#000' },
    'Completed': { bg: '#10b981', color: '#fff' },
    'Pending':   { bg: '#f59e0b', color: '#000' },
    'Paid':      { bg: '#10b981', color: '#fff' },
    'Cancelled': { bg: '#6b7280', color: '#fff' },
};

const StatusBadge = ({ status }) => {
    const st = statusMap[status] || { bg: '#e5e7eb', color: '#111827' };
    return <span style={{ background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 3 }}>{status || '-'}</span>;
};

const TabTable = ({ data, tabKey }) => {
    const { hasPermission } = usePermissions();
    const isEnquiry = tabKey === 'enquiry' || tabKey === 'completed';
    const isReceipt = tabKey === 'pending' || tabKey === 'receipt' || tabKey === 'cancelled';
    
    const tabNameMap = {
        'enquiry': 'Enquiry',
        'completed': 'Completed',
        'pending': 'Pending',
        'receipt': 'List',
        'cancelled': 'Cancelled'
    };
    const currentTabName = tabNameMap[tabKey];
    
    const hasEditPerm = hasPermission(`Bank Process.Receipt - ${currentTabName}.Edit`);
    const hasDeletePerm = hasPermission(`Bank Process.Receipt - ${currentTabName}.Delete`);
    const hasAnyAction = hasEditPerm || hasDeletePerm;

    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const { items: sorted, requestSort, getSortDirection } = useSortableData(data);

    const q = (searchText || '').toString().trim().toLowerCase();
    const filtered = q
        ? sorted.filter(i =>
            (i.customerName || '').toLowerCase().includes(q) ||
            (i.mobile || '').toLowerCase().includes(q) ||
            (isEnquiry  ? (i.amountDetails   || '') : '') .toLowerCase().includes(q) ||
            (isEnquiry  ? (i.currentStage    || '') : '').toLowerCase().includes(q) ||
            (isReceipt  ? (i.receiptNumber   || '') : '').toLowerCase().includes(q) ||
            (isReceipt  ? (i.employeeName    || '') : '').toLowerCase().includes(q) ||
            (isReceipt  ? (i.receiptStatus   || '') : '').toLowerCase().includes(q)
        )
        : sorted;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return (
        <>
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

            <div className="table-responsive tw-hidden md:tw-block">
                <table className="table table-bordered table-striped no-margin">
                    <thead>
                        <tr>
                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                            </th>
                            {isEnquiry && (
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('amountDetails')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Amount Details <TableSortIcon direction={getSortDirection('amountDetails')} /></div>
                                </th>
                            )}
                            {isReceipt && (<>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptDate')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Receipt Date <TableSortIcon direction={getSortDirection('receiptDate')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptNumber')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Receipt Number <TableSortIcon direction={getSortDirection('receiptNumber')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptAmount')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Receipt Amount <TableSortIcon direction={getSortDirection('receiptAmount')} /></div>
                                </th>
                            </>)}
                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                                <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                            </th>
                            {isReceipt && (
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('employeeName')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Employee Name <TableSortIcon direction={getSortDirection('employeeName')} /></div>
                                </th>
                            )}
                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                            </th>
                            {isEnquiry && (
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('currentStage')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div>
                                </th>
                            )}
                            {isReceipt && (
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptStatus')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Receipt Status <TableSortIcon direction={getSortDirection('receiptStatus')} /></div>
                                </th>
                            )}
                            {hasAnyAction && (
                                <th className="tw-align-middle">Action</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((r, idx) => (
                            <tr key={r.id}>
                                <td>{startIndex + idx + 1}</td>
                                {isEnquiry && <td>{r.amountDetails}</td>}
                                {isReceipt && (<>
                                    <td>{r.receiptDate}</td>
                                    <td>{r.receiptNumber}</td>
                                    <td>{r.receiptAmount}</td>
                                </>)}
                                <td>{r.customerName}</td>
                                {isReceipt && <td>{r.employeeName}</td>}
                                <td>{r.mobile}</td>
                                {isEnquiry && <td><StatusBadge status={r.currentStage} /></td>}
                                {isReceipt && <td><StatusBadge status={r.receiptStatus} /></td>}
                                {hasAnyAction && (
                                    <td>
                                        <div className="tw-flex tw-gap-2">
                                            {hasEditPerm && (
                                                <button className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/bankProcess/receipt/edit/${r.id}`)}>
                                                    <PencilIcon weight="duotone" className="tw-w-4" />
                                                </button>
                                            )}
                                            {hasDeletePerm && (
                                                <button className="list-action-btn btn-delete" title="Delete" onClick={() => console.log('delete', r.id)}>
                                                    <TrashIcon weight="duotone" className="tw-w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {paginated.length === 0 && (
                            <tr><td colSpan={isEnquiry ? 6 : 9} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="tw-block md:tw-hidden tw-mt-4">
                {paginated.map((r, idx) => (
                    <MobileCard key={r.id}>
                        <MobileCard.Header label="Customer" value={r.customerName} />
                        <MobileCard.Body>
                            <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                <MobileCard.Field label="#" value={startIndex + idx + 1} />
                                <MobileCard.Field label="Mobile" value={r.mobile} />
                                {isEnquiry && <MobileCard.Field label="Amount Details" value={r.amountDetails} />}
                                {isEnquiry && <MobileCard.Field label="Current Stage" value={<StatusBadge status={r.currentStage} />} />}
                                {isReceipt && <MobileCard.Field label="Receipt Date" value={r.receiptDate} />}
                                {isReceipt && <MobileCard.Field label="Receipt Number" value={r.receiptNumber} />}
                                {isReceipt && <MobileCard.Field label="Receipt Amount" value={r.receiptAmount} />}
                                {isReceipt && <MobileCard.Field label="Employee" value={r.employeeName} />}
                                {isReceipt && <MobileCard.Field label="Receipt Status" value={<StatusBadge status={r.receiptStatus} />} />}
                            </div>
                        </MobileCard.Body>
                        {hasAnyAction && (
                            <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                <MobileCard.Actions>
                                    {hasEditPerm && (
                                        <button className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/bankProcess/receipt/edit/${r.id}`)}>
                                            <PencilIcon weight="duotone" className="tw-w-4" />
                                        </button>
                                    )}
                                    {hasDeletePerm && (
                                        <button className="list-action-btn btn-delete" title="Delete" onClick={() => console.log('delete', r.id)}>
                                            <TrashIcon weight="duotone" className="tw-w-4" />
                                        </button>
                                    )}
                                </MobileCard.Actions>
                            </MobileCard.Footer>
                        )}
                    </MobileCard>
                ))}
                {paginated.length === 0 && (
                    <div className="tw-text-center tw-text-slate-400 tw-py-8">No records found</div>
                )}
            </div>

            <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                <div className="tw-text-gray-600 tw-text-sm">
                    Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, total)} of {total} entries
                </div>
                <div className="tw-flex tw-items-center">
                    <button
                        className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-r-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                    >
                        Previous
                    </button>
                    <button className="btn btn-sm tw-bg-blue-500 tw-text-white tw-border-blue-500 tw-rounded-none tw-px-3">
                        {safePage}
                    </button>
                    <button
                        className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-l-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
};

const Receipt = () => {
    const navigate = useNavigate();
    const { hasPermission, refreshPermissions } = usePermissions();

    const allowedTabs = TABS.filter(tab => {
        const permMap = {
            'enquiry': 'Enquiry',
            'completed': 'Completed',
            'pending': 'Pending',
            'receipt': 'List',
            'cancelled': 'Cancelled'
        };
        return hasPermission(`Bank Process.Receipt - ${permMap[tab.key]}.View`);
    });

    const [activeTab, setActiveTab] = useState(allowedTabs.length > 0 ? allowedTabs[0].key : 'enquiry');

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Receipt List</h3>
                        <div>
                            {/* <button className="btn-create" onClick={() => navigate('/bankProcess/receipt/add')}>Add Receipt</button> */}
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 tw-mb-4 sm:tw-flex-wrap">
                            {allowedTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === tab.key ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <TabTable key={activeTab} data={sampleData[activeTab]} tabKey={activeTab} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Receipt;
