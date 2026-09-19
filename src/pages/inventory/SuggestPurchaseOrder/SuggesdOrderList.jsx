import { useTableControls } from '../../../hooks/useTableControls';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilSimpleIcon, PrinterIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import Pagination from '../../../components/Pagination';
import MobileCard from '../../../components/common/MobileCard';

const SUGGESTED_ORDER_DATA = [
    {
        id: 1,
        vendorName: 'COMPTECH',
        mobileNumber: '9876543210',
        quantity: 12,
        orderDate: '2026-06-12',
    },
    {
        id: 2,
        vendorName: 'SFMC PIPES PVT LTD',
        mobileNumber: '9123456780',
        quantity: 20,
        orderDate: '2026-06-14',
    },
];

const SuggesdOrderList = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const { items: sortedData, requestSort, getSortDirection } = useSortableData(SUGGESTED_ORDER_DATA);

    const filtered = sortedData.filter((row) => {
        const q = searchText.toLowerCase();
        return (
            row.vendorName.toLowerCase().includes(q) ||
            row.mobileNumber.includes(q) ||
            String(row.quantity).includes(q) ||
            row.orderDate.includes(q)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const pageRows = filtered.slice(startIdx, startIdx + pageSize);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Suggested Order List</h3>
                        <button
                            type="button"
                            className="btn-create"
                            onClick={() => navigate('/inventory/purchase-order/add')}
                        >
                            
                            Add PO  
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
                                    placeholder="Vendor, mobile..."
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
                                                Sno <TableSortIcon direction={getSortDirection('id')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('vendorName')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                Vendor Name <TableSortIcon direction={getSortDirection('vendorName')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobileNumber')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                Mobile number <TableSortIcon direction={getSortDirection('mobileNumber')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('quantity')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                Quantity <TableSortIcon direction={getSortDirection('quantity')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('orderDate')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">
                                                Order Date <TableSortIcon direction={getSortDirection('orderDate')} />
                                            </div>
                                        </th>
                                        <th className="tw-align-middle">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.map((row, idx) => (
                                        <tr key={row.id}>
                                            <td>{startIdx + idx + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{row.vendorName}</td>
                                            <td>
                                                <a href={`tel:${row.mobileNumber}`} className="tw-text-blue-600 hover:tw-underline">
                                                    {row.mobileNumber}
                                                </a>
                                            </td>
                                            <td>{row.quantity}</td>
                                            <td>{row.orderDate}</td>
                                            <td>
                                                <div className="tw-flex tw-gap-2 tw-items-center">
                                                    <button
                                                        type="button"
                                                        className="list-action-btn btn-edit"
                                                        title="Edit"
                                                        onClick={() => navigate(`/inventory/purchase-order/edit/${row.id}`)}
                                                    >
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                    <button type="button" className="list-action-btn btn-delete" title="Delete">
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                    <button type="button" className="list-action-btn btn-print" title="Print">
                                                        <PrinterIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pageRows.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="tw-text-center tw-text-slate-400 tw-py-8">
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
                            {pageRows.map((row, idx) => (
                                <MobileCard key={row.id || idx}>
                                    <MobileCard.Header label="VENDOR" value={row.vendorName || '-'} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-mb-2">
                                            <MobileCard.Field label="Mobile" value={row.mobileNumber || '-'} />
                                            <MobileCard.Field label="Quantity" value={row.quantity} align="right" bold />
                                            <MobileCard.Field label="Order Date" value={row.orderDate || '-'} />
                                        </div>
                                    </MobileCard.Body>
                                    <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                        <MobileCard.Actions>
                                            <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/inventory/purchase-order/edit/${row.id}`)}>
                                                <PencilSimpleIcon weight="bold" className="tw-w-4 tw-h-4" />
                                            </button>
                                            <button type="button" className="list-action-btn btn-delete" title="Delete">
                                                <TrashIcon weight="bold" className="tw-w-4 tw-h-4" />
                                            </button>
                                            <button type="button" className="list-action-btn btn-print" title="Print">
                                                <PrinterIcon weight="bold" className="tw-w-4 tw-h-4" />
                                            </button>
                                        </MobileCard.Actions>
                                    </MobileCard.Footer>
                                </MobileCard>
                            ))}
                            {pageRows.length === 0 && (
                                <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                                    No records found
                                </div>
                            )}
                        </div>

                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-sm tw-text-slate-500">
                                Showing {filtered.length === 0 ? 0 : startIdx + 1} to {Math.min(startIdx + pageSize, filtered.length)} of {filtered.length} entries
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

export default SuggesdOrderList;
