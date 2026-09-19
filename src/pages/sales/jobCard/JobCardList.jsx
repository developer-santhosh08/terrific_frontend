import { useLoader } from '../../../context/LoaderContext';
import SmartPagination from '../../../components/SmartPagination';
import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, Printer, ArrowBendUpLeftIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import QuotationPopup from '../../../components/Popup/QuotationPopup';
import RevertPopup from '../../../components/Popup/RevertPopup';
import SuccessPopup from '../../../components/Popup/SuccessPopup';
import ErrorPopup from '../../../components/Popup/ErrorPopup';
import MobileCard from '../../../components/common/MobileCard';
import { usePermissions } from '../../../context/PermissionContext';


/* ── Badge styles ─────────────────────────────────────────────── */
const CATEGORY_STYLE = {
    'Converted': { bg: '#10b981', color: '#ffffff' },
    'In Followup': { bg: '#3b82f6', color: '#ffffff' },
};

const STAGE_STYLE = {
    'Job Card': { bg: '#f59e0b', color: '#ffffff' },
    'Receipt': { bg: '#8b5cf6', color: '#ffffff' },
    'Completed': { bg: '#10b981', color: '#ffffff' },
    'Pending': { bg: '#ef4444', color: '#ffffff' },
};

const Badge = ({ value, map, color }) => {
    const st = map[value] || { bg: color || '#22c55e', color: '#ffffff' };
    return (
        <span style={{ background: color || st.bg, color: st.color, padding: '2px 10px', borderRadius: 3, whiteSpace: 'nowrap', fontSize: 12 }}>
            {value || '-'}
        </span>
    );
};

