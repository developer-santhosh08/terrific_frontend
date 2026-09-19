import { useTableControls } from '../../../hooks/useTableControls';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import MobileCard from '../../../components/common/MobileCard';

const STOCK_ROWS = [
    { id: 1, brand: 'COMPTECH', productName: 'CTSD 60- Compressor Spares Air Filter - CT00000483' },
    { id: 2, brand: 'COMPTECH', productName: 'CTSD 60- Compressor Spares Oil Filter'              },
    { id: 3, brand: 'COMPTECH', productName: 'CTSD 60- Compressor Spares Belt Set'                },
    { id: 4, brand: 'COMPTECH', productName: 'CTSD 60- Compressor Spares Separator Element'       },
];

const StockTransferList = () => {
    const [from,       setFrom]       = useState(null);
    const [to,         setTo]         = useState(null);
    const [stockLocationOptions, setStockLocationOptions] = useState([]);
    const [rows,       setRows]       = useState(
        STOCK_ROWS.map(r => ({ ...r, serial1: '', serial2: '', checked: false }))
    );

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/stockLocationType`, { headers });
                const result = await response.json();
                if (result.status && result.data) {
                    const formatted = result.data.map(loc => ({
                        value: loc.id,
                        label: loc.name
                    }));
                    setStockLocationOptions(formatted);
                }
            } catch (err) {
                console.error("Failed to fetch stock locations:", err);
            }
        };
        fetchLocations();
    }, []);

    const updateRow = (id, field, value) =>
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

    const handleSubmit = (e) => {
        e.preventDefault();
        const selected = rows.filter(r => r.checked);
        console.log('Transfer from:', from, 'to:', to, 'items:', selected);
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border">
                        <h3 className="card-title">Stock Transfer</h3>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit}>

                            {/* ── From / To row ── */}
                            <div className="row mb-3">
                                <div className="col-md-3 form-group">
                                    <label style={{ color: '#0f172a', fontWeight: 600 }}>From</label>
                                    <Select
                                        options={stockLocationOptions}
                                        value={from}
                                        onChange={setFrom}
                                        placeholder="Choose Stock Location..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>

                                <div className="col-md-3 form-group">
                                    <label style={{ color: '#0f172a', fontWeight: 600 }}>To</label>
                                    <Select
                                        options={stockLocationOptions}
                                        value={to}
                                        onChange={setTo}
                                        placeholder="Choose Stock Location..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>

                            {/* ── Product table ── */}
                            <div className="tw-hidden md:tw-block">
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{ width: 50 }}>#</th>
                                            <th style={{ width: 140 }}>Brand</th>
                                            <th>Product Name</th>
                                            <th style={{ width: 200 }}>Serial No 1</th>
                                            <th style={{ width: 200 }}>Serial No 2</th>
                                            <th style={{ width: 70 }} className="tw-text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, idx) => (
                                            <tr key={row.id}>
                                                <td>{idx + 1}</td>
                                                <td style={{ color: '#0f172a', fontWeight: 600 }}>{row.brand}</td>
                                                <td style={{ color: '#0f172a' }}>{row.productName}</td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder=""
                                                        value={row.serial1}
                                                        onChange={(e) => updateRow(row.id, 'serial1', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder=""
                                                        value={row.serial2}
                                                        onChange={(e) => updateRow(row.id, 'serial2', e.target.value)}
                                                    />
                                                </td>
                                                <td className="tw-text-center tw-align-middle">
                                                    <div className="tw-flex tw-justify-center tw-items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`stock-check-${row.id}`}
                                                            checked={row.checked}
                                                            onChange={(e) => updateRow(row.id, 'checked', e.target.checked)}
                                                        />
                                                        <label htmlFor={`stock-check-${row.id}`} style={{ marginBottom: 0 }} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            </div>

                            {/* Mobile View */}
                            <div className="md:tw-hidden tw-flex tw-flex-col tw-mt-4 tw-gap-4">
                                {rows.map((row) => (
                                    <MobileCard key={row.id}>
                                        <MobileCard.Header label="BRAND" value={row.brand} />
                                        <MobileCard.Body>
                                            <div className="tw-text-sm tw-font-medium tw-text-gray-900 tw-mb-3">{row.productName}</div>
                                            <div className="tw-grid tw-grid-cols-1 tw-gap-3">
                                                <div>
                                                    <div className="tw-text-xs tw-text-slate-500 tw-mb-1">Serial No 1</div>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={row.serial1}
                                                        onChange={(e) => updateRow(row.id, 'serial1', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="tw-text-xs tw-text-slate-500 tw-mb-1">Serial No 2</div>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={row.serial2}
                                                        onChange={(e) => updateRow(row.id, 'serial2', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </MobileCard.Body>
                                        <MobileCard.Footer>
                                            <div className="tw-flex tw-items-center tw-gap-2 tw-py-1">
                                                <input
                                                    type="checkbox"
                                                    id={`stock-check-mob-${row.id}`}
                                                    checked={row.checked}
                                                    onChange={(e) => updateRow(row.id, 'checked', e.target.checked)}
                                                    className="tw-w-4 tw-h-4"
                                                />
                                                <label htmlFor={`stock-check-mob-${row.id}`} className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-0">Select for Transfer</label>
                                            </div>
                                        </MobileCard.Footer>
                                    </MobileCard>
                                ))}
                            </div>

                            {/* ── Footer ── */}
                            <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setFrom(null);
                                        setTo(null);
                                        setRows(STOCK_ROWS.map(r => ({ ...r, serial1: '', serial2: '', checked: false })));
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">Transfer</button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StockTransferList;
