import React, { useMemo, useState } from 'react';

const voucherRows = [
	{ id: 1, date: '23-02-2026', vendorName: 'SARAS INDUSTRY', voucherNumber: '12570', totalAmount: 40000, balance: 40000 }
];

const invoiceRows = [
	{ id: 1, invoiceDate: '15-05-2026', invoiceNumber: '234', vendorName: 'SARAS INDUSTRY', creditLimit: '14-06-2026', totalAmount: 108560, balance: 108560 },
	{ id: 2, invoiceDate: '15-05-2026', invoiceNumber: '234', vendorName: 'SARAS INDUSTRY', creditLimit: '14-06-2026', totalAmount: 77880, balance: 77880 }
];

const formatAmount = value => Number(value || 0).toFixed(2);

const PaymentRecancellation = ({ isOpen, onClose, onSubmit }) => {
	const [selectedVouchers, setSelectedVouchers] = useState([voucherRows[0].id]);
	const [selectedInvoices, setSelectedInvoices] = useState([invoiceRows[0].id]);

	const voucherTotal = useMemo(() => (
		voucherRows
			.filter(row => selectedVouchers.includes(row.id))
			.reduce((sum, row) => sum + row.balance, 0)
	), [selectedVouchers]);

	const invoiceTotal = useMemo(() => (
		invoiceRows
			.filter(row => selectedInvoices.includes(row.id))
			.reduce((sum, row) => sum + row.balance, 0)
	), [selectedInvoices]);

	if (!isOpen) return null;

	const toggleVoucher = id => {
		setSelectedVouchers(current => (
			current.includes(id) ? current.filter(item => item !== id) : [...current, id]
		));
	};

	const toggleInvoice = id => {
		setSelectedInvoices(current => (
			current.includes(id) ? current.filter(item => item !== id) : [...current, id]
		));
	};

	const handleSubmit = () => {
		if (onSubmit) {
			onSubmit({
				voucherIds: selectedVouchers,
				invoiceIds: selectedInvoices,
				voucherTotal,
				invoiceTotal
			});
		}
		onClose();
	};

	return (
		<div className="d-flex align-items-start justify-content-center" style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.45)', padding: '42px 20px', overflowY: 'auto' }}>
			<style>{`
				.payment-rec-modal .modal-content { border-radius: 8px; border: 1px solid #d6dee3; box-shadow: 0 16px 48px rgba(0,0,0,0.22); overflow: hidden; }
				.payment-rec-modal .modal-header { padding: 16px 18px; border-bottom: 1px solid #d8e0e4; }
				.payment-rec-modal .modal-title { font-size: 18px; font-weight: 700; color: #333; margin: 0; }
				.payment-rec-modal .modal-body { padding: 22px 24px 18px; }
				.payment-rec-section-title { font-size: 15px; font-weight: 700; color: #333; text-align: center; padding: 10px 14px; margin-bottom: 10px; border-radius: 4px; }
				.payment-rec-section-title.voucher { background: #c6e9f1; }
				.payment-rec-section-title.invoice { background: #e7e7e7; }
				.payment-rec-table { font-size: 14px; margin-bottom: 12px; }
				.payment-rec-table th { font-weight: 700; white-space: nowrap; vertical-align: middle; }
				.payment-rec-table td { vertical-align: middle; }
				.payment-rec-check { appearance: none; width: 17px; height: 17px; border: 1px solid #64748b; border-radius: 3px; background: #ffffff; cursor: pointer; display: inline-grid; place-content: center; margin: 0; vertical-align: middle; }
				.payment-rec-check:checked { background: #2563eb; border-color: #2563eb; }
				.payment-rec-check:checked::before { content: ""; width: 9px; height: 5px; border-left: 2px solid #ffffff; border-bottom: 2px solid #ffffff; transform: rotate(-45deg); margin-top: -2px; }
				.payment-rec-check:focus { outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.18); }
				.payment-rec-total-row { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin: 10px 0 28px; }
				.payment-rec-total-row.last { margin-bottom: 16px; }
				.payment-rec-total-row label { font-size: 14px; font-weight: 700; margin: 0; }
				.payment-rec-total-row input { width: 260px; max-width: 50vw; height: 36px; border: 1px solid #cfd8dc; border-radius: 4px; background: #eceff1; text-align: right; padding: 0 12px; font-size: 14px; color: #333; }
				.payment-rec-footer { border-top: 1px solid #d7e0e5; padding: 14px 0 0; text-align: center; }
				.payment-rec-submit { background: #22c55e; color: #fff; border: 0; border-radius: 4px; font-size: 15px; font-weight: 700; padding: 9px 22px; min-width: 145px; cursor: pointer; box-shadow: 0 2px 6px rgba(34,197,94,0.35); }
				.payment-rec-submit:hover { background: #16a34a; }
				.payment-rec-close { background: #ef4444; border: none; color: #fff; font-size: 1rem; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 16px; cursor: pointer; }
				@media (max-width: 900px) {
					.payment-rec-modal .modal-body { padding: 18px 14px; }
					.payment-rec-total-row { justify-content: flex-start; }
				}
			`}</style>
			<div className="modal-overlay" style={{ position: 'fixed', inset: 0 }} onClick={onClose} />
			<div className="modal-dialog payment-rec-modal" style={{ zIndex: 1060, width: 'calc(100% - 80px)', maxWidth: '1120px', margin: 0 }}>
				<div className="modal-content">
					<div className="modal-header d-flex justify-content-between align-items-center">
						<h5 className="modal-title">Payment Voucher List</h5>
						<button type="button" className="payment-rec-close" aria-label="Close" onClick={onClose}>x</button>
					</div>
					<div className="modal-body">
						<div className="payment-rec-section-title voucher">Pending Voucher List</div>
						<div className="table-responsive">
							<table className="table table-bordered table-striped no-margin payment-rec-table">
								<thead>
									<tr>
										<th>S.No</th>
										<th>Date</th>
										<th>Vendor Name</th>
										<th>Voucher Number</th>
										<th>Total Amount</th>
										<th>Balance</th>
										<th className="tw-text-center">Action</th>
									</tr>
								</thead>
								<tbody>
									{voucherRows.map((row, index) => (
										<tr key={row.id}>
											<td>{index + 1}</td>
											<td>{row.date}</td>
											<td>{row.vendorName}</td>
											<td>{row.voucherNumber}</td>
											<td>{formatAmount(row.totalAmount)}</td>
											<td>{formatAmount(row.balance)}</td>
											<td className="tw-text-center">
												<input className="payment-rec-check" type="checkbox" checked={selectedVouchers.includes(row.id)} onChange={() => toggleVoucher(row.id)} />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="payment-rec-total-row">
							<label>Total Amount</label>
							<input type="text" value={voucherTotal} readOnly />
						</div>

						<div className="payment-rec-section-title invoice">Pending Invoice List</div>
						<div className="table-responsive">
							<table className="table table-bordered table-striped no-margin payment-rec-table">
								<thead>
									<tr>
										<th>S.No</th>
										<th>Invoice Date</th>
										<th>Invoice Number</th>
										<th>Vendor Name</th>
										<th>Credit Limit</th>
										<th>Total Amount</th>
										<th>Balance</th>
										<th className="tw-text-center">Action</th>
									</tr>
								</thead>
								<tbody>
									{invoiceRows.map((row, index) => (
										<tr key={row.id}>
											<td>{index + 1}</td>
											<td>{row.invoiceDate}</td>
											<td>{row.invoiceNumber}</td>
											<td>{row.vendorName}</td>
											<td>{row.creditLimit}</td>
											<td>{formatAmount(row.totalAmount)}</td>
											<td>{formatAmount(row.balance)}</td>
											<td className="tw-text-center">
												<input className="payment-rec-check" type="checkbox" checked={selectedInvoices.includes(row.id)} onChange={() => toggleInvoice(row.id)} />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="payment-rec-total-row last">
							<label>Total Amount</label>
							<input type="text" value={invoiceTotal} readOnly />
						</div>

						<div className="payment-rec-footer">
							<button type="button" className="payment-rec-submit" onClick={handleSubmit}>Reconciliation</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PaymentRecancellation;
