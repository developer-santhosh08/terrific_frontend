import { useLoader } from '../../../context/LoaderContext';
import SmartPagination from '../../../components/SmartPagination';
import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, ArrowBendUpLeftIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import RevertPopup from '../../../components/Popup/RevertPopup';
import { usePermissions } from '../../../context/PermissionContext';
import MobileCard from '../../../components/common/MobileCard';

const ClosedEnquiryList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Sales.Closed Enquiry.Revert');
    const { setLoading } = useLoader();
    const [closedData, setClosedData] = useState([]);
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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [custRes, stageRes, res] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/customer`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/terrific_stages`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/enquiry/status/closed`)
                ]);

                const [custJson, stageJson, json] = await Promise.all([
                    custRes.json(),
                    stageRes.json(),
                    res.json()
                ]);

                const custMap = {};
                if (custJson.status && custJson.data) custJson.data.forEach(c => custMap[c.id] = c.name);

                const stageMap = {};
                if (stageJson.status && stageJson.data) stageJson.data.forEach(s => stageMap[s.id] = s.name);

                if (json.status === 'success' && json.data) {
                    const mappedData = json.data.map(item => ({
                        id: item.id,
                        enqNo: item.enquiry_number || '',
                        enqDate: item.enquiry_date || '',
                        customerName: custMap[item.customer_id] || item.cust_contact_name || item.customer_id || 'Unknown',
                        mobile: item.mobile_number1 || '',
                        nextFollowUpDate: item.last_committed_date || '',
                        currentStage: item.current_stage || stageMap[item.stage_id] || 'Closed'
                    }));
                    setClosedData(mappedData);
                }
            } catch (err) {
                console.error('Error fetching closed data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setLoading]);

    const [revertPopupOpen, setRevertPopupOpen] = useState(false);
    const [enquiryToRevert, setEnquiryToRevert] = useState(null);

    const confirmRevert = (id) => {
        setEnquiryToRevert(id);
        setRevertPopupOpen(true);
    };

    const handleRevert = async () => {
        if (!enquiryToRevert) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/enquiry/${enquiryToRevert}/revert`, {
                method: 'PUT'
            });
            const json = await res.json();
            if (json.status === 'success') {
                setRevertPopupOpen(false);
                setClosedData(prev => prev.filter(item => item.id !== enquiryToRevert));
                setEnquiryToRevert(null);
            } else {
                alert(json.message || 'Failed to revert enquiry');
            }
        } catch (err) {
            console.error('Error reverting enquiry:', err);
            alert('An error occurred while reverting the enquiry');
        }
    };


    const filteredData = useMemo(() => {
        let data = [...closedData];
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(item =>
                item.enqNo?.toLowerCase().includes(lowerSearch) ||
                item.customerName?.toLowerCase().includes(lowerSearch) ||
                item.mobile?.toLowerCase().includes(lowerSearch) ||
                item.currentStage?.toLowerCase().includes(lowerSearch)
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
    }, [searchTerm, sortConfig, closedData]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    return (
        <section className="content">
            <style>{`
                .ce-action-icon {
                    width: 32px; height: 32px; border-radius: 4px; border: none;
                    display: inline-flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background-color .12s ease;
                }
                .ce-action-icon:focus { outline: none; }
                .ce-edit   { background-color: #3b82f6; color: #ffffff; }
                .ce-edit:hover   { background-color: #2563eb; }
                .ce-delete { background-color: #ef4444; color: #ffffff; }
                .ce-delete:hover { background-color: #dc2626; }
            `}</style>
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Closed Enquiry List</h3>
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
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('enqDate')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Enq. Date <TableSortIcon direction={getSortDirection('enqDate')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('customerName')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('mobile')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('nextFollowUpDate')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Next FollowUp Date <TableSortIcon direction={getSortDirection('nextFollowUpDate')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('currentStage')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div>
                                            </th>
                                            {hasActionPermission && <th className="tw-align-middle">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((row, idx) => (
                                            <tr key={row.id}>
                                                <td>{startIndex + idx + 1}</td>
                                                <td>{row.enqNo}</td>
                                                <td>{row.enqDate}</td>
                                                <td>{row.customerName}</td>
                                                <td>{row.mobile}</td>
                                                <td>{row.nextFollowUpDate}</td>
                                                <td>
                                                    <span className="tw-bg-red-500 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-semibold">
                                                        {row.currentStage}
                                                    </span>
                                                </td>
                                                {hasActionPermission && (
                                                    <td>
                                                        <div className="tw-flex tw-gap-2 tw-items-center">
                                                            {hasPermission('Sales.Closed Enquiry.Revert') && (
                                                                <button
                                                                    type="button"
                                                                    className="list-action-btn btn-delete"
                                                                    title="Revert Enquiry"
                                                                    onClick={() => confirmRevert(row.id)}
                                                                >
                                                                    <ArrowBendUpLeftIcon weight="duotone" className="tw-w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        {paginatedData.length === 0 && (
                                            <tr>
                                                <td colSpan={hasActionPermission ? 8 : 7} className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile View */}
                        <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
                            {paginatedData.map((row, idx) => (
                                <MobileCard key={row.id || idx}>
                                    <MobileCard.Header label="ENQ. NO" value={row.enqNo} />
                                    <MobileCard.Body>
                                        <MobileCard.Field label="Customer Name" value={row.customerName} bold valueColor="blue" />
                                        
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                            <MobileCard.Field label="Enq Date" value={row.enqDate || '-'} />
                                            <MobileCard.Field label="Mobile" value={row.mobile || '-'} align="right" />
                                            <MobileCard.Field label="Next FollowUp" value={row.nextFollowUpDate || '-'} />
                                        </div>
                                    </MobileCard.Body>
                                    <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                        <div className="tw-flex tw-gap-4 tw-w-full">
                                            <div className="tw-flex tw-flex-col tw-gap-1">
                                                <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Current Stage</span>
                                                <div>
                                                    <span className="tw-bg-red-500 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-semibold">
                                                        {row.currentStage || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {hasActionPermission && (
                                            <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                                <MobileCard.Actions>
                                                    {hasPermission('Sales.Closed Enquiry.Revert') && (
                                                        <button
                                                            type="button"
                                                            className="list-action-btn btn-delete"
                                                            title="Revert Enquiry"
                                                            onClick={() => confirmRevert(row.id)}
                                                        >
                                                            <ArrowBendUpLeftIcon weight="duotone" className="tw-w-4" />
                                                        </button>
                                                    )}
                                                </MobileCard.Actions>
                                            </div>
                                        )}
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
                        <SmartPagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            startIndex={startIndex}
                            entriesPerPage={itemsPerPage}
                            totalEntries={filteredData.length}
                        />

                        {/* Revert Popup */}
                        <RevertPopup
                            isOpen={revertPopupOpen}
                            onClose={() => setRevertPopupOpen(false)}
                            onConfirm={handleRevert}
                        />

                    </div>
                </div>
            </div>
        </section>
    );
};

export default ClosedEnquiryList;
