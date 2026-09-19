import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import Pagination from '../../../components/Pagination';
import MobileCard from '../../../components/common/MobileCard';
const FUTURE_INSP_DATA = [
    { id: 1, poNo: '2311', total: 1, accept: 0, returnQty: 0, pending: 0, cancelQty: 0, reject: 0 },
    { id: 2, poNo: '2312', total: 1, accept: 0, returnQty: 0, pending: 0, cancelQty: 0, reject: 0 },
];

const FutureList = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const { items: sortedData, requestSort, getSortDirection } = useSortableData(FUTURE_INSP_DATA);

    const filtered = sortedData.filter((row) => {
        const q = searchText.toLowerCase();
        return (
            row.poNo.toLowerCase().includes(q) ||
            String(row.total).includes(q) ||
            String(row.accept).includes(q) ||
            String(row.returnQty).includes(q) ||
            String(row.pending).includes(q) ||
            String(row.cancelQty).includes(q) ||
            String(row.reject).includes(q)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Future Inspection</h3>
                        <button type="button" className="btn-create" onClick={() => navigate('/inventory/future-inspection/add')}>                             
                            Add New
                        </button>
                    </div>

                    <div className="card-body">
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
                                        <th className="tw-align-middle">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((row, idx) => (
                                        <tr key={row.id}>
                                            <td>{startIndex + idx + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{row.poNo}</td>
                                            <td>{row.total}</td>
                                            <td>{row.accept}</td>
                                            <td>{row.returnQty}</td>
                                            <td>{row.pending}</td>
                                            <td>{row.cancelQty}</td>
                                            <td>{row.reject}</td>
                                            <td>
                                                <button type="button" className="list-action-btn btn-add" title="Add">
                                                    <PlusIcon weight="bold" className="tw-w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginated.length === 0 && (
                                        <tr>
                                            <td colSpan="9" className="tw-text-center tw-text-slate-400 tw-py-8">
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
                            {paginated.map((row, idx) => (
                                <MobileCard key={row.id || idx}>
                                    <MobileCard.Header label="PO. NO" value={row.poNo || '-'} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-mb-2">
                                            <MobileCard.Field label="Total" value={row.total} align="right" />
                                            <MobileCard.Field label="Accept" value={row.accept} bold valueColor="green" />
                                        </div>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-border-t tw-border-slate-100 tw-pt-2">
                                            <MobileCard.Field label="Return" value={row.returnQty} bold valueColor="red" />
                                            <MobileCard.Field label="Pending" value={row.pending} bold valueColor="orange" />
                                            <MobileCard.Field label="Cancel" value={row.cancelQty} />
                                            <MobileCard.Field label="Reject" value={row.reject} />
                                        </div>
                                    </MobileCard.Body>
                                    <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                        <MobileCard.Actions>
                                            <button type="button" className="list-action-btn btn-add" title="Add">
                                                <PlusIcon weight="bold" className="tw-w-4 tw-h-4" />
                                            </button>
                                        </MobileCard.Actions>
                                    </MobileCard.Footer>
                                </MobileCard>
                            ))}
                            {paginated.length === 0 && (
                                <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                                    No records found
                                </div>
                            )}
                        </div>

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
        </section>
    );
};

export default FutureList;
