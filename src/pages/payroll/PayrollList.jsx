import { useTableControls } from '../../hooks/useTableControls';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../components/TableSortIcon';
import { useLoader } from '../../context/LoaderContext';
import { usePermissions } from '../../context/PermissionContext';
import MobileCard from '../../components/common/MobileCard';

const PayrollList = () => {
    const { hasPermission } = usePermissions();
    const hasEditPermission = hasPermission('Payroll.Payroll List.Edit');
    const { setLoading } = useLoader();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [listData, setListData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payroll/list`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const json = await res.json();
                if (res.ok && json.status === 'success') {
                    setListData(json.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch payroll list", err);
            } finally {
                setLoading(false);
            }
        };
        fetchList();
    }, [setLoading]);

    const [search, setSearch]         = useState('');
    const [pageSize, setPageSize]     = useState(10);
    const [page, setPage]             = useState(1);
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
        setPage(1);
    };

    const handleSearch = (val) => { setSearch(val); setPage(1); };
    const handlePageSize = (val) => { setPageSize(Number(val)); setPage(1); };

    const filtered = listData.filter(r =>
        r.date?.toLowerCase().includes(search.toLowerCase()) ||
        String(r.al_present).includes(search) ||
        String(r.al_absent).includes(search) ||
        String(r.al_ot).includes(search)
    );

    const sorted = [...filtered].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const av = a[sortConfig.key], bv = b[sortConfig.key];
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage   = Math.min(page, totalPages);
    const start      = (safePage - 1) * pageSize;
    const paginated  = sorted.slice(start, start + pageSize);
    const showFrom   = sorted.length === 0 ? 0 : start + 1;
    const showTo     = Math.min(start + pageSize, sorted.length);

    const cols = [
        { key: 'date',       label: 'Date'          },
        { key: 'al_present', label: 'al_present'    },
        { key: 'al_absent',  label: 'al_absent'     },
        { key: 'al_ot',      label: 'al_ot'         },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Payroll List</h3>
                    </div>
                    <div className="card-body">

                        {/* Show entries + Search */}
                        <div className="list-top-bar">
                            <div className="d-flex align-items-center">
                                <span>Show</span>
                                <select
                                    className="form-select form-select-sm mx-2 tw-w-20 tw-border-slate-300"
                                    value={pageSize}
                                    onChange={e => handlePageSize(e.target.value)}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="me-2">Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-border-slate-300"
                                    style={{ width: 'auto' }}
                                    value={search}
                                    onChange={e => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive tw-hidden md:tw-block">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-cursor-pointer tw-select-none" onClick={() => handleSort('id')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Sno <TableSortIcon direction={sortConfig.key === 'id' ? sortConfig.direction : null} /></div>
                                        </th>
                                        {cols.map(c => (
                                            <th key={c.key} className="tw-cursor-pointer tw-select-none" onClick={() => handleSort(c.key)}>
                                                <div className="tw-flex tw-justify-between tw-items-center">{c.label} <TableSortIcon direction={sortConfig.key === c.key ? sortConfig.direction : null} /></div>
                                            </th>
                                        ))}
                                        {hasEditPermission && (
                                            <th>
                                                <div className="tw-flex tw-justify-between tw-items-center">Action <TableSortIcon direction={null} /></div>
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((row, idx) => (
                                        <tr key={row.id}>
                                            <td className="tw-align-middle tw-text-center">{start + idx + 1}</td>
                                            <td className="tw-align-middle tw-text-center">{row.date}</td>
                                            <td className="tw-align-middle tw-text-center">{row.al_present}</td>
                                            <td className="tw-align-middle tw-text-center">{row.al_absent}</td>
                                            <td className="tw-align-middle tw-text-center">{row.al_ot}</td>
                                            {hasEditPermission && (
                                                <td className="tw-align-middle tw-text-center">
                                                    <button
                                                        type="button"
                                                        className="list-action-btn btn-edit"
                                                        onClick={() => navigate('/payroll/salary', { state: { selectedDate: row.raw_date } })}
                                                    >
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {paginated.length === 0 && (
                                        <tr>
                                            <td colSpan={hasEditPermission ? 6 : 5} className="tw-text-center tw-text-slate-400 tw-py-8">
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {paginated.map((row, idx) => (
                                <MobileCard key={row.id}>
                                    <MobileCard.Header label="Sno" value={start + idx + 1} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                            <MobileCard.Field label="Date" value={row.date} />
                                            <MobileCard.Field label="al_present" value={row.al_present} />
                                            <MobileCard.Field label="al_absent" value={row.al_absent} />
                                            <MobileCard.Field label="al_ot" value={row.al_ot} />
                                        </div>
                                    </MobileCard.Body>
                                    {hasEditPermission && (
                                        <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                            <MobileCard.Actions>
                                                <button
                                                    type="button"
                                                    className="list-action-btn btn-edit"
                                                    onClick={() => navigate('/payroll/salary', { state: { selectedDate: row.raw_date } })}
                                                >
                                                    <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                </button>
                                            </MobileCard.Actions>
                                        </MobileCard.Footer>
                                    )}
                                </MobileCard>
                            ))}
                            {paginated.length === 0 && (
                                <div className="tw-text-center tw-text-slate-400 tw-py-8">No records found</div>
                            )}
                        </div>

                        {/* Bottom: Showing info + Pagination */}
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div className="tw-text-xs tw-text-slate-500">
                                Showing {showFrom} to {showTo} of {sorted.length} entries
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-3 tw-text-sm">
                                <span
                                    className={`tw-cursor-pointer ${safePage === 1 ? 'tw-text-slate-300' : 'tw-text-slate-500 hover:tw-text-blue-600'}`}
                                    onClick={() => safePage > 1 && setPage(safePage - 1)}
                                >
                                    Previous
                                </span>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <span
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`tw-px-3 tw-py-1 tw-rounded-sm tw-cursor-pointer ${p === safePage ? 'tw-bg-blue-600 tw-text-white' : 'tw-text-slate-500 hover:tw-text-blue-600'}`}
                                    >
                                        {p}
                                    </span>
                                ))}
                                <span
                                    className={`tw-cursor-pointer ${safePage === totalPages ? 'tw-text-slate-300' : 'tw-text-slate-500 hover:tw-text-blue-600'}`}
                                    onClick={() => safePage < totalPages && setPage(safePage + 1)}
                                >
                                    Next
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default PayrollList;
