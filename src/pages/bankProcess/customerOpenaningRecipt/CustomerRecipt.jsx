import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, PencilIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';

const CustomerRecipt = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const pendingData = [
        { id: 1, customerName: 'Acme Corp', address: '12, MG Road, Chennai - 600001', amount: 1250 },
        { id: 2, customerName: 'Beta Ltd', address: '45, Anna Salai, Coimbatore - 641001', amount: 3400 },
    ];

    const receiptData = [
        { id: 1, receiptNumber: 'RCPT-0001', customerName: 'Gamma LLC', address: '78, Nehru Street, Madurai - 625001', amount: 800, status: 'Paid' },
        { id: 2, receiptNumber: 'RCPT-0002', customerName: 'Delta Inc', address: '22, Kamaraj Avenue, Trichy - 620001', amount: 2200, status: 'Pending' },
    ];

    const { items: sortedPending, requestSort: requestSortPending, getSortDirection: getSortDirectionPending } = useSortableData(pendingData);
    const { items: sortedReceipt, requestSort: requestSortReceipt, getSortDirection: getSortDirectionReceipt } = useSortableData(receiptData);

    const statusStyle = (status) => {
        const map = {
            'Paid':    { bg: '#10b981', color: '#ffffff' },
            'Pending': { bg: '#f59e0b', color: '#000000' },
            'Cancelled': { bg: '#6b7280', color: '#ffffff' },
        };
        const st = map[status] || { bg: '#e5e7eb', color: '#111827' };
        return <span style={{ background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 3 }}>{status || '-'}</span>;
    };

    const renderPendingTable = (items, requestSort, getSortDirection, startIndex) => (
        <div className="table-responsive">
            <table className="table table-bordered table-striped no-margin">
                <thead>
                    <tr>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                            <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                            <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('address')}>
                            <div className="tw-flex tw-justify-between tw-items-center">Address <TableSortIcon direction={getSortDirection('address')} /></div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('amount')}>
                            <div className="tw-flex tw-justify-between tw-items-center">Amount <TableSortIcon direction={getSortDirection('amount')} /></div>
                        </th>
                        <th className="tw-align-middle">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((r, idx) => (
                        <tr key={r.id}>
                            <td>{startIndex + idx + 1}</td>
                            <td>{r.customerName}</td>
                            <td>{r.address}</td>
                            <td>{r.amount}</td>
                            <td>
                                <div className="tw-flex tw-gap-2">
                                    <button className="list-action-btn btn-edit" title="Edit" onClick={() => console.log('edit', r.id)}>
                                        <PencilIcon weight="duotone" className="tw-w-4" />
                                    </button>
                                    <button className="list-action-btn btn-delete" title="Delete" onClick={() => console.log('delete', r.id)}>
                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr><td colSpan="5" className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderReceiptTable = (items, requestSort, getSortDirection, startIndex) => (
        <div className="table-responsive">
            <table className="table table-bordered table-striped no-margin">
                <thead>
                    <tr>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                            <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptNumber')}>
                            <div className="tw-flex tw-justify-between tw-items-center">Receipt Number <TableSortIcon direction={getSortDirection('receiptNumber')} /></div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                            <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('address')}>
                            <div className="tw-flex tw-justify-between tw-items-center">Address <TableSortIcon direction={getSortDirection('address')} /></div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('amount')}>
                            <div className="tw-flex tw-justify-between tw-items-center">Amount <TableSortIcon direction={getSortDirection('amount')} /></div>
                        </th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('status')}>
                            <div className="tw-flex tw-justify-between tw-items-center">Status <TableSortIcon direction={getSortDirection('status')} /></div>
                        </th>
                        <th className="tw-align-middle">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((r, idx) => (
                        <tr key={r.id}>
                            <td>{startIndex + idx + 1}</td>
                            <td>{r.receiptNumber}</td>
                            <td>{r.customerName}</td>
                            <td>{r.address}</td>
                            <td>{r.amount}</td>
                            <td>{statusStyle(r.status)}</td>
                            <td>
                                <div className="tw-flex tw-gap-2">
                                    <button className="btn-save btn-action" title="Edit" onClick={() => console.log('edit', r.id)}>
                                        <PencilIcon weight="duotone" className="tw-w-4" />
                                    </button>
                                    <button className="btn-reset btn-action" title="Delete" onClick={() => console.log('delete', r.id)}>
                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr><td colSpan="7" className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td></tr>
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
                        <h3 className="card-title">Customer Opening Receipt</h3>
                        <div>
                            {/* <button className="btn-create" onClick={() => navigate('/bankProcess/customer-opening-receipt/add')}>Add Receipt</button> */}
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="tw-mb-4">
                            <div className="tw-flex tw-gap-2 tw-mb-3">
                                <button
                                    type="button"
                                    className={`tw-px-4 tw-py-2 ${activeTab === 'pending' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border'}`}
                                    onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                                >
                                    Pending Receipt List
                                </button>
                                <button
                                    type="button"
                                    className={`tw-px-4 tw-py-2 ${activeTab === 'receipt' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border'}`}
                                    onClick={() => { setActiveTab('receipt'); setCurrentPage(1); }}
                                >
                                    Receipt List
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
                            const itemsForTab = activeTab === 'pending' ? sortedPending : sortedReceipt;
                            const requestSort = activeTab === 'pending' ? requestSortPending : requestSortReceipt;
                            const getSortDirection = activeTab === 'pending' ? getSortDirectionPending : getSortDirectionReceipt;

                            const q = (searchText || '').toString().trim().toLowerCase();
                            const filtered = q
                                ? itemsForTab.filter(i =>
                                    (i.customerName || '').toString().toLowerCase().includes(q) ||
                                    (i.address || '').toString().toLowerCase().includes(q) ||
                                    (i.amount || '').toString().toLowerCase().includes(q) ||
                                    (i.receiptNumber || '').toString().toLowerCase().includes(q) ||
                                    (i.status || '').toString().toLowerCase().includes(q)
                                )
                                : itemsForTab;

                            const total = filtered.length;
                            const totalPages = Math.max(1, Math.ceil(total / pageSize));
                            const safePage = Math.min(currentPage, totalPages);
                            const startIndex = (safePage - 1) * pageSize;
                            const paginated = filtered.slice(startIndex, startIndex + pageSize);

                            return (
                                <>
                                    {activeTab === 'pending'
                                        ? renderPendingTable(paginated, requestSort, getSortDirection, startIndex)
                                        : renderReceiptTable(paginated, requestSort, getSortDirection, startIndex)
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

export default CustomerRecipt;
