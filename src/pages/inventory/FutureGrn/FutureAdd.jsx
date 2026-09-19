import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { Plus, Trash, CaretLeft } from '@phosphor-icons/react';

const vendorOptions = [
    { value: 'vendor-1', label: 'SAI ENGINEERING WORKS' },
    { value: 'vendor-2', label: 'COMPTECH EQUIPMENTS LIMITED,' },
    { value: 'vendor-3', label: 'SFMC PIPES PVT LTD' },
];

const stockLocationOptions = [
    { value: 'power-green', label: 'Power Green' },
    { value: 'warehouse-a', label: 'Warehouse A' },
    { value: 'warehouse-b', label: 'Warehouse B' },
];

const damageLocationOptions = [
    { value: 'damage-1', label: 'Damage Location A' },
    { value: 'damage-2', label: 'Damage Location B' },
];

const taxOptions = [
    { value: 0,  label: 'Tax' },
    { value: 5,  label: 'GST[5.00]' },
    { value: 18, label: 'GST[18.00]' },
];

const fmt = (v) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v || 0));

const today = new Date().toLocaleDateString('en-GB').split('/').join('-');

const createRow = (id) => ({
    id,
    productName: '',
    totalQty: 1,
    insQty: '',
    price: '',
    ed: '0.00',
    freight: '0.00',
    tax: 18,
    discount: '0.00',
    checkValue: 'Invoice',
});

