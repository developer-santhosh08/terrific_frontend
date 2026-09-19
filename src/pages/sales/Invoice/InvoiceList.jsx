import { useLoader } from '../../../context/LoaderContext';
import SmartPagination from '../../../components/SmartPagination';
import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Funnel, ArrowBendUpLeftIcon, ArrowCounterClockwise, PencilSimple, Trash, Printer } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import ProductDetailsPopup from '../../../components/Popup/ProductDetailsPopup';
import RevertPopup from '../../../components/Popup/RevertPopup';
import SuccessPopup from '../../../components/Popup/SuccessPopup';
import ErrorPopup from '../../../components/Popup/ErrorPopup';
import MobileCard from '../../../components/common/MobileCard';
import { usePermissions } from '../../../context/PermissionContext';

const InvoiceList = () => {
    const { hasPermission, refreshPermissions } = usePermissions();
    const { setLoading } = useLoader();
    const navigate = useNavigate();
    const location = useLocation();
    const canViewInvoiceList = hasPermission('Sales.Invoice - Invoice List.View');
    const canViewInstallationList = hasPermission('Sales.Invoice - Installation List.View');
    const canViewCompletedList = hasPermission('Sales.Invoice - Completed List.View');

    const [activeTab, setActiveTab] = useState(() => {
        if (location.state?.activeTab) return location.state.activeTab;
        if (hasPermission('Sales.Invoice - Invoice List.View')) return 'invoiceList';
        if (hasPermission('Sales.Invoice - Installation List.View')) return 'installationList';
        if (hasPermission('Sales.Invoice - Completed List.View')) return 'completedInvoiceList';
        return 'invoiceList';
    });

    useEffect(() => {
        if (activeTab === 'invoiceList' && !canViewInvoiceList) {
            setActiveTab(canViewInstallationList ? 'installationList' : (canViewCompletedList ? 'completedInvoiceList' : 'invoiceList'));
        } else if (activeTab === 'installationList' && !canViewInstallationList) {
            setActiveTab(canViewInvoiceList ? 'invoiceList' : (canViewCompletedList ? 'completedInvoiceList' : 'installationList'));
        } else if (activeTab === 'completedInvoiceList' && !canViewCompletedList) {
            setActiveTab(canViewInvoiceList ? 'invoiceList' : (canViewInstallationList ? 'installationList' : 'completedInvoiceList'));
        }
    }, [canViewInvoiceList, canViewInstallationList, canViewCompletedList, activeTab]);
    const [isProductDetailsPopupOpen, setIsProductDetailsPopupOpen] = useState(false);
    const [selectedInstallationId, setSelectedInstallationId] = useState(null);

    const [isRevertPopupOpen, setIsRevertPopupOpen] = useState(false);
    const [revertId, setRevertId] = useState(null);
    const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [appliedFilter, setAppliedFilter] = useState({ fromDate: '', toDate: '' });
    const [installationList, setInstallationList] = useState([]);
    const [invoiceList, setInvoiceList] = useState([]);
    const [completedInvoiceList, setCompletedInvoiceList] = useState([]);

    const activeListData =
        activeTab === 'invoiceList' ? invoiceList :
            activeTab === 'installationList' ? installationList :
                completedInvoiceList;

    const filteredListData = useMemo(() => {
        if (!appliedFilter.fromDate && !appliedFilter.toDate) return activeListData;

        const from = appliedFilter.fromDate ? new Date(appliedFilter.fromDate) : null;
        if (from) from.setHours(0, 0, 0, 0);

        const to = appliedFilter.toDate ? new Date(appliedFilter.toDate) : null;
        if (to) to.setHours(23, 59, 59, 999);

        return activeListData.filter(item => {
            let itemDateStr;
            if (activeTab === 'invoiceList') {
                itemDateStr = item.enquiry_date || item.created_at || item.invoice_date || item.comt_date;
            } else if (activeTab === 'installationList') {
                itemDateStr = item.invoice_date;
            } else if (activeTab === 'completedInvoiceList') {
                itemDateStr = item.enq_date;
            }

            if (!itemDateStr) return true; // If we can't find a date field, don't filter it out

            let itemDate;
            if (itemDateStr.includes('/')) {
                const parts = itemDateStr.split(' ')[0].split('/');
                // Handle dd/mm/yyyy
                if (parts.length === 3) {
                    itemDate = new Date(parts[2], parts[1] - 1, parts[0]);
                } else {
                    itemDate = new Date(itemDateStr);
                }
            } else {
                itemDate = new Date(itemDateStr);
            }

            // Check if itemDate is valid
            if (isNaN(itemDate.getTime())) return true;

            if (from && itemDate < from) return false;
            if (to && itemDate > to) return false;
            return true;
        });
    }, [activeListData, appliedFilter, activeTab]);

    const activeTabLabel =
        activeTab === 'invoiceList' ? 'Invoice - Invoice List' :
        activeTab === 'installationList' ? 'Invoice - Installation List' :
        'Invoice - Completed List';

    const canEdit = hasPermission(`Sales.${activeTabLabel}.Edit`);
    const canPrint = hasPermission(`Sales.${activeTabLabel}.Print`);
    const canDelete = hasPermission(`Sales.${activeTabLabel}.Delete`);
    const canAdd = hasPermission(`Sales.${activeTabLabel}.Add`);
    const canRevert = hasPermission(`Sales.${activeTabLabel}.Revert`);

    const hasActionPermission = canEdit || canPrint || canDelete || canAdd || canRevert;

    const {
        sortConfig,
        handleSort,
        entriesPerPage,
        setEntriesPerPage,
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedData,
        startIndex,
        totalEntries
    } = useTableControls(filteredListData);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const [refreshTrigger, setRefreshTrigger] = useState(0);



    useEffect(() => {
        const fetchInstallationList = async () => {
            if (activeTab === 'installationList') {
                try {
                    setLoading(true);
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/installation-pending`);
                    const result = await res.json();
                    if (result.status && result.data) {
                        setInstallationList(result.data);
                    } else {
                        setInstallationList([]);
                    }
                } catch (error) {
                    console.error("Error fetching installation list:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchInstallationList();
    }, [activeTab, setLoading, refreshTrigger]);

    useEffect(() => {
        const fetchInvoiceList = async () => {
            if (activeTab === 'invoiceList') {
                try {
                    setLoading(true);
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices`);
                    const result = await res.json();
                    if (result.status && result.data) {
                        setInvoiceList(result.data);
                    } else {
                        setInvoiceList([]);
                    }
                } catch (error) {
                    console.error("Error fetching invoice list:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchInvoiceList();
    }, [activeTab, setLoading, refreshTrigger]);

    useEffect(() => {
        const fetchCompletedInvoiceList = async () => {
            if (activeTab === 'completedInvoiceList') {
                try {
                    setLoading(true);
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/completed`);
                    const result = await res.json();
                    if (result.status && result.data) {
                        setCompletedInvoiceList(result.data);
                    } else {
                        setCompletedInvoiceList([]);
                    }
                } catch (error) {
                    console.error("Error fetching completed invoice list:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchCompletedInvoiceList();
    }, [activeTab, setLoading, refreshTrigger]);

    const handleFilter = () => {
        setAppliedFilter({ fromDate, toDate });
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleReset = () => {
        setFromDate('');
        setToDate('');
        setAppliedFilter({ fromDate: '', toDate: '' });
        setCurrentPage(1); // Reset to first page
    };

    const renderActionButtons = (id) => (
        <div className="tw-flex tw-gap-2 tw-items-center">
            {canEdit && (
                <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/sales/invoice/edit/${id}`)}>
                    <PencilSimple weight="duotone" className="tw-w-4" />
                </button>
            )}
        </div>
    );

    const renderCompletedActionButtons = (id, has_return) => (
        <div className="tw-flex tw-gap-2 tw-items-center">
            {canAdd && (
                <button type="button" className="list-action-btn btn-success" title="Add" onClick={() => {
                    setSelectedInstallationId(id);
                    setIsProductDetailsPopupOpen(true);
                }}>
                    <Plus weight="bold" className="tw-w-4" />
                </button>
            )}
            {canEdit && !has_return && (
                <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/sales/complete-invoice/edit/${id}`)}>
                    <PencilSimple weight="duotone" className="tw-w-4" />
                </button>
            )}
            {canPrint && (
                <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/sales-invoice/${id}`, '_blank')}>
                    <Printer weight="duotone" className="tw-w-4" />
                </button>
            )}
        </div>
    );

    const handleRevertInstallation = (id) => {
        setRevertId(id);
        setIsRevertPopupOpen(true);
    };

    const confirmRevertInstallation = async () => {
        setIsRevertPopupOpen(false);
        try {
            setLoading(true);
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/installation-pending/revert/${revertId}`, {
                method: 'POST',
                headers:
                 token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await res.json();
            if (data.status) {
                setSuccessMessage(data.message || "Successfully reverted to Invoice List");
                setIsSuccessPopupOpen(true);
            } else {
                setErrorMessage(data.message || "Failed to revert");
                setIsErrorPopupOpen(true);
            }
        } catch (error) {
            console.error("Error reverting:", error);
            setErrorMessage("Failed to revert due to an error");
            setIsErrorPopupOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const renderInstallationActionButtons = (id) => (
        <div className="tw-flex tw-gap-2 tw-items-center">
            {canAdd && (
                <button type="button" className="list-action-btn btn-success" title="Add" onClick={() => {
                    setSelectedInstallationId(id);
                    setIsProductDetailsPopupOpen(true);
                }}>
                    <Plus weight="bold" className="tw-w-4" />
                </button>
            )}
            {canRevert && (
                <button type="button" className="list-action-btn btn-danger" title="Revert to Invoice List" onClick={() => handleRevertInstallation(id)}>
                    <ArrowBendUpLeftIcon weight="bold" className="tw-w-4" />
                </button>
            )}
            {canPrint && (
                <button type="button" className="list-action-btn btn-print" title="Print" onClick={() => window.open(`/print/sales-invoice/${id}`, '_blank')}>
                    <Printer weight="duotone" className="tw-w-4" />
                </button>
            )}
        </div>
    );

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Invoice List</h3>

                    </div>

                    <div className="card-body">
                        {/* Tabs */}
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 tw-mb-4">
                            {canViewInvoiceList && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'invoiceList' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => handleTabChange('invoiceList')}
                                >
                                    Invoice List
                                </button>
                            )}
                            {canViewInstallationList && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'installationList' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => handleTabChange('installationList')}
                                >
                                    Installation List
                                </button>
                            )}
                            {canViewCompletedList && (
                                <button
                                    type="button"
                                    className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'completedInvoiceList' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                    onClick={() => handleTabChange('completedInvoiceList')}
                                >
                                    Completed Invoice List
                                </button>
                            )}
                        </div>

                        {/* Filter Section */}
                        <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-end tw-gap-3 tw-mb-5">
                            <div className="tw-w-full sm:tw-w-auto">
                                <label className="tw-text-sm tw-text-gray-600 tw-mb-1 tw-block tw-font-medium">From Date</label>
                                <input
                                    type="date"
                                    className="form-control tw-w-full sm:tw-w-40"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                            <div className="tw-w-full sm:tw-w-auto">
                                <label className="tw-text-sm tw-text-gray-600 tw-mb-1 tw-block tw-font-medium">To Date</label>
                                <input
                                    type="date"
                                    className="form-control tw-w-full sm:tw-w-40"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                            <div className="tw-flex tw-gap-2 tw-mt-2 sm:tw-mt-0">
                                <button
                                    className="btn btn-primary d-flex align-items-center gap-1 tw-flex-1 sm:tw-flex-none tw-justify-center"
                                    onClick={handleFilter}
                                >
                                    <Funnel weight="bold" /> Filter
                                </button>
                                <button
                                    className="btn tw-bg-gray-100 tw-text-gray-700 hover:tw-bg-gray-200 tw-border tw-border-transparent d-flex align-items-center gap-1 tw-flex-1 sm:tw-flex-none tw-justify-center"
                                    onClick={handleReset}
                                >
                                    <ArrowCounterClockwise weight="bold" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Show / Search */}
                        <div className="list-top-bar tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-gap-3 sm:tw-gap-0 tw-mb-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-gray-600 tw-font-medium tw-w-16 sm:tw-w-auto tw-text-right">Show</span>
                                <select
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={entriesPerPage}
                                    onChange={e => setEntriesPerPage(e.target.value)}
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
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Tables */}
                        <div className="tw-hidden md:tw-block">
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped no-margin">
                                    <thead>
                                        {activeTab === 'invoiceList' && (
                                            <tr>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center"># </div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('enq_no')}><div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={sortConfig.key === 'enq_no' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('engineer_name')}><div className="tw-flex tw-justify-between tw-items-center">Engineer Name <TableSortIcon direction={sortConfig.key === 'engineer_name' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('customer_name')}><div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={sortConfig.key === 'customer_name' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('mobile')}><div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={sortConfig.key === 'mobile' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('current_stage')}><div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={sortConfig.key === 'current_stage' ? sortConfig.direction : null} /></div></th>
                                                {hasActionPermission && (
                                                    <th className="tw-align-middle"><div className="tw-flex tw-justify-between tw-items-center">Action </div></th>
                                                )}
                                            </tr>
                                        )}
                                        {activeTab === 'installationList' && (
                                            <tr>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center"># </div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('enq_no')}><div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={sortConfig.key === 'enq_no' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('invoice_no')}><div className="tw-flex tw-justify-between tw-items-center">Invoice No <TableSortIcon direction={sortConfig.key === 'invoice_no' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('invoice_date')}><div className="tw-flex tw-justify-between tw-items-center">Invoice Date <TableSortIcon direction={sortConfig.key === 'invoice_date' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('engineer_name')}><div className="tw-flex tw-justify-between tw-items-center">Engineer Name <TableSortIcon direction={sortConfig.key === 'engineer_name' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('comt_date')}><div className="tw-flex tw-justify-between tw-items-center">Comt Date <TableSortIcon direction={sortConfig.key === 'comt_date' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('customer_name')}><div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={sortConfig.key === 'customer_name' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('mobile')}><div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={sortConfig.key === 'mobile' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('current_stage')}><div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={sortConfig.key === 'current_stage' ? sortConfig.direction : null} /></div></th>
                                                {hasActionPermission && (
                                                    <th className="tw-align-middle"><div className="tw-flex tw-justify-between tw-items-center">Action </div></th>
                                                )}
                                            </tr>
                                        )}
                                        {activeTab === 'completedInvoiceList' && (
                                            <tr>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center"># </div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('enquiry_no')}><div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={sortConfig.key === 'enquiry_no' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('inv_no')}><div className="tw-flex tw-justify-between tw-items-center">Inv. No <TableSortIcon direction={sortConfig.key === 'inv_no' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('enq_date')}><div className="tw-flex tw-justify-between tw-items-center">Enq. Date <TableSortIcon direction={sortConfig.key === 'enq_date' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('customer_name')}><div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={sortConfig.key === 'customer_name' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('mobile')}><div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={sortConfig.key === 'mobile' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('amount')}><div className="tw-flex tw-justify-between tw-items-center">Amount <TableSortIcon direction={sortConfig.key === 'amount' ? sortConfig.direction : null} /></div></th>
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('current_stage')}><div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={sortConfig.key === 'current_stage' ? sortConfig.direction : null} /></div></th>
                                                {hasActionPermission && (
                                                    <th className="tw-align-middle"><div className="tw-flex tw-justify-between tw-items-center">Action </div></th>
                                                )}
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody>
                                        {activeTab === 'invoiceList' && (
                                            <>
                                                {paginatedData.length > 0 ? (
                                                    paginatedData.map((item, index) => (
                                                        <tr key={item.enquiry_header_id || index}>
                                                            <td className="tw-align-middle">{startIndex + index}</td>
                                                            <td className="tw-align-middle">{item.enq_no || ''}</td>
                                                            <td className="tw-align-middle">{item.engineer_name || ''}</td>
                                                            <td className="tw-align-middle">{item.customer_name || ''}</td>
                                                            <td className="tw-align-middle">{item.mobile || ''}</td>
                                                            <td className="tw-align-middle"><span className="badge bg-info">{item.current_stage || 'Pending'}</span></td>
                                                            {hasActionPermission && (
                                                                <td className="tw-align-middle">{renderActionButtons(item.enquiry_header_id)}</td>
                                                            )}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="text-center tw-py-4">No invoices found</td>
                                                    </tr>
                                                )}
                                            </>
                                        )}
                                        {activeTab === 'installationList' && (
                                            <>
                                                {paginatedData.length > 0 ? (
                                                    paginatedData.map((item, index) => (
                                                        <tr key={item.id || index}>
                                                            <td className="tw-align-middle">{startIndex + index}</td>
                                                            <td className="tw-align-middle">{item.enq_no || ''}</td>
                                                            <td className="tw-align-middle">{item.invoice_no || ''}</td>
                                                            <td className="tw-align-middle">{item.invoice_date || ''}</td>
                                                            <td className="tw-align-middle">{item.engineer_name || ''}</td>
                                                            <td className="tw-align-middle">{item.comt_date || ''}</td>
                                                            <td className="tw-align-middle">{item.customer_name || ''}</td>
                                                            <td className="tw-align-middle">{item.mobile || ''}</td>
                                                            <td className="tw-align-middle"><span className="badge bg-warning">{item.current_stage || 'Pending'}</span></td>
                                                            {hasActionPermission && (
                                                                <td className="tw-align-middle">{renderInstallationActionButtons(item.enquiry_header_id || item.id)}</td>
                                                            )}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="11" className="text-center tw-py-4">No pending installations</td>
                                                    </tr>
                                                )}
                                            </>
                                        )}
                                        {activeTab === 'completedInvoiceList' && (
                                            <>
                                                {paginatedData.length > 0 ? (
                                                    paginatedData.map((item, index) => (
                                                        <tr key={item.id || index}>
                                                            <td className="tw-align-middle">{startIndex + index}</td>
                                                            <td className="tw-align-middle">{item.enquiry_no || ''}</td>
                                                            <td className="tw-align-middle">{item.inv_no || ''}</td>
                                                            <td className="tw-align-middle">{item.enq_date || ''}</td>
                                                            <td className="tw-align-middle">{item.customer_name || ''}</td>
                                                            <td className="tw-align-middle">{item.mobile || ''}</td>
                                                            <td className="tw-align-middle">₹ {item.amount || ''}</td>
                                                            <td className="tw-align-middle"><span className="badge" style={{ backgroundColor: item.stage_color || '#0ea5e9', color: '#fff' }}>{item.current_stage || 'Completed'}</span></td>
                                                            {hasActionPermission && (
                                                                <td className="tw-align-middle">{renderCompletedActionButtons(item.enquiry_header_id || item.id, item.has_return)}</td>
                                                            )}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="9" className="text-center tw-py-4">No completed invoices</td>
                                                    </tr>
                                                )}
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile View */}
                        <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
                            {activeTab === 'invoiceList' && (
                                <>
                                    {paginatedData.map((item, index) => (
                                        <MobileCard key={item.enquiry_header_id || index}>
                                            <MobileCard.Header label="ENQ. NO" value={item.enq_no} />
                                            <MobileCard.Body>
                                                <MobileCard.Field label="Customer Name" value={item.customer_name} bold valueColor="blue" />
                                                <MobileCard.Field label="Engineer Name" value={item.engineer_name} />
                                                <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                                    <MobileCard.Field label="Mobile" value={item.mobile || '-'} valueColor="blue" />
                                                </div>
                                            </MobileCard.Body>
                                            <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                                <div className="tw-flex tw-gap-4 tw-w-full">
                                                    <div className="tw-flex tw-flex-col tw-gap-1">
                                                        <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Stage</span>
                                                        <div><span className="badge bg-info">{item.current_stage || 'Pending'}</span></div>
                                                    </div>
                                                </div>
                                                {hasActionPermission && (
                                                    <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                                        <MobileCard.Actions>
                                                            {renderActionButtons(item.enquiry_header_id)}
                                                        </MobileCard.Actions>
                                                    </div>
                                                )}
                                            </MobileCard.Footer>
                                        </MobileCard>
                                    ))}
                                    {paginatedData.length === 0 && (
                                        <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                                            No invoices found
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {activeTab === 'installationList' && (
                                <>
                                    {paginatedData.map((item, index) => (
                                        <MobileCard key={item.id || index}>
                                            <MobileCard.Header label="ENQ. NO" value={item.enq_no} />
                                            <MobileCard.Body>
                                                <MobileCard.Field label="Customer Name" value={item.customer_name} bold valueColor="blue" />
                                                
                                                <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                                    <MobileCard.Field label="Invoice No" value={item.invoice_no || '-'} />
                                                    <MobileCard.Field label="Invoice Date" value={item.invoice_date || '-'} align="right" />
                                                    <MobileCard.Field label="Engineer Name" value={item.engineer_name || '-'} />
                                                    <MobileCard.Field label="Comt Date" value={item.comt_date || '-'} align="right" />
                                                    <MobileCard.Field label="Mobile" value={item.mobile || '-'} valueColor="blue" />
                                                </div>
                                            </MobileCard.Body>
                                            
                                            <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                                <div className="tw-flex tw-gap-4 tw-w-full">
                                                    <div className="tw-flex tw-flex-col tw-gap-1">
                                                        <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Stage</span>
                                                        <div><span className="badge bg-warning">{item.current_stage || 'Pending'}</span></div>
                                                    </div>
                                                </div>
                                                
                                                {hasActionPermission && (
                                                    <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                                        <MobileCard.Actions>
                                                            {renderInstallationActionButtons(item.enquiry_header_id || item.id)}
                                                        </MobileCard.Actions>
                                                    </div>
                                                )}
                                            </MobileCard.Footer>
                                        </MobileCard>
                                    ))}
                                    
                                    {paginatedData.length === 0 && (
                                        <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                                            No pending installations
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'completedInvoiceList' && (
                                <>
                                    {paginatedData.map((item, index) => (
                                        <MobileCard key={item.id || index}>
                                            <MobileCard.Header label="ENQ. NO" value={item.enquiry_no} />
                                            <MobileCard.Body>
                                                <MobileCard.Field label="Customer Name" value={item.customer_name} bold valueColor="blue" />
                                                
                                                <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                                    <MobileCard.Field label="Inv. No" value={item.inv_no || '-'} />
                                                    <MobileCard.Field label="Enq. Date" value={item.enq_date || '-'} align="right" />
                                                    <MobileCard.Field label="Mobile" value={item.mobile || '-'} valueColor="blue" />
                                                    <MobileCard.Field label="Amount" value={`₹ ${item.amount || ''}`} align="right" bold />
                                                </div>
                                            </MobileCard.Body>
                                            
                                            <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                                <div className="tw-flex tw-gap-4 tw-w-full">
                                                    <div className="tw-flex tw-flex-col tw-gap-1">
                                                        <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Stage</span>
                                                        <div><span className="badge" style={{ backgroundColor: item.stage_color || '#0ea5e9', color: '#fff' }}>{item.current_stage || 'Completed'}</span></div>
                                                    </div>
                                                </div>
                                                
                                                {hasActionPermission && (
                                                    <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                                        <MobileCard.Actions>
                                                            {renderCompletedActionButtons(item.enquiry_header_id || item.id, item.has_return)}
                                                        </MobileCard.Actions>
                                                    </div>
                                                )}
                                            </MobileCard.Footer>
                                        </MobileCard>
                                    ))}
                                    
                                    {paginatedData.length === 0 && (
                                        <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                                            No completed invoices
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <SmartPagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            startIndex={startIndex - 1} // The original has startIndex as 1-based, SmartPagination expects 0-based
                            entriesPerPage={entriesPerPage}
                            totalEntries={totalEntries}
                        />
                    </div>
                </div>
            </div>

            <ProductDetailsPopup
                isOpen={isProductDetailsPopupOpen}
                isReadOnly={activeTab === 'completedInvoiceList'}
                onClose={(refresh) => {
                    setIsProductDetailsPopupOpen(false);
                    setSelectedInstallationId(null);
                    if (refresh) setRefreshTrigger(prev => prev + 1);
                }}
                installationId={selectedInstallationId}
            />
            <RevertPopup
                isOpen={isRevertPopupOpen}
                onClose={() => setIsRevertPopupOpen(false)}
                onConfirm={confirmRevertInstallation}
                title="Revert Installation"
                message="Are you sure you want to revert this to the Invoice List?"
            />
            <SuccessPopup
                isOpen={isSuccessPopupOpen}
                onClose={() => {
                    setIsSuccessPopupOpen(false);
                    window.location.reload();
                }}
                message={successMessage}
            />
            <ErrorPopup
                isOpen={isErrorPopupOpen}
                onClose={() => setIsErrorPopupOpen(false)}
                message={errorMessage}
            />
        </section>
    );
};

export default InvoiceList;
