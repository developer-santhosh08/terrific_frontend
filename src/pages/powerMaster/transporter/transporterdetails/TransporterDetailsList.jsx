import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { usePermissions } from '../../../../context/PermissionContext';

const TransporterDetailsList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.General Master.Edit') || hasPermission('Power Master.General Master.Delete');
        
    

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const navigate = useNavigate();
    const { setLoading } = useLoader();
    const [searchTerm, setSearchTerm] = useState('');
        const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [data, setData] = useState([
        {
            id: 1,
            transporterMode: 'Road',
            city: 'THIRUPUR',
            name: 'TERRIFIC LOGISTICS',
            status: 'Active'
        },
        {
            id: 2,
            transporterMode: 'Rail',
            city: 'COIMBATORE',
            name: 'OMEGA CARRIERS',
            status: 'Active'
        }
    ]);

    const filteredData = data.filter((e) =>
        Object.values(e).some((val) =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const _manualSortedData = [...filteredData].sort((a, b) => {
        if (sortConfig.key) {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
        }
        return 0;
    });

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await apiFetch(`/master/transporter-details/${pendingDeleteId}`, { method: 'DELETE' });
            setData(prev => prev.filter(d => d.id !== pendingDeleteId));
        } catch {
            // silently ignore
        } finally {
            setShowDeletePopup(false);
            setPendingDeleteId(null);
        }
    };

    const {
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
                        <h3 className="card-title">Transporter Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            <button
                                className="btn-create d-flex align-items-center tw-gap-1"
                                onClick={() => navigate('/power-master/transporter/transporter-details/add')}
                            >
                                <PlusIcon weight="bold" className="tw-w-4 text-white" />
                                <span className="text-white">Create New</span>
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        {/* Table controls */}
                        <div className="list-top-bar">
                            <div className="d-flex align-items-center">
                                <span>Show</span>
                                <select
                                    className="form-select form-select-sm mx-2 tw-w-20 tw-border-slate-300"
                                    value={entriesPerPage}
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
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
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>#</th>
                                        <th
                                            onClick={() => handleSort('transporterMode')}
                                            className="tw-cursor-pointer tw-select-none"
                                        >
                                            Transporter Mode{' '}
                                            <TableSortIcon direction={sortConfig.key === 'transporterMode' ? sortConfig.direction : null} />
                                        </th>
                                        <th
                                            onClick={() => handleSort('city')}
                                            className="tw-cursor-pointer tw-select-none"
                                        >
                                            City{' '}
                                            <TableSortIcon direction={sortConfig.key === 'city' ? sortConfig.direction : null} />
                                        </th>
                                        <th
                                            onClick={() => handleSort('name')}
                                            className="tw-cursor-pointer tw-select-none"
                                        >
                                            Name{' '}
                                            <TableSortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} />
                                        </th>
                                        <th
                                            onClick={() => handleSort('status')}
                                            className="tw-cursor-pointer tw-select-none"
                                        >
                                            Status{' '}
                                            <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} />
                                        </th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((e, index) => (
                                        <tr key={e.id}>
                                            <td className="align-middle">{startIndex + index + 1}</td>
                                            <td className="align-middle">{e.transporterMode}</td>
                                            <td className="align-middle">{e.city}</td>
                                            <td className="align-middle">{e.name}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.General Master.Edit') && (
<button
                                                        type="button" className="list-action-btn btn-edit"
                                                        title="Edit"
                                                        onClick={() => navigate(`/power-master/transporter/transporter-details/edit/${e.id}`)}
                                                    >
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
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
                                            <td colSpan={hasActionPermission ? 6 : 5} className="text-center tw-py-4 tw-text-slate-500">
                                                No data available in table
                                            </td>
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

export default TransporterDetailsList;


