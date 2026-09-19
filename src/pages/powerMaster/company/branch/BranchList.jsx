import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import { apiFetch } from '../../../../lib/api';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { usePermissions } from '../../../../context/PermissionContext';
import MobileCard from '../../../../components/common/MobileCard';
const BranchList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.General Master - Branch.Edit') || hasPermission('Power Master.General Master - Branch.Delete');
        const navigate = useNavigate();
    const [branches, setBranches] = useState([]);

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
    } = useTableControls(branches);
    const { loading, setLoading } = useLoader();
    const [error, setError] = useState('');
        const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    useEffect(() => {
        const fetchBranches = async () => {
            setLoading(true);
            setError('');
            try {
                const token = sessionStorage.getItem('erp_token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                const response = await fetch(`${baseUrl}/api/master/branch`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                
                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem('erp_auth');
                    sessionStorage.removeItem('erp_token');
                    sessionStorage.removeItem('erp_user');
                    window.location.href = '/login';
                    return;
                }

                const json = await response.json();
                
                if (!response.ok || !json.status) {
                    setError(json.message || 'Failed to fetch branches.');
                    return;
                }
                setBranches(Array.isArray(json.data) ? json.data.reverse() : json.data);
            } catch (err) {
                console.error(err);
                setError('Unable to reach the server.');
            } finally {
                setLoading(false);
            }
        };
        fetchBranches();
    }, []);

    
    
    
    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = sessionStorage.getItem('erp_token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${baseUrl}/api/master/branch/${pendingDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('erp_auth');
                sessionStorage.removeItem('erp_token');
                sessionStorage.removeItem('erp_user');
                window.location.href = '/login';
                return;
            }

            const json = await response.json();
            
            if (response.ok && json && json.status) {
                setBranches(prev => prev.filter(d => d.id !== pendingDeleteId));
            } else {
                console.error("API Error:", json ? json.message : "Unknown Error");
            }
        } catch (error) {
            console.error("Error deleting branch:", error);
        } finally {
            setShowDeletePopup(false);
            setPendingDeleteId(null);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Branch Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.General Master - Branch.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/branch/add')}
                                >
                                    <PlusIcon weight="bold" className="tw-w-4 text-white" />
                                    <span className="text-white">Create New</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="card-body">
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
                                        <th onClick={() => handleSort('name')} className="tw-cursor-pointer tw-select-none">Name <TableSortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="text-center tw-py-4 text-slate-500">Loading...</td>
                                        </tr>
                                    ) : sortedData.length > 0 ? (
                                        sortedData.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="align-middle">{startIndex + index}</td>
                                                <td className="align-middle">{item.name}</td>
                                                <td className="align-middle">
                                                    <span className={`badge ${(item.status === 'Active' || item.status === 1 || item.status === '1') ? 'bg-success' : 'bg-danger'}`}>
                                                        {(item.status === 'Active' || item.status === 1 || item.status === '1') ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                {hasActionPermission && (
<td className="align-middle">
                                                    <div className="tw-flex tw-gap-2">
                                                        {hasPermission('Power Master.General Master - Branch.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/branch/edit/${item.id}`)}>
                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                        </button>
)}
                                                        {hasPermission('Power Master.General Master - Branch.Delete') && (
<button
                                                            type="button"
                                                            className="list-action-btn btn-delete"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <TrashIcon weight="duotone" className="tw-w-4" />
                                                        </button>
)}
                                                    </div>
                                                </td>
)}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 4 : 3} className="text-center tw-py-4">No data available in table</td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {loading ? (
                                <div className="text-center tw-py-4 text-slate-500">Loading...</div>
                            ) : sortedData.length > 0 ? (
                                sortedData.map((item, index) => (
                                    <MobileCard key={item.id}>
                                        <MobileCard.Header label="#" value={startIndex + index} />
                                        <MobileCard.Body>
                                            <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                                <MobileCard.Field label="Branch" value={item.name} />
                                                <MobileCard.Field label="Status" value={
                                                    <span className={`badge ${(item.status === 'Active' || item.status === 1 || item.status === '1') ? 'bg-success' : 'bg-danger'}`}>
                                                        {(item.status === 'Active' || item.status === 1 || item.status === '1') ? 'Active' : 'Inactive'}
                                                    </span>
                                                } />
                                            </div>
                                        </MobileCard.Body>
                                        {hasActionPermission && (
                                            <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                                <MobileCard.Actions>
                                                    {hasPermission('Power Master.General Master - Branch.Edit') && (
                                                        <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/branch/edit/${item.id}`)}>
                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                        </button>
                                                    )}
                                                    {hasPermission('Power Master.General Master - Branch.Delete') && (
                                                        <button
                                                            type="button"
                                                            className="list-action-btn btn-delete"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <TrashIcon weight="duotone" className="tw-w-4" />
                                                        </button>
                                                    )}
                                                </MobileCard.Actions>
                                            </MobileCard.Footer>
                                        )}
                                    </MobileCard>
                                ))
                            ) : (
                                <div className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</div>
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
                onClose={() => { setShowDeletePopup(false); setPendingDeleteId(null); }}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
};

export default BranchList;
