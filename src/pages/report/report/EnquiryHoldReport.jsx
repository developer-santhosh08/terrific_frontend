import { useState, useEffect } from 'react';
import Select from 'react-select';
import TableSortIcon from '../../../components/TableSortIcon';
import SmartPagination from '../../../components/SmartPagination';
import { useSortableData } from '../../../hooks/useSortableData';
import MobileCard from '../../../components/common/MobileCard';

const EnquiryHoldReport = () => {
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [enqNoOptions, setEnqNoOptions] = useState([]);
    const [mobileOptions, setMobileOptions] = useState([]);
    const [allottedToOptions, setAllottedToOptions] = useState([]);

    const [enqNo, setEnqNo] = useState(null);
    const [mobile, setMobile] = useState(null);
    const [allottedTo, setAllottedTo] = useState(null);

    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/report/pending-enquiry`);
                const json = await res.json();
                if (json.status === 'success' && json.data) {
                    setReportData(json.data);
                    setFilteredData(json.data);

                    // Build dropdown options dynamically
                    const uniqueEnqNos = [...new Set(json.data.map(item => item.enq_no).filter(Boolean))];
                    setEnqNoOptions(uniqueEnqNos.map(val => ({ value: val, label: val })));

                    const uniqueMobiles = [...new Set(json.data.map(item => item.mobile).filter(Boolean))];
                    setMobileOptions(uniqueMobiles.map(val => ({ value: val, label: val })));

                    const uniquePersons = [...new Set(json.data.map(item => item.allotted_to).filter(Boolean))];
                    setAllottedToOptions(uniquePersons.map(val => ({ value: val, label: val })));
                }
            } catch (error) {
                console.error("Failed to fetch pending enquiry report data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleFilter = () => {
        let filtered = reportData;
        
        if (enqNo) {
            filtered = filtered.filter(item => item.enq_no == enqNo.value);
        }
        
        if (mobile) {
            filtered = filtered.filter(item => item.mobile == mobile.value);
        }

        if (allottedTo) {
            filtered = filtered.filter(item => item.allotted_to == allottedTo.value);
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setEnqNo(null);
        setMobile(null);
        setAllottedTo(null);
        setFilteredData(reportData);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '1970-01-01 00:00:00') return '-';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
    };

    const searchFilteredData = filteredData.filter(row => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            String(row.enq_no || '').toLowerCase().includes(searchLower) ||
            String(formatDate(row.enq_date) || '').toLowerCase().includes(searchLower) ||
            String(formatDate(row.comtt_date) || '').toLowerCase().includes(searchLower) ||
            String(row.mobile || '').toLowerCase().includes(searchLower) ||
            String(row.vertical || '').toLowerCase().includes(searchLower) ||
            String(row.allotted_to || '').toLowerCase().includes(searchLower) ||
            String(row.current_stage || '').toLowerCase().includes(searchLower)
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
                        <h3 className="card-title">Enquiry Hold Report</h3>
                    </div>
                    <div className="card-body">

                        {/* ── Filter fields ── */}
                        <div className="row mb-3 align-items-end">
                            <div className="col-md-3 form-group">
                                <label>Enquiry No</label>
                                <Select
                                    options={enqNoOptions}
                                    value={enqNo}
                                    onChange={setEnqNo}
                                    placeholder="Select enquiry no..."
                                    isClearable
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    menuPosition="fixed"
                                />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>Mobile</label>
                                <Select
                                    options={mobileOptions}
                                    value={mobile}
                                    onChange={setMobile}
                                    placeholder="Select mobile..."
                                    isClearable
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    menuPosition="fixed"
                                />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>Allotted To</label>
                                <Select
                                    options={allottedToOptions}
                                    value={allottedTo}
                                    onChange={setAllottedTo}
                                    placeholder="Select person..."
                                    isClearable
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    menuPosition="fixed"
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
                                            <div className="tw-flex tw-justify-between tw-items-center">#</div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enq_no')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={getSortDirection('enq_no')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enq_date')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Enq. Date <TableSortIcon direction={getSortDirection('enq_date')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('comtt_date')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Comtt. Date <TableSortIcon direction={getSortDirection('comtt_date')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('vertical')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Vertical <TableSortIcon direction={getSortDirection('vertical')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('allotted_to')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Allotted To <TableSortIcon direction={getSortDirection('allotted_to')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('current_stage')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('current_stage')} /></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center">Loading...</td>
                                        </tr>
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((row, idx) => (
                                            <tr key={row.id || idx}>
                                                <td>{startIndex + idx + 1}</td>
                                                <td>{row.enq_no || '-'}</td>
                                                <td>{formatDate(row.enq_date)}</td>
                                                <td>{formatDate(row.comtt_date)}</td>
                                                <td>{row.mobile || '-'}</td>
                                                <td>{row.vertical || '-'}</td>
                                                <td>{row.allotted_to || '-'}</td>
                                                <td>{row.current_stage || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">No data found</td>
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
                                paginatedData.map((row, idx) => (
                                    <MobileCard key={row.id || idx}>
                                        <MobileCard.Header label="#" value={startIndex + idx + 1} />
                                        <MobileCard.Body>
                                            <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                                <MobileCard.Field label="Enq. No" value={row.enq_no || '-'} />
                                                <MobileCard.Field label="Enq. Date" value={formatDate(row.enq_date)} />
                                                <MobileCard.Field label="Comtt. Date" value={formatDate(row.comtt_date)} />
                                                <MobileCard.Field label="Mobile" value={row.mobile || '-'} />
                                                <MobileCard.Field label="Vertical" value={row.vertical || '-'} />
                                                <MobileCard.Field label="Allotted To" value={row.allotted_to || '-'} />
                                                <MobileCard.Field label="Current Stage" value={row.current_stage || '-'} />
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

export default EnquiryHoldReport;
