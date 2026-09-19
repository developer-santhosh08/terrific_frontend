import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { usePermissions } from '../../../../context/PermissionContext';

const EmployeeList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Employee - Employee.Edit') || hasPermission('Power Master.Employee - Employee.Delete');
    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [employees, setEmployees] = useState([]);
    const { loading, setLoading } = useLoader();

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const [empRes, depRes, desRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee`, {
                        cache: 'no-store', headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                    }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/department`, {
                        headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                    }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/designation`, {
                        headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                    })
                ]);

                const depData = await depRes.json();
                const desData = await desRes.json();
                const empData = await empRes.json();

                const depMap = {};
                if (depData.status && depData.data) {
                    depData.data.forEach(d => { depMap[d.id] = d.name; });
                }

                const desMap = {};
                if (desData.status && desData.data) {
                    desData.data.forEach(d => { desMap[d.id] = d.name; });
                }

                if (empData.status && empData.data) {
                    const mappedData = empData.data.map(item => ({
                        id: item.id,
                        empNo: item.number || '',
                        empName: item.name || '',
                        department: item.department?.name || depMap[item.department_id] || item.department_id || '',
                        designation: item.designation?.name || desMap[item.designation_id] || item.designation_id || '',
                        mobile: item.mobile_number || '',
                        status: item.status_label || (item.status === 1 ? 'Active' : 'Inactive')
                    }));
                    setEmployees(mappedData.sort((a, b) => b.id - a.id));
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, [setLoading]);


    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee/${pendingDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (response.ok) {
                setEmployees(prev => prev.filter(d => d.id !== pendingDeleteId));
            } else {
                console.error("Failed to delete employee");
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
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
        paginatedData: sortedEmployees
    } = useTableControls(employees);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Employee Details</h3>
                        {hasPermission('Power Master.Employee - Employee.Add') && (
                            <button
                                className="btn-create"
                                onClick={() => navigate('/power-master/employee/employee/add')}
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
                                        <th onClick={() => handleSort('empNo')} className="tw-cursor-pointer tw-select-none">Emp No <TableSortIcon direction={sortConfig.key === 'empNo' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('empName')} className="tw-cursor-pointer tw-select-none">Emp Name <TableSortIcon direction={sortConfig.key === 'empName' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('department')} className="tw-cursor-pointer tw-select-none">Department <TableSortIcon direction={sortConfig.key === 'department' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('designation')} className="tw-cursor-pointer tw-select-none">Designation <TableSortIcon direction={sortConfig.key === 'designation' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('mobile')} className="tw-cursor-pointer tw-select-none">Mobile <TableSortIcon direction={sortConfig.key === 'mobile' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center tw-py-4 tw-text-slate-500">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : sortedEmployees.length > 0 ? (
                                        sortedEmployees.map((e, index) => (
                                            <tr key={e.id}>
                                                <td>{startIndex + index}</td>
                                                <td>{e.empNo}</td>
                                                <td>{e.empName}</td>
                                                <td>{e.department}</td>
                                                <td>{e.designation}</td>
                                                <td>{e.mobile}</td>
                                                <td>
                                                    <span className={`badge ${e.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ backgroundColor: e.status === 'Active' ? '#28a745' : '#dc3545' }}>
                                                        {e.status}
                                                    </span>
                                                </td>
                                                {hasActionPermission && (
<td>
                                                    <div className="tw-flex tw-gap-2">
                                                        {hasPermission('Power Master.Employee - Employee.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/employee/employee/edit/${e.id}`)}>
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 8 : 7} className="text-center tw-py-4 tw-text-slate-500">
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

export default EmployeeList;
