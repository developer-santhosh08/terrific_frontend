import { useTableControls } from '../../hooks/useTableControls';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, MapPinIcon, ArrowsLeftRightIcon, TrashIcon, PlusIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../components/TableSortIcon';
const QuotationList = () => {
    const navigate = useNavigate();

    const quotations = [
        { id: 1, no: '2024-25/SQ-72', date: '23-12-2025', customer: 'Kumar', mobile: '9486408914', employee: '', stage: 'Pending' },
        { id: 2, no: '2024-25/SQ-71', date: '23-12-2025', customer: 'Kumar', mobile: '9486408914', employee: '', stage: 'Pending' },
        { id: 3, no: '2024-25/SQ-70', date: '23-12-2025', customer: 'KHGTR', mobile: '9965109886', employee: '', stage: 'Pending' },
        { id: 4, no: '2024-25/SQ-69', date: '20-12-2025', customer: 'Kumar', mobile: '9486408914', employee: '', stage: 'Pending' },
        { id: 5, no: '2024-25/SQ-68', date: '10-10-2025', customer: 'Rangaraj', mobile: '8667256606', employee: '', stage: 'Pending' },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Quotation List</h3>
                        <button
                            className="btn-create"
                            onClick={() => navigate('/quotation/add')}
                        >
                            <PlusIcon weight="duotone" className="tw-w-4" />
                            Add Quotation
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">S.No <TableSortIcon /></div></th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Quotation No <TableSortIcon /></div></th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Quotation Date <TableSortIcon /></div></th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon /></div></th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon /></div></th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Employee <TableSortIcon /></div></th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon /></div></th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Actions <TableSortIcon /></div></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotations.map((q, index) => (
                                        <tr key={q.id}>
                                            <td>{index + 1}</td>
                                            <td>{q.no}</td>
                                            <td>{q.date}</td>
                                            <td>{q.customer}</td>
                                            <td>{q.mobile}</td>
                                            <td>{q.employee}</td>
                                            <td><span className="badge badge-warning">{q.stage}</span></td>
                                            <td>
                                                <div className="tw-flex tw-gap-2">
                                                    <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/quotation/edit/${q.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                    <button type="button" className="list-action-btn btn-settings">
                                                        <MapPinIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                    <button type="button" className="list-action-btn btn-settings">
                                                        <ArrowsLeftRightIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                    <button type="button" className="list-action-btn btn-delete">
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default QuotationList;
