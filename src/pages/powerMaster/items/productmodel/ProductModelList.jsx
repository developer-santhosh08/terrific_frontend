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
const ProductModelList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Items - Product Model.Edit') || hasPermission('Power Master.Items - Product Model.Delete');
    

    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [data, setData] = useState([]);
    const { loading, setLoading } = useLoader();

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        try {
                
                
                // Fetch sub categories to map id to name
                const __apiRes = await apiFetch(`/master/productSubCategory`);
                if (!__apiRes) return;
                const subCatResult = __apiRes.json;
                let subCatMap = {};
                if (subCatResult.status && subCatResult.data) {
                    subCatResult.data.forEach(item => {
                        subCatMap[item.id] = item.name;
                    });
                }
                
                // Fetch product models
                const __apiRes2 = await apiFetch(`/master/productModel`);
                if (!__apiRes2) return;
                const result = __apiRes2.json;
                if (result.status && result.data) {
                    const formattedData = result.data.map(item => ({
                        id: item.id,
                        productSubCategory: subCatMap[item.product_sub_category_id] || 'Unknown',
                        productModelName: item.name,
                        status: item.status === 1 ? 'Active' : 'Inactive'
                    })).reverse();
                    setData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            
            const __apiRes3 = await apiFetch(`/master/productModel/${pendingDeleteId}`, { method: 'DELETE' });
                if (!__apiRes3) return;
                const result = __apiRes3.json;
            if (result.status) {
                setData(prev => prev.filter(d => d.id !== pendingDeleteId));
            } else {
                alert(result.message || "Failed to delete product model");
            }
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Error deleting product model");
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
                        <h3 className="card-title">Product Model Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Items - Product Model.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/items/product-model/add')}
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
                                        <th onClick={() => handleSort('productSubCategory')} className="tw-cursor-pointer tw-select-none">Product Sub Category <TableSortIcon direction={sortConfig.key === 'productSubCategory' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('productModelName')} className="tw-cursor-pointer tw-select-none">Product Model Name <TableSortIcon direction={sortConfig.key === 'productModelName' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="text-center tw-py-4">Loading...</td>
                                        </tr>
                                    ) : (
                                        sortedData.map((e, index) => (
                                            <tr key={index}>
                                                <td className="align-middle">{startIndex + index}</td>
                                                <td className="align-middle">{e.productSubCategory}</td>
                                                <td className="align-middle">{e.productModelName}</td>
                                                <td className="align-middle">
                                                    <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                        {e.status}
                                                    </span>
                                                </td>
                                                {hasActionPermission && (
<td className="align-middle">
                                                    <div className="tw-flex tw-gap-2">
                                                        {hasPermission('Power Master.Items - Product Model.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/items/product-model/edit/${e.id}`)}>
                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                        </button>
)}
                                                        {hasPermission('Power Master.Items - Product Model.Delete') && (
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
                                    )}
                                    {!loading && sortedData.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 5 : 4} className="text-center tw-py-4">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {loading ? (
                                <div className="tw-text-center tw-py-4">Loading...</div>
                            ) : sortedData.length > 0 ? (
                                sortedData.map((e, index) => (
                                    <MobileCard key={index}>
                                        <MobileCard.Header label="#" value={startIndex + index} />
                                        <MobileCard.Body>
                                            <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                                <MobileCard.Field label="Product Sub Category" value={e.productSubCategory} />
                                                <MobileCard.Field label="Product Model Name" value={e.productModelName} />
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
                                                    {hasPermission('Power Master.Items - Product Model.Edit') && (
                                                        <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/items/product-model/edit/${e.id}`)}>
                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                        </button>
                                                    )}
                                                    {hasPermission('Power Master.Items - Product Model.Delete') && (
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

export default ProductModelList;
