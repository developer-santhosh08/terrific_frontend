import { useLoader } from '../../../context/LoaderContext';
import SmartPagination from '../../../components/SmartPagination';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockCounterClockwiseIcon, PrinterIcon, CheckCircleIcon, ArrowBendUpLeftIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import FollowupHistoryPopup from '../../../components/Popup/FollowupHistoryPopup';
import UpdateFollowupDatePopup from '../../../components/Popup/UpdateFollowupDatePopup';
import StatusChangePopup from '../../../components/Popup/StatusChangePopup';
import RevertPopup from '../../../components/Popup/RevertPopup';
import { usePermissions } from '../../../context/PermissionContext';
import MobileCard from '../../../components/common/MobileCard';


/* ── Badge styles ─────────────────────────────────────────────── */
const CATEGORY_STYLE = {
    'In Followup': { bg: '#3b82f6', color: '#ffffff' },
    'Converted': { bg: '#10b981', color: '#ffffff' },
};

const IN_FOLLOWUP_STATUS_STYLE = {
    'Infollowup': { bg: '#3b82f6', color: '#ffffff' }, // Blue
    'In Followup': { bg: '#3b82f6', color: '#ffffff' },
    'Overdue': { bg: '#ef4444', color: '#ffffff' }, // Red
    'today': { bg: '#f59e0b', color: '#ffffff' }, // Orange/Yellow
    'Today': { bg: '#f59e0b', color: '#ffffff' },
    'Next Followup': { bg: '#3b82f6', color: '#ffffff' },
    'Converted': { bg: '#10b981', color: '#ffffff' },
};

const STATUS_STYLE = {
    'No Followup': { bg: '#6b7280', color: '#ffffff' },
    'Overdue': { bg: '#ef4444', color: '#ffffff' },
    'today': { bg: '#f59e0b', color: '#ffffff' },
    'Today': { bg: '#f59e0b', color: '#ffffff' },
    'Infollowup': { bg: '#3b82f6', color: '#ffffff' },
    'Under Process': { bg: '#6b7280', color: '#ffffff' },
    'In Followup': { bg: '#3b82f6', color: '#ffffff' },
    'Job Card': { bg: '#10b981', color: '#ffffff' },
    'Invoice': { bg: '#8b5cf6', color: '#ffffff' },
    'Closed': { bg: '#000000', color: '#ffffff' },
    'Converted': { bg: '#10b981', color: '#ffffff' },
};
const STAGE_STYLE = {
    'Enquiry': { bg: '#6366f1', color: '#ffffff' },
    'Under Process': { bg: '#f59e0b', color: '#ffffff' },
    'In Followup': { bg: '#3b82f6', color: '#ffffff' },
    'Job Card': { bg: '#10b981', color: '#ffffff' },
    'Invoice': { bg: '#8b5cf6', color: '#ffffff' },
    'Closed': { bg: '#000000', color: '#ffffff' },
};

const Badge = ({ value, map }) => {
    const st = map[value] || { bg: '#e5e7eb', color: '#111827' };
    return (
        <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 3, whiteSpace: 'nowrap', fontSize: 12 }}>
            {value || '-'}
        </span>
    );
};

const DynamicBadge = ({ value, bgHex }) => {
    const bg = bgHex || '#e5e7eb';
    return (
        <span style={{ background: bg, color: '#ffffff', padding: '2px 10px', borderRadius: 3, whiteSpace: 'nowrap', fontSize: 12 }}>
            {value || '-'}
        </span>
    );
};