/* ── Component ────────────────────────────────────────────────── */
const JobCardList = () => {
    const { hasPermission, refreshPermissions } = usePermissions();
    const { setLoading } = useLoader();
    const navigate = useNavigate();
    const location = useLocation();
    const canViewJobcard = hasPermission('Sales.Job Card - Jobcard List.View');
    const canViewErection = hasPermission('Sales.Job Card - Erection List.View');

    const [activeTab, setActiveTab] = useState(() => {
        if (location.state?.defaultTab) return location.state.defaultTab;
        if (hasPermission('Sales.Job Card - Jobcard List.View')) return 'jobcard';
        if (hasPermission('Sales.Job Card - Erection List.View')) return 'erection';
        return 'jobcard';
    });

    useEffect(() => {
        if (!canViewJobcard && canViewErection && activeTab === 'jobcard') setActiveTab('erection');
    }, [canViewJobcard, canViewErection, activeTab]);
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const activeTabLabel = activeTab === 'jobcard' ? 'Job Card - Jobcard List' : 'Job Card - Erection List';
    const canEdit = hasPermission(`Sales.${activeTabLabel}.Edit`);
    const canAdd = hasPermission(`Sales.${activeTabLabel}.Add`);
    const canPrint = hasPermission(`Sales.${activeTabLabel}.Print`);
    const canRevert = hasPermission(`Sales.${activeTabLabel}.Revert`);
    const hasActionPermission = canEdit || canAdd || canPrint || canRevert;

    const [jobcards, setJobcards] = useState([]);
    const [erections, setErections] = useState([]);

    const { items: sortedJobcard, requestSort: reqSortJobcard, getSortDirection: getSortDirJobcard } = useSortableData(jobcards);
    const { items: sortedErection, requestSort: reqSortErection, getSortDirection: getSortDirErection } = useSortableData(erections);

    const [quotationPopupRow, setQuotationPopupRow] = useState(null);
    const [revertPopupId, setRevertPopupId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const fetchJobCards = useCallback(async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/jobcards`);
            const result = await res.json();
            if (result.status && result.data) {
                const mappedData = result.data.map(item => ({
                    id: item.enquiry_header_id,
                    enqNo: item.enq_no,
                    enqDate: item.comt_date ? item.comt_date.split(' ')[0] : '-',
                    customerName: item.customer_name,
                    mobile: item.mobile,
                    category: 'Converted', // API only returns converted
                    currentStage: item.current_stage || 'Job Card',
                    stageColor: item.stage_color || null,
                    enquiry_status_id: item.enquiry_status_id
                }));
                setJobcards(mappedData);
            }
        } catch (error) {
            console.error("Error fetching job cards:", error);
        }
    }, []);

    const fetchErections = useCallback(async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/jobcards/erection-list`);
            const result = await res.json();
            if (result.status && result.data) {
                const mappedData = result.data.map(item => ({
                    id: item.enquiry_header_id,
                    enqNo: item.enq_no,
                    enqDate: item.comt_date ? item.comt_date.split(' ')[0] : '-',
                    customerName: item.customer_name,
                    mobile: item.mobile,
                    category: 'Converted',
                    currentStage: item.current_stage || 'Completed Job Card',
                    stageColor: item.stage_color || null,
                    enquiry_status_id: item.enquiry_status_id
                }));
                setErections(mappedData);
            }
        } catch (error) {
            console.error("Error fetching erection list:", error);
        }
    }, []);



    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchJobCards(), fetchErections()]);
            setLoading(false);
        };
        loadAll();
    }, [fetchJobCards, fetchErections, setLoading]);

    const confirmRevertJobCard = async () => {
        if (!revertPopupId) return;
        
        try {
            setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/jobcards/erection/revert/${revertPopupId}`, {
                method: 'PUT'
            });
            const result = await res.json();
            if (result.status) {
                setRevertPopupId(null);
                setSuccessMessage(result.message);
                fetchJobCards();
                fetchErections();
            } else {
                setErrorMessage(result.message || "Failed to revert Job Card");
            }
        } catch (error) {
            console.error("Error reverting job card:", error);
            setErrorMessage("Error reverting job card");
        } finally {
            setLoading(false);
        }
    };

    const renderActionButtons = (tabKey, row) => {
        return (
            <div className="tw-flex tw-gap-2 tw-items-center">
                {canEdit && (tabKey === 'jobcard' || (!row.enquiry_status_id || row.enquiry_status_id <= 5)) && (
                    <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(tabKey === 'jobcard' ? `/sales/job-card/add` : `/sales/erection/edit/${row.id}`, tabKey === 'jobcard' ? { state: { editId: row.id } } : {})}>
                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                    </button>
                )}
                {canAdd && (
                    <button type="button" className="list-action-btn btn-add" title="Quotation" onClick={() => setQuotationPopupRow(row)}>
                        <PlusIcon weight="bold" className="tw-w-4" />
                    </button>
                )}
                {canPrint && (
                    <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/enquiry/proformaQuotation/${row.id}`, '_blank')}>
                        <Printer weight="duotone" className="tw-w-4" />
                    </button>
                )}
                {canRevert && tabKey === 'erection' && (!row.enquiry_status_id || row.enquiry_status_id <= 5) && (
                    <button type="button" className="list-action-btn btn-revert" title="Revert to Job Card" onClick={() => setRevertPopupId(row.id)}>
                        <ArrowBendUpLeftIcon weight="bold" className="tw-w-4" />
                    </button>
                )}
            </div>
        );
    };

    const renderTable = (items, requestSort, getSortDirection, startIndex, tabKey) => (
        <>
            {/* Desktop View */}
            <div className="tw-hidden md:tw-block">
                <div className="table-responsive">
                    <table className="table table-bordered table-striped no-margin">
                        <thead>
                            <tr>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                    <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqNo')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={getSortDirection('enqNo')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqDate')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Enq. Date <TableSortIcon direction={getSortDirection('enqDate')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('currentStage')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div>
                                </th>

                                {hasActionPermission && <th className="tw-align-middle">Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((r, idx) => (
                                <tr key={r.id}>
                                    <td>{startIndex + idx + 1}</td>
                                    <td>{r.enqNo}</td>
                                    <td>{r.enqDate}</td>
                                    <td>{r.customerName}</td>
                                    <td>{r.mobile}</td>
                                    <td><Badge value={r.currentStage} map={STAGE_STYLE} color={r.stageColor} /></td>

                                    {hasActionPermission && (
                                        <td>
                                            {renderActionButtons(tabKey, r)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={hasActionPermission ? 7 : 6} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:tw-hidden tw-flex tw-flex-col">
                {items.map((r) => (
                    <MobileCard key={r.id}>
                        <MobileCard.Header label="ENQ. NO" value={r.enqNo} />
                        <MobileCard.Body>
                            <MobileCard.Field label="Customer Name" value={r.customerName} bold valueColor="blue" />
                            
                            <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                <MobileCard.Field label="Mobile" value={r.mobile || '-'} valueColor="blue" />
                                <MobileCard.Field label="Enq. Date" value={r.enqDate || '-'} align="right" />
                            </div>
                        </MobileCard.Body>
                        
                        <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                            <div className="tw-flex tw-gap-4 tw-w-full">
                                <div className="tw-flex tw-flex-col tw-gap-1">
                                    <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Stage</span>
                                    <div><Badge value={r.currentStage} map={STAGE_STYLE} color={r.stageColor} /></div>
                                </div>
                            </div>
                            
                            {hasActionPermission && (
                                <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                    <MobileCard.Actions>
                                        {renderActionButtons(tabKey, r)}
                                    </MobileCard.Actions>
                                </div>
                            )}
                        </MobileCard.Footer>
                    </MobileCard>
                ))}
                
                {items.length === 0 && (
                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                        No records found
                    </div>
                )}
            </div>
        </>
    );

    return (
        <section className="content">
            <style>{`
                .sv-action-icon {
                    width: 28px; height: 28px; border-radius: 8px; border: none;
                    display: inline-flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background-color .12s ease, transform .06s ease;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.10);
                }
                .sv-action-icon:hover { transform: translateY(-1px); }
                .sv-action-icon:focus { outline: none; }
                .sv-edit  { background-color: #f59e0b; color: #000000; }
                .sv-edit:hover  { background-color: #d97706; }
                .sv-add   { background-color: #10b981; color: #ffffff; }
                .sv-add:hover   { background-color: #059669; }
                .sv-list  { background-color: #6366f1; color: #ffffff; }
                .sv-list:hover  { background-color: #4f46e5; }
                .sv-print { background-color: #06b6d4; color: #ffffff; }
                .sv-print:hover { background-color: #0891b2; }
                .btn-revert { background-color: #ef4444; color: #ffffff; }
                .btn-revert:hover { background-color: #dc2828; }
            `}</style>

            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Job Card / Erection</h3>
                    </div>

                    <div className="card-body">
                        {/* Tabs */}
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 tw-mb-4">
                            {canViewJobcard && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'jobcard' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('jobcard'); setCurrentPage(1); }}
                                >
                                    Jobcard List
                                </button>
                            )}
                            {canViewErection && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'erection' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('erection'); setCurrentPage(1); }}
                                >
                                    Erection List
                                </button>
                            )}
                        </div>

                        {/* Show / Search */}
                        <div className="list-top-bar tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-gap-3 sm:tw-gap-0 tw-mb-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-gray-600 tw-font-medium tw-w-16 sm:tw-w-auto tw-text-right">Show</span>
                                <select
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={pageSize}
                                    onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
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
                                    value={searchText}
                                    onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Table + Pagination */}
                        {(() => {
                            let sourceItems = [];
                            let requestSort = null;
                            let getSortDir = null;

                            if (activeTab === 'jobcard') {
                                sourceItems = sortedJobcard;
                                requestSort = reqSortJobcard;
                                getSortDir = getSortDirJobcard;
                            } else if (activeTab === 'erection') {
                                sourceItems = sortedErection;
                                requestSort = reqSortErection;
                                getSortDir = getSortDirErection;
                            }
                            const q = searchText.trim().toLowerCase();
                            const filtered = q
                                ? sourceItems.filter(r =>
                                    String(r.enqNo || '').toLowerCase().includes(q) ||
                                    String(r.customerName || '').toLowerCase().includes(q) ||
                                    String(r.mobile || '').toLowerCase().includes(q)
                                )
                                : sourceItems;

                            const total = filtered.length;
                            const totalPages = Math.max(1, Math.ceil(total / pageSize));
                            const safePage = Math.min(currentPage, totalPages);
                            const startIndex = (safePage - 1) * pageSize;
                            const paginated = filtered.slice(startIndex, startIndex + pageSize);

                            return (
                                <>
                                    {renderTable(paginated, requestSort, getSortDir, startIndex, activeTab)}
                                    <SmartPagination 
                                        currentPage={safePage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        startIndex={startIndex}
                                        entriesPerPage={pageSize}
                                        totalEntries={total}
                                    />
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
            
            <QuotationPopup
                isOpen={!!quotationPopupRow}
                onClose={() => setQuotationPopupRow(null)}
                row={quotationPopupRow}
            />

            <RevertPopup
                isOpen={!!revertPopupId}
                onClose={() => setRevertPopupId(null)}
                onConfirm={confirmRevertJobCard}
                title="Revert Confirmation"
                message={<>Are you sure you want to <strong style={{ color: '#dc2626' }}>revert</strong> this Job Card? This will restore the stock and make the serial numbers available again.<br /></>}
            />

            <SuccessPopup
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage('')}
                message={successMessage}
            />

            <ErrorPopup
                isOpen={!!errorMessage}
                onClose={() => setErrorMessage('')}
                message={errorMessage}
            />
        </section>
    );
};

export default JobCardList;
