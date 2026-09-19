import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoader } from '../../context/LoaderContext';
import Pagination from '../../components/Pagination';
import TableSortIcon from '../../components/TableSortIcon';
import { useSortableData } from '../../hooks/useSortableData';
import { Funnel, ArrowCounterClockwise, FilePdf, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { pdf } from '@react-pdf/renderer';
import ContraReceiptPDF from '../../components/ContraReceiptPDF';
import DeletePopup from '../../components/Popup/DeletePopup.jsx';
import { usePermissions } from '../../context/PermissionContext';
import MobileCard from '../../components/common/MobileCard';

const ContraReciptList = () => {
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();
    const { setLoading } = useLoader();

    const canViewPending = hasPermission('Contra.Contra Receipt - Pending Contra Receipt List.View');
    const canViewCompleted = hasPermission('Contra.Contra Receipt - Completed Contra Receipt List.View');
    const canViewAll = hasPermission('Contra.Contra Receipt - Contra Receipt List.View');

    const [activeTab, setActiveTab] = useState(canViewPending ? 'outstanding' : (canViewCompleted ? 'completed' : (canViewAll ? 'all' : 'outstanding')));

    const hasActionPermission = (activeTab === 'outstanding' && (hasPermission('Contra.Contra Receipt - Pending Contra Receipt List.Edit') || hasPermission('Contra.Contra Receipt - Pending Contra Receipt List.Delete'))) ||
                                (activeTab === 'completed' && hasPermission('Contra.Contra Receipt - Completed Contra Receipt List.Export')) ||
                                (activeTab === 'all' && hasPermission('Contra.Contra Receipt - Contra Receipt List.Export'));
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [appliedFromDate, setAppliedFromDate] = useState('');
    const [appliedToDate, setAppliedToDate] = useState('');

    const [contras, setContras] = useState([]);
    const { items: sortedContras, requestSort, getSortDirection } = useSortableData(contras);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let endpoint = '/api/contra/contra-receipts/pending';
            if (activeTab === 'all') {
                endpoint = '/api/contra/contra-receipts/all-payments';
            } else if (activeTab === 'completed') {
                endpoint = '/api/contra/contra-receipts/completed';
            }
                
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL.trim()}${endpoint}`);
            const result = await response.json();
            if (result.status === 'success') {
                const data = result.data || [];
                
                if (activeTab === 'outstanding' || activeTab === 'completed') {
                    const mappedData = data.map(item => ({
                        ...item,
                        contraNo: item.id,
                        contraDate: item.contra_date,
                        name: item.name,
                        amount: parseFloat(item.contra_amount) || 0,
                        interest: parseFloat(item.contra_intrest) || 0,
                        balance: item.balance_amount || 0
                    })).reverse();
                    setContras(mappedData);
                } else {
                    const mappedData = data.map(item => ({
                        ...item,
                        contraNo: item.contraNo,
                        contraDate: item.contraDate,
                        receiptDate: item.receipt_date,
                        name: item.name,
                        amount: parseFloat(item.amount_paid) || 0,
                        paymentType: item.payment_type
                    })).reverse();
                    setContras(mappedData);
                }
            }
        } catch (error) {
            console.error("Error fetching contras:", error);
        } finally {
            setLoading(false);
        }
    }, [setLoading, activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const headers = {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL.trim()}/api/contra/contra/${pendingDeleteId}`, {
                method: 'DELETE',
                headers
            });
            const result = await response.json();
            if (result.status === 'success') {
                setContras(prev => prev.filter(c => c.id !== pendingDeleteId));
                setShowDeletePopup(false);
                fetchData();
            } else {
                console.error("Failed to delete contra:", result);
                alert(result.message || 'Failed to delete contra');
            }
        } catch (error) {
            console.error("Error deleting contra:", error);
            alert("Error deleting contra");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (c) => {
        setLoading(true);
        try {
            const blob = await pdf(<ContraReceiptPDF data={c} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `receipt-${c.contraNo || c.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to generate PDF:", err);
            alert("Failed to generate PDF");
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        setAppliedFromDate(fromDate);
        setAppliedToDate(toDate);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setFromDate('');
        setToDate('');
        setAppliedFromDate('');
        setAppliedToDate('');
        setCurrentPage(1);
    };

    const q = searchText.trim().toLowerCase();
    
    const from = appliedFromDate ? new Date(appliedFromDate) : null;
    if (from) from.setHours(0, 0, 0, 0);
    const to = appliedToDate ? new Date(appliedToDate) : null;
    if (to) to.setHours(23, 59, 59, 999);

    let filtered = sortedContras.filter(r => {
        let match = true;
        if (q) {
            match = String(r.contraNo || '').toLowerCase().includes(q) ||
                    String(r.name || '').toLowerCase().includes(q) ||
                    String(r.contraDate || '').toLowerCase().includes(q) ||
                    (activeTab === 'all' && String(r.receiptDate || '').toLowerCase().includes(q));
        }

        if (!match) return false;
        if (!from && !to) return true;

        let itemDateStr = r.contraDate;
        if (!itemDateStr) return true;

        let itemDate;
        if (itemDateStr.includes('/')) {
            const parts = itemDateStr.split(' ')[0].split('/');
            if (parts.length === 3) itemDate = new Date(parts[2], parts[1] - 1, parts[0]);
            else itemDate = new Date(itemDateStr);
        } else if (itemDateStr.includes('-')) {
            const parts = itemDateStr.split(' ')[0].split('-');
            if (parts[0].length === 2 && parts[2].length === 4) {
                itemDate = new Date(parts[2], parts[1] - 1, parts[0]);
            } else {
                itemDate = new Date(itemDateStr);
            }
        } else {
            itemDate = new Date(itemDateStr);
        }

        if (isNaN(itemDate.getTime())) return true;

        if (from && itemDate < from) return false;
        if (to && itemDate > to) return false;

        return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return (
        <>
            <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Contra Receipt List</h3>
                    </div>
                    <div className="card-body">
                        {/* Tabs */}
                        <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-2 tw-mb-3">
                            {canViewPending && (
                                <button
                                    type="button"
                                    className={`tw-px-4 tw-py-2 ${activeTab === 'outstanding' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setContras([]); setActiveTab('outstanding'); setCurrentPage(1); }}
                                >
                                    Pending Contra Receipt List
                                </button>
                            )}
                            {canViewCompleted && (
                                <button
                                    type="button"
                                    className={`tw-px-4 tw-py-2 ${activeTab === 'completed' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setContras([]); setActiveTab('completed'); setCurrentPage(1); }}
                                >
                                    Completed Contra Receipt List
                                </button>
                            )}
                            {canViewAll && (
                                <button
                                    type="button"
                                    className={`tw-px-4 tw-py-2 ${activeTab === 'all' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => { setContras([]); setActiveTab('all'); setCurrentPage(1); }}
                                >
                                    Contra Receipt List
                                </button>
                            )}
                        </div>

                        {/* Date Filter */}
                        <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-end tw-gap-4 tw-mb-4 tw-bg-white tw-p-0">
                            <div className="tw-w-full md:tw-w-auto">
                                <label className="tw-block tw-text-sm tw-font-semibold tw-text-gray-600 tw-mb-1">From Date</label>
                                <input 
                                    type="date" 
                                    className="form-control tw-h-10 tw-w-full md:tw-w-48 tw-text-gray-700" 
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                            <div className="tw-w-full md:tw-w-auto">
                                <label className="tw-block tw-text-sm tw-font-semibold tw-text-gray-600 tw-mb-1">To Date</label>
                                <input 
                                    type="date" 
                                    className="form-control tw-h-10 tw-w-full md:tw-w-48 tw-text-gray-700" 
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                            <div className="tw-flex tw-gap-3 tw-w-full md:tw-w-auto">
                                <button 
                                    type="button" 
                                    className="btn tw-bg-blue-600 tw-text-white hover:tw-bg-[#8a2be2] hover:tw-border-[#8a2be2] tw-h-10 tw-px-5 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-font-medium tw-shadow-sm tw-transition-colors tw-flex-1 md:tw-flex-none"
                                    onClick={handleFilter}
                                >
                                    <Funnel size={18} weight="regular" /> Filter
                                </button>
                                <button 
                                    type="button" 
                                    className="btn tw-bg-gray-100 tw-text-gray-700 hover:tw-bg-gray-200 tw-h-10 tw-px-5 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-font-medium tw-border-none tw-flex-1 md:tw-flex-none"
                                    onClick={handleReset}
                                >
                                    <ArrowCounterClockwise size={18} weight="regular" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Show / Search */}
                        <div className="list-top-bar tw-mb-4 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
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
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                <span className="tw-whitespace-nowrap">Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-flex-1 md:tw-w-48 tw-inline-block"
                                    value={searchText}
                                    onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        <div className="table-responsive tw-hidden md:tw-block">
                            <table className="table table-bordered table-striped no-margin">
                                {activeTab === 'outstanding' || activeTab === 'completed' ? (
                                    <>
                                        <thead>
                                            <tr>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                                    <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                                </th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('contraNo')}>
                                                    <div className="tw-flex tw-justify-between tw-items-center">Contra No <TableSortIcon direction={getSortDirection('contraNo')} /></div>
                                                </th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('contraDate')}>
                                                    <div className="tw-flex tw-justify-between tw-items-center">Contra Date <TableSortIcon direction={getSortDirection('contraDate')} /></div>
                                                </th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('name')}>
                                                    <div className="tw-flex tw-justify-between tw-items-center">Name <TableSortIcon direction={getSortDirection('name')} /></div>
                                                </th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('amount')}>
                                                    <div className="tw-flex tw-justify-between tw-items-center">Amount <TableSortIcon direction={getSortDirection('amount')} /></div>
                                                </th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('interest')}>
                                                    <div className="tw-flex tw-justify-between tw-items-center">Interest <TableSortIcon direction={getSortDirection('interest')} /></div>
                                                </th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('balance')}>
                                                    <div className="tw-flex tw-justify-between tw-items-center">Balance Amount <TableSortIcon direction={getSortDirection('balance')} /></div>
                                                </th>
                                                {hasActionPermission && (
<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                                    <div className="tw-flex tw-justify-between tw-items-center">Action <TableSortIcon /></div>
                                                </th>
)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginated.length > 0 ? (
                                                paginated.map((c, index) => (
                                                    <tr key={c.id}>
                                                        <td>{startIndex + index + 1}</td>
                                                        <td>{c.contraNo}</td>
                                                        <td>{c.contraDate}</td>
                                                        <td>{c.name}</td>
                                                        <td>{(c.amount || 0).toFixed(3)}</td>
                                                        <td>{(c.interest || 0).toFixed(3)}</td>
                                                        <td>{(c.balance || 0).toFixed(3)}</td>
                                                        {hasActionPermission && (
<td>
                                                            {activeTab === 'completed' ? (
                                                                    <div className="tw-flex tw-gap-2">
                                                                        {hasPermission('Contra.Contra Receipt - Completed Contra Receipt List.Export') && (
                                                                            <button type="button" className="list-action-btn btn-delete" title="Export PDF" onClick={() => handleDownloadPDF(c)}>
                                                                                <FilePdf weight="duotone" className="tw-w-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="tw-flex tw-gap-2">
                                                                        {hasPermission('Contra.Contra Receipt - Pending Contra Receipt List.Edit') && (
                                                                            <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/contra/edit/${c.id}`)}>
                                                                            <PencilSimpleIcon weight="bold" className="tw-w-4 tw-h-4" />
                                                                        </button>
                                                                        )}
                                                                        {hasPermission('Contra.Contra Receipt - Pending Contra Receipt List.Delete') && (
                                                                            <button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => handleDelete(c.id)}>
                                                                                <TrashIcon weight="duotone" className="tw-w-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
)}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={hasActionPermission ? 8 : 7} className="tw-text-center tw-py-4">No data available in table</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </>
                                ) : (
                                    <>
                                        <thead>
                                            <tr>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                                    <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon /></div>
                                                </th>
                                                {/* <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                                    <div className="tw-flex tw-justify-between tw-items-center">Contra No <TableSortIcon /></div>
                                                </th> */}
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                                    <div className="tw-flex tw-justify-between tw-items-center">Contra Date <TableSortIcon /></div>
                                                </th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                                    <div className="tw-flex tw-justify-between tw-items-center">Contra Receipt Date <TableSortIcon /></div>
                                                </th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                                    <div className="tw-flex tw-justify-between tw-items-center">Payment Type <TableSortIcon /></div>
                                                </th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                                    <div className="tw-flex tw-justify-between tw-items-center">Name <TableSortIcon /></div>
                                                </th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                                    <div className="tw-flex tw-justify-between tw-items-center">Amount <TableSortIcon /></div>
                                                </th>
                                                {hasPermission('Contra.Contra Receipt - Contra Receipt List.Export') && (
                                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                                        <div className="tw-flex tw-justify-between tw-items-center">Action <TableSortIcon /></div>
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginated.length > 0 ? (
                                                paginated.map((c, index) => (
                                                    <tr key={c.id}>
                                                        <td>{startIndex + index + 1}</td>
                                                        {/* <td>{c.contraNo}</td> */}
                                                        <td>{c.contraDate}</td>
                                                        <td>{c.receiptDate}</td>
                                                        <td>{c.paymentType}</td>
                                                        <td>{c.name}</td>
                                                        <td>{c.amount.toFixed(3)}</td>
                                                        {hasPermission('Contra.Contra Receipt - Contra Receipt List.Export') && (
                                                            <td>
                                                                <div className="tw-flex tw-gap-2">
                                                                    <button type="button" className="list-action-btn btn-delete" title="Export PDF" onClick={() => handleDownloadPDF(c)}>
                                                                        <FilePdf weight="duotone" className="tw-w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="tw-text-center tw-py-4">No data available in table</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </>
                                )}
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-grid md:tw-hidden tw-gap-4 tw-mt-4">
                            {paginated.length > 0 ? (
                                paginated.map((c, index) => {
                                    const isOutstanding = activeTab === 'outstanding' || activeTab === 'completed';
                                    return (
                                        <MobileCard key={c.id}>
                                            <MobileCard.Header label="Contra No" value={c.contraNo} />
                                            <MobileCard.Body>
                                                <MobileCard.Field label="Name" value={c.name} bold />
                                                <MobileCard.Field label="Contra Date" value={c.contraDate} />
                                                {!isOutstanding && <MobileCard.Field label="Receipt Date" value={c.receiptDate} />}
                                                {!isOutstanding && <MobileCard.Field label="Payment Type" value={c.paymentType} />}
                                                <MobileCard.Field label="Amount" value={(c.amount || 0).toFixed(3)} />
                                                {isOutstanding && <MobileCard.Field label="Interest" value={(c.interest || 0).toFixed(3)} />}
                                                {isOutstanding && <MobileCard.Field label="Balance Amount" value={(c.balance || 0).toFixed(3)} />}
                                            </MobileCard.Body>
                                            
                                            {(isOutstanding ? hasActionPermission : hasPermission('Contra.Contra Receipt - Contra Receipt List.Export')) && (
                                                <MobileCard.Footer>
                                                    <MobileCard.Actions>
                                                        {activeTab === 'completed' && hasPermission('Contra.Contra Receipt - Completed Contra Receipt List.Export') && (
                                                            <button type="button" className="list-action-btn btn-delete" title="Export PDF" onClick={() => handleDownloadPDF(c)}>
                                                                <FilePdf weight="duotone" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                        {activeTab === 'outstanding' && (
                                                            <>
                                                                {hasPermission('Contra.Contra Receipt - Pending Contra Receipt List.Edit') && (
                                                                    <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/contra/edit/${c.id}`)}>
                                                                    <PencilSimpleIcon weight="bold" className="tw-w-4 tw-h-4" />
                                                                </button>
                                                                )}
                                                                {hasPermission('Contra.Contra Receipt - Pending Contra Receipt List.Delete') && (
                                                                    <button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => handleDelete(c.id)}>
                                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                        {activeTab === 'all' && hasPermission('Contra.Contra Receipt - Contra Receipt List.Export') && (
                                                            <button type="button" className="list-action-btn btn-delete" title="Export PDF" onClick={() => handleDownloadPDF(c)}>
                                                                <FilePdf weight="duotone" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                    </MobileCard.Actions>
                                                </MobileCard.Footer>
                                            )}
                                        </MobileCard>
                                    );
                                })
                            ) : (
                                <div className="tw-text-center tw-py-4">No data available</div>
                            )}
                        </div>
                        
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-gray-600 tw-text-sm">
                                Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, total)} of {total} entries
                            </div>
                            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
            <DeletePopup 
                isOpen={showDeletePopup}
                onClose={() => setShowDeletePopup(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default ContraReciptList;
