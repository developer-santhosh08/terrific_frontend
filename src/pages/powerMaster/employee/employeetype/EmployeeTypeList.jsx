import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { usePermissions } from '../../../../context/PermissionContext';


const EmployeeTypeList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Employee - Employee Type.Edit') || hasPermission('Power Master.Employee - Employee Type.Delete');
    


        
    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const { loading, setLoading } = useLoader();

    useEffect(() => {
        const fetchEmployeeTypes = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const __apiRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee-type`, {
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const result = await __apiRes.json();
                if (result.status && result.data) {
                    const mappedData = result.data.map(item => ({
                        id: item.id,
                        employeeType: item.name || '',
                        status: item.status === 1 ? 'Active' : (item.status === 0 ? 'Inactive' : 'Active'),
                        status_label: item.status_label || (item.status === 1 ? 'Active' : 'Inactive')
                    }));
                    setEmployeeTypes(mappedData.sort((a, b) => b.id - a.id));
                }
            } catch (error) {
                console.error('Error fetching employee types:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployeeTypes();
    }, [setLoading]);

    
    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee-type/${pendingDeleteId}`, { 
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (response.ok) {
                setEmployeeTypes(prev => prev.filter(d => d.id !== pendingDeleteId));
            } else {
                console.error("Failed to delete employee type");
            }
        } catch (error) {
            console.error("Error deleting employee type:", error);
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
    } = useTableControls(employeeTypes);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Employee Type Details</h3>
                        {hasPermission('Power Master.Employee - Employee Type.Add') && (
                            <button
                                className="btn-create"
                                onClick={() => navigate('/power-master/employee/employee-type/add')}
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

                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th onClick={() => handleSort('employeeType')} className="tw-cursor-pointer tw-select-none">Employee Type <TableSortIcon direction={sortConfig.key === 'employeeType' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="text-center tw-py-4 tw-text-slate-500">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : sortedData.length > 0 ? (
                                        sortedData.map((e, index) => (
                                            <tr key={e.id}>
                                                <td className="align-middle">{startIndex + index}</td>
                                                <td className="align-middle">{e.employeeType}</td>
                                                <td className="align-middle">
                                                    <span className="badge badge-success" style={{ backgroundColor: e.status === 'Active' ? '#28a745' : '#dc3545' }}>
                                                        {e.status_label || e.status}
                                                    </span>
                                                </td>
                                                {hasActionPermission && (
<td className="align-middle">
                                                    <div className="tw-flex tw-gap-2">
                                                        {hasPermission('Power Master.Employee - Employee Type.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/employee/employee-type/edit/${e.id}`)}>
                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                        </button>
)}
                                                        {hasPermission('Power Master.Employee - Employee Type.Delete') && (
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 4 : 3} className="text-center tw-py-4 tw-text-slate-500">
                                                No data available in table
                                            </td>
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

export default EmployeeTypeList;
