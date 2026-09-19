import { useState, useEffect } from 'react';
import TableSortIcon from '../../../components/TableSortIcon';
import SmartPagination from '../../../components/SmartPagination';
import { useSortableData } from '../../../hooks/useSortableData';

const VendorPaymentTotalPaid = () => {
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [vendorName, setVendorName] = useState('');

    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/report/paid-vendor-payment`);
                const json = await res.json();
                if (json.status === 'success' && json.data) {
                    setReportData(json.data);
                    setFilteredData(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch vendor paid payment data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleFilter = () => {
        let filtered = reportData;
        
        if (vendorName.trim()) {
            filtered = filtered.filter(item => 
                (item.vendor_name || '').toLowerCase().includes(vendorName.toLowerCase())
            );
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setVendorName('');
        setFilteredData(reportData);
        setCurrentPage(1);
    };

    const searchFilteredData = filteredData.filter(row => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            String(row.vendor_name || '').toLowerCase().includes(searchLower) ||
            String(row.mobile_number || '').toLowerCase().includes(searchLower) ||
            String(row.total_paid_amount || '').toLowerCase().includes(searchLower)
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
                        <h3 className="card-title">Total Paid Vendor Payment Report</h3>
                    </div>
                    <div className="card-body">

                        {/* ── Filter fields ── */}
                        <div className="row mb-3 align-items-end">
                            <div className="col-md-4 form-group">
                                <label>Vendor Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter vendor name"
                                    value={vendorName}
                                    onChange={(e) => setVendorName(e.target.value)}
                                />
                            </div>
                            <div className="col-md-4 form-group d-flex align-items-end gap-2">
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
                                            <div className="tw-flex tw-justify-between tw-items-center">Sno</div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('vendor_name')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Vendor Name <TableSortIcon direction={getSortDirection('vendor_name')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile_number')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Mobile Number <TableSortIcon direction={getSortDirection('mobile_number')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('total_paid_amount')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Total Paid Amount <TableSortIcon direction={getSortDirection('total_paid_amount')} /></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="text-center">Loading...</td>
                                        </tr>
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((row, idx) => {
                                            const amount = Number(row.total_paid_amount) || 0;

                                            return (
                                                <tr key={row.vendor_id || idx}>
                                                    <td>{startIndex + idx + 1}</td>
                                                    <td>{row.vendor_name || '-'}</td>
                                                    <td>{row.mobile_number || '-'}</td>
                                                    <td className="tw-text-right">{amount.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center">No data found</td>
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

export default VendorPaymentTotalPaid;
