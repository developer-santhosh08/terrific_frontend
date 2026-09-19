import { Routes, Route } from 'react-router-dom';
import BankProcessList from './BankProcessList';
import BankProcessAdd from './BankProcessAdd';
import BankProcessEdit from './BankProcessEdit';
import CheckList from './checkTransaction/CheckList';
import PaymentVoucherList from './paymentVoucher/PaymentVoucherList';
import PaymentVoucherAdd from './paymentVoucher/PaymentVoucherAdd';
import PaymentVoucherEdit from './paymentVoucher/PaymentVoucherEdit';
import ReconciliationList from './reconciliation/ReconciliationList';
import CustomerRecipt from './customerOpenaningRecipt/CustomerRecipt';
import DebitNote from './debitNote/DebitNote';
import DailyWise from './dayWiseReport/DailyWise';
import Receipt from './receipt/Recipt';
import RequirePermission from '../../components/RequirePermission';

export default function BankProcessRoutes() {
    return (
        <Routes>
            <Route path="" element={
                <RequirePermission permission={["Bank Process.Payment Voucher.View", "Bank Process.Receipt.View", "Bank Process.Daywise Report.View"]}>
                    <BankProcessList />
                </RequirePermission>
            } />
            <Route path="add" element={
                <RequirePermission permission={["Bank Process.Payment Voucher.Add"]}>
                    <BankProcessAdd />
                </RequirePermission>
            } />
            <Route path="edit/:id" element={
                <RequirePermission permission={["Bank Process.Payment Voucher.Edit"]}>
                    <BankProcessEdit />
                </RequirePermission>
            } />
            <Route path="cheque-transaction" element={
                <RequirePermission permission={["Bank Process.Payment Voucher.View"]}>
                    <CheckList />
                </RequirePermission>
            } />
            <Route path="payment-voucher" element={
                <RequirePermission permission="Bank Process.Payment Voucher.View">
                    <PaymentVoucherList />
                </RequirePermission>
            } />
            <Route path="payment-voucher/add" element={
                <RequirePermission permission="Bank Process.Payment Voucher.Add">
                    <PaymentVoucherAdd />
                </RequirePermission>
            } />
            <Route path="payment-voucher/edit/:id" element={
                <RequirePermission permission="Bank Process.Payment Voucher.Edit">
                    <PaymentVoucherEdit />
                </RequirePermission>
            } />
            <Route path="reconciliation" element={
                <RequirePermission permission={["Bank Process.Payment Voucher.View"]}>
                    <ReconciliationList />
                </RequirePermission>
            } />
            <Route path="customer-opening-receipt" element={
                <RequirePermission permission={["Bank Process.Receipt.View"]}>
                    <CustomerRecipt />
                </RequirePermission>
            } />
            <Route path="debit-note" element={
                <RequirePermission permission={["Bank Process.Payment Voucher.View"]}>
                    <DebitNote />
                </RequirePermission>
            } />
            <Route path="daywise-report" element={
                <RequirePermission permission="Bank Process.Daywise Report.View">
                    <DailyWise />
                </RequirePermission>
            } />
            <Route path="receipt" element={
                <RequirePermission permission="Bank Process.Receipt.View">
                    <Receipt />
                </RequirePermission>
            } />
        </Routes>
    );
}
