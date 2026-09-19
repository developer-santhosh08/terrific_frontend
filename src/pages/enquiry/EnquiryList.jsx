import { useTableControls } from '../../hooks/useTableControls';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilSimpleIcon, TrashIcon, PrinterIcon, EyeSlash } from '@phosphor-icons/react';
import TableSortIcon from '../../components/TableSortIcon';
import SmartPagination from '../../components/SmartPagination';
import { useSortableData } from '../../hooks/useSortableData';
import { apiFetch } from '../../lib/api';
import { useLoader } from '../../context/LoaderContext';
import DeletePopup from '../../components/Popup/DeletePopup';
import ClosePopup from '../../components/Popup/ClosePopup';
import { usePermissions } from '../../context/PermissionContext';
import MobileCard from '../../components/common/MobileCard';

const EnquiryList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Enquiry.Enquiry.Edit') || hasPermission('Enquiry.Enquiry.Delete') || hasPermission('Enquiry.Enquiry.Print') || hasPermission('Enquiry.Enquiry.Close');
    const navigate = useNavigate();

    const [enquiries, setEnquiries] = useState([]);
    const { setLoading } = useLoader();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch mapping data and enquiries simultaneously
            const [custRes, vertRes, empRes, stageRes, res] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/customer`),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/business_vertical`),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/employee`),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/terrific_stages`),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/enquiry`)
            ]);

            const [custJson, vertJson, empJson, stageJson, json] = await Promise.all([
                custRes.json(),
                vertRes.json(),
                empRes.json(),
                stageRes.json(),
                res.json()
            ]);

            const custMap = {};
            if (custJson.status && custJson.data) custJson.data.forEach(c => custMap[c.id] = c.name);

            const vertMap = {};
            if (vertJson.status && vertJson.data) vertJson.data.forEach(v => vertMap[v.id] = v.name);

            const empMap = {};
            if (empJson.status && empJson.data) empJson.data.forEach(e => empMap[e.id] = e.name);

            const stageMap = {};
            if (stageJson.status && stageJson.data) stageJson.data.forEach(s => stageMap[s.id] = s.name);

            if (json.status === 'success' && json.data) {
                const reversedData = [...json.data].sort((a, b) => b.id - a.id);
                const mappedData = reversedData.map(item => ({
                    id: item.id,
                    enqNo: item.enquiry_number || '',
                    enqDate: item.enquiry_date || '',
                    commtDate: item.last_committed_date || '',
                    customerName: custMap[item.customer_id] || item.cust_contact_name || item.customer_id || 'Unknown',
                    mobile: item.mobile_number1 || '',
                    vertical: vertMap[item.business_vertical_id] || item.business_vertical_id || '',
                    allottedTo: empMap[item.allotted_id] || item.allotted_id || '',
                    currentStage: item.current_stage || stageMap[item.enquiry_status_id] || (item.status == 1 ? 'Active' : 'Inactive'),
                    stageColor: item.stage_color,
                    stageId: item.stage_id || 1,
                    products: item.details || [] // for printing
                }));
                setEnquiries(mappedData);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [deletePopupOpen, setDeletePopupOpen] = useState(false);
    const [enquiryToDelete, setEnquiryToDelete] = useState(null);

    const confirmDelete = (id) => {
        setEnquiryToDelete(id);
        setDeletePopupOpen(true);
    };

    const handleDelete = async () => {
        if (!enquiryToDelete) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/enquiry/${enquiryToDelete}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (json.status) {
                setDeletePopupOpen(false);
                setEnquiryToDelete(null);
                fetchData();
            } else {
                alert(json.message || 'Failed to delete enquiry');
            }
        } catch (err) {
            console.error('Error deleting enquiry:', err);
            alert('An error occurred while deleting the enquiry');
        }
    };

    const [closePopupOpen, setClosePopupOpen] = useState(false);
    const [enquiryToClose, setEnquiryToClose] = useState(null);

    const confirmClose = (id) => {
        setEnquiryToClose(id);
        setClosePopupOpen(true);
    };

    const handleClose = async () => {
        if (!enquiryToClose) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/enquiry/${enquiryToClose}/close`, {
                method: 'PUT'
            });
            const json = await res.json();
            if (json.status === 'success') {
                setClosePopupOpen(false);
                setEnquiryToClose(null);
                fetchData();
            } else {
                alert(json.message || 'Failed to close enquiry');
            }
        } catch (err) {
            console.error('Error closing enquiry:', err);
            alert('An error occurred while closing the enquiry');
        }
    };

    const { items: sortedEnquiries, requestSort, getSortDirection } = useSortableData(enquiries);

    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredEnquiries = useMemo(() => {
        const q = (searchText || '').toString().trim().toLowerCase();
        if (!q) return sortedEnquiries;
        return sortedEnquiries.filter(e => {
            return (
                (e.enqNo || '').toString().toLowerCase().includes(q) ||
                (e.enqDate || '').toString().toLowerCase().includes(q) ||
                (e.commtDate || '').toString().toLowerCase().includes(q) ||
                (e.customerName || '').toString().toLowerCase().includes(q) ||
                (e.mobile || '').toString().toLowerCase().includes(q) ||
                (e.vertical || '').toString().toLowerCase().includes(q) ||
                (e.allottedTo || '').toString().toLowerCase().includes(q) ||
                (e.currentStage || '').toString().toLowerCase().includes(q)
            );
        });
    }, [sortedEnquiries, searchText]);

    const total = filteredEnquiries.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize, searchText]);

    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filteredEnquiries.slice(startIndex, startIndex + pageSize);

    const openPrintWindow = (enq) => {
        const products = enq.products || [];
        const subtotal = products.reduce((s, p) => s + (Number(p.perUnit || 0) * Number(p.qty || 0)), 0).toFixed(2);
        const totalTax = products.reduce((s, p) => s + (Number(p.taxAmount || 0)), 0).toFixed(2);
        const netTotal = (Number(subtotal) + Number(totalTax)).toFixed(2);

        const html = `
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Print Enquiry</title>
                <style>
                    @page { size: A4; margin: 20mm }
                    body { font-family: Arial, Helvetica, sans-serif; color: #222; padding: 10px }
                    .print-table { width:100%; border-collapse: collapse; font-size:12px }
                    .print-table th, .print-table td { border:1px solid #ccc; padding:6px }
                    .print-table thead th { background:#d8e6f1; font-weight:700 }
                    .summary { width:320px; float:right; margin-top:8px }
                    .inv-header { background:#12366a;color:#fff;padding:18px 20px;margin-bottom:12px }
                    .inv-company { letter-spacing:1px }
                </style>
            </head>
            <body>
                <div class="inv-header">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <div>
                            <h3 class="inv-company" style="margin:0">MACAWFIT</h3>
                            <div style="font-size:12px;opacity:0.9">Lifestyle & Fitness Studio</div>
                        </div>
                        <div style="text-align:right">
                            <h3 style="margin:0">INVOICE</h3>
                        </div>
                    </div>
                    <div style="font-size:12px;margin-top:8px;opacity:0.95">Macaw Fit Lifestyle And Fitness Studio, 4B Vctv Main Road, 2nd & 3rd Floor, Shakthi Road, Opposite To Lotus Tvs Agency, Erode - 638003 | Phone: 9500232003 | GST: 33CDAPA3408D2ZH</div>
                </div>
                <div style="border:1px solid #ddd;padding:10px;margin-bottom:12px;display:flex;justify-content:space-between">
                    <div style="width:65%"><div><strong>To :</strong></div><div>${enq.customerName || ''}</div><div>Phone : ${enq.mobile || ''}</div></div>
                    <div style="width:30%"><div style="display:flex;justify-content:space-between"><div>Invoice No</div><div style="font-weight:700">${enq.enqNo || ''}</div></div><div style="display:flex;justify-content:space-between;margin-top:6px"><div>Invoice Date</div><div style="font-weight:700">${enq.enqDate || ''}</div></div></div>
                </div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Model</th>
                            <th>Product</th>
                            <th>Capacity</th>
                            <th>Per Unit</th>
                            <th>Qty</th>
                            <th>Tax</th>
                            <th>Tax Amount</th>
                            <th>Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map((p, i) => `
                            <tr>
                                <td style="width:40px">${i + 1}</td>
                                <td>${p.model || ''}</td>
                                <td>${p.product || ''}</td>
                                <td>${p.capacity || ''}</td>
                                <td style="text-align:right">${Number(p.perUnit || 0).toFixed(2)}</td>
                                <td style="text-align:right">${p.qty || 0}</td>
                                <td style="text-align:right">${p.tax || 0}</td>
                                <td style="text-align:right">${Number(p.taxAmount || 0).toFixed(2)}</td>
                                <td style="text-align:right">${Number(p.rate || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="summary">
                    <table style="width:100%;border-collapse:collapse">
                        <tbody>
                            <tr><td style="padding:6px;border-bottom:1px solid #eee">Sub Amount</td><td style="padding:6px;text-align:right;border-bottom:1px solid #eee">${subtotal}</td></tr>
                            <tr><td style="padding:6px;border-bottom:1px solid #eee">Total Tax</td><td style="padding:6px;text-align:right;border-bottom:1px solid #eee">${totalTax}</td></tr>
                            <tr><td style="padding:6px"><strong>Net Total</strong></td><td style="padding:6px;text-align:right"><strong>${netTotal}</strong></td></tr>
                        </tbody>
                    </table>
                </div>
                <div style="clear:both;margin-top:24px">
                    <p style="margin:0 0 8px 0">DELIVERY : Immediate / DAYS &nbsp;&nbsp; PAID : &nbsp; TOPAY : &nbsp; Warranty Terms :</p>
                    <p style="margin:0 0 8px 0">PAYMENT : 100% Advance Payment </p>
                </div>
                <div style="border:1px solid #222;margin-top:18px;padding:8px">
                    <h4 style="text-align:center;margin:6px">INSTALLATION</h4>
                    <table class="print-table" style="margin-top:6px">
                        <thead>
                            <tr>
                                <th style="width:60px">S.NO</th>
                                <th>DETAILS</th>
                                <th>MODEL</th>
                                <th>PRICE</th>
                                <th>QUANTITY</th>
                                <th>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="6" style="height:40px"></td></tr>
                        </tbody>
                    </table>
                </div>
                <div style="margin-top:20px;text-align:center"><strong>This is System Generated Document, Hence No Signature Required</strong></div>
                <script>setTimeout(()=>{ window.print(); }, 300);</script>
            </body>
            </html>
        `;

        const w = window.open('', '_blank');
        if (!w) return alert('Popup blocked. Allow popups for this site to print.');
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
                        <h3 className="card-title tw-mb-0 max-[768px]:tw-text-center max-[768px]:tw-w-full max-[350px]:tw-whitespace-nowrap max-[350px]:tw-text-lg">Enquiry List</h3>
                        {hasPermission('Enquiry.Enquiry.Add') && (
                            <button className="btn-create tw-w-full sm:tw-w-auto" onClick={() => navigate('/enquiry/add')}>
                                Add Enquiry
                            </button>
                        )}
                    </div>
                    <div className="card-body">
                        <div className="list-top-bar tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-gap-3 sm:tw-gap-0 tw-mb-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-gray-600 tw-font-medium tw-w-16 sm:tw-w-auto tw-text-right">Show</span>
                                <select
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={pageSize}
                                    onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="tw-text-gray-600 tw-font-medium">entries</span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-gray-600 tw-font-medium tw-w-16 sm:tw-w-auto tw-text-right">Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-flex-1 sm:tw-w-48 tw-inline-block"
                                    value={searchText}
                                    onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        <div className="tw-hidden md:tw-block">
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped no-margin">
                                    <thead>
                                        <tr>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('sno')}><div className="tw-flex tw-justify-between tw-items-center">S.No <TableSortIcon direction={getSortDirection('sno')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}><div className="tw-flex tw-justify-between tw-items-center">Enq. No <TableSortIcon direction={getSortDirection('id')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('enqDate')}><div className="tw-flex tw-justify-between tw-items-center">Enq. Date <TableSortIcon direction={getSortDirection('enqDate')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('commtDate')}><div className="tw-flex tw-justify-between tw-items-center">Comtt. Date <TableSortIcon direction={getSortDirection('commtDate')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}><div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}><div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('vertical')}><div className="tw-flex tw-justify-between tw-items-center">Vertical <TableSortIcon direction={getSortDirection('vertical')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('allottedTo')}><div className="tw-flex tw-justify-between tw-items-center">Allotted To <TableSortIcon direction={getSortDirection('allottedTo')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('currentStage')}><div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div></th>
                                            {hasActionPermission && (
                                                <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Action <TableSortIcon /></div></th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((enq, index) => (
                                            <tr key={enq.id}>
                                                <td>{startIndex + index + 1}</td>
                                                <td>{enq.enqNo}</td>
                                                <td>{enq.enqDate}</td>
                                                <td>{enq.commtDate}</td>
                                                <td>{enq.customerName}</td>
                                                <td>{enq.mobile}</td>
                                                <td>{enq.vertical}</td>
                                                <td>{enq.allottedTo}</td>
                                                <td>
                                                    {enq.stageColor ? (
                                                        <span style={{ background: enq.stageColor, color: '#ffffff' }} className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium">
                                                            {enq.currentStage}
                                                        </span>
                                                    ) : enq.currentStage === 'Active' ? (
                                                        <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-emerald-500 tw-text-white">Active</span>
                                                    ) : enq.currentStage === 'Inactive' ? (
                                                        <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-red-400 tw-text-white">Inactive</span>
                                                    ) : (
                                                        <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-blue-500 tw-text-white">{enq.currentStage}</span>
                                                    )}
                                                </td>
                                                {hasActionPermission && (
                                                    <td>
                                                        <div className="tw-flex tw-gap-2">
                                                            {hasPermission('Enquiry.Enquiry.Print') && (
                                                                <button
                                                                    type="button" className="list-action-btn btn-print"
                                                                    title="Print"
                                                                    onClick={() => window.open(`/enquiry/quotationPdf/${enq.id}`, '_blank')}
                                                                >
                                                                    <PrinterIcon weight="duotone" className="tw-w-4" />
                                                                </button>
                                                            )}
                                                            {(enq.stageId < 3) && (
                                                                <>
                                                                    {hasPermission('Enquiry.Enquiry.Edit') && (
                                                                        <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/enquiry/edit/${enq.id}`)}>
                                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4 " />
                                                                        </button>
                                                                    )}
                                                                    {hasPermission('Enquiry.Enquiry.Close') && (
                                                                        <button type="button" className="list-action-btn tw-bg-slate-500 tw-text-white" title="Close Enquiry" onClick={() => confirmClose(enq.id)}>
                                                                            <EyeSlash weight="duotone" className="tw-w-4" />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                            {hasPermission('Enquiry.Enquiry.Delete') && (
                                                                <button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => confirmDelete(enq.id)}>
                                                                    <TrashIcon weight="duotone" className="tw-w-4 " />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        {paginated.length === 0 && (
                                            <tr>
                                                <td colSpan={hasActionPermission ? 10 : 9} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {paginated.map((enq) => (
                                <MobileCard key={enq.id}>
                                    <MobileCard.Header label="ENQ. NO" value={enq.enqNo} />
                                    
                                    <MobileCard.Body>
                                        <div className="tw-flex tw-justify-between tw-items-start">
                                            <MobileCard.Field label="Customer Name" value={enq.customerName} bold />
                                        </div>
                                        
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                                            <MobileCard.Field label="Mobile" value={
                                                <a href={`tel:${enq.mobile}`} className="tw-text-blue-600 hover:tw-underline">
                                                    {enq.mobile}
                                                </a>
                                            } />
                                            <MobileCard.Field label="Vertical" value={enq.vertical} align="right" />
                                        </div>
                                        
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-2">
                                            <MobileCard.Field label="Enq. Date" value={enq.enqDate} />
                                            <MobileCard.Field label="Comtt. Date" value={enq.commtDate} align="right" />
                                        </div>
                                        
                                        <div className="tw-mt-2">
                                            <MobileCard.Field label="Current Stage" value={
                                                enq.stageColor ? (
                                                    <span style={{ background: enq.stageColor, color: '#ffffff' }} className="tw-inline-block tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium">
                                                        {enq.currentStage}
                                                    </span>
                                                ) : enq.currentStage === 'Active' ? (
                                                    <span className="tw-inline-block tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium tw-bg-emerald-500 tw-text-white">Active</span>
                                                ) : enq.currentStage === 'Inactive' ? (
                                                    <span className="tw-inline-block tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium tw-bg-red-400 tw-text-white">Inactive</span>
                                                ) : (
                                                    <span className="tw-inline-block tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium tw-bg-blue-500 tw-text-white">{enq.currentStage}</span>
                                                )
                                            } />
                                        </div>
                                    </MobileCard.Body>
                                    
                                    <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                        <div className="tw-flex tw-justify-between tw-items-center tw-w-full">
                                            <MobileCard.Field label="Allotted To" value={enq.allottedTo || '-'} />
                                        </div>

                                        {hasActionPermission && (
                                            <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                                <MobileCard.Actions>
                                                {hasPermission('Enquiry.Enquiry.Print') && (
                                                    <button 
                                                        type="button" 
                                                        className="list-action-btn btn-print tw-shadow-none" 
                                                        title="Print"
                                                        onClick={() => window.open(`/enquiry/quotationPdf/${enq.id}`, '_blank')}
                                                    >
                                                        <PrinterIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {(enq.stageId < 3) && (
                                                    <>
                                                        {hasPermission('Enquiry.Enquiry.Edit') && (
                                                            <button 
                                                                type="button" 
                                                                className="list-action-btn btn-edit tw-shadow-none" 
                                                                title="Edit"
                                                                onClick={() => navigate(`/enquiry/edit/${enq.id}`)}
                                                            >
                                                                <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                        {hasPermission('Enquiry.Enquiry.Close') && (
                                                            <button 
                                                                type="button" 
                                                                className="list-action-btn tw-bg-slate-500 tw-text-white tw-shadow-none" 
                                                                title="Close Enquiry"
                                                                onClick={() => confirmClose(enq.id)}
                                                            >
                                                                <EyeSlash weight="duotone" className="tw-w-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                                {hasPermission('Enquiry.Enquiry.Delete') && (
                                                    <button 
                                                        type="button" 
                                                        className="list-action-btn btn-delete tw-shadow-none" 
                                                        title="Delete"
                                                        onClick={() => confirmDelete(enq.id)}
                                                    >
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                </MobileCard.Actions>
                                            </div>
                                        )}
                                    </MobileCard.Footer>
                                </MobileCard>
                            ))}
                            
                            {paginated.length === 0 && (
                                <div className="tw-text-center tw-text-slate-400 tw-py-8 tw-bg-white tw-rounded-xl tw-border tw-border-gray-100">
                                    No records found
                                </div>
                            )}
                        </div>

                        <SmartPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            startIndex={startIndex}
                            entriesPerPage={pageSize}
                            totalEntries={total}
                        />

                    </div>
                </div>
            </div>

            {/* Delete Popup */}
            <DeletePopup
                isOpen={deletePopupOpen}
                onClose={() => setDeletePopupOpen(false)}
                onConfirm={handleDelete}
            />

            {/* Close Popup */}
            <ClosePopup
                isOpen={closePopupOpen}
                onClose={() => setClosePopupOpen(false)}
                onConfirm={handleClose}
            />
        </section>
    );
};

export default EnquiryList;
