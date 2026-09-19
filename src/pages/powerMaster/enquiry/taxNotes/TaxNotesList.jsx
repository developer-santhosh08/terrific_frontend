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
const TaxNotesList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Enquiry Master - Tax Notes.Edit') || hasPermission('Power Master.Enquiry Master - Tax Notes.Delete');
    const { setLoading } = useLoader();


        
    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [items, setItems] = useState([]);



    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL.trim()}/api/master/tax-note`, {
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const data = await response.json();
                console.log("TaxNotes API Response:", data);
                if (data?.status && data?.data) {
                    const raw = Array.isArray(data.data) ? data.data : [data.data];
                    setItems([...raw].reverse());
                } else if (Array.isArray(data)) {
                    setItems([...data].reverse());
                } else if (data?.data && Array.isArray(data.data)) {
                    setItems([...data.data].reverse());
                } else if (Array.isArray(data?.data?.data)) {
                    setItems([...data.data.data].reverse());
                } else {
                    console.error(data?.message || 'Failed to fetch tax notes.', data);
                }
            } catch (error) {
                console.error("Error fetching tax notes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setLoading]);

    
    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = sessionStorage.getItem('erp_token');
            await fetch(`${import.meta.env.VITE_API_BASE_URL.trim()}/api/master/tax-note/${pendingDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            setItems(prev => prev.filter(d => d.id !== pendingDeleteId));
        } catch (error) {
            console.error('Failed to delete. Please try again.', error);
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
    } = useTableControls(items);

    return (
                <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title"> Tax Notes</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Enquiry Master - Tax Notes.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/tax-notes/add')}
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
                                        <th onClick={() => handleSort('status_label')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status_label' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((e, index) => (
                                        <tr key={index}>
                                            <td className="align-middle">{startIndex + index + 1}</td>
                                            <td className="align-middle">{e.name}</td>
                                            <td className="align-middle">
                                                <span className="badge badge-success" style={{ backgroundColor: e.status === 1 ? '#28a745' : '#dc3545' }}>
                                                    {e.status_label || (e.status === 1 ? 'Active' : 'Inactive')}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.Enquiry Master - Tax Notes.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/tax-notes/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.Enquiry Master - Tax Notes.Delete') && (
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
                                            <td colSpan={hasActionPermission ? 4 : 3} className="text-center tw-py-4">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {sortedData.map((e, index) => (
                                <MobileCard key={index}>
                                    <MobileCard.Header label="#" value={startIndex + index + 1} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                            <MobileCard.Field label="Name" value={e.name} />
                                            <MobileCard.Field label="Status" value={
                                                <span className="badge badge-success" style={{ backgroundColor: e.status === 1 ? '#28a745' : '#dc3545' }}>
                                                    {e.status_label || (e.status === 1 ? 'Active' : 'Inactive')}
                                                </span>
                                            } />
                                        </div>
                                    </MobileCard.Body>
                                    {hasActionPermission && (
                                        <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                            <MobileCard.Actions>
                                                {hasPermission('Power Master.Enquiry Master - Tax Notes.Edit') && (
                                                    <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/tax-notes/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('Power Master.Enquiry Master - Tax Notes.Delete') && (
                                                    <button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(e.id)}
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

export default TaxNotesList;
