import { useTableControls } from '../../../hooks/useTableControls';
import MobileCard from '../../../components/common/MobileCard';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrinterIcon, PencilSimpleIcon, TrashIcon, ArrowBendUpLeftIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import DeletePopup from '../../../components/Popup/DeletePopup';
import PaymentVoucherListPopup from '../../../components/Popup/PaymentVoucherListPopup';
import { useLoader } from '../../../context/LoaderContext';
import SmartPagination from '../../../components/SmartPagination';
import { usePermissions } from '../../../context/PermissionContext';

const PaymentVoucherList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Bank Process.Payment Voucher.Edit') || hasPermission('Bank Process.Payment Voucher.Delete') || hasPermission('Bank Process.Payment Voucher.Print') || hasPermission('Bank Process.Payment Voucher.Revert');
	const navigate = useNavigate();
	const { setLoading } = useLoader();
	const [vouchers, setVouchers] = useState([]);
	const [deletePopupOpen, setDeletePopupOpen] = useState(false);
	const [pendingDeleteId, setPendingDeleteId] = useState(null);
	const [revertPopupOpen, setRevertPopupOpen] = useState(false);

	const fetchVouchers = async () => {
		setLoading(true);
		try {
			const token = sessionStorage.getItem('erp_token');
			const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/payment-voucher`, {
				headers: {
					'Accept': 'application/json',
					...(token ? { 'Authorization': `Bearer ${token}` } : {})
				}
			});
			const json = await res.json();
			console.log('fetchVouchers res ok?', res.ok, 'status:', res.status, 'json:', json);
			
			if (!res.ok) {
				console.error('API Error:', json);
				return;
			}
			
			let data = [];
			if (Array.isArray(json)) {
				data = json;
			} else if (json && json.data) {
				if (Array.isArray(json.data)) {
					data = json.data;
				} else if (Array.isArray(json.data.data)) {
					data = json.data.data;
				}
			}
			
			setVouchers(data.map(v => ({
				id: v.id,
				date: v.displayDate || v.document_date || '',
				voucherType: v.paymentVoucherTypeName || v.payment_voucher_type_name || v.voucher_type_name || v.type_name || v.payment_voucher_type || '',
				payTo: v.payTo || v.pay_to || v.vendor_name || v.customer_name || v.employee_name || v.general_name || v.name || '',
				accountName: v.accountName || v.account_name || v.bank_account_name || '',
				amount: v.amount || 0,
				status: v.statusName || v.status_name || (v.status === 1 ? 'Active' : 'Inactive') || 'Active'
			})).sort((a, b) => b.id - a.id));
		} catch (err) {
			console.error('Error fetching payment vouchers:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchVouchers();
	}, []);

	const handleDelete = async () => {
		if (!pendingDeleteId) return;
		setDeletePopupOpen(false);
		setLoading(true);
		try {
			const token = sessionStorage.getItem('erp_token');
			const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/payment-voucher/${pendingDeleteId}`, {
				method: 'DELETE',
				headers: {
					'Accept': 'application/json',
					...(token ? { 'Authorization': `Bearer ${token}` } : {})
				}
			});
			const json = await res.json();
			if (json.status === 'success' || json.status === true) {
				fetchVouchers();
			} else {
				console.error('Failed to delete voucher:', json);
				alert(json.message || 'Failed to delete payment voucher');
			}
		} catch (err) {
			console.error('Error deleting voucher:', err);
			alert('An error occurred while deleting the voucher.');
		} finally {
			setLoading(false);
			setPendingDeleteId(null);
		}
	};

	const {
		sortConfig,
		handleSort,
		entriesPerPage,
		setEntriesPerPage,
		searchQuery,
		setSearchQuery,
		currentPage,
		setCurrentPage,
		totalPages,
		paginatedData,
		startIndex,
		totalEntries
	} = useTableControls(vouchers);

	const getSortDirection = (key) => sortConfig.key === key ? sortConfig.direction : null;

	const openPrint = (v) => {
		window.open(`/print/payment-voucher/${v.id}`, '_blank');
	};

	return (
		<section className="content">
			<div className="container-fluid">
				<div className="card">
					<div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
						<h3 className="card-title tw-m-0">Payment Voucher List</h3>
						<div className="tw-flex tw-flex-wrap tw-gap-2 tw-w-full sm:tw-w-auto">
							{hasPermission('Bank Process.Payment Voucher.Revert') && (
								<button className="btn btn-danger tw-text-white tw-flex tw-items-center tw-justify-center tw-gap-1 tw-flex-1 sm:tw-flex-none" onClick={() => setRevertPopupOpen(true)}>
									<ArrowBendUpLeftIcon weight="bold" /> Revert List
								</button>
							)}
							{hasPermission('Bank Process.Payment Voucher.Add') && (
								<button className="btn-create tw-flex-1 sm:tw-flex-none" onClick={() => navigate('/bank-process/payment-voucher/add')}>Add Voucher</button>
							)}
						</div>
					</div>
					<div className="card-body">
						<div className="list-top-bar tw-mb-4 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
							<div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
								<span>Show</span>
								<select className="form-select form-select-sm tw-w-20 tw-inline-block" value={entriesPerPage} onChange={e => setEntriesPerPage(e.target.value)}>
									<option value="10">10</option>
									<option value="25">25</option>
									<option value="50">50</option>
									<option value="100">100</option>
								</select>
								<span>entries</span>
							</div>
							<div className="tw-flex tw-items-center tw-gap-2 tw-w-full md:tw-w-auto">
								<span>Search:</span>
								<input type="text" className="form-control form-control-sm tw-w-full md:tw-w-48 tw-inline-block" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
							</div>
						</div>

						<div className="tw-block md:tw-hidden tw-mb-4">
							{paginatedData.map((v, idx) => (
								<MobileCard key={v.id}>
									<MobileCard.Header label="Voucher No" value={v.id} />
									<MobileCard.Body>
										<MobileCard.Field label="Date" value={v.date} />
										<MobileCard.Field label="Type" value={v.voucherType} align="right" />
										<MobileCard.Field label="Pay To" value={v.payTo} />
										<MobileCard.Field label="Account" value={v.accountName} align="right" />
										<MobileCard.Field label="Amount" value={v.amount} bold />
										<MobileCard.Field label="Status" value={
											v.status === 'Active' ? <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-emerald-500 tw-text-white">Active</span> : <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-red-400 tw-text-white">Inactive</span>
										} align="right" />
									</MobileCard.Body>
									{hasActionPermission && (
										<MobileCard.Footer>
											<MobileCard.Actions>
												{hasPermission('Bank Process.Payment Voucher.Print') && (
													<button type="button" className="list-action-btn btn-print" title="Print" onClick={() => openPrint(v)}>
														<PrinterIcon weight="duotone" className="tw-w-4" />
													</button>
												)}
												{hasPermission('Bank Process.Payment Voucher.Edit') && (
													<button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/bank-process/payment-voucher/edit/${v.id}`)}>
														<PencilSimpleIcon weight="duotone" className="tw-w-4" />
													</button>
												)}
												{hasPermission('Bank Process.Payment Voucher.Delete') && (
													<button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => { setPendingDeleteId(v.id); setDeletePopupOpen(true); }}>
														<TrashIcon weight="duotone" className="tw-w-4" />
													</button>
												)}
											</MobileCard.Actions>
										</MobileCard.Footer>
									)}
								</MobileCard>
							))}
							{paginatedData.length === 0 && (
								<div className="tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 tw-p-8 tw-text-center tw-text-slate-500 tw-mb-4">No records found</div>
							)}
						</div>

						<div className="tw-hidden md:tw-block">
						<div className="table-responsive">
							<table className="table table-bordered table-striped no-margin">
								<thead>
									<tr>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('id')}><div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('date')}><div className="tw-flex tw-justify-between tw-items-center">Date <TableSortIcon direction={getSortDirection('date')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('voucherType')}><div className="tw-flex tw-justify-between tw-items-center">Voucher Type <TableSortIcon direction={getSortDirection('voucherType')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('payTo')}><div className="tw-flex tw-justify-between tw-items-center">Pay To <TableSortIcon direction={getSortDirection('payTo')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('accountName')}><div className="tw-flex tw-justify-between tw-items-center">Account Name <TableSortIcon direction={getSortDirection('accountName')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('amount')}><div className="tw-flex tw-justify-between tw-items-center">Amount <TableSortIcon direction={getSortDirection('amount')} /></div></th>
										<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => handleSort('status')}><div className="tw-flex tw-justify-between tw-items-center">Status <TableSortIcon direction={getSortDirection('status')} /></div></th>
										{hasActionPermission && (
<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50"><div className="tw-flex tw-justify-between tw-items-center">Action <TableSortIcon /></div></th>
)}
									</tr>
								</thead>
								<tbody>
									{paginatedData.map((v, idx) => (
										<tr key={v.id}>
											<td>{startIndex + idx}</td>
											<td>{v.date}</td>
											<td>{v.voucherType}</td>
											<td>{v.payTo}</td>
											<td>{v.accountName}</td>
											<td>{v.amount}</td>
											<td>{v.status === 'Active' ? <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-emerald-500 tw-text-white">Active</span> : <span className="tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-bg-red-400 tw-text-white">Inactive</span>}</td>
											{hasActionPermission && (
<td>
												<div className="tw-flex tw-gap-2">
													{hasPermission('Bank Process.Payment Voucher.Print') && (
<button type="button" className="list-action-btn btn-print" title="Print" onClick={() => openPrint(v)}>
														<PrinterIcon weight="duotone" className="tw-w-4" />
													</button>
)}
													{hasPermission('Bank Process.Payment Voucher.Edit') && (
<button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/bank-process/payment-voucher/edit/${v.id}`)}>
														<PencilSimpleIcon weight="duotone" className="tw-w-4" />
													</button>
)}
													{hasPermission('Bank Process.Payment Voucher.Delete') && (
<button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => { setPendingDeleteId(v.id); setDeletePopupOpen(true); }}>
														<TrashIcon weight="duotone" className="tw-w-4" />
													</button>
)}
												</div>
											</td>
)}
										</tr>
									))}
									{paginatedData.length === 0 && (
										<tr>
											<td colSpan={hasActionPermission ? 8 : 7} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
						</div>

						<SmartPagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							startIndex={startIndex}
							entriesPerPage={entriesPerPage}
							totalEntries={totalEntries}
						/>

						<DeletePopup 
							isOpen={deletePopupOpen} 
							onClose={() => { setDeletePopupOpen(false); setPendingDeleteId(null); }} 
							onConfirm={handleDelete} 
						/>

						<PaymentVoucherListPopup
							isOpen={revertPopupOpen}
							onClose={() => setRevertPopupOpen(false)}
							onRestoreSuccess={() => { setRevertPopupOpen(false); fetchVouchers(); }}
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default PaymentVoucherList;
