import { useLoader } from '../../../context/LoaderContext';
import Pagination from '../../../components/Pagination';
import { useTableControls } from '../../../hooks/useTableControls';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, ListIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import QuotationPopup from '../../../components/Popup/QuotationPopup';
import { usePermissions } from '../../../context/PermissionContext';

/* ── Dummy data ───────────────────────────────────────────────── */
const SITE_VISIT_DATA = [
    { id: 1, enqNo: 'ENQ-1001', enqDate: '2026-05-02', customerName: 'Acme Corp',       mobile: '9876543210', category: 'In Followup', currentStage: 'Job Card' },
    { id: 2, enqNo: 'ENQ-1002', enqDate: '2026-05-06', customerName: 'Beta Solutions',  mobile: '9123456780', category: 'Converted',   currentStage: 'Job Card' },
    { id: 3, enqNo: 'ENQ-1003', enqDate: '2026-05-10', customerName: 'Gamma Traders',   mobile: '9988776655', category: 'In Followup', currentStage: 'Job Card' },
    { id: 4, enqNo: 'ENQ-1004', enqDate: '2026-05-13', customerName: 'Delta Pvt Ltd',   mobile: '9012345678', category: 'Converted',   currentStage: 'Job Card' },
    { id: 5, enqNo: 'ENQ-1005', enqDate: '2026-05-17', customerName: 'Epsilon Infra',   mobile: '9345678901', category: 'In Followup', currentStage: 'Job Card' },
    { id: 6, enqNo: 'ENQ-1006', enqDate: '2026-05-20', customerName: 'Zeta Industries', mobile: '9871234567', category: 'Converted',   currentStage: 'Job Card' },
];

const COMPLETE_SITE_VISIT_DATA = [
    { id: 1, enqNo: 'ENQ-2001', enqDate: '2026-04-01', customerName: 'Iota Global',      mobile: '9543210987', category: 'Converted',   currentStage: 'Job Card' },
    { id: 2, enqNo: 'ENQ-2002', enqDate: '2026-04-05', customerName: 'Kappa Corp',       mobile: '9432109876', category: 'In Followup', currentStage: 'Job Card' },
    { id: 3, enqNo: 'ENQ-2003', enqDate: '2026-04-09', customerName: 'Lambda Systems',   mobile: '9321098765', category: 'Converted',   currentStage: 'Job Card' },
    { id: 4, enqNo: 'ENQ-2004', enqDate: '2026-04-14', customerName: 'Mu Electronics',   mobile: '9210987654', category: 'In Followup', currentStage: 'Job Card' },
];

/* ── Badge styles ─────────────────────────────────────────────── */
const CATEGORY_STYLE = {
    'In Followup': { bg: '#3b82f6', color: '#ffffff' },
    'Converted':   { bg: '#10b981', color: '#ffffff' },
};

const STAGE_STYLE = {
    'Job Card': { bg: '#f59e0b', color: '#000000' },
};

const Badge = ({ value, map }) => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Sales Contact.Sales Contact.Edit') || hasPermission('Sales Contact.Sales Contact.Delete');
    const { setLoading } = useLoader();
    const st = map[value] || { bg: '#e5e7eb', color: '#111827' };
    return (
        <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 3, whiteSpace: 'nowrap', fontSize: 12 }}>
            {value || '-'}
        </span>
    );
};

