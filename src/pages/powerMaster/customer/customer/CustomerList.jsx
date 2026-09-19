import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, GearSixIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { usePermissions } from '../../../../context/PermissionContext';

const CustomerList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Customer - Customer.Edit') || hasPermission('Power Master.Customer - Customer.Delete');
    const { loading, setLoading } = useLoader();

    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/customer/${pendingDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
            if (json && json.status) {
                setItems((prev) => prev.filter((n) => n.id !== pendingDeleteId));
            } else {
                alert(json?.message || 'Failed to delete');
            }
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Error deleting customer");
        } finally {
            setShowDeletePopup(false);
            setPendingDeleteId(null);
        }
    };
    const [data, setItems] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/customer`, {
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const json = await res.json();
                if (json && json.status && json.data) {
                    setItems(json.data.map(item => ({
                        ...item,
                        mobile: item.mobile_number1 || '',
                        status: (item.status === 1 || item.status === '1') ? 'Active' : 'Inactive'
                    })).sort((a, b) => b.id - a.id));
                }
            } catch (error) {
                console.error("Error fetching customers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [setLoading]);

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
                        <h3 className="card-title">Customer Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Customer - Customer.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/customer/customer/add')}
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
                                        <th onClick={() => handleSort('name')} className="tw-cursor-pointer tw-select-none">Name <TableSortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('address1')} className="tw-cursor-pointer tw-select-none">Address1 <TableSortIcon direction={sortConfig.key === 'address1' ? sortConfig.direction : null} /></th>
                                        <th>Address2</th>
                                        <th onClick={() => handleSort('mobile')} className="tw-cursor-pointer tw-select-none">Mobile <TableSortIcon direction={sortConfig.key === 'mobile' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center tw-py-4">Loading...</td>
                                        </tr>
                                    ) : (
                                        <>
                                            {sortedData.map((e, index) => (
                                                <tr key={index}>
                                                    <td className="align-middle">{startIndex + index}</td>
                                                    <td className="align-middle">{e.name}</td>
                                                    <td className="align-middle">{e.address1}</td>
                                                    <td className="align-middle">{e.address2}</td>
                                                    <td className="align-middle">{e.mobile}</td>
                                                    <td className="align-middle">
                                                        <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                            {e.status}
                                                        </span>
                                                    </td>
                                                    {hasActionPermission && (
                                                        <td className="align-middle">
                                                            <div className="tw-flex tw-gap-2">
                                                                {hasPermission('Power Master.Customer - Customer.Edit') && (
                                                                    <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/customer/customer/edit/${e.id}`)}>
                                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                                    </button>
                                                                )}
                                                                {hasPermission('Power Master.Customer - Customer.Delete') && (
                                                                    <button type="button" className="list-action-btn btn-delete" onClick={() => handleDelete(e.id)}>
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
                                                    <td colSpan={hasActionPermission ? 7 : 6} className="text-center tw-py-4">No data available in table</td>
                                                </tr>
                                            )}
                                        </>
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
            <DeletePopup isOpen={showDeletePopup} onClose={() => setShowDeletePopup(false)} onConfirm={handleConfirmDelete} />

        </section>
    );
};

export default CustomerList;
