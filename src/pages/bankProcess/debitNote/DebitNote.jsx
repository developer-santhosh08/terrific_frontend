import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, PencilIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';

const DebitNote = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('enquiry');
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const enquiryData = [
        { id: 1, enqNo: 'ENQ-001', enqDate: '2026-06-01', amountDetails: '1,250.00', customerName: 'Acme Corp', mobile: '9876543210', currentStage: 'New' },
        { id: 2, enqNo: 'ENQ-002', enqDate: '2026-06-03', amountDetails: '3,400.00', customerName: 'Beta Ltd', mobile: '9123456780', currentStage: 'In Progress' },
    ];

    const debitNoteData = [
        { id: 1, enqNo: 'ENQ-101', invNo: 'INV-001', receiptDate: '2026-05-20', receiptNumber: 'RCPT-001', receiptAmount: '800.00', customerName: 'Gamma LLC', mobile: '9012345678', receiptStatus: 'Paid' },
        { id: 2, enqNo: 'ENQ-102', invNo: 'INV-002', receiptDate: '2026-05-25', receiptNumber: 'RCPT-002', receiptAmount: '2,200.00', customerName: 'Delta Inc', mobile: '9988776655', receiptStatus: 'Pending' },
    ];

    const { items: sortedEnquiry, requestSort: requestSortEnquiry, getSortDirection: getSortDirectionEnquiry } = useSortableData(enquiryData);
    const { items: sortedDebit, requestSort: requestSortDebit, getSortDirection: getSortDirectionDebit } = useSortableData(debitNoteData);

    const badgeStyle = (value, map) => {
        const st = map[value] || { bg: '#e5e7eb', color: '#111827' };
        return <span style={{ background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 3 }}>{value || '-'}</span>;
    };

    const stageMap = {
        'New':         { bg: '#3b82f6', color: '#ffffff' },
        'In Progress': { bg: '#f59e0b', color: '#000000' },
        'Approved':    { bg: '#10b981', color: '#ffffff' },
        'Closed':      { bg: '#6b7280', color: '#ffffff' },
        'Rejected':    { bg: '#ef4444', color: '#ffffff' },
    };

    const statusMap = {
        'Paid':      { bg: '#10b981', color: '#ffffff' },
        'Pending':   { bg: '#f59e0b', color: '#000000' },
        'Cancelled': { bg: '#6b7280', color: '#ffffff' },
    };

    const actionButtons = (id) => (
        <div className="tw-flex tw-gap-2">
            <button className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/bankProcess/debit-note/edit/${id}`)}>
                <PencilIcon weight="duotone" className="tw-w-4" />
            </button>
            <button className="list-action-btn btn-delete" title="Delete" onClick={() => console.log('delete', id)}>
                <TrashIcon weight="duotone" className="tw-w-4" />
            </button>
        </div>
    );

    const renderEnquiryTable = (items, requestSort, getSortDirection, startIndex) => (
        <div className="table-responsive">
            <table className="table table-bordered table-striped no-margin">
                <thead>
                    <tr>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}><div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqNo')}><div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={getSortDirection('enqNo')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqDate')}><div className="tw-flex tw-justify-between tw-items-center">Enq. Date <TableSortIcon direction={getSortDirection('enqDate')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('amountDetails')}><div className="tw-flex tw-justify-between tw-items-center">Amount Details <TableSortIcon direction={getSortDirection('amountDetails')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}><div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}><div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('currentStage')}><div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div></th>
                        <th className="tw-align-middle">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((r, idx) => (
                        <tr key={r.id}>
                            <td>{startIndex + idx + 1}</td>
                            <td>{r.enqNo}</td>
                            <td>{r.enqDate}</td>
                            <td>{r.amountDetails}</td>
                            <td>{r.customerName}</td>
                            <td>{r.mobile}</td>
                            <td>{badgeStyle(r.currentStage, stageMap)}</td>
                            <td>{actionButtons(r.id)}</td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr><td colSpan="8" className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderDebitTable = (items, requestSort, getSortDirection, startIndex) => (
        <div className="table-responsive">
            <table className="table table-bordered table-striped no-margin">
                <thead>
                    <tr>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}><div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqNo')}><div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={getSortDirection('enqNo')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invNo')}><div className="tw-flex tw-justify-between tw-items-center">Inv. No <TableSortIcon direction={getSortDirection('invNo')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptDate')}><div className="tw-flex tw-justify-between tw-items-center">Receipt Date <TableSortIcon direction={getSortDirection('receiptDate')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptNumber')}><div className="tw-flex tw-justify-between tw-items-center">Receipt Number <TableSortIcon direction={getSortDirection('receiptNumber')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptAmount')}><div className="tw-flex tw-justify-between tw-items-center">Receipt Amount <TableSortIcon direction={getSortDirection('receiptAmount')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}><div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}><div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptStatus')}><div className="tw-flex tw-justify-between tw-items-center">Receipt Status <TableSortIcon direction={getSortDirection('receiptStatus')} /></div></th>
                        <th className="tw-align-middle">Action</th>
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
                            <td>{badgeStyle(r.receiptStatus, statusMap)}</td>
                            <td>{actionButtons(r.id)}</td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr><td colSpan="10" className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Debit Note</h3>
                        <div>
                            {/* <button className="btn-create" onClick={() => navigate('/bankProcess/debit-note/add')}>Add Debit Note</button> */}
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="tw-mb-4">
                            <div className="tw-flex tw-gap-2 tw-mb-3">
                                <button
                                    type="button"
                                    className={`tw-px-4 tw-py-2 ${activeTab === 'enquiry' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border'}`}
                                    onClick={() => { setActiveTab('enquiry'); setCurrentPage(1); }}
                                >
                                    Enquiry List in Receipt
                                </button>
                                <button
                                    type="button"
                                    className={`tw-px-4 tw-py-2 ${activeTab === 'debit' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border'}`}
                                    onClick={() => { setActiveTab('debit'); setCurrentPage(1); }}
                                >
                                    Debit Note List
                                </button>
                            </div>

                            <div className="list-top-bar">
                                <div className="tw-flex tw-items-center tw-gap-2">
                                    <span>Show</span>
                                    <select
                                        className="form-select form-select-sm tw-w-20 tw-inline-block"
                                        value={pageSize}
                                        onChange={e => setPageSize(Number(e.target.value))}
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
                        </div>

                        {(() => {
                            const itemsForTab = activeTab === 'enquiry' ? sortedEnquiry : sortedDebit;
                            const requestSort = activeTab === 'enquiry' ? requestSortEnquiry : requestSortDebit;
                            const getSortDirection = activeTab === 'enquiry' ? getSortDirectionEnquiry : getSortDirectionDebit;

                            const q = (searchText || '').toString().trim().toLowerCase();
                            const filtered = q
                                ? itemsForTab.filter(i =>
                                    (i.enqNo || '').toString().toLowerCase().includes(q) ||
                                    (i.customerName || '').toString().toLowerCase().includes(q) ||
                                    (i.mobile || '').toString().toLowerCase().includes(q) ||
                                    (i.invNo || '').toString().toLowerCase().includes(q) ||
                                    (i.receiptNumber || '').toString().toLowerCase().includes(q) ||
                                    (i.receiptStatus || '').toString().toLowerCase().includes(q) ||
                                    (i.currentStage || '').toString().toLowerCase().includes(q)
                                )
                                : itemsForTab;

                            const total = filtered.length;
                            const totalPages = Math.max(1, Math.ceil(total / pageSize));
                            const safePage = Math.min(currentPage, totalPages);
                            const startIndex = (safePage - 1) * pageSize;
                            const paginated = filtered.slice(startIndex, startIndex + pageSize);

                            return (
                                <>
                                    {activeTab === 'enquiry'
                                        ? renderEnquiryTable(paginated, requestSort, getSortDirection, startIndex)
                                        : renderDebitTable(paginated, requestSort, getSortDirection, startIndex)
                                    }
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
                        })()}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DebitNote;
