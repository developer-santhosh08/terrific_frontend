import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, GearSixIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { usePermissions } from '../../../../context/PermissionContext';
import MobileCard from '../../../../components/common/MobileCard';
const TaxMasterList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.General Master - Tax Master.Edit') || hasPermission('Power Master.General Master - Tax Master.Delete');
    const { setLoading } = useLoader();



    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [taxMasters, setTaxMasters] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTaxes = async () => {
            setLoading(true);
            setError('');
            try {
                const token = sessionStorage.getItem('erp_token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                const response = await fetch(`${baseUrl}/api/master/tax`, {
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
                    setError(json.message || 'Failed to fetch taxes.');
                    return;
                }
                setTaxMasters(Array.isArray(json.data) ? json.data.reverse() : json.data);
            } catch (err) {
                console.error(err);
                setError('Unable to reach the server.');
            } finally {
                setLoading(false);
            }
        };
        fetchTaxes();
    }, []);


    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = sessionStorage.getItem('erp_token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${baseUrl}/api/master/tax/${pendingDeleteId}`, {
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
                setTaxMasters(prev => prev.filter(d => d.id !== pendingDeleteId));
            } else {
                console.error("API Error:", json ? json.message : "Unknown Error");
            }
        } catch (error) {
            console.error("Error deleting tax:", error);
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
    } = useTableControls(taxMasters);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Tax Master Details</h3>
                        {hasPermission('Power Master.General Master - Tax Master.Add') && (
                            <button
                                className="btn-create"
                                onClick={() => navigate('/power-master/tax-master/add')}
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
                                        <th onClick={() => handleSort('name')} className="tw-cursor-pointer tw-select-none">Description <TableSortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('percentage')} className="tw-cursor-pointer tw-select-none">Percentage <TableSortIcon direction={sortConfig.key === 'percentage' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status_label')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status_label' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((t, index) => (
                                        <tr key={t.id}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{t.name}</td>
                                            <td>{t.percentage}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${t.status_label === 'Active' || t.status === 1 ? 'bg-success' : 'bg-danger'}`}>
                                                    {t.status_label || (t.status === 1 ? 'Active' : 'Inactive')}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td>
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.General Master - Tax Master.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/tax-master/edit/${t.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.General Master - Tax Master.Delete') && (
<button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(t.id)}
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
                            {sortedData.map((t, index) => (
                                <MobileCard key={t.id}>
                                    <MobileCard.Header label="#" value={startIndex + index + 1} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                            <MobileCard.Field label="Description" value={t.name} />
                                            <MobileCard.Field label="Percentage" value={t.percentage} />
                                            <MobileCard.Field label="Status" value={
                                                <span className={`badge ${t.status_label === 'Active' || t.status === 1 ? 'bg-success' : 'bg-danger'}`}>
                                                    {t.status_label || (t.status === 1 ? 'Active' : 'Inactive')}
                                                </span>
                                            } />
                                        </div>
                                    </MobileCard.Body>
                                    {hasActionPermission && (
                                        <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                            <MobileCard.Actions>
                                                {hasPermission('Power Master.General Master - Tax Master.Edit') && (
                                                    <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/tax-master/edit/${t.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('Power Master.General Master - Tax Master.Delete') && (
                                                    <button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(t.id)}
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

export default TaxMasterList;
