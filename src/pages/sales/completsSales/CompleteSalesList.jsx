import { useLoader } from '../../../context/LoaderContext';
import Pagination from '../../../components/Pagination';
import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TableSortIcon from '../../../components/TableSortIcon';
import MobileCard from '../../../components/common/MobileCard';
import ReturnSalePopup from '../../../components/Popup/ReturnSalePopup';
import { ArrowCounterClockwise, Printer } from '@phosphor-icons/react';

const CompleteSalesList = () => {
    const { setLoading } = useLoader();
    const [salesData, setSalesData] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const getSortDirection = (key) => sortConfig.key === key ? sortConfig.direction : null;

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isReturnPopupOpen, setIsReturnPopupOpen] = useState(false);
    const [selectedReturnInvoiceId, setSelectedReturnInvoiceId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/receipts/completed`, { headers });
                const json = await response.json();
                if (json.status && json.data) {
                    setSalesData(json.data);
                }
            } catch (error) {
                console.error("Error fetching completed sales data:", error);
            } finally {
                setLoading(false);
            }
            
        };
        fetchData();
    }, [setLoading, refreshTrigger]);

    const filteredData = useMemo(() => {
        let data = [...salesData];
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(item => 
                String(item.enq_no || '').toLowerCase().includes(lowerSearch) ||
                String(item.customer_name || '').toLowerCase().includes(lowerSearch) ||
                String(item.mobile || '').toLowerCase().includes(lowerSearch)
            );
        }
        if (sortConfig.key) {
            data.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [searchTerm, sortConfig, salesData]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    return (
        <section className="content">
            <style>{`
                .sv-action-icon {
                    width: 32px; height: 32px; border-radius: 4px; border: none;
                    display: inline-flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background-color .12s ease;
                }
                .sv-action-icon:focus { outline: none; }
                .sv-edit  { background-color: #3b82f6; color: #ffffff; }
                .sv-edit:hover  { background-color: #2563eb; }
            `}</style>
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Completed Sales List</h3>
                    </div>
                    
                    <div className="card-body">
                        {/* Table Controls */}
                        <div className="list-top-bar tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-gap-3 sm:tw-gap-0 tw-mb-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-gray-600 tw-font-medium tw-w-16 sm:tw-w-auto tw-text-right">Show</span>
                                <select 
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
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
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="tw-hidden md:tw-block">
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped no-margin">
                                    <thead>
                                        <tr>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('id')}>
                                                <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('enqNo')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={getSortDirection('enqNo')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('balance')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Balance <TableSortIcon direction={getSortDirection('balance')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('paid')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Paid <TableSortIcon direction={getSortDirection('paid')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('customerName')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('mobile')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('currentStage')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div>
                                            </th>
                                            <th className="tw-align-middle">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((item, idx) => (
                                            <tr key={item.invoice_id}>
                                                <td>{startIndex + idx + 1}</td>
                                                <td>{item.enq_no}</td>
                                                <td>{item.balance_amount}</td>
                                                <td>{item.paid_amount}</td>
                                                <td>{item.customer_name}</td>
                                                <td>{item.mobile}</td>
                                                <td>
                                                    <span className="badge tw-bg-green-500 tw-text-white tw-px-2 tw-py-1">
                                                        {item.current_stage || 'Completed'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button 
                                                            className="sv-action-icon sv-view tw-bg-purple-500 tw-text-white hover:tw-bg-purple-600"
                                                            title="View"
                                                            onClick={() => navigate(`/sales/complete-sales/view/${item.enquiry_id || item.invoice_id}`)}
                                                        >                                                      
                                                            <i className="bi bi-eye" />
                                                        </button>
                                                        {!item.has_return ? (
                                                            <button 
                                                                className="sv-action-icon tw-bg-red-500 tw-text-white hover:tw-bg-red-600"
                                                                title="Return Sale"
                                                                onClick={() => {
                                                                    setSelectedReturnInvoiceId(item.invoice_id);
                                                                    setIsReturnPopupOpen(true);
                                                                }}
                                                            >
                                                                <ArrowCounterClockwise weight="bold" />
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className="sv-action-icon tw-bg-blue-500 tw-text-white hover:tw-bg-blue-600"
                                                                title="Print Return Receipt"
                                                                onClick={() => window.open(`/print/return-receipt/${item.invoice_id}`, '_blank')}
                                                            >
                                                                <Printer weight="bold" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {paginatedData.length === 0 && (
                                            <tr>
                                                <td colSpan="8" className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile View */}
                        <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
                            {paginatedData.map((item, idx) => (
                                <MobileCard key={item.invoice_id || idx}>
                                    <MobileCard.Header label="ENQ. NO" value={item.enq_no} />
                                    <MobileCard.Body>
                                        <MobileCard.Field label="Customer Name" value={item.customer_name} bold valueColor="blue" />
                                        
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                            <MobileCard.Field label="Mobile" value={item.mobile || '-'} />
                                            <MobileCard.Field label="Balance" value={item.balance_amount || '0'} valueColor="red" bold align="right" />
                                            <MobileCard.Field label="Paid" value={item.paid_amount || '0'} valueColor="green" bold />
                                        </div>
                                    </MobileCard.Body>
                                    <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                        <div className="tw-flex tw-gap-4 tw-w-full">
                                            <div className="tw-flex tw-flex-col tw-gap-1">
                                                <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Current Stage</span>
                                                <div>
                                                    <span className="badge tw-bg-green-500 tw-text-white tw-px-2 tw-py-1">
                                                        {item.current_stage || 'Completed'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                            <MobileCard.Actions>
                                                <button 
                                                    className="sv-action-icon sv-view tw-bg-purple-500 tw-text-white hover:tw-bg-purple-600"
                                                    title="View"
                                                    onClick={() => navigate(`/sales/complete-sales/view/${item.enquiry_id || item.invoice_id}`)}
                                                >                                                      
                                                    <i className="bi bi-eye" />
                                                </button>
                                                {!item.has_return ? (
                                                    <button 
                                                        className="sv-action-icon tw-bg-red-500 tw-text-white hover:tw-bg-red-600"
                                                        title="Return Sale"
                                                        onClick={() => {
                                                            setSelectedReturnInvoiceId(item.invoice_id);
                                                            setIsReturnPopupOpen(true);
                                                        }}
                                                    >
                                                        <ArrowCounterClockwise weight="bold" />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="sv-action-icon tw-bg-blue-500 tw-text-white hover:tw-bg-blue-600"
                                                        title="Print Return Receipt"
                                                        onClick={() => window.open(`/print/return-receipt/${item.invoice_id}`, '_blank')}
                                                    >
                                                        <Printer weight="bold" />
                                                    </button>
                                                )}
                                            </MobileCard.Actions>
                                        </div>
                                    </MobileCard.Footer>
                                </MobileCard>
                            ))}
                            {paginatedData.length === 0 && (
                                <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                                    No records found
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-sm tw-text-slate-500">
                                Showing {paginatedData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                            </div>
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>

                    </div>
                </div>
            </div>
            
            {isReturnPopupOpen && (
                <ReturnSalePopup
                    isOpen={isReturnPopupOpen}
                    onClose={(refresh) => {
                        setIsReturnPopupOpen(false);
                        setSelectedReturnInvoiceId(null);
                        if (refresh) setRefreshTrigger(prev => prev + 1);
                    }}
                    invoiceId={selectedReturnInvoiceId}
                />
            )}
        </section>
    );
};

export default CompleteSalesList;
