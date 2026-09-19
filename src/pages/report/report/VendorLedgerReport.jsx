import { useState } from 'react';
import Select from 'react-select';
import TableSortIcon from '../../../components/TableSortIcon';
import SmartPagination from '../../../components/SmartPagination';
import { useSortableData } from '../../../hooks/useSortableData';
import MobileCard from '../../../components/common/MobileCard';
import ExportButtons from '../../../components/common/ExportButtons';

const vendorOptions = [
    { value: 'v1', label: 'Saras Industry'       },
    { value: 'v2', label: 'Comptech Engineers'   },
    { value: 'v3', label: 'Global Air Systems'   },
    { value: 'v4', label: 'Power Tech Solutions' },
];

const DUMMY_DATA = [
    { id: 1, vendorName: 'Saras Industry',       invoiceNo: 'INV-2001', date: '02-06-2026', amount: '55,000.00', balance: '25,000.00' },
    { id: 2, vendorName: 'Comptech Engineers',   invoiceNo: 'INV-2002', date: '03-06-2026', amount: '32,500.00', balance: '0.00'      },
    { id: 3, vendorName: 'Global Air Systems',   invoiceNo: 'INV-2003', date: '05-06-2026', amount: '74,800.00', balance: '74,800.00' },
    { id: 4, vendorName: 'Power Tech Solutions', invoiceNo: 'INV-2004', date: '07-06-2026', amount: '18,200.00', balance: '5,000.00'  },
    { id: 5, vendorName: 'Saras Industry',       invoiceNo: 'INV-2005', date: '09-06-2026', amount: '41,000.00', balance: '41,000.00' },
];

const VendorLedgerReport = () => {
    const [vendor,   setVendor]   = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate,   setToDate]   = useState('');
    
    const [filteredData, setFilteredData] = useState(DUMMY_DATA);

    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const handleFilter = () => {
        let filtered = DUMMY_DATA;
        
        if (vendor) {
            filtered = filtered.filter(item => item.vendorName === vendor.label);
        }
        
        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setVendor(null);
        setFromDate('');
        setToDate('');
        setFilteredData(DUMMY_DATA);
        setCurrentPage(1);
    };

    const searchFilteredData = filteredData.filter(row => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            String(row.vendorName || '').toLowerCase().includes(searchLower) ||
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

    const exportColumns = [
        { header: 'Vendor Name', key: 'vendorName' },
        { header: 'Invoice No', key: 'invoiceNo' },
        { header: 'Date', key: 'date' },
        { header: 'Amount', key: 'amount' },
        { header: 'Balance', key: 'balance' }
    ];

    const exportData = searchFilteredData;

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border">
                        <h3 className="card-title">Vendor Ledger Report</h3>
                    </div>
                    <div className="card-body">

                        {/* ── Filter fields ── */}
                        <div className="row mb-3 align-items-end">
                            <div className="col-md-3 form-group">
                                <label>Vendor Name</label>
                                <Select
                                    options={vendorOptions}
                                    value={vendor}
                                    onChange={setVendor}
                                    placeholder="Select Vendor"
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
                            <div className="d-flex flex-wrap align-items-center tw-gap-4">
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
                                <ExportButtons 
                                    data={exportData}
                                    columns={exportColumns}
                                    filename="Vendor_Ledger_Report"
                                    title="Vendor Ledger Report"
                                    tableId="vendor-ledger-report-table"
                                />
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
                        <div className="table-responsive tw-hidden md:tw-block">
                            <table id="vendor-ledger-report-table" className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                            <div className="tw-flex tw-justify-between tw-items-center">#</div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('vendorName')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Vendor Name <TableSortIcon direction={getSortDirection('vendorName')} /></div>
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
                                                <td>{row.vendorName}</td>
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

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row, idx) => (
                                    <MobileCard key={row.id}>
                                        <MobileCard.Header label="#" value={startIndex + idx + 1} />
                                        <MobileCard.Body>
                                            <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                                <MobileCard.Field label="Vendor Name" value={row.vendorName} />
                                                <MobileCard.Field label="Invoice No" value={row.invoiceNo} />
                                                <MobileCard.Field label="Date" value={row.date} />
                                                <MobileCard.Field label="Amount" value={row.amount} />
                                                <MobileCard.Field label="Balance" value={row.balance} />
                                            </div>
                                        </MobileCard.Body>
                                    </MobileCard>
                                ))
                            ) : (
                                <div className="tw-text-center tw-text-slate-400 tw-py-8">No data found</div>
                            )}
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

export default VendorLedgerReport;
