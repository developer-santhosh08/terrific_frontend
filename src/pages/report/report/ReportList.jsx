import { useTableControls } from '../../../hooks/useTableControls';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { usePermissions } from '../../../context/PermissionContext';

const ReportList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Reporting.Reporting Details.Edit') || hasPermission('Reporting.Reporting Details.Delete');
    const navigate = useNavigate();

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Report List</h3>
                        <button className="btn-create" onClick={() => navigate('/report/add')}>
                            <PlusIcon weight="duotone" className="tw-w-4" /> Add Report
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">S.No <TableSortIcon /></div></th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Name <TableSortIcon /></div></th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Status <TableSortIcon /></div></th>
                                        {hasActionPermission && (
<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Actions <TableSortIcon /></div></th>
)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={hasActionPermission ? 4 : 3} className="tw-text-center tw-text-slate-400 tw-py-8">
                                            No records found
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReportList;
