import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { usePermissions } from '../../../../context/PermissionContext';
import MobileCard from '../../../../components/common/MobileCard';
const ProjectList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.General Master - Project.Edit') || hasPermission('Power Master.General Master - Project.Delete');
    const { setLoading } = useLoader();

        
    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError('');
            try {
                const token = sessionStorage.getItem('erp_token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                const response = await fetch(`${baseUrl}/api/master/project`, {
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
                    setError(json.message || 'Failed to fetch projects.');
                    return;
                }
                setProjects(Array.isArray(json.data) ? json.data.reverse() : json.data);
            } catch (err) {
                console.error(err);
                setError('Unable to reach the server.');
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    
    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = sessionStorage.getItem('erp_token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${baseUrl}/api/master/project/${pendingDeleteId}`, {
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
                setProjects(prev => prev.filter(d => d.id !== pendingDeleteId));
            } else {
                console.error("API Error:", json ? json.message : "Unknown Error");
            }
        } catch (error) {
            console.error("Error deleting project:", error);
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
    } = useTableControls(projects);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Project</h3>
                        {hasPermission('Power Master.General Master - Project.Add') && (
                            <button
                                className="btn-create"
                                onClick={() => navigate('/power-master/project/add')}
                            >
                                <PlusIcon weight="duotone" className="tw-w-4" />
                                Create New
                            </button>
                        )}
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
                                        <th onClick={() => handleSort('name')} className="tw-cursor-pointer tw-select-none">Project Name <TableSortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('value')} className="tw-cursor-pointer tw-select-none">Project Value <TableSortIcon direction={sortConfig.key === 'value' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('int_per')} className="tw-cursor-pointer tw-select-none">Initmation <TableSortIcon direction={sortConfig.key === 'int_per' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('budget_value')} className="tw-cursor-pointer tw-select-none">Project Budget Value <TableSortIcon direction={sortConfig.key === 'budget_value' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status_label')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status_label' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((p, index) => (
                                        <tr key={p.id}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{p.name}</td>
                                            <td>{p.value}</td>
                                            <td>{p.int_per}</td>
                                            <td>{p.budget_value}</td>
                                            <td>
                                                <span className={`badge ${p.status_label === 'Active' || p.status === 1 ? 'bg-success' : 'bg-danger'}`}>
                                                    {p.status_label || (p.status === 1 ? 'Active' : 'Inactive')}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td>
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.General Master - Project.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/project/edit/${p.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.General Master - Project.Delete') && (
<button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(p.id)}
                                                    >
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                </div>
                                            </td>
)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {sortedData.map((p, index) => (
                                <MobileCard key={p.id}>
                                    <MobileCard.Header label="#" value={startIndex + index + 1} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                            <MobileCard.Field label="Project Name" value={p.name} />
                                            <MobileCard.Field label="Project Value" value={p.value} />
                                            <MobileCard.Field label="Intimation" value={p.int_per} />
                                            <MobileCard.Field label="Budget Value" value={p.budget_value} />
                                            <MobileCard.Field label="Status" value={
                                                <span className={`badge ${p.status_label === 'Active' || p.status === 1 ? 'bg-success' : 'bg-danger'}`}>
                                                    {p.status_label || (p.status === 1 ? 'Active' : 'Inactive')}
                                                </span>
                                            } />
                                        </div>
                                    </MobileCard.Body>
                                    {hasActionPermission && (
                                        <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                            <MobileCard.Actions>
                                                {hasPermission('Power Master.General Master - Project.Edit') && (
                                                    <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/project/edit/${p.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('Power Master.General Master - Project.Delete') && (
                                                    <button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(p.id)}
                                                    >
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
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
                onClose={() => { setShowDeletePopup(false); setPendingDeleteId(null); }}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
};

export default ProjectList;
