import { useTableControls } from '../../../hooks/useTableControls';
import { useEffect, useMemo, useState } from 'react';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import PaymentRecancellation from '../../../components/Popup/PaymentRecancellation';
import MobileCard from '../../../components/common/MobileCard';
import { usePermissions } from '../../../context/PermissionContext';

const ReconciliationList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Bank Process.Payment Voucher.Edit') || hasPermission('Bank Process.Payment Voucher.Delete') || hasPermission('Bank Process.Payment Voucher.Print') || hasPermission('Bank Process.Payment Voucher.Revert');
	const reconciliationItems = [
		{ id: 1, vendorName: 'ABC Suppliers', voucherNumber: 'PV-001', createdDate: '2026-06-01', detailsVendorName: 'ABC Suppliers', amount: 12500, status: 'Active' },
		{ id: 2, vendorName: 'XYZ Services', voucherNumber: 'PV-002', createdDate: '2026-05-28', detailsVendorName: 'XYZ Services', amount: 4300, status: 'Inactive' }
	];

	const { items: sortedItems, requestSort, getSortDirection } = useSortableData(reconciliationItems);

	const [searchText, setSearchText] = useState('');
	const [pageSize, setPageSize] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [showPaymentRecancellation, setShowPaymentRecancellation] = useState(false);

	const filtered = useMemo(() => {
		const q = (searchText || '').toString().trim().toLowerCase();
		if (!q) return sortedItems;
		return sortedItems.filter(item => (
			(item.vendorName || '').toString().toLowerCase().includes(q) ||
			(item.voucherNumber || '').toString().toLowerCase().includes(q) ||
			(item.createdDate || '').toString().toLowerCase().includes(q) ||
			(item.detailsVendorName || '').toString().toLowerCase().includes(q) ||
			(item.amount || '').toString().toLowerCase().includes(q) ||
			(item.status || '').toString().toLowerCase().includes(q)
		));
	}, [sortedItems, searchText]);

	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);
	useEffect(() => { setCurrentPage(1); }, [pageSize, searchText]);

	const startIndex = (currentPage - 1) * pageSize;
	const paginated = filtered.slice(startIndex, startIndex + pageSize);

	return (
		<section className="content">
			<div className="container-fluid">
				<div className="card">
					<div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
						<div>
							<h3 className="card-title tw-m-0">Voucher List</h3>
						</div>
						<div className="tw-w-full sm:tw-w-auto">
							<button className="btn-save tw-w-full sm:tw-w-auto" onClick={() => setShowPaymentRecancellation(true)}>Payment Recancellation</button>
						</div>
					</div>
					<div className="card-body">
						<div className="list-top-bar tw-mb-4 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
							<div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
								<span>Show</span>
								<select className="form-select form-select-sm tw-w-20 tw-inline-block" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
									<option value="10">10</option>
									<option value="25">25</option>
									<option value="50">50</option>
									<option value="100">100</option>
								</select>
								<span>entries</span>
							</div>
							<div className="tw-flex tw-items-center tw-gap-2 tw-w-full md:tw-w-auto">
								<span>Search:</span>
								<input type="text" className="form-control form-control-sm tw-w-full md:tw-w-48 tw-inline-block" value={searchText} onChange={e => setSearchText(e.target.value)} />
							</div>
						</div>

						<div className="tw-block md:tw-hidden tw-mb-4">
							{paginated.map((item, idx) => (
								<MobileCard key={item.id}>
									<MobileCard.Header label="Voucher No" value={item.voucherNumber} />
									<MobileCard.Body>
										<MobileCard.Field label="Date" value={item.createdDate} />
										<MobileCard.Field label="Vendor Name" value={item.vendorName} />
										<MobileCard.Field label="Vendor" value={item.detailsVendorName} />
										<MobileCard.Field label="Amount" value={item.amount} bold />
										<MobileCard.Field label="Status" value={
											item.status === 'Active' ? <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-emerald-500 tw-text-white">Active</span> : <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-red-400 tw-text-white">Inactive</span>
										} />
									</MobileCard.Body>
									{hasActionPermission && (
										<MobileCard.Footer>
											<MobileCard.Actions>
												{hasPermission('Bank Process.Payment Voucher.Edit') && (
													<button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => console.log('edit', item.id)}>
														<PencilSimpleIcon weight="duotone" className="tw-w-4" />
													</button>
												)}
												{hasPermission('Bank Process.Payment Voucher.Delete') && (
													<button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => console.log('delete', item.id)}>
														<TrashIcon weight="duotone" className="tw-w-4" />
													</button>
												)}
											</MobileCard.Actions>
										</MobileCard.Footer>
									)}
								</MobileCard>
							))}
							{paginated.length === 0 && (
								<div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">No records found</div>
							)}
						</div>

						<div className="tw-hidden md:tw-block">
						<div className="table-responsive">
							<table className="table table-bordered table-striped no-margin">
								<thead>
									<tr>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}><div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('vendorName')}><div className="tw-flex tw-justify-between tw-items-center">Vendor Name <TableSortIcon direction={getSortDirection('vendorName')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('voucherNumber')}><div className="tw-flex tw-justify-between tw-items-center">Voucher Number <TableSortIcon direction={getSortDirection('voucherNumber')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('createdDate')}><div className="tw-flex tw-justify-between tw-items-center">Created Date <TableSortIcon direction={getSortDirection('createdDate')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('detailsVendorName')}><div className="tw-flex tw-justify-between tw-items-center">Vendor Name <TableSortIcon direction={getSortDirection('detailsVendorName')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('amount')}><div className="tw-flex tw-justify-between tw-items-center">amount <TableSortIcon direction={getSortDirection('amount')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('status')}><div className="tw-flex tw-justify-between tw-items-center">Status <TableSortIcon direction={getSortDirection('status')} /></div></th>
										{hasActionPermission && (
<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Action <TableSortIcon /></div></th>
)}
									</tr>
								</thead>
								<tbody>
									{paginated.map((item, idx) => (
										<tr key={item.id}>
											<td>{startIndex + idx + 1}</td>
											<td>{item.vendorName}</td>
											<td>{item.voucherNumber}</td>
											<td>{item.createdDate}</td>
											<td>{item.detailsVendorName}</td>
											<td>{item.amount}</td>
											<td>{item.status === 'Active' ? <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-emerald-500 tw-text-white">Active</span> : <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-red-400 tw-text-white">Inactive</span>}</td>
											{hasActionPermission && (
<td>
												<div className="tw-flex tw-gap-2">
													
													{hasPermission('Bank Process.Payment Voucher.Edit') && (
<button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => console.log('edit', item.id)}>
														<PencilSimpleIcon weight="duotone" className="tw-w-4" />
													</button>
)}
													{hasPermission('Bank Process.Payment Voucher.Delete') && (
<button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => console.log('delete', item.id)}>
														<TrashIcon weight="duotone" className="tw-w-4" />
													</button>
)}
												</div>
											</td>
)}
										</tr>
									))}
									{paginated.length === 0 && (
										<tr>
											<td colSpan={hasActionPermission ? 8 : 7} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
						</div>

						<div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
							<div className="tw-text-gray-600 tw-text-sm">
								Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, total)} of {total} entries
							</div>
							<div className="tw-flex tw-items-center">
								<button className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-r-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
								<button className="btn btn-sm tw-bg-blue-500 tw-text-white tw-border-blue-500 tw-rounded-none tw-px-3">{currentPage}</button>
								<button className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-l-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
							</div>
						</div>
					</div>
				</div>
				<PaymentRecancellation
					isOpen={showPaymentRecancellation}
					onClose={() => setShowPaymentRecancellation(false)}
					onSubmit={(data) => console.log('payment recancellation', data)}
				/>
			</div>
		</section>
	);
};

export default ReconciliationList;
