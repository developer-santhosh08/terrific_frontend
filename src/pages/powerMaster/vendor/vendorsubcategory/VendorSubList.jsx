import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, Trash } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { usePermissions } from '../../../../context/PermissionContext';
import MobileCard from '../../../../components/common/MobileCard';


const VendorSubList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Vendor - Vendor Sub Category.Edit') || hasPermission('Power Master.Vendor - Vendor Sub Category.Delete');
    const { loading, setLoading } = useLoader();

    const navigate = useNavigate();
    const [data, setData] = useState([]);
    
    // Delete states
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch sub categories
            const res = await apiFetch('/master/vendorSubCategory');
const json = res?.json || {};
            
            // Fetch categories to map the name
            const catRes = await apiFetch('/master/dropdown/vendor_category');
const catJson = catRes?.json || {};
            const catMap = {};
            if (catJson.status && catJson.data) {
                catJson.data.forEach(c => catMap[c.id] = c.name);
            }

            if (json.status && json.data) {
                // Reverse the array to show newest entries first
                const reversedData = [...json.data].reverse();
                const formattedData = reversedData.map(item => ({
                    id: item.id,
                    vendorCategory: catMap[item.vendor_category_id] || 'Unknown',
                    vendorSubCategory: item.name,
                    status: item.status === 1 ? 'Active' : 'Inactive'
                }));
                setData(formattedData);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setShowDeletePopup(true);
    };

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const res = await apiFetch(`/master/vendorSubCategory/${itemToDelete}`, {
                method: 'DELETE'
            });
const result = res?.json || {};
            if (result.status) {
                // Refresh list
                fetchData();
            } else {
                console.error('Error deleting:', result.message);
            }
        } catch (err) {
            console.error('Error deleting item:', err);
        }
        setShowDeletePopup(false);
        setItemToDelete(null);
    };

    const {
        sortConfig,
        handleSort,
        searchQuery,
        setSearchQuery,
        entriesPerPage,
        setEntriesPerPage,
        currentPage,
        setCurrentPage,
        totalPages,
        startIndex,
        endIndex,
        totalEntries,
        paginatedData: sortedData
    } = useTableControls(data);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Vendor Sub Category Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Vendor - Vendor Sub Category.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/vendor/vendor-sub-category/add')}
                                >
                                    <PlusIcon weight="bold" className="tw-w-4 text-white" />
                                    <span className="text-white">Create New</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="card-body">
                        {/* Top controls: Show entries and Search */}
                        <div className="list-top-bar">
                            
                            <div className="d-flex align-items-center">
                                <span className="me-2">Show</span>
                                <select 
                                    className="form-select form-select-sm tw-border-slate-300 me-2" 
                                    style={{ width: '70px' }}
                                    value={entriesPerPage}
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="me-2">Search:</span>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm tw-border-slate-300" 
                                    style={{ width: 'auto' }} 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="table-responsive tw-hidden md:tw-block">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th onClick={() => handleSort('vendorCategory')} className="tw-cursor-pointer tw-select-none">Vendor Category <TableSortIcon direction={sortConfig.key === 'vendorCategory' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('vendorSubCategory')} className="tw-cursor-pointer tw-select-none">Vendor Sub Category <TableSortIcon direction={sortConfig.key === 'vendorSubCategory' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((e, index) => (
                                        <tr key={index}>
                                            <td className="align-middle">{startIndex + index}</td>
                                            <td className="align-middle">{e.vendorCategory}</td>
                                            <td className="align-middle">{e.vendorSubCategory}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.Vendor - Vendor Sub Category.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/vendor/vendor-sub-category/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.Vendor - Vendor Sub Category.Delete') && (
<button type="button" className="list-action-btn btn-delete" onClick={() => handleDeleteClick(e.id)}>
                                                        <Trash weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                </div>
                                            </td>
)}
                                        </tr>
                                    ))}
                                    {sortedData.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 5 : 4} className="text-center tw-py-4">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {sortedData.map((e, index) => (
                                <MobileCard key={e.id || index}>
                                    <MobileCard.Header label="Vendor Sub Category" value={e.vendorSubCategory} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                            <MobileCard.Field label="#" value={startIndex + index} />
                                            <MobileCard.Field label="Vendor Category" value={e.vendorCategory} />
                                            <MobileCard.Field label="Status" value={
                                                <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status}
                                                </span>
                                            } />
                                        </div>
                                    </MobileCard.Body>
                                    {hasActionPermission && (
                                        <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                            <MobileCard.Actions>
                                                {hasPermission('Power Master.Vendor - Vendor Sub Category.Edit') && (
                                                    <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/vendor/vendor-sub-category/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('Power Master.Vendor - Vendor Sub Category.Delete') && (
                                                    <button type="button" className="list-action-btn btn-delete" onClick={() => handleDeleteClick(e.id)}>
                                                        <Trash weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                            </MobileCard.Actions>
                                        </MobileCard.Footer>
                                    )}
                                </MobileCard>
                            ))}
                            {sortedData.length === 0 && (
                                <div className="tw-text-center tw-text-slate-400 tw-py-8">No records found</div>
                            )}
                        </div>

                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-gray-600 tw-text-sm">
                                Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
                            </div>
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                onPageChange={setCurrentPage} 
                            />
                        </div>

                        
                        

                    </div>
                </div>
            </div>
            <DeletePopup 
                isOpen={showDeletePopup} 
                onClose={() => setShowDeletePopup(false)} 
                onConfirm={handleConfirmDelete} 
            />
        </section>
    );
};

export default VendorSubList;