const FutureAdd = () => {
    const navigate   = useNavigate();
    const { id }     = useParams();
    const isEdit     = Boolean(id);

    const [rows, setRows]       = useState([createRow(1)]);
    const [roundOff, setRoundOff] = useState('0');
    const [form, setForm]       = useState({
        vendorName:          vendorOptions[1],
        purchaseOrderNumber: '2311',
        grnNumber:           '',
        grnDate:             today,
        invoiceNumber:       '',
        value:               '',
        stockLocation:       null,
        damageLocation:      null,
    });

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const updateRow   = (rowId, field, value) =>
        setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)));
    const addRow      = () => setRows((prev) => [...prev, createRow(Date.now())]);
    const removeRow   = (rowId) =>
        setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== rowId) : prev));

    const totals = useMemo(() => {
        const subTotal = rows.reduce((sum, row) => {
            const amt = (Number(row.insQty) || 0) * (Number(row.price) || 0)
                + (Number(row.ed) || 0) + (Number(row.freight) || 0)
                - (Number(row.discount) || 0);
            return sum + Math.max(0, amt);
        }, 0);
        const taxTotal = rows.reduce((sum, row) => {
            const base = (Number(row.insQty) || 0) * (Number(row.price) || 0)
                + (Number(row.ed) || 0) + (Number(row.freight) || 0)
                - (Number(row.discount) || 0);
            return sum + Math.max(0, base) * ((Number(row.tax) || 0) / 100);
        }, 0);
        const round = Number(roundOff || 0);
        return { subTotal, taxTotal, sgst: taxTotal / 2, cgst: taxTotal / 2, round, total: subTotal + taxTotal + round };
    }, [rows, roundOff]);

    const taxDetails = useMemo(() => {
        const grouped = rows.reduce((acc, row) => {
            const rate = Number(row.tax) || 0;
            const base = (Number(row.insQty) || 0) * (Number(row.price) || 0)
                + (Number(row.ed) || 0) + (Number(row.freight) || 0)
                - (Number(row.discount) || 0);
            const amount = Math.max(0, base) * (rate / 100);
            const key    = rate.toFixed(2);
            if (!acc[key]) acc[key] = { rate, amount: 0 };
            acc[key].amount += amount;
            return acc;
        }, {});
        return Object.entries(grouped)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([key, val], i) => ({ id: key, sno: i + 1, rate: val.rate, taxLabel: `GST[${val.rate.toFixed(2)}]`, amount: val.amount }));
    }, [rows]);

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/inventory/future-inspection');
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">{isEdit ? 'Edit Future Inspection' : 'Add Future Inspection'}</h3>
                        <button type="button" className="btn-header-back" onClick={() => navigate('/inventory/future-inspection')}>
                            <CaretLeft size={16} weight="bold" />
                            Back
                        </button>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit}>

                            {/* ── Header fields ── */}
                            <div className="row">
                                <div className="col-md-4 form-group">
                                    <label>Vendor Name</label>
                                    <Select
                                        options={vendorOptions}
                                        value={form.vendorName}
                                        onChange={(opt) => set('vendorName', opt)}
                                        placeholder="Choose Vendor..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>Purchase Order Number</label>
                                    <input type="text" className="form-control" value={form.purchaseOrderNumber} readOnly />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>GRN Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="GRN Number"
                                        value={form.grnNumber}
                                        onChange={(e) => set('grnNumber', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>GRN Date</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.grnDate}
                                        onChange={(e) => set('grnDate', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>Invoice Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Invoice Number"
                                        value={form.invoiceNumber}
                                        onChange={(e) => set('invoiceNumber', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>Value</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Value"
                                        value={form.value}
                                        onChange={(e) => set('value', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>Stock Location</label>
                                    <Select
                                        options={stockLocationOptions}
                                        value={form.stockLocation}
                                        onChange={(opt) => set('stockLocation', opt)}
                                        placeholder="Choose Stock Location..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>Damage Location</label>
                                    <Select
                                        options={damageLocationOptions}
                                        value={form.damageLocation}
                                        onChange={(opt) => set('damageLocation', opt)}
                                        placeholder="Choose Damage location..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>

                            {/* ── Product table ── */}
                            <div className="row mt-2">
                                <div className="col-12">
                                    <div className="table-responsive">
                                        <table className="table table-bordered align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th style={{ minWidth: 260 }}>Product Name</th>
                                                    <th style={{ width: 100 }}>Tot.Qty</th>
                                                    <th style={{ width: 100 }}>Ins.Qty</th>
                                                    <th style={{ width: 130 }}>Price</th>
                                                    <th style={{ width: 120 }}>ED</th>
                                                    <th style={{ width: 120 }}>Frieght</th>
                                                    <th style={{ width: 160 }}>Tax</th>
                                                    <th style={{ width: 130 }}>Dis %</th>
                                                    <th style={{ width: 140 }}>Amount</th>
                                                    <th style={{ width: 120 }}>Check</th>
                                                    <th style={{ width: 80 }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row) => {
                                                    const amount = (Number(row.insQty) || 0) * (Number(row.price) || 0);
                                                    return (
                                                        <tr key={row.id}>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Product Name"
                                                                    value={row.productName}
                                                                    onChange={(e) => updateRow(row.id, 'productName', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control text-end"
                                                                    value={row.totalQty}
                                                                    readOnly
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control text-end"
                                                                    placeholder="Qty"
                                                                    value={row.insQty}
                                                                    onChange={(e) => updateRow(row.id, 'insQty', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control text-end"
                                                                    placeholder="0.00"
                                                                    value={row.price}
                                                                    onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control text-end"
                                                                    value={row.ed}
                                                                    onChange={(e) => updateRow(row.id, 'ed', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control text-end"
                                                                    value={row.freight}
                                                                    onChange={(e) => updateRow(row.id, 'freight', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <Select
                                                                    options={taxOptions}
                                                                    value={taxOptions.find((o) => Number(o.value) === Number(row.tax))}
                                                                    onChange={(opt) => updateRow(row.id, 'tax', opt ? opt.value : 0)}
                                                                    className="react-select-container"
                                                                    classNamePrefix="react-select"
                                                                    menuPosition="fixed"
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control text-end"
                                                                    value={row.discount}
                                                                    onChange={(e) => updateRow(row.id, 'discount', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control text-end"
                                                                    value={fmt(amount)}
                                                                    readOnly
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Invoice"
                                                                    value={row.checkValue}
                                                                    onChange={(e) => updateRow(row.id, 'checkValue', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <div className="tw-flex tw-gap-1">
                                                                    <button
                                                                        type="button"
                                                                        className="list-action-btn btn-add"
                                                                        title="Add Row"
                                                                        onClick={addRow}
                                                                    >
                                                                        <Plus weight="bold" className="tw-w-4" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="list-action-btn btn-delete"
                                                                        title="Delete Row"
                                                                        onClick={() => removeRow(row.id)}
                                                                    >
                                                                        <Trash weight="bold" className="tw-w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* ── Tax Detail + Totals ── */}
                            <div className="row mt-3 g-3 align-items-start">
                                <div className="col-lg-6">
                                    <div className="card">
                                        <div className="card-header with-border">
                                            <h3 className="card-title">Tax Detail</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table align-middle mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>For</th>
                                                            <th>Rate</th>
                                                            <th>Tax</th>
                                                            <th>Tax Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {taxDetails.length ? taxDetails.map((row) => (
                                                            <tr key={row.id}>
                                                                <td>{fmt(totals.subTotal)}</td>
                                                                <td>{fmt(row.rate)}%</td>
                                                                <td>{row.taxLabel}</td>
                                                                <td>{fmt(row.amount)}</td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td>{fmt(totals.subTotal)}</td>
                                                                <td>18.00%</td>
                                                                <td>GST[18.00]</td>
                                                                <td>{fmt(totals.taxTotal)}</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="card">
                                        <div className="card-header with-border">
                                            <h3 className="card-title">Total Details</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="tw-space-y-3">
                                                <div className="tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b">
                                                    <span>Sub Total</span>
                                                    <strong>{fmt(totals.subTotal)}</strong>
                                                </div>
                                                <div className="tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b">
                                                    <span>SGST Tax</span>
                                                    <strong>{fmt(totals.sgst)}</strong>
                                                </div>
                                                <div className="tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b">
                                                    <span>CGST Tax</span>
                                                    <strong>{fmt(totals.cgst)}</strong>
                                                </div>
                                                <div className="tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b">
                                                    <span>Round Off</span>
                                                    <div style={{ width: 180 }}>
                                                        <input
                                                            type="number"
                                                            className="form-control text-end"
                                                            value={roundOff}
                                                            onChange={(e) => setRoundOff(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="tw-flex tw-justify-between tw-items-center tw-py-3 tw-bg-slate-200 tw-px-3 tw-rounded">
                                                    <span className="tw-font-semibold tw-text-blue-700">Total</span>
                                                    <strong className="tw-text-violet-600">{fmt(totals.total)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Footer buttons ── */}
                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap pt-3 border-top">
                                        <button type="button" className="btn-cancel" onClick={() => navigate('/inventory/future-inspection')}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-save">
                                            {isEdit ? 'Update' : 'Submit'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FutureAdd;
