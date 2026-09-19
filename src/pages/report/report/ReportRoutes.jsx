import { Routes, Route } from 'react-router-dom';
import ReportList from './ReportList';
import ReportAdd from './ReportAdd';
import ReportEdit from './ReportEdit';
import StockReport from './StockReport';
import CustomerLedgerReport from './CustomerLedgerReport';
import VendorLedgerReport from './VendorLedgerReport';
import OutstandingReport from './OutstandingReport';
import EnquiryHoldReport from './EnquiryHoldReport';
import VendorPaymentPending from './Vendor_payment_pending';
import VendorPaymentTotalPaid from './Vendor_payment_totalpaid';
import PaymentVoucherReport from './Payment_voucher_report';
import RequirePermission from '../../../components/RequirePermission';

export default function ReportRoutes() {
    return (
        <Routes>
            <Route path="" element={
                <RequirePermission permission={["Report.Stock Report.View", "Report.Customer Ledger Report.View", "Report.Vendor Ledger Report.View", "Report.Outstanding Report.View", "Report.Enquiry Hold Report.View", "Report.Pending Vendor Payment.View", "Report.Total Paid Vendor Payment.View", "Report.Payment Voucher Report.View"]}>
                    <ReportList />
                </RequirePermission>
            } />
            <Route path="add" element={
                <RequirePermission permission={["Report.Stock Report.View"]}>
                    <ReportAdd />
                </RequirePermission>
            } />
            <Route path="edit/:id" element={
                <RequirePermission permission={["Report.Stock Report.View"]}>
                    <ReportEdit />
                </RequirePermission>
            } />
            <Route path="stock-report" element={
                <RequirePermission permission="Report.Stock Report.View">
                    <StockReport />
                </RequirePermission>
            } />
            <Route path="customer-ledger" element={
                <RequirePermission permission="Report.Customer Ledger Report.View">
                    <CustomerLedgerReport />
                </RequirePermission>
            } />
            <Route path="vendor-ledger" element={
                <RequirePermission permission="Report.Vendor Ledger Report.View">
                    <VendorLedgerReport />
                </RequirePermission>
            } />
            <Route path="outstanding-report" element={
                <RequirePermission permission="Report.Outstanding Report.View">
                    <OutstandingReport />
                </RequirePermission>
            } />
            <Route path="enquiry-hold" element={
                <RequirePermission permission="Report.Enquiry Hold Report.View">
                    <EnquiryHoldReport />
                </RequirePermission>
            } />
            <Route path="vendor-payment-pending" element={
                <RequirePermission permission="Report.Pending Vendor Payment.View">
                    <VendorPaymentPending />
                </RequirePermission>
            } />
            <Route path="vendor-payment-totalpaid" element={
                <RequirePermission permission="Report.Total Paid Vendor Payment.View">
                    <VendorPaymentTotalPaid />
                </RequirePermission>
            } />
            <Route path="payment-voucher-report" element={
                <RequirePermission permission="Report.Payment Voucher Report.View">
                    <PaymentVoucherReport />
                </RequirePermission>
            } />
        </Routes>
    );
}