/* ── Component ────────────────────────────────────────────────── */
const FollowupsList = () => {
    const { hasPermission, refreshPermissions } = usePermissions();

    const inFollowupView = hasPermission('Sales.Followup - In Followup.View');
    const completeView = hasPermission('Sales.Followup - Complete Followup List.View');

    const navigate = useNavigate();
    const { setLoading } = useLoader();
    const [activeTab, setActiveTab] = useState(inFollowupView ? 'in_follow_up' : (completeView ? 'completed' : 'in_follow_up'));

    useEffect(() => {
        if (!inFollowupView && completeView && activeTab === 'in_follow_up') setActiveTab('completed');
    }, [inFollowupView, completeView]);



    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const activeTabLabel = activeTab === 'in_follow_up' ? 'Followup - In Followup' : 'Followup - Complete Followup List';
    const canHistory = hasPermission(`Sales.${activeTabLabel}.History`);
    const canQuotation = hasPermission(`Sales.${activeTabLabel}.Quotation`);
    const canProforma = hasPermission(`Sales.${activeTabLabel}.Proforma`);
    const canConvert = hasPermission(`Sales.${activeTabLabel}.Convert`);
    const canRevert = hasPermission(`Sales.${activeTabLabel}.Revert`);
    const hasActionPermission = canHistory || canQuotation || canProforma || canConvert || canRevert;

    const [inFollowupData, setInFollowupData] = useState([]);
    const [completeData, setCompleteData] = useState([]);

    const { items: sortedIn, requestSort: reqSortIn, getSortDirection: getSortDirIn } = useSortableData(inFollowupData);
    const { items: sortedComplete, requestSort: reqSortComplete, getSortDirection: getSortDirComplete } = useSortableData(completeData);

    const [historyRow, setHistoryRow] = useState(null);
    const [datePopupOpen, setDatePopupOpen] = useState(false);
    const [pendingDateUpdate, setPendingDateUpdate] = useState(null);
    const [convertPopupRow, setConvertPopupRow] = useState(null);
    const [revertPopupId, setRevertPopupId] = useState(null);

    const fetchData = useCallback(async (tab) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/followups?tab=${tab}`);
            const json = await res.json();
            if (json.status) {
                const mappedData = (json.data || []).map(item => {
                    let cat = 'In Followup';
                    if (item.category) {
                        if (item.category.toLowerCase() === 'converted') cat = 'Converted';
                        else if (item.category.toLowerCase() === 'infollowup') cat = 'In Followup';
                        else cat = item.category;
                    }

                    return {
                        id: item.enquiry_header_id,
                        enqNo: item.enq_no,
                        enqDate: item.enq_date,
                        customerName: item.customer_name,
                        mobile: item.mobile,
                        category: cat,
                        nextFollowupDate: item.next_followup_date ? item.next_followup_date.split('-').reverse().join('-') : '',
                        followupStatus: item.followup_status || 'No Followup',
                        currentStage: item.current_stage || 'Under Process',
                        stage_color: item.stage_color
                    };
                });

                if (tab === 'in_follow_up') {
                    setInFollowupData(mappedData.filter(item =>
                        item.category !== 'Converted' &&
                        item.followupStatus !== 'Invoice' &&
                        item.followupStatus !== 'Job Card' &&
                        item.followupStatus !== 'Closed'
                    ));
                }
                else setCompleteData(mappedData);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab, fetchData]);

    const handleDateChange = (row, newDate) => {
        setPendingDateUpdate({ id: row.id, next_followup_date: newDate, displayDate: newDate.split('-').reverse().join('-') });
        setDatePopupOpen(true);
    };

    const submitDateUpdate = async (remark) => {
        if (!pendingDateUpdate) return;
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/followups/${pendingDateUpdate.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    next_followup_date: pendingDateUpdate.next_followup_date,
                    remark: remark
                })
            });
            const json = await res.json();
            if (json.status) {
                setDatePopupOpen(false);
                setPendingDateUpdate(null);
                fetchData(activeTab); // Refresh table data
            } else {
                alert(json.message || 'Failed to update date');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const cancelDateUpdate = () => {
        setDatePopupOpen(false);
        setPendingDateUpdate(null);
        fetchData(activeTab); // revert the input back to original
    };

    const submitConvert = async (remark, nextDate) => {
        if (!convertPopupRow) return;
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/followups/convert/${convertPopupRow.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    next_followup_date: nextDate,
                    remark: remark
                })
            });
            const json = await res.json();
            if (json.status) {
                setConvertPopupRow(null);
                fetchData(activeTab);
            } else {
                alert(json.message || 'Failed to convert');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const submitRevert = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/followups/revert/${id}`, {
                method: 'PUT',
                headers: { 'Accept': 'application/json' },
            });
            const json = await res.json();
            if (json.status) {
                setRevertPopupId(null);
                fetchData(activeTab);
            } else {
                alert(json.message || 'Failed to revert');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const renderTable = (items, requestSort, getSortDirection, startIndex) => (
        <>
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
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('nextFollowupDate')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Next Followup Date <TableSortIcon direction={getSortDirection('nextFollowupDate')} /></div>
                                </th>
                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('followupStatus')}>
                                    <div className="tw-flex tw-justify-between tw-items-center">Followup Status <TableSortIcon direction={getSortDirection('followupStatus')} /></div>
                                </th>
                                {activeTab !== 'in_follow_up' && (
                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('currentStage')}>
                                        <div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div>
                                    </th>
                                )}
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
                                    <td>
                                        <input
                                            type="date"
                                            defaultValue={r.nextFollowupDate}
                                            onChange={(e) => handleDateChange(r, e.target.value)}
                                            className="form-control form-control-sm"
                                            style={{ minWidth: 140 }}
                                            readOnly={r.category === 'Converted'}
                                            disabled={r.category === 'Converted'}
                                        />
                                    </td>
                                    <td><Badge value={r.category === 'Converted' ? 'Converted' : r.followupStatus} map={activeTab === 'in_follow_up' ? IN_FOLLOWUP_STATUS_STYLE : STATUS_STYLE} /></td>
                                    {activeTab !== 'in_follow_up' && (
                                        <td><Badge value={r.currentStage} map={STAGE_STYLE} /></td>
                                    )}
                                    {hasActionPermission && (
                                        <td>
                                            <div className="tw-flex tw-gap-2 tw-items-center">
                                                {canHistory && (
                                                    <button type="button" className="btn-action-icon btn-history" onClick={() => setHistoryRow(r)}>
                                                        <ClockCounterClockwiseIcon weight="duotone" className="tw-w-4" />
                                                        <span className="btn-tooltip">Followup History</span>
                                                    </button>
                                                )}
                                                {canQuotation && (
                                                    <button type="button" className="btn-action-icon btn-print-q" onClick={() => window.open(`/enquiry/quotationPdf/${r.id}`, '_blank')}>
                                                        <PrinterIcon weight="duotone" className="tw-w-4" />
                                                        <span className="btn-tooltip">Quotation</span>
                                                    </button>
                                                )}
                                                {canProforma && (
                                                    <button type="button" className="btn-action-icon btn-print-p" onClick={() => window.open(`/enquiry/proformaQuotation/${r.id}`, '_blank')}>
                                                        <PrinterIcon weight="duotone" className="tw-w-4" />
                                                        <span className="btn-tooltip">Proforma</span>
                                                    </button>
                                                )}
                                                {activeTab === 'in_follow_up' && canConvert && (
                                                    <button type="button" className="btn-action-icon btn-history tw-text-green-600 hover:tw-bg-green-100" onClick={() => setConvertPopupRow(r)}>
                                                        <CheckCircleIcon weight="duotone" className="tw-w-4" />
                                                        <span className="btn-tooltip">Convert</span>
                                                    </button>
                                                )}
                                                {activeTab !== 'in_follow_up' && r.followupStatus !== 'Job Card' && canRevert && (
                                                    <button type="button" className="btn-action-icon sv-delete" onClick={() => setRevertPopupId(r.id)}>
                                                        <ArrowBendUpLeftIcon weight="duotone" className="tw-w-4" />
                                                        <span className="btn-tooltip">Revert</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={hasActionPermission ? 10 : 9} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards View */}
            <div className="tw-block md:tw-hidden tw-mt-4">
                {items.map((r) => (
                    <MobileCard key={r.id}>
                        <MobileCard.Header label="ENQ. NO" value={r.enqNo} />

                        <MobileCard.Body>
                            <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                                <MobileCard.Field label="Customer Name" value={r.customerName} bold />
                            </div>

                            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                                <MobileCard.Field label="Mobile" value={
                                    <a href={`tel:${r.mobile}`} className="tw-text-blue-600 hover:tw-underline">
                                        {r.mobile}
                                    </a>
                                } />
                                <MobileCard.Field label="Enq. Date" value={r.enqDate} align="right" />
                            </div>

                            <div className="tw-mt-3 tw-mb-1 tw-flex tw-flex-col tw-gap-1">
                                <span className="tw-text-xs tw-text-gray-500 tw-font-medium">Next Followup Date</span>
                                <input
                                    type="date"
                                    defaultValue={r.nextFollowupDate}
                                    onChange={(e) => handleDateChange(r, e.target.value)}
                                    className="form-control form-control-sm tw-max-w-[200px]"
                                    readOnly={r.category === 'Converted'}
                                    disabled={r.category === 'Converted'}
                                />
                            </div>
                        </MobileCard.Body>

                        <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                            <div className="tw-flex tw-justify-between tw-items-center tw-w-full">
                                <div className="tw-flex tw-gap-4">
                                    <div className="tw-flex tw-flex-col tw-gap-1">
                                        <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Status</span>
                                        <div><Badge value={r.category === 'Converted' ? 'Converted' : r.followupStatus} map={activeTab === 'in_follow_up' ? IN_FOLLOWUP_STATUS_STYLE : STATUS_STYLE} /></div>
                                    </div>

                                    {activeTab !== 'in_follow_up' && (
                                        <div className="tw-flex tw-flex-col tw-gap-1">
                                            <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Stage</span>
                                            <div><Badge value={r.currentStage} map={STAGE_STYLE} /></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {hasActionPermission && (
                                <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                    <MobileCard.Actions>
                                        {canHistory && (
                                            <button type="button" className="btn-action-icon btn-history" onClick={() => setHistoryRow(r)}>
                                                <ClockCounterClockwiseIcon weight="duotone" className="tw-w-4" />
                                            </button>
                                        )}
                                        {canQuotation && (
                                            <button type="button" className="btn-action-icon btn-print-q" onClick={() => window.open(`/enquiry/quotationPdf/${r.id}`, '_blank')}>
                                                <PrinterIcon weight="duotone" className="tw-w-4" />
                                            </button>
                                        )}
                                        {canProforma && (
                                            <button type="button" className="btn-action-icon btn-print-p" onClick={() => window.open(`/enquiry/proformaQuotation/${r.id}`, '_blank')}>
                                                <PrinterIcon weight="duotone" className="tw-w-4" />
                                            </button>
                                        )}
                                        {activeTab === 'in_follow_up' && canConvert && (
                                            <button type="button" className="btn-action-icon btn-history tw-text-green-600 hover:tw-bg-green-100" onClick={() => setConvertPopupRow(r)}>
                                                <CheckCircleIcon weight="duotone" className="tw-w-4" />
                                            </button>
                                        )}
                                        {activeTab !== 'in_follow_up' && r.followupStatus !== 'Job Card' && canRevert && (
                                            <button type="button" className="btn-action-icon sv-delete" onClick={() => setRevertPopupId(r.id)}>
                                                <ArrowBendUpLeftIcon weight="duotone" className="tw-w-4" />
                                            </button>
                                        )}
                                    </MobileCard.Actions>
                                </div>
                            )}
                        </MobileCard.Footer>
                    </MobileCard>
                ))}

                {items.length === 0 && (
                    <div className="tw-text-center tw-text-slate-400 tw-py-8 tw-bg-white tw-rounded-xl tw-border tw-border-gray-100">
                        No records found
                    </div>
                )}
            </div>
        </>
    );

    return (
        <section className="content">
            <style>{`
                .btn-action-icon {
                    width: 28px; height: 28px; border-radius: 8px; border: none;
                    display: inline-flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background-color .12s ease, transform .06s ease;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.10);
                    position: relative;
                }
                .btn-action-icon:hover { transform: translateY(-1px); }
                .btn-action-icon:focus { outline: none; }
                .btn-history   { background-color: #7c3aed; color: #ffffff; }
                .btn-history:hover   { background-color: #6d28d9; }
                .btn-print-q   { background-color: #2563eb; color: #ffffff; }
                .btn-print-q:hover   { background-color: #1d4ed8; }
                .btn-print-p   { background-color: #0891b2; color: #ffffff; }
                .btn-print-p:hover   { background-color: #0e7490; }
                .btn-action-icon .btn-tooltip {
                    visibility: hidden; opacity: 0;
                    position: absolute; bottom: calc(100% + 6px); left: 50%;
                    transform: translateX(-50%);
                    background: #1e293b; color: #fff;
                    font-size: 11px; white-space: nowrap;
                    padding: 3px 7px; border-radius: 4px;
                    pointer-events: none;
                    transition: opacity .15s ease;
                    z-index: 50;
                }
                .btn-action-icon .btn-tooltip::after {
                    content: ''; position: absolute; top: 100%; left: 50%;
                    transform: translateX(-50%);
                    border: 4px solid transparent;
                    border-top-color: #1e293b;
                }
                .btn-action-icon:hover .btn-tooltip { visibility: visible; opacity: 1; }
            `}</style>

            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-center tw-gap-3 sm:tw-gap-2">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Followup List</h3>
                        {hasPermission('Enquiry.Enquiry.Add') && (
                            <button className="btn-create tw-w-full sm:tw-w-auto tw-text-sm sm:tw-text-base tw-py-2" onClick={() => navigate('/enquiry/add')}>
                                Add New Enquiry
                            </button>
                        )}
                    </div>

                    <div className="card-body">
                        {/* Tabs */}
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 tw-mb-4">
                            {inFollowupView && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'in_follow_up' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('in_follow_up'); setCurrentPage(1); }}
                                >
                                    In Followup
                                </button>
                            )}
                            {completeView && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'completed' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setActiveTab('completed'); setCurrentPage(1); }}
                                >
                                    Complete Followup List
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
                            const isIn = activeTab === 'in_follow_up';
                            const sourceItems = isIn ? sortedIn : sortedComplete;
                            const requestSort = isIn ? reqSortIn : reqSortComplete;
                            const getSortDir = isIn ? getSortDirIn : getSortDirComplete;

                            const q = searchText.trim().toLowerCase();
                            const filtered = q
                                ? sourceItems.filter(r =>
                                    String(r.enqNo || '').toLowerCase().includes(q) ||
                                    String(r.customerName || '').toLowerCase().includes(q) ||
                                    String(r.mobile || '').toLowerCase().includes(q) ||
                                    String(r.category || '').toLowerCase().includes(q) ||
                                    String(r.followupStatus || '').toLowerCase().includes(q) ||
                                    String(r.currentStage || '').toLowerCase().includes(q)
                                )
                                : sourceItems;

                            const total = filtered.length;
                            const totalPages = Math.max(1, Math.ceil(total / pageSize));
                            const safePage = Math.min(currentPage, totalPages);
                            const startIndex = (safePage - 1) * pageSize;
                            const paginated = filtered.slice(startIndex, startIndex + pageSize);

                            return (
                                <>
                                    {renderTable(paginated, requestSort, getSortDir, startIndex)}
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
            <FollowupHistoryPopup
                isOpen={!!historyRow}
                onClose={() => setHistoryRow(null)}
                customerName={historyRow?.customerName}
                enquiryId={historyRow?.id}
            />
            <UpdateFollowupDatePopup
                isOpen={datePopupOpen}
                onClose={cancelDateUpdate}
                onConfirm={submitDateUpdate}
                newDate={pendingDateUpdate?.displayDate || ''}
            />
            <StatusChangePopup
                isOpen={!!convertPopupRow}
                onClose={() => setConvertPopupRow(null)}
                onConfirm={submitConvert}
                title="Convert Followup"
                dateLabel="Converted Date"
            />
            <RevertPopup
                isOpen={!!revertPopupId}
                onClose={() => setRevertPopupId(null)}
                onConfirm={() => submitRevert(revertPopupId)}
            />
        </section>
    );
};

export default FollowupsList;
