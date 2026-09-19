import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLoader } from '../../context/LoaderContext';
import { usePermissions } from '../../context/PermissionContext';
import TableSortIcon from '../../components/TableSortIcon';
import SmartPagination from '../../components/SmartPagination';
import { useSortableData } from '../../hooks/useSortableData';
import MobileCard from '../../components/common/MobileCard';
import CashDiscountCollectPopup from '../../components/Popup/CashDiscountCollectPopup';
import RevertPopup from '../../components/Popup/RevertPopup';
import SuccessPopup from '../../components/Popup/SuccessPopup';
import ErrorPopup from '../../components/Popup/ErrorPopup';
import { CheckCircleIcon, PrinterIcon, ArrowBendUpLeftIcon as ArrowUUpLeft } from '@phosphor-icons/react';

export default function CashDiscountList() {
    const [data, setData] = useState([]);
    const [activeTab, setActiveTab] = useState('Pending'); // 'Pending' or 'Collected'
    const [revertPopupOpen, setRevertPopupOpen] = useState(false);
    const [revertId, setRevertId] = useState(null);
    const [successPopup, setSuccessPopup] = useState({ open: false, message: '' });
    const [errorPopup, setErrorPopup] = useState({ open: false, message: '' });
    const { setLoading } = useLoader();
    const { hasPermission } = usePermissions();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/cash-discount?status=${activeTab}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
            if (json.status === 'success') {
                const reversedData = [...(json.data || [])].sort((a, b) => b.id - a.id);
                const mappedData = reversedData.map(item => ({
                    id: item.id, // pending: enquiry id, collected: receipt id
                    enquiryId: item.enquiry_id || item.id, // For collected tab
                    enqNo: item.enquiry_number || '',
                    enqDate: item.enquiry_date ? item.enquiry_date.split(' ')[0] : '',
                    customerName: item.customer_name || '-',
                    engineerName: item.engineer_name || '-',
                    totalAmount: Number(item.total_amount || 0).toFixed(2),
                    cashDiscount: Number(item.cash_discount || 0).toFixed(2),
                    totalCollected: Number(item.total_collected || 0).toFixed(2),
                    remainingBalance: (Number(item.cash_discount || 0) - Number(item.total_collected || 0)).toFixed(2),
                    receiptNo: item.receipt_no || '-',
                    collectedDate: item.collected_date ? item.collected_date.split(' ')[0] : '-',
                    collectedAmount: Number(item.collected_amount || 0).toFixed(2)
                }));
                setData(mappedData);
            }
        } catch (error) {
            console.error('Error fetching cash discounts:', error);
        } finally {
            setLoading(false);
        }
    }, [setLoading, activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRevert = (id) => {
        setRevertId(id);
        setRevertPopupOpen(true);
    };

    const confirmRevert = async () => {
        if (!revertId) return;
        setRevertPopupOpen(false);
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/cash-discount/revert/${revertId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const json = await res.json();
            if (json.status === 'success') {
                setSuccessPopup({ open: true, message: json.message });
                fetchData();
            } else {
                setErrorPopup({ open: true, message: json.message });
            }
        } catch (error) {
            console.error('Error reverting:', error);
            setErrorPopup({ open: true, message: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
            setRevertId(null);
        }
    };

    const { items: sortedData, requestSort, getSortDirection } = useSortableData(data);

    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = useMemo(() => {
        const q = (searchText || '').toString().trim().toLowerCase();
        if (!q) return sortedData;
        return sortedData.filter(item => {
            return (
                (item.enqNo || '').toString().toLowerCase().includes(q) ||
                (item.enqDate || '').toString().toLowerCase().includes(q) ||
                (item.customerName || '').toString().toLowerCase().includes(q) ||
                (item.engineerName || '').toString().toLowerCase().includes(q) ||
                (item.receiptNo || '').toString().toLowerCase().includes(q)
            );
        });
    }, [sortedData, searchText]);

    const total = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize, searchText, activeTab]);

    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filteredData.slice(startIndex, startIndex + pageSize);

    // Popup State
    const [collectPopupOpen, setCollectPopupOpen] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    const handleCollectClick = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setCollectPopupOpen(true);
    };

    const handleCollectSuccess = () => {
        setCollectPopupOpen(false);
        setSelectedEnquiry(null);
        fetchData();
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
                        <h3 className="card-title tw-mb-0 max-[768px]:tw-text-center max-[768px]:tw-w-full max-[350px]:tw-text-sm">Cash (Discount) Unaccountable List</h3>
                    </div>
                    
                    <div className="card-body">
                        {/* Tabs */}
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 tw-mb-4">
                            <button
                                type="button"
                                className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'Pending' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                onClick={() => setActiveTab('Pending')}
                            >
                                Pending Cash
                            </button>
                            <button
                                type="button"
                                className={`tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base sm:tw-px-4 tw-rounded-sm tw-w-full sm:tw-w-auto tw-text-center tw-font-medium ${activeTab === 'Collected' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                onClick={() => setActiveTab('Collected')}
                            >
                                Receipts
                            </button>
                        </div>
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

                        <div className="tw-hidden md:tw-block">
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped no-margin">
                                    <thead>
                                        <tr>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('sno')}><div className="tw-flex tw-justify-between tw-items-center">S.No <TableSortIcon direction={getSortDirection('sno')} /></div></th>
                                            {activeTab === 'Collected' && (
                                                <>
                                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('receiptNo')}><div className="tw-flex tw-justify-between tw-items-center">Receipt No <TableSortIcon direction={getSortDirection('receiptNo')} /></div></th>
                                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('collectedDate')}><div className="tw-flex tw-justify-between tw-items-center">Collected Date <TableSortIcon direction={getSortDirection('collectedDate')} /></div></th>
                                                    <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('collectedAmount')}><div className="tw-flex tw-justify-between tw-items-center tw-justify-end">Collected Amount <TableSortIcon direction={getSortDirection('collectedAmount')} /></div></th>
                                                </>
                                            )}
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqNo')}><div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={getSortDirection('enqNo')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqDate')}><div className="tw-flex tw-justify-between tw-items-center">Enq. Date <TableSortIcon direction={getSortDirection('enqDate')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}><div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('engineerName')}><div className="tw-flex tw-justify-between tw-items-center">Engineer Name <TableSortIcon direction={getSortDirection('engineerName')} /></div></th>
                                            {/* <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('totalAmount')}><div className="tw-flex tw-justify-between tw-items-center tw-justify-end">Total Amount <TableSortIcon direction={getSortDirection('totalAmount')} /></div></th> */}
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('cashDiscount')}><div className="tw-flex tw-justify-between tw-items-center tw-justify-end">Cash (Discount) <TableSortIcon direction={getSortDirection('cashDiscount')} /></div></th>
                                            {activeTab === 'Pending' && (
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('remainingBalance')}><div className="tw-flex tw-justify-between tw-items-center tw-justify-end">Remaining Balance <TableSortIcon direction={getSortDirection('remainingBalance')} /></div></th>
                                            )}
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Action</div></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{startIndex + index + 1}</td>
                                                {activeTab === 'Collected' && (
                                                    <>
                                                        <td>{item.receiptNo}</td>
                                                        <td>{item.collectedDate}</td>
                                                        <td className="tw-text-right tw-font-medium tw-text-emerald-600">{item.collectedAmount}</td>
                                                    </>
                                                )}
                                                <td>{item.enqNo}</td>
                                                <td>{item.enqDate}</td>
                                                <td>{item.customerName}</td>
                                                <td>{item.engineerName}</td>
                                                {/* <td className="tw-text-right">{item.totalAmount}</td> */}
                                                <td className="tw-text-right">{item.cashDiscount}</td>
                                                {activeTab === 'Pending' && (
                                                    <td className="tw-text-right tw-font-medium tw-text-blue-600">{item.remainingBalance}</td>
                                                )}
                                                <td>
                                                    <div className="tw-flex tw-gap-2">
                                                        {activeTab === 'Pending' && hasPermission('Enquiry.Cash Discount - Pending List.Collect') && (
                                                            <button 
                                                                type="button" 
                                                                className="list-action-btn tw-bg-emerald-500 tw-text-white tw-border-0" 
                                                                title="Collect Cash"
                                                                onClick={() => handleCollectClick(item)}
                                                            >
                                                                <CheckCircleIcon weight="duotone" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                        {activeTab === 'Collected' && hasPermission('Enquiry.Cash Discount - Receipt List.Print') && (
                                                            <button 
                                                                type="button" 
                                                                className="list-action-btn btn-print tw-border-0" 
                                                                title="Print Receipt"
                                                                onClick={() => window.open(`/print/cash-discount/${item.id}`, '_blank')}
                                                            >
                                                                <PrinterIcon weight="duotone" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                        {activeTab === 'Collected' && hasPermission('Enquiry.Cash Discount - Receipt List.Print') && (
                                                            <button 
                                                                type="button" 
                                                                className="list-action-btn btn-delete tw-border-0" 
                                                                title="Revert Receipt"
                                                                onClick={() => handleRevert(item.id)}
                                                            >
                                                                <ArrowUUpLeft weight="bold" className="tw-w-4 tw-h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {paginated.length === 0 && (
                                            <tr>
                                                <td colSpan={activeTab === 'Collected' ? 10 : 8} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {paginated.map((item) => (
                                <MobileCard key={item.id}>
                                    <MobileCard.Header label="ENQ. NO" value={item.enqNo} />
                                    
                                    <MobileCard.Body>
                                        <div className="tw-flex tw-justify-between tw-items-start">
                                            <MobileCard.Field label="Customer Name" value={item.customerName} bold />
                                        </div>
                                        
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                            <MobileCard.Field label="Enq. Date" value={item.enqDate} />
                                            <MobileCard.Field label="Engineer Name" value={item.engineerName} align="right" />
                                        </div>
                                        
                                        {activeTab === 'Collected' && (
                                            <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2 tw-p-2 tw-bg-gray-50 tw-rounded-lg">
                                                <MobileCard.Field label="Receipt No" value={item.receiptNo} />
                                                <MobileCard.Field label="Collected Date" value={item.collectedDate} align="right" />
                                                <MobileCard.Field label="Collected Amount" value={item.collectedAmount} className="tw-text-emerald-600 tw-font-medium" />
                                            </div>
                                        )}
                                        
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                            {/* <MobileCard.Field label="Total Amount" value={item.totalAmount} /> */}
                                            <MobileCard.Field label="Cash (Discount)" value={item.cashDiscount} />
                                        </div>

                                        {activeTab === 'Pending' && (
                                            <div className="tw-grid tw-grid-cols-1 tw-gap-4 tw-mt-2 tw-p-2 tw-bg-blue-50 tw-rounded-lg">
                                                <MobileCard.Field label="Remaining Balance" value={item.remainingBalance} className="tw-text-blue-600 tw-font-bold" />
                                            </div>
                                        )}
                                    </MobileCard.Body>
                                    
                                    <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-justify-end tw-pt-2 tw-mt-1">
                                        <MobileCard.Actions>
                                            {activeTab === 'Pending' && hasPermission('Enquiry.Cash Discount - Pending List.Collect') && (
                                                <button 
                                                    type="button" 
                                                    className="list-action-btn tw-bg-emerald-500 tw-text-white tw-shadow-none" 
                                                    title="Collect Cash"
                                                    onClick={() => handleCollectClick(item)}
                                                >
                                                    <CheckCircleIcon weight="duotone" className="tw-w-4" />
                                                </button>
                                            )}
                                            {activeTab === 'Collected' && hasPermission('Enquiry.Cash Discount - Receipt List.Print') && (
                                                <button 
                                                    type="button" 
                                                    className="tw-flex tw-items-center tw-justify-center tw-w-10 tw-h-10 tw-rounded-full tw-bg-blue-50 tw-text-blue-600 tw-border-0" 
                                                    title="Print Receipt"
                                                    onClick={() => window.open(`/print/cash-discount/${item.id}`, '_blank')}
                                                >
                                                    <PrinterIcon weight="duotone" className="tw-w-5 tw-h-5" />
                                                </button>
                                            )}
                                            {activeTab === 'Collected' && hasPermission('Enquiry.Cash Discount - Receipt List.Print') && (
                                                <button 
                                                    type="button" 
                                                    className="tw-flex tw-items-center tw-justify-center tw-w-10 tw-h-10 tw-rounded-full tw-bg-red-50 tw-text-red-600 tw-border-0" 
                                                    title="Revert Receipt"
                                                    onClick={() => handleRevert(item.id)}
                                                >
                                                    <ArrowUUpLeft weight="bold" className="tw-w-5 tw-h-5" />
                                                </button>
                                            )}
                                        </MobileCard.Actions>
                                    </MobileCard.Footer>
                                </MobileCard>
                            ))}
                            
                            {paginated.length === 0 && (
                                <div className="tw-text-center tw-text-slate-400 tw-py-8 tw-bg-white tw-rounded-xl tw-border tw-border-gray-100">
                                    No records found
                                </div>
                            )}
                        </div>

                        <SmartPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            startIndex={startIndex}
                            entriesPerPage={pageSize}
                            totalEntries={total}
                        />

                    </div>
                </div>
            </div>
            
            <CashDiscountCollectPopup 
                isOpen={collectPopupOpen}
                onClose={() => {
                    setCollectPopupOpen(false);
                    setSelectedEnquiry(null);
                }}
                enquiryId={selectedEnquiry?.id}
                cashDiscountAmount={selectedEnquiry?.cashDiscount}
                remainingBalance={selectedEnquiry?.remainingBalance}
                onSuccess={handleCollectSuccess}
            />

            <RevertPopup
                isOpen={revertPopupOpen}
                onClose={() => { setRevertPopupOpen(false); setRevertId(null); }}
                onConfirm={confirmRevert}
                title="Revert Cash Discount"
                message="Are you sure you want to <strong style='color: #dc2626'>revert</strong> this cash discount?<br />It will be moved back to the Pending Cash list."
            />
            <SuccessPopup
                isOpen={successPopup.open}
                onClose={() => setSuccessPopup({ open: false, message: '' })}
                message={successPopup.message}
            />
            <ErrorPopup
                isOpen={errorPopup.open}
                onClose={() => setErrorPopup({ open: false, message: '' })}
                message={errorPopup.message}
            />
        </section>
    );
}
