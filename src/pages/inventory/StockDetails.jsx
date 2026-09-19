import { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import TableSortIcon from '../../components/TableSortIcon';
import { useLoader } from '../../context/LoaderContext';
import Pagination from '../../components/Pagination';
import MobileCard from '../../components/common/MobileCard';

/* ── Options ──────────────────────────────────────────────────── */
const locationOptions = [
    { value: 'terrific', label: 'Terrific' },
    { value: 'warehouse_a', label: 'Warehouse A' },
    { value: 'warehouse_b', label: 'Warehouse B' },
];

const subCategoryOptions = [
    { value: '7.5kw', label: '7.5kw' },
    { value: '11kw', label: '11kw' },
    { value: '15kw', label: '15kw' },
    { value: '22kw', label: '22kw' },
    { value: '37kw', label: '37kw' },
];

const rsStyles = {
    control: (b) => ({ ...b, minHeight: 36, background: '#fff' }),
    menu: (b) => ({ ...b, zIndex: 9999 }),
};



/* ── Component ────────────────────────────────────────────────── */
const StockDetails = () => {
    const { setLoading } = useLoader();
    const [location, setLocation] = useState({ value: 'terrific', label: 'Terrific' });
    const [subCategory, setSubCategory] = useState(null);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [stockData, setStockData] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchStockData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/stock`, { signal: controller.signal });
                const result = await response.json();
                if (result.status && result.data) {
                    const mappedData = result.data.map(item => ({
                        id: item.product_id,
                        brandName: item.brand_name,
                        subCategory: item.sub_category_name,
                        productName: item.product_name,
                        modelName: item.model_name,
                        availableQty: item.available_quantity
                    }));
                    setStockData(mappedData);
                }
            } catch (error) {
                if (error.name !== 'AbortError') console.error("Error fetching stock data:", error);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchStockData();

        return () => controller.abort();
    }, []);

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
        setPage(1);
    };
    const getSortDir = (key) => sortKey === key ? sortDir : null;

    const filtered = useMemo(() => {
        let data = [...stockData];
        if (subCategory) data = data.filter(r => r.subCategory === subCategory.value);
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(r =>
                r.brandName?.toLowerCase().includes(q) ||
                r.subCategory?.toLowerCase().includes(q) ||
                r.productName?.toLowerCase().includes(q) ||
                r.modelName?.toLowerCase().includes(q)
            );
        }
        if (sortKey) {
            data.sort((a, b) => {
                let av = a[sortKey];
                let bv = b[sortKey];
                if (av === bv) return 0;
                if (av == null) return sortDir === 'asc' ? 1 : -1;
                if (bv == null) return sortDir === 'asc' ? -1 : 1;
                
                if (typeof av === 'number' && typeof bv === 'number') {
                    return sortDir === 'asc' ? av - bv : bv - av;
                }
                
                av = String(av);
                bv = String(bv);
                return sortDir === 'asc' 
                    ? av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' })
                    : bv.localeCompare(av, undefined, { numeric: true, sensitivity: 'base' });
            });
        }
        return data;
    }, [stockData, subCategory, search, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const paginated = filtered.slice(startIdx, startIdx + pageSize);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">

                    {/* Header */}
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Stock Details</h3>
                        {/* <i className="bi bi-arrows-fullscreen tw-text-slate-400 tw-cursor-pointer" style={{ fontSize: 14 }} /> */}
                    </div>

                    <div className="card-body">

                        {/* Filters */}
                        <div className="row tw-mb-4 align-items-end">
                            <div className="col-md-3 form-group">
                                <label>Stock Location</label>
                                <Select
                                    options={locationOptions}
                                    value={location}
                                    onChange={setLocation}
                                    styles={rsStyles}
                                />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>Product Sub Category</label>
                                <Select
                                    options={subCategoryOptions}
                                    value={subCategory}
                                    onChange={opt => { setSubCategory(opt); setPage(1); }}
                                    isClearable
                                    placeholder="Choose a Product Sub Category"
                                    styles={rsStyles}
                                />
                            </div>
                            <div className="col-auto form-group d-flex tw-gap-2">
                                <button
                                    type="button"
                                    className="btn-save"
                                    onClick={() => setPage(1)}
                                >
                                    Filter
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setLocation({ value: 'terrific', label: 'Terrific' });
                                        setSubCategory(null);
                                        setSearch('');
                                        setPage(1);
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Show entries + Search */}
                        <div className="list-top-bar tw-mb-4 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                <span>Show</span>
                                <select
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={pageSize}
                                    onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                <span className="tw-whitespace-nowrap">Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-flex-1 md:tw-w-48 tw-inline-block"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="tw-hidden md:tw-block">
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('id')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">S.No <TableSortIcon direction={getSortDir('id')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('brandName')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Product Category<TableSortIcon direction={getSortDir('brandName')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('subCategory')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Product Sub Category <TableSortIcon direction={getSortDir('subCategory')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('modelName')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Model <TableSortIcon direction={getSortDir('modelName')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('productName')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Product Name <TableSortIcon direction={getSortDir('productName')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('availableQty')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Available Quantity <TableSortIcon direction={getSortDir('availableQty')} /></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((row, idx) => (
                                        <tr key={row.id}>
                                            <td className="tw-align-middle">{startIdx + idx + 1}</td>
                                            <td className="tw-align-middle">{row.brandName}</td>
                                            <td className="tw-align-middle">{row.subCategory}</td>
                                            <td className="tw-align-middle">{row.modelName}</td>
                                            <td className="tw-align-middle">{row.productName}</td>
                                            <td className="tw-align-middle">{row.availableQty}</td>
                                        </tr>
                                    ))}
                                    {paginated.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        </div>

                        {/* Mobile View */}
                        <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4">
                            {paginated.map((row, idx) => (
                                <MobileCard key={row.id || idx}>
                                    <MobileCard.Header label="PRODUCT CATEGORY" value={row.brandName || '-'} />
                                    <MobileCard.Body>
                                        <MobileCard.Field label="Product Sub Category" value={row.subCategory || '-'} bold />
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                            <MobileCard.Field label="Model" value={row.modelName || '-'} />
                                            <MobileCard.Field label="Product Name" value={row.productName || '-'} align="right" />
                                            <MobileCard.Field label="Available Qty" value={row.availableQty} bold valueColor="green" />
                                        </div>
                                    </MobileCard.Body>
                                </MobileCard>
                            ))}
                            {paginated.length === 0 && (
                                <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                                    No records found
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-sm tw-text-slate-500">
                                Showing {filtered.length === 0 ? 0 : startIdx + 1} to {Math.min(startIdx + pageSize, filtered.length)} of {filtered.length} entries
                            </div>
                            <Pagination 
                                currentPage={safePage} 
                                totalPages={totalPages} 
                                onPageChange={setPage} 
                            />
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default StockDetails;
