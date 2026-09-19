import { useState } from 'react';
import Select from 'react-select';
import TableSortIcon from '../../../components/TableSortIcon';
import SmartPagination from '../../../components/SmartPagination';
import { useSortableData } from '../../../hooks/useSortableData';

const customerOptions = [
    { value: 'c1', label: 'Saras Industry' },
    { value: 'c2', label: 'Comptech Engineers' },
    { value: 'c3', label: 'Global Air Systems' },
    { value: 'c4', label: 'Power Tech Solutions' },
];

const DUMMY_DATA = [
    { id: 1, customerName: 'Saras Industry',       invoiceNo: 'INV-1001', date: '02-06-2026', amount: '55,000.00', balance: '25,000.00' },
    { id: 2, customerName: 'Comptech Engineers',   invoiceNo: 'INV-1002', date: '03-06-2026', amount: '32,500.00', balance: '0.00'      },
    { id: 3, customerName: 'Global Air Systems',   invoiceNo: 'INV-1003', date: '05-06-2026', amount: '74,800.00', balance: '74,800.00' },
    { id: 4, customerName: 'Power Tech Solutions', invoiceNo: 'INV-1004', date: '07-06-2026', amount: '18,200.00', balance: '5,000.00'  },
    { id: 5, customerName: 'Saras Industry',       invoiceNo: 'INV-1005', date: '09-06-2026', amount: '41,000.00', balance: '41,000.00' },
];

const CustomerLedgerReport = () => {
    const [customer,  setCustomer]  = useState(null);
    const [fromDate,  setFromDate]  = useState('');
    const [toDate,    setToDate]    = useState('');
    
    const [filteredData, setFilteredData] = useState(DUMMY_DATA);

    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const handleFilter = () => {
        let filtered = DUMMY_DATA;
        
        if (customer) {
            filtered = filtered.filter(item => item.customerName === customer.label);
        }
        
        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setCustomer(null);
        setFromDate('');
        setToDate('');
        setFilteredData(DUMMY_DATA);
        setCurrentPage(1);
    };

    const searchFilteredData = filteredData.filter(row => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            String(row.customerName || '').toLowerCase().includes(searchLower) ||
            String(row.invoiceNo || '').toLowerCase().includes(searchLower) ||
            String(row.date || '').toLowerCase().includes(searchLower) ||
            String(row.amount || '').toLowerCase().includes(searchLower) ||
            String(row.balance || '').toLowerCase().includes(searchLower)
        );
    });

    const { items: sortedData, requestSort, getSortDirection } = useSortableData(searchFilteredData);
    
    const totalPages = Math.ceil(sortedData.length / entriesPerPage) || 1;
    const startIndex = (currentPage - 1) * entriesPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + parseInt(entriesPerPage));

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border">
                        <h3 className="card-title">Customer Ledger Report</h3>
                    </div>
                    <div className="card-body">

                        {/* ── Filter fields ── */}
                        <div className="row mb-3 align-items-end">
                            <div className="col-md-3 form-group">
                                <label>Customer Name</label>
                                <Select
                                    options={customerOptions}
                                    value={customer}
                                    onChange={setCustomer}
                                    placeholder="Select Customer"
                                    isClearable
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    menuPosition="fixed"
                                />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>From Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>To Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 form-group d-flex align-items-end gap-2">
                                <button className="btn-save" onClick={handleFilter}>Filter</button>
                                <button className="btn-cancel" onClick={handleReset}>Reset</button>
                            </div>
                        </div>

                        <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-start align-items-md-center tw-gap-2 tw-mb-4 tw-text-sm tw-text-slate-600">
                            <div className="d-flex align-items-center tw-gap-2">
                                <span>Show</span>
                                <select className="form-select form-select-sm tw-w-20 tw-inline-block" value={entriesPerPage} onChange={(e) => {setEntriesPerPage(e.target.value); setCurrentPage(1);}}>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="d-flex align-items-center tw-gap-2">
                                <span>Search:</span>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm tw-w-48 tw-inline-block" 
                                    value={searchTerm} 
                                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
                                />
                            </div>
                        </div>

                        {/* ── Table ── */}
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                            <div className="tw-flex tw-justify-between tw-items-center">#</div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('invoiceNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Invoice No <TableSortIcon direction={getSortDirection('invoiceNo')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('date')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Date <TableSortIcon direction={getSortDirection('date')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('amount')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Amount <TableSortIcon direction={getSortDirection('amount')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('balance')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Balance <TableSortIcon direction={getSortDirection('balance')} /></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((row, idx) => (
                                            <tr key={row.id}>
                                                <td>{startIndex + idx + 1}</td>
                                                <td>{row.customerName}</td>
                                                <td>{row.invoiceNo}</td>
                                                <td>{row.date}</td>
                                                <td className="tw-text-right">{row.amount}</td>
                                                <td className="tw-text-right">{row.balance}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">No data found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-between align-items-center tw-mt-4 tw-text-sm">
                            <div>
                                Showing {paginatedData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + parseInt(entriesPerPage), sortedData.length)} of {sortedData.length} entries
                            </div>
                            <SmartPagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalEntries={sortedData.length}
                                startIndex={startIndex}
                                entriesPerPage={entriesPerPage}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default CustomerLedgerReport;
