import { useState, useEffect } from 'react';
import TableSortIcon from '../../../components/TableSortIcon';
import SmartPagination from '../../../components/SmartPagination';
import { useSortableData } from '../../../hooks/useSortableData';

const PaymentVoucherReport = () => {
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [voucherType, setVoucherType] = useState('');
    const [payeeName, setPayeeName] = useState('');

    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/report/payment-voucher-summary`);
                const json = await res.json();
                if (json.status === 'success' && json.data) {
                    // Flatten grouped data
                    const flatData = [];
                    json.data.forEach(group => {
                        if (group.payees && group.payees.length > 0) {
                            group.payees.forEach(payee => {
                                flatData.push({
                                    voucher_type: group.voucher_type,
                                    payee_name: payee.name,
                                    total_amount: payee.total_amount
                                });
                            });
                        } else {
                            flatData.push({
                                voucher_type: group.voucher_type,
                                payee_name: '-',
                                total_amount: group.type_total_amount || 0
                            });
                        }
                    });

                    setReportData(flatData);
                    setFilteredData(flatData);
                }
            } catch (error) {
                console.error("Failed to fetch payment voucher data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleFilter = () => {
        let filtered = reportData;
        
        if (voucherType.trim()) {
            filtered = filtered.filter(item => 
                (item.voucher_type || '').toLowerCase().includes(voucherType.toLowerCase())
            );
        }

        if (payeeName.trim()) {
            filtered = filtered.filter(item => 
                (item.payee_name || '').toLowerCase().includes(payeeName.toLowerCase())
            );
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setVoucherType('');
        setPayeeName('');
        setFilteredData(reportData);
        setCurrentPage(1);
    };

    const searchFilteredData = filteredData.filter(row => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            String(row.voucher_type || '').toLowerCase().includes(searchLower) ||
            String(row.payee_name || '').toLowerCase().includes(searchLower) ||
            String(row.total_amount || '').toLowerCase().includes(searchLower)
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
                        <h3 className="card-title">Payment Voucher Report</h3>
                    </div>
                    <div className="card-body">

                        {/* ── Filter fields ── */}
                        <div className="row mb-3 align-items-end">
                            <div className="col-md-3 form-group">
                                <label>Voucher Type</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter voucher type"
                                    value={voucherType}
                                    onChange={(e) => setVoucherType(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>Payee Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter payee name"
                                    value={payeeName}
                                    onChange={(e) => setPayeeName(e.target.value)}
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
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('voucher_type')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Voucher Type <TableSortIcon direction={getSortDirection('voucher_type')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('payee_name')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Payee Name <TableSortIcon direction={getSortDirection('payee_name')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('total_amount')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Total Amount <TableSortIcon direction={getSortDirection('total_amount')} /></div>
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
                                            const amount = Number(row.total_amount) || 0;

                                            return (
                                                <tr key={idx}>
                                                    <td>{startIndex + idx + 1}</td>
                                                    <td>{row.voucher_type || '-'}</td>
                                                    <td>{row.payee_name || '-'}</td>
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

export default PaymentVoucherReport;
