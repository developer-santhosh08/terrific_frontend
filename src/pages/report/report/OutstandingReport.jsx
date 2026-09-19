import { useState, useEffect } from 'react';
import TableSortIcon from '../../../components/TableSortIcon';
import SmartPagination from '../../../components/SmartPagination';
import { useSortableData } from '../../../hooks/useSortableData';
import MobileCard from '../../../components/common/MobileCard';

const OutstandingReport = () => {
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [contraNumber, setContraNumber] = useState('');
    const [contraPerson, setContraPerson] = useState('');
    const [contraDate, setContraDate] = useState('');

    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/report/contra-receipts/pending`);
                const json = await res.json();
                if (json.status === 'success' && json.data) {
                    setReportData(json.data);
                    setFilteredData(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch outstanding report data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleFilter = () => {
        let filtered = reportData;
        
        if (contraNumber.trim()) {
            filtered = filtered.filter(item => 
                `CON-${item.id}`.toLowerCase().includes(contraNumber.toLowerCase())
            );
        }
        
        if (contraPerson.trim()) {
            filtered = filtered.filter(item => 
                (item.name || '').toLowerCase().includes(contraPerson.toLowerCase())
            );
        }

        if (contraDate) {
            // Compare YYYY-MM-DD
            filtered = filtered.filter(item => {
                if (!item.contra_date) return false;
                return item.contra_date === contraDate;
            });
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setContraNumber('');
        setContraPerson('');
        setContraDate('');
        setFilteredData(reportData);
        setCurrentPage(1);
    };

    // Helper to format date if needed, assuming input is YYYY-MM-DD
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
        }
        return dateString;
    };

    const searchFilteredData = filteredData.filter(row => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            String(`CON-${row.id}`).toLowerCase().includes(searchLower) ||
            String(row.name || '').toLowerCase().includes(searchLower) ||
            String(row.contra_amount || '').toLowerCase().includes(searchLower) ||
            String(row.contra_date || '').toLowerCase().includes(searchLower) ||
            String(row.contra_intrest_amount || row.contra_intrest || '').toLowerCase().includes(searchLower)
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
                        <h3 className="card-title">Outstanding Report</h3>
                    </div>
                    <div className="card-body">

                        {/* ── Filter fields ── */}
                        <div className="row mb-3 align-items-end">
                            <div className="col-md-3 form-group">
                                <label>Contra Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter contra number"
                                    value={contraNumber}
                                    onChange={(e) => setContraNumber(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>Contra Person</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter contra person"
                                    value={contraPerson}
                                    onChange={(e) => setContraPerson(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>Contra Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    placeholder="DD-MM-YYYY"
                                    value={contraDate}
                                    onChange={(e) => setContraDate(e.target.value)}
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
                        <div className="table-responsive tw-hidden md:tw-block">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                            <div className="tw-flex tw-justify-between tw-items-center">Sno</div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Contra Number <TableSortIcon direction={getSortDirection('id')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('name')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Contra Person <TableSortIcon direction={getSortDirection('name')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('contra_amount')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Amount <TableSortIcon direction={getSortDirection('contra_amount')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('contra_date')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Contra Date <TableSortIcon direction={getSortDirection('contra_date')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('contra_intrest_amount')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Interest <TableSortIcon direction={getSortDirection('contra_intrest_amount')} /></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center">Loading...</td>
                                        </tr>
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((row, idx) => {
                                            const cNum = `CON-${row.id}`;
                                            const amount = Number(row.contra_amount) || 0;
                                            const interest = Number(row.contra_intrest_amount) || Number(row.contra_intrest) || 0;

                                            return (
                                                <tr key={row.id}>
                                                    <td>{startIndex + idx + 1}</td>
                                                    <td>{cNum}</td>
                                                    <td>{row.name || '-'}</td>
                                                    <td className="tw-text-right">{amount.toFixed(2)}</td>
                                                    <td>{formatDate(row.contra_date)}</td>
                                                    <td className="tw-text-right">{interest.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })
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
                            {loading ? (
                                <div className="tw-text-center tw-py-4 tw-text-slate-500">Loading...</div>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((row, idx) => {
                                    const cNum = `CON-${row.id}`;
                                    const amount = Number(row.contra_amount) || 0;
                                    const interest = Number(row.contra_intrest_amount) || Number(row.contra_intrest) || 0;

                                    return (
                                        <MobileCard key={row.id}>
                                            <MobileCard.Header label="Sno" value={startIndex + idx + 1} />
                                            <MobileCard.Body>
                                                <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                                    <MobileCard.Field label="Contra Number" value={cNum} />
                                                    <MobileCard.Field label="Contra Person" value={row.name || '-'} />
                                                    <MobileCard.Field label="Amount" value={amount.toFixed(2)} />
                                                    <MobileCard.Field label="Contra Date" value={formatDate(row.contra_date)} />
                                                    <MobileCard.Field label="Interest" value={interest.toFixed(2)} />
                                                </div>
                                            </MobileCard.Body>
                                        </MobileCard>
                                    );
                                })
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

export default OutstandingReport;
