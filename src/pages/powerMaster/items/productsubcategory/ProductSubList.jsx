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

const ProductSubList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Items - Product Sub Category.Edit') || hasPermission('Power Master.Items - Product Sub Category.Delete');
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        try {
                const [catRes, subCatRes, prodRes] = await Promise.all([
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/productCategory'),
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/productSubCategory'),
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/dropdown/product')
                ]);

                const [catResult, subCatResult, prodResult] = await Promise.all([
                    catRes.json(),
                    subCatRes.json(),
                    prodRes.json()
                ]);

                let catMap = {};
                if (catResult.status && catResult.data) {
                    catResult.data.forEach(item => catMap[item.id] = item.name);
                }

                let prodMap = {};
                if (prodResult.status && prodResult.data) {
                    prodResult.data.forEach(item => prodMap[item.id] = item.name);
                }

                if (subCatResult.status && Array.isArray(subCatResult.data)) {
                    const formattedData = subCatResult.data.map(item => ({
                        id: item.id,
                        product: prodMap[item.product_id] || 'Unknown',
                        productCategory: catMap[item.product_category_id] || 'Unknown',
                        productSubCategory: item.name,
                        status: item.status === 1 ? 'Active' : 'Inactive'
                    })).reverse();
                    setData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching product sub category data:", error);
            } finally {
                if (setLoading) setLoading(false);
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
            await fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/productSubCategory/${pendingDeleteId}', { method: 'DELETE' });
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
                        <h3 className="card-title">Product Sub Category Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Items - Product Sub Category.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/items/product-sub-category/add')}
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
                                        <th onClick={() => handleSort('productCategory')} className="tw-cursor-pointer tw-select-none">Product Category <TableSortIcon direction={sortConfig.key === 'productCategory' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('productSubCategory')} className="tw-cursor-pointer tw-select-none">Product Sub Category <TableSortIcon direction={sortConfig.key === 'productSubCategory' ? sortConfig.direction : null} /></th>
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
                                            <tr key={e.id}>
                                                <td className="align-middle">{startIndex + index}</td>
                                                <td className="align-middle">{e.productCategory}</td>
                                                <td className="align-middle">{e.productSubCategory}</td>
                                                <td className="align-middle">
                                                    <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                        {e.status}
                                                    </span>
                                                </td>
                                                {hasActionPermission && (
<td className="align-middle">
                                                    <div className="tw-flex tw-gap-2">
                                                        {hasPermission('Power Master.Items - Product Sub Category.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/items/product-sub-category/edit/${e.id}`)}>
                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                        </button>
)}
                                                        {hasPermission('Power Master.Items - Product Sub Category.Delete') && (
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

                        {/* Bottom controls: Showing entries and Pagination */}
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            
                            
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

export default ProductSubList;
