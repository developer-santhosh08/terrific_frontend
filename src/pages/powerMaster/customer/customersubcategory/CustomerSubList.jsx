import { useState, useEffect } from 'react';
import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { usePermissions } from '../../../../context/PermissionContext';
import MobileCard from '../../../../components/common/MobileCard';
const CustomerSubList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Customer - Customer Sub Category.Edit') || hasPermission('Power Master.Customer - Customer Sub Category.Delete');
    
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [data, setData] = useState([]);


    const fetchData = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const [subRes, catRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/customer-sub-category`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/customer-category`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            ]);
            
            const subJson = await subRes.json();
            const catJson = await catRes.json();
            
            let catMap = {};
            if (catJson.status && catJson.data) {
                catMap = catJson.data.reduce((acc, cat) => {
                    acc[cat.id] = cat.name;
                    return acc;
                }, {});
            }

            if (subJson.status && subJson.data) {
                const formattedData = subJson.data.map(item => ({
                    id: item.id,
                    customerCategory: catMap[item.customer_category_id] || item.customer_category_id || '',
                    customerSubCategory: item.name,
                    status: (item.status === 1 || item.status === 'Active' || item.status === '1') ? 'Active' : 'Inactive'
                })).sort((a, b) => b.id - a.id);
                setData(formattedData);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
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
            await fetch(import.meta.env.VITE_API_BASE_URL + `/api/master/customer-sub-category/${pendingDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('erp_token')}`
                }
            });
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
                        <h3 className="card-title">Customer Sub Category List</h3>
                        {hasPermission('Power Master.Customer - Customer Sub Category.Add') && (
                            <button
                                className="btn-create d-flex align-items-center tw-gap-1"
                                onClick={() => navigate('/power-master/customer/customer-sub-category/add')}
                            >
                                <PlusIcon weight="bold" className="tw-w-4 text-white" />
                                <span className="text-white">Create New</span>
                            </button>
                        )}
                    </div>
                    <div className="card-body">
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-sm tw-text-gray-600">Show</span>
                                <select 
                                    className="form-select form-select-sm tw-w-20"
                                    value={entriesPerPage}
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="tw-text-sm tw-text-gray-600">entries</span>
                            </div>
                            
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-sm tw-text-gray-600">Search:</span>
                                <input 
                                    type="search" 
                                    className="form-control form-control-sm tw-w-64"
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
                                        <th>Customer Category</th>
                                        <th>Customer Sub Category</th>
                                        <th>Status</th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{startIndex + index}</td>
                                            <td>{item.customerCategory}</td>
                                            <td>{item.customerSubCategory}</td>
                                            <td>
                                                <span className={`badge ${item.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td>
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.Customer - Customer Sub Category.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/customer/customer-sub-category/edit/${item.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.Customer - Customer Sub Category.Delete') && (
<button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                </div>
                                            </td>
)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {sortedData.map((item, index) => (
                                <MobileCard key={item.id}>
                                    <MobileCard.Header label="#" value={startIndex + index} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                            <MobileCard.Field label="Customer Category" value={item.customerCategory} />
                                            <MobileCard.Field label="Customer Sub Category" value={item.customerSubCategory} />
                                            <MobileCard.Field label="Status" value={
                                                <span className={`badge ${item.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {item.status}
                                                </span>
                                            } />
                                        </div>
                                    </MobileCard.Body>
                                    {hasActionPermission && (
                                        <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                            <MobileCard.Actions>
                                                {hasPermission('Power Master.Customer - Customer Sub Category.Edit') && (
                                                    <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/customer/customer-sub-category/edit/${item.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('Power Master.Customer - Customer Sub Category.Delete') && (
                                                    <button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(item.id)}
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
                                <div className="tw-text-center tw-text-slate-400 tw-py-8">No data available in table</div>
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

export default CustomerSubList;
