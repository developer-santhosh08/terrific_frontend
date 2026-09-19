import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { usePermissions } from '../../../../context/PermissionContext';
import MobileCard from '../../../../components/common/MobileCard';


const VendorList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Vendor - Vendor.Edit') || hasPermission('Power Master.Vendor - Vendor.Delete');
    const { loading, setLoading } = useLoader();

    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [data, setData] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/vendor`, { cache: 'no-store' });
            const json = await res.json();
            if (json.status && json.data) {
                const formattedData = json.data.map(item => {
                    let mobileNo = item.mobile_number || item.mobile_no || item.mobile || item.contact_person_mobile || '';
                    let phoneNo = item.phone_number || item.phone_no || item.phone || '';
                    if (mobileNo == 0 || mobileNo === '0') mobileNo = '';
                    if (phoneNo == 0 || phoneNo === '0') phoneNo = '';
                    
                    return {
                        id: item.id,
                        name: item.name,
                        mobileNo: mobileNo,
                        phoneNo: phoneNo,
                        status: (item.status === 0 || item.status === '0') ? 'Inactive' : 'Active'
                    };
                }).sort((a, b) => b.id - a.id);
                setData(formattedData);
            }
        } catch (err) {
            console.error("Error fetching vendors:", err);
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/vendor/${pendingDeleteId}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.status) {
                setData(prev => prev.filter(d => d.id !== pendingDeleteId));
            } else {
                console.error("Failed to delete vendor:", result.message);
                alert(result.message || 'Failed to delete vendor');
            }
        } catch (err) {
            console.error("Error deleting vendor:", err);
            alert('An error occurred while deleting the vendor');
        } finally {
            setShowDeletePopup(false);
            setPendingDeleteId(null);
            setLoading(false);
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
                        <h3 className="card-title">Vendor Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Vendor - Vendor.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/vendor/vendor/add')}
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

                        <div className="table-responsive tw-hidden md:tw-block">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th onClick={() => handleSort('name')} className="tw-cursor-pointer tw-select-none">Name <TableSortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('mobileNo')} className="tw-cursor-pointer tw-select-none">Mobile No <TableSortIcon direction={sortConfig.key === 'mobileNo' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('phoneNo')} className="tw-cursor-pointer tw-select-none">Phone No <TableSortIcon direction={sortConfig.key === 'phoneNo' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((e, index) => (
                                        <tr key={index}>
                                            <td className="align-middle">{startIndex + index}</td>
                                            <td className="align-middle">{e.name}</td>
                                            <td className="align-middle">{e.mobileNo}</td>
                                            <td className="align-middle">{e.phoneNo}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.Vendor - Vendor.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/vendor/vendor/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="bold" className="tw-w-4 text-white" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.Vendor - Vendor.Delete') && (
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
                                            <td colSpan={hasActionPermission ? 6 : 5} className="text-center tw-py-4">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {sortedData.map((e, index) => (
                                <MobileCard key={e.id || index}>
                                    <MobileCard.Header label="Vendor Name" value={e.name} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                            <MobileCard.Field label="#" value={startIndex + index} />
                                            <MobileCard.Field label="Mobile No" value={e.mobileNo} />
                                            <MobileCard.Field label="Phone No" value={e.phoneNo} />
                                            <MobileCard.Field label="Status" value={
                                                <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status}
                                                </span>
                                            } />
                                        </div>
                                    </MobileCard.Body>
                                    {hasActionPermission && (
                                        <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                            <MobileCard.Actions>
                                                {hasPermission('Power Master.Vendor - Vendor.Edit') && (
                                                    <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/vendor/vendor/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="bold" className="tw-w-4 text-white" />
                                                    </button>
                                                )}
                                                {hasPermission('Power Master.Vendor - Vendor.Delete') && (
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

export default VendorList;
