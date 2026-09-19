import { useLoader } from '../../../context/LoaderContext';
import SmartPagination from '../../../components/SmartPagination';
import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useMemo } from 'react';
import { PlusIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import SalesReturnPopup from '../../../components/Popup/SalesReturnPopup';
import { usePermissions } from '../../../context/PermissionContext';

const SALES_RETURN_DATA = [
    {
        id: 1,
        enqNo: 'ENQ-001',
        enqDate: '2026-05-10',
        customerName: 'ACME Corporation',
        mobile: '9876543210',
        vertical: 'Solar',
        allottedTo: 'John Doe',
        currentStage: 'Return Initiated'
    },
    {
        id: 2,
        enqNo: 'ENQ-002',
        enqDate: '2026-05-18',
        customerName: 'Green Energy Ltd',
        mobile: '9123456789',
        vertical: 'Wind',
        allottedTo: 'Jane Smith',
        currentStage: 'Return Processed'
    }
];

const SalesReturnEnquiryList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Sales Contact.Sales Contact.Edit') || hasPermission('Sales Contact.Sales Contact.Delete');
    const { setLoading } = useLoader();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [returnPopupRow, setReturnPopupRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const getSortDirection = (key) => sortConfig.key === key ? sortConfig.direction : null;

    const filteredData = useMemo(() => {
        let data = [...SALES_RETURN_DATA];
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(item =>
                item.enqNo?.toLowerCase().includes(lowerSearch) ||
                item.customerName?.toLowerCase().includes(lowerSearch) ||
                item.mobile?.toLowerCase().includes(lowerSearch) ||
                item.vertical?.toLowerCase().includes(lowerSearch) ||
                item.allottedTo?.toLowerCase().includes(lowerSearch)
            );
        }
        if (sortConfig.key) {
            data.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [searchTerm, sortConfig]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);



    return (
        <section className="content">
            <style>{`
                .sr-action-icon {
                    width: 32px; height: 32px; border-radius: 4px; border: none;
                    display: inline-flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background-color .12s ease;
                }
                .sr-action-icon:focus { outline: none; }
                .sr-edit   { background-color: #3b82f6; color: #ffffff; }
                .sr-edit:hover   { background-color: #2563eb; }
                .sr-delete { background-color: #ef4444; color: #ffffff; }
                .sr-delete:hover { background-color: #dc2626; }
            `}</style>
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Sales Return Enquiry List</h3>
                    </div>

                    <div className="card-body">
                        {/* Table Controls */}
                        <div className="list-top-bar">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span>Show</span>
                                <select
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
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

                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span>Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-w-48 tw-inline-block"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('id')}>
                                            <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('enqNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={getSortDirection('enqNo')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('enqDate')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Enq. Date <TableSortIcon direction={getSortDirection('enqDate')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('customerName')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('mobile')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('vertical')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Vertical <TableSortIcon direction={getSortDirection('vertical')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('allottedTo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Allotted To <TableSortIcon direction={getSortDirection('allottedTo')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('currentStage')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div>
                                        </th>
                                        {hasActionPermission && <th className="tw-align-middle">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((row, idx) => (
                                        <tr key={row.id}>
                                            <td>{startIndex + idx + 1}</td>
                                            <td>{row.enqNo}</td>
                                            <td>{row.enqDate}</td>
                                            <td>{row.customerName}</td>
                                            <td>{row.mobile}</td>
                                            <td>{row.vertical}</td>
                                            <td>{row.allottedTo}</td>
                                            <td>
                                                <span className="tw-bg-orange-500 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-semibold">
                                                    {row.currentStage}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td>
                                                <div className="tw-flex tw-gap-2 tw-items-center">
                                                    {hasPermission('Sales Contact.Sales Contact.Add') && (
<button
                                                        type="button"
                                                        className="list-action-btn btn-add"
                                                        title="Sales Return"
                                                        onClick={() => setReturnPopupRow(row)}
                                                    >
                                                        <PlusIcon weight="bold" className="tw-w-4" />
                                                    </button>
)}
                                                </div>
                                            </td>
)}
                                        </tr>
                                    ))}
                                    {paginatedData.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 9 : 8} className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <SmartPagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            startIndex={startIndex}
                            entriesPerPage={itemsPerPage}
                            totalEntries={filteredData.length}
                        />

                    </div>
                </div>
            </div>
            <SalesReturnPopup
                isOpen={!!returnPopupRow}
                onClose={() => setReturnPopupRow(null)}
                enqNo={returnPopupRow?.enqNo}
            />
        </section>
    );
};

export default SalesReturnEnquiryList;
