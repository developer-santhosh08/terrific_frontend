import { useState, useEffect } from 'react';
import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { usePermissions } from '../../../../context/PermissionContext';

const LabourChargesList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.HR Master.Edit') || hasPermission('Power Master.HR Master.Delete');
        const navigate = useNavigate();
        const [data, setData] = useState([]);

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
    const { setLoading } = useLoader();
    
    useEffect(() => {
        const fetchLabourCharges = async () => {
            try {
                const __apiRes = await apiFetch('/master/labour-charge');
                if (!__apiRes) return;
                const result = __apiRes.json;
                if (result.status && Array.isArray(result.data)) {
                    setData([...result.data].reverse());
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error('Error fetching labour charges:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLabourCharges();
    }, []);

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await apiFetch(`/master/labour-charge/${pendingDeleteId}`, {
                method: 'DELETE'
            });
            if (__apiRes.res.ok) {
                setData(prev => prev.filter(item => item.id !== pendingDeleteId));
            }
        } catch (error) {
            console.error('Error deleting labour charge:', error);
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
                        <h3 className="card-title">Labour Charges</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.HR Master.Add') && (
<button
                                className="btn-create d-flex align-items-center tw-gap-1"
                                onClick={() => navigate('/power-master/hr/labourcharges/add')}
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

                        <div className="table-responsive">
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
                                    {sortedData.map((e, index) => (
                                        <tr key={e.id || index}>
                                            <td className="align-middle">{startIndex + index + 1}</td>
                                            <td className="align-middle">{e.name || e.labour_charge}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${e.status === 'Active' || e.status_label === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status || e.status_label}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.HR Master.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/hr/labourcharges/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.HR Master.Delete') && (
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

export default LabourChargesList;
