import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { useEffect } from 'react';
import { usePermissions } from '../../../../context/PermissionContext';

const EmployeeBusinessList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Employee - Employee.Edit') || hasPermission('Power Master.Employee - Employee.Delete');
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [data, setData] = useState([
        { id: 1, employeeName: 'Raj Kumar. R', numberOfBusinessVertical: 2, status: 'Active' },
        { id: 2, employeeName: 'SURIYA S', numberOfBusinessVertical: 1, status: 'Inactive' }
    ]);

    useEffect(() => {
        const fetchMapping = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const __apiRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee-business-vertical-mapping`, {
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const result = await __apiRes.json();
                if (result.status && result.data && Array.isArray(result.data) && result.data.length > 0) {
                    const mappedData = result.data.map(item => ({
                        id: item.id,
                        employeeName: item.employee?.name || item.employee_id || '',
                        numberOfBusinessVertical: item.business_verticals ? item.business_verticals.length : 0,
                        status: item.status === 1 ? 'Active' : (item.status === 0 ? 'Inactive' : 'Active'),
                        status_label: item.status_label || (item.status === 1 ? 'Active' : 'Inactive')
                    }));
                    setData(mappedData.sort((a, b) => b.id - a.id));
                }
            } catch (error) {
                console.error('Error fetching employee business mapping:', error);
                // Keep the default mock data if API fails
            } finally {
                setLoading(false);
            }
        };
        fetchMapping();
    }, [setLoading]);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee-business-vertical-mapping/${pendingDeleteId}`, { 
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (response.ok) {
                setData(prev => prev.filter(d => d.id !== pendingDeleteId));
            } else {
                console.error("Failed to delete employee business mapping");
            }
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
                        <h3 className="card-title">Employee Business Vertical Mapping Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Employee - Employee.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/employee/business-vertical-mapping/add')}
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
                                        <th onClick={() => handleSort('employeeName')} className="tw-cursor-pointer tw-select-none">Employee Name <TableSortIcon direction={sortConfig.key === 'employeeName' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('numberOfBusinessVertical')} className="tw-cursor-pointer tw-select-none">Number of Business Vertical <TableSortIcon direction={sortConfig.key === 'numberOfBusinessVertical' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((e, index) => (
                                        <tr key={index}>
                                            <td className="align-middle">{startIndex + index + 1}</td>
                                            <td className="align-middle">{e.employeeName}</td>
                                            <td className="align-middle">{e.numberOfBusinessVertical}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status_label || e.status}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.Employee - Employee.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/employee/business-vertical-mapping/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.Employee - Employee.Delete') && (
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
                                            <td colSpan={hasActionPermission ? 5 : 4} className="text-center tw-py-4">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-gray-600 tw-text-sm">
                                Showing {totalEntries === 0 ? 0 : startIndex} to {endIndex} of {totalEntries} entries
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

export default EmployeeBusinessList;
