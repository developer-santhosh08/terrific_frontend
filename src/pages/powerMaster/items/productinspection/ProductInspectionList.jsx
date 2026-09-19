import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimple as PencilSimpleIcon, Plus as PlusIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import { apiFetch } from '../../../../lib/api';
import { usePermissions } from '../../../../context/PermissionContext';
import MobileCard from '../../../../components/common/MobileCard';
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {

            return (
                <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24' }}>
                    <h1>Something went wrong.</h1>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.toString()}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}

const ProductInspectionListContent = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Items.Edit') || hasPermission('Power Master.Items.Delete');
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const { loading, setLoading } = useLoader();

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        try {
                const [mapRes, prodRes] = await Promise.all([
                    apiFetch('/master/vendorProductMapping'),
                    apiFetch('/master/dropdown/product')
                ]);
                const mapJson = mapRes?.json || {};
                const prodJson = prodRes?.json || {};

                const prodMap = {};
                if (prodJson.status && prodJson.data) {
                    prodJson.data.forEach(p => { prodMap[p.id] = p.name; });
                }

                if (mapJson.status && mapJson.data) {
                    const formattedData = mapJson.data.map(item => ({
                        id: item.id,
                        product: prodMap[item.product_id] || 'Unknown',
                        noQuestion: 'N/A',
                        status: item.status === 1 ? 'Active' : 'Inactive'
                    }));
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
                        <h3 className="card-title">Product Inspection Mapping Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Items.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/items/product-inspection-mapping/add')}
                                >
                                    <PlusIcon weight="bold" className="tw-w-4 text-white" />
                                    <span className="text-white">Create New</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="card-body">
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
                                        <th onClick={() => handleSort('product')} className="tw-cursor-pointer tw-select-none">Product <TableSortIcon direction={sortConfig.key === 'product' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('noQuestion')} className="tw-cursor-pointer tw-select-none">No.Question <TableSortIcon direction={sortConfig.key === 'noQuestion' ? sortConfig.direction : null} /></th>
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
                                                <td className="align-middle">{e.product}</td>
                                                <td className="align-middle">{e.noQuestion}</td>
                                                <td className="align-middle">
                                                    <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                        {e.status}
                                                    </span>
                                                </td>
                                                {hasActionPermission && (
<td className="align-middle">
                                                    <div className="tw-flex tw-gap-2">
                                                        {hasPermission('Power Master.Items.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/items/product-inspection-mapping/edit/${e.id}`)}>
                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
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
                                    <MobileCard key={e.id}>
                                        <MobileCard.Header label="#" value={startIndex + index} />
                                        <MobileCard.Body>
                                            <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                                <MobileCard.Field label="Product" value={e.product} />
                                                <MobileCard.Field label="No.Question" value={e.noQuestion} />
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
                                                    {hasPermission('Power Master.Items.Edit') && (
                                                        <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/items/product-inspection-mapping/edit/${e.id}`)}>
                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
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

                        {sortedData.length > 0 && (
                            <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                                
                                
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

const ProductInspectionList = () => (
    <ErrorBoundary>
        <ProductInspectionListContent />
    </ErrorBoundary>
);

export default ProductInspectionList;
