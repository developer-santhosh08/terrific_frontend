import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { usePermissions } from '../../../../context/PermissionContext';

const StockLocationList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Items.Edit') || hasPermission('Power Master.Items.Delete');
    const { loading, setLoading } = useLoader();

    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [data, setData] = useState([
        { id: 1, stockLocationName: 'Terrific', damage: 'No', address: 'sample', city: 'ERODE', status: 'Active' },
        { id: 2, stockLocationName: 'Terrific 2', damage: 'Yes', address: 'sample 2', city: 'BANGALORE', status: 'Active' }
    ]);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await apiFetch(`/master/stock-location/${pendingDeleteId}`, { method: 'DELETE' });
            setData(prev => prev.filter(d => d.id !== pendingDeleteId));
        } catch {
            // silently ignore
        } finally {
            setShowDeletePopup(false);
            setPendingDeleteId(null);
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
                        <h3 className="card-title">Stock Location Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Items.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/items/stock-location/add')}
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
                                        <th onClick={() => handleSort('stockLocationName')} className="tw-cursor-pointer tw-select-none">Stock Location Name <TableSortIcon direction={sortConfig.key === 'stockLocationName' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('damage')} className="tw-cursor-pointer tw-select-none">damage <TableSortIcon direction={sortConfig.key === 'damage' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('address')} className="tw-cursor-pointer tw-select-none">Address <TableSortIcon direction={sortConfig.key === 'address' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('city')} className="tw-cursor-pointer tw-select-none">City <TableSortIcon direction={sortConfig.key === 'city' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((e, index) => (
                                        <tr key={index}>
                                            <td className="align-middle">{startIndex + index}</td>
                                            <td className="align-middle">{e.stockLocationName}</td>
                                            <td className="align-middle">{e.damage}</td>
                                            <td className="align-middle">{e.address}</td>
                                            <td className="align-middle">{e.city}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.Items.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/items/stock-location/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.Items.Delete') && (
<button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(e.id)}
                                                    >
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                </div>
                                            </td>
)}
                                        </tr>
                                    ))}
                                    {sortedData.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 7 : 6} className="text-center tw-py-4">No data available in table</td>
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
                onClose={() => { setShowDeletePopup(false); setPendingDeleteId(null); }}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
};

export default StockLocationList;
