import { useState, useEffect } from 'react';
import Select from 'react-select';
import TableSortIcon from '../../../components/TableSortIcon';
import SmartPagination from '../../../components/SmartPagination';
import { useSortableData } from '../../../hooks/useSortableData';

const StockReport = () => {
    const [stockData, setStockData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [productTypeOptions, setProductTypeOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const [productName, setProductName] = useState('');
    const [productType, setProductType] = useState(null);

    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStock = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/report/stock`);
                const json = await res.json();
                if (json.status && json.data) {
                    setStockData(json.data);
                    setFilteredData(json.data);

                    // Extract unique brand_names for Product Type filter
                    const uniqueTypes = [...new Set(json.data.map(item => item.brand_name).filter(Boolean))];
                    setProductTypeOptions(uniqueTypes.map(t => ({ value: t, label: t })));
                }
            } catch (error) {
                console.error("Failed to fetch stock data:", error);
            }
            setLoading(false);
        };

        fetchStock();
    }, []);

    const handleFilter = () => {
        let filtered = stockData;
        if (productName.trim()) {
            filtered = filtered.filter(item => 
                (item.model_name || '').toLowerCase().includes(productName.toLowerCase()) || 
                (item.product_name || '').toLowerCase().includes(productName.toLowerCase())
            );
        }
        if (productType) {
            filtered = filtered.filter(item => item.brand_name === productType.value);
        }
        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setProductName('');
        setProductType(null);
        setFilteredData(stockData);
        setCurrentPage(1);
    };

    const searchFilteredData = filteredData.filter(row => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            String(row.brand_name || '').toLowerCase().includes(searchLower) ||
            String(row.sub_category_name || '').toLowerCase().includes(searchLower) ||
            String(row.model_name || '').toLowerCase().includes(searchLower) ||
            String(row.product_name || '').toLowerCase().includes(searchLower)
        );
    });

    const { items: sortedData, requestSort, getSortDirection } = useSortableData(searchFilteredData);
    
    const totalPages = Math.ceil(sortedData.length / entriesPerPage) || 1;
    const startIndex = (currentPage - 1) * entriesPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + parseInt(entriesPerPage));

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border">
                        <h3 className="card-title">Stock Report</h3>
                    </div>
                    <div className="card-body">

                        {/* ── Filter row ── */}
                        <div className="row mb-3">
                            <div className="col-md-3 form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter product name"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>Product Type</label>
                                <Select
                                    options={productTypeOptions}
                                    value={productType}
                                    onChange={setProductType}
                                    placeholder="Select product type..."
                                    isClearable
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    menuPosition="fixed"
                                />
                            </div>
                            <div className="col-md-4 form-group d-flex align-items-end gap-2">
                                <button className="btn-save" onClick={handleFilter}>Filter</button>
                                <button className="btn-cancel" onClick={handleReset}>Reset</button>
                            </div>
                        </div>

                        <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-start align-items-md-center tw-gap-2 tw-mb-4 tw-text-sm tw-text-slate-600">
                            <div className="d-flex align-items-center tw-gap-2">
                                <span>Show</span>
                                <select className="form-select form-select-sm tw-w-20 tw-inline-block" value={entriesPerPage} onChange={(e) => {setEntriesPerPage(e.target.value); setCurrentPage(1);}}>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="d-flex align-items-center tw-gap-2">
                                <span>Search:</span>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm tw-w-48 tw-inline-block" 
                                    value={searchTerm} 
                                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
                                />
                            </div>
                        </div>

                        {/* ── Table ── */}
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                            <div className="tw-flex tw-justify-between tw-items-center">Sno</div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('brand_name')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Product Type <TableSortIcon direction={getSortDirection('brand_name')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('sub_category_name')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Sub Category <TableSortIcon direction={getSortDirection('sub_category_name')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('model_name')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Model <TableSortIcon direction={getSortDirection('model_name')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('product_name')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Product Name <TableSortIcon direction={getSortDirection('product_name')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('available_quantity')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Total Qty <TableSortIcon direction={getSortDirection('available_quantity')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('available_quantity')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Available Qty <TableSortIcon direction={getSortDirection('available_quantity')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('sold_stock')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Sold Stock <TableSortIcon direction={getSortDirection('sold_stock')} /></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center">Loading...</td>
                                        </tr>
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((row, idx) => {
                                            const availableQty = Number(row.available_quantity) || 0;
                                            const soldStock = Number(row.sold_stock) || 0;
                                            const totalQty = availableQty + Math.abs(soldStock);
                                            const displayName = row.product_name || '-';

                                            return (
                                                <tr key={idx}>
                                                    <td>{startIndex + idx + 1}</td>
                                                    <td>{row.brand_name || '-'}</td>
                                                    <td>{row.sub_category_name || '-'}</td>
                                                    <td>{row.model_name || '-'}</td>
                                                    <td>{displayName}</td>
                                                    <td className="tw-text-center">{totalQty}</td>
                                                    <td className="tw-text-center">{availableQty}</td>
                                                    <td className="tw-text-center">{Math.abs(soldStock)}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">No data found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center tw-mt-4 tw-text-sm">
                            <div>
                                Showing {paginatedData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + parseInt(entriesPerPage), sortedData.length)} of {sortedData.length} entries
                            </div>
                            <SmartPagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalEntries={sortedData.length}
                                startIndex={startIndex}
                                entriesPerPage={entriesPerPage}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default StockReport;
