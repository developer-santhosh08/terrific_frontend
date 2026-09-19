import { useLoader } from '../../../context/LoaderContext';
import Pagination from '../../../components/Pagination';
import { useTableControls } from '../../../hooks/useTableControls';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TableSortIcon from '../../../components/TableSortIcon';
import DeletePopup from '../../../components/Popup/DeletePopup';
import { usePermissions } from '../../../context/PermissionContext';
import MobileCard from '../../../components/common/MobileCard';

const UnallottedEnquiryList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Sales.Unallotted Enquiry.Edit') || hasPermission('Sales.Unallotted Enquiry.Delete');
    const { setLoading } = useLoader();
    const [unallottedData, setUnallottedData] = useState([]);
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
                const token = sessionStorage.getItem('erp_token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/enquiries/unalloted`, { headers });
                const json = await response.json();
                if (json.status && json.data) {
                    setUnallottedData(json.data);
                }
            } catch (error) {
                console.error("Error fetching unallotted enquiries:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setLoading]);

    const filteredData = useMemo(() => {
        let data = [...unallottedData];
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(item =>
                String(item.enq_no || '').toLowerCase().includes(lowerSearch) ||
                String(item.customer_name || '').toLowerCase().includes(lowerSearch) ||
                String(item.mobile || '').toLowerCase().includes(lowerSearch) ||
                String(item.business_vertical || '').toLowerCase().includes(lowerSearch)
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
    }, [searchTerm, sortConfig, unallottedData]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const [deletePopupOpen, setDeletePopupOpen] = useState(false);
    const [enquiryToDelete, setEnquiryToDelete] = useState(null);

    const confirmDelete = (id) => {
        setEnquiryToDelete(id);
        setDeletePopupOpen(true);
    };

    const handleDelete = async () => {
        if (!enquiryToDelete) return;
        try {
            const token = sessionStorage.getItem('erp_token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/enquiry/${enquiryToDelete}`, {
                method: 'DELETE',
                headers
            });
            const json = await response.json();
            if (json.status === 'success') {
                setUnallottedData(prev => prev.filter(item => item.enquiry_id !== enquiryToDelete));
                setDeletePopupOpen(false);
                setEnquiryToDelete(null);
            } else {
                alert(json.message || 'Failed to delete enquiry');
            }
        } catch (error) {
            console.error("Error deleting enquiry:", error);
            alert("Error deleting enquiry");
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-3">
                        <h3 className="card-title tw-m-0 tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Unallotted Enquiry List</h3>
                        {hasPermission('Enquiry.Enquiry.Add') && (
                            <button className="btn-create tw-w-full sm:tw-w-auto" onClick={() => navigate('/enquiry/add')}>
                                 Create New Enquiry
                            </button>
                        )}
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
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('business_vertical')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Business Vertical <TableSortIcon direction={getSortDirection('business_vertical')} /></div>
                                            </th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('current_stage')}>
                                                <div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('current_stage')} /></div>
                                            </th>
                                            {hasActionPermission && <th className="tw-align-middle">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((item, idx) => (
                                            <tr key={item.enquiry_id}>
                                                <td>{startIndex + idx + 1}</td>
                                                <td>{item.enq_no}</td>
                                                <td>{item.enq_date}</td>
                                                <td>{item.customer_name}</td>
                                                <td>{item.mobile}</td>
                                                <td>{item.business_vertical}</td>
                                                <td>
                                                    <span className="badge tw-bg-yellow-500 tw-text-white tw-px-2 tw-py-1">
                                                        {item.current_stage}
                                                    </span>
                                                </td>
                                                {hasActionPermission && (
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        {hasPermission('Sales.Unallotted Enquiry.Edit') && (
                                                        <button 
                                                            className="list-action-btn btn-edit" 
                                                            title="Edit"
                                                            onClick={() => navigate(`/enquiry/edit/${item.enquiry_id}`)}
                                                        >
                                                            <i className="bi bi-pencil" />
                                                        </button>
                                                        )}
                                                        {hasPermission('Sales.Unallotted Enquiry.Delete') && (
                                                        <button
                                                            type="button"
                                                            className="list-action-btn btn-delete"
                                                            title="Delete"
                                                            onClick={() => confirmDelete(item.enquiry_id)}
                                                        >
                                                            <i className="bi bi-trash" />
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
                            {paginatedData.map((item, idx) => (
                                <MobileCard key={item.enquiry_id || idx}>
                                    <MobileCard.Header label="ENQ. NO" value={item.enq_no} />
                                    <MobileCard.Body>
                                        <MobileCard.Field label="Customer Name" value={item.customer_name} bold valueColor="blue" />
                                        
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                            <MobileCard.Field label="Enq Date" value={item.enq_date || '-'} />
                                            <MobileCard.Field label="Mobile" value={item.mobile || '-'} align="right" />
                                            <MobileCard.Field label="Business Vertical" value={item.business_vertical || '-'} />
                                        </div>
                                    </MobileCard.Body>
                                    <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                        <div className="tw-flex tw-gap-4 tw-w-full">
                                            <div className="tw-flex tw-flex-col tw-gap-1">
                                                <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Current Stage</span>
                                                <div>
                                                    <span className="badge tw-bg-yellow-500 tw-text-white tw-px-2 tw-py-1">
                                                        {item.current_stage || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {hasActionPermission && (
                                            <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                                <MobileCard.Actions>
                                                    {hasPermission('Sales.Unallotted Enquiry.Edit') && (
                                                        <button 
                                                            className="list-action-btn btn-edit" 
                                                            title="Edit"
                                                            onClick={() => navigate(`/enquiry/edit/${item.enquiry_id}`)}
                                                        >
                                                            <i className="bi bi-pencil" />
                                                        </button>
                                                    )}
                                                    {hasPermission('Sales.Unallotted Enquiry.Delete') && (
                                                        <button
                                                            type="button"
                                                            className="list-action-btn btn-delete"
                                                            title="Delete"
                                                            onClick={() => confirmDelete(item.enquiry_id)}
                                                        >
                                                            <i className="bi bi-trash" />
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
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-sm tw-text-slate-500">
                                Showing {paginatedData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                            </div>
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>

                    </div>
                </div>
            </div>

            <DeletePopup
                isOpen={deletePopupOpen}
                onClose={() => setDeletePopupOpen(false)}
                onConfirm={handleDelete}
            />
        </section>
    );
};

export default UnallottedEnquiryList;