/* ── Component ────────────────────────────────────────────────── */
const SiteVisitList = () => {
    const navigate = useNavigate();
    const [activeTab,   setActiveTab]   = useState('siteVisit');
    const [searchText,  setSearchText]  = useState('');
    const [pageSize,    setPageSize]    = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [isQuotationPopupOpen, setIsQuotationPopupOpen] = useState(false);
    const [selectedEnqNo, setSelectedEnqNo] = useState('');

    const { items: sortedVisit,    requestSort: reqSortVisit,    getSortDirection: getSortDirVisit }    = useSortableData(SITE_VISIT_DATA);
    const { items: sortedComplete, requestSort: reqSortComplete, getSortDirection: getSortDirComplete } = useSortableData(COMPLETE_SITE_VISIT_DATA);

    const openQuotationPopup = (enqNo) => {
        setSelectedEnqNo(enqNo);
        setIsQuotationPopupOpen(true);
    };

    const renderTable = (items, requestSort, getSortDirection, startIndex) => (
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
                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('category')}>
                            <div className="tw-flex tw-justify-between tw-items-center">Category <TableSortIcon direction={getSortDirection('category')} /></div>
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
                            <td><Badge value={r.category}     map={CATEGORY_STYLE} /></td>
                            <td><Badge value={r.currentStage} map={STAGE_STYLE} /></td>
                            {hasActionPermission && (
<td>
                                <div className="tw-flex tw-gap-2 tw-items-center">
                                    {hasPermission('Sales Contact.Sales Contact.Edit') && (
<button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/sales/site-visit/edit/${r.id}`)}>
                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                    </button>
)}
                                    <button type="button" className="list-action-btn btn-list" title="View List" onClick={() => openQuotationPopup(r.enqNo)}>
                                        <ListIcon weight="duotone" className="tw-w-4" />
                                    </button>
                                </div>
                            </td>
)}
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={hasActionPermission ? 8 : 7} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
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
            `}</style>

            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Site Visit List</h3>
                    </div>

                    <div className="card-body">
                        {/* Tabs */}
                        <div className="tw-flex tw-gap-2 tw-mb-3">
                            <button
                                type="button"
                                className={`tw-px-4 tw-py-2 ${activeTab === 'siteVisit' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                onClick={() => { setActiveTab('siteVisit'); setCurrentPage(1); }}
                            >
                                Site Visit List
                            </button>
                            <button
                                type="button"
                                className={`tw-px-4 tw-py-2 ${activeTab === 'complete' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                onClick={() => { setActiveTab('complete'); setCurrentPage(1); }}
                            >
                                Complete Site Visit
                            </button>
                        </div>

                        {/* Show / Search */}
                        <div className="list-top-bar">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span>Show</span>
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
                                <span>entries</span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span>Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-w-48 tw-inline-block"
                                    value={searchText}
                                    onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Table + Pagination */}
                        {(() => {
                            const isVisit     = activeTab === 'siteVisit';
                            const sourceItems = isVisit ? sortedVisit    : sortedComplete;
                            const requestSort = isVisit ? reqSortVisit   : reqSortComplete;
                            const getSortDir  = isVisit ? getSortDirVisit: getSortDirComplete;

                            const q = searchText.trim().toLowerCase();
                            const filtered = q
                                ? sourceItems.filter(r =>
                                    String(r.enqNo        || '').toLowerCase().includes(q) ||
                                    String(r.customerName || '').toLowerCase().includes(q) ||
                                    String(r.mobile       || '').toLowerCase().includes(q) ||
                                    String(r.category     || '').toLowerCase().includes(q) ||
                                    (r.currentStage || '').toLowerCase().includes(q)
                                )
                                : sourceItems;

                            const total      = filtered.length;
                            const totalPages = Math.max(1, Math.ceil(total / pageSize));
                            const safePage   = Math.min(currentPage, totalPages);
                            const startIndex = (safePage - 1) * pageSize;
                            const paginated  = filtered.slice(startIndex, startIndex + pageSize);

                            return (
                                <>
                                    {renderTable(paginated, requestSort, getSortDir, startIndex)}
                                    <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                                        <div className="tw-text-gray-600 tw-text-sm">
                                            Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, total)} of {total} entries
                                        </div>
                                        <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            <QuotationPopup 
                isOpen={isQuotationPopupOpen} 
                onClose={() => setIsQuotationPopupOpen(false)} 
                enquiryNumber={selectedEnqNo}
            />
        </section>
    );
};

export default SiteVisitList;
