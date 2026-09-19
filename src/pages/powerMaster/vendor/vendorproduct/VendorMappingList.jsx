import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimple as PencilSimpleIcon, Plus as PlusIcon, Trash as TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { usePermissions } from '../../../../context/PermissionContext';

const VendorMappingList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Vendor - Vendor Product Mapping.Edit') || hasPermission('Power Master.Vendor - Vendor Product Mapping.Delete');
    const { loading, setLoading } = useLoader();

    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

    const fetchData = async () => {
setLoading(true);
try {
            // Fetch mapping
            const mapRes = await apiFetch('/master/vendorProductMapping');
const mapJson = mapRes?.json || {};
            
            // Fetch vendors
            const vendorRes = await apiFetch('/master/vendor');
const vendorJson = vendorRes?.json || {};
            
            if (mapJson.status && mapJson.data && vendorJson.status && vendorJson.data) {
                const vendorMap = {};
                vendorJson.data.forEach(v => vendorMap[v.id] = v.name);
                
                const grouped = {};
                mapJson.data.forEach(item => {
                    const vId = item.vendor_id;
                    if (!grouped[vId]) {
                        grouped[vId] = {
                            id: vId,
                            vendorName: vendorMap[vId] || 'Unknown',
                            numberOfProduct: 0,
                            status: item.status === 1 ? 'Active' : 'Inactive',
                            mapping_ids: [],
                            latest_mapping_id: item.id
                        };
                    }
                    grouped[vId].numberOfProduct += 1;
                    grouped[vId].mapping_ids.push(item.id);
                    if (item.id > grouped[vId].latest_mapping_id) {
                        grouped[vId].latest_mapping_id = item.id;
                    }
                });
                
                const formattedData = Object.values(grouped).sort((a, b) => b.latest_mapping_id - a.latest_mapping_id);
                setData(formattedData);
            }
        } catch (err) {
            console.error('Error fetching vendor mappings:', err);
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, []);

        const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteIds || pendingDeleteIds.length === 0) return;
        try {
            const promises = pendingDeleteIds.map(id => 
                apiFetch(`/master/vendorProductMapping/${id}`, {
                    method: 'DELETE'
                })
            );
            await Promise.all(promises);
            fetchData();
        } catch (err) {
            console.error("Error deleting mapping", err);
        } finally {
setShowDeletePopup(false);
            setPendingDeleteIds([]);
        
setLoading(false);
}
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
                        <h3 className="card-title">Vendor Product Mapping Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Vendor - Vendor Product Mapping.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/vendor/vendor-product-mapping/add')}
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

                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th onClick={() => handleSort('vendorName')} className="tw-cursor-pointer tw-select-none">Vendor Name <TableSortIcon direction={sortConfig.key === 'vendorName' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('numberOfProduct')} className="tw-cursor-pointer tw-select-none">Number of Product <TableSortIcon direction={sortConfig.key === 'numberOfProduct' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((e, index) => (
                                        <tr key={index}>
                                            <td className="align-middle">{startIndex + index}</td>
                                            <td className="align-middle">{e.vendorName}</td>
                                            <td className="align-middle">{e.numberOfProduct}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.Vendor - Vendor Product Mapping.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/vendor/vendor-product-mapping/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="bold" className="tw-w-4 text-white" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.Vendor - Vendor Product Mapping.Delete') && (
<button 
                                                        type="button" 
                                                        className="list-action-btn btn-delete" 
                                                        onClick={() => {
                                                            setPendingDeleteIds(e.mapping_ids);
                                                            setShowDeletePopup(true);
                                                        }}
                                                    >
                                                        <TrashIcon weight="bold" className="tw-w-4 text-white" />
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

export default VendorMappingList;
