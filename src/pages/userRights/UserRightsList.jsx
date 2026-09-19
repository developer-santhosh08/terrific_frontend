import { useTableControls } from '../../hooks/useTableControls';
import { useLoader } from '../../context/LoaderContext';
import Pagination from '../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilSimpleIcon, TrashIcon, ShieldCheckIcon, ArrowBendUpLeftIcon } from '@phosphor-icons/react';
import { apiFetch } from '../../lib/api.js';
import TableSortIcon from '../../components/TableSortIcon';
import DeletePopup from '../../components/Popup/DeletePopup.jsx';
import UserListPopup from '../../components/Popup/UserListPopup.jsx';
import { usePermissions } from '../../context/PermissionContext';
import MobileCard from '../../components/common/MobileCard';



const UserRightsList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('User Rights.User Right.Edit') || hasPermission('User Rights.User Right.Delete') || hasPermission('User Rights.User Right.Rights');
    const { setLoading } = useLoader();
    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [showRevertPopup, setShowRevertPopup] = useState(false);
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/roles/users/admin/users');
            if (response && response.json && response.json.data) {
                setUsers(response.json.data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteId) return;

        setLoading(true);
        try {
            const response = await apiFetch(`/roles/users/admin/users/${pendingDeleteId}`, {
                method: 'DELETE',
            });

            if (response && response.res && response.res.ok) {
                setUsers(prev => prev.filter(d => d.id !== pendingDeleteId));
            } else {
                console.error("Failed to delete user", response?.json);
            }
        } catch (error) {
            console.error("Error deleting user", error);
        } finally {
            setLoading(false);
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
    } = useTableControls(users);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">User List</h3>
                        <div className="d-flex gap-2">
                            {hasPermission('User Rights.User Right.Add') && (
                                <button
                                    type="button"
                                    className="btn-reset"
                                    onClick={() => setShowRevertPopup(true)}
                                >
                                    <ArrowBendUpLeftIcon weight="bold" className="" />
                                    Revert List
                                </button>
                            )}
                            {hasPermission('User Rights.User Right.Add') && (
                                <button
                                    className="btn-create"
                                    onClick={() => navigate('/user-rights/add')}
                                >
                                    <PlusIcon weight="duotone" className="tw-w-4" />
                                    Create Users
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
                                        <th onClick={() => handleSort('email')} className="tw-cursor-pointer tw-select-none">Email <TableSortIcon direction={sortConfig.key === 'email' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('role')} className="tw-cursor-pointer tw-select-none">Role <TableSortIcon direction={sortConfig.key === 'role' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((u, index) => (
                                        <tr key={u.id}>
                                            <td>{startIndex + index}</td>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>{u.role ? u.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''}</td>
                                            <td>
                                                <span className="badge badge-success" style={{ backgroundColor: u.status === 1 ? '#28a745' : '#dc3545' }}>
                                                    {u.status === 1 ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
                                                <td>
                                                    <div className="tw-flex tw-gap-2">
                                                        {hasPermission('User Rights.User Right.Edit') && (
                                                            <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/user-rights/edit/${u.id}`)}>
                                                                <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                        {hasPermission('User Rights.User Right.Delete') && (
                                                            <button
                                                                type="button"
                                                                className="list-action-btn btn-delete"
                                                                onClick={() => handleDelete(u.id)}
                                                            >
                                                                <TrashIcon weight="duotone" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                        {hasPermission('User Rights.User Right.Rights') && (
                                                            <button
                                                                type="button"
                                                                className="list-action-btn"
                                                                style={{ backgroundColor: '#0d6efd', color: '#fff', borderColor: '#0d6efd' }}
                                                                onClick={() => navigate('/user-rights/assign', { state: { user: u } })}
                                                            >
                                                                <ShieldCheckIcon weight="bold" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {sortedData.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 6 : 5} className="text-center">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {sortedData.map((u, index) => (
                                <MobileCard key={u.id}>
                                    <MobileCard.Header label="Name" value={u.name} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                            <MobileCard.Field label="#" value={startIndex + index} />
                                            <MobileCard.Field label="Role" value={u.role ? u.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''} />
                                            <MobileCard.Field label="Status" value={
                                                <span className="badge badge-success" style={{ backgroundColor: u.status === 1 ? '#28a745' : '#dc3545' }}>
                                                    {u.status === 1 ? 'Active' : 'Inactive'}
                                                </span>
                                            } />
                                        </div>
                                        <div className="tw-mt-2">
                                            <MobileCard.Field label="Email" value={u.email} />
                                        </div>
                                    </MobileCard.Body>
                                    {hasActionPermission && (
                                        <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                            <MobileCard.Actions>
                                                {hasPermission('User Rights.User Right.Edit') && (
                                                    <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/user-rights/edit/${u.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('User Rights.User Right.Delete') && (
                                                    <button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(u.id)}
                                                    >
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('User Rights.User Right.Rights') && (
                                                    <button
                                                        type="button"
                                                        className="list-action-btn"
                                                        style={{ backgroundColor: '#0d6efd', color: '#fff', borderColor: '#0d6efd' }}
                                                        onClick={() => navigate('/user-rights/assign', { state: { user: u } })}
                                                    >
                                                        <ShieldCheckIcon weight="bold" className="tw-w-4" />
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
            <UserListPopup
                isOpen={showRevertPopup}
                onClose={() => setShowRevertPopup(false)}
                onRestoreSuccess={() => fetchUsers()}
            />
        </section>
    );
};

export default UserRightsList;
