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
const ProductCategoryList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Items - Product Category.Edit') || hasPermission('Power Master.Items - Product Category.Delete');
    

    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [data, setData] = useState([]);
    const { loading, setLoading } = useLoader();

    useEffect(() => {
        const fetchProductCategories = async () => {
            setLoading(true);
            try {
                const __apiRes = await apiFetch(`/master/productCategory`);
                if (!__apiRes) return;
                const result = __apiRes.json;
                if (result.status && result.data) {
                    const mappedData = result.data.map(item => ({
                        id: item.id,
                        productCategory: item.name || '',
                        status: item.status_label || (item.status === 1 ? 'Active' : 'Inactive')
                    }));
                    setData(mappedData.sort((a, b) => b.id - a.id));
                }
            } catch (error) {
                console.error("Error fetching product categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductCategories();
    }, []);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await apiFetch(`/master/productCategory/${pendingDeleteId}`, { method: 'DELETE' });
            if (response.res.ok || (response.json).status) {
                setData(prev => prev.filter(d => d.id !== pendingDeleteId));
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
                        <h3 className="card-title">Product Category Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Items - Product Category.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/items/product-category/add')}
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
                                        <th onClick={() => handleSort('productCategory')} className="tw-cursor-pointer tw-select-none">Product Category <TableSortIcon direction={sortConfig.key === 'productCategory' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="text-center tw-py-4 text-slate-500">Loading...</td>
                                        </tr>
                                    ) : sortedData.length > 0 ? (
                                        sortedData.map((e, index) => (
                                            <tr key={e.id}>
                                                <td className="align-middle">{startIndex + index}</td>
                                                <td className="align-middle">{e.productCategory}</td>
                                                <td className="align-middle">
                                                    <span className={`badge ${e.status === 'Active' || e.status === 1 ? 'bg-success' : 'bg-danger'}`}>
                                                        {e.status}
                                                    </span>
                                                </td>
                                                {hasActionPermission && (
<td className="align-middle">
                                                    <div className="tw-flex tw-gap-2">
                                                        {hasPermission('Power Master.Items - Product Category.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/items/product-category/edit/${e.id}`)}>
                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                        </button>
)}
                                                        {hasPermission('Power Master.Items - Product Category.Delete') && (
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
                                            <td colSpan={hasActionPermission ? 4 : 3} className="text-center tw-py-4">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {loading ? (
                                <div className="tw-text-center tw-py-4 text-slate-500">Loading...</div>
                            ) : sortedData.length > 0 ? (
                                sortedData.map((e, index) => (
                                    <MobileCard key={e.id}>
                                        <MobileCard.Header label="#" value={startIndex + index} />
                                        <MobileCard.Body>
                                            <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                                <MobileCard.Field label="Product Category" value={e.productCategory} />
                                                <MobileCard.Field label="Status" value={
                                                    <span className={`badge ${e.status === 'Active' || e.status === 1 ? 'bg-success' : 'bg-danger'}`}>
                                                        {e.status}
                                                    </span>
                                                } />
                                            </div>
                                        </MobileCard.Body>
                                        {hasActionPermission && (
                                            <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                                <MobileCard.Actions>
                                                    {hasPermission('Power Master.Items - Product Category.Edit') && (
                                                        <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/items/product-category/edit/${e.id}`)}>
                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                        </button>
                                                    )}
                                                    {hasPermission('Power Master.Items - Product Category.Delete') && (
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
                                ))
                            ) : (
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

export default ProductCategoryList;
