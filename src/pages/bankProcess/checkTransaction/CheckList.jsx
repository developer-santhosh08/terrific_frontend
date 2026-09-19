import { useTableControls } from '../../../hooks/useTableControls';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, TrashIcon, PlusIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import ChequePopup from '../../../components/Popup/ChequePopup';
import { useSortableData } from '../../../hooks/useSortableData';
import { usePermissions } from '../../../context/PermissionContext';
import MobileCard from '../../../components/common/MobileCard';

const CheckList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Bank Process.Payment Voucher.Edit') || hasPermission('Bank Process.Payment Voucher.Delete') || hasPermission('Bank Process.Payment Voucher.Print') || hasPermission('Bank Process.Payment Voucher.Revert');
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('credit');
    const [showChequePopup, setShowChequePopup] = useState(false);
    const [selectedCheque, setSelectedCheque] = useState(null);

    const creditData = [
        { id: 1, invNo: 'INV-001', customerName: 'Acme Corp', receiptNumber: 'RCPT-1001', amount: 1250, bank: 'HDFC', docNumber: 'DOC-001', collectionDate: '2026-06-01', chequeStatus: 'Waiting for Collection', image: 'https://via.placeholder.com/48' },
        { id: 2, invNo: 'INV-002', customerName: 'Beta Ltd', receiptNumber: 'RCPT-1002', amount: 3400, bank: 'SBI', docNumber: 'DOC-002', collectionDate: '2026-05-28', chequeStatus: 'Waiting for Collection', image: 'https://via.placeholder.com/48' }
    ];

    const debitData = [
        { id: 1, invNo: 'INV-101', customerName: 'Gamma LLC', receiptNumber: 'RCPT-2001', amount: 800, bank: 'ICICI', docNumber: 'DOC-101', collectionDate: '2026-06-02', chequeStatus: 'Waiting for Collection', image: 'https://via.placeholder.com/48' },
        { id: 2, invNo: 'INV-102', customerName: 'Delta Inc', receiptNumber: 'RCPT-2002', amount: 2200, bank: 'AXIS', docNumber: 'DOC-102', collectionDate: '2026-05-20', chequeStatus: 'Waiting for Collection', image: 'https://via.placeholder.com/48' }
    ];

    const { items: sortedCredit, requestSort: requestSortCredit, getSortDirection: getSortDirectionCredit } = useSortableData(creditData);
    const { items: sortedDebit, requestSort: requestSortDebit, getSortDirection: getSortDirectionDebit } = useSortableData(debitData);

    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const renderTable = (items, requestSort, getSortDirection, startIndex) => (
        <>
        <div className="tw-block md:tw-hidden tw-mb-4">
            {items.map((r, idx) => (
                <MobileCard key={r.id}>
                    <MobileCard.Header label="Inv No" value={r.invNo} />
                    <MobileCard.Body>
                        <MobileCard.Field label="Customer" value={r.customerName} />
                        <MobileCard.Field label="Receipt No" value={r.receiptNumber} align="right" />
                        <MobileCard.Field label="Amount" value={r.amount} bold />
                        <MobileCard.Field label="Bank" value={r.bank} align="right" />
                        <MobileCard.Field label="Doc Number" value={r.docNumber} />
                        <MobileCard.Field label="Collection Date" value={r.collectionDate} align="right" />
                        <MobileCard.Field label="Cheque Status" value={(() => {
                            const s = (r.chequeStatus || '').toString();
                            const map = {
                                'Waiting for Collection': { label: 'Waiting for Collection', bg: '#ef4444', color: '#ffffff' },
                                'In Collection': { label: 'Waiting for Collection', bg: '#ef4444', color: '#ffffff' },
                                'Pending': { label: 'Pending', bg: '#f59e0b', color: '#000000' },
                                'Collected': { label: 'Collected', bg: '#10b981', color: '#ffffff' },
                                'Bounced': { label: 'Bounced', bg: '#f97316', color: '#ffffff' },
                                'Cancelled': { label: 'Cancelled', bg: '#6b7280', color: '#ffffff' }
                            };
                            const st = map[s] || { label: s || '-', bg: '#e5e7eb', color: '#111827' };
                            return <span style={{ background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 3, }}>{st.label}</span>;
                        })()} />
                    </MobileCard.Body>
                    {hasActionPermission && (
                        <MobileCard.Footer>
                            <MobileCard.Actions>
                                {hasPermission('Bank Process.Payment Voucher.Add') && (
                                    <button type="button" className="list-action-btn btn-add" title="Add" onClick={() => { setShowChequePopup(true); setSelectedCheque(r); }}>
                                        <PlusIcon weight="bold" className="tw-w-4 tw-h-4" />
                                    </button>
                                )}
                                {hasPermission('Bank Process.Payment Voucher.Delete') && (
                                    <button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => console.log('delete', r.id)}>
                                        <TrashIcon weight="duotone" className="tw-w-4" />
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
        <div className="tw-hidden md:tw-block">
        <div className="table-responsive">
            <table className="table table-bordered table-striped no-margin">
                <thead>
                    <tr>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}><div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invNo')}><div className="tw-flex tw-justify-between tw-items-center">Inv. No <TableSortIcon direction={getSortDirection('invNo')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}><div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptNumber')}><div className="tw-flex tw-justify-between tw-items-center">Receipt Number <TableSortIcon direction={getSortDirection('receiptNumber')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('amount')}><div className="tw-flex tw-justify-between tw-items-center">Amount <TableSortIcon direction={getSortDirection('amount')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('bank')}><div className="tw-flex tw-justify-between tw-items-center">Bank <TableSortIcon direction={getSortDirection('bank')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('docNumber')}><div className="tw-flex tw-justify-between tw-items-center">Doc.Number <TableSortIcon direction={getSortDirection('docNumber')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('collectionDate')}><div className="tw-flex tw-justify-between tw-items-center">Collection Date <TableSortIcon direction={getSortDirection('collectionDate')} /></div></th>
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('chequeStatus')}><div className="tw-flex tw-justify-between tw-items-center">Cheque Status <TableSortIcon direction={getSortDirection('chequeStatus')} /></div></th>
                        {hasActionPermission && <th className="tw-align-middle">Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((r, idx) => (
                        <tr key={r.id}>
                            <td>{startIndex + idx + 1}</td>
                            <td>{r.invNo}</td>
                            <td>{r.customerName}</td>
                            <td>{r.receiptNumber}</td>
                            <td>{r.amount}</td>
                            <td>{r.bank}</td>
                            <td>{r.docNumber}</td>
                            <td>{r.collectionDate}</td>
                            <td>
                                {(() => {
                                    const s = (r.chequeStatus || '').toString();
                                    const map = {
                                        'Waiting for Collection': { label: 'Waiting for Collection', bg: '#ef4444', color: '#ffffff' },
                                        'In Collection': { label: 'Waiting for Collection', bg: '#ef4444', color: '#ffffff' },
                                        'Pending': { label: 'Pending', bg: '#f59e0b', color: '#000000' },
                                        'Collected': { label: 'Collected', bg: '#10b981', color: '#ffffff' },
                                        'Bounced': { label: 'Bounced', bg: '#f97316', color: '#ffffff' },
                                        'Cancelled': { label: 'Cancelled', bg: '#6b7280', color: '#ffffff' }
                                    };
                                    const st = map[s] || { label: s || '-', bg: '#e5e7eb', color: '#111827' };
                                    return <span style={{ background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 3, }}>{st.label}</span>;
                                })()}
                            </td>
                            {hasActionPermission && (
<td>
                                <div className="tw-flex tw-gap-2">
                                    {hasPermission('Bank Process.Payment Voucher.Add') && (
<button type="button" className="list-action-btn btn-add" title="Add" onClick={() => { setShowChequePopup(true); setSelectedCheque(r); }}>
                                        +
                                    </button>
)}
                                    {hasPermission('Bank Process.Payment Voucher.Delete') && (
<button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => console.log('delete', r.id)}>
                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                    </button>
)}
                                </div>
                            </td>
)}
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={hasActionPermission ? 10 : 9} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        </div>
        </>
    );

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
                        <h3 className="card-title tw-m-0">Cheque Transactions</h3>
                        <div className="tw-w-full sm:tw-w-auto">
                            {/* <button className="btn-create tw-w-full sm:tw-w-auto" onClick={() => navigate('/bankProcess/checkTransaction/add')}>Add Cheque</button> */}
                        </div>
                    </div>

                    <div className="card-body">
                        <style>{`.btn-add-small{width:28px;height:28px;border-radius:8px;background-color:#2563EB;color:#ffffff;border:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 12px rgba(37,99,235,0.12);transition:background-color .12s ease,transform .06s ease;font-weight:700}.btn-add-small:hover{background-color:#1e40af;transform:translateY(-1px)} .btn-add-small:focus{outline:none;box-shadow:0 0 0 4px rgba(37,99,235,0.12)}`}</style>
                            <div className="tw-mb-4">
                                <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mb-3">
                                    <button type="button" className={`tw-px-4 tw-py-2 tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-rounded-sm ${activeTab === 'credit' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`} onClick={() => { setActiveTab('credit'); setCurrentPage(1); }}>Credit Cheque List</button>
                                    <button type="button" className={`tw-px-4 tw-py-2 tw-flex-1 sm:tw-flex-none tw-min-w-[140px] tw-text-center tw-rounded-sm ${activeTab === 'debit' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`} onClick={() => { setActiveTab('debit'); setCurrentPage(1); }}>Debit Cheque List</button>
                                </div>

                                <div className="list-top-bar tw-mb-4 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                        <span>Show</span>
                                        <select className="form-select form-select-sm tw-w-20 tw-inline-block" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                                            <option value="10">10</option>
                                            <option value="25">25</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                        </select>
                                        <span>entries</span>
                                    </div>
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-w-full md:tw-w-auto">
                                        <span>Search:</span>
                                        <input type="text" className="form-control form-control-sm tw-w-full md:tw-w-48 tw-inline-block" value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }} />
                                    </div>
                                </div>

                            </div>

                            {/* Table for active tab with pagination and sorting */}
                            {(() => {
                                const itemsForTab = activeTab === 'credit' ? sortedCredit : sortedDebit;
                                const requestSort = activeTab === 'credit' ? requestSortCredit : requestSortDebit;
                                const getSortDirection = activeTab === 'credit' ? getSortDirectionCredit : getSortDirectionDebit;

                                const q = (searchText || '').toString().trim().toLowerCase();
                                const filtered = q
                                    ? itemsForTab.filter(i => (
                                        (i.invNo || '').toString().toLowerCase().includes(q) ||
                                        (i.customerName || '').toString().toLowerCase().includes(q) ||
                                        (i.receiptNumber || '').toString().toLowerCase().includes(q) ||
                                        (i.bank || '').toString().toLowerCase().includes(q) ||
                                        (i.docNumber || '').toString().toLowerCase().includes(q) ||
                                        (i.chequeStatus || '').toString().toLowerCase().includes(q)
                                    ))
                                    : itemsForTab;

                                const total = filtered.length;
                                const totalPages = Math.max(1, Math.ceil(total / pageSize));
                                if (currentPage > totalPages) setCurrentPage(totalPages);
                                const startIndex = (currentPage - 1) * pageSize;
                                const paginated = filtered.slice(startIndex, startIndex + pageSize);

                                return (
                                    <>
                                        {renderTable(paginated, requestSort, getSortDirection, startIndex)}
                                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                                            <div className="tw-text-gray-600 tw-text-sm">
                                                Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, total)} of {total} entries
                                            </div>
                                            <div className="tw-flex tw-items-center">
                                                <button className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-r-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                                                <button className="btn btn-sm tw-bg-blue-500 tw-text-white tw-border-blue-500 tw-rounded-none tw-px-3">{currentPage}</button>
                                                <button className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-l-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}

                    {/* Cheque popup for Add action */}
                    <ChequePopup isOpen={showChequePopup} onClose={() => setShowChequePopup(false)} onSubmit={(data) => { console.log('Cheque popup submit', data, selectedCheque); setShowChequePopup(false); }} />

                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckList;
