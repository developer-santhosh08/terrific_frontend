import { useState, useEffect } from 'react';
import { useTableControls } from '../../hooks/useTableControls';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, TrashIcon, PlusIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../components/TableSortIcon';
import { useSortableData } from '../../hooks/useSortableData';
import SmartPagination from '../../components/SmartPagination';
import { useLoader } from '../../context/LoaderContext';
import { usePermissions } from '../../context/PermissionContext';
import MobileCard from '../../components/common/MobileCard';

const ReportingList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Reporting.Reporting Details.Edit') || hasPermission('Reporting.Reporting Details.Delete');
    const navigate = useNavigate();

    const [reportings, setReportings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const { setLoading } = useLoader();
    
    useEffect(() => {
        const fetchReportings = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reporting/reporting`, { headers });
                const json = await response.json();
                
                if (response.ok && json.status === 'success') {
                    setReportings(json.data || []);
                }
            } catch (err) {
                console.error("Error fetching reports:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReportings();
    }, []);

    const filteredReportings = reportings.filter(r => 
        String(r.enqNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.mobile || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { items: sortedReportings, requestSort, getSortDirection } = useSortableData(filteredReportings);

    const totalPages = Math.ceil(sortedReportings.length / entriesPerPage) || 1;
    const startIndex = (currentPage - 1) * entriesPerPage;
    const paginatedReportings = sortedReportings.slice(startIndex, startIndex + parseInt(entriesPerPage));

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
                        <h3 className="card-title tw-mb-0 max-[768px]:tw-text-center max-[768px]:tw-w-full max-[350px]:tw-whitespace-nowrap max-[350px]:tw-text-lg">Reporting Details</h3>
                        {hasPermission('Reporting.Reporting Details.Create') && (
                            <button
                                className="btn-create tw-w-full sm:tw-w-auto"
                                onClick={() => navigate('/reporting/add')}
                            >
                                Add Reporting
                            </button>
                        )}
                    </div>

                    <div className="card-body">
                        <>
                            {/* Top Controls: Show Entries & Search */}
                            <div className="list-top-bar tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-gap-3 sm:tw-gap-0 tw-mb-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-gray-600 tw-font-medium tw-w-16 sm:tw-w-auto tw-text-right">Show</span>
                                <select 
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={entriesPerPage}
                                    onChange={(e) => {
                                        setEntriesPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="tw-text-gray-600 tw-font-medium">entries</span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-gray-600 tw-font-medium tw-w-16 sm:tw-w-auto tw-text-right">Search:</span>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm tw-flex-1 sm:tw-w-48 tw-inline-block"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="tw-hidden md:tw-block">
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped no-margin">
                                    <thead>
                                        <tr>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                                <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqNo')}>
                                                <div className="tw-flex tw-justify-between tw-items-center"><span>Enq.<br />No</span> <TableSortIcon direction={getSortDirection('enqNo')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqDate')}>
                                                <div className="tw-flex tw-justify-between tw-items-center"><span>Enq.<br />Date</span> <TableSortIcon direction={getSortDirection('enqDate')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('comttDate')}>
                                                <div className="tw-flex tw-justify-between tw-items-center"><span>Comtt.<br />Date</span> <TableSortIcon direction={getSortDirection('comttDate')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                                                <div className="tw-flex tw-justify-between tw-items-center"><span>Customer<br />Name</span> <TableSortIcon direction={getSortDirection('customerName')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('vertical')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Vertical <TableSortIcon direction={getSortDirection('vertical')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('allottedTo')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Allotted To <TableSortIcon direction={getSortDirection('allottedTo')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('currentStage')}>
                                                <div className="tw-flex tw-justify-between tw-items-center"><span>Current<br />Stage</span> <TableSortIcon direction={getSortDirection('currentStage')} /></div>
                                            </th>
                                            {hasActionPermission && (
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                                    <div className="tw-flex tw-justify-between tw-items-center">Action <TableSortIcon /></div>
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedReportings.map((reporting, index) => (
                                            <tr key={reporting.id}>
                                                <td>{startIndex + index + 1}</td>
                                                <td>{reporting.enqNo}</td>
                                                <td>{reporting.enqDate}</td>
                                                <td>{reporting.comttDate}</td>
                                                <td>{reporting.customerName}</td>
                                                <td>{reporting.mobile}</td>
                                                <td>{reporting.vertical}</td>
                                                <td>{reporting.allottedTo}</td>
                                                <td>
                                                    <span className={`tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium ${reporting.currentStage === 'Closed' ? 'tw-bg-green-500 tw-text-white' : 'tw-bg-orange-500 tw-text-white'
                                                        }`}>
                                                        {reporting.currentStage}
                                                    </span>
                                                </td>
                                                {hasActionPermission && (
                                                    <td>
                                                        <div className="tw-flex tw-gap-2">
                                                            {hasPermission('Reporting.Reporting Details.Edit') && (
                                                                <button
                                                                    type="button" className="list-action-btn btn-edit"
                                                                    onClick={() => navigate(`/reporting/edit/${reporting.id}`)}
                                                                    title="Edit"
                                                                >
                                                                    <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                                </button>
                                                            )}
                                                            {hasPermission('Reporting.Reporting Details.Delete') && (
                                                                <button
                                                                    type="button" className="list-action-btn btn-delete"
                                                                    title="Delete"
                                                                    onClick={async () => {
                                                                        if (window.confirm("Are you sure you want to delete this report?")) {
                                                                            try {
                                                                                const token = sessionStorage.getItem('erp_token');
                                                                                const headers = {
                                                                                    'Accept': 'application/json',
                                                                                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                                                                };
                                                                                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reporting/reporting/${reporting.id}`, {
                                                                                    method: 'DELETE',
                                                                                    headers
                                                                                });
                                                                                if (res.ok) {
                                                                                    setReportings(reportings.filter(r => r.id !== reporting.id));
                                                                                }
                                                                            } catch (e) {
                                                                                console.error(e);
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <TrashIcon weight="duotone" className="tw-w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        {reportings.length === 0 && (
                                            <tr>
                                                <td colSpan={hasActionPermission ? 10 : 9} className="tw-text-center tw-text-slate-400 tw-py-8">
                                                    No records found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {paginatedReportings.map((reporting) => (
                                <MobileCard key={reporting.id}>
                                    <MobileCard.Header label="ENQ. NO" value={reporting.enqNo} />
                                    
                                    <MobileCard.Body>
                                        <div className="tw-flex tw-justify-between tw-items-start">
                                            <MobileCard.Field label="Customer Name" value={reporting.customerName} bold />
                                        </div>
                                        
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                                            <MobileCard.Field label="Mobile" value={
                                                <a href={`tel:${reporting.mobile}`} className="tw-text-blue-600 hover:tw-underline">
                                                    {reporting.mobile}
                                                </a>
                                            } />
                                            <MobileCard.Field label="Vertical" value={reporting.vertical} align="right" />
                                        </div>
                                        
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                            <MobileCard.Field label="Enq. Date" value={reporting.enqDate} />
                                            <MobileCard.Field label="Comtt. Date" value={reporting.comttDate} align="right" />
                                        </div>
                                        
                                        <div className="tw-mt-2">
                                            <MobileCard.Field label="Current Stage" value={
                                                <span className={`tw-inline-block tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium tw-text-white ${reporting.currentStage === 'Closed' ? 'tw-bg-green-500' : 'tw-bg-orange-500'}`}>
                                                    {reporting.currentStage}
                                                </span>
                                            } />
                                        </div>
                                    </MobileCard.Body>
                                    
                                    <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                        <div className="tw-flex tw-justify-between tw-items-center tw-w-full">
                                            <MobileCard.Field label="Allotted To" value={reporting.allottedTo || '-'} />
                                        </div>

                                        {hasActionPermission && (
                                            <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                                <MobileCard.Actions>
                                                {hasPermission('Reporting.Reporting Details.Edit') && (
                                                    <button 
                                                        type="button" 
                                                        className="list-action-btn btn-edit tw-shadow-none" 
                                                        title="Edit"
                                                        onClick={() => navigate(`/reporting/edit/${reporting.id}`)}
                                                    >
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('Reporting.Reporting Details.Delete') && (
                                                    <button 
                                                        type="button" 
                                                        className="list-action-btn btn-delete tw-shadow-none" 
                                                        title="Delete"
                                                        onClick={async () => {
                                                            if (window.confirm('Are you sure you want to delete this reporting entry?')) {
                                                                try {
                                                                    const headers = {};
                                                                    const token = localStorage.getItem('token');
                                                                    if (token) headers['Authorization'] = `Bearer ${token}`;
                                                                    
                                                                    const res = await fetch(`http://localhost:8000/api/reportings/${reporting.id}`, {
                                                                        method: 'DELETE',
                                                                        headers
                                                                    });
                                                                    if (res.ok) {
                                                                        setReportings(reportings.filter(r => r.id !== reporting.id));
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                </MobileCard.Actions>
                                            </div>
                                        )}
                                    </MobileCard.Footer>
                                </MobileCard>
                            ))}
                            
                            {reportings.length === 0 && (
                                <div className="tw-text-center tw-text-slate-400 tw-py-8 tw-bg-white tw-rounded-xl tw-border tw-border-gray-100">
                                    No records found
                                </div>
                            )}
                        </div>

                        {/* Bottom Controls: Info & Pagination */}
                        <SmartPagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            startIndex={startIndex}
                            entriesPerPage={entriesPerPage}
                            totalEntries={sortedReportings.length}
                        />

                    </>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReportingList;
