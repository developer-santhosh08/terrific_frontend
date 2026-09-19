import { useTableControls } from '../../hooks/useTableControls';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../components/TableSortIcon';
import { usePermissions } from '../../context/PermissionContext';
import MobileCard from '../../components/common/MobileCard';

const BankProcessList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Bank.Edit') || hasPermission('Power Master.Bank.Delete');
    const navigate = useNavigate();

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
                        <h3 className="card-title tw-m-0">BankProcess List</h3>
                        <button className="btn-create tw-w-full sm:tw-w-auto tw-flex tw-justify-center tw-items-center tw-gap-1" onClick={() => navigate('/bank-process/add')}>
                            <PlusIcon weight="duotone" className="tw-w-4" /> Add BankProcess
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="tw-block md:tw-hidden tw-mb-4">
                            <div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">
                                No records found
                            </div>
                        </div>

                        <div className="tw-hidden md:tw-block">
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
            </div>
        </section>
    );
};

export default BankProcessList;
