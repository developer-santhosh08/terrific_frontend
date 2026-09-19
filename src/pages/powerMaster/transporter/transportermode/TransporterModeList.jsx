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

const TransporterModeList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.General Master.Edit') || hasPermission('Power Master.General Master.Delete');
            
    const navigate = useNavigate();
    const { setLoading } = useLoader();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [data, setData] = useState([
        { id: 1, transporterName: 'Flight', status: 'Active' },
        { id: 2, transporterName: 'TRAIN', status: 'Active' }
    ]);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await apiFetch(`/master/transporter-mode/${pendingDeleteId}`, { method: 'DELETE' });
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
        entriesPerPage,
        setEntriesPerPage,
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedData: sortedData,
        startIndex,
        endIndex,
        totalEntries
    } = useTableControls(data);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Transporter Mode Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            <button
                                className="btn-create d-flex align-items-center tw-gap-1"
                                onClick={() => navigate('/power-master/transporter/transporter-mode/add')}
                            >
                                <PlusIcon weight="bold" className="tw-w-4 text-white" />
                                <span className="text-white">Create New</span>
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="list-top-bar">
                            <div className="d-flex align-items-center">
                                <span>Show</span>
                                <select
                                    className="form-select form-select-sm mx-2 tw-w-20 tw-border-slate-300"
                                    value={entriesPerPage}
                                    onChange={(e) => setEntriesPerPage(e.target.value)}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
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
                                        <th onClick={() => handleSort('transporterName')} className="tw-cursor-pointer tw-select-none">Transporter Name <TableSortIcon direction={sortConfig.key === 'transporterName' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((e, index) => (
                                        <tr key={index}>
                                            <td className="align-middle">{startIndex + index}</td>
                                            <td className="align-middle">{e.transporterName}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.General Master.Edit') && (
<button className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/transporter/transporter-mode/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="bold" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.General Master.Delete') && (
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
                        


                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div className="tw-text-xs tw-text-slate-500">
                                Showing {startIndex} to {endIndex} of {totalEntries} entries
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-3 tw-text-sm">
                                <span
                                    className={`tw-cursor-pointer ${currentPage === 1 ? 'tw-text-slate-300' : 'tw-text-slate-500 hover:tw-text-blue-600'}`}
                                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                >
                                    Previous
                                </span>
                                <span className="tw-bg-blue-600 tw-text-white tw-px-3 tw-py-1 tw-rounded-sm tw-cursor-pointer">
                                    {currentPage}
                                </span>
                                <span
                                    className={`tw-cursor-pointer ${currentPage === totalPages ? 'tw-text-slate-300' : 'tw-text-slate-500 hover:tw-text-blue-600'}`}
                                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                >
                                    Next
                                </span>
                            </div>
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

export default TransporterModeList;
